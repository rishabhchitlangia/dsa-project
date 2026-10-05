(function () {
  'use strict';

  var T = window.Tarot;
  var E = T.engine;
  var fx = T.fx;
  var RATIO = T.CARD_RATIO;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = fx.reduced;
  var dur = function (ms) { return reduced ? 1 : ms; };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduced ? 0 : ms); }); };
  var byId = {};
  var indexById = {};
  T.DECK.forEach(function (c, i) { byId[c.id] = c; indexById[c.id] = i; });
  var spreadById = {};
  T.SPREADS.forEach(function (s) { spreadById[s.id] = s; });

  /* ================= storage (optional) ================= */

  var store = {
    available: (function () {
      try { localStorage.setItem('78-test', '1'); localStorage.removeItem('78-test'); return true; } catch (e) { return false; }
    })(),
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
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
    metrics: null,
    date: 0,
    entryId: null,
    source: 'live' // 'live' | 'saved' | 'link'
  };

  /* ================= small helpers ================= */

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function longDate(d) { return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); }

  var announceTimer;
  function announce(text) {
    var el = $('#announcer');
    el.textContent = '';
    clearTimeout(announceTimer);
    announceTimer = setTimeout(function () { el.textContent = text; }, 60);
  }

  function preload(card) { var img = new Image(); img.decoding = 'async'; img.src = T.art.imageUrl(card); }

  /* ================= card elements ================= */

  // entry: {card, reversed} or null for a plain card back.
  // opts: tag ('div' | 'button'), flipped, label (accessible name),
  // defer (don't fetch the face image until showFace() is called).
  function makeCard(entry, opts) {
    opts = opts || {};
    var el = document.createElement(opts.tag || 'div');
    el.className = 'tcard';
    if (opts.tag === 'button') el.type = 'button';
    if (opts.label) {
      el.setAttribute('aria-label', opts.label);
      if (opts.tag !== 'button') el.setAttribute('role', 'img');
    }
    var inner = document.createElement('div');
    inner.className = 'tcard-inner';
    inner.setAttribute('aria-hidden', 'true');
    var back = document.createElement('div');
    back.className = 'tcard-face tcard-back';
    back.style.backgroundImage = T.art.back;
    inner.appendChild(back);
    if (entry) {
      var front = document.createElement('div');
      front.className = 'tcard-face tcard-front';
      var img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = T.art.altText(entry.card, entry.reversed);
      if (opts.defer) img.dataset.src = T.art.imageUrl(entry.card);
      else img.src = T.art.imageUrl(entry.card);
      img.onerror = function () {
        front.classList.add('is-svg');
        front.innerHTML = T.art.face(entry.card);
      };
      front.appendChild(img);
      inner.appendChild(front);
      if (entry.reversed) el.classList.add('is-reversed');
    }
    el.appendChild(inner);
    if (opts.flipped) el.classList.add('is-flipped');
    return el;
  }

  function showFace(el) {
    var img = el.querySelector('img[data-src]');
    if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
  }

  function cardLabel(entry) { return entry.card.name + (entry.reversed ? ', reversed' : ''); }

  /* ================= stage 1 · ask ================= */

  function miniDiagram(spread) {
    var maxX = 0, maxY = 0;
    spread.positions.forEach(function (p) { maxX = Math.max(maxX, p.x + 1); maxY = Math.max(maxY, p.y + RATIO); });
    var pad = 0.2;
    var svg = '<svg viewBox="' + (-pad) + ' ' + (-pad) + ' ' + (maxX + pad * 2) + ' ' + (maxY + pad * 2) + '" aria-hidden="true">';
    spread.positions.forEach(function (p) {
      if (p.crossing) svg += '<rect x="' + (p.x + 0.5 - RATIO / 2) + '" y="' + (p.y + RATIO / 2 - 0.5) + '" width="' + RATIO + '" height="1" rx=".1" class="mini-card mini-cross"/>';
      else svg += '<rect x="' + p.x + '" y="' + p.y + '" width="1" height="' + RATIO + '" rx=".1" class="mini-card"/>';
    });
    return svg + '</svg>';
  }

  function renderSpreadList() {
    var list = $('#spread-list');
    var chosen = store.get('78-spread', 'three');
    if (!spreadById[chosen]) chosen = 'three';
    list.innerHTML = '';
    T.SPREADS.forEach(function (s) {
      var label = document.createElement('label');
      label.className = 'spread-option';
      var n = s.positions.length;
      label.innerHTML =
        '<input type="radio" name="spread" id="spread-' + s.id + '" value="' + s.id + '"' + (s.id === chosen ? ' checked' : '') + '>' +
        '<span class="spread-diagram">' + miniDiagram(s) + '</span>' +
        '<span class="spread-text"><span class="spread-name">' + s.name + '</span><span class="spread-sub">' + s.subtitle + '</span></span>' +
        '<span class="spread-meta">' + n + (n === 1 ? ' card' : ' cards') +
        '<span class="spread-check" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M2.5 6.2 5 8.5 9.5 3.5"/></svg></span></span>';
      list.appendChild(label);
    });
  }

  function showStage(name) {
    $$('.stage').forEach(function (s) { s.classList.toggle('is-active', s.id === 'stage-' + name); });
    var reading = $('#reading');
    if (name === 'ask') {
      reading.hidden = true;
      state.phase = 'ask';
      clearHash();
    }
    reading.classList.toggle('is-standalone', name === 'reading');
    if (name === 'reading') reading.hidden = false;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ----- card of the day ----- */

  function localDateKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  // A small deterministic PRNG seeded from the date string, so the card is the same all day.
  function seededRandom(seedText) {
    var h = 2166136261;
    for (var i = 0; i < seedText.length; i++) { h ^= seedText.charCodeAt(i); h = Math.imul(h, 16777619); }
    var a = h >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function dailyEntry() {
    var key = localDateKey(new Date());
    var rnd = seededRandom('seventy-eight:' + key);
    return { key: key, entry: { card: T.DECK[Math.floor(rnd() * 78)], reversed: rnd() < 0.5 } };
  }

  var daily = null;
  function renderDaily() {
    daily = dailyEntry();
    $('#daily-title').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    var holder = $('#daily-card');
    holder.innerHTML = '';
    var c = makeCard(daily.entry, { tag: 'button', defer: true, label: 'Today’s card, face down. Turn it over.' });
    c.addEventListener('click', function () {
      if (c.classList.contains('is-flipped')) openDailyModal();
      else revealDaily();
    });
    holder.appendChild(c);
    if (store.get('78-daily', '') === daily.key) revealDaily(true);
  }

  function dailyReading() {
    return E.interpret(spreadById.one, [daily.entry], { reversals: true, dignities: false });
  }

  function revealDaily(instant) {
    var c = $('#daily-card .tcard');
    var e = daily.entry;
    showFace(c);
    if (instant) c.querySelector('.tcard-inner').style.transition = 'none';
    c.classList.add('is-flipped');
    c.setAttribute('aria-label', 'Today’s card: ' + cardLabel(e) + '. Open details.');
    if (instant) requestAnimationFrame(function () { c.querySelector('.tcard-inner').style.transition = ''; });
    else fx.sound.flip(e.card.arcana === 'major');
    store.set('78-daily', daily.key);
    var r = dailyReading();
    var o = e.reversed ? 'rev' : 'up';
    $('#daily-text').innerHTML =
      '<div><h3>' + esc(e.card.name) + '</h3><p class="daily-orient">' + (e.reversed ? 'Reversed' : 'Upright') + ' · ' + esc(e.card.keywords[o].slice(0, 3).join(', ')) + '</p></div>' +
      '<p>' + esc(e.card.meaning[o]) + '</p>' +
      '<p class="muted">' + esc(r.synthesis[1]) + '</p>' +
      '<p><button type="button" class="link-btn" id="daily-full">Do a full reading</button></p>';
    $('#daily-full').addEventListener('click', function () {
      $('#question').focus();
      $('#ask-form').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
    if (!instant) announce('Today’s card is ' + cardLabel(e) + '. ' + e.card.meaning[o]);
  }

  function openDailyModal() {
    var r = dailyReading();
    openCardModal(daily.entry, r.perCard[0], { eyebrow: 'Card of the day' });
  }

  /* ================= stage 2 · table ================= */

  var steps = ['shuffle', 'cut', 'draw', 'reveal'];
  function setStep(step) {
    var idx = steps.indexOf(step);
    $$('#steps li').forEach(function (li, i) {
      li.classList.toggle('is-done', i < idx || step === 'done');
      li.classList.toggle('is-current', i === idx);
      if (i === idx) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }

  function setInstruction(text, speak) {
    $('#instruction').textContent = text;
    if (speak !== false) announce(text);
  }

  function setControls(buttons) {
    var box = $('#table-controls');
    box.innerHTML = '';
    buttons.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = b.primary ? 'primary-btn' : 'secondary-btn';
      btn.textContent = b.label;
      btn.id = b.id;
      if (b.disabled) { btn.disabled = true; btn.dataset.off = '1'; }
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
    var cw = Math.min(availW / box.w, availH / box.h, state.spread.positions.length === 1 ? 170 : 140);
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
      slot.innerHTML = '<span class="slot-num" aria-hidden="true">' + (i + 1) + '</span><span class="slot-name" aria-hidden="true">' + p.name + '</span>';
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
    layout.classList.toggle('is-compact', m.cw < 60);
    $$('.slot', layout).forEach(function (slot, i) {
      var p = state.spread.positions[i];
      slot.style.left = (p.x * m.cw) + 'px';
      slot.style.top = (p.y * m.cw) + 'px';
    });
    var deckW = Math.min(Math.max(m.cw, 72), 112);
    $('#cloth').style.setProperty('--deck-w', deckW + 'px');
    $('#cloth').style.minHeight = Math.max(m.h, deckW * RATIO + 40) + 48 + 'px';
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
      zone.appendChild(c);
      deckEls.push(c);
    }
    deckEls.forEach(function (el, i) { el.style.transform = stackTransform(i); el.style.zIndex = i; });
  }
  function stackTransform(i) { return 'translate(' + (-i * 0.1) + 'px,' + (-i * 0.28) + 'px)'; }
  function deckWidth() { return parseFloat($('#cloth').style.getPropertyValue('--deck-w')) || 90; }

  function animateAll(list) {
    return Promise.all(list.map(function (a) { return a.finished.catch(function () {}); }));
  }

  function riffle() {
    var dw = deckWidth();
    var anims = deckEls.map(function (el, i) {
      var side = i % 2 === 0 ? -1 : 1;
      var half = Math.floor(i / 2);
      return el.animate([
        { transform: stackTransform(i) },
        { transform: 'translate(' + (side * dw * 0.58) + 'px,' + (-half * 0.28) + 'px) rotate(' + (side * 6) + 'deg)', offset: 0.45 },
        { transform: stackTransform(i) }
      ], { duration: dur(380), delay: reduced ? 0 : half * 3, easing: 'cubic-bezier(.3,.1,.2,1)' });
    });
    fx.sound.shuffle();
    return animateAll(anims);
  }

  function wash() {
    var dw = deckWidth();
    var cloth = $('#cloth');
    var spanX = Math.min(cloth.clientWidth * 0.36, dw * 2.6);
    var spanY = Math.min(cloth.clientHeight * 0.28, dw * 0.9);
    var anims = deckEls.map(function (el, i) {
      var a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
      var rot = (Math.random() - 0.5) * 160;
      return el.animate([
        { transform: stackTransform(i) },
        { transform: 'translate(' + (Math.cos(a) * r * spanX) + 'px,' + (Math.sin(a) * r * spanY) + 'px) rotate(' + rot + 'deg)', offset: 0.5 },
        { transform: stackTransform(i) }
      ], { duration: dur(640), delay: reduced ? 0 : i, easing: 'cubic-bezier(.4,0,.2,1)' });
    });
    fx.sound.shuffle();
    setTimeout(fx.sound.shuffle, 320);
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
    setInstruction('Hold your question in mind and shuffle. Riffle for a quick mix, or wash the cards across the table.');
    setControls([
      { id: 'riffle-btn', label: 'Riffle shuffle', primary: true, onClick: function () { doShuffle('riffle'); } },
      { id: 'wash-btn', label: 'Wash the cards', onClick: function () { doShuffle('wash'); } },
      { id: 'cut-btn', label: 'Cut the deck', disabled: true, onClick: enterCut }
    ]);
  }

  /* ----- cut ----- */

  var cutState = null;
  function enterCut() {
    if (state.busy) return;
    state.phase = 'cut';
    setStep('cut');
    lock(true);
    setControls([]);
    setInstruction('Cutting into three piles…', false);
    fx.sound.cut();
    var points = E.cutPoints(78);
    var dw = deckWidth();
    var gap = Math.min(dw * 1.4, ($('#cloth').clientWidth - dw) / 2.3);
    var ranges = [[0, points[0]], [points[0], points[1]], [points[1], 78]];
    var offsets = [-gap, 0, gap];
    cutState = { points: points };
    var anims = [];
    ranges.forEach(function (r, p) {
      for (var i = r[0]; i < r[1]; i++) {
        var j = i - r[0];
        var to = 'translate(' + (offsets[p] - j * 0.1) + 'px,' + (-j * 0.28) + 'px)';
        var el = deckEls[i];
        anims.push(el.animate([{ transform: el.style.transform }, { transform: to }], { duration: dur(320), delay: reduced ? 0 : p * 60, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }));
        el.dataset.pile = p;
        el.dataset.to = to;
      }
    });
    animateAll(anims).then(function () {
      deckEls.forEach(function (el) { el.style.transform = el.dataset.to; el.getAnimations().forEach(function (a) { a.cancel(); }); });
      setInstruction('Choose the pile that goes on top.');
      var zone = $('#deck-zone');
      offsets.forEach(function (o, p) {
        var hit = document.createElement('button');
        hit.type = 'button';
        hit.className = 'pile-hit';
        hit.style.transform = 'translateX(' + o + 'px)';
        hit.innerHTML = '<span>Pile ' + (p + 1) + '</span>';
        hit.setAttribute('aria-label', 'Pile ' + (p + 1) + ', ' + (ranges[p][1] - ranges[p][0]) + ' cards. Put it on top.');
        hit.addEventListener('mouseenter', function () { liftPile(p, true); });
        hit.addEventListener('mouseleave', function () { liftPile(p, false); });
        hit.addEventListener('focus', function () { liftPile(p, true); });
        hit.addEventListener('blur', function () { liftPile(p, false); });
        hit.addEventListener('click', function () { chooseCut(p); });
        zone.appendChild(hit);
      });
      lock(false);
      var first = $('.pile-hit');
      if (first) first.focus({ preventScroll: true });
    });
  }

  function liftPile(p, on) {
    deckEls.forEach(function (el) {
      if (+el.dataset.pile === p) el.style.transform = el.dataset.to + (on ? ' translateY(-10px)' : '');
    });
  }

  function chooseCut(p) {
    if (state.busy) return;
    lock(true);
    $$('.pile-hit').forEach(function (h) { h.remove(); });
    fx.sound.cut();
    state.pile = E.cut(state.pile, cutState.points, p);
    // Visually: the other piles gather in the centre and the chosen pile lands on top.
    var chosen = deckEls.filter(function (el) { return +el.dataset.pile === p; });
    var rest = deckEls.filter(function (el) { return +el.dataset.pile !== p; });
    var anims = [];
    rest.forEach(function (el, j) {
      anims.push(el.animate([{ transform: el.style.transform }, { transform: stackTransform(j) }], { duration: dur(320), easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }));
    });
    chosen.forEach(function (el, k) {
      var j = rest.length + k;
      el.style.zIndex = 200 + k;
      anims.push(el.animate([
        { transform: el.style.transform },
        { transform: el.dataset.to + ' translateY(-24px)', offset: 0.4 },
        { transform: stackTransform(j) }
      ], { duration: dur(400), delay: reduced ? 0 : 120, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }));
    });
    animateAll(anims).then(function () {
      deckEls = rest.concat(chosen);
      deckEls.forEach(function (el, i) { el.getAnimations().forEach(function (a) { a.cancel(); }); el.style.zIndex = i; el.style.transform = stackTransform(i); delete el.dataset.pile; });
      fx.sound.place();
      lock(false);
      return wait(150);
    }).then(enterDraw);
  }

  /* ----- draw from the fan ----- */

  var fanCards = [];
  var fanFocus = 0;

  function fanMetrics() {
    var wrap = $('#fan-wrap');
    var vw = wrap.clientWidth;
    var cw = Math.max(46, Math.min(80, vw * 0.07));
    var n = fanCards.filter(function (f) { return !f.taken; }).length || 1;
    var margin = cw * 1.1; // room for the tilted cards at each end
    var sliver = Math.min(cw * 0.6, Math.max(vw < 700 ? 14 : 9, (vw - cw - margin * 2) / n));
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
    var maxTilt = Math.min(14, 4 + m.n * 0.14);
    var k = 0;
    fanCards.forEach(function (f) {
      if (f.taken) return;
      var x = start + k * m.sliver;
      var t = m.n > 1 ? (k / (m.n - 1)) * 2 - 1 : 0; // -1 … 1
      var y = 28 + t * t * m.cw * 0.4;
      f.el.style.setProperty('--x', x + 'px');
      f.el.style.setProperty('--y', y + 'px');
      f.el.style.setProperty('--r', (t * maxTilt) + 'deg');
      f.el.style.zIndex = k;
      k++;
    });
    return m;
  }

  function availableFan() { return fanCards.filter(function (f) { return !f.taken; }); }

  // Roving tabindex: the fan is one tab stop; arrow keys move between cards.
  function setFanFocus(idx, focus) {
    var list = availableFan();
    if (!list.length) return;
    fanFocus = Math.max(0, Math.min(idx, list.length - 1));
    list.forEach(function (f, i) { f.el.tabIndex = i === fanFocus ? 0 : -1; });
    if (focus) list[fanFocus].el.focus({ preventScroll: false });
  }

  function onFanKey(e) {
    var list = availableFan();
    var cur = list.indexOf(fanCards.filter(function (f) { return f.el === document.activeElement; })[0]);
    if (cur < 0) return;
    var next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = cur + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = cur - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = list.length - 1;
    else if (e.key === 'PageDown') next = cur + 10;
    else if (e.key === 'PageUp') next = cur - 10;
    if (next !== null) { e.preventDefault(); setFanFocus(next, true); }
  }

  function enterDraw() {
    state.phase = 'draw';
    setStep('draw');
    var need = state.spread.positions.length;
    setInstruction('Choose ' + (need === 1 ? 'one card' : need + ' cards') + ' from the fan.');
    setControls([]);
    var counter = document.createElement('p');
    counter.className = 'draw-counter';
    counter.innerHTML = '<span id="drawn-n">0</span> of ' + need + ' drawn';
    $('#table-controls').appendChild(counter);

    var wrap = $('#fan-wrap');
    wrap.hidden = false;
    var fan = $('#fan');
    fan.innerHTML = '';
    fanCards = state.pile.map(function (entry, i) {
      var el = makeCard(null, { tag: 'button', label: 'Face-down card ' + (i + 1) + ' of 78. Draw this card.' });
      el.classList.add('fan-card');
      el.tabIndex = -1;
      var f = { el: el, index: i, taken: false };
      el.addEventListener('click', function () { pick(f); });
      el.addEventListener('focus', function () { var l = availableFan(); fanFocus = l.indexOf(f); });
      fan.appendChild(el);
      return f;
    });
    fan.onkeydown = onFanKey;
    var m = layoutFan();
    setFanFocus(Math.floor(fanCards.length / 2), false);

    $('#layout').classList.add('is-visible');
    placeSlots('draw');

    // Deal: the stack spreads out into the fan.
    var deckRect = $('#deck-zone').getBoundingClientRect();
    var fanRect = fan.getBoundingClientRect();
    var fromX = deckRect.left + deckRect.width / 2 - fanRect.left - m.cw / 2;
    var fromY = deckRect.top + deckRect.height / 2 - fanRect.top - (m.cw * RATIO) / 2;
    var anims = reduced ? [] : fanCards.map(function (f, i) {
      return f.el.animate([
        { transform: 'translate(' + fromX + 'px,' + fromY + 'px) rotate(0deg)', opacity: 0 },
        { transform: 'translate(' + f.el.style.getPropertyValue('--x') + ',' + f.el.style.getPropertyValue('--y') + ') rotate(' + f.el.style.getPropertyValue('--r') + ')', opacity: 1 }
      ], { duration: 360, delay: i * 3, easing: 'cubic-bezier(.2,.7,.2,1)' });
    });
    $('#deck-zone').classList.add('is-dealt');
    fx.sound.shuffle();
    lock(true);
    scrollToShow(wrap);
    animateAll(anims).then(function () {
      lock(false);
      wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2;
      if (wrap.scrollWidth > wrap.clientWidth + 4) {
        $('#instruction').textContent += ' Swipe the fan to see more of the deck.';
      }
    });
  }

  function cardCenter(el) {
    var r = el.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }

  function pick(f) {
    var need = state.spread.positions.length;
    if (f.taken || state.drawn.length >= need || state.phase !== 'draw') return;
    var slotIndex = state.drawn.length;
    var entry = state.pile[f.index];
    var wasFocused = document.activeElement === f.el;
    f.taken = true;
    state.drawn.push(entry);
    preload(entry.card);
    $('#drawn-n').textContent = state.drawn.length;
    var pos = state.spread.positions[slotIndex];
    announce('Card ' + (slotIndex + 1) + ' of ' + need + ' placed in ' + pos.name + '.');
    fx.sound.pick();

    var slot = $$('.slot')[slotIndex];
    var from = cardCenter(f.el);
    var fromRot = parseFloat(f.el.style.getPropertyValue('--r')) || 0;
    var fw = parseFloat($('#fan').style.getPropertyValue('--fw'));
    f.el.classList.add('is-taken');
    f.el.tabIndex = -1;

    var to = cardCenter(slot);
    var toRot = pos.crossing ? 90 : 0;
    var scale = state.metrics.cw / fw;

    var fly = makeCard(null);
    fly.classList.add('flying');
    fly.style.width = fw + 'px';
    document.body.appendChild(fly);
    var h = fw * RATIO;
    var a = fly.animate([
      { transform: 'translate(' + (from.cx - fw / 2) + 'px,' + (from.cy - h / 2) + 'px) rotate(' + fromRot + 'deg) scale(1)' },
      { transform: 'translate(' + (to.cx - fw / 2) + 'px,' + (to.cy - h / 2) + 'px) rotate(' + toRot + 'deg) scale(' + scale + ')' }
    ], { duration: dur(400), easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });

    layoutFan();
    if (state.drawn.length < need) setFanFocus(fanFocus, wasFocused);

    a.finished.then(function () {
      fly.remove();
      fillSlot(slot, entry, slotIndex);
      fx.sound.place();
      if (state.drawn.length === need) finishDraw();
    });
  }

  function fillSlot(slot, entry, i) {
    var c = makeCard(entry, { tag: 'button', label: 'Card ' + (i + 1) + ', ' + state.spread.positions[i].name + '. Face down. Turn it over.' });
    c.classList.add('slot-card');
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
    var anims = reduced ? [] : availableFan().map(function (f) {
      return f.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: 'forwards', easing: 'ease-out' });
    });
    animateAll(anims).then(function () {
      wrap.hidden = true;
      $('#fan').innerHTML = '';
      fanCards = [];
      enterReveal();
    });
  }

  /* ----- reveal ----- */

  function enterReveal() {
    state.phase = 'reveal';
    setStep('reveal');
    placeSlots('reveal');
    var n = state.spread.positions.length;
    setInstruction(n === 1 ? 'Turn your card over when you are ready.' : 'Turn the cards over one at a time, or all in order.');
    setControls([
      { id: 'reveal-all-btn', label: n === 1 ? 'Turn it over' : 'Turn all in order', primary: true, onClick: revealAll }
    ]);
    var first = $('.slot-card');
    if (first) first.focus({ preventScroll: true });
    setTimeout(function () { scrollToShow($('#cloth')); }, reduced ? 0 : 350);
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
    else openCardModal(state.drawn[i], state.reading.perCard[i], { index: i });
  }

  function revealCard(i) {
    if (state.revealed.indexOf(i) !== -1) return;
    state.revealed.push(i);
    var slot = $$('.slot')[i];
    var el = $('.tcard', slot);
    var entry = state.drawn[i];
    var pos = state.spread.positions[i];
    el.classList.add('is-flipped');
    el.setAttribute('aria-label', 'Card ' + (i + 1) + ', ' + pos.name + ': ' + cardLabel(entry) + '. Open details.');
    fx.sound.flip(entry.card.arcana === 'major');
    var kw = entry.card.keywords[entry.reversed ? 'rev' : 'up'].slice(0, 3);
    var capEl = $('#reveal-caption');
    capEl.innerHTML = '<span class="cap-pos">' + (i + 1) + ' · ' + esc(pos.name) + '</span>' +
      '<span class="cap-name">' + esc(entry.card.name) + '</span>' +
      '<span class="cap-kw">' + (entry.reversed ? 'Reversed · ' : '') + esc(kw.join(' · ')) + '</span>';
    capEl.classList.remove('is-shown'); void capEl.offsetWidth; capEl.classList.add('is-shown');
    announce('Card ' + (i + 1) + ', ' + pos.name + ': ' + cardLabel(entry) + '. ' + cap(kw.join(', ')) + '.');
    if (state.revealed.length === state.spread.positions.length) {
      setTimeout(completeReading, reduced ? 0 : 700);
    }
  }

  function revealAll() {
    var btn = $('#reveal-all-btn'); if (btn) { btn.disabled = true; btn.dataset.off = '1'; }
    var order = state.spread.positions.map(function (_, i) { return i; }).filter(function (i) { return state.revealed.indexOf(i) === -1; });
    order.reduce(function (p, i) {
      return p.then(function () { revealCard(i); return wait(420); });
    }, Promise.resolve());
  }

  function completeReading() {
    setStep('done');
    setInstruction('Every card is turned. Select a card to read it in depth, or continue to the full reading.');
    setControls([
      { id: 'to-reading', label: 'Read the full reading', primary: true, onClick: function () { $('#reading').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); focusReadingTitle(); } },
      { id: 'again-btn', label: 'New reading', onClick: function () { showStage('ask'); } }
    ]);
    fx.sound.chord();
    state.entryId = saveHistory();
    state.source = 'live';
    renderReading();
    setTimeout(function () { $('#reading').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }, reduced ? 0 : 600);
  }

  function focusReadingTitle() {
    var t = $('#reading-title');
    if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); }
  }

  /* ================= reading ================= */

  var DIGNITY_LABEL = { strong: 'Well dignified', weak: 'Ill dignified', mixed: 'Contested', neutral: 'Neutral' };

  // Which positions carry the answer in each spread.
  var KEY_POSITIONS = {
    one: { heart: 0 },
    three: { heart: 1, outcome: 2 },
    sao: { heart: 0, advice: 1, outcome: 2 },
    relationship: { heart: 1, outcome: 4 },
    horseshoe: { heart: 1, advice: 5, outcome: 6 },
    celtic: { heart: 0, advice: 6, outcome: 9 }
  };

  function insight(r, label) { return r.insights.filter(function (i) { return i.label === label; })[0]; }

  // A 2–3 sentence plain-language answer, assembled only from the engine's output.
  function buildSummary(r, drawn, opts) {
    var key = KEY_POSITIONS[r.spread.id] || { heart: 0 };
    var pc = r.perCard;
    var kw = function (i, n) { return pc[i].keywords.slice(0, n || 2).join(' and '); };
    var name = function (i) { return pc[i].card.name + (pc[i].reversed ? ' reversed' : ''); };
    var n = drawn.length;
    var out = [];

    if (n === 1) {
      out.push('The answer is ' + name(0) + ': ' + kw(0, 3) + '.');
      out.push(pc[0].meaning);
      return out;
    }

    out.push('At the centre of this is ' + name(key.heart) + ', which points to ' + kw(key.heart) +
      (key.outcome != null ? '; on the current path it leads to ' + kw(key.outcome) + ' (' + name(key.outcome) + ').' : '.'));

    var majors = drawn.filter(function (d) { return d.card.arcana === 'major'; }).length;
    var theme;
    if (majors / n >= 0.5) theme = 'More than half the cards are Major Arcana, so this is a significant chapter shaped by forces larger than day-to-day choices';
    else if (majors === 0) theme = 'There are no Major Arcana, so this is an everyday matter that is largely in your hands';
    else theme = majors + ' of ' + n + ' cards are Major Arcana, a mix of big themes and practical detail';
    var dom = insight(r, 'Dominant suit');
    var lead = insight(r, 'Leading element');
    if (dom) {
      var suit = Object.keys(T.SUITS).filter(function (s) { return dom.value.indexOf(T.SUITS[s].name) === 0; })[0];
      if (suit) theme += ', and ' + T.SUITS[suit].name + ' lead, so it turns on ' + T.SUITS[suit].domain;
    } else if (lead) {
      var el = Object.keys(E.ELEMENTS).filter(function (k) { return E.ELEMENTS[k].name === lead.value; })[0];
      if (el) theme += ', with ' + lead.value + ' leading: ' + E.ELEMENTS[el].quality;
    }
    out.push(theme + '.');

    if (key.advice != null) {
      var a = pc[key.advice];
      out.push('The advice is ' + (a.reversed ? 'to guard against ' : '') + kw(key.advice) + ' (' + name(key.advice) + ').');
    } else if (opts.reversals) {
      var rev = drawn.filter(function (d) { return d.reversed; }).length;
      if (rev === 0) out.push('No cards are reversed, so energy is moving freely.');
      else if (rev / n > 0.5) out.push('Most cards are reversed, so expect blocks or slow inner work before things move.');
      else out.push(rev + (rev === 1 ? ' reversed card marks' : ' reversed cards mark') + ' where things are stuck.');
    }
    return out;
  }

  function renderMiniSpread(container, spread, drawn) {
    var box = spreadBox(spread);
    var cw = Math.max(26, Math.min(56, 300 / box.w, 300 / box.h));
    container.style.width = box.w * cw + 'px';
    container.style.height = box.h * cw + 'px';
    container.innerHTML = '';
    spread.positions.forEach(function (p, i) {
      var c = makeCard(drawn[i], { tag: 'button', flipped: true, label: (i + 1) + ', ' + p.name + ': ' + cardLabel(drawn[i]) + '. Open details.' });
      c.style.setProperty('--w', cw + 'px');
      c.style.left = p.x * cw + 'px';
      c.style.top = p.y * cw + 'px';
      if (p.crossing) c.classList.add('is-crossing');
      c.addEventListener('click', function () { openCardModal(drawn[i], state.reading.perCard[i], { index: i }); });
      container.appendChild(c);
    });
  }

  function renderReading() {
    var r = state.reading;
    var sec = $('#reading');
    var summary = buildSummary(r, state.drawn, state.opts);
    var html = '';

    html += '<header class="reading-head">' +
      '<div><p class="eyebrow">' + esc(r.spread.name) + ' · ' + longDate(state.date) + '</p>' +
      '<h2 id="reading-title">' + (r.question ? '“' + esc(r.question) + '”' : 'General reading') + '</h2>' +
      '<div class="reading-summary">' + summary.map(function (s) { return '<p>' + esc(s) + '</p>'; }).join('') + '</div></div>' +
      '<div class="mini-spread" id="mini-spread" role="group" aria-label="The spread"></div>' +
      '</header>';

    html += '<div class="reading-cards">';
    r.perCard.forEach(function (pc, i) {
      html += '<section class="card-section" aria-labelledby="card-title-' + i + '">' +
        '<figure class="card-figure" data-open="' + i + '"></figure>' +
        '<div class="card-copy">' +
        '<p class="card-pos"><span class="num">' + (i + 1) + '</span><span><strong>' + esc(pc.position.name) + '</strong> · ' + esc(pc.position.question) + '</span></p>' +
        '<div><h3 id="card-title-' + i + '">' + esc(pc.card.name) + '</h3>' +
        '<p class="orient' + (pc.reversed ? ' is-rev' : '') + '">' + (pc.reversed ? 'Reversed' : 'Upright') + '</p></div>' +
        '<p class="keywords">' + esc(pc.keywords.join(' · ')) + '</p>' +
        '<p>' + esc(pc.meaning) + '</p>' +
        '<p class="in-pos">' + esc(pc.inPosition) + '</p>' +
        (pc.reversalNote ? '<p class="note-line">' + esc(pc.reversalNote) + '</p>' : '') +
        (pc.dignity ? '<p class="dignity dignity-' + pc.dignity.state + '"><span class="dignity-tag">' + DIGNITY_LABEL[pc.dignity.state] + '.</span>' + esc(pc.dignityText) + '</p>' : '') +
        '</div></section>';
    });
    html += '</div>';

    if (r.spread.positions.length > 1) {
      html += '<section class="reading-section story" aria-labelledby="story-title"><h3 id="story-title">The spread as a whole</h3>' +
        r.synthesis.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</section>';
    }

    if (r.insights.length) {
      html += '<section class="reading-section" aria-labelledby="patterns-title"><h3 id="patterns-title">Patterns</h3><dl class="facts-list">';
      r.insights.forEach(function (ins) {
        html += '<div><dt>' + esc(ins.label) + '<span>' + esc(ins.value) + '</span></dt><dd>' + esc(ins.text) + '</dd></div>';
      });
      html += '</dl></section>';
    }

    if (r.pairs.length) {
      html += '<section class="reading-section" aria-labelledby="pairs-title"><h3 id="pairs-title">Connections</h3><div class="pairs">';
      r.pairs.forEach(function (p) {
        var a = state.drawn[p.cards[0]], b = state.drawn[p.cards[1]];
        html += '<div class="pair"><h4>' + esc(p.title) + '</h4>' +
          '<p class="pair-cards">' + esc(cardLabel(a)) + ' and ' + esc(cardLabel(b)) + (p.note ? ' · ' + esc(p.note) : '') + '</p>' +
          '<p>' + esc(p.text) + '</p></div>';
      });
      html += '</div></section>';
    }

    if (r.quintessence) {
      html += '<section class="reading-section" aria-labelledby="quint-title"><h3 id="quint-title">Quintessence</h3>' +
        '<div class="quint"><div id="quint-card"></div><p>' + esc(r.quintessence.text) + '</p></div></section>';
    }

    html += '<section class="journal" aria-labelledby="journal-title"><h3 id="journal-title">Notes</h3><div id="journal-body"></div></section>';

    html += '<div class="reading-actions">' +
      '<button type="button" class="secondary-btn" id="copy-link-btn">Copy link</button>' +
      '<button type="button" class="secondary-btn" id="save-image-btn">Save as image</button>' +
      '<button type="button" class="secondary-btn" id="copy-text-btn">Copy as text</button>' +
      '<button type="button" class="primary-btn" id="new-reading-btn">' + (state.source === 'link' ? 'Do your own reading' : 'New reading') + '</button>' +
      '<span class="status" id="share-status" role="status"></span>' +
      '</div>' +
      '<textarea class="copy-fallback" id="copy-fallback" hidden readonly aria-label="Text to copy"></textarea>';

    html += '<details class="method"><summary>How this reading works</summary>' +
      '<p>The deck is shuffled with a cryptographically random Fisher–Yates shuffle each time you riffle or wash, and part of the deck is turned end over end on each pass, which is where reversed cards come from. Your cut moves one of three piles to the top, and you choose the cards by hand.</p>' +
      '<ol><li>Each card’s traditional Rider–Waite–Smith meaning, upright or reversed.</li>' +
      '<li>The question its position asks.</li>' +
      '<li>Elemental dignity (Golden Dawn): beside the same or a friendly element (Fire–Air, Water–Earth) a card is strengthened; beside a hostile one (Fire–Water, Air–Earth) it is weakened.</li>' +
      '<li>Patterns across the spread: Major Arcana, suits, reversals, court cards and repeated numbers.</li>' +
      '<li>Comparisons between key positions.</li>' +
      '<li>The quintessence: the card values added and reduced to one Major Arcana card.</li></ol>' +
      '<p>Tarot shows likely paths, not fixed fate. Treat a reading as a prompt for reflection, not advice on health, money or legal matters.</p>' +
      '</details>';

    sec.innerHTML = html;
    sec.hidden = false;

    renderMiniSpread($('#mini-spread'), r.spread, state.drawn);
    $$('.card-figure', sec).forEach(function (fig) {
      var i = +fig.dataset.open;
      var c = makeCard(state.drawn[i], { tag: 'button', flipped: true, label: cardLabel(state.drawn[i]) + '. Open details.' });
      c.addEventListener('click', function () { openCardModal(state.drawn[i], r.perCard[i], { index: i }); });
      fig.appendChild(c);
    });
    if (r.quintessence) {
      $('#quint-card').appendChild(makeCard({ card: r.quintessence.card, reversed: false }, { flipped: true, label: r.quintessence.card.name }));
    }
    renderJournal();

    $('#new-reading-btn').addEventListener('click', function () { showStage('ask'); $('#question').focus(); });
    $('#copy-link-btn').addEventListener('click', copyLink);
    $('#save-image-btn').addEventListener('click', saveImage);
    $('#copy-text-btn').addEventListener('click', function () { copyText(readingText(), 'Reading copied.'); });
  }

  function readingText() {
    var r = state.reading;
    var lines = ['Seventy-Eight Tarot · ' + r.spread.name + ' · ' + longDate(state.date)];
    lines.push(r.question ? 'Question: ' + r.question : 'General reading');
    lines.push('');
    lines.push(buildSummary(r, state.drawn, state.opts).join(' '));
    lines.push('');
    r.perCard.forEach(function (pc, i) {
      lines.push((i + 1) + '. ' + pc.position.name + ': ' + pc.card.name + (pc.reversed ? ' (reversed)' : ''));
      lines.push('   ' + pc.meaning);
    });
    var entry = state.entryId && findEntry(state.entryId);
    if (entry && entry.note) { lines.push(''); lines.push('Notes: ' + entry.note); }
    return lines.join('\n');
  }

  function copyText(text, okMessage) {
    var status = $('#share-status');
    var fallback = function () {
      var ta = $('#copy-fallback');
      ta.hidden = false; ta.value = text; ta.focus(); ta.select();
      status.textContent = 'Copying is blocked here. The text is selected below; copy it with your keyboard or menu.';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { $('#copy-fallback').hidden = true; status.textContent = okMessage; }, fallback);
    } else fallback();
  }

  /* ================= sharing ================= */

  function currentShareToken() {
    return T.share.encode({
      spreadId: state.spread.id,
      question: state.question,
      opts: state.opts,
      cards: state.drawn.map(function (d) { return [d.card.id, d.reversed ? 1 : 0]; }),
      date: state.date
    });
  }

  // When the site is embedded (for example in a preview frame), a <meta name="share-base">
  // can name the public address to share instead of the frame's own URL.
  function shareBase() {
    var meta = $('meta[name="share-base"]');
    var embedded = false;
    try { embedded = window.top !== window.self; } catch (e) { embedded = true; }
    return meta && meta.content && embedded ? meta.content : location.href.split('#')[0];
  }

  function copyLink() {
    var url = shareBase() + '#' + currentShareToken();
    copyText(url, 'Link copied. Anyone who opens it sees this reading.');
  }

  function clearHash() {
    if (location.hash.indexOf('#' + T.share.PREFIX) !== 0) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* sandboxed */ }
  }

  function saveImage() {
    var status = $('#share-status');
    var btn = $('#save-image-btn');
    btn.disabled = true;
    status.textContent = 'Preparing the image…';
    T.share.renderImage({
      spread: state.spread,
      question: state.question,
      drawn: state.drawn,
      summary: buildSummary(state.reading, state.drawn, state.opts),
      date: state.date
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var name = 'tarot-' + localDateKey(new Date(state.date)) + '-' + state.spread.id + '.png';
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      $('#export-preview').innerHTML = '<img alt="Your reading as an image" src="' + url + '">';
      var link = $('#export-link'); link.href = url; link.download = name;
      status.textContent = 'Image saved.';
      openModal('#export-modal');
    }).catch(function () {
      status.textContent = 'The image could not be created in this browser.';
    }).then(function () { btn.disabled = false; });
  }

  function openFromToken(token) {
    var d = T.share.decode(token);
    if (!d) return false;
    var spread = spreadById[d.spreadId];
    showReadingFor({
      spread: spread,
      question: d.question,
      opts: d.opts,
      date: d.date,
      drawn: d.cards.map(function (c) { return { card: byId[c[0]], reversed: !!c[1] }; })
    }, 'link');
    return true;
  }

  // Show a finished reading on its own, without the table.
  function showReadingFor(r, source) {
    state.spread = r.spread;
    state.question = r.question || '';
    state.opts = r.opts;
    state.date = r.date;
    state.drawn = r.drawn;
    state.revealed = r.drawn.map(function (_, i) { return i; });
    state.reading = E.interpret(r.spread, r.drawn, { question: state.question, reversals: r.opts.reversals, dignities: r.opts.dignities });
    state.source = source;
    state.phase = 'reading';
    var id = entryIdFor({ date: r.date, c: r.drawn.map(function (d) { return [d.card.id, d.reversed ? 1 : 0]; }) });
    state.entryId = findEntry(id) ? id : null;
    r.drawn.forEach(function (d) { preload(d.card); });
    showStage('reading');
    renderReading();
    focusReadingTitle();
  }

  /* ================= journal (history + notes) ================= */

  function entryIdFor(h) {
    return Math.round(h.date / 1000).toString(36) + '-' + h.c.map(function (c) { return indexById[c[0]].toString(36) + (c[1] ? 'r' : ''); }).join('.');
  }

  function validEntry(h) {
    if (!h || typeof h !== 'object' || !spreadById[h.s] || !Array.isArray(h.c)) return null;
    if (h.c.length !== spreadById[h.s].positions.length) return null;
    if (!h.c.every(function (c) { return Array.isArray(c) && byId[c[0]]; })) return null;
    var date = Number(h.date);
    if (!isFinite(date) || date <= 0) return null;
    var out = {
      date: date,
      q: String(h.q || '').slice(0, 240),
      s: h.s,
      o: { reversals: !!(h.o && h.o.reversals), dignities: !!(h.o && h.o.dignities) },
      c: h.c.map(function (c) { return [c[0], c[1] ? 1 : 0]; }),
      note: String(h.note || '').slice(0, 4000)
    };
    out.id = entryIdFor(out);
    return out;
  }

  function loadHistory() {
    var raw = store.get('78-history', []);
    if (!Array.isArray(raw)) return [];
    return raw.map(validEntry).filter(Boolean);
  }
  function saveHistoryList(list) {
    list.sort(function (a, b) { return b.date - a.date; });
    return store.set('78-history', list.slice(0, 300));
  }
  function findEntry(id) { return loadHistory().filter(function (h) { return h.id === id; })[0] || null; }
  function updateEntry(id, fn) {
    var list = loadHistory();
    list.forEach(function (h) { if (h.id === id) fn(h); });
    return saveHistoryList(list);
  }

  function saveHistory() {
    var entry = validEntry({
      date: state.date,
      q: state.question,
      s: state.spread.id,
      o: state.opts,
      c: state.drawn.map(function (d) { return [d.card.id, d.reversed ? 1 : 0]; })
    });
    var list = loadHistory().filter(function (h) { return h.id !== entry.id; });
    list.unshift(entry);
    return saveHistoryList(list) ? entry.id : null;
  }

  function renderJournal() {
    var body = $('#journal-body');
    if (!body) return;
    if (!store.available) {
      body.innerHTML = '<p class="muted">Notes need browser storage, which is turned off here.</p>';
      return;
    }
    var entry = state.entryId && findEntry(state.entryId);
    if (!entry) {
      body.innerHTML = '<p class="muted">Save this reading to your past readings to keep notes on it.</p>' +
        '<div class="journal-row"><button type="button" class="secondary-btn" id="save-entry-btn">Save to past readings</button></div>';
      $('#save-entry-btn').addEventListener('click', function () {
        state.entryId = saveHistory();
        renderJournal();
        var input = $('#note-input'); if (input) input.focus();
      });
      return;
    }
    body.innerHTML = '<label class="muted" for="note-input">What actually happened? Notes are saved with this reading.</label>' +
      '<textarea id="note-input" class="note-input" rows="3"></textarea>' +
      '<div class="journal-row"><button type="button" class="secondary-btn" id="save-note-btn">Save note</button><span class="status" id="note-status" role="status"></span></div>';
    $('#note-input').value = entry.note || '';
    $('#save-note-btn').addEventListener('click', function () {
      var text = $('#note-input').value.trim();
      var ok = updateEntry(entry.id, function (h) { h.note = text; });
      $('#note-status').textContent = ok ? 'Note saved.' : 'The note could not be saved.';
    });
  }

  function thumbRow(h) {
    var row = document.createElement('div');
    row.className = 'h-thumbs';
    row.setAttribute('aria-hidden', 'true');
    h.c.forEach(function (c) { row.appendChild(makeCard({ card: byId[c[0]], reversed: !!c[1] }, { flipped: true })); });
    return row;
  }

  function renderHistory() {
    var ul = $('#history-list');
    ul.innerHTML = '';
    $('#export-btn').disabled = !store.available;
    $('#import-input').disabled = !store.available;
    if (!store.available) {
      ul.innerHTML = '<li class="history-empty">Browser storage is turned off here, so readings can’t be saved.</li>';
      return;
    }
    var list = loadHistory();
    if (!list.length) {
      ul.innerHTML = '<li class="history-empty">No readings yet. Finished readings appear here.</li>';
      return;
    }
    list.forEach(function (h) {
      var spread = spreadById[h.s];
      var li = document.createElement('li');
      li.className = 'history-item';
      li.innerHTML = '<p class="h-meta">' + esc(new Date(h.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })) + ' · ' + esc(spread.name) + '</p>' +
        '<p class="h-q">' + (h.q ? esc(h.q) : 'General reading') + '</p>';
      li.appendChild(thumbRow(h));
      var cardsText = document.createElement('p');
      cardsText.className = 'sr-only';
      cardsText.textContent = 'Cards: ' + h.c.map(function (c) { return byId[c[0]].name + (c[1] ? ' reversed' : ''); }).join(', ');
      li.appendChild(cardsText);
      if (h.note) {
        var note = document.createElement('p');
        note.className = 'h-note';
        note.textContent = h.note;
        li.appendChild(note);
      }
      var actions = document.createElement('div');
      actions.className = 'h-actions';
      actions.innerHTML = '<button type="button" class="link-btn" data-act="open">Open</button>' +
        '<button type="button" class="link-btn" data-act="note">' + (h.note ? 'Edit note' : 'Add note') + '</button>' +
        '<button type="button" class="link-btn is-danger" data-act="delete">Delete</button>';
      li.appendChild(actions);
      actions.addEventListener('click', function (e) {
        var btn = e.target.closest('button'); if (!btn) return;
        var act = btn.dataset.act;
        if (act === 'open') {
          closeModal($('#history-modal'), true);
          showReadingFor({ spread: spread, question: h.q, opts: h.o, date: h.date, drawn: h.c.map(function (c) { return { card: byId[c[0]], reversed: !!c[1] }; }) }, 'saved');
        } else if (act === 'note') {
          editNoteInline(li, h);
        } else if (act === 'delete') {
          if (btn.dataset.armed) {
            var rest = loadHistory().filter(function (x) { return x.id !== h.id; });
            saveHistoryList(rest);
            if (state.entryId === h.id) { state.entryId = null; renderJournal(); }
            renderHistory();
            $('#history-status').textContent = 'Reading deleted.';
            var first = $('#history-list button'); (first || $('#export-btn')).focus();
          } else {
            btn.dataset.armed = '1';
            btn.textContent = 'Select again to delete';
            setTimeout(function () { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = 'Delete'; } }, 4000);
          }
        }
      });
      ul.appendChild(li);
    });
  }

  function editNoteInline(li, h) {
    if ($('.h-edit', li)) { $('.h-edit textarea', li).focus(); return; }
    var box = document.createElement('div');
    box.className = 'h-edit';
    var id = 'h-note-' + h.id.replace(/[^a-z0-9]/gi, '');
    box.innerHTML = '<label class="sr-only" for="' + id + '">Note</label><textarea id="' + id + '" class="note-input" rows="3" placeholder="What actually happened?"></textarea>' +
      '<div class="h-actions"><button type="button" class="link-btn" data-act="save-note">Save</button><button type="button" class="link-btn" data-act="cancel-note">Cancel</button></div>';
    $('textarea', box).value = h.note || '';
    $('.h-actions', li).before(box);
    $('textarea', box).focus();
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('button'); if (!btn) return;
      e.stopPropagation();
      if (btn.dataset.act === 'save-note') {
        var text = $('textarea', box).value.trim();
        updateEntry(h.id, function (x) { x.note = text; });
        if (state.entryId === h.id) renderJournal();
        renderHistory();
        $('#history-status').textContent = 'Note saved.';
      } else {
        box.remove();
      }
    });
  }

  function exportHistory() {
    var list = loadHistory();
    var data = { app: 'seventy-eight', version: 1, exported: new Date().toISOString(), readings: list };
    var json = JSON.stringify(data, null, 2);
    var status = $('#history-status');
    try {
      var url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      var a = document.createElement('a');
      a.href = url; a.download = 'tarot-readings-' + localDateKey(new Date()) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    } catch (e) { /* download blocked */ }
    status.innerHTML = 'Exported ' + list.length + (list.length === 1 ? ' reading. ' : ' readings. ') +
      '<button type="button" class="link-btn" id="copy-json-btn">Copy as text instead</button>';
    $('#copy-json-btn').addEventListener('click', function () {
      var done = function (ok) { status.textContent = ok ? 'Copied. Paste it into a text file to keep it.' : 'Copying is blocked in this browser.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(json).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });
  }

  function importHistory(file) {
    var status = $('#history-status');
    var reader = new FileReader();
    reader.onload = function () {
      var parsed;
      try { parsed = JSON.parse(reader.result); } catch (e) { status.textContent = 'That file isn’t valid JSON. Choose a file exported from Seventy-Eight.'; return; }
      var incoming = Array.isArray(parsed) ? parsed : (parsed && parsed.readings);
      if (!Array.isArray(incoming)) { status.textContent = 'No readings found in that file.'; return; }
      var list = loadHistory();
      var byKey = {};
      list.forEach(function (h) { byKey[h.id] = h; });
      var added = 0, merged = 0, skipped = 0;
      incoming.forEach(function (raw) {
        var h = validEntry(raw);
        if (!h) { skipped++; return; }
        var existing = byKey[h.id];
        if (existing) {
          if (!existing.note && h.note) { existing.note = h.note; merged++; }
          return;
        }
        byKey[h.id] = h; list.push(h); added++;
      });
      var ok = saveHistoryList(list);
      renderHistory();
      status.textContent = ok
        ? 'Imported ' + added + (added === 1 ? ' new reading' : ' new readings') + (merged ? ', added ' + merged + (merged === 1 ? ' note' : ' notes') : '') + (skipped ? ', skipped ' + skipped + ' unreadable' : '') + '.'
        : 'The readings could not be saved in this browser.';
    };
    reader.onerror = function () { status.textContent = 'That file could not be read.'; };
    reader.readAsText(file);
  }

  /* ================= modals ================= */

  var modalStack = [];
  function focusables(m) {
    return $$('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select, [tabindex]:not([tabindex="-1"])', m)
      .filter(function (el) { return !el.hidden && el.offsetParent !== null && !el.closest('[hidden]'); });
  }
  function openModal(id) {
    var m = $(id);
    if (modalStack.indexOf(m) !== -1) return;
    modalStack.push({ m: m, ret: document.activeElement });
    m.hidden = false;
    requestAnimationFrame(function () { m.classList.add('is-open'); });
    var close = $('.modal-close', m);
    if (close) close.focus();
  }
  function closeModal(m, keepFocus) {
    var idx = -1;
    modalStack.forEach(function (s, i) { if (s.m === m) idx = i; });
    if (idx === -1) return;
    var ret = modalStack[idx].ret;
    modalStack.splice(idx, 1);
    m.classList.remove('is-open');
    setTimeout(function () { m.hidden = true; }, reduced ? 0 : 200);
    if (!keepFocus && ret && ret.isConnected && ret.focus) ret.focus();
  }
  function topModal() { return modalStack.length ? modalStack[modalStack.length - 1].m : null; }

  // opts: { index (position number), eyebrow }
  function openCardModal(e, pc, opts) {
    opts = opts || {};
    var holder = $('#modal-card');
    holder.innerHTML = '';
    var c = makeCard(e, { flipped: reduced, label: T.art.altText(e.card, e.reversed) });
    holder.appendChild(c);
    if (!reduced) setTimeout(function () { c.classList.add('is-flipped'); }, 60);

    var el = E.ELEMENTS[e.card.element];
    var o = e.reversed ? 'rev' : 'up', other = e.reversed ? 'up' : 'rev';
    var eyebrow = opts.eyebrow || ((opts.index != null ? (opts.index + 1) + ' · ' : '') + pc.position.name);
    $('#modal-text').innerHTML =
      '<p class="eyebrow">' + esc(eyebrow) + '</p>' +
      '<div><h2 id="modal-title">' + esc(e.card.name) + '</h2><p class="orient' + (e.reversed ? ' is-rev' : '') + '">' + (e.reversed ? 'Reversed' : 'Upright') + '</p></div>' +
      (opts.eyebrow ? '' : '<p class="modal-q">' + esc(pc.position.question) + '</p>') +
      '<ul class="facts"><li><span>Arcana</span>' + (e.card.arcana === 'major' ? 'Major · ' + e.card.numeral : 'Minor · ' + T.SUITS[e.card.suit].name) + '</li>' +
      '<li><span>Element</span>' + el.name + '</li><li><span>Astrology</span>' + esc(e.card.astrology) + '</li></ul>' +
      '<p class="keywords">' + esc(e.card.keywords[o].join(' · ')) + '</p>' +
      '<p>' + esc(e.card.meaning[o]) + '</p>' +
      (opts.eyebrow ? '' : '<p class="in-pos muted">' + esc(pc.inPosition) + '</p>') +
      (pc.dignity ? '<p class="dignity dignity-' + pc.dignity.state + '"><span class="dignity-tag">' + DIGNITY_LABEL[pc.dignity.state] + '.</span>' + esc(pc.dignityText) + '</p>' : '') +
      '<p class="other-way"><strong>' + (e.reversed ? 'Upright' : 'Reversed') + ', it would mean:</strong> ' + esc(e.card.meaning[other]) + '</p>';
    openModal('#card-modal');
  }

  /* ================= flow ================= */

  function prepTable() {
    var reading = $('#reading');
    reading.hidden = true;
    reading.innerHTML = '';
    reading.classList.remove('is-standalone');
    $('#fan-wrap').hidden = true;
    var cap = $('#reveal-caption');
    cap.classList.remove('is-shown');
    cap.innerHTML = '';
    $('#deck-zone').classList.remove('is-dealt');
    $('#layout').classList.remove('is-visible');
    $('#table-question').textContent = (state.question ? '“' + state.question + '”' : 'General reading') + ' · ' + state.spread.name;
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
    state.entryId = null;
    state.source = 'live';
    state.date = Date.now();
    state.busy = false;
    clearHash();
    showStage('table');
    prepTable();
    enterShuffle();
    var b = $('#riffle-btn'); if (b) b.focus({ preventScroll: true });
  }

  function onAsk(ev) {
    ev.preventDefault();
    var id = ($('input[name="spread"]:checked') || {}).value || 'three';
    state.spread = spreadById[id] || spreadById.three;
    state.question = $('#question').value.trim();
    state.opts = { reversals: $('#opt-reversals').checked, dignities: $('#opt-dignities').checked };
    store.set('78-spread', id);
    startTable();
  }

  function routeFromHash() {
    var h = location.hash.slice(1);
    if (h.indexOf(T.share.PREFIX) === 0) return openFromToken(h);
    return false;
  }

  function init() {
    renderSpreadList();
    renderDaily();

    $('#ask-form').addEventListener('submit', onAsk);
    $('#home-link').addEventListener('click', function (e) { e.preventDefault(); showStage('ask'); });
    $('#daily-btn').addEventListener('click', function () { revealDaily(); });

    var snd = $('#sound-toggle');
    var syncSound = function () {
      snd.setAttribute('aria-pressed', fx.sound.enabled ? 'true' : 'false');
      snd.setAttribute('aria-label', fx.sound.enabled ? 'Sound on' : 'Sound off');
      snd.title = fx.sound.enabled ? 'Sound on' : 'Sound off';
    };
    snd.addEventListener('click', function () { fx.sound.enabled = !fx.sound.enabled; syncSound(); if (fx.sound.enabled) fx.sound.place(); });
    syncSound();

    $('#history-btn').addEventListener('click', function () { $('#history-status').textContent = ''; renderHistory(); openModal('#history-modal'); });
    $('#export-btn').addEventListener('click', exportHistory);
    $('#import-input').addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) importHistory(f);
      e.target.value = '';
    });

    $$('.modal').forEach(function (m) {
      m.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(m); });
    });
    document.addEventListener('keydown', function (e) {
      var m = topModal();
      if (!m) return;
      if (e.key === 'Escape') { e.preventDefault(); closeModal(m); return; }
      if (e.key === 'Tab') {
        var f = focusables(m);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || !m.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || !m.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
      }
    });

    window.addEventListener('hashchange', routeFromHash);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (!state.spread || ['shuffle', 'cut', 'draw', 'reveal'].indexOf(state.phase) === -1) return;
        placeSlots(state.phase);
        if (state.phase === 'draw') layoutFan();
      }, 120);
    });

    routeFromHash();
  }

  init();
})();
