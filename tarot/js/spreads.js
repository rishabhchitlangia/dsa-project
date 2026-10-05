/* Spread definitions.
 * x / y are the top-left corner of each card in "card widths"
 * (a card is 1 wide and CARD_RATIO tall). `links` lists the pairs of
 * positions that touch in the layout; the elemental-dignity method reads a
 * card through the neighbours it touches. `pairs` are the cross-readings a
 * reader compares once every card is up. */
(function () {
  'use strict';

  var H = 1.65; // card height / width

  var SPREADS = [
    {
      id: 'one',
      name: 'One Card',
      subtitle: 'A single message for today',
      blurb: 'The quickest draw. Good for a daily theme or a yes-or-no-ish nudge.',
      positions: [
        { name: 'The Message', question: 'What do I most need to hear right now?', x: 0, y: 0 }
      ],
      links: []
    },
    {
      id: 'three',
      name: 'Past · Present · Future',
      subtitle: 'The classic three-card line',
      blurb: 'Read left to right as one story. Whether the outer cards echo or contrast tells you if things are cycling or truly changing.',
      positions: [
        { name: 'Past', question: 'What led here, or what is now ending?', x: 0, y: 0 },
        { name: 'Present', question: 'What is the heart of the situation now?', x: 1.25, y: 0 },
        { name: 'Future', question: 'Where is this heading if nothing changes?', x: 2.5, y: 0 }
      ],
      links: [[0, 1], [1, 2]],
      pairs: [
        { a: 0, b: 2, title: 'Past and Future', lens: 'arc' }
      ]
    },
    {
      id: 'sao',
      name: 'Situation · Action · Outcome',
      subtitle: 'A practical three-card decision read',
      blurb: 'For when you need a next step, not a history lesson.',
      positions: [
        { name: 'Situation', question: 'What is really going on?', x: 0, y: 0 },
        { name: 'Action', question: 'What should I do about it?', x: 1.25, y: 0 },
        { name: 'Outcome', question: 'What is likely if I take that action?', x: 2.5, y: 0 }
      ],
      links: [[0, 1], [1, 2]],
      pairs: [
        { a: 1, b: 2, title: 'Action and Outcome', lens: 'cause' }
      ]
    },
    {
      id: 'relationship',
      name: 'Relationship',
      subtitle: 'Two people and the bond between them',
      blurb: 'Six cards: each person, what joins you, what strengthens you, what strains you and where it is going.',
      positions: [
        { name: 'You', question: 'How do I show up in this relationship?', x: 0, y: 0 },
        { name: 'The Connection', question: 'What is the bond between us right now?', x: 1.25, y: 0 },
        { name: 'Them', question: 'How does the other person show up?', x: 2.5, y: 0 },
        { name: 'Strengths', question: 'What holds us together?', x: 0, y: H + 0.25 },
        { name: 'Potential', question: 'Where is this relationship heading?', x: 1.25, y: H + 0.25 },
        { name: 'Challenges', question: 'What pulls us apart?', x: 2.5, y: H + 0.25 }
      ],
      links: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5]],
      pairs: [
        { a: 0, b: 2, title: 'You and Them', lens: 'mirror' },
        { a: 3, b: 5, title: 'Strengths and Challenges', lens: 'tension' },
        { a: 1, b: 4, title: 'Connection and Potential', lens: 'arc' }
      ]
    },
    {
      id: 'horseshoe',
      name: 'Horseshoe',
      subtitle: 'Seven cards for a problem with many moving parts',
      blurb: 'An arc that moves from past influences, through hidden factors and other people, to advice and the likely outcome.',
      positions: [
        { name: 'The Past', question: 'What background shapes this?', x: 0, y: 0 },
        { name: 'The Present', question: 'Where do things stand now?', x: 1.1, y: 0.9 },
        { name: 'Hidden Influences', question: 'What am I not seeing?', x: 2.2, y: 1.6 },
        { name: 'Obstacles', question: 'What stands in the way?', x: 3.3, y: 1.85 },
        { name: 'Other People', question: 'How are others affecting this?', x: 4.4, y: 1.6 },
        { name: 'Advice', question: 'What is the best course of action?', x: 5.5, y: 0.9 },
        { name: 'Likely Outcome', question: 'Where does this lead?', x: 6.6, y: 0 }
      ],
      links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
      pairs: [
        { a: 0, b: 6, title: 'Past and Outcome', lens: 'arc' },
        { a: 3, b: 5, title: 'Obstacle and Advice', lens: 'remedy' },
        { a: 2, b: 4, title: 'Hidden Influences and Other People', lens: 'mirror' }
      ]
    },
    {
      id: 'celtic',
      name: 'Celtic Cross',
      subtitle: 'The full ten-card reading',
      blurb: 'The most widely used layout since 1910. The cross (1–6) shows your inner and outer world; the staff (7–10) gives perspective, advice and outcome.',
      positions: [
        { name: 'The Present', question: 'What is happening at the heart of this?', x: 1.4, y: 2.7 },
        { name: 'The Challenge', question: 'What crosses me?', x: 1.4, y: 2.7, crossing: true },
        { name: 'The Past', question: 'What events led here?', x: 0, y: 2.7 },
        { name: 'The Near Future', question: 'What is coming in the weeks ahead?', x: 2.8, y: 2.7 },
        { name: 'Above · Conscious Goal', question: 'What do I consciously want?', x: 1.4, y: 0.9 },
        { name: 'Below · Subconscious', question: 'What is driving me underneath?', x: 1.4, y: 4.5 },
        { name: 'Advice', question: 'How should I approach this?', x: 4.4, y: 5.4 },
        { name: 'External Influences', question: 'What outside forces are at work?', x: 4.4, y: 3.6 },
        { name: 'Hopes and Fears', question: 'What do I hope for, and fear?', x: 4.4, y: 1.8 },
        { name: 'Outcome', question: 'Where is this heading?', x: 4.4, y: 0 }
      ],
      links: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [6, 7], [7, 8], [8, 9]],
      pairs: [
        { a: 4, b: 5, title: 'Above and Below', lens: 'mirror', note: 'Are your conscious goals and your deeper drives pulling the same way?' },
        { a: 4, b: 9, title: 'Conscious Goal and Outcome', lens: 'arc', note: 'Does what you want match where things are heading?' },
        { a: 3, b: 9, title: 'Near Future and Outcome', lens: 'arc', note: 'How do the coming weeks feed the final result?' },
        { a: 5, b: 8, title: 'Subconscious and Hopes/Fears', lens: 'mirror', note: 'Where do your hopes and fears really come from?' },
        { a: 6, b: 9, title: 'Advice and Outcome', lens: 'cause', note: 'What changes if you follow the advice?' }
      ]
    }
  ];

  window.Tarot = window.Tarot || {};
  window.Tarot.SPREADS = SPREADS;
  window.Tarot.CARD_RATIO = H;
})();
