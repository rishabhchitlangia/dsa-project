/**
 * URL-safe slug. Handles the punctuation that shows up in shop names
 * ("Uncle's Bar & Permit Room" -> "uncles-bar-permit-room").
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Slug for a shop: name plus area, so two "Gupta Wines" don't collide. */
export function shopSlug(name: string, area: string): string {
  return slugify(`${name}-${area}`);
}
