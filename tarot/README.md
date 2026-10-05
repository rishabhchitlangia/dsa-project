# Seventy-Eight · a tarot reading table

A static, dependency-free tarot site. Serve the folder with any static server
(`python3 -m http.server`) or open `index.html` directly.

## The experience

1. **Ask** – write a question, pick a spread, and (optionally) adjust the reading options.
   A **card of the day** sits beside the form: one card per local date, the same all day.
2. **Shuffle** – riffle, or wash the cards across the table, as often as you like.
3. **Cut** – the deck splits into three piles; you choose which goes on top.
4. **Draw** – the deck fans out face down; pick each card by hand (mouse, touch, or arrow keys and Enter).
5. **Reveal** – turn cards one at a time or all in order.
6. **Read** – the reading is laid out as an article: the question, the spread in miniature and
   the short answer, then the story of the spread, each card in its own section, patterns worth
   noticing and a conclusion, followed by follow-up questions and your notes.

Spreads: One Card, Past · Present · Future, Situation · Action · Outcome,
Relationship (6), Horseshoe (7) and the Celtic Cross (10).

## How the written reading is produced

`js/engine.js` works out the facts (`buildPayload`): each card in its position, upright or reversed,
its keywords and core meaning, its element and how its neighbours affect it, plus the spread's
patterns. `js/reader.js` turns those facts into the reading:

- **Inside Claude** (the page published as a claude.ai artifact with the `sample` capability), the
  facts and the question go to Claude with `READER_PROMPT`, after the last card is turned. The reading
  streams in, in five fixed sections: The short answer, What the cards are saying, Card by card,
  Patterns worth noticing, Bringing it together. Up to three follow-up questions can be asked.
- **Anywhere else**, or if Claude is unavailable, a rule-based reader writes the same five sections. It
  detects the question's topic (work, love, money, health, legal, a decision, general) and type
  (yes/no or open), links each card to its position, and computes a lean (leaning yes, not yet,
  leaning no, or mixed) from the cards, weighted by position, orientation and Major Arcana.

The written reading and any follow-ups are saved with the reading in history and carried inside
share links, so reopening a reading never asks Claude again.

## Sharing and keeping readings

- **Copy link** encodes the whole reading (spread, question, cards, orientations, options, date)
  into the URL hash. Opening the link shows the finished reading directly.
- **Save as image** renders the question, spread and short answer to a PNG.
- **Past readings** are kept in the browser (`localStorage`). Each reading can carry a note
  ("what actually happened"), can be deleted, and the whole journal can be exported to JSON and
  imported again on another device; imports merge without duplicates.
- Everything degrades gracefully: without storage the site still works (no history), and if the
  card images can't load, each card falls back to a drawn SVG face.

## Reading methodology

The interpretation engine (`js/engine.js`) follows the layered approach most working readers teach:

| Layer | What it does |
| --- | --- |
| Card × position | Each card's Rider–Waite–Smith meaning is read against the question its position asks. |
| Reversals | Upside-down cards read as blocked, internal, delayed or excessive energy. They come from the shuffle itself: each pass turns part of the deck end over end. |
| Elemental dignities | Golden Dawn rules: same element or Fire–Air / Water–Earth strengthen; Fire–Water / Air–Earth weaken. |
| Spread patterns | Major Arcana share, dominant and missing suits, leading element, reversals, court cards, repeated numbers. |
| Position pairs | Key comparisons such as Celtic Cross Above↔Below or Advice↔Outcome. |
| Quintessence | Card values summed and reduced to a single Major Arcana card. |
| Synthesis | The cards woven into one narrative per spread. |

Randomness uses `crypto.getRandomValues` with an unbiased Fisher–Yates shuffle.

## Card images

`assets/cards/` holds the 78 illustrations by Pamela Colman Smith from the 1909
Rider–Waite–Smith deck (public domain), taken from Wikimedia Commons (files such as
`RWS_Tarot_17_Star.jpg` and `Cups03.jpg`). They were cropped to the printed border,
resized to 400px wide and saved as WebP (40–60 KB each). Names follow the deck data:
`major-17-star.webp`, `cups-03.webp`, `pentacles-13.webp`.

## Files

- `index.html` – page structure
- `css/style.css` – all styling (dark theme, brass accent)
- `js/deck.js` – the 78 cards: meanings, keywords, elements, astrology
- `js/spreads.js` – spread layouts, adjacency and position pairs
- `js/engine.js` – shuffle, cut, the interpretation engine and the reading payload
- `js/reader.js` – the reader: Claude prompt and calls, markdown parsing and the rule-based fallback
- `js/art.js` – image paths, the fallback SVG faces and the card back
- `js/fx.js` – synthesised sound (off by default)
- `js/share.js` – share links and image export
- `js/app.js` – the interactive flow, reading page, card of the day and journal
