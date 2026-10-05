/* Card knowledge for the reader: per-orientation readings by topic (general, love, career, money) and by role (advice, outcome, challenge), plus a tone score from -1 (hard) to 1 (supportive). Original text, written for this site in the Rider–Waite–Smith tradition. */
(function () {
  var L = (window.Tarot = window.Tarot || {}).LORE = window.Tarot.LORE || {};

  L['major-0'] = {
    tone: { up: 0.5, rev: -0.3 },
    up: {
      general: "Something new is opening up, and you don't need the whole map to take the first step. The freshness you feel is real; trust it enough to begin.",
      love: "A light, open-hearted start: a new connection, or a chance to approach an old one without the baggage. Let it be playful before you ask it to be serious.",
      career: "A new role, project or direction that feels like a leap. You won't have every answer up front, and that's fine; your willingness to learn is the asset here.",
      money: "A fresh start with money, or a tempting new venture. Enthusiasm is good, but match it with a basic plan so the leap lands somewhere solid.",
      advice: "Take the first step before you feel completely ready, and stay curious about where it leads.",
      outcome: "This leads to a genuine new beginning: a door opens and a new chapter starts.",
      challenge: "Your own fear of looking foolish or starting from zero is the thing in the way."
    },
    rev: {
      general: "Either you're about to jump without looking, or you're standing at the edge refusing to move at all. Both come from not quite trusting your own judgement yet.",
      love: "Someone is rushing in without thinking it through, or holding back from something good because it feels too uncertain. Slow down or step forward, whichever you've been avoiding.",
      career: "An impulsive move, like quitting without a plan or saying yes to everything, could cost you. Or you keep postponing a change you already know you need to make.",
      money: "Watch for careless spending, a too-good-to-be-true offer, or a gamble taken on a whim. Read the fine print before you sign anything or hand money over.",
      advice: "Pause long enough to check the ground in front of you, then decide on purpose rather than on impulse or fear.",
      outcome: "Expect a false start or a stall unless you either look before leaping or finally stop hesitating.",
      challenge: "Recklessness on one side and paralysing hesitation on the other are keeping you from a clean, considered start."
    }
  };

  L['major-1'] = {
    tone: { up: 0.8, rev: -0.4 },
    up: {
      general: "You have more to work with than you think: the skills, contacts and ideas are already within reach. What's needed now is focus and a decision to act.",
      love: "You can shape this connection by being clear and intentional about what you want. Say it plainly, make the plan, send the message instead of waiting to be chosen.",
      career: "A strong moment to pitch, launch or take initiative. Your abilities are visible and persuasive right now, so put them in front of the people who make decisions.",
      money: "You have the means to improve your position through your own skill: a side project, a negotiation, a smarter use of what you already have. Act deliberately.",
      advice: "Pick one clear goal, gather what you already have, and start working on it today.",
      outcome: "This points to real progress driven by your own effort, with an idea becoming something concrete.",
      challenge: "Scattered focus is the problem; you have the tools but keep spreading yourself across too many things."
    },
    rev: {
      general: "Talent is going unused, or someone is promising more than they can deliver. Look closely at what is real here and what is just a good performance.",
      love: "Charm without substance, or mixed signals that never become action. Notice whether words and behaviour match, including your own.",
      career: "You may be underselling yourself, or dealing with someone who talks a big game and doesn't follow through. Check claims before you rely on them.",
      money: "Be wary of slick pitches, schemes or anyone who seems a little too persuasive. Your own plans may also be more talk than action so far.",
      advice: "Stop polishing the idea and do the first real piece of work, and verify anyone else's promises before you build on them.",
      outcome: "Things move towards disappointment if talk continues to stand in for action or honesty.",
      challenge: "Manipulation, overpromising or your own unused ability is blocking progress more than any outside obstacle."
    }
  };

  L['major-2'] = {
    tone: { up: 0.3, rev: -0.3 },
    up: {
      general: "Not everything is visible yet, and that's alright. Your quiet sense of what's going on is more reliable than the loudest opinion around you.",
      love: "There may be unspoken feelings or things not yet said on either side. Pay attention to what you sense in their silences, and give it time to surface.",
      career: "Hold your cards close for now. Listen more than you speak, watch how things are moving, and trust your read on people before committing.",
      money: "Information is still incomplete, so this isn't the moment for a big commitment. Wait until you understand the full picture, and trust a gut feeling to hold off.",
      advice: "Get quiet, listen to what you already know underneath the noise, and don't force an answer before it's clear.",
      outcome: "Expect something hidden to come into view, giving you a deeper understanding of where you stand.",
      challenge: "Ignoring your own instincts in favour of what others say, or acting before the facts are in."
    },
    rev: {
      general: "You're second-guessing what you already sense, or something is being kept from you. The answer is in the parts of the situation you've been avoiding looking at.",
      love: "Secrets, guardedness or a refusal to talk about what is really going on. You may also be talking yourself out of a feeling you know is right.",
      career: "Office politics, information withheld, or decisions made behind closed doors. Ask direct questions and trust the unease you've been brushing aside.",
      money: "Hidden costs, unclear terms or someone not telling you the whole story. Look again at anything you agreed to without fully understanding it.",
      advice: "Stop asking everyone else what they think and take your own instinct seriously for once.",
      outcome: "This leads to confusion if instincts keep being overridden, but to clarity once hidden things are named.",
      challenge: "Secrecy, either yours or someone else's, and a habit of distrusting your own inner sense."
    }
  };

  L['major-3'] = {
    tone: { up: 0.8, rev: -0.3 },
    up: {
      general: "A period of growth and comfort. What you've been tending is starting to flourish, and you're allowed to enjoy it rather than immediately looking for the next task.",
      love: "Warm, affectionate and generous. A relationship deepens through care, physical closeness and shared pleasures; a home-making, nesting kind of love.",
      career: "Creative work thrives, and projects you've nurtured begin to show results. A supportive environment helps; this is good for design, care, food or anything hands-on.",
      money: "Comfort and steady growth. Investments made patiently pay off, and there may be room to spend a little on things that genuinely make life better.",
      advice: "Nourish what matters to you, including yourself, and let things grow at their natural pace.",
      outcome: "This points to abundance and growth, with something you've cared for bearing fruit.",
      challenge: "Giving so much to everyone else that nothing is left over to nourish your own plans."
    },
    rev: {
      general: "Care has tipped into control, or you've stopped looking after yourself. Something that should be growing feels stuck because it isn't getting the right kind of attention.",
      love: "Smothering, dependence or one person doing all the giving. Space and self-respect will do more for this relationship than trying harder to please.",
      career: "A creative block or a draining role where you're always supporting others. Your own ideas are being starved of time and attention.",
      money: "Overspending for comfort, or financial dependence on someone else. Look at where money is going to soothe rather than to build.",
      advice: "Take some of the care you give others and redirect it into rest, creativity and your own needs.",
      outcome: "Things move towards stagnation unless you rebalance giving and receiving.",
      challenge: "Neglecting yourself, or holding on so tightly to something that it can't grow."
    }
  };

  L['major-4'] = {
    tone: { up: 0.6, rev: -0.4 },
    up: {
      general: "This calls for structure and a firm hand. Set the rules, take responsibility and build something stable; a clear plan will serve you better than improvising.",
      love: "Commitment, reliability and clear roles. A partner who shows up consistently, or a need for clearer boundaries and agreements between you.",
      career: "Leadership, authority and solid systems. A good time to step up, take charge of a project, or work with a senior figure who values discipline.",
      money: "Budgets, long-term plans and financial discipline pay off. Treat your money like a business: clear rules, regular review, no impulse decisions.",
      advice: "Put a clear structure in place, set your boundaries, and stand behind your decisions.",
      outcome: "This leads to stability and control, with a solid foundation you can build on.",
      challenge: "A lack of structure or discipline is letting things drift when they need firm handling."
    },
    rev: {
      general: "Control has become rigidity, or there's no real structure at all. Someone, possibly you, is either clinging to authority or avoiding responsibility.",
      love: "A controlling dynamic, or one partner making all the decisions. Equally, a lack of commitment where firm agreements are needed.",
      career: "A difficult boss, rigid rules, or a power struggle at work. Or you need more discipline yourself to follow through on what you've started.",
      money: "Either spending is out of control, or rules are so tight there's no room to breathe. Find a sensible middle structure you'll actually stick to.",
      advice: "Loosen your grip where you're over-controlling and tighten up where you've let things slide.",
      outcome: "Expect friction and instability until authority is either shared fairly or properly taken up.",
      challenge: "Rigid control, stubbornness or a power struggle is getting in the way of progress."
    }
  };

  L['major-5'] = {
    tone: { up: 0.4, rev: -0.1 },
    up: {
      general: "The established way, a trusted teacher or a proven method has something to offer you now. Learning from people who've done this before saves you a lot of trial and error.",
      love: "Traditional commitment, shared values and the wider family's involvement. Formal steps like engagement or marriage, or relationships built on common beliefs.",
      career: "Training, qualifications, mentors and institutions. Working within the system, following procedure, or learning from someone more experienced will help.",
      money: "Conventional, proven financial advice is the right fit. Stick to established institutions and tested strategies rather than chasing something unusual.",
      advice: "Seek out a mentor or a proven method and learn the rules properly before you decide to break them.",
      outcome: "This points to a conventional, well-supported result through established channels.",
      challenge: "Pressure to conform, or relying on what you were told instead of thinking it through yourself."
    },
    rev: {
      general: "The usual rules don't fit your situation. You may need to question what you've been taught and find a way that's actually yours.",
      love: "Family or social expectations clash with what you want, or the relationship doesn't fit a conventional mould. Decide what you believe rather than what's expected.",
      career: "Frustration with bureaucracy, outdated systems or a rigid institution. An unconventional path or going independent may suit you better.",
      money: "Standard advice may not suit your circumstances. Question fees, products or plans you accepted simply because everyone else uses them.",
      advice: "Question the rule you've been following without thinking, and keep only what still makes sense to you.",
      outcome: "Things move towards a break from convention and a more personal way of doing things.",
      challenge: "Rigid dogma, other people's expectations, or a rule you no longer believe in."
    }
  };

  L['major-6'] = {
    tone: { up: 0.8, rev: -0.4 },
    up: {
      general: "A meaningful choice or connection where your values are on the line. The right path is the one that lines up with who you actually are, not just what's convenient.",
      love: "Strong mutual attraction and real alignment. A relationship deepens through honesty and shared values, or you face a choice about who you want to build a life with.",
      career: "A good partnership or a decision about which path fits your values. Collaborations formed now can work well if you genuinely believe in the same things.",
      money: "Decisions about money are really decisions about values. Joint finances or a partnership work best when both sides want the same things from it.",
      advice: "Choose with your whole heart and your values, not just your head or your fear.",
      outcome: "This leads to a meaningful union or a choice you can stand behind fully.",
      challenge: "A decision you keep avoiding because it means committing to one thing and letting the other go."
    },
    rev: {
      general: "Something is out of alignment: what you say you value and what you're actually choosing have drifted apart. An honest look will show you where.",
      love: "Disconnection, mismatched values or temptation pulling one of you away. Communication has slipped, and the relationship needs a frank conversation about what you each want.",
      career: "A partnership under strain, or a role that conflicts with your values. Indecision about which path to take is costing you time.",
      money: "Disagreements over money in a relationship or partnership, or spending that contradicts your stated priorities.",
      advice: "Name the value you've been compromising and make your next choice in line with it.",
      outcome: "Expect imbalance or a parting of ways unless values are brought back into line.",
      challenge: "Mixed motives, temptation or a mismatch between what you want and what you're choosing."
    }
  };

  L['major-7'] = {
    tone: { up: 0.7, rev: -0.4 },
    up: {
      general: "You can win this through focus and willpower. Pulling competing demands into one direction takes effort, but the momentum is with you if you keep hold of the reins.",
      love: "Moving forward with determination, perhaps through obstacles like distance or busy schedules. Commitment and a shared direction carry things along.",
      career: "A push towards a goal: a promotion, a deadline, a competitive win. Self-discipline and confidence get you there; this isn't the time to waver.",
      money: "Progress through determined effort and clear goals. Control your spending and direct your money deliberately towards one target.",
      advice: "Decide where you're going, commit to it, and keep driving forward even when parts of you pull in other directions.",
      outcome: "Expect a win or real progress that comes from your own focus and persistence.",
      challenge: "Conflicting goals pulling you two ways at once, so no single direction gets your full drive."
    },
    rev: {
      general: "Momentum has stalled or gone off course. You may be pushing too hard without direction, or feeling like circumstances have taken the wheel.",
      love: "Power struggles, impatience or each of you heading in different directions. Forcing the pace won't help; agree on where you're going first.",
      career: "Lost direction, frustration with setbacks, or aggression in the workplace. Step back and set a clearer goal before pushing again.",
      money: "Spending or decisions running out of control. A plan that keeps changing never gets anywhere, so pick one priority.",
      advice: "Stop forcing it, regain control of yourself first, and only then choose a single direction to push in.",
      outcome: "This points to delays and frustration unless you regain focus and a clear aim.",
      challenge: "Lack of direction, impatience or trying to force an outcome through sheer aggression."
    }
  };

  L['major-8'] = {
    tone: { up: 0.7, rev: -0.3 },
    up: {
      general: "Quiet, steady courage carries you through. Patience and kindness will settle this better than force, including the restless or angry part of yourself.",
      love: "Gentleness and patience win here. A relationship strengthens through compassion, calm handling of conflict and trusting each other through difficult moments.",
      career: "You can handle a difficult person or situation with calm confidence. Your steadiness under pressure earns respect, more than any show of force would.",
      money: "Self-control with spending and the patience to stick with a plan. Resisting impulses quietly is where the gains are.",
      advice: "Meet this with patience and calm confidence, and handle the difficult parts gently but firmly.",
      outcome: "Things move towards a quiet victory won through patience, courage and composure.",
      challenge: "Doubting your own resilience, or reacting impulsively when a steady hand would work better."
    },
    rev: {
      general: "Self-doubt, frustration or anger is gaining ground. You're stronger than you feel right now, but reacting from that raw place will make things harder.",
      love: "Insecurity, jealousy or flare-ups of temper. Before you react, ask what you're actually afraid of, and speak to that instead.",
      career: "Feeling out of your depth, or losing your cool under pressure. Rebuild confidence through small wins rather than proving yourself in one big moment.",
      money: "Impulse spending or decisions driven by anxiety. Slow down; a calmer version of you would make a different choice.",
      advice: "Steady yourself before you act, and remind yourself of what you've already handled well.",
      outcome: "Expect setbacks driven by emotion unless you reconnect with your own steadiness.",
      challenge: "Insecurity and uncontrolled reactions are undermining strength you genuinely have."
    }
  };

  L['major-9'] = {
    tone: { up: 0.2, rev: -0.3 },
    up: {
      general: "Time alone to think will show you more than another round of advice. Step back from the noise and let your own judgement settle before you decide.",
      love: "A need for space or a period of reflection, single or partnered. Understanding what you really want comes before finding or fixing a relationship.",
      career: "Focused, solitary work, research or a pause to reconsider your direction. A mentor figure may offer quiet but valuable guidance.",
      money: "Careful, private review of your finances. Do your own research and avoid following the crowd into anything.",
      advice: "Give yourself some quiet time away from other voices to work out what you really think.",
      outcome: "This leads to hard-won clarity and a sense of direction that comes from within.",
      challenge: "Too much outside noise is drowning out your own judgement and stopping you from thinking clearly."
    },
    rev: {
      general: "Retreat has turned into isolation, or you're keeping so busy that you never have to sit with the real question. Neither gives you the clarity you're after.",
      love: "Loneliness, withdrawal or shutting a partner out. Reflection is useful, but at some point you need to come back and talk.",
      career: "Feeling cut off at work, or avoiding the reflection needed to choose a new direction. Reach out to colleagues or a mentor.",
      money: "Avoiding looking at your finances, or making choices in isolation without advice. A second opinion would help.",
      advice: "Come back out of your shell and let someone you trust help you think it through.",
      outcome: "Expect a sense of drift or disconnection unless solitude is balanced with real contact.",
      challenge: "Isolation and withdrawal, or avoiding the honest inner look that the situation needs."
    }
  };

  L['major-10'] = {
    tone: { up: 0.6, rev: -0.4 },
    up: {
      general: "Things are turning, and largely in your favour. Circumstances you couldn't control are moving, and the best response is to be ready to move with them.",
      love: "A turning point: a chance meeting, a relationship moving to a new stage, or old patterns finally shifting. Timing is on your side now.",
      career: "A lucky break, an unexpected opening or a change in circumstances at work. Be ready to say yes when the opportunity appears.",
      money: "An upswing or a fortunate turn, but remember cycles go both ways. Use good times to build a cushion for later.",
      advice: "Go with the change that's happening and take the opportunity while the timing is right.",
      outcome: "Expect a turning point that shifts things in a better direction.",
      challenge: "Clinging to how things were when circumstances have clearly moved on."
    },
    rev: {
      general: "A downturn, delay or a pattern that keeps repeating. You can't control the timing, but you can notice what keeps coming back and change your part in it.",
      love: "Repeating the same relationship patterns, or bad timing getting in the way. Ask what keeps recurring and what you can do differently.",
      career: "Setbacks, delays or changes you didn't ask for. Ride it out without panicking, and adapt rather than resist.",
      money: "A temporary dip, an unexpected expense or a run of bad luck. Keep things lean until the cycle turns.",
      advice: "Stop fighting what you can't control and focus on changing the part of the pattern that's yours.",
      outcome: "This points to a slower, rougher stretch before the cycle eventually turns again.",
      challenge: "Resisting change, or repeating an old pattern that keeps bringing the same result."
    }
  };

  L['major-11'] = {
    tone: { up: 0.4, rev: -0.5 },
    up: {
      general: "Fairness and truth will win out. You'll get a result that reflects what was actually done, so act with integrity and be honest about your part.",
      love: "An honest look at the balance between you. Fair give-and-take, a truthful conversation, or a decision based on what's right rather than what's easy.",
      career: "Contracts, agreements and fair evaluations. Your work will be judged on its merits, so make sure your side of things is clean and well documented.",
      money: "Balanced accounts and fair dealings. Read agreements carefully, keep good records, and expect to get what's genuinely owed.",
      advice: "Be scrupulously honest, weigh both sides fairly, and take responsibility for your part.",
      outcome: "This leads to a fair, balanced result that reflects the choices actually made.",
      challenge: "Not looking honestly at the facts, or at your own share of responsibility for how things went."
    },
    rev: {
      general: "Something is unfair, unbalanced or not being faced honestly. It may be someone else's doing, but it's worth checking whether you're avoiding accountability too.",
      love: "An uneven relationship, blame being shifted, or dishonesty about what happened. Fairness needs restoring before trust can return.",
      career: "Unfair treatment, biased decisions or a dispute over an agreement. Keep records and stay factual; don't add to the imbalance.",
      money: "Unfair terms, money owed but not paid, or a deal weighted against you. Read the details closely and push back calmly.",
      advice: "Own your part honestly and calmly insist on fairness where you're being short-changed.",
      outcome: "Expect an imbalanced or unsatisfying result unless honesty is restored on all sides.",
      challenge: "Dishonesty, bias or someone, possibly you, avoiding the consequences of their choices."
    }
  };

  L['major-12'] = {
    tone: { up: 0.0, rev: -0.3 },
    up: {
      general: "Things are on hold, and pushing won't move them. Use the pause to look at the situation from a completely different angle; that's where the answer is.",
      love: "A waiting period, or a relationship that needs you to let go of how you thought it should look. Seeing it from their side changes everything.",
      career: "A project stalls or a decision is postponed. Instead of forcing it, rethink the approach; a sacrifice now may set up something better later.",
      money: "Hold off on major moves. A short-term sacrifice or a period of patience will serve you better than trying to force a quick result.",
      advice: "Stop pushing, let go of the outcome for a while, and look at the problem from the opposite angle.",
      outcome: "Things move towards a shift in perspective that makes the wait worthwhile.",
      challenge: "Insisting on seeing things one way, and refusing to accept a necessary pause."
    },
    rev: {
      general: "You're stuck because you won't let go, or you keep sacrificing yourself without anything changing. The waiting has gone on long enough; a decision is overdue.",
      love: "Giving and giving with nothing coming back, or waiting for someone to change who shows no sign of it. Stop putting your own life on hold.",
      career: "Stalling on a decision, or martyring yourself in a role that doesn't value you. Endless delay is now costing more than acting would.",
      money: "Money tied up in something going nowhere, or putting off a decision you've already researched to death. Make the call.",
      advice: "Make the decision you've been postponing and stop sacrificing yourself for something that isn't giving back.",
      outcome: "Expect continued limbo unless you choose to let go or act.",
      challenge: "Stalling, indecision or a pointless sacrifice that keeps you in place."
    }
  };

  L['major-13'] = {
    tone: { up: -0.3, rev: -0.4 },
    up: {
      general: "Something is ending, and that's clearing space for what comes next. It may not feel comfortable, but holding on to what has run its course would hurt more.",
      love: "A chapter closes: a relationship ends, or the old version of it gives way to something different. Either way, the way things were cannot continue.",
      career: "A role, project or phase of work wraps up. A restructure, resignation or change of field makes room for something better suited to who you are now.",
      money: "Closing an account, ending an expense or letting go of an old financial habit. A clean break now leads to a healthier setup later.",
      advice: "Let go of what has clearly finished, close it properly, and make room for something new.",
      outcome: "This leads to a definite ending and a transformation that opens the next chapter.",
      challenge: "Holding on to something that is already over and refusing to let the change happen."
    },
    rev: {
      general: "You're clinging to something that has already ended. The change is coming either way; resisting it just drags out the discomfort and keeps you in limbo.",
      love: "Holding on to a relationship or a hope that has run its course, or going back to something you already left. Closure is what you need.",
      career: "Staying in a role you've outgrown out of fear. The longer you delay the move, the harder it gets.",
      money: "Keeping a losing investment or an old habit because letting go feels like admitting defeat. Cut the loss and move on.",
      advice: "Accept that this part is over and take the first step towards closing it for good.",
      outcome: "Expect stagnation and a slow, drawn-out ending if the change keeps being resisted.",
      challenge: "Fear of endings and resistance to change are keeping you stuck in something already finished."
    }
  };

  L['major-14'] = {
    tone: { up: 0.6, rev: -0.3 },
    up: {
      general: "Balance and patience will get you further than extremes. Blend different needs or approaches gradually, and the right mix will show itself over time.",
      love: "A calm, balanced relationship built on compromise and steady care. Differences can blend into something that works for both of you.",
      career: "Steady progress through cooperation and moderation. Work out a sensible pace, combine your strengths with others', and avoid burning out.",
      money: "A moderate, balanced approach: neither splurging nor depriving yourself. Small, steady contributions add up.",
      advice: "Find the middle ground, adjust patiently, and resist the urge to swing to extremes.",
      outcome: "Things move towards a harmonious, workable balance that holds up over time.",
      challenge: "Impatience, or an all-or-nothing approach that keeps throwing things out of balance."
    },
    rev: {
      general: "Something is out of proportion: too much of one thing, not enough of another. Restoring balance comes before pushing forward.",
      love: "Clashing needs, overreaction or one person doing too much. Compromise has broken down, and the rhythm between you needs resetting.",
      career: "Overwork, conflict in a team, or rushing a process that needs patience. Rebalance your workload before it tips over.",
      money: "Overspending in one area while starving another, or swinging between extremes. Rebuild a steady routine.",
      advice: "Notice where you've gone to extremes and bring that part of your life back to a sensible level.",
      outcome: "Expect friction and imbalance unless moderation and patience are restored.",
      challenge: "Excess, impatience or conflicting priorities are throwing everything off balance."
    }
  };

  L['major-15'] = {
    tone: { up: -0.6, rev: 0.3 },
    up: {
      general: "Something has more hold over you than it should: a habit, a relationship, a desire, or a fear. The chains are looser than they look once you name them.",
      love: "Intense attraction, possessiveness or a relationship that feels hard to leave even when it isn't good for you. Look at what keeps you tied.",
      career: "Feeling trapped by money, status or a toxic workplace. Golden handcuffs or unhealthy dynamics are keeping you somewhere you don't want to be.",
      money: "Debt, overspending or chasing more for its own sake. Material desires are driving decisions instead of your actual priorities.",
      advice: "Name honestly what has a grip on you, then take one practical step to loosen it.",
      outcome: "This points to feeling more trapped unless you face the attachment directly.",
      challenge: "An unhealthy attachment or temptation is controlling your choices more than you want to admit."
    },
    rev: {
      general: "You're starting to break free. The pattern or attachment that held you is now clearly visible, and you're taking your power back step by step.",
      love: "Leaving an unhealthy dynamic, or a relationship moving past jealousy and control. Honesty about what went wrong frees you both.",
      career: "Walking away from a draining job or toxic dynamic, or finally setting limits. You're reclaiming control over how you work.",
      money: "Getting debt or compulsive spending under control. The pull is weakening, and new habits are taking hold.",
      advice: "Keep going with the break you've started, and don't let a weak moment pull you back.",
      outcome: "Expect release and freedom as old ties lose their grip.",
      challenge: "The lingering pull of an old habit or relationship you've only half let go of."
    }
  };

  L['major-16'] = {
    tone: { up: -0.9, rev: -0.4 },
    up: {
      general: "A sudden shake-up brings down something built on shaky ground. It's painful and disorienting, but it shows you the truth and clears the way to rebuild properly.",
      love: "A shock, a revelation or an argument that changes everything. Whatever was hidden comes out, and the relationship can't go back to how it was.",
      career: "Abrupt change at work: a restructure, a lost deal, a plan that collapses. Painful, but it exposes what wasn't working.",
      money: "An unexpected expense or a sudden financial shock. Shore up what you can and don't make panicked decisions in the aftermath.",
      advice: "Let what's broken fall, protect what truly matters, and rebuild on firmer ground.",
      outcome: "Expect sudden upheaval that breaks something down, forcing a fresh and more honest start.",
      challenge: "A false foundation or ignored warning sign that is about to give way."
    },
    rev: {
      general: "You're putting off a collapse that's overdue, or the upheaval is happening quietly inside you. Delaying it only makes the eventual fall harder.",
      love: "Avoiding a confrontation or a truth you both sense. The cracks are visible; better to address them on purpose than wait for them to give way.",
      career: "A narrowly avoided crisis, or warning signs at work that keep getting ignored. Fix the structural problem now while you still have the choice.",
      money: "A close call or a problem you're hoping will go away. Act on it now so it doesn't become a crisis later.",
      advice: "Face the change you've been dodging and make it on your own terms before it's forced on you.",
      outcome: "This leads to a delayed reckoning, either eased by acting early or made worse by waiting.",
      challenge: "Fear of change is making you hold together something that needs to come down."
    }
  };

  L['major-17'] = {
    tone: { up: 0.9, rev: -0.2 },
    up: {
      general: "After a hard stretch, hope is returning. Things are genuinely getting better, and you can start trusting the future again.",
      love: "Renewed hope in love, gentle healing after hurt, or a relationship built on openness and trust. Let yourself be seen as you are.",
      career: "Inspiration, a renewed sense of purpose, or recognition for your talents. A good time to put your ideas out where people can see them.",
      money: "Recovery after a difficult period. Things are slowly stabilising, and modest optimism about the future is justified.",
      advice: "Keep faith in where you're heading and take one small hopeful step today.",
      outcome: "This leads to renewal, hope and a steady sense that things are getting better.",
      challenge: "Cynicism left over from past disappointments is stopping you from believing things can improve."
    },
    rev: {
      general: "Hope feels thin right now, and it's hard to believe things will improve. The light hasn't gone, but you've lost sight of it for the moment.",
      love: "Disillusionment or feeling disconnected. You may be expecting the worst because of past hurt; small acts of openness can rebuild trust.",
      career: "Discouragement, loss of motivation or feeling unrecognised. Reconnect with why you started before deciding anything big.",
      money: "Feeling pessimistic about money or worried you'll never get ahead. Small, steady steps will rebuild confidence.",
      advice: "Do one small thing that reminds you what you're working towards and why it matters.",
      outcome: "Expect slow recovery as hope returns, provided you don't give up too early.",
      challenge: "Despair and disconnection are making it hard to see any way forward."
    }
  };

  L['major-18'] = {
    tone: { up: -0.4, rev: 0.2 },
    up: {
      general: "Things aren't what they seem, and fear is filling in the gaps. Move carefully, don't assume the worst or the best, and wait for clearer information.",
      love: "Confusion, mixed signals or hidden feelings. Projections or anxieties may be distorting how you see the other person; don't act on assumptions.",
      career: "Unclear situations, rumours or a lack of transparency. Double-check facts and hold off on decisions until things come into focus.",
      money: "Unclear terms, misleading information or worries that run ahead of reality. Get the facts in writing before you commit.",
      advice: "Move slowly, question what fear is telling you, and wait for the fog to lift before deciding.",
      outcome: "Expect a period of uncertainty where truths surface gradually rather than all at once.",
      challenge: "Fear, confusion or deception is distorting what you can see clearly."
    },
    rev: {
      general: "The fog is starting to lift. Confusion and fear are easing, though some things you'd rather not know may come up as they do.",
      love: "Misunderstandings clearing up, or a truth coming out that explains a lot. Uncomfortable, but it lets you see the relationship as it is.",
      career: "Clarity returning after a confusing period. Hidden information surfaces, and you can finally make a sensible decision.",
      money: "Hidden costs or confusing details become clear. Now you can deal with the real numbers rather than your worries.",
      advice: "Look directly at what's coming to light, even if it's uncomfortable, and use it to decide.",
      outcome: "This points to clarity returning and fears losing their hold.",
      challenge: "Old fears or suppressed feelings resurfacing just as things begin to clear."
    }
  };

  L['major-19'] = {
    tone: { up: 1.0, rev: 0.2 },
    up: {
      general: "Things are going well, and you can feel it. Clarity, warmth and success are on your side; let yourself enjoy it and be seen.",
      love: "Happiness, openness and real joy together. A warm, honest relationship where you both feel free to be yourselves.",
      career: "Success, recognition and confidence. Your work shines, and this is a great time to step forward, present or ask for what you want.",
      money: "Financial comfort and positive results. Good news, a reward for effort, or simply a period when money flows easily.",
      advice: "Be open, confident and generous, and let yourself enjoy what's going right.",
      outcome: "This leads to success, happiness and a clear, positive result.",
      challenge: "Overconfidence or assuming things will go well without doing your part."
    },
    rev: {
      general: "The good things are still there, just obscured for now. Joy feels muted or success delayed, but this is a cloudy day, not a lasting change.",
      love: "Happiness dimmed by stress or unrealistic expectations. Lighten up, and remember what made it good in the first place.",
      career: "Success delayed, or overconfidence causing a stumble. Keep going; recognition is still on its way.",
      money: "Gains take longer than hoped, or optimism outpaces your actual numbers. Stay realistic, and things will still come good.",
      advice: "Reconnect with what genuinely makes you happy, and keep your expectations grounded.",
      outcome: "Expect a good result that arrives later or more quietly than you hoped.",
      challenge: "Gloom or overconfidence is clouding a situation that is basically positive."
    }
  };

  L['major-20'] = {
    tone: { up: 0.6, rev: -0.3 },
    up: {
      general: "A wake-up moment. You're seeing your past clearly and being called to make a meaningful decision about what comes next.",
      love: "A reckoning or a second chance. Old issues come up to be resolved, and forgiveness can renew a relationship or let you move on cleanly.",
      career: "A calling, a major career decision, or a review of your path so far. Answer what you know you're meant to do.",
      money: "Taking an honest look at past financial decisions and resetting. A good time to settle old matters and start fresh.",
      advice: "Look honestly at the past, forgive what needs forgiving, and answer the call you keep hearing.",
      outcome: "This leads to renewal and an important decision that sets a new direction.",
      challenge: "Old regrets or refusing to reflect honestly on what has happened."
    },
    rev: {
      general: "You hear the call but doubt yourself. Harsh self-criticism or fear of making the wrong choice keeps you from stepping into something new.",
      love: "Repeating old mistakes, or punishing yourself or someone else for the past. Forgiveness is what's missing.",
      career: "Ignoring a calling or delaying a big decision out of self-doubt. You're more ready than you think.",
      money: "Avoiding a review of past mistakes, or being so hard on yourself that you freeze. Learn from it and move forward.",
      advice: "Go easier on yourself and make the decision you've been avoiding.",
      outcome: "Expect stagnation until you stop doubting yourself and act on what you know.",
      challenge: "Harsh self-judgement and fear of the call are holding you back."
    }
  };

  L['major-21'] = {
    tone: { up: 0.9, rev: -0.1 },
    up: {
      general: "Something reaches completion. You've come full circle, and this is the moment to recognise what you've achieved before the next chapter begins.",
      love: "Fulfilment and wholeness in a relationship, or reaching a significant milestone together. Things feel complete and right.",
      career: "Finishing a major project, graduating or reaching a long-held goal. Recognition and a sense of accomplishment are well earned.",
      money: "Reaching a financial goal or closing out a long-running matter. Take stock and celebrate before planning what's next.",
      advice: "Finish what you started, mark the achievement, and let yourself feel proud of it.",
      outcome: "This points to completion, fulfilment and a satisfying ending to this chapter.",
      challenge: "Not letting yourself feel finished, or rushing to the next thing without honouring this one."
    },
    rev: {
      general: "Almost there, but something is unfinished. A loose end, a shortcut or a missing piece stops this from feeling complete.",
      love: "Lack of closure or a relationship that feels stuck just short of its next step. Something needs finishing before you can move on.",
      career: "A project stuck at the last stage, or a goal delayed by small loose ends. Push to finish rather than starting something new.",
      money: "Unfinished financial business or a goal just out of reach. Tie up the loose ends.",
      advice: "Identify the one missing piece and finish it rather than starting something new.",
      outcome: "Expect delays and a lingering sense of incompletion until loose ends are tied.",
      challenge: "Shortcuts, unfinished tasks or a lack of closure are holding back the final result."
    }
  };
})();

