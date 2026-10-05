(function () {
  'use strict';

  var T = window.Tarot;
  var E = T.engine;
  var fx = T.fx;
  var RATIO = T.CARD_RATIO;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = fx.reduced;
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduced ? Math.min(ms, 60) : ms); }); };
  var byId = {};
  T.DECK.forEach(function (c) { byId[c.id] = c; });

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  };

  var state = {
    spread: null,
    question: '',
    opts: { reversals: true, dignities: true },
    pile: null,
    shuffles: 0,
    phase: 'ask',
    drawn: [],
    revealed: [],
    reading: null,
    busy: false,
    metrics: null
  };

  /* ================= card elements ================= */

  function makeCard(entry, opts) {
    opts = opts || {};
    var el = document.createElement(opts.tag || 'div');
    el.className = 'tcard';
    if (opts.tag === 'button') el.type = 'button';
    var inner = document.createElement('div');
    inner.className = 'tcard-inner';
    var back = document.createElement('div');
    back.className = 'tcard-face tcard-back';
    back.style.backgroundImage = T.art.back;
    var front = document.createElement('div');
    front.className = 'tcard-face tcard-front';
    if (entry) {
      front.innerHTML = T.art.face(entry.card);
      if (entry.reversed) el.classList.add('is-reversed');
    }
    inner.appendChild(back);
    inner.appendChild(front);
    el.appendChild(inner);
    if (opts.flipped) el.classList.add('is-flipped');
    return el;
  }

  function setFront(el, entry) {
    $('.tcard-front', el).innerHTML = T.art.face(entry.card);
    el.classList.toggle('is-reversed', !!entry.reversed);
  }

  /* ================= stage 1 · ask ================= */

  function miniDiagram(spread) {
    var maxX = 0, maxY = 0;
    spread.positions.forEach(function (p) { maxX = Math.max(maxX, p.x + 1); maxY = Math.max(maxY, p.y + RATIO); });
    var pad = 0.2;
    var svg = '<svg viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (maxX + pad * 2) + ' ' + (maxY + pad * 2) + '" aria-hidden="true">';
    spread.positions.forEach(function (p) {
      if (p.crossing) {
        svg += '<rect x="' + (p.x + 0.5 - RATIO / 2) + '" y="' + (p.y + RATIO / 2 - 0.5) + '" width="' + RATIO + '" height="1" rx=".12" class="mini-card mini-cross"/>';
      } else {
        svg += '<rect x="' + p.x + '" y="' + p.y + '" width="1" height="' + RATIO + '" rx=".12" class="mini-card"/>';
      }
    });
    return svg + '</svg>';
  }

  function renderSpreadList() {
    var list = $('#spread-list');
    var chosen = store.get('78-spread', 'three');
    list.innerHTML = '';
    T.SPREADS.forEach(function (s) {
      var label = document.createElement('label');
      label.className = 'spread-option';
      label.innerHTML =
        '<input type="radio" name="spread" id="spread-' + s.id + '" value="' + s.id + '"' + (s.id === chosen ? ' checked' : '') + '>' +
        '<span class="spread-diagram">' + miniDiagram(s) + '</span>' +
        '<span class="spread-text"><span class="spread-name">' + s.name + '</span>' +
        '<span class="spread-sub">' + s.subtitle + '</span></span>' +
        '<span class="spread-count">' + s.positions.length + (s.positions.length === 1 ? ' card' : ' cards') + '</span>';
      list.appendChild(label);
    });
  }

  function renderHeroFan() {
    var fan = $('#hero-fan');
    fan.innerHTML = '';
    ['major-18', 'major-17', 'major-19'].forEach(function (id, i) {
      var c = makeCard({ card: byId[id], reversed: false }, { flipped: true });
      c.style.setProperty('--i', i);
      fan.appendChild(c);
    });
    var back = makeCard(null);
    back.classList.add('hero-back');
    fan.appendChild(back);
  }

  function showStage(name) {
    $$('.stage').forEach(function (s) { s.classList.toggle('is-active', s.id === 'stage-' + name); });
    if (name === 'ask') {
      $('#reading').hidden = true;
      state.phase = 'ask';
    }
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ================= stage 2 · table ================= */

  var steps = ['shuffle', 'cut', 'draw', 'reveal'];
  function setStep(step) {
    var idx = steps.indexOf(step);
    $$('#steps li').forEach(function (li, i) {
      li.classList.toggle('is-done', i < idx || step === 'done');
      li.classList.toggle('is-current', i === idx);
    });
  }

  function setInstruction(text) { $('#instruction').textContent = text; }

  function setControls(buttons) {
    var box = $('#table-controls');
    box.innerHTML = '';
    buttons.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = b.primary ? 'primary-btn' : 'ghost-btn';
      btn.textContent = b.label;
      btn.id = b.id;
      if (b.disabled) btn.disabled = true;
      btn.addEventListener('click', b.onClick);
      box.appendChild(btn);
    });
  }

  function lock(on) {
    state.busy = on;
    $$('#table-controls button').forEach(function (b) { b.disabled = on || b.dataset.off === '1'; });
  }

  /* ----- layout geometry ----- */

  function spreadBox(spread) {
    var w = 0, h = 0;
    spread.positions.forEach(function (p) { w = Math.max(w, p.x + 1); h = Math.max(h, p.y + RATIO); });
    return { w: w, h: h };
  }

  function computeMetrics(phase) {
    var cloth = $('#cloth');
    var availW = cloth.clientWidth - 24;
    var vh = window.innerHeight;
    // Leave room for the header, and in the draw phase for the fan below.
    var reserved = phase === 'draw' ? 500 : 300;
    var availH = Math.max(vh - reserved, 300);
    var box = spreadBox(state.spread);
    var cw = Math.min(availW / box.w, availH / (box.h), state.spread.positions.length === 1 ? 170 : 140);
    cw = Math.max(cw, 40);
    return { cw: cw, w: box.w * cw, h: box.h * cw };
  }

  function buildSlots() {
    var layout = $('#layout');
    layout.innerHTML = '';
    state.spread.positions.forEach(function (p, i) {
      var slot = document.createElement('div');
      slot.className = 'slot' + (p.crossing ? ' is-crossing' : '');
      slot.dataset.index = i;
      slot.innerHTML = '<span class="slot-num">' + (i + 1) + '</span><span class="slot-name">' + p.name + '</span>';
      layout.appendChild(slot);
    });
  }

  function placeSlots(phase) {
    var m = computeMetrics(phase || state.phase);
    state.metrics = m;
    var layout = $('#layout');
    layout.style.width = m.w + 'px';
    layout.style.height = m.h + 'px';
    layout.style.setProperty('--cw', m.cw + 'px');
    $$('.slot', layout).forEach(function (slot, i) {
      var p = state.spread.positions[i];
      slot.style.left = (p.x * m.cw) + 'px';
      slot.style.top = (p.y * m.cw) + 'px';
    });
    var deckW = Math.min(Math.max(m.cw, 72), 112);
    $('#cloth').style.setProperty('--deck-w', deckW + 'px');
    $('#cloth').style.minHeight = Math.max(m.h, deckW * RATIO + 40) + 40 + 'px';
  }

  /* ----- deck stack ----- */

  var deckEls = [];
  function buildDeck() {
    var zone = $('#deck-zone');
    zone.innerHTML = '';
    deckEls = [];
    for (var i = 0; i < 78; i++) {
      var c = makeCard(null);
      c.classList.add('deck-card');
      c.style.setProperty('--z', i);
      zone.appendChild(c);
      deckEls.push(c);
    }
    restack();
  }
  function stackTransform(i) { return 'translate(' + (-i * 0.12) + 'px,' + (-i * 0.32) + 'px)'; }
  function restack() {
    deckEls.forEach(function (el, i) {
      el.style.transform = stackTransform(i);
      el.style.zIndex = i;
    });
  }

  function animateAll(list) {
    return Promise.all(list.map(function (a) { return a.finished.catch(function () {}); }));
  }

  function riffle() {
    var n = deckEls.length;
    var w = $('#cloth').style.getPropertyValue('--deck-w');
    var dw = parseFloat(w) || 90;
    var anims = deckEls.map(function (el, i) {
      var left = i % 2 === 0;
      var side = left ? -1 : 1;
      var half = Math.floor(i / 2);
      var finalT = stackTransform(i);
      return el.animate([
        { transform: stackTransform(i) },
        { transform: 'translate(' + (side * dw * 0.62) + 'px,' + (-half * 0.3) + 'px) rotate(' + (side * 7) + 'deg)', offset: 0.35 },
        { transform: 'translate(' + (side * dw * 0.5) + 'px,' + (-half * 0.3 - 14) + 'px) rotate(' + (side * 13) + 'deg)', offset: 0.55 },
        { transform: finalT }
      ], { duration: 950, delay: half * 5, easing: 'cubic-bezier(.45,.05,.3,1)' });
    });
    fx.sound.shuffle();
    setTimeout(fx.sound.shuffle, 420);
    return animateAll(anims).then(function () {
      // A short "bridge" squeeze to finish the riffle.
      var a = deckEls.map(function (el, i) {
        return el.animate([
          { transform: stackTransform(i) },
          { transform: stackTransform(i) + ' translateY(-' + (6 + i * 0.05) + 'px) scaleY(0.98)' },
          { transform: stackTransform(i) }
        ], { duration: 260, easing: 'ease-out' });
      });
      return animateAll(a);
    });
  }

  function wash() {
    var dw = parseFloat($('#cloth').style.getPropertyValue('--deck-w')) || 90;
    var cloth = $('#cloth');
    var spanX = Math.min(cloth.clientWidth * 0.4, dw * 3.2);
    var spanY = Math.min(cloth.clientHeight * 0.32, dw * 1.1);
    var anims = deckEls.map(function (el, i) {
      var a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
      var x = Math.cos(a) * r * spanX, y = Math.sin(a) * r * spanY;
      var a2 = a + 1.2 + Math.random() * 0.8;
      var x2 = Math.cos(a2) * r * spanX * 0.8, y2 = Math.sin(a2) * r * spanY * 0.8;
      var rot = (Math.random() - 0.5) * 300;
      return el.animate([
        { transform: stackTransform(i) },
        { transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'deg)', offset: 0.3 },
        { transform: 'translate(' + x2 + 'px,' + y2 + 'px) rotate(' + (rot + 90 + Math.random() * 60) + 'deg)', offset: 0.65 },
        { transform: stackTransform(i) }
      ], { duration: 1600, delay: i * 2, easing: 'cubic-bezier(.5,0,.3,1)' });
    });
    for (var k = 0; k < 4; k++) setTimeout(fx.sound.shuffle, k * 330);
    return animateAll(anims);
  }

  function doShuffle(kind) {
    if (state.busy) return;
    lock(true);
    state.pile = E.shuffle(state.pile, state.opts.reversals);
    state.shuffles++;
    (kind === 'wash' ? wash() : riffle()).then(function () {
      lock(false);
      var n = state.shuffles;
      $('#shuffle-count') && ($('#shuffle-count').textContent = n);
      setInstruction(n === 1
        ? 'Shuffled once. Keep going until the deck feels ready, then cut it.'
        : 'Shuffled ' + n + ' times. Cut when it feels right.');
      var cutBtn = $('#cut-btn');
      if (cutBtn) { cutBtn.dataset.off = '0'; cutBtn.disabled = false; }
    });
  }

  function enterShuffle() {
    state.phase = 'shuffle';
    setStep('shuffle');
    setInstruction('Hold your question in mind and shuffle. Riffle for a quick mix, or wash the cards across the cloth.');
    setControls([
      { id: 'riffle-btn', label: 'Riffle shuffle', primary: true, onClick: function () { doShuffle('riffle'); } },
      { id: 'wash-btn', label: 'Wash the cards', onClick: function () { doShuffle('wash'); } },
      { id: 'cut-btn', label: 'Cut the deck', disabled: true, onClick: enterCut }
    ]);
    $('#cut-btn').dataset.off = '1';
  }

  /* ----- cut ----- */

  var cutState = null;
  function enterCut() {
    if (state.busy) return;
    state.phase = 'cut';
    setStep('cut');
    lock(true);
    setControls([]);
    setInstruction('Cutting into three piles…');
    fx.sound.cut();
    var points = E.cutPoints(78);
    var dw = parseFloat($('#cloth').style.getPropertyValue('--deck-w')) || 90;
    var gap = Math.min(dw * 1.45, ($('#cloth').clientWidth - dw) / 2.2);
    var ranges = [[0, points[0]], [points[0], points[1]], [points[1], 78]];
    var offsets = [-gap, 0, gap];
    cutState = { points: points, ranges: ranges, offsets: offsets };
    var anims = [];
    ranges.forEach(function (r, p) {
      for (var i = r[0]; i < r[1]; i++) {
        var j = i - r[0];
        var to = 'translate(' + (offsets[p] - j * 0.12) + 'px,' + (-j * 0.32) + 'px)';
        var el = deckEls[i];
        anims.push(el.animate([{ transform: el.style.transform }, { transform: to }], { duration: 650, delay: p * 140, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' }));
        el.dataset.pile = p;
        el.dataset.to = to;
      }
    });
    animateAll(anims).then(function () {
      deckEls.forEach(function (el) { el.style.transform = el.dataset.to; el.getAnimations().forEach(function (a) { a.cancel(); }); });
      setInstruction('Choose the pile that calls to you. It goes on top.');
      var zone = $('#deck-zone');
      offsets.forEach(function (o, p) {
        var hit = document.createElement('button');
        hit.type = 'button';
        hit.className = 'pile-hit';
        hit.style.transform = 'translateX(' + o + 'px)';
        hit.innerHTML = '<span>Pile ' + (p + 1) + '</span>';
        hit.setAttribute('aria-label', 'Choose pile ' + (p + 1) + ' (' + (ranges[p][1] - ranges[p][0]) + ' cards)');
        hit.addEventListener('mouseenter', function () { liftPile(p, true); });
        hit.addEventListener('mouseleave', function () { liftPile(p, false); });
        hit.addEventListener('focus', function () { liftPile(p, true); });
        hit.addEventListener('blur', function () { liftPile(p, false); });
        hit.addEventListener('click', function () { chooseCut(p); });
        zone.appendChild(hit);
      });
      lock(false);
    });
  }

  function liftPile(p, on) {
    deckEls.forEach(function (el) {
      if (+el.dataset.pile === p) el.style.transform = el.dataset.to + (on ? ' translateY(-12px)' : '');
    });
  }

  function chooseCut(p) {
    if (state.busy) return;
    lock(true);
    $$('.pile-hit').forEach(function (h) { h.remove(); });
    fx.sound.cut();
    state.pile = E.cut(state.pile, cutState.points, p);
    // Visually: other piles gather in the centre, the chosen pile lands on top.
    var chosen = deckEls.filter(function (el) { return +el.dataset.pile === p; });
    var rest = deckEls.filter(function (el) { return +el.dataset.pile !== p; });
    var newOrder = rest.concat(chosen);
    var anims = [];
    rest.forEach(function (el, j) {
      anims.push(el.animate([{ transform: el.style.transform }, { transform: stackTransform(j) }], { duration: 600, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' }));
    });
    chosen.forEach(function (el, k) {
      var j = rest.length + k;
      el.style.zIndex = 200 + k;
      anims.push(el.animate([
        { transform: el.style.transform },
        { transform: el.dataset.to + ' translateY(-' + (40 + k * 0.3) + 'px)', offset: 0.35 },
        { transform: stackTransform(j) + ' translateY(-30px)', offset: 0.75 },
        { transform: stackTransform(j) }
      ], { duration: 1000, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }));
    });
    animateAll(anims).then(function () {
      deckEls = newOrder;
      deckEls.forEach(function (el, i) { el.getAnimations().forEach(function (a) { a.cancel(); }); el.style.zIndex = i; el.style.transform = stackTransform(i); delete el.dataset.pile; });
      fx.sound.place();
      lock(false);
      return wait(250);
    }).then(enterDraw);
  }

  /* ----- draw from the fan ----- */

  var fanCards = [];
  function fanMetrics() {
    var wrap = $('#fan-wrap');
    var vw = wrap.clientWidth;
    var cw = Math.max(46, Math.min(82, vw * 0.07));
    var n = fanCards.filter(function (f) { return !f.taken; }).length || 1;
    var margin = cw * 1.1; // room for the tilted cards at each end
    var sliver = Math.min(cw * 0.6, Math.max(vw < 700 ? 13 : 9, (vw - cw - margin * 2) / n));
    var inner = Math.max(vw, (n - 1) * sliver + cw + margin * 2);
    return { cw: cw, sliver: sliver, inner: inner, n: n, h: cw * RATIO + 40 + cw * 1.1 };
  }

  function layoutFan() {
    var m = fanMetrics();
    var fan = $('#fan');
    fan.style.width = m.inner + 'px';
    fan.style.height = m.h + 'px';
    fan.style.setProperty('--fw', m.cw + 'px');
    var start = (m.inner - (m.n - 1) * m.sliver - m.cw) / 2;
    var maxTilt = Math.min(16, 4 + m.n * 0.16);
    var k = 0;
    fanCards.forEach(function (f) {
      if (f.taken) return;
      var x = start + k * m.sliver;
      var t = m.n > 1 ? (k / (m.n - 1)) * 2 - 1 : 0; // -1 … 1
      var y = 28 + t * t * m.cw * 0.45;
      var r = t * maxTilt;
      f.el.style.setProperty('--x', x + 'px');
      f.el.style.setProperty('--y', y + 'px');
      f.el.style.setProperty('--r', r + 'deg');
      f.el.style.zIndex = k;
      k++;
    });
    return m;
  }

  function enterDraw() {
    state.phase = 'draw';
    setStep('draw');
    var need = state.spread.positions.length;
    setInstruction('Choose ' + (need === 1 ? 'one card' : need + ' cards') + ' from the fan. Let your hand rest on the ones that pull at you.');
    setControls([]);
    var counter = document.createElement('p');
    counter.className = 'draw-counter';
    counter.id = 'draw-counter';
    counter.innerHTML = '<span id="drawn-n">0</span> / ' + need + ' drawn';
    $('#table-controls').appendChild(counter);

    // Build the fan.
    var wrap = $('#fan-wrap');
    wrap.hidden = false;
    var fan = $('#fan');
    fan.innerHTML = '';
    fanCards = state.pile.map(function (entry, i) {
      var el = makeCard(null, { tag: 'button' });
      el.classList.add('fan-card');
      el.setAttribute('aria-label', 'Face-down card ' + (i + 1) + ' of 78');
      var f = { el: el, index: i, taken: false };
      el.addEventListener('click', function () { pick(f); });
      fan.appendChild(el);
      return f;
    });
    var m = layoutFan();

    $('#layout').classList.add('is-visible');
    placeSlots('draw');

    // Deal animation: the stack spreads out into the fan.
    var deckRect = $('#deck-zone').getBoundingClientRect();
    var dcx = deckRect.left + deckRect.width / 2, dcy = deckRect.top + deckRect.height / 2;
    var fanRect = fan.getBoundingClientRect();
    var anims = fanCards.map(function (f, i) {
      var x = parseFloat(f.el.style.getPropertyValue('--x'));
      var y = parseFloat(f.el.style.getPropertyValue('--y'));
      var fromX = dcx - fanRect.left - m.cw / 2, fromY = dcy - fanRect.top - (m.cw * RATIO) / 2;
      return f.el.animate([
        { transform: 'translate(' + fromX + 'px,' + fromY + 'px) rotate(0deg)', opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + f.el.style.getPropertyValue('--r') + ')', opacity: 1 }
      ], { duration: 700, delay: i * 9, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
    $('#deck-zone').classList.add('is-dealt');
    fx.sound.shuffle();
    lock(true);
    scrollToShow(wrap);
    animateAll(anims).then(function () {
      lock(false);
      // Centre the scrollable fan on small screens.
      wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2;
    });
  }

  function cardCenterRect(el) {
    var r = el.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }

  function pick(f) {
    var need = state.spread.positions.length;
    if (f.taken || state.drawn.length >= need || state.phase !== 'draw') return;
    var slotIndex = state.drawn.length;
    var entry = state.pile[f.index];
    f.taken = true;
    state.drawn.push(entry);
    $('#drawn-n').textContent = state.drawn.length;
    fx.sound.pick();

    var slot = $$('.slot')[slotIndex];
    var from = cardCenterRect(f.el);
    var fromRot = parseFloat(f.el.style.getPropertyValue('--r')) || 0;
    var fw = parseFloat($('#fan').style.getPropertyValue('--fw'));
    f.el.classList.add('is-taken');

    var to = cardCenterRect(slot);
    var toRot = state.spread.positions[slotIndex].crossing ? 90 : 0;
    var scale = state.metrics.cw / fw;

    var fly = makeCard(null);
    fly.classList.add('flying');
    fly.style.width = fw + 'px';
    document.body.appendChild(fly);
    var h = fw * RATIO;
    var midX = (from.cx + to.cx) / 2, midY = Math.min(from.cy, to.cy) - 70;
    var a = fly.animate([
      { transform: 'translate(' + (from.cx - fw / 2) + 'px,' + (from.cy - h / 2) + 'px) rotate(' + fromRot + 'deg) scale(1)' },
      { transform: 'translate(' + (midX - fw / 2) + 'px,' + (midY - h / 2) + 'px) rotate(' + (toRot / 2 + 8) + 'deg) scale(' + (1 + scale) / 1.6 + ')', offset: 0.5 },
      { transform: 'translate(' + (to.cx - fw / 2) + 'px,' + (to.cy - h / 2) + 'px) rotate(' + toRot + 'deg) scale(' + scale + ')' }
    ], { duration: reduced ? 1 : 760, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' });

    var trail = setInterval(function () {
      var r = fly.getBoundingClientRect();
      fx.addSpark(r.left + r.width / 2, r.top + r.height / 2, { speed: 0.5, lift: 0.2 });
    }, 16);

    setTimeout(function () { layoutFan(); }, 120);

    a.finished.then(function () {
      clearInterval(trail);
      fly.remove();
      fillSlot(slot, entry, slotIndex);
      fx.sound.place();
      if (state.drawn.length === need) finishDraw();
    });
  }

  function fillSlot(slot, entry, i) {
    var c = makeCard(entry, { tag: 'button' });
    c.classList.add('slot-card');
    c.setAttribute('aria-label', 'Card ' + (i + 1) + ', ' + state.spread.positions[i].name + '. Face down. Turn over.');
    c.addEventListener('click', function () { onSlotCard(i); });
    slot.appendChild(c);
    slot.classList.add('is-filled');
  }

  function finishDraw() {
    state.reading = E.interpret(state.spread, state.drawn, {
      question: state.question,
      reversals: state.opts.reversals,
      dignities: state.opts.dignities
    });
    var wrap = $('#fan-wrap');
    var remaining = fanCards.filter(function (f) { return !f.taken; });
    var anims = remaining.map(function (f, i) {
      return f.el.animate([{ opacity: 1, transform: getComputedStyle(f.el).transform }, { opacity: 0, transform: getComputedStyle(f.el).transform + ' translateY(80px)' }], { duration: 500, delay: i * 3, fill: 'forwards', easing: 'ease-in' });
    });
    animateAll(anims).then(function () {
      wrap.hidden = true;
      $('#fan').innerHTML = '';
      enterReveal();
    });
  }

  /* ----- reveal ----- */

  function enterReveal() {
    state.phase = 'reveal';
    setStep('reveal');
    placeSlots('reveal');
    var n = state.spread.positions.length;
    setInstruction(n === 1 ? 'Turn your card over when you are ready.' : 'Turn the cards over one at a time, in order or as you feel drawn.');
    setControls([
      { id: 'reveal-all-btn', label: n === 1 ? 'Turn it over' : 'Turn all in order', primary: true, onClick: revealAll }
    ]);
    setTimeout(function () { scrollToShow($('#cloth')); }, 650);
  }

  // Scroll just enough that the bottom of `el` (plus a little room) is on screen.
  function scrollToShow(el) {
    var r = el.getBoundingClientRect();
    var over = r.bottom + 24 - window.innerHeight;
    if (over > 0) window.scrollBy({ top: Math.min(over, r.top - 8), behavior: reduced ? 'auto' : 'smooth' });
  }

  function onSlotCard(i) {
    if (state.phase === 'draw') return;
    if (state.revealed.indexOf(i) === -1) revealCard(i);
    else openCardModal(i);
  }

  function revealCard(i) {
    if (state.revealed.indexOf(i) !== -1) return;
    state.revealed.push(i);
    var slot = $$('.slot')[i];
    var el = $('.tcard', slot);
    var entry = state.drawn[i];
    el.classList.add('is-flipped');
    el.setAttribute('aria-label', 'Card ' + (i + 1) + ', ' + state.spread.positions[i].name + ': ' + entry.card.name + (entry.reversed ? ' reversed' : '') + '. Open details.');
    fx.sound.flip(entry.card.arcana === 'major');
    setTimeout(function () {
      var r = el.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 2, entry.card.arcana === 'major' ? 70 : 34);
    }, 260);
    showCaption(i);
    if (state.revealed.length === state.spread.positions.length) {
      setTimeout(completeReading, reduced ? 50 : 900);
    }
  }

  function revealAll() {
    var btn = $('#reveal-all-btn'); if (btn) btn.disabled = true;
    var order = state.spread.positions.map(function (_, i) { return i; }).filter(function (i) { return state.revealed.indexOf(i) === -1; });
    order.reduce(function (p, i) {
      return p.then(function () { revealCard(i); return wait(520); });
    }, Promise.resolve());
  }

  function showCaption(i) {
    var e = state.drawn[i];
    var pos = state.spread.positions[i];
    var cap = $('#reveal-caption');
    cap.innerHTML = '<span class="cap-pos">' + (i + 1) + ' · ' + pos.name + '</span>' +
      '<span class="cap-name">' + e.card.name + (e.reversed ? ' <em>reversed</em>' : '') + '</span>' +
      '<span class="cap-kw">' + e.card.keywords[e.reversed ? 'rev' : 'up'].slice(0, 3).join(' · ') + '</span>';
    cap.classList.remove('is-shown');
    void cap.offsetWidth;
    cap.classList.add('is-shown');
  }

  function completeReading() {
    setStep('done');
    setInstruction('Every card is turned. Select any card to read it in depth, or scroll down for the full reading.');
    setControls([
      { id: 'to-reading', label: 'Read the full spread', primary: true, onClick: function () { $('#reading').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); } },
      { id: 'again-btn', label: 'New reading', onClick: function () { showStage('ask'); } }
    ]);
    fx.sound.chord();
    renderReading();
    saveHistory();
    setTimeout(function () { $('#reading').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }, reduced ? 0 : 1100);
  }

  /* ================= reading ================= */

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var DIGNITY_LABEL = { strong: 'Well dignified', weak: 'Ill dignified', mixed: 'Contested', neutral: 'Neutral' };

  function renderReading() {
    var r = state.reading;
    var sec = $('#reading');
    var date = new Date(state.date || Date.now());
    var html = '';
    html += '<header class="reading-head">' +
      '<p class="eyebrow">' + esc(r.spread.name) + ' · ' + date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) + '</p>' +
      '<h2 id="reading-title">' + (r.question ? '“' + esc(r.question) + '”' : 'A general reading') + '</h2>' +
      '</header>';

    html += '<div class="reading-story"><h3>The story of the spread</h3>' + r.synthesis.map(function (p, i) { return '<p' + (i === 0 ? ' class="first"' : '') + '>' + esc(p) + '</p>'; }).join('') + '</div>';

    html += '<div class="reading-section"><h3>Card by card</h3><ol class="card-list">';
    r.perCard.forEach(function (pc, i) {
      html += '<li class="card-entry">' +
        '<button type="button" class="entry-card" data-open="' + i + '" aria-label="Open ' + esc(pc.card.name) + '"></button>' +
        '<div class="entry-text">' +
        '<p class="entry-pos"><span class="entry-num">' + (i + 1) + '</span>' + esc(pc.position.name) + ' <span class="entry-q">' + esc(pc.position.question) + '</span></p>' +
        '<h4>' + esc(pc.card.name) + (pc.reversed ? ' <span class="rev-tag">Reversed</span>' : '') + '</h4>' +
        '<ul class="chips">' + pc.keywords.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul>' +
        '<p>' + esc(pc.meaning) + '</p>' +
        '<p class="in-pos">' + esc(pc.inPosition) + '</p>' +
        (pc.reversalNote ? '<p class="note">' + esc(pc.reversalNote) + '</p>' : '') +
        (pc.dignity ? '<p class="dignity dignity-' + pc.dignity.state + '"><span class="dignity-tag">' + DIGNITY_LABEL[pc.dignity.state] + '</span>' + esc(pc.dignityText) + '</p>' : '') +
        '</div></li>';
    });
    html += '</ol></div>';

    if (r.insights.length) {
      html += '<div class="reading-section"><h3>Patterns across the spread</h3><dl class="insights">';
      r.insights.forEach(function (ins) {
        html += '<div class="insight"><dt>' + esc(ins.label) + '</dt><dd class="insight-value">' + esc(ins.value) + '</dd><dd>' + esc(ins.text) + '</dd></div>';
      });
      html += '</dl></div>';
    }

    if (r.pairs.length) {
      html += '<div class="reading-section"><h3>How the positions speak to each other</h3><div class="pairs">';
      r.pairs.forEach(function (p) {
        var a = state.drawn[p.cards[0]], b = state.drawn[p.cards[1]];
        html += '<article class="pair"><h4>' + esc(p.title) + '</h4>' +
          (p.note ? '<p class="pair-note">' + esc(p.note) + '</p>' : '') +
          '<p class="pair-cards">' + esc(a.card.name) + (a.reversed ? ' (rev.)' : '') + ' <span aria-hidden="true">↔</span> ' + esc(b.card.name) + (b.reversed ? ' (rev.)' : '') + '</p>' +
          '<p>' + esc(p.text) + '</p></article>';
      });
      html += '</div></div>';
    }

    if (r.quintessence) {
      html += '<div class="reading-section quint"><div class="quint-card" id="quint-card"></div><div><h3>The quintessence</h3><p>' + esc(r.quintessence.text) + '</p></div></div>';
    }

    html += '<details class="method"><summary>How this reading was put together</summary>' +
      '<p>The deck is shuffled with a cryptographically random Fisher–Yates shuffle every time you riffle or wash, and part of the deck is turned end-over-end on each pass, which is where reversed cards come from. Your cut moves one of three piles to the top, and you choose the cards by hand from the fan.</p>' +
      '<p>Each card is then read in layers, the way most working readers teach it:</p>' +
      '<ol><li>The card’s traditional Rider–Waite–Smith meaning, upright or reversed.</li>' +
      '<li>The question its position asks.</li>' +
      '<li>Elemental dignity (Golden Dawn): a card beside the same or a friendly element (Fire–Air, Water–Earth) is strengthened; beside a hostile one (Fire–Water, Air–Earth) it is weakened. The Major Arcana take the element of their astrological sign or planet.</li>' +
      '<li>Patterns across the whole spread: how many Major Arcana, which suit dominates or is missing, how many reversals, court cards and repeated numbers.</li>' +
      '<li>Comparisons between key positions, such as Above against Below in the Celtic Cross.</li>' +
      '<li>The quintessence: the face values added together and reduced to a single Major Arcana card.</li></ol>' +
      '<p>Tarot shows likely paths, not fixed fate. Treat the reading as a prompt for reflection, not as advice on health, money or legal matters.</p>' +
      '</details>';

    html += '<div class="reading-actions">' +
      '<button type="button" class="primary-btn" id="new-reading-btn">Ask another question</button>' +
      '<button type="button" class="ghost-btn" id="again-same-btn">Same question, fresh draw</button>' +
      '<button type="button" class="ghost-btn" id="copy-btn">Copy reading as text</button>' +
      '<span class="copy-status" id="copy-status" role="status"></span>' +
      '</div>' +
      '<textarea class="copy-fallback" id="copy-fallback" hidden readonly aria-label="Reading text"></textarea>';

    sec.innerHTML = html;
    sec.hidden = false;

    $$('.entry-card', sec).forEach(function (btn) {
      var i = +btn.dataset.open;
      var c = makeCard(state.drawn[i], { flipped: true });
      btn.appendChild(c);
      btn.addEventListener('click', function () { openCardModal(i); });
    });
    if (r.quintessence) {
      $('#quint-card').appendChild(makeCard({ card: r.quintessence.card, reversed: false }, { flipped: true }));
    }
    $('#new-reading-btn').addEventListener('click', function () { showStage('ask'); $('#question').focus(); });
    $('#again-same-btn').addEventListener('click', function () { startTable(); });
    $('#copy-btn').addEventListener('click', copyReading);
  }

  function readingText() {
    var r = state.reading;
    var lines = [];
    lines.push('Seventy-Eight Tarot · ' + r.spread.name);
    if (r.question) lines.push('Question: ' + r.question);
    lines.push('');
    r.perCard.forEach(function (pc, i) {
      lines.push((i + 1) + '. ' + pc.position.name + ': ' + pc.card.name + (pc.reversed ? ' (reversed)' : ''));
      lines.push('   ' + pc.meaning);
      if (pc.dignity) lines.push('   ' + DIGNITY_LABEL[pc.dignity.state] + '.');
    });
    lines.push('');
    lines.push(r.synthesis.join(' '));
    if (r.quintessence) { lines.push(''); lines.push('Quintessence: ' + r.quintessence.card.name); }
    return lines.join('\n');
  }

  function copyReading() {
    var text = readingText();
    var status = $('#copy-status');
    var fallback = function () {
      var ta = $('#copy-fallback');
      ta.hidden = false; ta.value = text; ta.focus(); ta.select();
      status.textContent = 'Select all and copy the text below.';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { status.textContent = 'Copied to clipboard.'; }, fallback);
    } else fallback();
  }

  /* ================= card modal ================= */

  var lastFocus = null;
  function openModal(id) {
    lastFocus = document.activeElement;
    var m = $(id);
    m.hidden = false;
    requestAnimationFrame(function () { m.classList.add('is-open'); });
    var close = $('.modal-close', m);
    if (close) close.focus();
  }
  function closeModal(m) {
    m.classList.remove('is-open');
    setTimeout(function () { m.hidden = true; }, reduced ? 0 : 250);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openCardModal(i) {
    var r = state.reading;
    var pc = r.perCard[i];
    var e = state.drawn[i];
    var holder = $('#modal-card');
    holder.innerHTML = '';
    var c = makeCard(e, { flipped: false });
    holder.appendChild(c);
    setTimeout(function () { c.classList.add('is-flipped'); }, reduced ? 0 : 120);

    var el = T.engine.ELEMENTS[e.card.element];
    var o = e.reversed ? 'rev' : 'up', other = e.reversed ? 'up' : 'rev';
    $('#modal-text').innerHTML =
      '<p class="eyebrow">' + (i + 1) + ' · ' + esc(pc.position.name) + '</p>' +
      '<h2 id="modal-title">' + esc(e.card.name) + (e.reversed ? ' <span class="rev-tag">Reversed</span>' : '') + '</h2>' +
      '<p class="modal-q">' + esc(pc.position.question) + '</p>' +
      '<ul class="facts"><li><span>Arcana</span>' + (e.card.arcana === 'major' ? 'Major · ' + e.card.numeral : 'Minor · ' + T.SUITS[e.card.suit].name) + '</li>' +
      '<li><span>Element</span>' + el.name + '</li><li><span>Astrology</span>' + esc(e.card.astrology) + '</li></ul>' +
      '<ul class="chips">' + e.card.keywords[o].map(function (k) { return '<li>' + esc(k) + '</li>'; }).join('') + '</ul>' +
      '<p class="modal-meaning">' + esc(e.card.meaning[o]) + '</p>' +
      '<p class="in-pos">' + esc(pc.inPosition) + '</p>' +
      (pc.dignity ? '<p class="dignity dignity-' + pc.dignity.state + '"><span class="dignity-tag">' + DIGNITY_LABEL[pc.dignity.state] + '</span>' + esc(pc.dignityText) + '</p>' : '') +
      '<p class="other-way"><strong>' + (e.reversed ? 'Upright' : 'Reversed') + ', it would mean:</strong> ' + esc(e.card.meaning[other]) + '</p>';
    openModal('#card-modal');
  }

  /* ================= history ================= */

  function saveHistory() {
    var list = store.get('78-history', []);
    list.unshift({
      date: state.date,
      q: state.question,
      s: state.spread.id,
      o: state.opts,
      c: state.drawn.map(function (d) { return [d.card.id, d.reversed ? 1 : 0]; })
    });
    store.set('78-history', list.slice(0, 12));
  }

  function renderHistory() {
    var list = store.get('78-history', []);
    var ul = $('#history-list');
    if (!list.length) {
      ul.innerHTML = '<li class="history-empty">No readings yet. Finished readings appear here so you can come back to them.</li>';
      return;
    }
    ul.innerHTML = '';
    list.forEach(function (h) {
      var spread = T.SPREADS.filter(function (s) { return s.id === h.s; })[0];
      if (!spread) return;
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'history-item';
      btn.innerHTML = '<span class="h-date">' + new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' · ' + esc(spread.name) + '</span>' +
        '<span class="h-q">' + (h.q ? esc(h.q) : 'A general reading') + '</span>' +
        '<span class="h-cards">' + h.c.map(function (c) { return esc(byId[c[0]].name) + (c[1] ? ' (r)' : ''); }).join(', ') + '</span>';
      btn.addEventListener('click', function () { closeModal($('#history-modal')); restore(h, spread); });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  function restore(h, spread) {
    state.spread = spread;
    state.question = h.q;
    state.opts = h.o;
    state.date = h.date;
    state.drawn = h.c.map(function (c) { return { card: byId[c[0]], reversed: !!c[1] }; });
    state.revealed = state.drawn.map(function (_, i) { return i; });
    state.reading = E.interpret(spread, state.drawn, { question: h.q, reversals: h.o.reversals, dignities: h.o.dignities });
    showStage('table');
    prepTable();
    $('#deck-zone').classList.add('is-dealt');
    $('#layout').classList.add('is-visible');
    state.phase = 'reveal';
    placeSlots('reveal');
    state.drawn.forEach(function (e, i) {
      var slot = $$('.slot')[i];
      fillSlot(slot, e, i);
      $('.tcard', slot).classList.add('is-flipped');
    });
    setStep('done');
    setInstruction('A saved reading. Select any card to read it in depth.');
    setControls([
      { id: 'to-reading', label: 'Read the full spread', primary: true, onClick: function () { $('#reading').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); } },
      { id: 'again-btn', label: 'New reading', onClick: function () { showStage('ask'); } }
    ]);
    renderReading();
  }

  /* ================= flow ================= */

  function prepTable() {
    $('#reading').hidden = true;
    $('#reading').innerHTML = '';
    $('#fan-wrap').hidden = true;
    $('#reveal-caption').classList.remove('is-shown');
    $('#reveal-caption').innerHTML = '';
    $('#deck-zone').classList.remove('is-dealt');
    $('#layout').classList.remove('is-visible');
    $('#table-question').textContent = state.question ? '“' + state.question + '”' : 'A general reading · ' + state.spread.name;
    if (state.question) $('#table-question').textContent += ' · ' + state.spread.name;
    buildSlots();
    placeSlots('shuffle');
    buildDeck();
  }

  function startTable() {
    state.pile = E.newDeck();
    state.shuffles = 0;
    state.drawn = [];
    state.revealed = [];
    state.reading = null;
    state.date = Date.now();
    state.busy = false;
    showStage('table');
    prepTable();
    enterShuffle();
  }

  function onAsk(ev) {
    ev.preventDefault();
    var id = ($('input[name="spread"]:checked') || {}).value || 'three';
    state.spread = T.SPREADS.filter(function (s) { return s.id === id; })[0];
    state.question = $('#question').value.trim();
    state.opts = { reversals: $('#opt-reversals').checked, dignities: $('#opt-dignities').checked };
    store.set('78-spread', id);
    store.set('78-opts', state.opts);
    startTable();
  }

  function init() {
    renderSpreadList();
    renderHeroFan();
    var opts = store.get('78-opts', null);
    if (opts) { $('#opt-reversals').checked = !!opts.reversals; $('#opt-dignities').checked = !!opts.dignities; }

    $('#ask-form').addEventListener('submit', onAsk);
    $('#home-link').addEventListener('click', function (e) { e.preventDefault(); showStage('ask'); });

    var snd = $('#sound-toggle');
    var syncSound = function () {
      snd.setAttribute('aria-pressed', fx.sound.enabled ? 'true' : 'false');
      $('.sr-only', snd).textContent = fx.sound.enabled ? 'Sound on' : 'Sound off';
      snd.title = fx.sound.enabled ? 'Sound on' : 'Sound off';
    };
    snd.addEventListener('click', function () { fx.sound.enabled = !fx.sound.enabled; syncSound(); if (fx.sound.enabled) fx.sound.place(); });
    syncSound();

    $('#history-btn').addEventListener('click', function () { renderHistory(); openModal('#history-modal'); });

    $$('.modal').forEach(function (m) {
      m.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(m); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') $$('.modal').forEach(function (m) { if (!m.hidden) closeModal(m); });
    });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (!state.spread || state.phase === 'ask') return;
        placeSlots(state.phase);
        if (state.phase === 'draw') layoutFan();
      }, 120);
    });
  }

  init();
})();
