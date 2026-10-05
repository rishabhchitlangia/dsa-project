/* The reader: turns the engine's facts into a reading that answers the question.
 *
 * - With Claude available (the page runs as a claude.ai artifact that declares
 *   the `sample` capability), the facts, the card knowledge from lore.js and the
 *   question go to Claude with READER_PROMPT and the reading streams back.
 * - Otherwise the rule-based reader below writes the same five sections from the
 *   same facts and card knowledge, so the page always has a complete reading.
 * Both produce markdown with the same fixed headings, parsed by parse().
 *
 * The reading method follows common practice among experienced readers:
 * read each card through its position and the question, weigh Major Arcana and
 * key positions more heavily, compare the paired positions of the spread, look
 * at elemental dignities and suit balance, and finish with a clear verdict and
 * one practical step. */
(function () {
  'use strict';

  var T = window.Tarot;

  /* ======================================================================
   * Card knowledge
   * ==================================================================== */

  function lore(c) {
    var L = T.LORE && T.LORE[c.id];
    if (!L) return null;
    return c.orientation === 'reversed' ? L.rev : L.up;
  }

  // Older pages without lore.js still work, using the deck's core meaning.
  function cardText(c, field) {
    var l = lore(c);
    if (l && l[field]) return l[field];
    if (field === 'advice') return (tone(c) < 0 ? 'Guard against ' : 'Lean into ') + kw(c) + '.';
    if (field === 'outcome') return 'Expect ' + kw(c) + '.';
    if (field === 'challenge') return 'What stands in the way is ' + kw(c) + '.';
    return c.meaning;
  }

  /* ======================================================================
   * Instructions for Claude
   * ==================================================================== */

  var READER_PROMPT = 'You are an experienced, warm and grounded tarot reader giving a private reading. You speak plainly, like a thoughtful person across the table, not like a textbook. Use only the cards and facts provided; never invent cards or change orientations.\n\n' +
    'How to read (the method good readers use):\n' +
    '- Start from the question. Every sentence should help answer it. Read each card through its position first ("what is in the way", "where this is heading"), then through the topic of the question.\n' +
    '- The topic readings and role readings given for each card are reliable starting points written for this deck. Build on them in your own words; do not paste them.\n' +
    '- Weigh the Outcome and Present positions most, and Major Arcana more than minor cards. A spread heavy in Majors is about bigger forces; one with none is about everyday choices.\n' +
    '- Read the paired positions against each other (they are listed). Agreement strengthens a message; contrast is where the real story is.\n' +
    '- Reversed cards are blocked, delayed, turned inward or overdone, not simply "bad". Elemental dignities: a card beside a friendly or same element is strengthened; beside an opposing element it is weakened. Mention this only when it changes the answer.\n' +
    '- Court cards can be a real person or a side of the person asking. Say which seems more likely here, or allow both.\n' +
    '- Commit to a verdict. For yes/no questions the data gives a VERDICT worked out from the outcome card, the heart of the matter and the rest of the spread, the way a reader weighs them. Give that verdict and explain it from the cards. Only depart from it if the cards plainly contradict it, and then say why in one sentence.\n' +
    '- Do not hedge. "It depends" is only for readings whose VERDICT is "It depends"; never use it to soften a yes or a no. A "Leaning no" can still be kind, and a "Leaning yes" can still name a risk.\n\n' +
    'Write the reading in exactly these sections, with these headings:\n\n' +
    '## The short answer\n' +
    '2–3 sentences that directly answer the question asked. If it is a yes/no or should-I question, start with the VERDICT in bold exactly as given (for example **Leaning yes.**) and say why in one line, naming the card that decides it. If no question was given, state the main message of the spread.\n\n' +
    '## What the cards are saying\n' +
    'One or two paragraphs telling the story of the spread as a whole: how the cards connect, what changes from one position to the next, where the tension or turning point is, and what the paired positions show. Refer to cards by name, but explain them through the person’s situation, not as definitions.\n\n' +
    '## Card by card\n' +
    'For each card in order: a bold line in the form **1. Position: Card name** (add "reversed" if so), then 2–4 sentences on what this card means *in this position, for this question*.\n\n' +
    '## Patterns worth noticing\n' +
    '2–4 short bullet points, only if meaningful: many or no Major Arcana, a dominant or missing suit, many reversals, repeated numbers, several court cards. Explain what each means for the question. Leave this section out if nothing stands out.\n\n' +
    '## Bringing it together\n' +
    'A clear conclusion in 3–5 sentences: the overall verdict on the question, the main thing to do or keep in mind, and what to watch for. End with one concrete, practical step they can take this week.\n\n' +
    'Style rules: second person (‘you’), warm but direct, no clichés like ‘the universe has a plan’, no hedging every sentence, no mention of being an AI. Plain English, short paragraphs, around 450–650 words in total (250–350 for 1–3 card spreads). Present tarot as reflection and guidance, not certainty about the future. Never predict death, illness or pregnancy. For questions about health, legal or financial decisions, or safety, give the reading but suggest also talking to an appropriate professional, in one sentence.';

  var FOLLOW_UP_RULES = 'Answer as the same reader, in under 200 words, drawing only on the cards in this reading. ' +
    'Speak to the person directly in plain prose: no headings, no lists, no recap of the whole reading. If the follow-up is a yes/no question, give a clear lean first.';

  /* ---------- the facts, as labelled data ---------- */

  function payloadText(p) {
    var d = detect(p.question);
    var field = topicField(d.topic);
    var lines = [];
    lines.push('QUESTION: ' + (p.question ? p.question : '(none given: read the spread’s main message)'));
    lines.push('QUESTION TYPE: ' + d.type + '; TOPIC: ' + d.topic);
    lines.push('SPREAD: ' + p.spread + ' (' + p.cardCount + (p.cardCount === 1 ? ' card)' : ' cards)'));
    lines.push('METHOD: reversals ' + (p.options.reversals ? 'on' : 'off') + '; elemental dignities ' + (p.options.dignities ? 'on' : 'off'));
    lines.push('');
    lines.push('CARDS, IN ORDER');
    p.cards.forEach(function (c) {
      var r = role(c.position);
      lines.push('');
      lines.push(c.number + '. Position: ' + c.position + ' (' + c.positionMeaning + ')');
      lines.push('   Card: ' + c.card + ', ' + c.orientation + (c.arcana === 'major' ? ' (Major Arcana)' : ''));
      lines.push('   Keywords: ' + c.keywords.join(', '));
      lines.push('   Core meaning: ' + c.meaning);
      lines.push('   Reading for a ' + (field === 'general' ? 'general' : d.topic) + ' question: ' + cardText(c, field));
      if (ROLE_FIELD[r]) lines.push('   In the ' + r + ' role: ' + cardText(c, ROLE_FIELD[r]));
      lines.push('   Element: ' + c.element);
      if (c.dignity) {
        lines.push('   Elemental dignity: ' + c.dignity.effect + ' (' + c.dignity.neighbours.map(function (n) {
          return 'beside ' + n.card + ', ' + n.relation;
        }).join('; ') + ')');
      }
    });
    var pairs = spreadPairs(p);
    if (pairs.length) {
      lines.push('');
      lines.push('PAIRED POSITIONS TO COMPARE');
      pairs.forEach(function (pr) {
        lines.push('- ' + pr.title + ': ' + p.cards[pr.a].card + ' and ' + p.cards[pr.b].card + (pr.note ? ' (' + pr.note + ')' : ''));
      });
    }
    var pt = p.patterns;
    lines.push('');
    lines.push('PATTERNS');
    lines.push('- Major Arcana: ' + pt.majors + ' of ' + p.cardCount);
    lines.push('- Suits: ' + Object.keys(pt.suitCounts).map(function (s) { return T.SUITS[s].name + ' ' + pt.suitCounts[s]; }).join(', ') +
      (pt.dominantSuit ? ' (dominant: ' + pt.dominantSuit + ')' : ''));
    if (pt.dominantElement) lines.push('- Dominant element: ' + pt.dominantElement);
    if (pt.missingElements.length) lines.push('- Missing elements: ' + pt.missingElements.join(', '));
    if (p.options.reversals) lines.push('- Reversed cards: ' + pt.reversals + ' of ' + p.cardCount);
    pt.repeatedNumbers.forEach(function (r) { lines.push('- Repeated: ' + r.count + ' ' + r.label + ' (' + r.theme + ')'); });
    if (pt.courts.length) lines.push('- Court cards: ' + pt.courts.join(', '));
    var L = lean(p);
    lines.push('');
    if (d.type === 'yesno') {
      lines.push('VERDICT: ' + VERDICT_LINE[L.verdict] + ' (' + {
        yes: 'the deciding cards support it',
        no: 'the deciding cards are against it',
        notyet: 'the outcome is open but something has to shift first, or the cards are blocked',
        mixed: 'the deciding cards genuinely pull in opposite directions'
      }[L.verdict] + ')');
    } else {
      lines.push('OVERALL TONE: ' + TONE_WORD(L.avg));
    }
    return lines.join('\n');
  }

  function buildInput(payload) {
    return READER_PROMPT + '\n\n----\nTHE READING DATA\n\n' + payloadText(payload);
  }

  /* ======================================================================
   * Claude
   * ==================================================================== */

  var sampleReady = window.claude && typeof window.claude.use === 'function'
    ? window.claude.use('sample').then(function (s) { return s || null; }, function () { return null; })
    : Promise.resolve(null);

  // Resolves {text, truncated}; rejects {code, message, text?}. Never retries.
  function write(payload, opts) {
    return sampleReady.then(function (sample) {
      if (!sample) throw { code: 'unavailable', message: 'sample capability not available' };
      return sample(buildInput(payload), { modelTier: 'default', signal: opts.signal, onText: opts.onText });
    });
  }

  // A multi-turn call: instructions + data, the reading, earlier follow-ups, the new question.
  function followUp(payload, readingText, earlier, question, opts) {
    return sampleReady.then(function (sample) {
      if (!sample) throw { code: 'unavailable', message: 'sample capability not available' };
      var turns = [
        { role: 'user', content: buildInput(payload) },
        { role: 'assistant', content: readingText }
      ];
      earlier.forEach(function (f) {
        turns.push({ role: 'user', content: 'Follow-up question: ' + f.q + '\n\n' + FOLLOW_UP_RULES });
        turns.push({ role: 'assistant', content: f.a });
      });
      turns.push({ role: 'user', content: 'Follow-up question: ' + question + '\n\n' + FOLLOW_UP_RULES });
      return sample(turns, { modelTier: 'default', signal: opts.signal, onText: opts.onText, cache: false });
    });
  }

  /* ======================================================================
   * Parsing the markdown into sections
   * ==================================================================== */

  function sectionKey(title) {
    var t = title.toLowerCase();
    if (t.indexOf('short answer') !== -1) return 'short';
    if (t.indexOf('cards are saying') !== -1) return 'story';
    if (t.indexOf('card by card') !== -1) return 'cards';
    if (t.indexOf('pattern') !== -1) return 'patterns';
    if (t.indexOf('bringing') !== -1 || t.indexOf('together') !== -1) return 'together';
    return 'other';
  }

  function parse(md) {
    var out = { short: '', story: '', cards: [], patterns: '', together: '', other: [], intro: '' };
    var parts = String(md || '').split(/^##[ \t]+(.+)$/m);
    out.intro = parts[0].trim();
    for (var i = 1; i < parts.length; i += 2) {
      var title = parts[i].trim(), body = (parts[i + 1] || '').trim();
      var key = sectionKey(title);
      if (key === 'cards') out.cards = parseCards(body);
      else if (key === 'other') out.other.push({ title: title, body: body });
      else out[key] = body;
    }
    // A reply that ignored the headings is still shown, as the story.
    if (parts.length === 1 && out.intro) { out.story = out.intro; out.intro = ''; }
    return out;
  }

  // Entries start with a bold line ("**1. The Present: Death**").
  function parseCards(body) {
    var entries = [];
    body.split('\n').forEach(function (line) {
      var m = line.match(/^\s*(?:[-*]\s+)?\*\*(.+?)\*\*[:.]?\s*(.*)$/);
      if (m) entries.push({ title: m[1].replace(/[:.]$/, '').trim(), body: m[2] ? m[2] + '\n' : '' });
      else if (entries.length) entries[entries.length - 1].body += line + '\n';
    });
    entries.forEach(function (e) { e.body = e.body.trim(); });
    return entries;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/(^|\W)_([^_\n]+)_(?=\W|$)/g, '$1<em>$2</em>');
  }
  // Paragraphs and "-" / "*" bullet lists; everything escaped.
  function toHtml(md) {
    var html = '', list = null, para = [];
    function flushPara() { if (para.length) { html += '<p>' + inline(para.join(' ')) + '</p>'; para = []; } }
    function flushList() { if (list) { html += '<ul>' + list.map(function (li) { return '<li>' + inline(li) + '</li>'; }).join('') + '</ul>'; list = null; } }
    String(md || '').split('\n').forEach(function (raw) {
      var line = raw.trim();
      var bullet = line.match(/^[-*•]\s+(.*)$/);
      if (!line) { flushPara(); flushList(); }
      else if (bullet) { flushPara(); (list = list || []).push(bullet[1]); }
      else if (/^#{1,6}\s/.test(line)) { flushPara(); flushList(); html += '<p><strong>' + inline(line.replace(/^#+\s*/, '')) + '</strong></p>'; }
      else { flushList(); para.push(line); }
    });
    flushPara(); flushList();
    return html;
  }
  function plain(md) {
    return String(md || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2').replace(/^\s*[-*]\s+/gm, '').replace(/\s+/g, ' ').trim();
  }

  /* ======================================================================
   * Understanding the question
   * ==================================================================== */

  var TOPICS = {
    health: { re: /\b(health|ill|illness|sick|doctor|diagnos\w*|surgery|symptom\w*|pregnan\w*|mental|anxiety|depress\w*|therapy|recover\w*|medication|weight|sleep)\b/i, noun: 'health', pro: 'a doctor or another qualified health professional' },
    legal: { re: /\b(legal|lawyer|court|lawsuit|sue|custody|visa|immigration|police)\b/i, noun: 'legal', pro: 'a lawyer' },
    love: { re: /\b(love|relationship|partner|boyfriend|girlfriend|husband|wife|spouse|marr\w*|dat(e|ing)|crush|ex|romance|romantic|soulmate|feelings?|breakup|break up|divorce|engage\w*|propos\w*|fianc\w*|him|her)\b/i, noun: 'relationship' },
    career: { re: /\b(job|jobs|work|working|career|boss|manager|promotion|interview|business|colleague\w*|company|project|office|hire|hired|quit|resign\w*|offer|startup|client\w*|study|studies|degree|university|college|exam|role|team|salary|raise|appraisal)\b/i, noun: 'work' },
    money: { re: /\b(money|financ\w*|debt|invest\w*|savings?|loan|mortgage|rent|afford|income|budget|buy|buying|sell|selling|stocks?|crypto|price|property|house|flat|apartment)\b/i, noun: 'money', pro: 'a qualified financial adviser' },
    general: { re: /.^/, noun: 'situation' }
  };
  // Health and legal first (they add a safety note), then the most specific life areas.
  var TOPIC_ORDER = ['health', 'legal', 'love', 'career', 'money'];

  function detect(question) {
    var q = String(question || '').trim();
    var topic = 'general', bestHits = 0;
    if (TOPICS.health.re.test(q)) topic = 'health';
    else if (TOPICS.legal.re.test(q)) topic = 'legal';
    else {
      // The life area with the most matching words wins; ties go to the earlier one.
      ['love', 'career', 'money'].forEach(function (t) {
        var hits = (q.match(new RegExp(TOPICS[t].re.source, 'gi')) || []).length;
        if (hits > bestHits) { bestHits = hits; topic = t; }
      });
    }
    // "Will he come back?" — a person, and nothing about work or money: read it as love.
    if (topic === 'general' && /\b(he|she|him|her|they|them)\b/i.test(q)) topic = 'love';
    if (topic === 'general' && /\b(come back|get back|back together|miss(es)? me|text me|call me)\b/i.test(q)) topic = 'love';
    var type = !q ? 'none'
      : (/^(should|will|would|is|are|am|do|does|did|can|could|has|have|was|were|shall|must)\b/i.test(q) || /\bor not\b/i.test(q)) ? 'yesno' : 'open';
    var decision = /\b(should|decide|decision|choose|choice|or not|which)\b/i.test(q);
    return { topic: topic, type: type, decision: decision };
  }

  function topicField(topic) { return topic === 'love' || topic === 'career' || topic === 'money' ? topic : 'general'; }

  /* ======================================================================
   * Positions
   * ==================================================================== */

  function role(position) {
    var n = position.toLowerCase();
    if (/near future/.test(n)) return 'near';
    if (/outcome|potential|future/.test(n)) return 'outcome';
    if (/advice|action/.test(n)) return 'advice';
    if (/challenge|obstacle/.test(n)) return 'challenge';
    if (/hidden/.test(n)) return 'hidden';
    if (/other people|external/.test(n)) return 'others';
    if (/conscious goal/.test(n)) return 'goal';
    if (/subconscious/.test(n)) return 'below';
    if (/hope/.test(n)) return 'hopes';
    if (/strength/.test(n)) return 'strengths';
    if (/^you$/.test(n)) return 'you';
    if (/^them$/.test(n)) return 'them';
    if (/past/.test(n)) return 'past';
    return 'heart'; // Present, Situation, The Connection, The Message
  }
  var ROLE_FIELD = { advice: 'advice', outcome: 'outcome', challenge: 'challenge' };
  var ROLE_WEIGHT = { outcome: 2, heart: 1.5, near: 1, you: 1, them: 1, advice: 0.75, others: 0.75, hidden: 0.75, strengths: 0.75, challenge: 0.5, goal: 0.5, below: 0.5, hopes: 0.5, past: 0.3 };
  // A short lead-in that tells the reader what this position is asking.
  var ROLE_LEAD = {
    past: 'This is what brought you here.',
    near: 'This is what the next few weeks look like.',
    hidden: 'This is the part you may not be seeing.',
    others: 'This is how the people and circumstances around you are shaping things.',
    goal: 'This is what you consciously want here.',
    below: 'Underneath that, this is what is really driving you.',
    hopes: 'This card holds what you hope for and what you fear, which are often the same thing seen from two sides.',
    you: 'This is how you are showing up.',
    them: 'Read this as their side of things: how they are showing up.',
    strengths: 'This is what holds you together.'
  };

  function spreadPairs(p) {
    var spread = (T.SPREADS || []).filter(function (s) { return s.id === p.spreadId; })[0];
    return spread && spread.pairs ? spread.pairs : [];
  }

  /* ======================================================================
   * Weighing the cards
   * ==================================================================== */

  function deckCard(c) { return T.DECK.filter(function (d) { return d.id === c.id; })[0]; }

  var FALLBACK_TONE = { major: [0.5, 0.7, 0.3, 0.8, 0.5, 0.4, 0.7, 0.8, 0.7, 0, 0.5, 0.3, -0.2, -0.3, 0.5, -0.7, -0.9, 0.9, -0.5, 1, 0.5, 1] };
  function tone(c) {
    var L = T.LORE && T.LORE[c.id];
    if (L && L.tone) return c.orientation === 'reversed' ? L.tone.rev : L.tone.up;
    var card = deckCard(c);
    var b = card.arcana === 'major' ? FALLBACK_TONE.major[card.number] : 0.3;
    if (c.orientation === 'upright') return b;
    return b > 0 ? -b * 0.7 : -b * 0.4;
  }

  function weight(c) { return (ROLE_WEIGHT[role(c.position)] || 1) * (c.arcana === 'major' ? 1.5 : 1) * dignityFactor(c); }
  function dignityFactor(c) {
    if (!c.dignity) return 1;
    return c.dignity.state === 'strong' ? 1.3 : c.dignity.state === 'weak' ? 0.7 : 1;
  }

  // The verdict is led by the cards a reader actually answers from: the outcome
  // first, the heart of the matter second, and the rest of the spread as a
  // nudge. Averaging every card equally pulls big spreads towards zero, which
  // made almost every reading come out as "it depends".
  function lean(p) {
    var cards = p.cards;
    var outcome = pick(p, 'outcome');
    var heart = pick(p, 'heart') || cards[0];
    var major = function (c) { return Math.max(-1, Math.min(1, tone(c) * (c.arcana === 'major' ? 1.2 : 1) * dignityFactor(c))); };
    var rest = cards.filter(function (c) { return c !== outcome && c !== heart; });
    var rsum = 0, rw = 0;
    rest.forEach(function (c) { var w = weight(c); rsum += w * tone(c); rw += w; });
    var restAvg = rw ? rsum / rw : 0;

    var score;
    if (cards.length === 1) score = major(cards[0]);
    else if (outcome && outcome !== heart) score = 0.5 * major(outcome) + 0.3 * major(heart) + 0.2 * restAvg;
    else score = 0.6 * major(heart) + 0.4 * restAvg;

    var ot = outcome ? tone(outcome) : null;
    var verdict;
    if (score >= 0.1) verdict = ot !== null && ot <= -0.4 ? 'notyet' : 'yes';
    else if (score <= -0.1) verdict = ot !== null && ot >= 0.5 ? 'notyet' : 'no';
    else if (ot !== null && ot >= 0.2) verdict = 'notyet';   // good outcome, rocky road
    else if (cards.length === 1) verdict = 'notyet';          // a muted single card
    else verdict = 'mixed';
    // A single good card that is reversed is a yes that is held back.
    if (verdict === 'yes' && cards.length === 1 && cards[0].orientation === 'reversed' && score < 0.4) verdict = 'notyet';
    // A spread that is mostly reversed holds a yes back.
    if (verdict === 'yes' && p.options.reversals && cards.length >= 3 && p.patterns.reversals >= Math.ceil(cards.length * 2 / 3)) verdict = 'notyet';
    return { avg: score, verdict: verdict };
  }

  function pick(p, r) { return p.cards.filter(function (c) { return role(c.position) === r; })[0] || null; }
  function hardest(p) {
    var worst = null;
    p.cards.forEach(function (c) { if (role(c.position) !== 'past' && (!worst || tone(c) < tone(worst))) worst = c; });
    return worst && tone(worst) < 0 ? worst : null;
  }
  function strongest(p) {
    var best = null;
    p.cards.forEach(function (c) { if (role(c.position) !== 'past' && (!best || tone(c) * weight(c) > tone(best) * weight(best))) best = c; });
    return best && tone(best) > 0 ? best : null;
  }

  /* ======================================================================
   * Small text helpers
   * ==================================================================== */

  function label(c) { return c.card + (c.orientation === 'reversed' ? ' reversed' : ''); }
  // "the Five of Cups", "The Star", "Death", "the Wheel of Fortune"
  function theLabel(c) {
    if (/^The /.test(c.card)) return label(c);
    if (c.arcana === 'major' && c.card !== 'Wheel of Fortune') return label(c);
    return 'the ' + label(c);
  }
  function TheLabel(c) { return cap(theLabel(c)); }
  function kw(c, n) { return c.keywords.slice(0, n || 2).join(' and '); }
  function firstSentence(s) { var m = String(s).match(/^.*?[.!?](\s|$)/); return (m ? m[0] : s).trim(); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function posName(c) { return c.position.split('·').pop().trim().replace(/^The /, '').toLowerCase(); }
  function inPos(c) {
    var r = role(c.position);
    if (r === 'you') return theLabel(c) + ' on your side';
    if (r === 'them') return theLabel(c) + ' on their side';
    return theLabel(c) + ' in the ' + posName(c) + ' position';
  }
  function listJoin(arr) { return arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]; }

  var ELEMENT_REL = {
    'Fire|Air': 'friendly', 'Air|Fire': 'friendly', 'Water|Earth': 'friendly', 'Earth|Water': 'friendly',
    'Fire|Water': 'hostile', 'Water|Fire': 'hostile', 'Air|Earth': 'hostile', 'Earth|Air': 'hostile'
  };
  function elementRel(a, b) { return a.element === b.element ? 'same' : (ELEMENT_REL[a.element + '|' + b.element] || 'neutral'); }

  /* ======================================================================
   * The rule-based reader
   * ==================================================================== */

  var VERDICT_LINE = { yes: 'Leaning yes.', no: 'Leaning no.', notyet: 'Not yet.', mixed: 'It depends.' };
  var TONE_WORD = function (avg) { return avg >= 0.25 ? 'encouraging' : avg <= -0.25 ? 'challenging' : 'mixed'; };

  var SUGGEST = {
    career: { yes: 'This week, take one concrete step that moves this forward: send the application, ask for the conversation, or pitch the idea.', no: 'Before you commit, write down what would make this a clear yes and check it honestly against what you know.', notyet: 'Set a date two to four weeks out to look at this again, and use the time to find the one piece of information you are missing.', mixed: 'Talk it through with one person who knows your work well and ask which way they would lean.' },
    love: { yes: 'In the next few days, say the thing you have been holding back, plainly and kindly.', no: 'Write down what you need from a relationship and notice honestly where this one falls short.', notyet: 'Give it a few weeks and watch what the other person does, not just what they say.', mixed: 'Have one honest conversation about where this is going before you decide anything.' },
    money: { yes: 'Write the numbers down in one place, set a limit you will not go past, and then act.', no: 'Hold off for now and put the money question on paper: income, costs and the worst case.', notyet: 'Give yourself a waiting period before you commit any money, and use it to compare at least one alternative.', mixed: 'List the two or three numbers that would change your mind and find them out before you decide.' },
    health: { yes: 'Keep up the routines that are helping, and write down how you feel each day for a week.', no: 'Slow down and give yourself more rest than feels necessary this week.', notyet: 'Be patient with the pace of things and keep a simple daily note of what helps.', mixed: 'Write down your questions before your next appointment so nothing gets missed.' },
    legal: { yes: 'Gather every document you have into one place and get proper advice on your next step.', no: 'Pause before acting and get qualified advice on your options.', notyet: 'Use the waiting time to organise your paperwork and timeline.', mixed: 'Write a one-page summary of the facts and the outcome you want before you talk to anyone.' },
    general: { yes: 'Pick one thing this reading points to and act on it before the week is out.', no: 'Notice where you are pushing against the current and ease off there.', notyet: 'Give this time, and write down what you notice over the next couple of weeks.', mixed: 'Write down the one question this reading leaves you with and come back to it in a few days.' }
  };
  var SUGGEST_DECISION = { yes: 'Make the decision this week and set one small first step to start it.', no: 'Write down why you were drawn to this, and see whether another option gives you the same thing.', notyet: 'Choose a date to decide by, and until then gather the one fact you are missing.', mixed: 'Imagine you have already chosen each option, and notice which one leaves you lighter.' };

  var MISSING_ELEMENT = {
    Fire: 'drive or motivation may be what is missing',
    Water: 'feelings may be getting less attention than they need',
    Air: 'clear thinking or an honest conversation may be what is missing',
    Earth: 'practical grounding or follow-through may be what is missing'
  };

  var SUIT_LENS = {
    career: { wands: 'drive and ambition: your appetite for the work itself', cups: 'how much this work actually matters to you', swords: 'decisions, difficult conversations and office politics', pentacles: 'the practical side: pay, security and the job itself' },
    love: { wands: 'desire and momentum: whether there is real spark here', cups: 'the heart of it: feelings, closeness and care', swords: 'what is being thought or said, or not said, between you', pentacles: 'commitment and the practical shape of a shared life' },
    money: { wands: 'initiative: the deal you chase, the risk you take', cups: 'how you feel about money: security, guilt or generosity', swords: 'clear thinking and hard decisions', pentacles: 'your finances directly' },
    general: { wands: 'energy, drive and what you want to make happen', cups: 'feelings and relationships', swords: 'thoughts, conversations and decisions', pentacles: 'practical matters: work, money and daily life' }
  };

  function fallback(p) {
    var d = detect(p.question);
    var field = topicField(d.topic);
    var lensTopic = SUIT_LENS[d.topic] ? d.topic : 'general';
    var L = lean(p);
    var topicNoun = TOPICS[d.topic].noun;
    var n = p.cardCount;
    var heart = pick(p, 'heart') || p.cards[0];
    var outcome = pick(p, 'outcome');
    var advice = pick(p, 'advice');
    var challenge = pick(p, 'challenge');
    var past = pick(p, 'past');
    var worst = hardest(p);
    var best = strongest(p);
    var used = {}, inShort = {};
    function say(s) { used[s] = true; return s; }
    function fresh(s) { return !used[s]; }
    var md = [];

    /* ---------- The short answer ---------- */
    md.push('## The short answer');
    var short = [];
    var focus = outcome || heart;
    var named;
    if (d.type === 'yesno') {
      if (L.verdict === 'yes') {
        named = tone(focus) > 0 ? focus : (best || focus);
        short.push('**' + VERDICT_LINE.yes + '** ' + say(cardText(named, named === outcome ? 'outcome' : field)));
        short.push(n === 1 ? 'That is the message of ' + theLabel(named) + '.' : 'That is what ' + inPos(named) + ' says, and the rest of the spread ' + (L.avg >= 0.45 ? 'clearly backs it up.' : 'mostly supports it.'));
      } else if (L.verdict === 'no') {
        named = tone(focus) < 0 ? focus : (worst || focus);
        short.push('**' + VERDICT_LINE.no + '** ' + say(cardText(named, named === outcome ? 'outcome' : (named === challenge ? 'challenge' : field))));
        short.push(n === 1 ? 'That is the message of ' + theLabel(named) + '.' : 'That is the message of ' + inPos(named) + ', and too much of this spread pushes against it.');
      } else if (L.verdict === 'notyet') {
        named = tone(focus) < 0 ? focus : (worst || challenge || focus);
        short.push('**' + VERDICT_LINE.notyet + '** The cards do not close the door, but something has to shift first. ' + say(cardText(named, named === outcome ? 'outcome' : 'challenge')));
        short.push('That is what ' + (n === 1 ? theLabel(named) : inPos(named)) + ' is pointing to.');
      } else {
        named = advice || challenge || heart;
        short.push('**' + VERDICT_LINE.mixed + '** The cards are evenly balanced, so the deciding factor is in your hands. ' + say(cardText(named, 'advice')));
        short.push('That comes from ' + inPos(named) + '.');
      }
    } else if (d.type === 'open') {
      named = heart;
      short.push(say(firstSentence(cardText(heart, field))));
      if (outcome && outcome !== heart) short.push(say(cardText(outcome, 'outcome')));
      else if (advice) short.push(say(cardText(advice, 'advice')));
      short.push('Overall, the cards are ' + TONE_WORD(L.avg) + ' about your ' + topicNoun + '.');
    } else {
      named = heart;
      short.push('The main message of this spread comes from ' + inPos(heart) + ': ' + kw(heart) + '.');
      short.push(say(firstSentence(cardText(heart, 'general'))));
      if (outcome && outcome !== heart) short.push(say(cardText(outcome, 'outcome')));
    }
    md.push(short.join(' '));
    Object.keys(used).forEach(function (k) { inShort[k] = true; });

    /* ---------- What the cards are saying ---------- */
    md.push('', '## What the cards are saying');
    if (n === 1) {
      var c0 = p.cards[0];
      var one = [];
      var t1 = cardText(c0, field);
      if (fresh(t1)) one.push(say(t1));
      var g1 = cardText(c0, 'general');
      if (field !== 'general' && fresh(g1)) one.push('More broadly: ' + say(g1));
      if (c0.arcana === 'major') one.push('As a Major Arcana card, this points to something larger than a passing mood: a real turning point in your ' + topicNoun + '.');
      else if (c0.suit) one.push('As a ' + T.SUITS[c0.suit].name + ' card, it speaks to ' + SUIT_LENS[lensTopic][c0.suit] + '.');
      md.push(one.join(' '));
    } else {
      md.push(storyParagraph(p, { heart: heart, outcome: outcome, advice: advice, challenge: challenge, past: past, worst: worst, best: best }));
      var links = pairParagraph(p);
      var para2 = [];
      if (links) para2.push(links);
      var strong = p.cards.filter(function (c) { return c.dignity && c.dignity.state === 'strong' && (ROLE_WEIGHT[role(c.position)] || 1) >= 1; }).slice(0, 2);
      var weak = p.cards.filter(function (c) { return c.dignity && c.dignity.state === 'weak' && (ROLE_WEIGHT[role(c.position)] || 1) >= 1; }).slice(0, 2);
      if (strong.length) para2.push(cap(listJoin(strong.map(theLabel))) + (strong.length > 1 ? ' are' : ' is') + ' backed up by the cards around ' + (strong.length > 1 ? 'them' : 'it') + ', so give ' + (strong.length > 1 ? 'them' : 'it') + ' extra weight.');
      if (weak.length) para2.push(cap(listJoin(weak.map(theLabel))) + (weak.length > 1 ? ' are' : ' is') + ' muffled by ' + (weak.length > 1 ? 'their' : 'its') + ' neighbours, so expect ' + (weak.length > 1 ? 'those influences' : 'that influence') + ' to be quieter or slower to show.');
      if (para2.length) md.push('', para2.join(' '));
    }

    /* ---------- Card by card ---------- */
    md.push('', '## Card by card');
    var courtNoted = false;
    p.cards.forEach(function (c) {
      var r = role(c.position);
      md.push('', '**' + c.number + '. ' + c.position + ': ' + label(c) + '**');
      var s = [];
      if (ROLE_FIELD[r]) {
        var rt = cardText(c, ROLE_FIELD[r]);
        if (fresh(rt)) s.push(say(rt));
      } else if (ROLE_LEAD[r]) s.push(ROLE_LEAD[r]);
      var tt = cardText(c, field);
      if (fresh(tt)) s.push(say(tt));
      else if (fresh(cardText(c, 'general'))) s.push(say(cardText(c, 'general')));
      else if (!ROLE_FIELD[r] && fresh(cardText(c, 'advice'))) s.push('What it asks of you: ' + say(cardText(c, 'advice')).replace(/^./, function (ch) { return ch.toLowerCase(); }));
      if (!s.length || (s.length === 1 && ROLE_LEAD[r])) s.push(tt);
      if (deckCard(c).court && !courtNoted && r !== 'you' && r !== 'them' && n > 1) {
        s.push('As a court card, this may be a real person in your life, or a side of you that this situation is calling up.');
        courtNoted = true;
      }
      if (c.dignity && (ROLE_WEIGHT[r] || 1) >= 1) {
        if (c.dignity.state === 'strong') {
          var ally = c.dignity.neighbours.filter(function (x) { return x.relation === 'same' || x.relation === 'friendly'; })[0];
          if (ally) s.push('Beside ' + ally.card + ', which shares or feeds its element, this card speaks louder.');
        } else if (c.dignity.state === 'weak') {
          var foe = c.dignity.neighbours.filter(function (x) { return x.relation === 'hostile'; })[0];
          if (foe) s.push('Beside ' + foe.card + ', whose element works against it, its influence is weaker or slower to show.');
        }
      }
      md.push(s.join(' '));
    });

    /* ---------- Patterns worth noticing ---------- */
    var bullets = [];
    var pt = p.patterns;
    if (n >= 3 && pt.majors / n >= 0.5) bullets.push('**' + pt.majors + ' of ' + n + ' cards are Major Arcana.** This is bigger than an everyday ' + topicNoun + ' matter: something with real consequences is moving, and not all of it is in your hands.');
    else if (n >= 5 && pt.majors === 0) bullets.push('**No Major Arcana.** This is an everyday matter, which means the choices you make decide how it goes.');
    if (pt.dominantSuit) {
      var ds = Object.keys(T.SUITS).filter(function (s) { return T.SUITS[s].name === pt.dominantSuit; })[0];
      bullets.push('**' + pt.dominantSuit + ' lead.** For your question, that puts the weight on ' + SUIT_LENS[lensTopic][ds] + '.');
    }
    if (n >= 6 && pt.missingElements.length === 1) bullets.push('**No ' + pt.missingElements[0] + ' cards.** ' + cap(MISSING_ELEMENT[pt.missingElements[0]]) + '.');
    if (p.options.reversals && n >= 3 && pt.reversals > n / 2) bullets.push('**' + pt.reversals + ' of ' + n + ' cards are reversed.** A lot is blocked or still working itself out inside you, so expect slower progress than you would like.');
    if (n >= 5 && pt.courts.length >= 3) bullets.push('**' + pt.courts.length + ' court cards.** Other people, and the roles you play around them, are central to this.');
    pt.repeatedNumbers.forEach(function (r) { bullets.push('**Repeated ' + r.label + '.** They underline ' + r.theme + '.'); });
    if (bullets.length) {
      md.push('', '## Patterns worth noticing', '');
      bullets.slice(0, 4).forEach(function (b) { md.push('- ' + b); });
    }

    /* ---------- Bringing it together ---------- */
    md.push('', '## Bringing it together');
    var end = [];
    if (d.type === 'yesno') end.push({ yes: 'On balance, the cards lean towards yes.', no: 'On balance, the cards lean towards no.', notyet: 'On balance, the answer is not yet: the door is open, but the timing is not right.', mixed: 'On balance, this could go either way, and that makes your choices the deciding factor.' }[L.verdict]);
    else end.push('Overall, the cards are ' + TONE_WORD(L.avg) + ' about your ' + topicNoun + '.');
    var guide = advice || (L.verdict === 'no' && best ? best : null) || (heart !== named ? heart : null) || best || heart;
    var gt = cardText(guide, 'advice');
    if (!inShort[gt]) end.push('The main thing to keep in mind comes from ' + theLabel(guide) + ': ' + say(gt).replace(/^./, function (ch) { return ch.toLowerCase(); }));
    if (worst && worst !== guide) {
      var wt = cardText(worst, 'challenge');
      if (!inShort[wt]) end.push('Watch out for this, from ' + theLabel(worst) + ': ' + say(wt).replace(/^./, function (ch) { return ch.toLowerCase(); }));
    }
    if (TOPICS[d.topic].pro) end.push('For a ' + topicNoun + ' question like this, it is also worth talking to ' + TOPICS[d.topic].pro + '.');
    var sg = SUGGEST[d.topic] || SUGGEST.general;
    end.push(d.decision && d.topic === 'general' ? SUGGEST_DECISION[L.verdict] : sg[L.verdict]);
    md.push(end.join(' '));

    return md.join('\n');
  }

  // The spread told as one story, in order of time and weight.
  function storyParagraph(p, k) {
    var s = [];
    var you = pick(p, 'you'), them = pick(p, 'them');
    var near = pick(p, 'near');
    var start = k.past || p.cards[0];
    if (k.past) s.push('The story starts with ' + inPos(k.past) + ': ' + kw(k.past) + ' are what led here.');
    if (you && them) {
      var rel = elementRel(you, them);
      s.push('You show up as ' + theLabel(you) + ' (' + kw(you) + '), and they show up as ' + theLabel(them) + ' (' + kw(them) + ').');
      s.push({ same: 'You share an element, so you come at this in a similar way, for better and worse.', friendly: 'Your elements support each other, so there is a natural give and take between you.', hostile: 'Your elements pull against each other, so you are approaching this from opposite directions, and that gap is worth talking about.', neutral: 'You are different without being opposed.' }[rel]);
    }
    if (k.heart && k.past) s.push('Right now, the heart of the matter is ' + theLabel(k.heart) + ': ' + kw(k.heart) + '.');
    else if (k.heart) s.push('At the centre of it is ' + theLabel(k.heart) + ': ' + kw(k.heart) + '.');
    if (k.challenge) s.push('Crossing that is ' + theLabel(k.challenge) + ', which brings ' + kw(k.challenge) + ' into the picture.');
    if (near) s.push('In the coming weeks, ' + theLabel(near) + ' brings ' + kw(near) + '.');
    if (k.outcome) s.push('Where it is heading, ' + theLabel(k.outcome) + ' points to ' + kw(k.outcome) + '.');
    // The arc: does it get easier or harder?
    var end = k.outcome || p.cards[p.cards.length - 1];
    if (end !== start) {
      var diff = tone(end) - tone(start);
      if (diff >= 0.5) s.push('So the direction is good: things get easier from here.');
      else if (diff <= -0.5) s.push('So be ready for this to get harder before it settles.');
      else if (start.element === end.element && p.cardCount >= 3) s.push('The first and last cards share an element, so watch for an old pattern repeating rather than a clean break.');
    }
    if (k.worst && k.worst !== k.challenge && k.worst !== k.outcome && k.worst !== start && k.worst !== k.heart) s.push('The sticking point is ' + inPos(k.worst) + ': ' + kw(k.worst) + '.');
    else if (!p.cards.some(function (c) { return tone(c) < 0; }) && k.best) s.push('There is no hard card here; the strongest support comes from ' + inPos(k.best) + '.');
    return s.join(' ');
  }

  // The spread's paired positions, read against each other.
  function pairParagraph(p) {
    var out = [];
    spreadPairs(p).slice(0, 3).forEach(function (pr) {
      var a = p.cards[pr.a], b = p.cards[pr.b];
      if (!a || !b) return;
      var line;
      if (pr.lens === 'mirror' && role(a.position) === 'you' && role(b.position) === 'them') return;
      if (pr.lens === 'arc') {
        var diff = tone(b) - tone(a);
        line = 'From ' + theLabel(a) + ' to ' + theLabel(b) + ', the focus moves from ' + kw(a, 1) + ' to ' + kw(b, 1) +
          (diff >= 0.5 ? ', a real improvement.' : diff <= -0.5 ? ', so do not expect this to resolve on its own.' : '.');
      } else if (pr.lens === 'mirror') {
        var rel = elementRel(a, b);
        line = pr.title + ': ' + theLabel(a) + ' and ' + theLabel(b) + ' ' +
          { same: 'pull in the same direction.', friendly: 'support each other.', hostile: 'pull against each other, and that tension is worth your attention.', neutral: 'are different but not in conflict.' }[rel];
      } else if (pr.lens === 'tension') {
        line = Math.abs(tone(a)) >= Math.abs(tone(b))
          ? 'What holds this together (' + label(a) + ') is stronger than what pulls at it (' + label(b) + ').'
          : 'What pulls at this (' + label(b) + ') is currently stronger than what holds it together (' + label(a) + '), so the strengths need tending.';
      } else if (pr.lens === 'remedy') {
        var adv = role(a.position) === 'advice' ? a : b, obs = adv === a ? b : a;
        line = 'The answer to ' + kw(obs, 1) + ' (' + theLabel(obs) + ') is in ' + theLabel(adv) + ': ' + cardText(adv, 'advice').replace(/^./, function (ch) { return ch.toLowerCase(); });
      } else if (pr.lens === 'cause') {
        line = tone(b) >= 0
          ? 'Act on ' + theLabel(a) + ' and the outcome follows: ' + kw(a, 1) + ' leads to ' + kw(b, 1) + '.'
          : 'Even acting on ' + theLabel(a) + ', the outcome shows ' + kw(b, 1) + ', so go in with clear eyes.';
      }
      if (line) out.push(line);
    });
    return out.join(' ');
  }

  T.reader = {
    READER_PROMPT: READER_PROMPT,
    payloadText: payloadText,
    buildInput: buildInput,
    sampleReady: sampleReady,
    write: write,
    followUp: followUp,
    parse: parse,
    toHtml: toHtml,
    inline: inline,
    plain: plain,
    fallback: fallback,
    detect: detect,
    lean: lean
  };
})();
