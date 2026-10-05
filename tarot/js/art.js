/* Procedural card art. Every face is an SVG built from the card's data:
 * Majors get their astrological glyph in a rayed medallion, pip cards get
 * the right number of suit emblems in a traditional pip layout, and court
 * cards get a rank emblem over a large suit emblem. */
(function () {
  'use strict';

  var T = window.Tarot;
  var W = 200, H = 330;

  var PALETTE = {
    paper: '#efe5cd',
    paperEdge: '#d9c9a3',
    ink: '#241d38',
    gilt: '#b98f35',
    fire: '#b5452b',
    water: '#2e5f7d',
    air: '#b8892a',
    earth: '#4d6b3b',
    major: '#3b2d6b'
  };

  /* ---------- suit emblems, drawn around (0,0), about 44 units tall ---------- */

  function wand(c) {
    return '<g>' +
      '<rect x="-3" y="-23" width="6" height="46" rx="3" fill="' + c + '"/>' +
      '<ellipse cx="7" cy="-13" rx="5.5" ry="2.4" transform="rotate(-35 7 -13)" fill="' + PALETTE.earth + '"/>' +
      '<ellipse cx="-7" cy="-3" rx="5.5" ry="2.4" transform="rotate(35 -7 -3)" fill="' + PALETTE.earth + '"/>' +
      '<ellipse cx="7" cy="8" rx="5" ry="2.2" transform="rotate(-35 7 8)" fill="' + PALETTE.earth + '"/>' +
      '<circle cx="0" cy="-23" r="3.6" fill="' + PALETTE.gilt + '"/>' +
      '</g>';
  }
  function cup(c) {
    return '<g>' +
      '<path d="M-15 -21 H15 Q15 -1 2 2 L2 12 Q2 15 9 18 L9 21 H-9 L-9 18 Q-2 15 -2 12 L-2 2 Q-15 -1 -15 -21Z" fill="' + c + '"/>' +
      '<path d="M-12 -18 H12" stroke="' + PALETTE.gilt + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="0" cy="-8" r="2.6" fill="' + PALETTE.gilt + '"/>' +
      '</g>';
  }
  function sword(c) {
    return '<g>' +
      '<path d="M0 -25 L3.6 -17 L3.6 10 L-3.6 10 L-3.6 -17Z" fill="#8d93a6" stroke="' + c + '" stroke-width="1.6"/>' +
      '<path d="M0 -20 V8" stroke="#dfe3ec" stroke-width="1"/>' +
      '<rect x="-12" y="10" width="24" height="4" rx="2" fill="' + PALETTE.gilt + '"/>' +
      '<rect x="-2.4" y="14" width="4.8" height="8" fill="' + c + '"/>' +
      '<circle cx="0" cy="24" r="3" fill="' + PALETTE.gilt + '"/>' +
      '</g>';
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
    return '<g>' +
      '<circle r="19" fill="' + PALETTE.gilt + '"/>' +
      '<circle r="15.5" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
      '<polygon points="' + starPoints(14, 5.6, 5) + '" fill="none" stroke="' + c + '" stroke-width="1.8" stroke-linejoin="round"/>' +
      '</g>';
  }
  var EMBLEM = { wands: wand, cups: cup, swords: sword, pentacles: pentacle };

  /* ---------- element signs (alchemical triangles) ---------- */

  function elementSign(el, x, y, s, color) {
    var up = el === 'fire' || el === 'air';
    var d = up ? 'M0 -8 L7 5 L-7 5Z' : 'M0 8 L7 -5 L-7 -5Z';
    var bar = (el === 'air' || el === 'earth') ? '<path d="M-5.5 ' + (up ? '0' : '0') + ' H5.5" stroke="' + color + '" stroke-width="1.4"/>' : '';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.4" stroke-linejoin="round"/>' + bar + '</g>';
  }

  /* ---------- pip layouts ---------- */

  var PIPS = {
    1: [[100, 158]],
    2: [[100, 100], [100, 216]],
    3: [[100, 88], [100, 158], [100, 228]],
    4: [[66, 100], [134, 100], [66, 216], [134, 216]],
    5: [[66, 96], [134, 96], [100, 158], [66, 220], [134, 220]],
    6: [[66, 88], [134, 88], [66, 158], [134, 158], [66, 228], [134, 228]],
    7: [[66, 86], [134, 86], [100, 122], [66, 158], [134, 158], [66, 230], [134, 230]],
    8: [[66, 84], [134, 84], [100, 120], [66, 158], [134, 158], [100, 196], [66, 232], [134, 232]],
    9: [[66, 82], [134, 82], [66, 132], [134, 132], [100, 158], [66, 184], [134, 184], [66, 234], [134, 234]],
    10: [[66, 82], [134, 82], [100, 107], [66, 132], [134, 132], [66, 184], [134, 184], [100, 209], [66, 234], [134, 234]]
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function frame(accent) {
    return '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="12" fill="' + PALETTE.paper + '"/>' +
      '<rect x="7" y="7" width="' + (W - 14) + '" height="' + (H - 14) + '" rx="8" fill="none" stroke="' + PALETTE.ink + '" stroke-width="2"/>' +
      '<rect x="12" y="12" width="' + (W - 24) + '" height="' + (H - 24) + '" rx="5" fill="none" stroke="' + accent + '" stroke-width="1"/>';
  }

  function header(card, accent) {
    return '<text x="100" y="40" text-anchor="middle" font-family="IM Fell English SC, Georgia, serif" font-size="22" fill="' + PALETTE.ink + '">' + esc(card.numeral) + '</text>' +
      elementSign(card.element, 30, 33, 0.9, accent) + elementSign(card.element, 170, 33, 0.9, accent);
  }

  function banner(card, accent) {
    var name = card.name;
    var size = name.length > 17 ? 13.5 : 15.5;
    return '<path d="M22 282 H178 L170 293 L178 304 H22 L30 293Z" fill="' + PALETTE.paperEdge + '" stroke="' + PALETTE.ink + '" stroke-width="1"/>' +
      '<text x="100" y="298" text-anchor="middle" font-family="IM Fell English SC, Georgia, serif" font-size="' + size + '" fill="' + PALETTE.ink + '">' + esc(name) + '</text>';
  }

  function majorArt(card) {
    var c = PALETTE[card.element];
    var rays = '';
    for (var i = 0; i < 32; i++) {
      var a = i * Math.PI / 16;
      var r1 = 66, r2 = i % 2 ? 84 : 96;
      rays += '<line x1="' + (100 + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (160 + r1 * Math.sin(a)).toFixed(1) +
        '" x2="' + (100 + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (160 + r2 * Math.sin(a)).toFixed(1) +
        '" stroke="' + (i % 2 ? PALETTE.gilt : c) + '" stroke-width="' + (i % 2 ? 1.2 : 2) + '" stroke-linecap="round"/>';
    }
    var stars = '';
    [[40, 80], [160, 80], [44, 244], [156, 244]].forEach(function (p) {
      stars += '<polygon transform="translate(' + p[0] + ' ' + p[1] + ')" points="' + starPoints(5, 1.8, 4) + '" fill="' + PALETTE.gilt + '"/>';
    });
    return rays + stars +
      '<circle cx="100" cy="160" r="60" fill="' + PALETTE.major + '"/>' +
      '<circle cx="100" cy="160" r="54" fill="none" stroke="' + PALETTE.gilt + '" stroke-width="1.2"/>' +
      '<text x="100" y="181" text-anchor="middle" font-family="Segoe UI Symbol, Noto Sans Symbols, Apple Symbols, DejaVu Sans, serif" font-size="58" fill="' + PALETTE.paper + '">' + card.glyph + '︎</text>' +
      '<text x="100" y="262" text-anchor="middle" font-family="Spectral, Georgia, serif" font-style="italic" font-size="12" fill="' + PALETTE.ink + '" opacity=".75">' + esc(card.astrology) + '</text>';
  }

  function pipArt(card) {
    var c = PALETTE[card.element];
    var emblem = EMBLEM[card.suit];
    var scale = card.rank === 1 ? 2.3 : (card.rank >= 9 ? 0.9 : 1);
    var out = '';
    if (card.rank === 1) {
      out += '<circle cx="100" cy="158" r="74" fill="none" stroke="' + PALETTE.gilt + '" stroke-width="1" stroke-dasharray="2 5"/>';
    }
    PIPS[card.rank].forEach(function (p, i) {
      // Pips in the lower half are turned, as on traditional cards.
      var flip = card.rank > 1 && p[1] > 170 ? ' rotate(180)' : '';
      out += '<g transform="translate(' + p[0] + ' ' + p[1] + ') scale(' + scale + ')' + flip + '">' + emblem(c) + '</g>';
    });
    out += '<text x="100" y="270" text-anchor="middle" font-family="Spectral, Georgia, serif" font-style="italic" font-size="11" fill="' + PALETTE.ink + '" opacity=".7">' + esc(card.astrology) + '</text>';
    return out;
  }

  var COURT_EMBLEM = {
    11: function (c) { // Page: a scroll
      return '<path d="M-22 -8 H18 Q24 -8 24 -2 Q24 4 18 4 H-22 Q-28 4 -28 -2 Q-28 -8 -22 -8Z" fill="' + PALETTE.paperEdge + '" stroke="' + c + '" stroke-width="1.6"/>' +
        '<path d="M-16 -2 H14" stroke="' + c + '" stroke-width="1" stroke-dasharray="3 2"/>';
    },
    12: function (c) { // Knight: a helm
      return '<path d="M-18 10 V-4 Q-18 -20 0 -20 Q18 -20 18 -4 V10Z" fill="' + c + '"/>' +
        '<path d="M-12 -4 H12" stroke="' + PALETTE.paper + '" stroke-width="2.4"/>' +
        '<path d="M0 -20 Q6 -32 16 -30" stroke="' + PALETTE.gilt + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
    },
    13: function (c) { // Queen: a rounded crown
      return '<path d="M-22 8 L-24 -10 Q-12 0 -8 -14 Q0 -2 8 -14 Q12 0 24 -10 L22 8Z" fill="' + PALETTE.gilt + '" stroke="' + c + '" stroke-width="1.4"/>' +
        '<circle cx="-8" cy="-16" r="2.6" fill="' + c + '"/><circle cx="8" cy="-16" r="2.6" fill="' + c + '"/><circle cx="-24" cy="-12" r="2.4" fill="' + c + '"/><circle cx="24" cy="-12" r="2.4" fill="' + c + '"/>';
    },
    14: function (c) { // King: a pointed crown
      return '<path d="M-24 8 L-24 -14 L-12 -2 L0 -20 L12 -2 L24 -14 L24 8Z" fill="' + PALETTE.gilt + '" stroke="' + c + '" stroke-width="1.4"/>' +
        '<rect x="-24" y="4" width="48" height="5" fill="' + c + '"/>' +
        '<circle cx="0" cy="-6" r="3" fill="' + c + '"/>';
    }
  };

  function courtArt(card) {
    var c = PALETTE[card.element];
    return '<circle cx="100" cy="170" r="62" fill="none" stroke="' + c + '" stroke-width="1" opacity=".5"/>' +
      '<g transform="translate(100 96) scale(1.5)">' + COURT_EMBLEM[card.rank](c) + '</g>' +
      '<g transform="translate(100 182) scale(2)">' + EMBLEM[card.suit](c) + '</g>' +
      '<text x="100" y="270" text-anchor="middle" font-family="Spectral, Georgia, serif" font-style="italic" font-size="11" fill="' + PALETTE.ink + '" opacity=".7">' + esc(card.astrology) + '</text>';
  }

  var faceCache = {};
  function face(card) {
    if (faceCache[card.id]) return faceCache[card.id];
    var accent = card.arcana === 'major' ? PALETTE.gilt : PALETTE[card.element];
    var body = card.arcana === 'major' ? majorArt(card) : (card.court ? courtArt(card) : pipArt(card));
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(card.name) + '">' +
      frame(accent) + header(card, accent) + body + banner(card, accent) + '</svg>';
    faceCache[card.id] = svg;
    return svg;
  }

  /* ---------- card back: rotationally symmetric, so reversals stay hidden ---------- */

  function back() {
    var g = '#c9a24a', bg = '#1c1838', bg2 = '#2a2452';
    var spokes = '';
    for (var i = 0; i < 16; i++) {
      var a = i * Math.PI / 8;
      spokes += '<line x1="' + (100 + 30 * Math.cos(a)).toFixed(1) + '" y1="' + (165 + 30 * Math.sin(a)).toFixed(1) + '" x2="' + (100 + (i % 2 ? 44 : 56) * Math.cos(a)).toFixed(1) + '" y2="' + (165 + (i % 2 ? 44 : 56) * Math.sin(a)).toFixed(1) + '" stroke="' + g + '" stroke-width="1.2"/>';
    }
    var dots = '';
    for (var y = 30; y <= 300; y += 18) {
      for (var x = 28; x <= 172; x += 18) {
        var dx = x - 100, dy = y - 165;
        if (dx * dx + dy * dy > 75 * 75) dots += '<circle cx="' + x + '" cy="' + y + '" r="1.1" fill="' + g + '" opacity=".45"/>';
      }
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 330">' +
      '<defs><radialGradient id="b" cx="50%" cy="50%" r="65%"><stop offset="0" stop-color="' + bg2 + '"/><stop offset="1" stop-color="' + bg + '"/></radialGradient></defs>' +
      '<rect width="200" height="330" rx="12" fill="url(#b)"/>' +
      '<rect x="8" y="8" width="184" height="314" rx="8" fill="none" stroke="' + g + '" stroke-width="1.6"/>' +
      '<rect x="14" y="14" width="172" height="302" rx="5" fill="none" stroke="' + g + '" stroke-width=".6" opacity=".7"/>' +
      dots +
      '<circle cx="100" cy="165" r="70" fill="none" stroke="' + g + '" stroke-width=".8"/>' +
      '<circle cx="100" cy="165" r="62" fill="none" stroke="' + g + '" stroke-width=".5" stroke-dasharray="1 4"/>' +
      spokes +
      '<circle cx="100" cy="165" r="22" fill="' + g + '"/>' +
      '<circle cx="100" cy="165" r="16" fill="' + bg + '"/>' +
      '<polygon transform="translate(100 165)" points="' + starPoints(12, 4, 4) + '" fill="' + g + '"/>' +
      '<polygon transform="translate(100 52)" points="' + starPoints(9, 3, 4) + '" fill="' + g + '"/>' +
      '<polygon transform="translate(100 278)" points="' + starPoints(9, 3, 4) + '" fill="' + g + '"/>' +
      '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  T.art = { face: face, back: back(), PALETTE: PALETTE, elementSign: elementSign };
})();
