/* The reader: turns the engine's facts into a reading that answers the question.
 *
 * - With Claude available (the page runs as a claude.ai artifact that declares
 *   the `sample` capability), the facts and the question go to Claude with
 *   READER_PROMPT and the reading streams back as markdown.
 * - Otherwise a rule-based reader writes the same five sections from the same
 *   facts, so the page always has a complete reading.
 * Both produce markdown with the same fixed headings, parsed by parse(). */
(function () {
  'use strict';

  var T = window.Tarot;

  var READER_PROMPT = 'You are an experienced, warm and grounded tarot reader giving a private reading. You speak plainly, like a thoughtful person across the table, not like a textbook. Use only the cards and facts provided; never invent cards or change orientations.\n\n' +
    'Write the reading in exactly these sections, with these headings:\n\n' +
    '## The short answer\n' +
    '2–3 sentences that directly answer the question asked. If it is a yes/no or should-I question, give a clear lean (yes, no, not yet, or it depends on X) and say why in one line. If no question was given, state the main message of the spread.\n\n' +
    '## What the cards are saying\n' +
    'One or two paragraphs telling the story of the spread as a whole: how the cards connect, what changes from one position to the next, where the tension or turning point is. Refer to cards by name, but explain them through the person’s situation, not as definitions.\n\n' +
    '## Card by card\n' +
    'For each card in order: a bold line with the position and card (and ‘reversed’ if so), then 2–4 sentences on what this card means *in this position, for this question*. Mention the elemental dignity or neighbouring-card effect only when it changes the meaning.\n\n' +
    '## Patterns worth noticing\n' +
    '2–4 short bullet points, only if meaningful: many Major Arcana, a dominant or missing suit, many reversals, repeated numbers. Explain what each means for the question in plain words. Skip this section if nothing stands out.\n\n' +
    '## Bringing it together\n' +
    'A clear conclusion in 3–5 sentences: the overall verdict on the question, the main thing to do or keep in mind, and what to watch for. End with one concrete, practical suggestion.\n\n' +
    'Style rules: second person (‘you’), warm but direct, no clichés like ‘the universe has a plan’, no hedging every sentence, no mention of being an AI. Plain English, short paragraphs, around 450–650 words in total (shorter for 1–3 card spreads). Present tarot as reflection and guidance, not certainty about the future. For questions about health, legal or financial decisions, or safety, give the reading but gently suggest also talking to an appropriate professional, in one sentence.';

  var FOLLOW_UP_RULES = 'Answer as the same reader, in under 200 words, drawing only on the cards in this reading. ' +
    'Speak to the person directly in plain prose: no headings, no lists, no recap of the whole reading.';

  /* ---------- the facts, as labelled data ---------- */

  function payloadText(p) {
    var lines = [];
    lines.push('QUESTION: ' + (p.question ? p.question : '(none given: read the spread’s main message)'));
    lines.push('SPREAD: ' + p.spread + ' (' + p.cardCount + (p.cardCount === 1 ? ' card)' : ' cards)'));
    lines.push('METHOD: reversals ' + (p.options.reversals ? 'on' : 'off') + '; elemental dignities ' + (p.options.dignities ? 'on' : 'off'));
    lines.push('');
    lines.push('CARDS, IN ORDER');
    p.cards.forEach(function (c) {
      lines.push('');
      lines.push(c.number + '. Position: ' + c.position + ' (' + c.positionMeaning + ')');
      lines.push('   Card: ' + c.card + ', ' + c.orientation + (c.arcana === 'major' ? ' (Major Arcana)' : ''));
      lines.push('   Keywords: ' + c.keywords.join(', '));
      lines.push('   Core meaning (' + c.orientation + '): ' + c.meaning);
      lines.push('   Element: ' + c.element);
      if (c.dignity) {
        lines.push('   Elemental dignity: ' + c.dignity.effect + ' (' + c.dignity.neighbours.map(function (n) {
          return 'beside ' + n.card + ', ' + n.relation;
        }).join('; ') + ')');
      }
    });
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
    return lines.join('\n');
  }

  function buildInput(payload) {
    return READER_PROMPT + '\n\n----\nTHE READING DATA\n\n' + payloadText(payload);
  }

  /* ---------- Claude ---------- */

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

  /* ---------- parsing the markdown into sections ---------- */

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

  /* ---------- the rule-based reader (fallback) ---------- */

  var TOPICS = {
    health: { re: /\b(health|ill|illness|sick|doctor|diagnos\w*|surgery|symptom\w*|pregnan\w*|mental|anxiety|depress\w*|therapy|recover\w*|medication|body|weight|sleep)\b/i, noun: 'health', pro: 'a doctor or another qualified health professional' },
    money: { re: /\b(money|financ\w*|debt|invest\w*|salary|savings?|loan|mortgage|rent|afford|income|budget|buy|buying|sell|selling|stocks?|crypto|price)\b/i, noun: 'money', pro: 'a qualified financial adviser' },
    legal: { re: /\b(legal|lawyer|court|lawsuit|sue|custody|divorce|visa|immigration|contract|police)\b/i, noun: 'legal', pro: 'a lawyer' },
    love: { re: /\b(love|relationship|partner|boyfriend|girlfriend|husband|wife|spouse|marr\w*|dat(e|ing)|crush|ex|romance|romantic|soulmate|feelings?|breakup|break up|him|her)\b/i, noun: 'relationship' },
    career: { re: /\b(job|work|career|boss|promotion|interview|business|colleague\w*|company|project|office|hire|hired|quit|resign\w*|offer|startup|client\w*|study|studies|degree|university|college|exam)\b/i, noun: 'work' },
    decision: { re: /\b(should|decide|decision|choose|choice|or not|which)\b/i, noun: 'decision' },
    general: { re: /.^/, noun: 'situation' }
  };
  var TOPIC_ORDER = ['health', 'legal', 'money', 'love', 'career', 'decision'];

  function detect(question) {
    var q = String(question || '').trim();
    var topic = 'general';
    for (var i = 0; i < TOPIC_ORDER.length; i++) { if (TOPICS[TOPIC_ORDER[i]].re.test(q)) { topic = TOPIC_ORDER[i]; break; } }
    var type = !q ? 'none'
      : (/^(should|will|would|is|are|am|do|does|did|can|could|has|have|was|were|shall|must)\b/i.test(q) || /\bor not\b/i.test(q)) ? 'yesno' : 'open';
    return { topic: topic, type: type };
  }

  // How a suit speaks to each kind of question (from the suit domains in the deck data).
  var SUIT_LENS = {
    career: { wands: 'Wands are about drive and ambition, so this card speaks to your energy for the work itself.', cups: 'Cups bring feelings into a work question: how much this actually matters to you.', swords: 'Swords in a work question point to decisions, conversations and office politics.', pentacles: 'Pentacles are the suit of work and money, so this card is squarely about the practical side.' },
    love: { wands: 'Wands in love are about desire and momentum: is there real spark here?', cups: 'Cups are the suit of the heart, so this card carries extra weight in a relationship question.', swords: 'In love, Swords point to what is being thought or said, or not said, between you.', pentacles: 'Pentacles in love are about commitment and the practical shape of a shared life.' },
    money: { wands: 'Wands bring initiative to money: the deal you go after, the risk you take.', cups: 'Cups in a money question are about how you feel about it: security, guilt or generosity.', swords: 'Swords around money mean clear thinking and hard decisions are needed.', pentacles: 'Pentacles are the money suit, so this card speaks to your finances directly.' },
    health: { wands: 'Wands relate to energy and vitality.', cups: 'Cups point to the emotional side of how you are feeling.', swords: 'Swords can show worry and mental strain.', pentacles: 'Pentacles are the suit of the body and daily routine.' },
    legal: { wands: 'Wands bring the will to act and push your case.', cups: 'Cups show the feelings tied up in the matter.', swords: 'Swords are the suit of judgment, argument and truth, central to any legal question.', pentacles: 'Pentacles point to the practical and financial stakes.' },
    decision: { wands: 'Wands lean towards acting on instinct.', cups: 'Cups ask what your heart wants here.', swords: 'Swords ask you to think it through clearly.', pentacles: 'Pentacles weigh the practical consequences.' },
    general: { wands: 'Wands show where your energy is going.', cups: 'Cups show what you feel.', swords: 'Swords show what is on your mind.', pentacles: 'Pentacles show the practical side of things.' }
  };

  // How each card leans, from -1 (hard) to 1 (supportive), before orientation.
  var MAJOR_TONE = [0.5, 0.7, 0.3, 0.8, 0.5, 0.4, 0.7, 0.8, 0.7, 0, 0.5, 0.3, -0.2, -0.3, 0.5, -0.7, -0.9, 0.9, -0.5, 1, 0.5, 1];
  var MINOR_TONE = {
    wands: { 1: 0.8, 3: 0.7, 4: 0.9, 5: -0.4, 6: 0.9, 7: -0.1, 8: 0.6, 9: -0.1, 10: -0.5 },
    cups: { 1: 0.9, 2: 0.9, 3: 0.8, 4: -0.3, 5: -0.7, 7: -0.3, 8: -0.3, 9: 1, 10: 1 },
    swords: { 1: 0.5, 2: -0.3, 3: -0.9, 4: -0.1, 5: -0.6, 6: 0.2, 7: -0.5, 8: -0.7, 9: -0.9, 10: -1 },
    pentacles: { 1: 0.9, 3: 0.7, 4: -0.1, 5: -0.8, 6: 0.6, 7: 0.1, 9: 0.9, 10: 0.9 }
  };
  function baseTone(c) {
    var card = T.DECK.filter(function (d) { return d.id === c.id; })[0];
    if (card.arcana === 'major') return MAJOR_TONE[card.number];
    var t = MINOR_TONE[card.suit][card.rank];
    return t != null ? t : (card.court ? 0.4 : 0.3);
  }
  function tone(c) {
    var b = baseTone(c);
    if (c.orientation === 'upright') return b;
    if (b > 0) return -b * 0.7;      // a good card reversed is blocked
    if (b < 0) return -b * 0.4;      // a hard card reversed is easing
    return -0.2;
  }

  function role(position) {
    var n = position.toLowerCase();
    if (/outcome|potential/.test(n)) return 'outcome';
    if (/near future/.test(n)) return 'other';
    if (/future/.test(n)) return 'outcome';
    if (/advice|action/.test(n)) return 'advice';
    if (/challenge|obstacle/.test(n)) return 'challenge';
    if (/present|situation|connection|message/.test(n)) return 'heart';
    if (/past/.test(n)) return 'past';
    if (/hope/.test(n)) return 'hopes';
    return 'other';
  }
  var ROLE_WEIGHT = { outcome: 2, heart: 1.5, advice: 0.75, challenge: 0.5, past: 0.5, hopes: 0.5, other: 1 };

  function lean(p) {
    var sum = 0, wsum = 0;
    p.cards.forEach(function (c) {
      var w = ROLE_WEIGHT[role(c.position)] * (c.arcana === 'major' ? 1.5 : 1);
      sum += w * tone(c); wsum += w;
    });
    var avg = wsum ? sum / wsum : 0;
    var outcome = pick(p, 'outcome');
    var verdict;
    if (avg >= 0.25) verdict = 'yes';
    else if (avg <= -0.25) verdict = 'no';
    else if ((outcome && tone(outcome) < 0) || (p.options.reversals && p.patterns.reversals > p.cardCount / 2)) verdict = 'notyet';
    else verdict = 'mixed';
    return { avg: avg, verdict: verdict };
  }

  function pick(p, r) { return p.cards.filter(function (c) { return role(c.position) === r; })[0] || null; }
  function hardest(p) {
    var worst = null;
    p.cards.forEach(function (c) { if (role(c.position) !== 'past' && (!worst || tone(c) < tone(worst))) worst = c; });
    return worst && tone(worst) < 0 ? worst : null;
  }
  function strongest(p) {
    var best = null;
    p.cards.forEach(function (c) { if (!best || tone(c) > tone(best)) best = c; });
    return best;
  }

  function label(c) { return c.card + (c.orientation === 'reversed' ? ' reversed' : ''); }
  function theLabel(c) { return (/^The /.test(c.card) ? '' : 'the ') + label(c); }
  function isKey(c) { return ['heart', 'outcome', 'advice', 'challenge'].indexOf(role(c.position)) !== -1; }
  function kw(c, n) { return c.keywords.slice(0, n || 2).join(' and '); }
  function firstSentence(s) { var m = String(s).match(/^.*?[.!?](\s|$)/); return (m ? m[0] : s).trim(); }
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function toYou(s) {
    return String(s)
      .replace(/\bam I\b/g, 'are you').replace(/\bI am\b/g, 'you are').replace(/\bI'm\b/g, 'you’re').replace(/\bI’m\b/g, 'you’re')
      .replace(/\bI\b/g, 'you').replace(/\bme\b/g, 'you').replace(/\bmy\b/g, 'your').replace(/\bMy\b/g, 'Your')
      .replace(/\bmyself\b/g, 'yourself').replace(/\bmine\b/g, 'yours').replace(/\bus\b/g, 'you both').replace(/\bour\b/g, 'your');
  }
  function positionAsk(c) { return lower(toYou(c.positionMeaning)).replace(/\?$/, ''); }
  function role2name(c) { return c.position.split('·').pop().trim().replace(/^The /, '').toLowerCase(); }

  var VERDICT_LINE = { yes: 'Leaning yes.', no: 'Leaning no.', notyet: 'Not yet.', mixed: 'Mixed.' };
  var TONE_WORD = function (avg) { return avg >= 0.25 ? 'encouraging' : avg <= -0.25 ? 'challenging' : 'mixed'; };

  var SUGGEST = {
    career: { yes: 'This week, take one concrete step that moves this forward: send the application, ask for the conversation, or pitch the idea.', no: 'Before you commit, write down what would make this a clear yes and check it honestly against what you know.', notyet: 'Set a date two to four weeks out to look at this again, and use the time to find the one piece of information you are missing.', mixed: 'Talk it through with one person who knows your work well and ask which way they would lean.' },
    love: { yes: 'In the next few days, say the thing you have been holding back, plainly and kindly.', no: 'Write down what you need from a relationship and notice honestly where this one falls short.', notyet: 'Give it a few weeks and watch what the other person does, not just what they say.', mixed: 'Have one honest conversation about where this is going before you decide anything.' },
    money: { yes: 'Write the numbers down in one place, set a limit you will not go past, and then act.', no: 'Hold off for now and put the money question on paper: income, costs and the worst case.', notyet: 'Give yourself a waiting period before you commit any money, and use it to compare at least one alternative.', mixed: 'List the two or three numbers that would change your mind and find them out before you decide.' },
    health: { yes: 'Keep up the routines that are helping, and write down how you feel each day for a week.', no: 'Slow down and give your body and mind more rest than feels necessary this week.', notyet: 'Be patient with the pace of things and keep a simple daily note of what helps.', mixed: 'Write down your questions before your next appointment so nothing gets missed.' },
    legal: { yes: 'Gather every document you have into one place and get proper advice on your next step.', no: 'Pause before acting and get qualified advice on your options.', notyet: 'Use the waiting time to organise your paperwork and timeline.', mixed: 'Write a one-page summary of the facts and the outcome you want before you talk to anyone.' },
    decision: { yes: 'Make the decision this week and set one small first step to start it.', no: 'Write down why you were drawn to this, and see whether another option gives you the same thing.', notyet: 'Choose a date to decide by, and until then gather the one fact you are missing.', mixed: 'Imagine you have already chosen each option, and notice which one leaves you lighter.' },
    general: { yes: 'Pick one thing this reading points to and act on it before the week is out.', no: 'Notice where you are pushing against the current and ease off there.', notyet: 'Give this time, and write down what you notice over the next couple of weeks.', mixed: 'Write down the one question this reading leaves you with and come back to it in a few days.' }
  };

  var MISSING_ELEMENT = {
    Fire: 'drive or motivation may be what is missing',
    Water: 'feelings may be getting less attention than they need',
    Air: 'clear thinking or an honest conversation may be what is missing',
    Earth: 'practical grounding or follow-through may be what is missing'
  };

  function fallback(p) {
    var d = detect(p.question);
    var L = lean(p);
    var topicNoun = TOPICS[d.topic].noun;
    var heart = pick(p, 'heart') || p.cards[0];
    var outcome = pick(p, 'outcome');
    var advice = pick(p, 'advice');
    var challenge = pick(p, 'challenge');
    var worst = hardest(p);
    var best = strongest(p);
    var n = p.cardCount;
    var md = [];

    /* The short answer */
    md.push('## The short answer');
    var short = [];
    var focus = outcome || heart;
    var hold, hinge;
    if (d.type === 'yesno') {
      var why;
      var support = tone(focus) > 0 ? focus : best;
      if (L.verdict === 'yes') why = label(support) + ' in the ' + role2name(support) + ' position points to ' + kw(support) + ', and the spread as a whole supports it.';
      else if (L.verdict === 'no') why = label(worst || focus) + ' in the ' + role2name(worst || focus) + ' position points to ' + kw(worst || focus) + ', and too much in this spread pushes against it.';
      else if (L.verdict === 'notyet') {
        var hold = tone(focus) < 0 ? focus : (worst || focus);
        why = 'The cards do not rule it out, but ' + label(hold) + ' in the ' + role2name(hold) + ' position shows ' + kw(hold) + ', so the timing is not right yet.';
      }
      else {
        hinge = advice || challenge || heart;
        why = 'It depends on ' + kw(hinge, 1) + ': ' + label(hinge) + ' in the ' + role2name(hinge) + ' position is the hinge.';
      }
      short.push('**' + VERDICT_LINE[L.verdict] + '** ' + why);
      var named = L.verdict === 'yes' ? support : L.verdict === 'no' ? (worst || focus) : L.verdict === 'notyet' ? hold : hinge;
      if (n > 1 && named !== heart) short.push('Right now the heart of it is ' + label(heart) + ': ' + kw(heart) + '.');
    } else if (d.type === 'open') {
      short.push('The main message is ' + kw(heart) + (outcome && outcome !== heart ? ', moving towards ' + kw(outcome) : '') + '.');
      short.push('For your ' + topicNoun + ' question, the cards are ' + TONE_WORD(L.avg) + ' overall: ' + lower(firstSentence((outcome || heart).meaning)));
    } else {
      short.push('The main message of this spread is ' + kw(heart) + (outcome && outcome !== heart ? ', leading towards ' + kw(outcome) : '') + '.');
      short.push(firstSentence(heart.meaning));
    }
    md.push(short.join(' '));

    /* What the cards are saying */
    md.push('', '## What the cards are saying');
    if (n === 1) {
      var c0 = p.cards[0];
      md.push(c0.meaning + ' ' + (SUIT_LENS[d.topic][c0.suit] || (c0.arcana === 'major' ? 'As a Major Arcana card, it points to something larger than a passing mood.' : '')));
    } else {
      var first = p.cards[0], last = p.cards[n - 1];
      var story = [];
      story.push('The spread opens with ' + label(first) + ' in the ' + role2name(first) + ' position: ' + lower(firstSentence(first.meaning)));
      if (worst && worst !== first) story.push('The turning point is ' + label(worst) + ' in the ' + role2name(worst) + ' position, where ' + kw(worst) + ' make things harder.');
      else if (best && best !== first) story.push('There is no hard turning point here; the strongest card is ' + label(best) + ', which brings ' + kw(best) + '.');
      if (last !== first && last !== worst) story.push('By the ' + role2name(last) + ' position the story reaches ' + label(last) + ': ' + lower(firstSentence(last.meaning)));
      else if (last === worst) story.push('That is also where the story ends for now, so it is the part to work on.');
      if (first.element === last.element && n >= 3) story.push('The first and last cards share an element, so watch for an old pattern repeating rather than a clean break.');
      md.push(story.join(' '));
      var weak = p.cards.filter(function (c) { return c.dignity && c.dignity.state === 'weak' && isKey(c); }).slice(0, 2);
      var strong = p.cards.filter(function (c) { return c.dignity && c.dignity.state === 'strong' && isKey(c); }).slice(0, 2);
      var para2 = [];
      if (p.patterns.dominantSuit) {
        var ds = Object.keys(T.SUITS).filter(function (s) { return T.SUITS[s].name === p.patterns.dominantSuit; })[0];
        para2.push('Most of the minor cards are ' + p.patterns.dominantSuit + '. ' + SUIT_LENS[d.topic][ds]);
      }
      if (strong.length) para2.push(listJoin(strong.map(label)) + (strong.length > 1 ? ' are' : ' is') + ' reinforced by the cards around ' + (strong.length > 1 ? 'them' : 'it') + ', so ' + (strong.length > 1 ? 'they speak' : 'it speaks') + ' loudest.');
      if (weak.length) para2.push(listJoin(weak.map(label)) + (weak.length > 1 ? ' are' : ' is') + ' muffled by ' + (weak.length > 1 ? 'their' : 'its') + ' neighbours, so expect less from ' + (weak.length > 1 ? 'them' : 'it') + ' than usual.');
      if (para2.length) md.push('', para2.join(' '));
    }

    /* Card by card */
    md.push('', '## Card by card');
    var lensUsed = {}, majorNoted = false;
    p.cards.forEach(function (c) {
      md.push('', '**' + c.number + '. ' + c.position + ': ' + label(c) + '**');
      var s = [];
      s.push('As the answer to “' + positionAsk(c) + '”, ' + theLabel(c) + ' suggests ' + kw(c) + '.');
      s.push(n >= 7 ? firstSentence(c.meaning) : c.meaning);
      if (c.suit && !lensUsed[c.suit] && d.topic !== 'general') { s.push(SUIT_LENS[d.topic][c.suit]); lensUsed[c.suit] = true; }
      else if (c.arcana === 'major' && !majorNoted && n > 1) { s.push('As a Major Arcana card, it is one of the bigger forces in your ' + topicNoun + '.'); majorNoted = true; }
      if (!(n <= 3 || isKey(c))) { /* dignity only where it changes the answer */ }
      else if (c.dignity && c.dignity.state === 'strong') {
        var ally = c.dignity.neighbours.filter(function (x) { return x.relation === 'same' || x.relation === 'friendly'; })[0];
        if (ally) s.push('Beside ' + ally.card + ', which shares or feeds its element, this card is felt more strongly.');
      } else if (c.dignity && c.dignity.state === 'weak') {
        var foe = c.dignity.neighbours.filter(function (x) { return x.relation === 'hostile'; })[0];
        if (foe) s.push('Beside ' + foe.card + ', whose element works against it, its influence is weaker or slower to show.');
      }
      md.push(s.join(' '));
    });

    /* Patterns worth noticing */
    var bullets = [];
    var pt = p.patterns;
    if (n >= 3 && pt.majors / n >= 0.5) bullets.push('**' + pt.majors + ' of ' + n + ' cards are Major Arcana.** This is bigger than an everyday ' + topicNoun + ' matter: something with real consequences is moving, and not all of it is in your hands.');
    else if (n >= 5 && pt.majors === 0) bullets.push('**No Major Arcana.** This is an everyday matter, and the choices you make decide how it goes.');
    if (pt.dominantSuit) bullets.push('**' + pt.dominantSuit + ' lead.** This turns on ' + T.SUITS[Object.keys(T.SUITS).filter(function (s) { return T.SUITS[s].name === pt.dominantSuit; })[0]].domain + '.');
    if (n >= 6 && pt.missingElements.length === 1) bullets.push('**No ' + pt.missingElements[0] + ' cards.** ' + cap(MISSING_ELEMENT[pt.missingElements[0]]) + '.');
    if (p.options.reversals && n >= 3 && pt.reversals > n / 2) bullets.push('**' + pt.reversals + ' of ' + n + ' cards are reversed.** A lot is blocked or still working itself out inside you, so expect slower progress than you would like.');
    pt.repeatedNumbers.forEach(function (r) { bullets.push('**Repeated ' + r.label + '.** They underline ' + r.theme + '.'); });
    if (bullets.length) {
      md.push('', '## Patterns worth noticing', '');
      bullets.slice(0, 4).forEach(function (b) { md.push('- ' + b); });
    }

    /* Bringing it together */
    md.push('', '## Bringing it together');
    var end = [];
    if (d.type === 'yesno') end.push({ yes: 'On balance, the cards lean towards yes.', no: 'On balance, the cards lean towards no.', notyet: 'On balance, the answer is not yet.', mixed: 'On balance, this could go either way.' }[L.verdict]);
    else end.push('Overall, the cards are ' + TONE_WORD(L.avg) + ' about your ' + topicNoun + '.');
    var mainCard = advice || heart;
    if (advice) end.push('The main thing to keep in mind comes from ' + label(advice) + ': ' + (tone(advice) < 0 ? 'guard against ' : 'lean into ') + kw(advice) + '.');
    else end.push((tone(heart) < 0 ? 'The main thing to work through is ' : 'The main thing to keep in mind is ') + kw(heart) + ', from ' + label(heart) + '.');
    if (worst && worst !== mainCard) end.push('Watch for ' + kw(worst, 1) + ', the pull of ' + label(worst) + '.');
    if (TOPICS[d.topic].pro) end.push('For a ' + topicNoun + ' question like this, it is also worth talking to ' + TOPICS[d.topic].pro + '.');
    end.push(SUGGEST[d.topic][L.verdict]);
    md.push(end.join(' '));

    return md.join('\n');
  }

  function listJoin(arr) { return arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]; }

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
