import { Badge } from "@/components/ui/Badge";
import type { CategoryValue } from "@/lib/validation";

/** `standard` is the default and gets no tag — only curation is worth calling out. */
export function CategoryTag({ category }: { category: CategoryValue }) {
  if (category === "legendary") {
    return (
      <Badge tone="accent" title="Hand-picked institution">
        ★ Legendary
      </Badge>
    );
  }
  if (category === "dive_bar") {
    return (
      <Badge tone="accent" title="Small, no-frills, full of character">
        Dive Bar
      </Badge>
    );
  }
  return null;
}
