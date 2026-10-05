/* Sharing: encode a finished reading into a URL hash, and render a reading
 * to a PNG. The hash uses only letters, digits, "-", "_" and "." so it
 * survives hosts that strip anything else from fragments. */
(function () {
  'use strict';

  var T = window.Tarot;
  var PREFIX = 'r1.';

  /* ---------- link ---------- */

  function b64urlEncode(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  var indexById = {};
  T.DECK.forEach(function (c, i) { indexById[c.id] = i; });

  // reading: { spreadId, question, opts: {reversals, dignities}, cards: [[cardId, reversed]], date }
  function encode(reading) {
    var payload = {
      s: reading.spreadId,
      q: reading.question || '',
      o: [reading.opts.reversals ? 1 : 0, reading.opts.dignities ? 1 : 0],
      c: reading.cards.map(function (c) { return [indexById[c[0]], c[1] ? 1 : 0]; }),
      d: Math.round(reading.date / 1000)
    };
    return PREFIX + b64urlEncode(JSON.stringify(payload));
  }

  function decode(token) {
    if (!token || token.indexOf(PREFIX) !== 0) return null;
    try {
      var p = JSON.parse(b64urlDecode(token.slice(PREFIX.length)));
      var spread = T.SPREADS.filter(function (s) { return s.id === p.s; })[0];
      if (!spread || !Array.isArray(p.c) || p.c.length !== spread.positions.length) return null;
      var seen = {};
      var cards = p.c.map(function (c) {
        var card = T.DECK[c[0]];
        if (!card || seen[card.id]) throw new Error('bad card');
        seen[card.id] = true;
        return [card.id, c[1] ? 1 : 0];
      });
      return {
        spreadId: spread.id,
        question: String(p.q || '').slice(0, 240),
        opts: { reversals: !!(p.o && p.o[0]), dignities: !!(p.o && p.o[1]) },
        cards: cards,
        date: (Number(p.d) || Math.round(Date.now() / 1000)) * 1000
      };
    } catch (e) {
      return null;
    }
  }

  /* ---------- image ---------- */

  var C = {
    bg: '#0E0E0F', text: '#ECE6DA', muted: '#8F8A80', hairline: '#2A2A2C',
    accent: '#B8975A', paper: '#F3EEE3', ink: '#1C1B19'
  };
  var SERIF = '"Cormorant Garamond", Garamond, "Times New Roman", serif';
  var SANS = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function loadFaces(drawn, useFallback) {
    return Promise.all(drawn.map(function (d) {
      if (useFallback) return loadImage(T.art.faceDataUrl(d.card));
      return loadImage(T.art.imageUrl(d.card)).then(function (img) {
        return img || loadImage(T.art.faceDataUrl(d.card));
      });
    }));
  }

  function wrap(ctx, text, maxW) {
    var words = String(text).split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCard(ctx, img, cx, cy, w, rotate, reversed) {
    var h = w * T.CARD_RATIO;
    ctx.save();
    ctx.translate(cx, cy);
    if (rotate) ctx.rotate(Math.PI / 2);
    ctx.shadowColor = 'rgba(0,0,0,.35)';
    ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    roundRect(ctx, -w / 2, -h / 2, w, h, 7);
    ctx.fillStyle = C.paper; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1; ctx.strokeStyle = C.ink; ctx.stroke();
    if (img) {
      var pad = w * 0.04;
      var bw = w - pad * 2, bh = h - pad * 2;
      var ir = img.naturalHeight / img.naturalWidth || T.CARD_RATIO;
      var dw = bw, dh = bw * ir;
      if (dh > bh) { dh = bh; dw = bh / ir; }
      if (reversed) ctx.rotate(Math.PI);
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    }
    ctx.restore();
  }

  function paint(canvas, data, faces) {
    var W = 1200, P = 80, inner = W - P * 2;
    var ctx = canvas.getContext('2d');
    var spread = data.spread;

    // Measure first so the canvas can be sized to its content.
    ctx.font = '500 20px ' + SANS;
    ctx.font = 'italic 400 60px ' + SERIF;
    var qLines = wrap(ctx, data.question ? '“' + data.question + '”' : 'General reading', inner);
    ctx.font = '400 26px ' + SANS;
    var sLines = wrap(ctx, data.summary.join(' '), inner);

    var box = { w: 0, h: 0 };
    spread.positions.forEach(function (p) { box.w = Math.max(box.w, p.x + 1); box.h = Math.max(box.h, p.y + T.CARD_RATIO); });
    var cw = Math.min(inner / box.w, 560 / box.h, 190);
    var spreadH = box.h * cw;

    var listRows = Math.ceil(data.drawn.length / 2);
    var H = P + 30 + 24 + qLines.length * 66 + 40 + spreadH + 56 + sLines.length * 40 + 40 + listRows * 34 + 40 + 40 + P / 2;

    canvas.width = W; canvas.height = Math.ceil(H);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'alphabetic';

    var y = P;
    ctx.fillStyle = C.muted; ctx.font = '500 20px ' + SANS;
    ctx.fillText('Seventy-Eight  ·  ' + spread.name + '  ·  ' + new Date(data.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }), P, y + 20);
    y += 30 + 24;

    ctx.fillStyle = C.text; ctx.font = 'italic 400 60px ' + SERIF;
    qLines.forEach(function (l) { y += 60; ctx.fillText(l, P, y); y += 6; });
    y += 40;

    var ox = P + (inner - box.w * cw) / 2;
    spread.positions.forEach(function (p, i) {
      var cx = ox + (p.x + 0.5) * cw, cy = y + (p.y + T.CARD_RATIO / 2) * cw;
      drawCard(ctx, faces[i], cx, cy, cw, !!p.crossing, data.drawn[i].reversed);
    });
    y += spreadH + 56;

    ctx.fillStyle = C.hairline; ctx.fillRect(P, y - 28, inner, 1);
    ctx.fillStyle = C.text; ctx.font = '400 26px ' + SANS;
    sLines.forEach(function (l) { y += 30; ctx.fillText(l, P, y); y += 10; });
    y += 40;

    ctx.font = '400 19px ' + SANS;
    var colW = inner / 2;
    data.drawn.forEach(function (d, i) {
      var col = i < listRows ? 0 : 1, row = i < listRows ? i : i - listRows;
      var x = P + col * colW, ly = y + row * 34;
      ctx.fillStyle = C.accent; ctx.fillText(String(i + 1), x, ly);
      ctx.fillStyle = C.muted; ctx.fillText(spread.positions[i].name, x + 36, ly);
      var nameX = x + 36 + ctx.measureText(spread.positions[i].name + '  ').width;
      ctx.fillStyle = C.text;
      var label = d.card.name + (d.reversed ? ' (reversed)' : '');
      var room = colW - (nameX - x) - 16;
      if (ctx.measureText(label).width > room) {
        while (ctx.measureText(label + '…').width > room && label.length > 4) label = label.slice(0, -1);
        label = label.replace(/[\s(]+$/, '') + '…';
      }
      ctx.fillText(label, nameX, ly);
    });
    y += listRows * 34 + 40;

    ctx.fillStyle = C.hairline; ctx.fillRect(P, y - 24, inner, 1);
    ctx.fillStyle = C.muted; ctx.font = '400 17px ' + SANS;
    ctx.fillText('Card images: Rider–Waite–Smith tarot, illustrated by Pamela Colman Smith, 1909.', P, y + 8);
  }

  function toBlob(canvas) {
    return new Promise(function (resolve, reject) {
      try {
        canvas.toBlob(function (b) { b ? resolve(b) : reject(new Error('empty')); }, 'image/png');
      } catch (e) { reject(e); }
    });
  }

  // data: { spread, question, drawn: [{card, reversed}], summary: [sentences], date }
  function renderImage(data) {
    var fontsReady = document.fonts && document.fonts.load
      ? Promise.all([
        document.fonts.load('italic 400 60px "Cormorant Garamond"'),
        document.fonts.load('400 26px Inter'),
        document.fonts.load('500 20px Inter')
      ]).catch(function () {})
      : Promise.resolve();

    var canvas = document.createElement('canvas');
    return fontsReady.then(function () { return loadFaces(data.drawn, false); }).then(function (faces) {
      paint(canvas, data, faces);
      return toBlob(canvas).catch(function () {
        // Opened from disk (file://), the photos taint the canvas. Redraw with the vector faces.
        return loadFaces(data.drawn, true).then(function (svgFaces) {
          paint(canvas, data, svgFaces);
          return toBlob(canvas);
        });
      });
    });
  }

  T.share = { encode: encode, decode: decode, renderImage: renderImage, PREFIX: PREFIX };
})();
