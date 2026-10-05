# Seventy-Eight · an interactive tarot table

A static, dependency-free tarot reading website. Open `index.html` in a browser
(or serve the folder with any static server, e.g. `python3 -m http.server`).

## The experience

1. **Ask** – type a question, choose a spread, and pick a reading method.
2. **Shuffle** – riffle the deck or "wash" the cards across the cloth, as many times as you like.
3. **Cut** – the deck splits into three piles; you choose which goes on top.
4. **Draw** – all 78 cards fan out face down; you pick each card by hand and it flies to its position.
5. **Reveal** – turn cards one at a time (3D flip, sparks, chime) or all in order.
6. **Read** – a layered written reading, card detail pop-ups, copy-as-text, and a local history of past readings.

Spreads: One Card, Past · Present · Future, Situation · Action · Outcome,
Relationship (6), Horseshoe (7) and the Celtic Cross (10).

## Reading methodology

The interpretation engine (`js/engine.js`) follows the layered approach most
working readers teach:

| Layer | What it does |
| --- | --- |
| Card × position | Each card's Rider–Waite–Smith meaning is read against the question its position asks. |
| Reversals | Upside-down cards read as blocked, internal, delayed or excessive energy. Reversals come from the shuffle itself: each pass turns part of the deck end-over-end. |
| Elemental dignities | Golden Dawn rules: same element or Fire–Air / Water–Earth strengthen; Fire–Water / Air–Earth weaken. Majors take the element of their astrological attribution. Each card is read through the neighbours it touches in the layout. |
| Spread patterns | Share of Major Arcana, dominant and missing suits, leading element, reversal count, court cards, repeated numbers. |
| Position pairs | Key comparisons, e.g. Celtic Cross Above↔Below, Goal↔Outcome, Near Future↔Outcome, Subconscious↔Hopes/Fears, Advice↔Outcome; Past↔Future "rhyme or contrast" in the three-card spread. |
| Quintessence | Card values summed and reduced to a single Major Arcana card as the reading's underlying lesson. |
| Synthesis | The cards are woven into one narrative per spread. |

Randomness uses `crypto.getRandomValues` with an unbiased Fisher–Yates shuffle.

## Files

- `index.html` – page structure
- `css/style.css` – all styling and animation
- `js/deck.js` – the 78 cards: meanings, keywords, elements, astrology
- `js/spreads.js` – spread layouts, adjacency and position pairs
- `js/engine.js` – shuffle, cut and the interpretation engine
- `js/art.js` – procedurally drawn SVG card faces and card back
- `js/fx.js` – starfield, sparkles and synthesised sound (Web Audio)
- `js/app.js` – the interactive flow and animations
