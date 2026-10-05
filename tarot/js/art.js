/* Card art.
 * Faces are the 1909 Rider–Waite–Smith illustrations by Pamela Colman Smith
 * (public domain), stored in assets/cards/. If an image fails to load, the
 * card falls back to a procedurally drawn SVG face built from the card data. */
(function () {
  'use strict';

  var T = window.Tarot;
  var W = 200, H = 330;

  var PALETTE = {
    paper: '#F3EEE3',
    ink: '#1C1B19',
    soft: '#5F5A52',
    brass: '#B8975A',
    fire: '#9A4A3A',
    water: '#3E5A6B',
    air: '#8A7A4E',
    earth: '#55654A'
  };
  var SERIF = 'Cormorant Garamond, Cormorant, Garamond, Times New Roman, serif';

  /* ---------- image paths ---------- */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function slug(name) { return name.replace(/^The /, '').toLowerCase().replace(/[^a-z]+/g, '-'); }
  function imageUrl(card) {
    var file = card.arcana === 'major'
      ? 'major-' + pad2(card.number) + '-' + slug(card.name)
      : card.suit + '-' + pad2(card.rank);
    return 'assets/cards/' + file + '.webp';
  }
  function altText(card, reversed) {
    return card.name + (reversed ? ', reversed' : '') + ' (Rider–Waite–Smith illustration)';
  }

  /* ---------- fallback faces ---------- */

  function wand(c) {
    return '<rect x="-2.5" y="-23" width="5" height="46" rx="2.5" fill="' + c + '"/>' +
      '<ellipse cx="7" cy="-13" rx="5" ry="2" transform="rotate(-35 7 -13)" fill="' + PALETTE.earth + '"/>' +
      '<ellipse cx="-7" cy="-2" rx="5" ry="2" transform="rotate(35 -7 -2)" fill="' + PALETTE.earth + '"/>' +
      '<ellipse cx="7" cy="9" rx="4.6" ry="1.9" transform="rotate(-35 7 9)" fill="' + PALETTE.earth + '"/>';
  }
  function cup(c) {
    return '<path d="M-14 -20 H14 Q14 -1 2 2 L2 12 Q2 15 9 18 L9 21 H-9 L-9 18 Q-2 15 -2 12 L-2 2 Q-14 -1 -14 -20Z" fill="none" stroke="' + c + '" stroke-width="2"/>';
  }
  function sword(c) {
    return '<path d="M0 -25 L3.2 -17 L3.2 10 L-3.2 10 L-3.2 -17Z" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
      '<path d="M-11 12 H11" stroke="' + c + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M0 14 V23" stroke="' + c + '" stroke-width="3"/>';
  }
  function starPoints(r1, r2, n) {
    var pts = [];
    for (var i = 0; i < n * 2; i++) {
      var r = i % 2 ? r2 : r1;
      var a = -Math.PI / 2 + i * Math.PI / n;
      pts.push((r * Math.cos(a)).toFixed(2) + ',' + (r * Math.sin(a)).toFixed(2));
    }
    return pts.join(' ');
  }
  function pentacle(c) {
    return '<circle r="17" fill="none" stroke="' + c + '" stroke-width="1.8"/>' +
      '<polygon points="' + starPoints(13, 5.2, 5) + '" fill="none" stroke="' + c + '" stroke-width="1.5" stroke-linejoin="round"/>';
  }
  var EMBLEM = { wands: wand, cups: cup, swords: sword, pentacles: pentacle };

  function elementSign(el, x, y, color) {
    var up = el === 'fire' || el === 'air';
    var d = up ? 'M0 -6 L5.5 4 L-5.5 4Z' : 'M0 6 L5.5 -4 L-5.5 -4Z';
    var bar = (el === 'air' || el === 'earth') ? '<path d="M-4 0 H4" stroke="' + color + '" stroke-width="1"/>' : '';
    return '<g transform="translate(' + x + ' ' + y + ')"><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="1" stroke-linejoin="round"/>' + bar + '</g>';
  }

  var PIPS = {
    1: [[100, 158]],
    2: [[100, 104], [100, 212]],
    3: [[100, 92], [100, 158], [100, 224]],
    4: [[68, 104], [132, 104], [68, 212], [132, 212]],
    5: [[68, 98], [132, 98], [100, 158], [68, 218], [132, 218]],
    6: [[68, 92], [132, 92], [68, 158], [132, 158], [68, 224], [132, 224]],
    7: [[68, 90], [132, 90], [100, 124], [68, 158], [132, 158], [68, 226], [132, 226]],
    8: [[68, 88], [132, 88], [100, 122], [68, 158], [132, 158], [100, 194], [68, 228], [132, 228]],
    9: [[68, 86], [132, 86], [68, 134], [132, 134], [100, 158], [68, 182], [132, 182], [68, 230], [132, 230]],
    10: [[68, 86], [132, 86], [100, 110], [68, 134], [132, 134], [68, 182], [132, 182], [100, 206], [68, 230], [132, 230]]
  };

  var COURT_LETTER = { 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function text(x, y, size, s, opts) {
    opts = opts || {};
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="' + SERIF + '" font-size="' + size + '"' +
      (opts.italic ? ' font-style="italic"' : '') + ' fill="' + (opts.fill || PALETTE.ink) + '">' + esc(s) + '</text>';
  }

  function face(card) {
    var c = card.arcana === 'major' ? PALETTE.ink : PALETTE[card.element];
    var body = '';
    if (card.arcana === 'major') {
      body = '<circle cx="100" cy="158" r="50" fill="' + PALETTE.ink + '"/>' +
        '<circle cx="100" cy="158" r="56" fill="none" stroke="' + PALETTE.brass + '" stroke-width="1"/>' +
        '<text x="100" y="176" text-anchor="middle" font-family="Segoe UI Symbol, Noto Sans Symbols, Apple Symbols, DejaVu Sans, serif" font-size="48" fill="' + PALETTE.paper + '">' + card.glyph + '︎</text>' +
        text(100, 240, 13, card.astrology, { italic: true, fill: PALETTE.soft });
    } else if (card.court) {
      body = '<g transform="translate(100 150) scale(2)">' + EMBLEM[card.suit](c) + '</g>' +
        text(100, 240, 13, card.astrology, { italic: true, fill: PALETTE.soft });
    } else {
      var scale = card.rank === 1 ? 2.2 : (card.rank >= 9 ? 0.85 : 0.95);
      PIPS[card.rank].forEach(function (p) {
        var flip = card.rank > 1 && p[1] > 170 ? ' rotate(180)' : '';
        body += '<g transform="translate(' + p[0] + ' ' + p[1] + ') scale(' + scale + ')' + flip + '">' + EMBLEM[card.suit](c) + '</g>';
      });
    }
    var size = card.name.length > 17 ? 17 : 19;
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(card.name) + '">' +
      '<rect x=".75" y=".75" width="' + (W - 1.5) + '" height="' + (H - 1.5) + '" rx="10" fill="' + PALETTE.paper + '" stroke="' + PALETTE.ink + '" stroke-width="1.5"/>' +
      text(100, 40, 22, card.arcana === 'major' ? card.numeral : (card.court ? COURT_LETTER[card.rank] : card.numeral)) +
      elementSign(card.element, 28, 33, c) + elementSign(card.element, 172, 33, c) +
      body +
      '<path d="M40 280 H160" stroke="' + PALETTE.ink + '" stroke-width=".75"/>' +
      text(100, 304, size, card.name) +
      '</svg>';
    return svg;
  }

  function faceDataUrl(card) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(face(card));
  }

  /* ---------- card back: rotationally symmetric, so reversals stay hidden ---------- */

  var BACK_COLOR = '#0E0E0F';
  function backSvg() {
    var line = PALETTE.brass;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 330">' +
      '<rect width="200" height="330" fill="' + BACK_COLOR + '"/>' +
      '<rect x="12" y="12" width="176" height="306" rx="4" fill="none" stroke="' + line + '" stroke-width="1"/>' +
      '<circle cx="100" cy="165" r="44" fill="none" stroke="' + line + '" stroke-width="1"/>' +
      '<rect x="72" y="137" width="56" height="56" fill="none" stroke="' + line + '" stroke-width="1"/>' +
      '<rect x="72" y="137" width="56" height="56" fill="none" stroke="' + line + '" stroke-width="1" transform="rotate(45 100 165)"/>' +
      '<circle cx="100" cy="165" r="6" fill="none" stroke="' + line + '" stroke-width="1"/>' +
      '<path d="M100 24 V99 M100 231 V306" stroke="' + line + '" stroke-width="1"/>' +
      '</svg>';
  }
  var backUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(backSvg());

  T.art = {
    face: face,
    faceDataUrl: faceDataUrl,
    imageUrl: imageUrl,
    altText: altText,
    back: 'url("' + backUrl + '")'
  };
})();
