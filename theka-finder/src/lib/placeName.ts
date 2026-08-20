import { AREAS } from "./areas";

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/['"''"]/g, "")
    .replace(/[^\p{L}\p{N}\s,]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const AREA_NAMES = new Set<string>();
for (const area of AREAS) {
  AREA_NAMES.add(normalise(area.name));
  for (const alias of area.aliases) AREA_NAMES.add(normalise(alias));
}

/**
 * True when an imported "place" is really a location label rather than a
 * business — a row whose name is just "Colaba" or "Sewri".
 *
 * Deliberately narrow: it fires only on an exact neighbourhood match.
 *
 * Two earlier, broader rules were removed after they cost real listings:
 * treating an address-shaped name as a label deleted "Chincholi wine Malad
 * west,mumbai", a genuine shop that includes its address; and normalising
 * away non-Latin characters made every Devanagari name look empty, which
 * would systematically drop Marathi- and Hindi-named shops. A handful of
 * surviving label rows is a much smaller price than either.
 */
export function isPlaceLabelNotBusiness(name: string): boolean {
  if (!name.trim()) return true;
  return AREA_NAMES.has(normalise(name));
}
