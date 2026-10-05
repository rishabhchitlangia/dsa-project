/* Ambient effects: a drifting starfield, a sparkle trail that follows the
 * pointer over cards, bursts when a card turns, and synthesised sound
 * (no audio files: everything is generated with the Web Audio API). */
(function () {
  'use strict';

  var T = window.Tarot;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- starfield ---------- */

  var sky = document.getElementById('sky');
  var sctx = sky.getContext('2d');
  var stars = [];
  var shooting = null;
  var dpr = 1, sw = 0, sh = 0;
  var pointer = { x: 0.5, y: 0.5 };

  function sizeSky() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    sw = window.innerWidth; sh = window.innerHeight;
    [sky, sparkCanvas].forEach(function (c) {
      c.width = sw * dpr; c.height = sh * dpr;
      c.style.width = sw + 'px'; c.style.height = sh + 'px';
    });
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.round(sw * sh / 4200);
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * sw,
        y: Math.random() * sh,
        r: Math.random() * 1.2 + 0.2,
        depth: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.6,
        warm: Math.random() < 0.18
      });
    }
    if (reduced) drawSky(0);
  }

  function drawSky(t) {
    sctx.clearRect(0, 0, sw, sh);
    var ox = (pointer.x - 0.5) * 18, oy = (pointer.y - 0.5) * 12;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
      var x = (s.x + ox * s.depth + t * 0.004 * s.depth) % sw;
      var y = s.y + oy * s.depth;
      sctx.globalAlpha = tw * (0.35 + s.depth * 0.65);
      sctx.fillStyle = s.warm ? '#f0d79a' : '#dcd8f5';
      sctx.beginPath();
      sctx.arc(x, y, s.r, 0, Math.PI * 2);
      sctx.fill();
    }
    sctx.globalAlpha = 1;

    if (!reduced) {
      if (!shooting && Math.random() < 0.0016) {
        shooting = { x: Math.random() * sw * 0.7, y: Math.random() * sh * 0.35, vx: 7 + Math.random() * 4, vy: 2.4 + Math.random() * 2, life: 1 };
      }
      if (shooting) {
        var g = sctx.createLinearGradient(shooting.x, shooting.y, shooting.x - shooting.vx * 14, shooting.y - shooting.vy * 14);
        g.addColorStop(0, 'rgba(240,215,154,' + shooting.life + ')');
        g.addColorStop(1, 'rgba(240,215,154,0)');
        sctx.strokeStyle = g;
        sctx.lineWidth = 1.4;
        sctx.beginPath();
        sctx.moveTo(shooting.x, shooting.y);
        sctx.lineTo(shooting.x - shooting.vx * 14, shooting.y - shooting.vy * 14);
        sctx.stroke();
        shooting.x += shooting.vx; shooting.y += shooting.vy; shooting.life -= 0.012;
        if (shooting.life <= 0) shooting = null;
      }
    }
  }

  /* ---------- sparks ---------- */

  var sparkCanvas = document.getElementById('sparks');
  var pctx = sparkCanvas.getContext('2d');
  var sparks = [];

  function addSpark(x, y, opts) {
    opts = opts || {};
    var a = opts.angle != null ? opts.angle : Math.random() * Math.PI * 2;
    var v = opts.speed != null ? opts.speed : Math.random() * 0.8;
    sparks.push({
      x: x, y: y,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - (opts.lift || 0.2),
      life: 1, decay: opts.decay || (0.012 + Math.random() * 0.02),
      r: opts.r || (Math.random() * 1.6 + 0.6),
      color: opts.color || (Math.random() < 0.7 ? '240,215,154' : '220,205,255')
    });
    if (sparks.length > 500) sparks.splice(0, sparks.length - 500);
  }

  function burst(x, y, n, color) {
    if (reduced) return;
    for (var i = 0; i < (n || 40); i++) {
      addSpark(x, y, { speed: 1 + Math.random() * 3.4, decay: 0.012 + Math.random() * 0.016, lift: 0.3, r: Math.random() * 2 + 0.6, color: color });
    }
  }

  function drawSparks() {
    pctx.clearRect(0, 0, sw, sh);
    for (var i = sparks.length - 1; i >= 0; i--) {
      var p = sparks[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.vx *= 0.98;
      p.life -= p.decay;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      pctx.fillStyle = 'rgba(' + p.color + ',' + p.life.toFixed(3) + ')';
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r * (0.6 + p.life * 0.4), 0, Math.PI * 2);
      pctx.fill();
    }
  }

  var lastTrail = 0;
  window.addEventListener('pointermove', function (e) {
    pointer.x = e.clientX / sw; pointer.y = e.clientY / sh;
    if (reduced || e.pointerType === 'touch') return;
    var now = performance.now();
    if (now - lastTrail < 24) return;
    lastTrail = now;
    if (e.target.closest && e.target.closest('.tcard, .primary-btn, .spread-option')) {
      addSpark(e.clientX, e.clientY, { speed: 0.4, lift: 0.4 });
    }
  }, { passive: true });

  function loop(t) {
    drawSky(t);
    drawSparks();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', sizeSky);
  sizeSky();
  if (!reduced) requestAnimationFrame(loop);
  else {
    // Still run the spark layer so bursts can be cleared; the sky stays static.
    (function sparkOnly() { drawSparks(); requestAnimationFrame(sparkOnly); })();
  }

  /* ---------- sound ---------- */

  var actx = null;
  var enabled = true;
  try { enabled = localStorage.getItem('78-sound') !== 'off'; } catch (e) { /* storage blocked */ }

  function ctx() {
    if (!enabled) return null;
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  function noise(duration, freq, gain, q) {
    var c = ctx(); if (!c) return;
    var len = Math.floor(c.sampleRate * duration);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || 0.8;
    var g = c.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start();
  }

  function tone(freq, start, duration, gain, type) {
    var c = ctx(); if (!c) return;
    var t0 = c.currentTime + (start || 0);
    var o = c.createOscillator(); o.type = type || 'sine'; o.frequency.value = freq;
    var g = c.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + duration + 0.05);
  }

  var sound = {
    shuffle: function () {
      for (var i = 0; i < 14; i++) setTimeout(function () { noise(0.05, 2400 + Math.random() * 1800, 0.12, 1.2); }, i * 42 + Math.random() * 20);
    },
    cut: function () { noise(0.12, 900, 0.2, 0.7); },
    place: function () { noise(0.09, 1400, 0.16, 0.9); },
    pick: function () { noise(0.22, 3200, 0.06, 0.5); },
    flip: function (major) {
      var base = major ? 392 : 523.25;
      tone(base, 0, 1.6, 0.07);
      tone(base * 1.5, 0.04, 1.4, 0.04);
      tone(base * 2.01, 0.08, 1.1, 0.025);
      if (major) tone(base / 2, 0, 2.2, 0.06, 'triangle');
    },
    chord: function () {
      [261.63, 329.63, 392, 523.25].forEach(function (f, i) { tone(f, i * 0.12, 2.6, 0.05); });
    },
    get enabled() { return enabled; },
    set enabled(v) {
      enabled = v;
      try { localStorage.setItem('78-sound', v ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
    }
  };

  T.fx = { burst: burst, addSpark: addSpark, sound: sound, reduced: reduced };
})();