(function () {
  var L = (window.Tarot = window.Tarot || {}).LORE = window.Tarot.LORE || {};

  // Ace of Wands
  L['wands-1'] = {
    tone: { up: 0.8, rev: -0.3 },
    up: {
      general: "A real spark has shown up: an idea, an offer or a sudden urge to start something. It is strongest right now, so act on it before second thoughts cool it down.",
      love: "Fresh attraction or a renewed charge in an existing relationship. Someone makes your pulse jump, or you both find a reason to flirt again. Let the interest show.",
      career: "A new project, pitch or opening that genuinely excites you. Put the first version on paper this week; the idea is good enough to be worth testing in the real world.",
      money: "A new income idea or a venture with real promise. The opportunity is there, but it needs you to make a first concrete move, not just think about it.",
      advice: "Say yes to the idea that keeps tugging at you and take one practical step on it today.",
      outcome: "This leads to a lively new start, with a project or connection catching fire quickly once you commit.",
      challenge: "You have the spark but keep waiting for a perfect moment, and the window to act is narrowing."
    },
    rev: {
      general: "The idea is there but it will not catch. You keep starting and stopping, or the drive you expected simply is not showing up yet. Forcing it tends to make things worse.",
      love: "Interest that flickers and fades: mixed signals, a date that keeps getting postponed, or desire that has gone quiet. Ask honestly whether the pull is mutual and whether it is still there.",
      career: "A launch keeps slipping, a pitch falls flat, or you cannot find the motivation for work that once excited you. Check whether the plan is wrong or you are simply tired.",
      money: "A venture that stalls before it earns anything, or money sunk into an idea that never quite gets going. Pause new spending until you know what is actually blocking progress.",
      advice: "Stop pushing the idea uphill and find out what would make you genuinely want to do it again.",
      outcome: "Expect a slow or false start, with the plan needing a rethink before it gains any real traction.",
      challenge: "Low motivation and scattered starts keep you from building anything that lasts beyond the first burst."
    }
  };

  // Two of Wands
  L['wands-2'] = {
    tone: { up: 0.5, rev: -0.2 },
    up: {
      general: "You are standing at the edge of what you know, looking at a bigger world and working out your next move. The planning stage matters; you hold more of the cards than you think.",
      love: "You are weighing where this relationship could go, or whether to look beyond your current circle. A conversation about future plans, like moving or travelling together, is worth having.",
      career: "You have outgrown the current setup and are mapping what comes next: a new market, a move abroad, a bigger role. Do the research now so the decision is informed, not impulsive.",
      money: "A good moment to plan longer-term: comparing options, setting goals or considering an investment further afield. Decisions made carefully now set up the next stage of growth.",
      advice: "Write down the two or three paths open to you and decide which one deserves your first real commitment.",
      outcome: "This points to a clear decision and a plan that takes you beyond familiar ground.",
      challenge: "You are comfortable where you are, and that comfort is making you overthink a choice you already understand."
    },
    rev: {
      general: "You can see a bigger life on the horizon but keep retreating to what feels safe. Plans stay on paper, or they lack the ambition the situation actually calls for.",
      love: "Fear of change keeps the relationship stuck in the same place, or one of you wants more while the other wants things to stay small. Talk about the future you are avoiding.",
      career: "You are playing it safe and turning down chances because the unknown feels risky. Or the plan is vague, with no clear steps. Either way, the move needs more courage or more detail.",
      money: "Money sits idle out of caution, or a plan falls apart because nobody worked out the numbers. A little homework would make the risk feel far more manageable.",
      advice: "Name the fear holding you back, then make one small move that tests the bigger plan without betting everything.",
      outcome: "Things move towards staying put, at least for now, unless you commit to a clearer plan.",
      challenge: "Fear of the unknown and a habit of playing safe keep you from stepping into the bigger opportunity."
    }
  };

  // Three of Wands
  L['wands-3'] = {
    tone: { up: 0.7, rev: -0.2 },
    up: {
      general: "The groundwork you laid is starting to pay off and the view ahead is opening up. Early results are coming back, and it is time to think a little bigger than you first did.",
      love: "A relationship that is growing past its early stage, perhaps across distance or with plans to build something together. Someone you have been waiting on may be closer to returning or committing.",
      career: "Your early efforts are being noticed: replies come back, a project gains traction, or opportunities appear in new markets or places. Keep expanding while the momentum is with you.",
      money: "Returns start to arrive on something you set in motion, like a business, a side income or an investment. Growth is real, and there is room to reinvest some of it wisely.",
      advice: "Look past the immediate task and position yourself for the larger opportunity you can now see coming.",
      outcome: "This leads to expansion and steady progress as earlier efforts start returning results from further afield.",
      challenge: "You are watching the horizon so closely that you are not preparing for what arrives when it lands."
    },
    rev: {
      general: "Things you set in motion are coming back slower than you hoped. Delays, small setbacks or a plan that was too narrow mean you need patience and a wider view.",
      love: "Waiting on someone who keeps delaying, or plans together that never quite get arranged. Distance, literal or emotional, is getting in the way of the next step.",
      career: "A delayed reply, a shipment held up, a deal that takes longer than promised. Something outside your control is slowing you down, so focus on what you can still move forward.",
      money: "Money expected from a venture or client arrives late, or growth is smaller than projected. Keep a buffer and avoid committing funds you have not yet received.",
      advice: "Be patient with what is outside your control, and widen your plan so one delay cannot stall everything.",
      outcome: "Expect slower progress than planned, with results arriving eventually but later and smaller than first hoped.",
      challenge: "Delays and limited foresight leave you waiting on results instead of building a plan that can absorb setbacks."
    }
  };

  // Four of Wands
  L['wands-4'] = {
    tone: { up: 0.9, rev: 0.1 },
    up: {
      general: "A real milestone worth marking: a homecoming, a finished stage or a moment where things finally feel settled. Let yourself enjoy it with the people who helped you get here.",
      love: "A happy, secure phase: moving in, meeting the family, an engagement or a celebration together. There is a sense of welcome and belonging that both of you can feel.",
      career: "A project completed, a launch celebrated or a team that genuinely works well together. Take the win, thank the people involved and enjoy a good stretch at work.",
      money: "Enough stability to relax a little: a home purchase, a goal reached or a comfortable footing for the household. Spending some of it on a shared celebration is well earned.",
      advice: "Stop and mark how far you have come, and share the moment with the people who made it possible.",
      outcome: "Things move towards a happy, stable milestone that feels worth celebrating with others.",
      challenge: "You are so focused on the next goal that you are not letting yourself feel settled in what you have built."
    },
    rev: {
      general: "The celebration feels hollow, or the sense of home and stability is wobbling. Something underneath needs repair, even if from the outside things look fine.",
      love: "Tension at home, family friction around the relationship, or a milestone that does not feel as joyful as it should. Talk about what is actually unsettled rather than papering over it.",
      career: "A team that looks united but is not, or a finished project that leaves you feeling oddly flat. A transition at work may be unsettling the routines you relied on.",
      money: "Household finances in flux: a move, a change in who earns what, or a big shared cost causing strain. Get the numbers on the table before resentment builds.",
      advice: "Look honestly at what feels unsettled at home or in your circle, and fix that before the next big step.",
      outcome: "This points to a period of transition where stability returns only after some rearranging at home or within the group.",
      challenge: "Unspoken tension at home or in your circle keeps you from feeling settled and secure."
    }
  };

  // Five of Wands
  L['wands-5'] = {
    tone: { up: -0.3, rev: 0.1 },
    up: {
      general: "Lots of competing voices, clashing opinions and people pulling in different directions. It is messy and tiring, but it can sharpen you if the competition stays fair.",
      love: "Bickering, small fights or rivals for attention. Neither of you is listening, and every topic turns into a contest. Ask whether you are arguing about the real issue or something smaller.",
      career: "Office politics, a crowded market or a team where everyone wants to be heard at once. Competition can raise your game, but pick your arguments and keep your own work strong.",
      money: "Competing priorities for the same pot of money, or a crowded market squeezing your margins. Expect some friction over who gets what, and be clear about your own bottom line.",
      advice: "Hold your position calmly and argue for the idea, not against the person.",
      outcome: "Expect a stretch of friction and competition, with progress coming to whoever stays focused amid the noise.",
      challenge: "Too many clashing opinions and egos are turning a workable situation into a constant scrap."
    },
    rev: {
      general: "The squabbling is winding down, or you are dodging a disagreement that really needs to happen. Peace is possible, but not if it means swallowing what you think.",
      love: "Either a fight finally settles and you can breathe, or one of you avoids conflict so completely that real issues never get aired. Calm is good; silence is not the same thing.",
      career: "A rivalry eases, or a team agrees to stop fighting and get on with it. Watch for the opposite too: keeping quiet in meetings to avoid friction you actually need to face.",
      money: "A dispute over money or terms is close to resolution. Settle on something fair, and do not give away more than you should just to make the tension stop.",
      advice: "Have the disagreement directly and fairly instead of avoiding it or letting it simmer.",
      outcome: "This leads to a truce, with conflict easing as people agree on common ground or quietly stop competing.",
      challenge: "Avoiding necessary conflict, or fighting with yourself about what you want, keeps the real issue unresolved."
    }
  };

  // Six of Wands
  L['wands-6'] = {
    tone: { up: 0.9, rev: -0.3 },
    up: {
      general: "A clear win and the recognition that comes with it. People can see what you have achieved, and you have every reason to walk a little taller right now.",
      love: "Feeling proud of your relationship or being admired by someone you care about. A partner may show you off, or you finally win over the person you have been hoping for.",
      career: "Public credit: a promotion, a good review, a pitch that lands or praise in front of the team. Your work has been noticed, so use the moment to ask for what you want next.",
      money: "A financial win, such as a bonus, a successful deal or a goal reached ahead of schedule. Enjoy it, and let the success build your confidence for the next move.",
      advice: "Accept the credit you have earned and use the goodwill to push for your next goal.",
      outcome: "This points to success and public recognition, with others clearly acknowledging what you have achieved.",
      challenge: "You are waiting for applause before you trust your own success, and that keeps you from moving forward."
    },
    rev: {
      general: "The recognition you hoped for has not come, or success has gone slightly to someone's head. Either way, the win feels less solid than it looked.",
      love: "Feeling unappreciated by a partner, or one of you caring more about how the relationship looks than how it feels. Pride may be stopping someone from admitting they were wrong.",
      career: "Someone else takes the credit, a promotion goes elsewhere or praise fades quickly. Or overconfidence is putting your standing at risk. Keep the work strong and your ego in check.",
      money: "A gain smaller than expected, or spending to look successful rather than to be secure. Watch for overconfidence after a good run; it is easy to give back what you made.",
      advice: "Measure your success by your own standards, and stay humble enough to keep learning.",
      outcome: "Expect recognition to be delayed or muted, or a short-lived win if pride gets in the way.",
      challenge: "Needing outside approval, or letting pride run ahead of results, undercuts the success you are working for."
    }
  };

  // Seven of Wands
  L['wands-7'] = {
    tone: { up: 0.2, rev: -0.4 },
    up: {
      general: "You are holding your ground under pressure, with people questioning your choices or competing for your place. Your position is worth defending, and you have the higher ground.",
      love: "Standing up for the relationship against outside opinions, or for your own needs within it. Hold to what matters to you, even if it means some uncomfortable conversations.",
      career: "Defending your idea, your role or your patch against challengers. It is tiring, but you have the advantage; stay prepared, keep your evidence ready and do not back down too early.",
      money: "Protecting what you have built from pressure, such as people asking for loans, rivals undercutting you or a hard negotiation. Stand firm on terms that are fair to you.",
      advice: "Stand up for your position with confidence and do not give ground just because someone pushes.",
      outcome: "This leads to holding your place successfully, provided you stay firm and keep defending what matters.",
      challenge: "Constant pressure from others is wearing you down and tempting you to give up ground you have earned."
    },
    rev: {
      general: "You are exhausted from defending yourself on every front, or you have become defensive where there is no real threat. It is time to choose your battles more carefully.",
      love: "Feeling worn out from justifying yourself, or reacting to every comment as an attack. Some disagreements are not fights. Lower your guard enough to listen.",
      career: "Too many battles at work and not enough backup, leading to burnout or wanting to quit. Or defensiveness is costing you allies. Decide which fight actually matters.",
      money: "Pressure on your finances from several directions at once, and you are tired of saying no. Set clear limits once, rather than renegotiating them every time someone asks.",
      advice: "Drop the fights that do not matter so you have strength for the one that does.",
      outcome: "Things move towards giving ground or backing down, unless you narrow your focus to what really counts.",
      challenge: "Overwhelm and defensiveness have you fighting on every front, so you cannot hold the one position that matters."
    }
  };

  // Eight of Wands
  L['wands-8'] = {
    tone: { up: 0.7, rev: -0.3 },
    up: {
      general: "Things are moving fast. Messages, decisions and opportunities arrive in quick succession after a quiet patch. Keep up, reply promptly and let the momentum carry you.",
      love: "A connection that picks up speed: lots of messages, quick plans, maybe travel to see each other. Feelings move fast, so enjoy the rush while keeping an eye on what is real.",
      career: "Projects move forward quickly, emails get answered and a decision you were waiting on finally lands. Travel or quick turnarounds may be involved, so stay organised and ready.",
      money: "Money moves quickly in both directions: a payment comes through, a deal closes, a purchase happens fast. Make sure quick decisions are still sound ones.",
      advice: "Act quickly while things are moving, and answer the messages you have been sitting on.",
      outcome: "Expect fast progress, quick news and things falling into place sooner than you thought.",
      challenge: "Everything is moving so fast that you risk acting before you have checked where it is all heading."
    },
    rev: {
      general: "Momentum has stalled, or it is rushing in the wrong direction. Delays, crossed wires and frustration are likely. Slow down, check your aim and redirect before pushing harder.",
      love: "Messages left unanswered, plans that keep falling through or a relationship moving too fast for comfort. Ask whether you need patience or a slower, more deliberate pace.",
      career: "Approvals delayed, projects stuck or a rushed decision you now regret. Too many things are in the air at once. Finish one before launching the next.",
      money: "Payments arrive late, transfers get held up or you made a hasty purchase. Double-check paperwork and avoid snap financial decisions until things steady.",
      advice: "Slow down, finish what you have already started and aim properly before you act again.",
      outcome: "This points to delays and frustration before things start moving again in a clearer direction.",
      challenge: "Scattered effort and delays out of your hands are stopping things from coming together."
    }
  };

  // Nine of Wands
  L['wands-9'] = {
    tone: { up: 0.3, rev: -0.5 },
    up: {
      general: "You are tired and a bit battered, but you are very close to the end. You have learned from earlier knocks; one more push will carry you through.",
      love: "Past hurts have made you guarded, yet you are still showing up for this. Keep your boundaries, but do not let them stop someone who has earned your trust from getting closer.",
      career: "A long, demanding stretch with the finish line nearly in sight. Keep going, protect your time and lean on your experience; you know how to handle the last obstacles.",
      money: "Money has been tight for a while, but you are close to stable ground. Stay disciplined a little longer and do not give up on the plan right before it pays off.",
      advice: "Hold on for one more push and protect your boundaries while you finish what you started.",
      outcome: "This leads to getting through, worn but intact, with the hard stretch ending soon.",
      challenge: "Weariness and old wounds make you suspicious of every new obstacle, even ones you could handle easily."
    },
    rev: {
      general: "You are running on empty and every new demand feels like too much. Pushing on stubbornly is not working. Rest is not defeat; protect what strength you have left.",
      love: "You are so guarded that nobody can get close, or you are exhausted from carrying the relationship alone. Say plainly what you need instead of bracing for the next disappointment.",
      career: "Burnout is close: long hours, constant firefighting and no recovery time. Stubbornly refusing help is making it worse. Ask for support or reduce the load now.",
      money: "Tired of always being careful with money, and tempted either to give up on the plan or to cling to it too rigidly. Rework the budget so it is something you can actually keep.",
      advice: "Rest and ask for help before you keep pushing, because you cannot hold the line on empty.",
      outcome: "Expect exhaustion to force a pause unless you take a break and accept support now.",
      challenge: "Exhaustion, suspicion and refusing to let anyone help are keeping you stuck at the last hurdle."
    }
  };

  // Ten of Wands
  L['wands-10'] = {
    tone: { up: -0.4, rev: 0.1 },
    up: {
      general: "You are carrying too much. Success or duty has piled up responsibilities until you can barely see where you are going. The end is near, but the load is unsustainable.",
      love: "One of you is doing most of the emotional or practical work in the relationship. Love has turned into a list of obligations. Share the load before resentment sets in.",
      career: "Too many projects, too much responsibility and nobody to delegate to. You are getting things done, but at real cost. Hand something off or renegotiate deadlines.",
      money: "Heavy financial obligations, like supporting others or juggling several big commitments at once. You can manage it, but look for what can be shared, cut or restructured.",
      advice: "Put down the responsibilities that are not truly yours and ask others to carry their share.",
      outcome: "This points to finishing the task, but tired and stretched, unless you lighten the load first.",
      challenge: "Taking on everything yourself has left you overloaded and unable to see what matters most."
    },
    rev: {
      general: "The burden is finally coming off, either because you are choosing to let some things go or because the strain has become impossible to ignore. Letting go now is wise.",
      love: "Dropping the expectation that you must hold everything together, or a relationship strained to breaking point by uneven effort. A frank conversation about sharing the load can help.",
      career: "Delegating, saying no or stepping back from a role that was crushing you. If you keep refusing, the strain may force the issue for you. Lighten the load deliberately.",
      money: "Freeing yourself from a financial burden: paying off a debt, cancelling commitments or stopping support you can no longer afford. Some relief is close if you make the cut.",
      advice: "Delegate, decline or drop something this week so you are not carrying it all alone.",
      outcome: "Expect relief as burdens are shared or released, though some things may be dropped along the way.",
      challenge: "Refusing to delegate or let go is pushing you towards collapse under the weight you insist on carrying."
    }
  };

  // Page of Wands
  L['wands-11'] = {
    tone: { up: 0.6, rev: -0.2 },
    up: {
      general: "Someone in your life, or a side of you, full of fresh enthusiasm and curiosity. Exciting news or a new interest is arriving, and it is worth exploring with an open mind.",
      love: "Playful, flirty interest, maybe from someone younger in spirit or new to your circle. An exciting message or invitation could arrive. Enjoy the curiosity without rushing to define it.",
      career: "A promising new idea, a course, a creative project or news about an opportunity. You are a beginner here, and that is fine; eagerness to learn will take you a long way.",
      money: "News about a new income idea or a small opportunity worth exploring. Experiment on a modest scale first, and learn the basics before committing serious money.",
      advice: "Follow your curiosity and try something new, treating it as an experiment rather than a final decision.",
      outcome: "This leads to exciting news or a new passion that opens a door you had not considered.",
      challenge: "Restless excitement makes it hard to stick with anything long enough for it to become real."
    },
    rev: {
      general: "Ideas without follow-through. Someone in your life, or a side of you, gets excited quickly and loses interest just as fast. Enthusiasm burns out before it becomes anything.",
      love: "Flaky interest, mixed messages or someone who loves the chase more than the relationship. Or you are bored and restless. Look for consistency, not just excitement.",
      career: "Lots of ideas but nothing finished, or news that turns out to be less promising than it sounded. Pick one project and see it through before you start another.",
      money: "Impulse spending on new hobbies or half-formed schemes that go nowhere. A bit of patience and a simple plan will save money you would otherwise waste.",
      advice: "Choose one idea and commit to finishing a small piece of it before chasing anything new.",
      outcome: "Expect setbacks or a fizzling start unless the excitement turns into steady effort.",
      challenge: "Hasty ideas and a short attention span keep you starting things without ever getting anywhere."
    }
  };

  // Knight of Wands
  L['wands-12'] = {
    tone: { up: 0.6, rev: -0.4 },
    up: {
      general: "Someone in your life, or a side of you, charging ahead with passion and courage. Things are on the move, and boldness will take you further than caution right now.",
      love: "An exciting, passionate connection that sweeps you along, or someone bold who makes their feelings obvious. It is thrilling; just notice whether they plan to stay once the chase is over.",
      career: "Time to act boldly: pitch the idea, take the trip, go after the role. Confidence and speed are working in your favour, as long as you follow up on what you start.",
      money: "Bold moves with money, like a quick investment or a spontaneous big purchase. Courage can pay off here, but make sure the excitement is backed by at least basic research.",
      advice: "Move boldly towards what you want, while keeping enough of a plan to finish what you start.",
      outcome: "Things move towards rapid change and an adventurous new chapter, likely involving travel or a bold decision.",
      challenge: "Impatience and the urge to charge in make it hard to stay with something once the thrill wears off."
    },
    rev: {
      general: "Rushing in without a plan, and creating chaos as a result. Someone in your life, or a side of you, is frustrated, impatient or scattered. Slow down before you act.",
      love: "Hot-and-cold behaviour, quick passion that fades or someone who leaves as quickly as they arrived. Or your own impatience is pushing things too fast. Steady is better than intense here.",
      career: "Hasty decisions, missed details or quitting in frustration. Projects stall because they were started without a plan. Cool down and rethink before making your next move.",
      money: "Reckless spending or a rushed investment that may backfire. Do not let frustration push you into a financial decision you have not properly thought through.",
      advice: "Pause, cool your temper and plan the next move before you take it.",
      outcome: "Expect delays or messes caused by haste unless you slow down and think it through.",
      challenge: "Recklessness and frustration have you charging in all directions without getting anywhere you actually want to go."
    }
  };

  // Queen of Wands
  L['wands-13'] = {
    tone: { up: 0.8, rev: -0.3 },
    up: {
      general: "Someone in your life, or a side of you, who is warm, confident and magnetic. You draw people in by being fully yourself. Lead by example and trust your own fire.",
      love: "Confidence and warmth make you attractive right now, or a self-assured, generous person enters the picture. Be open about what you want; your directness is part of the appeal.",
      career: "You are capable and visible, able to juggle a lot while keeping people motivated. Step up, speak in the meeting and take the lead on the thing you know you can handle.",
      money: "Good judgement and confidence with money: managing a household or business well and spending generously without losing control. Trust your instincts about what is worth it.",
      advice: "Show up with confidence, take up space and lead the way you would want others to follow.",
      outcome: "This leads to you stepping into your own authority, with warmth and confidence winning people over.",
      challenge: "Doubting your own spark, or holding back to avoid outshining others, keeps you from leading."
    },
    rev: {
      general: "Confidence has turned into self-doubt, jealousy or demanding behaviour. Someone in your life, or a side of you, feels unseen and is acting out of insecurity. Reconnect with what genuinely lights you up.",
      love: "Jealousy, possessiveness or needing constant reassurance. Or you have lost yourself in the relationship. Rebuild your own sense of worth instead of looking to a partner to supply it.",
      career: "Feeling overlooked and either withdrawing or becoming controlling. A demanding colleague or boss may be draining the room. Focus on your own work and the confidence will return.",
      money: "Spending to feel good or to keep up with others, or anxiety about money leading to rigid control. Look at what is really driving the choice.",
      advice: "Stop comparing yourself with others and put your effort back into what makes you feel capable.",
      outcome: "Expect insecurity to cause friction for a while, unless you rebuild your confidence from the inside.",
      challenge: "Jealousy, self-doubt or a need to control everything are getting in the way of your natural warmth."
    }
  };

  // King of Wands
  L['wands-14'] = {
    tone: { up: 0.8, rev: -0.3 },
    up: {
      general: "Someone in your life, or a side of you, with vision, drive and the confidence to lead. It is time to think big, take charge and make the plan happen.",
      love: "A confident, committed partner, or you taking the lead in shaping the relationship's future. Honesty and clear intentions work well; say where you want this to go.",
      career: "Leadership, entrepreneurship or owning a big vision. You can inspire people to follow, so set the direction clearly and back it with action. A strong mentor may also appear.",
      money: "Bold, well-judged financial decisions, like building a business, backing your own idea or investing for growth. Think long-term and act with conviction.",
      advice: "Set a clear vision, take charge and give others a direction worth following.",
      outcome: "This points to you taking the lead and turning a big idea into real, visible results.",
      challenge: "Hesitating to step into authority, or waiting for someone else to lead, leaves the vision unrealised."
    },
    rev: {
      general: "Leadership has become domineering, or the vision has outrun the plan. Someone in your life, or a side of you, sets expectations so high that nobody can meet them.",
      love: "A partner who wants control or reacts impatiently, or you expecting too much of each other. Make room for the other person's say in where things go.",
      career: "An overbearing boss, impulsive decisions from the top or your own vision outpacing the resources. Slow down, listen to the team and build the plan properly.",
      money: "Big ideas without the numbers to support them, or overconfidence leading to risky bets. Scale down until the plan matches what you can realistically fund.",
      advice: "Lead by listening and match the size of your plans to what you can actually deliver.",
      outcome: "Expect friction or setbacks from overreach unless ambition is tempered with patience and realistic planning.",
      challenge: "Impatience, control and unrealistic expectations are undermining your ability to lead people where you want to go."
    }
  };
})();

