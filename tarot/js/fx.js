/* Sound, synthesised with the Web Audio API (no audio files).
 * Off by default; the toggle in the top bar turns it on. Nothing here runs
 * until a sound is actually played, so there is no idle work. */
(function () {
  'use strict';

  var T = window.Tarot;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var actx = null;
  var enabled = false;
  try { enabled = localStorage.getItem('78-sound') === 'on'; } catch (e) { /* storage blocked */ }

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
      if (!enabled) return;
      for (var i = 0; i < 10; i++) setTimeout(function () { noise(0.05, 2400 + Math.random() * 1800, 0.1, 1.2); }, i * 36 + Math.random() * 16);
    },
    cut: function () { noise(0.12, 900, 0.18, 0.7); },
    place: function () { noise(0.08, 1400, 0.14, 0.9); },
    pick: function () { noise(0.18, 3200, 0.05, 0.5); },
    flip: function (major) {
      var base = major ? 392 : 523.25;
      tone(base, 0, 1.2, 0.05);
      tone(base * 1.5, 0.03, 1, 0.025);
    },
    chord: function () {
      [261.63, 329.63, 392].forEach(function (f, i) { tone(f, i * 0.1, 2, 0.035); });
    },
    get enabled() { return enabled; },
    set enabled(v) {
      enabled = v;
      try { localStorage.setItem('78-sound', v ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
    }
  };

  T.fx = { sound: sound, reduced: reduced };
})();
