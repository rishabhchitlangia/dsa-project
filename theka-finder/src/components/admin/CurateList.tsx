"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryValue } from "@/lib/validation";

export type CurateShop = {
  id: string;
  name: string;
  area: string;
  address: string;
  category: CategoryValue;
  source: string;
  osmKindHint: string | null;
};

const CATEGORIES: Array<{ value: CategoryValue; label: string }> = [
  { value: "standard", label: "Theka" },
  { value: "legendary", label: "Legendary" },
  { value: "dive_bar", label: "Dive Bar" },
];

/**
 * Bulk curation for the Legendary and Dive Bar lists. Those stay manual by
 * design, so this is the tool that makes manual practical across 100+ shops.
 */
export function CurateList({ shops }: { shops: CurateShop[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | CategoryValue>("all");
  const [pending, setPending] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, CategoryValue>>({});

  const categoryOf = (s: CurateShop) => local[s.id] ?? s.category;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shops
      .filter((s) => (filter === "all" ? true : categoryOf(s) === filter))
      .filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q),
      )
      .slice(0, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops, query, filter, local]);

  const setCategory = async (id: string, category: CategoryValue) => {
    setPending(id);
    const previous = local[id];
    setLocal((p) => ({ ...p, [id]: category }));
    try {
      const res = await fetch(`/api/admin/shops/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "setCategory", category }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      // Roll back so the UI never shows a change that didn't save.
      setLocal((p) => {
        const next = { ...p };
        if (previous) next[id] = previous;
        else delete next[id];
        return next;
      });
    } finally {
      setPending(null);
    }
  };

  const counts = shops.reduce<Record<string, number>>((acc, s) => {
    const c = categoryOf(s);
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Search by name or area"
          className="flex-1 rounded-card border border-border bg-surface px-3 py-2.5 text-base text-text placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {([["all", "All"], ...CATEGORIES.map((c) => [c.value, c.label] as const)] as Array<
          [string, string]
        >).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value as "all" | CategoryValue)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              filter === value
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-muted"
            }`}
          >
            {label}
            {value !== "all" && (
              <span className="ml-1 tabular-nums">{counts[value] ?? 0}</span>
            )}
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-muted">
        Showing {visible.length} of {shops.length}
        {visible.length === 200 && " (first 200 — narrow the search)"}
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {visible.map((shop) => (
          <li
            key={shop.id}
            className="flex flex-col gap-2 rounded-card border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">{shop.name}</p>
              <p className="truncate text-xs text-muted">
                {shop.area}
                {shop.osmKindHint && ` · ${shop.osmKindHint}`}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  disabled={pending === shop.id}
                  onClick={() => setCategory(shop.id, c.value)}
                  className={`rounded-full border px-2.5 py-1.5 text-xs font-medium disabled:opacity-50 ${
                    categoryOf(shop) === c.value
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-muted hover:border-accent"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