(function () {
  var L = (window.Tarot = window.Tarot || {}).LORE = window.Tarot.LORE || {};

  L['cups-1'] = {
    tone: { up: 0.9, rev: -0.2 },
    up: {
      general: "Your heart is opening again, and there is more feeling available to you than you've let yourself have lately. Let it in; this is the start of something warm and real.",
      love: "A new connection with real tenderness in it, or a fresh rush of affection in a relationship you already have. Someone is offering their heart, and it's sincere.",
      career: "Work you actually care about, or a project that lights you up emotionally. A kind offer, a supportive team or a creative idea could be the opening you need.",
      money: "Money flows in through goodwill: a gift, a generous gesture or work you love that starts to pay. Spend some of it on what genuinely nourishes you.",
      advice: "Let yourself feel what you feel and say yes to the warmth being offered, without overthinking it.",
      outcome: "This leads to a fresh emotional start, with new affection, friendship or a sense of being filled up again.",
      challenge: "You're guarding your heart so carefully that nothing good can get in, even when it's offered freely."
    },
    rev: {
      general: "Feelings are bottled up or running dry. You may be giving out more than you take in, and the emptiness you notice is a sign to refill before you pour again.",
      love: "Affection is held back, on your side or theirs. Someone may not be ready to open up, or you're looking to a partner to fill a gap only you can fill.",
      career: "You're going through the motions at work without feeling much. A promising idea stalls because the heart has gone out of it; find what still matters to you.",
      money: "Spending to fill an emotional gap, or generosity that leaves you short. Check whether the money is going where it really makes you feel better.",
      advice: "Look after your own needs first; rest, reconnect with what you love, and refill before you give more.",
      outcome: "Things move towards a quieter stretch where feelings stay closed until you deal with what's draining you.",
      challenge: "An emotional block, perhaps an old hurt, is stopping you from receiving or expressing what you feel."
    }
  };

  L['cups-2'] = {
    tone: { up: 0.8, rev: -0.4 },
    up: {
      general: "A real meeting of minds and hearts. Something between you and another person is mutual, balanced and respectful, and it can grow into a lasting bond.",
      love: "Mutual attraction, with both people showing up equally. A first date that clicks, a reconciliation, or a deepening commitment where each of you feels genuinely seen.",
      career: "A strong partnership: a colleague, co-founder or client you work well with. Agreements made now rest on trust and shared goals, so it's a good time to collaborate.",
      money: "Money decisions go well when made jointly. A fair deal, a shared account or a business partnership works because both sides benefit and both sides are honest.",
      advice: "Meet the other person halfway and say plainly what you value about them.",
      outcome: "This points to a balanced partnership, whether romantic or practical, built on mutual respect.",
      challenge: "You're reluctant to rely on anyone else, so a connection that could help you stays at arm's length."
    },
    rev: {
      general: "A connection has slipped out of balance. One person is giving more, listening less, or the two of you have stopped talking about what actually matters.",
      love: "Tension, a misunderstanding or a growing distance between you. It may be fixable, but only if someone admits the imbalance out loud instead of hoping it passes.",
      career: "A working partnership is strained: mismatched effort, unclear credit or a broken agreement. Clarify who does what before resentment sets in.",
      money: "A shared financial arrangement feels unfair, or someone isn't keeping their side of a deal. Get the terms in writing and talk about them directly.",
      advice: "Name the imbalance honestly and ask what the other person needs, rather than keeping score in silence.",
      outcome: "Expect a cooling or a split unless the two of you rebuild trust and talk openly.",
      challenge: "A breakdown in communication or a lopsided give-and-take is pulling the two of you apart."
    }
  };

  L['cups-3'] = {
    tone: { up: 0.8, rev: -0.3 },
    up: {
      general: "Good company and something to celebrate. The people around you are a real source of joy and support, so lean on them and share your wins.",
      love: "Love that is warmly supported by friends and family, or a happy social season where you meet someone through your circle. Fun and lightness help things along.",
      career: "Team spirit is strong: a group effort that succeeds, a launch party, or colleagues who genuinely back you. Your network opens doors right now.",
      money: "A good stretch financially that's worth marking, or money that comes through friends and community. Enjoy it, and share the celebration without overspending.",
      advice: "Gather your people, mark what's gone well, and let others help carry the load.",
      outcome: "This leads to a reason to celebrate, shared with people who are genuinely glad for you.",
      challenge: "You're trying to do this alone when the friendships and support you need are right there."
    },
    rev: {
      general: "The social side of life has turned sour or excessive. Too many late nights, gossip in a friendship group, or a feeling of being left out.",
      love: "A third person complicates things, whether through flirting, interference or friends who take sides. Or you're socialising so much there's no real time for each other.",
      career: "Office politics, cliques or chatter behind someone's back. Teamwork suffers because people are more focused on the group dynamics than the work.",
      money: "Overspending on going out, gifts and keeping up with friends. A fun season is quietly costing more than you can comfortably afford.",
      advice: "Step back from the drama and spend time only with the people who truly have your back.",
      outcome: "Things move towards a pulling back from a group or a friendship that no longer feels good.",
      challenge: "Gossip, overindulgence or a third party is getting between you and the people who matter."
    }
  };

  L['cups-4'] = {
    tone: { up: -0.3, rev: 0.3 },
    up: {
      general: "You're bored, flat or turned inward, and it's making you overlook something good that's being held out to you. Look up for a moment before you decide nothing's on offer.",
      love: "One of you has gone quiet or disengaged. You might be dismissing someone's real interest because you're tired, sulking, or comparing them to an ideal.",
      career: "Work feels stale and you've stopped noticing opportunities. A project, offer or conversation you're brushing off may be worth a second look.",
      money: "Apathy about money: bills left unopened, an offer or saving option ignored. Not much is wrong, but small chances are slipping by unnoticed.",
      advice: "Take a fresh look at what's already in front of you before writing it off as not enough.",
      outcome: "Expect a period of stagnation unless you choose to engage with what's being offered.",
      challenge: "Discontent and withdrawal are making you blind to opportunities that are genuinely within reach."
    },
    rev: {
      general: "You're coming out of a slump. Curiosity is returning and you're ready to say yes to things again, perhaps even to an offer you once turned down.",
      love: "You're ready to re-engage: answering the message, making the effort, or noticing someone who's been patiently showing interest. Your openness is coming back.",
      career: "Motivation returns. You see a new direction or finally accept a role or project you were dismissing, and you're ready to put real effort in again.",
      money: "You stop avoiding the numbers and start dealing with them. A neglected opportunity, like a better rate or side income, finally gets your attention.",
      advice: "Act on the spark of interest you're feeling now, before the old apathy creeps back.",
      outcome: "This points to renewed motivation and a willingness to take up an opportunity you'd been ignoring.",
      challenge: "Leftover cynicism from a flat period still makes you hesitate to fully commit."
    }
  };

  L['cups-5'] = {
    tone: { up: -0.6, rev: 0.2 },
    up: {
      general: "Something has been lost or hasn't worked out, and the disappointment is real. Let yourself feel it, but notice that not everything has gone; something still stands behind you.",
      love: "Heartache, regret or grief over a relationship that disappointed you. It hurts, and it's okay that it does, but you may be so focused on the loss that you miss what remains.",
      career: "A setback: a rejected application, a deal that fell through, or a mistake you're replaying. Learn what you can and look at the options still open.",
      money: "A loss or a money decision you regret. Dwelling on it won't recover it; take stock of what you still have and work forward from there.",
      advice: "Grieve what's gone, then turn around and take an honest look at what is still yours.",
      outcome: "This leads to a period of disappointment that, handled honestly, makes way for acceptance.",
      challenge: "Regret over what went wrong is keeping your attention fixed on the past instead of what remains."
    },
    rev: {
      general: "You're starting to make peace with a loss. The sting is easing, forgiveness feels possible, and you're turning back towards the people and options that are still here.",
      love: "Healing after heartbreak, or forgiveness that lets a relationship move forward. You can talk about what hurt without it reopening the wound.",
      career: "Recovering from a setback. You've absorbed the lesson and are ready to try again, maybe with a better plan or a different route.",
      money: "Accepting a past loss and rebuilding. You stop chasing what's gone and start putting what's left to good use.",
      advice: "Forgive yourself or the other person, and take one small step towards what's still possible.",
      outcome: "Expect acceptance and recovery, with energy returning to what remains rather than what was lost.",
      challenge: "Part of you still isn't ready to let go of the regret, even as things begin to heal."
    }
  };

  L['cups-6'] = {
    tone: { up: 0.5, rev: -0.2 },
    up: {
      general: "Warm memories, simple kindness and a sense of home. Someone or something from your past may resurface, or you find comfort in returning to what you know.",
      love: "Sweetness and familiarity: an old flame who reappears, a childhood friend, or a relationship that feels easy and safe. Small, thoughtful gestures matter more than grand ones.",
      career: "Returning to an old employer, skill or interest, or reconnecting with a past contact who can help. Generosity and goodwill at work are well received.",
      money: "Help from family, an inheritance of something sentimental, or a gift given with no strings. Old habits, good or bad, shape how you handle money now.",
      advice: "Reach out to someone from your past, or offer a simple kindness with no expectation of return.",
      outcome: "This points to a comforting reunion or a return to something familiar that feels like home.",
      challenge: "Looking back with rose-tinted glasses makes it hard to see the present for what it is."
    },
    rev: {
      general: "You're holding on to how things used to be, and it's keeping you from living fully now. Or you're finally ready to leave an old place, role or pattern behind.",
      love: "Comparing a partner to someone from the past, or idealising an ex who wasn't as good as you remember. Old family patterns may be playing out in your relationship.",
      career: "Clinging to how work used to be done, or to a role you've outgrown. It may be time to leave a familiar place and grow up into something new.",
      money: "Spending out of nostalgia, or relying on family money longer than is healthy. Time to take full ownership of your own finances.",
      advice: "Honour what the past gave you, then put your attention back on the life you're living now.",
      outcome: "Things move towards leaving something familiar behind and stepping into a more grown-up chapter.",
      challenge: "Nostalgia or naivety is keeping you tied to a version of things that no longer exists."
    }
  };

  L['cups-7'] = {
    tone: { up: -0.2, rev: 0.4 },
    up: {
      general: "Lots of tempting possibilities, but not all of them are real. Some are wishful thinking, some are distractions, and you'll need to look closely before you choose.",
      love: "Daydreaming about someone you barely know, or juggling several options without committing. Be careful you're falling for the person and not the fantasy.",
      career: "Too many ideas, offers or directions pulling at you. Some look glamorous but won't hold up; test them against reality before you pick one.",
      money: "Get-rich-quick schemes, shiny investments or spending on dreams. Separate the solid opportunities from the ones that only look good on paper.",
      advice: "Write down your options and check each one against facts, not hopes, before you commit.",
      outcome: "Expect confusion and scattered effort unless you narrow things down to what's actually achievable.",
      challenge: "Wishful thinking and too many choices are keeping you from committing to any one of them."
    },
    rev: {
      general: "The fog is lifting. You can see which options were illusions and which one is genuinely worth pursuing, and you're ready to act on it.",
      love: "Clarity about what you really want from love. A fantasy fades, and you see someone, or your own needs, much more clearly.",
      career: "You cut through the noise and choose a direction. Dropping the distractions frees up the focus you need to make real progress.",
      money: "You see through a too-good-to-be-true offer and put your money behind something realistic. A sensible decision replaces daydreaming.",
      advice: "Pick the one option that holds up under scrutiny and give it your full attention.",
      outcome: "This leads to clarity, a clear decision and the focus to follow it through.",
      challenge: "Even with clearer sight, a lingering pull towards the fantasy option may tempt you to hedge."
    }
  };

  L['cups-8'] = {
    tone: { up: -0.2, rev: -0.3 },
    up: {
      general: "You're walking away from something that no longer fulfils you, even though it may look fine from the outside. It's sad to leave, but you're going towards something truer.",
      love: "Leaving a relationship that has stopped meeting your needs, or stepping back emotionally to work out what you really want. It's a quiet, considered goodbye.",
      career: "Leaving a job or path that pays the bills but feels empty. You're looking for more meaning, even if it means giving up security for a while.",
      money: "Letting go of a comfortable income or investment because it costs you too much in other ways. Plan the transition so the move is sustainable.",
      advice: "Be honest about what has stopped working, and give yourself permission to leave it.",
      outcome: "This points to a deliberate departure and a search for something more meaningful.",
      challenge: "You know something isn't fulfilling you anymore, but walking away from what you've invested feels too hard."
    },
    rev: {
      general: "You're stuck between staying and going. Either fear is keeping you somewhere you've outgrown, or you're drifting without a clear sense of what you're searching for.",
      love: "Staying in a relationship out of fear of being alone, or going back and forth on leaving. Or you're giving something another real try after nearly walking away.",
      career: "Afraid to leave a role you've outgrown, or hopping between jobs without a clear aim. Figure out what you're actually looking for before the next move.",
      money: "Holding on to a poor financial situation out of habit, or making restless changes without a plan. Decide what stability means to you.",
      advice: "Decide clearly whether you're staying or going, and then commit to that choice fully.",
      outcome: "Expect more drifting or second-guessing until you make a firm decision about what to leave behind.",
      challenge: "Fear of the unknown keeps you tied to something that has stopped fulfilling you."
    }
  };

  L['cups-9'] = {
    tone: { up: 0.9, rev: -0.2 },
    up: {
      general: "A wish comes good here. Contentment, satisfaction and a real sense that things are going your way. What you've hoped for is within reach, so let yourself enjoy it.",
      love: "Happiness and ease in love. A wish around a relationship comes true, or you feel genuinely content, whether partnered or on your own.",
      career: "Recognition, a goal reached, or simply real satisfaction in your work. You've earned the comfort you're feeling, and it shows.",
      money: "Financial comfort and enough to enjoy life's pleasures. A wish around money may come good; spend on things that actually bring you joy.",
      advice: "Name what you really want, then let yourself enjoy what you already have.",
      outcome: "This leads to a wish fulfilled and a genuine sense of contentment.",
      challenge: "Complacency, or a habit of downplaying good things, keeps you from fully enjoying what you have."
    },
    rev: {
      general: "You have what you wanted, yet something still feels hollow. Or a wish is delayed, and the gap between how things look and how they feel is hard to ignore.",
      love: "A relationship that looks good on the surface but lacks depth, or a hope that hasn't come through yet. Ask what would truly satisfy you, not just impress others.",
      career: "Success that doesn't feel as good as expected, or smugness that puts people off. Look for meaning and not just status.",
      money: "Overindulgence or spending for show, or a sense that no amount is ever enough. Contentment won't come from buying more.",
      advice: "Look past surface pleasures and ask honestly what would leave you feeling satisfied.",
      outcome: "Expect a wish that's delayed, or comes true but feels emptier than you'd hoped.",
      challenge: "Chasing outward satisfaction or comfort is distracting you from what would truly fulfil you."
    }
  };

  L['cups-10'] = {
    tone: { up: 1.0, rev: -0.3 },
    up: {
      general: "Lasting happiness, harmony and a deep sense of belonging. The people closest to you feel like home, and this is emotional fulfilment that can last.",
      love: "A loving, committed relationship with shared values and a sense of family. Long-term plans, a home together, or simply feeling deeply settled with each other.",
      career: "A workplace that feels like a community, or work that fits well with your life and values. Balance between career and home is within reach.",
      money: "Enough security to look after the people you love. Money supports family harmony instead of straining it, and shared plans come together.",
      advice: "Invest your time in the people who feel like home, and protect that harmony.",
      outcome: "This points to lasting emotional fulfilment and a strong, happy sense of family or belonging.",
      challenge: "An idea of the perfect family or relationship makes it hard to appreciate the real one you have."
    },
    rev: {
      general: "The picture-perfect version isn't matching reality. There may be disconnection at home, values that don't line up, or a happy front over unspoken tension.",
      love: "You and a partner may want different things for the future, or keep up appearances while feeling apart. Talk honestly about values and long-term plans.",
      career: "Work is pulling you away from home life, or a team that looks united is quietly fractured. Your values and the workplace may no longer fit.",
      money: "Money causing strain within a family or household, or disagreements about shared spending. Get everyone on the same page before it hardens.",
      advice: "Drop the ideal for a moment and reconnect with the real people and values that matter.",
      outcome: "Expect some disharmony at home until honest conversations bring you back into alignment.",
      challenge: "A gap between how things look and how they really feel is creating distance with those closest to you."
    }
  };

  L['cups-11'] = {
    tone: { up: 0.6, rev: -0.3 },
    up: {
      general: "A surprising message of the heart, a creative spark, or a gentle new feeling. Someone in your life, or a side of you, is curious, sensitive and open to wonder.",
      love: "A sweet invitation, a flirty message or a tender confession. Feelings are young and tentative, so let them unfold without rushing to define them.",
      career: "A creative idea or an unexpected offer that seems small but has promise. Stay curious and open; your intuition is a useful guide here.",
      money: "A small, pleasant surprise with money, or an idea for earning through creativity. Worth exploring, but treat it as a beginning, not a windfall.",
      advice: "Follow the playful idea or tender feeling that keeps coming back, and see where it leads.",
      outcome: "This leads to a pleasant surprise, an emotional or creative opening you didn't see coming.",
      challenge: "You dismiss your own intuition or a creative idea because it seems too small or silly to take seriously."
    },
    rev: {
      general: "Emotional immaturity or daydreaming is getting in the way. Someone in your life, or a side of you, is sulking, avoiding reality or blocked creatively.",
      love: "Mixed signals, moodiness or a crush that lives more in your head than in real life. Someone may be emotionally young for what the relationship needs.",
      career: "A creative block, or ideas that never move past daydreaming. Hurt feelings at work are being taken too personally.",
      money: "Impulsive spending to cheer yourself up, or unrealistic hopes about a creative project paying off. Ground the dream in practical steps.",
      advice: "Bring your feelings into the open honestly, and give your ideas a practical next step.",
      outcome: "Expect a hoped-for message or opportunity to fall flat unless fantasy is matched with follow-through.",
      challenge: "Escapism or emotional immaturity, yours or someone else's, is keeping things from moving forward."
    }
  };

  L['cups-12'] = {
    tone: { up: 0.6, rev: -0.4 },
    up: {
      general: "An invitation to follow your heart. Someone in your life, or a side of you, is romantic, idealistic and ready to pursue what feels meaningful.",
      love: "A romantic offer or a charming suitor. Someone may be pursuing you with real feeling, or you're ready to make a heartfelt gesture of your own.",
      career: "An appealing offer, especially in creative or caring work. Follow the path that feels meaningful, but check the practical details before saying yes.",
      money: "An attractive proposal or a purchase made from the heart. Generous impulses are lovely; just make sure the numbers work too.",
      advice: "Make the heartfelt move you've been considering, with grace and sincerity.",
      outcome: "Things move towards a romantic or inspiring offer that invites you to follow your heart.",
      challenge: "Waiting for the perfect moment or perfect person keeps you from acting on what you feel."
    },
    rev: {
      general: "Charm without substance, or moods that swing too easily. Someone in your life, or a side of you, promises a lot but doesn't follow through.",
      love: "Someone who is romantic in words but unreliable in action, or jealousy and unrealistic expectations clouding things. Watch what they do, not just what they say.",
      career: "An offer that sounds better than it is, or a plan built on enthusiasm alone. Moodiness or perfectionism may also be slowing you down.",
      money: "A tempting deal that doesn't add up, or spending on impulse because something feels romantic. Be wary of sweet talk around money.",
      advice: "Look for consistent actions behind the charming words before you commit your heart or money.",
      outcome: "Expect disappointment if you follow an offer that's more charm than substance.",
      challenge: "Unrealistic expectations or someone's unreliable charm is leading you away from what's real."
    }
  };

  L['cups-13'] = {
    tone: { up: 0.7, rev: -0.3 },
    up: {
      general: "Deep care, emotional wisdom and steady intuition. Someone in your life, or a side of you, knows how to hold space for others while staying calm inside.",
      love: "A nurturing, emotionally attuned relationship. Lead with compassion and trust your instincts; they're reading the situation better than overthinking would.",
      career: "Your empathy is a real strength at work, whether in caring roles, managing people or creative fields. A supportive mentor may also appear.",
      money: "Trust your gut on money but stay grounded. You may be supporting others financially; make sure your own needs are covered too.",
      advice: "Listen to your intuition and offer compassion, to others and also to yourself.",
      outcome: "This leads to emotional security and a calm, caring presence that steadies everything around you.",
      challenge: "Absorbing everyone else's feelings leaves you little room to notice or protect your own."
    },
    rev: {
      general: "Giving so much that you lose yourself. Someone in your life, or a side of you, has become insecure, overly dependent or quietly martyred.",
      love: "Codependency, over-caring or needing reassurance constantly. Love becomes about rescuing or being rescued; it's time to set gentle boundaries.",
      career: "Taking on everyone's problems at work and burning out, or letting moods drive decisions. Protect your time and say no more often.",
      money: "Lending or giving money you can't afford, often out of guilt. Emotional spending may also be creeping in.",
      advice: "Set clear emotional boundaries and look after yourself as carefully as you look after others.",
      outcome: "Expect exhaustion or resentment unless you start meeting your own needs too.",
      challenge: "Insecurity or self-sacrifice is wearing you down and blurring the line between caring and losing yourself."
    }
  };

  L['cups-14'] = {
    tone: { up: 0.7, rev: -0.4 },
    up: {
      general: "Calm, mature handling of emotions. Someone in your life, or a side of you, stays steady when others are swept away, and leads with both kindness and control.",
      love: "A dependable, emotionally mature partner, or a chance for you to be one. Disagreements are handled with patience, and generosity flows both ways.",
      career: "Diplomatic leadership and a cool head under pressure. You can manage difficult people and situations by staying balanced and fair.",
      money: "Measured, generous financial decisions. You don't panic or splurge; you weigh things up and use money to support people you care about.",
      advice: "Stay calm and kind under pressure, and respond rather than react.",
      outcome: "This points to emotional balance and steady leadership that brings a situation under control.",
      challenge: "Keeping your feelings so tightly controlled makes it hard for others to know what you really think."
    },
    rev: {
      general: "Emotions are being suppressed or used as leverage. Someone in your life, or a side of you, swings between cold detachment and sudden outbursts.",
      love: "A partner who is distant, moody or emotionally manipulative, or your own feelings bottled up until they spill over. Honesty would serve better than control.",
      career: "A manager or colleague who is volatile or uses guilt to get their way, or you holding back frustration until it leaks out badly.",
      money: "Money used to control or manipulate, or erratic decisions made while upset. Wait until you're calm before signing or spending.",
      advice: "Acknowledge what you feel honestly instead of hiding it or using it to steer others.",
      outcome: "Expect emotional friction or a cold standoff unless feelings are dealt with openly.",
      challenge: "Suppressed emotions or someone's manipulative behaviour is making the situation unstable."
    }
  };
})();

