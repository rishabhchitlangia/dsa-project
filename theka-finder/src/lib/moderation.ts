import blocklist from "../../data/blocklist.json";

/**
 * Deliberately light moderation. This is a casual community, not a
 * moderated forum: ordinary swearing is part of how people describe a dive
 * bar and is left alone. What gets rejected is targeted abuse and obvious
 * spam — the two things that would actually drive people off.
 *
 * Everything here is a pure function over the submitted text, so it runs on
 * the server at submit time with no external service.
 */

const BLOCKED: string[] = blocklist.blocked;
const SPAM_PHRASES: string[] = blocklist.spamPhrases;

/** The user-supplied fields the filter inspects. */
export type ReviewField = "authorName" | "body" | "insiderTip";

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: string; field: ReviewField };

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a",
  $: "s", "!": "i", "|": "i",
};

/**
 * Normalises evasion tricks: leetspeak, padding characters and stretched
 * letters ("f  u  c  k", "chuuutiya"). Deliberately not exhaustive —
 * an arms race isn't worth it at this scale.
 *
 * `runLimit` controls how far a stretched letter collapses. We compare
 * against both 2 and 1: collapsing to 2 catches "niggger" against a term
 * that genuinely doubles a letter, while collapsing to 1 catches
 * "chuuutiya". Terms themselves only ever collapse to 2, so a word like
 * "coon" never degrades into the ordinary word "con".
 */
function normalise(text: string, runLimit: 1 | 2 = 2): string {
  const substituted = text
    .toLowerCase()
    .replace(/[013457@$!|]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-z\s]/g, " ");

  return substituted
    // collapse "c h u t i y a" style padding
    .replace(/\b(?:[a-z]\s){2,}[a-z]\b/g, (m) => m.replace(/\s/g, ""))
    // collapse stretched letters (runs of 3+ only, so "hello" survives)
    .replace(/([a-z])\1{2,}/g, runLimit === 2 ? "$1$1" : "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Matches `term` as a whole word, tolerating a plural suffix. */
function hasWord(haystack: string, term: string): boolean {
  const padded = ` ${haystack} `;
  return (
    padded.includes(` ${term} `) ||
    padded.includes(` ${term}s `) ||
    padded.includes(` ${term}es `)
  );
}

function containsBlockedTerm(text: string): string | null {
  const variants = [normalise(text, 2), normalise(text, 1)];
  for (const term of BLOCKED) {
    const t = normalise(term, 2);
    if (!t) continue;
    for (const variant of variants) {
      // Word-boundary match, so "Scunthorpe" style false positives don't fire.
      if (hasWord(variant, t)) return term;
      // Multi-word terms ("kill yourself") can't use word padding.
      if (t.includes(" ") && variant.includes(t)) return term;
    }
  }
  return null;
}

function spamScore(text: string): { score: number; reason: string | null } {
  const lower = text.toLowerCase();
  let score = 0;
  let reason: string | null = null;

  for (const phrase of SPAM_PHRASES) {
    if (lower.includes(phrase)) {
      score += 3;
      reason ??= "This looks like a promotion rather than a description of the place.";
    }
  }

  // Links: this is a locator, reviews never need one.
  if (/\b(?:https?:\/\/|www\.)\S+/i.test(text) || /\b[a-z0-9-]+\.(?:com|in|net|org|co|link|xyz)\b/i.test(lower)) {
    score += 3;
    reason ??= "Links aren't allowed in reviews.";
  }

  // Phone numbers pasted into a review are almost always touts. Join digits
  // split by spaces or dashes ("98765 43210") without destroying the word
  // boundaries around them, which stripping all whitespace would do.
  const digitsJoined = text.replace(/(?<=\d)[\s-]+(?=\d)/g, "");
  if (/(?<!\d)(?:\+?91)?[6-9]\d{9}(?!\d)/.test(digitsJoined)) {
    score += 3;
    reason ??= "Please don't put phone numbers in reviews.";
  }

  // Shouting is rude, not spam. It contributes but never blocks on its own —
  // over-moderating an angry-but-real review is worse than letting it through.
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 20) {
    const caps = letters.replace(/[^A-Z]/g, "").length / letters.length;
    if (caps > 0.7) {
      score += 2;
      reason ??= "Please don't write in all caps.";
    }
  }

  // "aaaaaaaaaa" / "!!!!!!!!!!" — no genuine review looks like this.
  if (/(.)\1{9,}/.test(text)) {
    score += 3;
    reason ??= "That looks like keyboard mashing.";
  }

  // A wall of one repeated word.
  const words = lower.split(/\s+/).filter((w) => w.length > 2);
  if (words.length >= 8) {
    const unique = new Set(words).size;
    if (unique / words.length < 0.3) {
      score += 3;
      reason ??= "That looks like repeated text.";
    }
  }

  return { score, reason };
}

function checkField(
  text: string | undefined,
  field: ReviewField,
): ModerationResult | null {
  if (!text) return null;

  const blocked = containsBlockedTerm(text);
  if (blocked) {
    return {
      ok: false,
      field,
      reason:
        "That wording won't post. Strong opinions are fine — slurs and abuse aren't.",
    };
  }

  const { score, reason } = spamScore(text);
  if (score >= 3 && reason) {
    return { ok: false, field, reason };
  }

  return null;
}

/** Runs the filter across every user-supplied field of a review. */
export function moderateReview(input: {
  authorName?: string;
  body: string;
  insiderTip?: string;
}): ModerationResult {
  return (
    checkField(input.authorName, "authorName") ??
    checkField(input.body, "body") ??
    checkField(input.insiderTip, "insiderTip") ?? { ok: true }
  );
}
