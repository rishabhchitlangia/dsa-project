/* Reading engine.
 *
 * Randomness: cards are shuffled with a Fisher–Yates shuffle driven by
 * crypto.getRandomValues. Each shuffle also turns a random portion of the
 * deck end-over-end, the way a reader's hands do, so reversals come from the
 * physical process rather than a coin flip at draw time.
 *
 * Interpretation follows the layered method most working readers teach:
 *   1. Read each card in its position (card meaning × position question).
 *   2. Reversals change what a card is doing (blocked, internal, excessive).
 *   3. Elemental dignities change how loudly a card speaks: friendly or
 *      matching neighbours strengthen it, hostile ones weaken it.
 *   4. Look at the whole spread: share of Major Arcana, dominant and missing
 *      suits, reversal count, court cards and repeated numbers.
 *   5. Compare the spread's key position pairs.
 *   6. Find the quintessence: the sum of the cards, reduced to a Major.
 *   7. Tie it together as one story. */
(function () {
  'use strict';

  var T = window.Tarot;

  /* ---------- randomness ---------- */

  function randInt(n) {
    if (window.crypto && window.crypto.getRandomValues) {
      var buf = new Uint32Array(1);
      var limit = Math.floor(0x100000000 / n) * n;
      do { window.crypto.getRandomValues(buf); } while (buf[0] >= limit);
      return buf[0] % n;
    }
    return Math.floor(Math.random() * n);
  }

  function newDeck() {
    return T.DECK.map(function (c) { return { card: c, reversed: false }; });
  }

  // One shuffle pass: turn a random block end-over-end, then Fisher–Yates.
  function shuffle(pile, useReversals) {
    var out = pile.slice();
    if (useReversals) {
      var start = randInt(out.length);
      var len = 10 + randInt(Math.floor(out.length / 2));
      for (var k = 0; k < len; k++) {
        var idx = (start + k) % out.length;
        out[idx] = { card: out[idx].card, reversed: !out[idx].reversed };
      }
    }
    for (var i = out.length - 1; i > 0; i--) {
      var j = randInt(i + 1);
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }

  // Three-pile cut: split into three, then restack with the chosen pile on top.
  function cutPoints(n) {
    var a = 18 + randInt(10);
    var b = a + 18 + randInt(10);
    return [a, Math.min(b, n - 12)];
  }
  function cut(pile, points, chosen) {
    var piles = [pile.slice(0, points[0]), pile.slice(points[0], points[1]), pile.slice(points[1])];
    var order = [chosen].concat([0, 1, 2].filter(function (p) { return p !== chosen; }));
    return order.reduce(function (acc, p) { return acc.concat(piles[p]); }, []);
  }

  /* ---------- elemental dignities ---------- */

  var ELEMENTS = {
    fire: { name: 'Fire', quality: 'will, drive and passion', glyph: '\u{1F702}' },
    water: { name: 'Water', quality: 'feeling, intuition and relationship', glyph: '\u{1F704}' },
    air: { name: 'Air', quality: 'thought, words and decisions', glyph: '\u{1F701}' },
    earth: { name: 'Earth', quality: 'body, money, work and the practical', glyph: '\u{1F703}' }
  };

  // Golden Dawn rules: like strengthens like; Fire–Air and Water–Earth are
  // friendly; Fire–Water and Air–Earth are hostile; the rest are neutral.
  function relation(a, b) {
    if (a === b) return 'same';
    var pair = [a, b].sort().join('-');
    if (pair === 'air-fire' || pair === 'earth-water') return 'friendly';
    if (pair === 'fire-water' || pair === 'air-earth') return 'hostile';
    return 'neutral';
  }
  var REL_SCORE = { same: 1, friendly: 1, neutral: 0, hostile: -1 };

  function dignityFor(i, cards, links) {
    var neighbours = [];
    links.forEach(function (l) {
      if (l[0] === i) neighbours.push(l[1]);
      else if (l[1] === i) neighbours.push(l[0]);
    });
    if (!neighbours.length) return null;
    var score = 0;
    var detail = neighbours.map(function (n) {
      var r = relation(cards[i].card.element, cards[n].card.element);
      score += REL_SCORE[r];
      return { index: n, rel: r };
    });
    var hasHostile = detail.some(function (d) { return d.rel === 'hostile'; });
    var hasFriend = detail.some(function (d) { return d.rel === 'friendly' || d.rel === 'same'; });
    var state = score > 0 ? 'strong' : score < 0 ? 'weak' : (hasHostile && hasFriend ? 'mixed' : 'neutral');
    return { state: state, score: score, detail: detail };
  }

  var DIGNITY_TEXT = {
    strong: 'Its neighbours share or feed its element, so this card speaks loudly and its influence is strong.',
    weak: 'Its neighbours oppose its element, so its influence is muffled: weaker, delayed or harder to act on.',
    mixed: 'One neighbour supports it and another opposes it, so its influence is real but contested.',
    neutral: 'Its neighbours neither feed nor fight it; read it at face value.'
  };

  /* ---------- numbers ---------- */

  var NUMBER_THEMES = {
    1: 'new beginnings and raw potential',
    2: 'choices, balance and partnership',
    3: 'growth, creativity and collaboration',
    4: 'stability, structure and rest',
    5: 'conflict, loss and disruptive change',
    6: 'harmony, generosity and moving on',
    7: 'reflection, assessment and testing faith',
    8: 'movement, effort and mastery',
    9: 'culmination and the last stretch',
    10: 'completion and the end of a cycle',
    11: 'messages, study and new learning (Pages)',
    12: 'action, movement and pursuit (Knights)',
    13: 'inner mastery and care (Queens)',
    14: 'outer mastery and authority (Kings)'
  };

  var SUIT_THEMES = {
    wands: { dominant: 'This is mainly about drive, ambition and creative fire. Action is the main currency here.', missing: 'No Wands appeared. Motivation or passion may be the missing ingredient.' },
    cups: { dominant: 'This is mainly about feelings and relationships. The heart is doing the talking.', missing: 'No Cups appeared. Emotions may be under-acknowledged, or this is not really a matter of the heart.' },
    swords: { dominant: 'This is mainly about thoughts, words and conflict. Clarity and honest communication matter most.', missing: 'No Swords appeared. Overthinking is not the problem; or a hard conversation is being avoided.' },
    pentacles: { dominant: 'This is mainly about practical, material matters: work, money, health and home.', missing: 'No Pentacles appeared. Practical grounding or follow-through may be what is lacking.' }
  };

  var COURT_ROLES = {
    11: 'a student, a messenger or a young, curious energy',
    12: 'someone in motion, chasing a goal',
    13: 'a mature, nurturing presence who leads from within',
    14: 'an authority figure who leads from the front'
  };

  // Quintessence: add the face values (Majors by number, pips 1–10, courts
  // not counted) and reduce to 0–21 by adding the digits.
  function quintessence(cards) {
    var sum = 0;
    cards.forEach(function (c) {
      if (c.card.arcana === 'major') sum += c.card.number;
      else if (!c.card.court) sum += c.card.rank;
    });
    var reduced = sum;
    while (reduced > 22) {
      reduced = String(reduced).split('').reduce(function (a, d) { return a + Number(d); }, 0);
    }
    if (reduced === 22) reduced = 0;
    return { sum: sum, card: T.DECK[reduced] };
  }

  /* ---------- text helpers ---------- */

  function orient(c) { return c.reversed ? 'rev' : 'up'; }
  function kw(c, n) { return c.card.keywords[orient(c)].slice(0, n || 2).join(' and '); }
  function cardLabel(c) { return c.card.name + (c.reversed ? ' reversed' : ''); }
  function advise(c) { return (c.reversed ? 'guarding against ' : '') + kw(c); }
  function lcFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function listJoin(arr) {
    if (arr.length < 2) return arr.join('');
    return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
  }

  var REVERSAL_NOTE = 'Reversed: the energy is blocked, turned inward, delayed or overdone.';

  function readPair(pair, cards, spread) {
    var a = cards[pair.a], b = cards[pair.b];
    var pa = spread.positions[pair.a].name, pb = spread.positions[pair.b].name;
    var rel = relation(a.card.element, b.card.element);
    var text;
    var sameSuit = a.card.suit && a.card.suit === b.card.suit;
    var sameRank = a.card.arcana === 'minor' && b.card.arcana === 'minor' && a.card.rank === b.card.rank;

    if (pair.lens === 'arc') {
      if (sameSuit || rel === 'same') text = 'The two cards rhyme (both ' + ELEMENTS[a.card.element].name + '). The situation is moving in a circle. The theme of ' + kw(a) + ' is returning as ' + kw(b) + ', so watch for an old pattern repeating.';
      else if (rel === 'hostile') text = 'These cards sharply contrast (' + ELEMENTS[a.card.element].name + ' against ' + ELEMENTS[b.card.element].name + '). Real change is underway: ' + kw(a) + ' gives way to something very different, ' + kw(b) + '.';
      else if (rel === 'friendly') text = 'These cards flow into each other. ' + cap(kw(a)) + ' naturally feeds ' + kw(b) + '; the path between them is open.';
      else text = 'A gentle shift in tone, from ' + kw(a) + ' toward ' + kw(b) + '. Change here is gradual rather than dramatic.';
    } else if (pair.lens === 'mirror') {
      if (rel === 'same' || rel === 'friendly') text = 'These two are aligned. ' + cap(kw(a)) + ' in ' + pa + ' and ' + kw(b) + ' in ' + pb + ' support each other, so there is little inner conflict here.';
      else if (rel === 'hostile') text = 'These two are at odds. ' + cap(kw(a)) + ' in ' + pa + ' pulls against ' + kw(b) + ' in ' + pb + '. Much of the tension in this reading lives in that gap.';
      else text = 'These two sit side by side without strong friction. ' + cap(kw(a)) + ' and ' + kw(b) + ' colour each other rather than compete.';
    } else if (pair.lens === 'cause') {
      if (rel === 'hostile') text = 'Following this path asks for a real change of approach. The ' + ELEMENTS[a.card.element].name + ' of ' + a.card.name + ' has to be translated into the ' + ELEMENTS[b.card.element].name + ' of ' + b.card.name + ' before the result shows.';
      else text = 'Cause and effect line up. Leaning into ' + kw(a) + ' leads quite directly to ' + kw(b) + '.';
    } else if (pair.lens === 'remedy') {
      if (rel === 'hostile') text = 'The advice is the antidote to the obstacle. Where ' + a.card.name + ' brings ' + kw(a) + ', answer it with ' + kw(b) + '.';
      else text = 'The advice works with the obstacle rather than against it. ' + cap(kw(b)) + ' turns ' + kw(a) + ' to your advantage.';
    } else if (pair.lens === 'tension') {
      text = 'What holds you together (' + kw(a) + ') and what pulls you apart (' + kw(b) + ') ' + (rel === 'hostile' ? 'are opposite forces. The relationship’s work is learning to hold both.' : 'come from a similar place, so a strength overused can become the strain.');
    }

    if (sameRank) text += ' Both cards share the number ' + a.card.rank + ', underlining ' + NUMBER_THEMES[a.card.rank] + '.';
    if (a.reversed && b.reversed) text += ' Both are reversed, so this connection is currently blocked or working underground.';

    return { title: pair.title, note: pair.note || '', cards: [pair.a, pair.b], text: text };
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- the reading ---------- */

  function interpret(spread, cards, opts) {
    opts = opts || {};
    var n = cards.length;

    var perCard = cards.map(function (c, i) {
      var pos = spread.positions[i];
      var o = orient(c);
      return {
        index: i,
        position: pos,
        card: c.card,
        reversed: c.reversed,
        keywords: c.card.keywords[o],
        meaning: c.card.meaning[o],
        inPosition: c.card.name + (c.reversed ? ' reversed' : '') + ', in the ' + pos.name.replace(/^The /, '') + ' position, speaks of ' + listJoin(c.card.keywords[o].slice(0, 3)) + '.',
        reversalNote: c.reversed ? REVERSAL_NOTE : '',
        dignity: opts.dignities ? dignityFor(i, cards, spread.links) : null
      };
    });
    perCard.forEach(function (p) {
      if (p.dignity) p.dignityText = DIGNITY_TEXT[p.dignity.state];
    });

    /* overview */
    var majors = cards.filter(function (c) { return c.card.arcana === 'major'; });
    var reversed = cards.filter(function (c) { return c.reversed; });
    var courts = cards.filter(function (c) { return c.card.court; });
    var suitCount = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
    var elemCount = { fire: 0, water: 0, air: 0, earth: 0 };
    cards.forEach(function (c) {
      if (c.card.suit) suitCount[c.card.suit]++;
      elemCount[c.card.element]++;
    });

    var insights = [];

    if (n >= 3) {
      var mRatio = majors.length / n;
      if (mRatio >= 0.5) insights.push({ label: 'Major Arcana', value: majors.length + ' of ' + n, text: 'Over half the cards are Major Arcana. This is a significant chapter of your life: larger forces and deep lessons are at work, and not everything is in your hands.' });
      else if (majors.length === 0) insights.push({ label: 'Major Arcana', value: '0 of ' + n, text: 'No Major Arcana. This is an everyday matter that is mostly in your control; your choices decide how it goes.' });
      else insights.push({ label: 'Major Arcana', value: majors.length + ' of ' + n, text: 'A balance of big themes and everyday detail. ' + listJoin(majors.map(function (m) { return m.card.name; })) + ' mark' + (majors.length === 1 ? 's' : '') + ' the turning point' + (majors.length === 1 ? '' : 's') + ' to pay most attention to.' });

      var minorTotal = n - majors.length;
      if (minorTotal >= 2) {
        var suits = Object.keys(suitCount).sort(function (a, b) { return suitCount[b] - suitCount[a]; });
        var top = suits[0];
        if (suitCount[top] >= 2 && suitCount[top] > suitCount[suits[1]]) {
          insights.push({ label: 'Dominant suit', value: T.SUITS[top].name + ' ×' + suitCount[top], text: SUIT_THEMES[top].dominant });
        }
        if (n >= 6) {
          var missing = suits.filter(function (s) { return suitCount[s] === 0; });
          if (missing.length === 1) insights.push({ label: 'Missing suit', value: T.SUITS[missing[0]].name, text: SUIT_THEMES[missing[0]].missing });
        }
      }

      var elems = Object.keys(elemCount).sort(function (a, b) { return elemCount[b] - elemCount[a]; });
      if (elemCount[elems[0]] > elemCount[elems[1]]) {
        insights.push({ label: 'Leading element', value: ELEMENTS[elems[0]].name, text: 'Counting the Majors’ elements too, ' + ELEMENTS[elems[0]].name + ' leads: the reading turns on ' + ELEMENTS[elems[0]].quality + '.' });
      }

      if (opts.reversals) {
        var rRatio = reversed.length / n;
        var rText;
        if (reversed.length === 0) rText = 'No reversals. Energy is flowing freely and outwardly; what you see is what is happening.';
        else if (rRatio > 0.5) rText = 'Most cards are reversed. Something is blocked or the work right now is internal. The situation may be harder than it looks on the surface.';
        else rText = 'A few reversals point to the specific places where energy is stuck: ' + listJoin(reversed.map(function (r) { return r.card.name; })) + '.';
        insights.push({ label: 'Reversals', value: reversed.length + ' of ' + n, text: rText });
      }

      if (courts.length) {
        insights.push({ label: 'Court cards', value: String(courts.length), text: courts.length >= 3 ? 'Several court cards: other people, and the roles you play around them, are central here.' : 'Court cards can stand for real people or for a side of yourself. Here: ' + listJoin(courts.map(function (c) { return c.card.name + ' as ' + COURT_ROLES[c.card.rank]; })) + '.' });
      }

      var rankCount = {};
      cards.forEach(function (c) {
        if (c.card.arcana === 'minor') rankCount[c.card.rank] = (rankCount[c.card.rank] || 0) + 1;
      });
      Object.keys(rankCount).forEach(function (r) {
        if (rankCount[r] >= 2) {
          var word = r <= 10 ? (r == 1 ? 'Aces' : r + 's') : ['Pages', 'Knights', 'Queens', 'Kings'][r - 11];
          insights.push({ label: 'Repeated number', value: rankCount[r] + ' ' + word, text: 'Repeated ' + word + ' emphasise ' + NUMBER_THEMES[r] + '.' });
        }
      });
    }

    var quint = n >= 3 ? quintessence(cards) : null;
    if (quint) {
      quint.text = 'The cards add up to ' + quint.sum + ', which reduces to ' + quint.card.numeral + ', ' + quint.card.name + '. Readers treat this as the reading’s underlying lesson: ' + lcFirst(quint.card.meaning.up);
    }

    var pairs = (spread.pairs || []).map(function (p) { return readPair(p, cards, spread); });

    return {
      spread: spread,
      question: opts.question || '',
      perCard: perCard,
      insights: insights,
      pairs: pairs,
      quintessence: quint,
      synthesis: synthesise(spread, cards, perCard, majors, opts)
    };
  }

  /* ---------- synthesis ---------- */

  function synthesise(spread, cards, perCard, majors, opts) {
    var p = function (i) { return cardLabel(cards[i]); };
    var k = function (i, n) { return kw(cards[i], n); };
    var a = function (i) { return advise(cards[i]); };
    var parts = [];

    switch (spread.id) {
      case 'one':
        parts.push('Your card is ' + p(0) + '. ' + cards[0].card.meaning[orient(cards[0])]);
        parts.push('Carry the words ' + listJoin(cards[0].card.keywords[orient(cards[0])].slice(0, 3)) + ' with you today and notice where they show up.');
        break;
      case 'three':
        parts.push('The story starts with ' + p(0) + ': a past shaped by ' + k(0) + '.');
        parts.push('That has brought you to ' + p(1) + ', where the present is defined by ' + k(1) + '.');
        parts.push('If you continue as you are, ' + p(2) + ' suggests a future of ' + k(2) + '.');
        parts.push('Remember that the future card is a trajectory, not a verdict. Change the present and you change where it leads.');
        break;
      case 'sao':
        parts.push('The situation, ' + p(0) + ', is about ' + k(0) + '.');
        parts.push('The cards advise ' + a(1) + ', the energy of ' + p(1) + '.');
        parts.push('Take that step and ' + p(2) + ' shows the likely result: ' + k(2) + '.');
        break;
      case 'relationship':
        parts.push('You bring ' + k(0) + ' (' + p(0) + '); they bring ' + k(2) + ' (' + p(2) + ').');
        parts.push('Between you sits ' + p(1) + ': a bond of ' + k(1) + '.');
        parts.push('Build on ' + k(3) + ' and stay honest about ' + k(5) + '. Handled with care, this leads toward ' + k(4) + ' (' + p(4) + ').');
        break;
      case 'horseshoe':
        parts.push('Rooted in ' + k(0) + ' (' + p(0) + '), the present is coloured by ' + k(1) + '.');
        parts.push('Beneath the surface, ' + p(2) + ' hints at ' + k(2) + ', while ' + p(3) + ' names the obstacle: ' + k(3) + '.');
        parts.push('Other people bring ' + k(4) + '. The cards advise ' + a(5) + ' (' + p(5) + ').');
        parts.push('Follow it, and the likely outcome is ' + p(6) + ': ' + k(6) + '.');
        break;
      case 'celtic':
        parts.push('At the heart of this is ' + p(0) + ', a matter of ' + k(0) + ', crossed by ' + p(1) + ', which brings ' + k(1) + '.');
        parts.push('It grew out of ' + k(2) + ' (' + p(2) + ') and the coming weeks bring ' + k(3) + ' (' + p(3) + ').');
        parts.push('Consciously you are reaching for ' + k(4) + '; underneath, ' + p(5) + ' shows you are driven by ' + k(5) + '.');
        parts.push('The world around you adds ' + k(7) + ', and your hopes and fears circle around ' + k(8) + '.');
        parts.push('The cards advise ' + a(6) + ' (' + p(6) + '). On the current path, the outcome is ' + p(9) + ': ' + k(9, 3) + '.');
        break;
    }

    if (majors.length === 1 && spread.id !== 'one') {
      parts.push(majors[0].card.name + ' is the only Major Arcana card here, so it is the strongest single voice in the spread. Give its message extra weight.');
    } else if (majors.length > 1) {
      parts.push('The Major Arcana cards, ' + listJoin(majors.map(function (m) { return m.card.name; })) + ', carry the most weight. Read the rest of the spread around them.');
    }
    if (opts.dignities) {
      var weak = perCard.filter(function (pc) { return pc.dignity && pc.dignity.state === 'weak'; });
      var strong = perCard.filter(function (pc) { return pc.dignity && pc.dignity.state === 'strong'; });
      if (strong.length) parts.push('By elemental dignity, ' + listJoin(strong.map(function (s) { return s.card.name; })) + ' ' + (strong.length > 1 ? 'are' : 'is') + ' amplified.');
      if (weak.length) parts.push(listJoin(weak.map(function (s) { return s.card.name; })) + ' ' + (weak.length > 1 ? 'are' : 'is') + ' muffled by ' + (weak.length > 1 ? 'their' : 'its') + ' neighbours, so expect ' + (weak.length > 1 ? 'those influences' : 'that influence') + ' to be weaker than usual.');
    }
    return parts;
  }

  /* ---------- reading payload: the facts a reader works from, no prose ---------- */

  var RANK_WORDS = { 1: 'Aces', 11: 'Pages', 12: 'Knights', 13: 'Queens', 14: 'Kings' };
  var DIGNITY_EFFECT = {
    strong: 'strengthened by its neighbours',
    weak: 'weakened by its neighbours',
    mixed: 'pulled both ways by its neighbours',
    neutral: 'unaffected by its neighbours'
  };

  function buildPayload(spread, cards, opts) {
    opts = opts || {};
    var n = cards.length;
    var payloadCards = cards.map(function (c, i) {
      var pos = spread.positions[i];
      var o = orient(c);
      var dig = opts.dignities ? dignityFor(i, cards, spread.links) : null;
      return {
        number: i + 1,
        position: pos.name,
        positionMeaning: pos.question,
        card: c.card.name,
        id: c.card.id,
        arcana: c.card.arcana,
        suit: c.card.suit || null,
        orientation: c.reversed ? 'reversed' : 'upright',
        keywords: c.card.keywords[o].slice(),
        meaning: c.card.meaning[o],
        element: ELEMENTS[c.card.element].name,
        dignity: dig ? {
          state: dig.state,
          effect: DIGNITY_EFFECT[dig.state],
          neighbours: dig.detail.map(function (d) {
            return { number: d.index + 1, card: cards[d.index].card.name, relation: d.rel };
          })
        } : null
      };
    });

    var suitCount = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
    var elemCount = { fire: 0, water: 0, air: 0, earth: 0 };
    var rankCount = {};
    var majors = 0, reversed = 0, courts = [];
    cards.forEach(function (c) {
      elemCount[c.card.element]++;
      if (c.reversed) reversed++;
      if (c.card.arcana === 'major') { majors++; return; }
      suitCount[c.card.suit]++;
      rankCount[c.card.rank] = (rankCount[c.card.rank] || 0) + 1;
      if (c.card.court) courts.push(c.card.name);
    });
    var suits = Object.keys(suitCount).sort(function (a, b) { return suitCount[b] - suitCount[a]; });
    var elems = Object.keys(elemCount).sort(function (a, b) { return elemCount[b] - elemCount[a]; });
    var repeated = Object.keys(rankCount).filter(function (r) { return rankCount[r] >= 2; }).map(function (r) {
      r = +r;
      return { rank: r, count: rankCount[r], label: RANK_WORDS[r] || (r + 's'), theme: NUMBER_THEMES[r] };
    });

    return {
      question: opts.question || '',
      spread: spread.name,
      spreadId: spread.id,
      cardCount: n,
      options: { reversals: !!opts.reversals, dignities: !!opts.dignities },
      cards: payloadCards,
      patterns: {
        majors: majors,
        dominantSuit: n - majors >= 2 && suitCount[suits[0]] >= 2 && suitCount[suits[0]] > suitCount[suits[1]] ? T.SUITS[suits[0]].name : null,
        suitCounts: suitCount,
        dominantElement: elemCount[elems[0]] > elemCount[elems[1]] ? ELEMENTS[elems[0]].name : null,
        missingElements: n >= 4 ? Object.keys(elemCount).filter(function (e) { return !elemCount[e]; }).map(function (e) { return ELEMENTS[e].name; }) : [],
        reversals: reversed,
        repeatedNumbers: repeated,
        courts: courts
      }
    };
  }

  T.engine = {
    buildPayload: buildPayload,
    newDeck: newDeck,
    shuffle: shuffle,
    cut: cut,
    cutPoints: cutPoints,
    randInt: randInt,
    interpret: interpret,
    relation: relation,
    ELEMENTS: ELEMENTS
  };
})();