(function () {
  var L = (window.Tarot = window.Tarot || {}).LORE = window.Tarot.LORE || {};

  L['swords-1'] = {
    tone: { up: 0.6, rev: -0.4 },
    up: {
      general: "A moment of real clarity is arriving. Something you have been circling suddenly makes sense, and once you see it plainly you can't unsee it.",
      love: "An honest conversation clears the air. Saying what you actually mean, rather than hinting, gives the relationship a cleaner footing than it has had in a while.",
      career: "A sharp idea or a clear decision gets things moving at work. Put the thought into words, write the proposal, and let the logic carry it.",
      money: "Look at the real numbers rather than the comfortable estimate. Once you see exactly where the money goes, the right decision becomes obvious.",
      advice: "Name the truth of the situation out loud, even to yourself, and make your decision from there.",
      outcome: "This leads to a breakthrough in understanding, where the confusion lifts and a clear way forward appears.",
      challenge: "A truth you would rather not face is sitting in plain sight, and avoiding it keeps everything foggy."
    },
    rev: {
      general: "Your thinking is muddled right now, or the information you're working from is incomplete. Hold off on big conclusions until you can see the facts properly.",
      love: "Mixed signals and half-said things are causing confusion. One of you may be reading meaning into words that weren't meant that way, or missing what was.",
      career: "Unclear instructions, shifting goals or a bad brief are muddying the work. Ask the awkward clarifying question before you put in more hours on a guess.",
      money: "Don't sign or commit based on a pitch that sounds clever but stays vague on details. Get the terms in writing and read them twice.",
      advice: "Wait for the facts to settle and ask direct questions before you decide anything important.",
      outcome: "Expect a period of confusion that only clears once someone states plainly what was left unsaid.",
      challenge: "Misinformation, mixed messages or your own overthinking are clouding a decision that would otherwise be simple."
    }
  };

  L['swords-2'] = {
    tone: { up: -0.3, rev: -0.4 },
    up: {
      general: "You're holding two options at arm's length and refusing to look at either too closely. The stalemate feels safe, but it can't last forever.",
      love: "One of you is avoiding a conversation, keeping the peace by not mentioning the obvious. The truce is fragile because the real feelings are still unspoken.",
      career: "A decision you keep postponing, such as two offers, two paths, or whether to stay, is draining you. More waiting won't produce better information.",
      money: "You're avoiding a money choice by not opening the statement or not running the numbers. The choice is still there whether you look or not.",
      advice: "Take the blindfold off: gather what you need, weigh both sides honestly, and set yourself a date to decide.",
      outcome: "Things stay at a standstill until you are willing to choose, and then they move quickly.",
      challenge: "Your reluctance to choose, and to accept that every option has a cost, keeps you stuck exactly where you are."
    },
    rev: {
      general: "The pressure to decide has become overwhelming, with too much input and too many opinions. Underneath the noise, you probably know more about what you want than you admit.",
      love: "Being caught between two people, or between your own head and heart, has worn you out. The avoidance is starting to cost more than an honest choice would.",
      career: "Information overload is freezing you. Too many considerations, stakeholders or what-ifs; strip the decision back to the two or three things that actually matter.",
      money: "You may be facing a choice where neither option looks good. Pick the one you can live with and stop paying the price of indecision.",
      advice: "Turn down the outside opinions and listen for the answer you keep quietly coming back to.",
      outcome: "This points to a choice being made for you if you don't make it yourself soon.",
      challenge: "Overwhelm and second-guessing have replaced judgement; you are collecting opinions instead of deciding."
    }
  };

  L['swords-3'] = {
    tone: { up: -0.9, rev: -0.1 },
    up: {
      general: "Something painful has been said or has come to light, and it hurts because it matters. This is a time to feel it honestly rather than pretend it didn't land.",
      love: "Hurt in a relationship: words that cut, a disappointment, or a truth about where you stand. The pain is real, and it deserves to be acknowledged, not rushed.",
      career: "A sharp disappointment at work, such as a rejection, harsh feedback or being passed over. It stings, but it also tells you something true about where you are.",
      money: "A financial blow or a loss that feels personal, perhaps money lent and not returned. Grieve it, then look clearly at what it teaches you.",
      advice: "Let yourself feel the hurt fully, and talk to someone who can hear it, instead of burying it.",
      outcome: "Expect a painful moment of truth that hurts at first but clears the way for honesty afterwards.",
      challenge: "A wound that hasn't been acknowledged, or words that cut deeply, is shaping how you see everything else."
    },
    rev: {
      general: "The worst of the hurt is beginning to pass. You're slowly letting go of the pain, though some days it still flares when you least expect it.",
      love: "Forgiveness and repair become possible, or at least you're no longer bleeding from the same wound. Be honest about whether it is healed or just quieter.",
      career: "You're recovering from a professional setback and can look at it with less sting now. Use what you learned rather than replaying what went wrong.",
      money: "A loss is being absorbed and you're steadying again. Stop punishing yourself over it and focus on rebuilding at a sensible pace.",
      advice: "Release the old hurt a little at a time, and stop reopening it to check whether it still stings.",
      outcome: "This points to gradual recovery, where sorrow loosens its hold and you can speak about it without it cutting.",
      challenge: "Holding on to an old grievance, or refusing to let it heal, keeps the pain sharper than it needs to be."
    }
  };

  L['swords-4'] = {
    tone: { up: 0.2, rev: -0.3 },
    up: {
      general: "You need rest more than you need answers right now. Stepping back for a while is not giving up; it's how you get your strength and perspective back.",
      love: "A quiet patch, or a need for some space to think. Taking a breather from the drama can help both of you come back calmer and kinder.",
      career: "Take the leave, close the laptop, protect a weekend. Your best thinking on this problem will come after a pause, not during another late night.",
      money: "Hold steady and don't make any big money moves while you're tired or stressed. A short freeze on spending decisions will serve you well.",
      advice: "Withdraw for a little while, rest properly, and let the situation sit before you act on it.",
      outcome: "Things move towards a calm pause that restores you and gives you a clearer head for what comes next.",
      challenge: "Exhaustion is clouding your judgement, and pushing on without rest is making things harder than they need to be."
    },
    rev: {
      general: "Either you're running on empty and refusing to stop, or the rest has gone on so long that it has quietly turned into hiding. Be honest about which one this is.",
      love: "Distance that was meant to be temporary is becoming the norm. Or you're too restless and drained to be present with someone, and it shows.",
      career: "Burnout is close, or already here. Alternatively you've been coasting too long and need to re-engage before stagnation costs you.",
      money: "A money matter left on pause for too long now needs attention. Or anxious restlessness is pushing you to make moves before you have thought them through.",
      advice: "Check whether you need real rest or a real restart, and then give yourself that, not a half measure.",
      outcome: "This leads to a forced pause if you keep ignoring the signs, or to a slow return to activity once you stop avoiding it.",
      challenge: "Burnout, or a retreat that has become avoidance, is stopping you from moving forward."
    }
  };

  L['swords-5'] = {
    tone: { up: -0.6, rev: -0.1 },
    up: {
      general: "A conflict where someone may win the point but lose something more important. Ask whether being right here is worth the damage it is doing.",
      love: "An argument where scoring points has replaced understanding each other. Someone walks away feeling defeated, and that resentment lingers long after the fight.",
      career: "Office politics, a competitive colleague, or a win that leaves bad feeling behind. Choose your battles; not every disagreement is worth burning goodwill over.",
      money: "A dispute over money, or a deal where one side gets the better of the other. A gain that costs you trust or reputation is not much of a gain.",
      advice: "Walk away from the fight that isn't worth it, and stop needing to have the last word.",
      outcome: "This points to a hollow victory, or a loss of goodwill, unless someone chooses to lay the conflict down.",
      challenge: "Pride and the need to win are turning a disagreement into something that harms everyone involved."
    },
    rev: {
      general: "The fight is winding down. There's a chance to make peace, though an old resentment may still be smouldering beneath the surface.",
      love: "An opening to apologise or reconcile after a falling out. It works only if both of you actually let the old argument go rather than saving it for next time.",
      career: "Tension with a colleague eases, or you finally walk away from a conflict that was going nowhere. Repairing the relationship may matter more than the original issue.",
      money: "A money dispute moves towards settlement. Accept a fair compromise rather than holding out for total vindication.",
      advice: "Make the first move to repair things, and leave the old score unsettled if that's the price of peace.",
      outcome: "Expect a truce or reconciliation, provided the old grievance isn't dragged back into every new conversation.",
      challenge: "Lingering resentment over a past conflict keeps you guarded and makes real peace difficult."
    }
  };

  L['swords-6'] = {
    tone: { up: 0.4, rev: -0.3 },
    up: {
      general: "You're moving away from a difficult time towards something calmer. It may be bittersweet, but leaving is the right call.",
      love: "A relationship moves past a rough patch into steadier water, or you are leaving something behind that wasn't good for you. Either way, it's a move towards peace.",
      career: "A transition, such as a new team, new job or relocation, that takes you out of a stressful situation. The change won't be instant, but it's heading the right way.",
      money: "Things are stabilising after a tough period. Steady, unglamorous progress gets you out of the rough water.",
      advice: "Keep moving towards what's calmer, and don't keep looking back at the shore you've already left.",
      outcome: "This leads to calmer conditions and a gradual sense of relief as the hard times fall behind you.",
      challenge: "Sadness about what you're leaving behind is making it hard to commit fully to moving on."
    },
    rev: {
      general: "You want to move on but something keeps pulling you back: unfinished business, old habits, or simply fear of what's on the other side.",
      love: "Old baggage keeps showing up in the relationship, or you can't quite leave something you know is over. The past is taking up seats in the boat.",
      career: "A transition stalls, or you resist a change that would help you. Perhaps the move is delayed, or you keep finding reasons to stay where you're unhappy.",
      money: "Old debts or financial habits keep dragging you back just as you start to get ahead. Deal with what's left over before you try to move forward.",
      advice: "Finish what's unfinished so you can leave properly, and travel lighter this time.",
      outcome: "Things stay choppy until you deal with what's holding you back, after which the crossing becomes possible.",
      challenge: "Unresolved baggage, or a reluctance to leave the familiar, is keeping you anchored in a situation you've outgrown."
    }
  };

  L['swords-7'] = {
    tone: { up: -0.5, rev: 0.1 },
    up: {
      general: "Not everything is out in the open. Someone may be working an angle, or you may be tempted to cut a corner and hope nobody notices.",
      love: "Something is being kept quiet, whether a secret, a half-truth or a side of things you're not being shown. Pay attention to what doesn't add up.",
      career: "Politics, hidden agendas or someone taking credit that isn't theirs. Be strategic and protect your work, but don't stoop to the same tactics.",
      money: "Be wary of a deal that seems too clever or a person who is vague about the details. Check the fine print and keep your own records.",
      advice: "Stay alert and work strategically, but keep your own conduct clean so nothing can come back to bite you.",
      outcome: "This points to something hidden being uncovered, or a shortcut that doesn't hold up for long.",
      challenge: "Deception, yours or someone else's, is undermining trust and making it hard to know where you really stand."
    },
    rev: {
      general: "The truth is coming out. A confession, an admission, or simply your own conscience making it impossible to keep pretending.",
      love: "Someone comes clean about something, or you stop fooling yourself about how things really are. It's uncomfortable, but it makes honesty possible again.",
      career: "A hidden agenda gets exposed, or you realise a shortcut isn't worth the risk. Owning a mistake now costs far less than having it found later.",
      money: "Hidden costs or a scheme that looked too good come to light. It's a moment to be honest about your own finances too, including any spending you've been hiding.",
      advice: "Come clean about what you've been hiding, from others or from yourself, before it's discovered.",
      outcome: "Expect the truth to surface and a chance to start again on a more honest footing.",
      challenge: "A guilty conscience, or the effort of keeping a story straight, is wearing you down."
    }
  };

  L['swords-8'] = {
    tone: { up: -0.6, rev: 0.4 },
    up: {
      general: "You feel trapped, but much of the trap is made of thoughts: fears, assumptions and rules you've accepted without checking. The way out is closer than it seems.",
      love: "You feel stuck in a relationship pattern, or unable to say what you need. Ask whether the limits are truly fixed or just what you've told yourself.",
      career: "A job that feels like a cage, with the sense that you can't leave or can't ask for more. Test those assumptions; you likely have more options than you think.",
      money: "Feeling boxed in financially can freeze you. Write down your actual options, even small ones, and you'll see the room is bigger than it felt.",
      advice: "Question the story that says you're stuck, and take one small step that proves it wrong.",
      outcome: "Things stay restricted until you change how you see the situation, and then movement comes surprisingly fast.",
      challenge: "Your own fears and limiting beliefs are holding you in place more firmly than any outside circumstance."
    },
    rev: {
      general: "You're starting to free yourself. A new perspective shows you the way out was there all along, and the fear that held you is losing its grip.",
      love: "You stop accepting a dynamic that kept you small, or finally say what you need. That honesty gives both of you more room to breathe.",
      career: "You realise you're not as stuck as you thought, so you apply, ask, or set a boundary. The confidence returns once you take the first step.",
      money: "Clearer thinking opens up options you'd overlooked. Small practical moves start loosening a situation that felt fixed.",
      advice: "Step out of the restriction now, trusting the new perspective you've gained over the old fear.",
      outcome: "This leads to release, a real sense of freedom once you walk away from what was holding you.",
      challenge: "A lingering fear of going back to feeling trapped may make you hesitate even as the way opens."
    }
  };

  L['swords-9'] = {
    tone: { up: -0.7, rev: 0.2 },
    up: {
      general: "Worry is keeping you up, replaying the same thoughts at 3am. The fear you feel is real, but it is often louder than the situation itself.",
      love: "Anxiety about the relationship, such as overthinking a text or imagining the worst, is doing more damage than anything that has actually happened. Check the fear against the facts.",
      career: "Dread about work, a deadline or a mistake you think everyone noticed. Most of the weight is in your head; speak to someone and get a reality check.",
      money: "Money worries are feeding on themselves. Sitting down with the actual figures, however unpleasant, usually feels better than lying awake imagining them.",
      advice: "Get the worries out of your head and onto paper, or into a conversation with someone you trust.",
      outcome: "This points to a stretch of anxiety that eases once you face the actual problem rather than the imagined one.",
      challenge: "Spiralling worry and worst-case thinking are wearing you down and blurring what is actually true."
    },
    rev: {
      general: "The worst of the worry is starting to lift. Reaching out, talking things through, or simply getting some distance helps the fear shrink back to size.",
      love: "Sharing what's been worrying you brings relief, and the other person may have been worrying too. Honest reassurance starts to replace the late-night spirals.",
      career: "A dreaded situation turns out to be manageable, or you finally ask for help with what's been overwhelming you. The pressure begins to ease.",
      money: "Facing the numbers or getting advice takes some of the dread out of a money worry. There's a way through, even if it takes time.",
      advice: "Tell someone what's been weighing on you, because you don't have to carry it alone.",
      outcome: "Expect relief as the fear loosens and you start to sleep on things instead of lying awake with them.",
      challenge: "Keeping your worries secret, or feeling ashamed of them, stops you getting the support that would help."
    }
  };

  L['swords-10'] = {
    tone: { up: -0.8, rev: 0.1 },
    up: {
      general: "Something has come to a painful, unmistakable end. It may feel like rock bottom, but that also means the falling has stopped, and the only way left is up.",
      love: "A relationship situation reaches its end point, or a betrayal makes it clear things can't continue as they were. It hurts, and it is also final enough to let you start healing.",
      career: "A project, role or plan has run its course, perhaps abruptly. Accept that it's over rather than trying to revive it, and turn towards what's next.",
      money: "A financial low point where you've hit the bottom. From here you can rebuild, but only if you stop hoping the old situation will somehow come back.",
      advice: "Accept that this chapter is over, stop fighting it, and let the recovery begin.",
      outcome: "This leads to a definite ending, painful but clean, that clears the ground for something new.",
      challenge: "Refusing to accept an ending, or dramatising it into total defeat, keeps you lying in the wreckage."
    },
    rev: {
      general: "You're picking yourself up after something very hard. Recovery has begun, though you may still be tempted to drag out an ending that already happened.",
      love: "Healing after a painful breakup or betrayal is underway. Be careful not to keep reopening it by going back to someone or something that already ended.",
      career: "You're rebuilding after a professional setback, and the worst is behind you. Alternatively, you're clinging to a role or project that has clearly finished.",
      money: "Slow recovery after a financial hit. Things are improving, but resist chasing your losses or repeating the moves that caused them.",
      advice: "Let the ending be an ending and put your effort into rebuilding, one practical step at a time.",
      outcome: "Things move towards recovery and renewal, provided you don't keep returning to what's already finished.",
      challenge: "Holding on to something that has clearly ended is preventing you from beginning again."
    }
  };

  L['swords-11'] = {
    tone: { up: 0.3, rev: -0.3 },
    up: {
      general: "Curiosity and alertness serve you well. Ask questions, gather information and keep your eyes open, because there's something here you still need to learn.",
      love: "Someone in your life, or a side of you, wants to talk, ask questions and really understand. Lively conversation helps, though a little guardedness may still be in the mix.",
      career: "A good time to research, learn a new skill or investigate before committing. A sharp, inquisitive person may bring a fresh idea to the table.",
      money: "Do your homework: compare options, read the reviews, ask the obvious questions. Curiosity now protects you from expensive surprises later.",
      advice: "Stay curious and alert, and find out more before you form a firm opinion.",
      outcome: "This points to new information or an idea arriving that changes how you see the situation.",
      challenge: "Restless overthinking, or watching suspiciously instead of asking directly, is keeping you from the full picture."
    },
    rev: {
      general: "Lots of talk, not much follow-through. Words may be getting used carelessly, whether yours or someone else's, and scattered thinking is getting in the way.",
      love: "Gossip, careless comments or someone who says a lot but commits to little. If that person is you, think before you send that message.",
      career: "Ideas that never turn into action, or loose talk that causes trouble at work. Be careful what you share and with whom.",
      money: "Hot tips and hearsay are not a plan. Don't act on rumours or someone's confident chatter without checking the facts.",
      advice: "Talk less, listen more, and back up your words with one concrete action.",
      outcome: "Expect confusion or crossed wires if careless words keep running ahead of the facts.",
      challenge: "Gossip, scattered thinking, or promises that are all talk are undermining trust and focus."
    }
  };

  L['swords-12'] = {
    tone: { up: 0.3, rev: -0.5 },
    up: {
      general: "Things are moving fast, and someone, perhaps you, is charging ahead with determination and a clear target. Momentum is on your side if you keep your aim true.",
      love: "Someone in your life, or a side of you, comes on strong: direct, eager and quick to act. It's exciting, but make sure speed doesn't run over feelings.",
      career: "Drive and quick thinking push a goal forward. Take decisive action on the plan, and argue your case with confidence.",
      money: "A fast-moving opportunity calls for a quick, clear decision. Act decisively, but only once you've done the basic checks.",
      advice: "Move decisively towards your goal and speak plainly, while keeping an eye on who's in your path.",
      outcome: "Things move towards rapid change, with events speeding up and a goal pursued hard and reached quickly.",
      challenge: "Rushing ahead without thinking it through, or arguing to win rather than to understand, is causing friction."
    },
    rev: {
      general: "Haste is causing damage. Acting before thinking, harsh words said in the heat of the moment, or charging at something with more force than sense.",
      love: "Someone, or a side of you, is being impulsive or cutting in arguments. Slow down before something is said that can't easily be taken back.",
      career: "Impatience and aggression backfire at work, through rushed decisions, burning out or clashing with people you need. Pace yourself and pick your moment.",
      money: "Impulsive moves with money, like chasing a quick win or panicking out of a decision, are likely to cost you. Wait until you're calm.",
      advice: "Slow down, cool off, and think through the consequences before you act or speak.",
      outcome: "This leads to setbacks caused by haste unless you rein in the urge to force things.",
      challenge: "Impulsiveness and a sharp temper are getting ahead of your judgement."
    }
  };

  L['swords-13'] = {
    tone: { up: 0.4, rev: -0.4 },
    up: {
      general: "Clear eyes and honest words are what this situation needs. Someone in your life, or a side of you, sees things as they are and isn't afraid to say so fairly.",
      love: "Directness and good boundaries serve the relationship. Say what you need without apology, and listen for the truth rather than the comforting version.",
      career: "Independent, perceptive and fair, you can cut through office noise and judge situations clearly. A frank mentor or colleague may offer feedback worth hearing.",
      money: "Make money decisions with a cool head, not hope or guilt. Set clear limits on lending or spending and stick to them.",
      advice: "Speak your truth directly and kindly, and hold your boundaries without needing to justify them.",
      outcome: "This points to a clear-eyed resolution, where honesty and good judgement settle things fairly.",
      challenge: "Seeing clearly is not the problem; it's that you've been unwilling to say what you see."
    },
    rev: {
      general: "Clarity has turned cold. Someone, or a side of you, is being cutting, critical or bitter, using honesty as a weapon rather than a light.",
      love: "Old hurt has hardened into coldness, or sharp words are pushing someone away. Being right won't help if no warmth is left in how you say it.",
      career: "Harsh criticism or a cold, isolated stance is damaging working relationships. You can be candid without being cutting.",
      money: "Bitterness about past losses, or rigid distrust, may be skewing your money decisions. Look at the numbers, not the grudge.",
      advice: "Soften how you say things without giving up the honesty underneath them.",
      outcome: "Expect distance and frostiness to grow unless some warmth comes back into the way people speak.",
      challenge: "Coldness, bitterness, or words meant to wound are getting in the way of a fair resolution."
    }
  };

  L['swords-14'] = {
    tone: { up: 0.5, rev: -0.5 },
    up: {
      general: "Clear thinking and fair judgement carry the day. Someone in your life, or a side of you, can take the emotion out of the problem and decide on principle.",
      love: "A relationship benefits from honest, level-headed discussion and agreed ground rules. A partner may seem reserved, but you can rely on their fairness.",
      career: "Lead with logic, expertise and integrity. A senior figure, advisor or your own authority sets the direction, and a well-reasoned argument wins.",
      money: "Seek solid professional advice and make decisions on evidence, not feeling. A disciplined, rules-based approach to money pays off.",
      advice: "Step back, look at the facts objectively, and make the fair decision even if it isn't the popular one.",
      outcome: "This leads to a sound, well-judged decision that holds up because it was made on principle.",
      challenge: "Being too detached and analytical, and leaving no room for how people feel, is getting in the way."
    },
    rev: {
      general: "Intelligence is being used to control rather than to clarify. Watch for manipulation, rigid rules, or power that's being misused, including your own.",
      love: "Someone, or a side of you, is using arguments to dominate rather than connect, with cold logic, point-scoring or emotional control dressed up as reason.",
      career: "A boss or authority figure who abuses their position, or decisions made for self-interest rather than fairness. Protect yourself and keep a record of what's agreed.",
      money: "Be wary of an advisor or arrangement that serves someone else's interests. Clever arguments can hide unfair terms.",
      advice: "Question authority that doesn't hold up, and make sure your own reasoning is fair rather than self-serving.",
      outcome: "Things move towards a power struggle or unfair decision unless the reasoning is opened up to scrutiny.",
      challenge: "Manipulation or rigid, controlling thinking is overriding what is fair and humane."
    }
  };
})();

(function () {
  var L = (window.Tarot = window.Tarot || {}).LORE = window.Tarot.LORE || {};

  L['pentacles-1'] = {
    tone: { up: 0.8, rev: -0.3 },
    up: {
      general: "A real, practical opening is being handed to you: something you can hold, build on and grow. It starts small, but it is solid ground rather than a passing idea.",
      love: "A relationship with genuine staying power is possible here, built on steady gestures more than grand speeches. Showing up reliably will matter more than saying the perfect thing.",
      career: "A concrete offer, role or project worth taking seriously: an interview that turns into something, or a proposal that finally gets a yes. Treat it as a seed and tend it.",
      money: "Money or a tangible resource comes within reach: a raise, a payment, a sound investment or a small business idea with legs. Put it somewhere it can grow rather than spending it at once.",
      advice: "Say yes to the practical opportunity in front of you and give it a plan, a budget and regular attention.",
      outcome: "This leads to a solid new foundation, something real you can keep building on for years.",
      challenge: "You are waiting for a bigger, shinier chance and overlooking the modest but solid one already in your hands."
    },
    rev: {
      general: "An opportunity is wobbling, either because it isn't as sound as it looks or because the groundwork hasn't been done. Slow down and check what you are actually standing on.",
      love: "Something promising stalls because the practical side was ignored: mismatched schedules, money tension, or one of you not ready to commit time. Talk about the real-world details.",
      career: "A job lead goes quiet, an offer falls through, or a project launches without proper planning. Before chasing the next one, fix the gaps that made this one fragile.",
      money: "Watch for a deal that looks better than it is, or a windfall spent before it lands. Hold off on big purchases or investments until the numbers truly add up.",
      advice: "Do the unglamorous planning first and check the figures twice before you commit any money or time.",
      outcome: "Expect a delay or a missed chance that teaches you to prepare properly before the next one comes.",
      challenge: "Poor planning, or a habit of grabbing at opportunities without checking whether they can actually hold your weight."
    }
  };

  L['pentacles-2'] = {
    tone: { up: 0.3, rev: -0.4 },
    up: {
      general: "You are keeping several things in motion at once and, for now, managing it. Flexibility is carrying you; just keep an eye on how long you can sustain this pace.",
      love: "Love is being squeezed in between other demands, and you are both finding ways to make it work. Small, playful moments will keep the connection alive while life is busy.",
      career: "Two roles, two projects or work alongside study: you are juggling and doing it reasonably well. Prioritise ruthlessly and keep your calendar honest so nothing slips quietly.",
      money: "Money is being moved around to cover things: one bill paid, another shifted to next month. It works if you track it closely and keep a small buffer.",
      advice: "Decide what matters most this week and let the rest bend around it without guilt.",
      outcome: "Things move towards a workable balance, as long as you stay nimble and keep checking your priorities.",
      challenge: "Spreading yourself across too many commitments, so that nothing gets your full attention."
    },
    rev: {
      general: "The juggling has tipped into overload. Something is about to drop, and it is better to choose what that is than to let it fall by accident.",
      love: "One of you feels like an afterthought, fitted in around everything else. The relationship needs a real slot in your week, not whatever time is left over.",
      career: "Too many deadlines, too many people to please, and quality is starting to slip. Say no to something, renegotiate a timeline, or ask for help before a mistake does it for you.",
      money: "Shuffling money between accounts or cards is no longer keeping up. Late fees, missed payments or a messy budget need sorting out now, while it is still manageable.",
      advice: "Put down at least one commitment on purpose so you can hold the rest properly.",
      outcome: "This points to a dropped ball unless you simplify, but also to the clarity that comes from finally cutting back.",
      challenge: "Overcommitment and disorganisation, and a reluctance to admit you cannot keep everything going at once."
    }
  };

  L['pentacles-3'] = {
    tone: { up: 0.7, rev: -0.3 },
    up: {
      general: "Good work gets done when the right people pool their skills. Your contribution is noticed, and what you are building together has real quality to it.",
      love: "A relationship that grows through doing things together: planning a home, sharing chores, working towards a common goal. Respect for each other's strengths is the glue here.",
      career: "Collaboration pays off and your expertise is recognised by people who matter. A team project, a mentor's feedback or a client's approval confirms you are on the right track.",
      money: "Money comes through skilled work and sound partnerships. Getting a professional's input, or teaming up with someone reliable, improves the result more than going it alone.",
      advice: "Bring the right people in, listen to their expertise and let each person do what they do best.",
      outcome: "This leads to a well-made result that others recognise, something built carefully enough to last.",
      challenge: "Trying to do it all yourself, or not trusting others' skills enough to share the work."
    },
    rev: {
      general: "The team isn't pulling in the same direction. Egos, unclear roles or sloppy standards are getting in the way of work that could be good.",
      love: "You are each working on the relationship in different ways and missing each other. One of you may feel the effort is lopsided or unappreciated. Agree on what you are actually building.",
      career: "Credit is going to the wrong people, a colleague isn't pulling their weight, or you feel your skill is undervalued. Clarify roles and standards before resentment hardens.",
      money: "A joint venture or shared expense is poorly organised. Cutting corners or skipping expert advice could cost more later. Get the terms clear and in writing.",
      advice: "Sit down with everyone involved and agree on roles, standards and who is responsible for what.",
      outcome: "Expect friction or mediocre results unless the group realigns around a shared goal.",
      challenge: "Poor teamwork, unclear roles, or work that isn't being valued properly by the people around you."
    }
  };

  L['pentacles-4'] = {
    tone: { up: 0.2, rev: -0.1 },
    up: {
      general: "You are holding on tightly to what you have, and some of that caution is wise. The question is whether your grip is protecting you or keeping new things out.",
      love: "Security matters to you in love, but holding back feelings, controlling the terms or guarding yourself too closely can make the other person feel shut out.",
      career: "You are protecting your position, your territory or your current role. Stability is valuable, but refusing to share knowledge or try something new may limit where you go next.",
      money: "Saving and protecting your resources is the theme. A cushion is sensible; just make sure caution isn't stopping you from spending where it would genuinely improve your life.",
      advice: "Keep your foundations secure, but loosen your grip enough to let something useful in or out.",
      outcome: "Things move towards stability and safety, though perhaps at the price of growth if you hold too tight.",
      challenge: "Fear of losing what you have, showing up as control, stinginess or a refusal to change."
    },
    rev: {
      general: "A tight grip is either loosening or getting tighter out of fear. Notice which: letting go a little can bring relief, while clutching harder only makes the worry louder.",
      love: "Possessiveness or emotional guardedness is coming to a head. Either you start to open up, or someone pushes back against feeling controlled. Generosity of feeling helps here.",
      career: "You may be ready to share responsibility, take a risk or move on from a safe role. Alternatively, fear of losing status is making you rigid with others at work.",
      money: "Money is either being released wisely after a period of hoarding, or anxiety about money is leading to rash spending or a tight-fisted attitude that strains relationships.",
      advice: "Let go of a small amount of control and see that you are still safe without clinging.",
      outcome: "This points to a release of pressure once you stop guarding everything so closely.",
      challenge: "Fear of loss turning into greed or control, or swinging from clutching to careless overspending."
    }
  };

  L['pentacles-5'] = {
    tone: { up: -0.7, rev: 0.2 },
    up: {
      general: "A lean, difficult stretch where you feel left out in the cold. It is hard, but you are not as alone as it feels; help exists if you let yourself look for it.",
      love: "One or both of you feels unsupported, shut out or struggling through hard circumstances together. Hardship can either pull you closer or apart; reaching for each other matters now.",
      career: "A job loss, a rejected application or a workplace where you feel invisible. Do not wait outside the door; ask for introductions, support or advice from people who can help.",
      money: "Money is tight and worry is running high. Look honestly at your situation and find the support available, from advice services to family, rather than struggling silently.",
      advice: "Ask for help directly and accept it, even if pride tells you to manage alone.",
      outcome: "Expect a tough patch, with relief coming once you reach out instead of waiting it out alone.",
      challenge: "Scarcity and the feeling of being shut out, made worse by not asking for the help that is nearby."
    },
    rev: {
      general: "The worst of a hard time is passing. Doors are opening again, and you are starting to find people and resources that help you get back on your feet.",
      love: "After a lonely or strained period, warmth returns. A reconciliation, renewed support, or simply feeling less alone with someone who sees what you have been through.",
      career: "Recovery after a setback: a new role after unemployment, a lead that finally replies, or a workplace that starts to include you. Keep momentum while things improve.",
      money: "Finances begin to steady after a difficult stretch. A debt becomes manageable, income returns, or a support arrangement takes some pressure off. Rebuild slowly.",
      advice: "Accept the help and opportunities now arriving, and take small steps to rebuild your footing.",
      outcome: "This leads to gradual recovery, with stability returning step by step after a hard season.",
      challenge: "Lingering worry from past hardship that makes it hard to trust things are actually improving."
    }
  };

  L['pentacles-6'] = {
    tone: { up: 0.6, rev: -0.3 },
    up: {
      general: "Giving and receiving are flowing fairly. Support may come to you, or you may be in a position to help someone else; either way, generosity is moving things forward.",
      love: "A relationship where care is shared and both people feel looked after. Kindness and fairness in how you give time, attention and effort keep the balance healthy.",
      career: "Help arrives through a mentor, a sponsor, a fair employer or a grant. Or you are the one able to lift someone else up. Fair treatment is the theme.",
      money: "A loan, gift, bonus or fair payment comes through, or you are well placed to give back. Generosity is good when it fits your means and comes freely.",
      advice: "Give where you can, accept what is offered with grace, and keep the exchange fair on both sides.",
      outcome: "Things move towards a fair exchange where support arrives and is shared in a healthy way.",
      challenge: "Difficulty either asking for help or giving it freely, so the exchange never quite balances."
    },
    rev: {
      general: "The giving has strings attached or the balance is off. Someone is taking more than they give, or help comes with conditions that cost more than they are worth.",
      love: "One person gives more and feels unappreciated, or affection is used to keep score or gain leverage. Look honestly at whether the care runs both ways.",
      career: "Unequal treatment, a favour that is now being called in, or a boss who uses generosity as control. Know what you are agreeing to before accepting help at work.",
      money: "Debts, loans with harsh terms, or lending money you won't see again. Be careful about money that changes hands between friends or family; get clarity on expectations.",
      advice: "Check what strings are attached before you give or accept, and protect yourself from one-sided arrangements.",
      outcome: "This points to an imbalance that needs correcting before resentment or debt builds up further.",
      challenge: "Generosity used as leverage, or a relationship where one side does all the giving."
    }
  };

  L['pentacles-7'] = {
    tone: { up: 0.3, rev: -0.3 },
    up: {
      general: "You have put in real effort and now you are waiting to see it pay off. This is a moment to step back, take stock and judge whether you are investing in the right things.",
      love: "A relationship you have invested in is growing slowly. Results won't be instant, but the patience you put in now builds something that lasts.",
      career: "You are mid-way through a long project, degree or career build. Progress may feel slow, but the work is compounding. Review it honestly and keep going where it is working.",
      money: "Long-term investments, savings or a business need time to mature. Avoid pulling out early; review your approach and let good decisions keep working.",
      advice: "Review your progress honestly, then keep investing patiently in what is actually growing.",
      outcome: "Expect a harvest that comes slowly but reliably, rewarding the effort you have put in so far.",
      challenge: "Impatience for results, or doubt about whether all the effort has been worth it."
    },
    rev: {
      general: "Frustration is building because the effort isn't showing results. It may be time to ask whether you are putting energy into the wrong place, rather than simply pushing harder.",
      love: "You are giving a lot and getting little back, or waiting for someone to change who shows no sign of it. Ask whether this relationship is growing at all.",
      career: "Long hours with little recognition or progress. A project that keeps dragging, or a path that no longer fits. Consider redirecting your effort somewhere it will count.",
      money: "Poor returns, an investment that isn't paying off or savings that aren't growing. Review where your money is going and cut what isn't working.",
      advice: "Stop pouring effort into what isn't growing and redirect it towards something that will reward you.",
      outcome: "This leads to a hard decision about where to invest next after a disappointing return.",
      challenge: "Impatience, wasted effort, or stubbornly sticking with something that has stopped yielding results."
    }
  };

  L['pentacles-8'] = {
    tone: { up: 0.6, rev: -0.2 },
    up: {
      general: "Steady, focused effort is building real skill. This isn't glamorous work, but each careful repetition is making you better and the quality is starting to show.",
      love: "Love grows through attention to the small things: remembering details, keeping promises, working through habits together. Effort in the everyday makes the relationship stronger.",
      career: "A period of training, apprenticeship or heads-down work where your craft improves. Attention to detail gets noticed, and the skills you sharpen now will pay off.",
      money: "Income grows through diligence: extra hours, a new skill you can charge for, or careful budgeting done consistently. Slow, honest effort builds reliable money.",
      advice: "Commit to the practice and give the details your full attention, one careful piece of work at a time.",
      outcome: "This leads to genuine mastery and the recognition that comes from doing the work well.",
      challenge: "Losing patience with the repetitive, detailed effort that real improvement actually requires."
    },
    rev: {
      general: "The work has become either mindless or obsessive. You are going through the motions, or polishing endlessly without finishing. Reconnect with why it mattered in the first place.",
      love: "One of you is pouring everything into work and the relationship gets the leftovers, or the relationship has become routine with no real attention. Small effort could revive it.",
      career: "Perfectionism is stalling progress, or boredom has made you sloppy. A skill may also be getting stale. Refresh your interest, or recognise if you have outgrown this work.",
      money: "Overworking for little gain, or carelessness with details leading to errors and fees. Check whether the effort you put in is fairly rewarded.",
      advice: "Finish what is good enough and stop polishing, or find a fresh reason to care about the work.",
      outcome: "Expect stalled progress until you either refocus your effort or let go of impossible standards.",
      challenge: "Perfectionism, burnout from repetitive work, or a loss of focus that lets quality slip."
    }
  };

  L['pentacles-9'] = {
    tone: { up: 0.8, rev: -0.3 },
    up: {
      general: "You have built something comfortable on your own terms, and you are allowed to enjoy it. Self-reliance and good choices have brought a well-earned sense of ease.",
      love: "You are complete in yourself, which makes for healthier love. You don't need a partner to be secure, and the right one will add to a life you already enjoy.",
      career: "Independence and recognition: freelance success, a senior role or a project you own. Your work has earned you freedom, so enjoy it and protect it.",
      money: "Financial comfort that you created yourself. Savings, sensible investments and good habits pay off. Treat yourself without guilt while keeping the foundations intact.",
      advice: "Enjoy what you have built and invest in your own comfort, independence and quality of life.",
      outcome: "Things move towards self-sufficient comfort and a life that feels genuinely your own.",
      challenge: "Difficulty enjoying what you have earned, or reluctance to let anyone share in your hard-won independence."
    },
    rev: {
      general: "Comfort feels just out of reach. You may be working so hard you cannot enjoy what you have, or a setback is threatening the independence you built.",
      love: "Independence has tipped into isolation, or you are relying on someone else for a sense of worth that should come from within. Look at what you need to feel secure.",
      career: "Hustling without rest, or a setback to your autonomy, such as a client loss or a role that limits your freedom. Rebuild slowly and stop proving yourself to everyone.",
      money: "Overspending to look successful, a dip in income, or money tied up in appearances. Check whether your lifestyle matches your real financial footing.",
      advice: "Slow down, rebuild your foundations, and stop spending or working to impress anyone.",
      outcome: "This points to a temporary setback that clears once you rebalance work, spending and rest.",
      challenge: "Overwork, superficial spending, or dependence that undermines your sense of self-reliance."
    }
  };

  L['pentacles-10'] = {
    tone: { up: 0.9, rev: -0.4 },
    up: {
      general: "Lasting security and a sense of belonging. What you are building is meant to last, and it connects you to the people and the roots that matter most.",
      love: "Commitment with a long view: moving in, combining families, marriage or building a shared home. Families on both sides may play a supportive role.",
      career: "A stable, established workplace, a family business, or a career that offers long-term security. Decisions you make now can shape your position for years.",
      money: "Long-term wealth, property, inheritance or a solid family financial base. Think in decades: plan, protect and build something that will outlast this year.",
      advice: "Make choices with the long term and your wider family in mind, and build something that will last.",
      outcome: "This leads to enduring security and a foundation that supports you and those around you for years.",
      challenge: "Family expectations or traditions that weigh on your choices more than you would like."
    },
    rev: {
      general: "The foundation feels shaky. Family pressure, disputes about money, or doubt about the long-term plan are disrupting what should feel settled.",
      love: "Family interference, disagreements about money or where to live, or doubts about long-term compatibility. Talk openly about the future you each want.",
      career: "Instability in an established company, a family business under strain, or a long-term plan that no longer fits. Do not stay only because it looks secure.",
      money: "Disputes over inheritance, shared assets or family money, or a long-term plan going off track. Get things clear and documented, and avoid risky bets.",
      advice: "Address the family or money tensions directly, and get shared arrangements clearly written down.",
      outcome: "Expect a period of strain around family or long-term plans that needs honest renegotiation.",
      challenge: "Disputes over money or legacy, or a family structure that feels more like a burden than support."
    }
  };

  L['pentacles-11'] = {
    tone: { up: 0.6, rev: -0.2 },
    up: {
      general: "A practical new beginning driven by curiosity and willingness to learn. Someone in your life, or a side of you, is ready to study and put in the effort to grow.",
      love: "A sincere, steady start in love, or someone who shows care through reliable actions. Take your time; trust builds through consistency rather than grand gestures.",
      career: "A new course, apprenticeship, entry-level role or study plan. Learn the basics thoroughly and the opportunities will follow from the skill you build.",
      money: "Good news about money, or a chance to learn how to manage it better. Start a budget, take a financial course, or make a modest first investment.",
      advice: "Commit to learning the practical skill, step by step, and treat yourself as a serious student.",
      outcome: "This points to a promising start whose rewards depend on how diligently you keep learning.",
      challenge: "Daydreaming about results instead of doing the slow, practical study that would get you there."
    },
    rev: {
      general: "Plans are not turning into action. Someone in your life, or a side of you, wants the result without putting in the effort to get there.",
      love: "Someone who talks about the future but doesn't follow through, or immaturity about the practical side of being together. Watch what people do more than what they say.",
      career: "Procrastination, a course left unfinished, or a lack of progress on skills that matter. Pick one thing and see it through rather than starting many.",
      money: "Missing money news, unrealistic plans, or carelessness with small amounts that adds up. Learn the basics before taking on anything complicated.",
      advice: "Stop planning and start doing the first small, practical task today.",
      outcome: "Expect slow progress until talk turns into consistent, practical effort.",
      challenge: "Procrastination and a lack of follow-through that keep good intentions from becoming results."
    }
  };

  L['pentacles-12'] = {
    tone: { up: 0.5, rev: -0.3 },
    up: {
      general: "Slow, methodical progress is the way forward. Someone in your life, or a side of you, gets things done through patience, routine and plain reliability.",
      love: "A dependable partner who shows love through consistency, or a phase of steady commitment. It may not feel thrilling, but it is the kind of love you can rely on.",
      career: "Reliable, consistent work wins the day. Stick to your routines, meet your deadlines and keep building. Steady effort earns trust and lasting results.",
      money: "Gradual, careful growth: regular saving, cautious investing and sticking to your budget. No quick wins, but your money will grow dependably.",
      advice: "Stick to your routine and keep making steady progress, even when it feels slow.",
      outcome: "Expect reliable, step-by-step progress that gets you where you want to go.",
      challenge: "Impatience with how slowly things move, or a temptation to cut corners to speed it up."
    },
    rev: {
      general: "Routine has turned into a rut. Someone in your life, or a side of you, is stuck, overcautious or simply going through the motions without moving forward.",
      love: "The relationship has become predictable and dull, or someone is too set in their ways to meet the other halfway. A small change in routine could help.",
      career: "Stagnation, boredom or rigid habits holding you back. Work has become automatic. Look for a new challenge, or at least a new way of doing the same job.",
      money: "Excessive caution means missed opportunities, or neglect of money matters out of boredom. Review your plan and make one active choice.",
      advice: "Break one stale habit this week and introduce a small, deliberate change.",
      outcome: "This leads to continued stagnation unless you shake up a routine that has stopped serving you.",
      challenge: "Stubbornness, boredom or laziness that has turned steady progress into standing still."
    }
  };

  L['pentacles-13'] = {
    tone: { up: 0.7, rev: -0.3 },
    up: {
      general: "Practical warmth and grounded care. Someone in your life, or a side of you, keeps things running, looks after others well, and still finds space for comfort.",
      love: "A nurturing, generous partner or a home that feels safe and well cared for. Love is shown through cooking, organising, and making daily life easier.",
      career: "You manage work and home with real competence. Your practical sense and calm care make you the person others rely on; use that to your advantage.",
      money: "Sensible, generous management of money. Enough to share and to enjoy, held together by good practical choices. Invest in comfort and security at home.",
      advice: "Look after the practical needs of yourself and others with the same warm, sensible care.",
      outcome: "Things move towards a comfortable, secure situation where both work and home feel well looked after.",
      challenge: "Spreading your care too thinly, or letting practical responsibilities crowd out your own needs."
    },
    rev: {
      general: "Caring for everyone except yourself. Someone in your life, or a side of you, is overstretched, out of balance between work and home, or smothering others with help.",
      love: "Over-giving until you feel drained, or one partner taking care to the point of control. Make room for your own needs and let others do their part.",
      career: "Work is eating into home life, or home pressures are spilling into work. Your reliability is being taken for granted; set clearer limits.",
      money: "Spending on others while neglecting your own security, or money worries straining the household. Rebalance where your resources go.",
      advice: "Put your own needs back on the list and let others take on some of the practical load.",
      outcome: "Expect strain until you restore a better balance between caring for others and yourself.",
      challenge: "Self-neglect, work-life imbalance, or care that has become controlling or smothering."
    }
  };

  L['pentacles-14'] = {
    tone: { up: 0.8, rev: -0.3 },
    up: {
      general: "Secure, disciplined success. Someone in your life, or a side of you, has built something lasting through patience and sound judgement, and can be trusted to steward it well.",
      love: "A dependable, protective partner who shows commitment through providing and planning. Love here is steady and practical, built to last rather than to dazzle.",
      career: "Leadership, business success or a senior role earned through consistent results. Make decisions with a long view and lead by example; people trust your judgement.",
      money: "Strong financial footing and good stewardship. Your discipline has paid off; keep making measured decisions and let your wealth support the people around you.",
      advice: "Lead with discipline and sound judgement, and use your resources to build something that lasts.",
      outcome: "This leads to secure, well-earned success and the respect that comes from managing things well.",
      challenge: "A controlling attitude, or a reluctance to share decision-making with people who could help."
    },
    rev: {
      general: "Money or status is taking up too much space. Someone in your life, or a side of you, is stubborn, controlling or measuring everything by what it is worth.",
      love: "Love feels transactional, or one partner uses money to control. Rigidity around how things should be is pushing warmth out of the relationship.",
      career: "A boss or a version of you that is inflexible, status-driven or resistant to change. Success built this way becomes brittle; adapt before it cracks.",
      money: "Greed, risky moves to protect status, or stubbornly holding a losing position. Look at whether your financial decisions still serve your real goals.",
      advice: "Loosen your grip on status and control, and remember what the money was meant to make possible.",
      outcome: "Expect stalled growth or strained relationships unless rigidity gives way to openness.",
      challenge: "Materialism, stubbornness and an overly controlling relationship with money or power."
    }
  };
})();

