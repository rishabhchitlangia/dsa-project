"use client";

import { useEffect, useRef, useState } from "react";
import { suggestAreas, type Area } from "@/lib/areas";

/**
 * Neighbourhood / pincode search. Suggestions come from the bundled Mumbai
 * dataset and are matched in the browser, so typing costs no requests and
 * works with a flaky connection.
 */
export function LocationSearch({
  initialValue = "",
  onSearch,
  onUseLocation,
  locating = false,
  locationError = null,
}: {
  initialValue?: string;
  onSearch: (query: string) => void;
  onUseLocation: () => void;
  locating?: boolean;
  locationError?: string | null;
}) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Area[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const update = (next: string) => {
    setValue(next);
    const found = suggestAreas(next, 6);
    setSuggestions(found);
    setOpen(found.length > 0);
    setHighlighted(-1);
  };

  const choose = (area: Area) => {
    setValue(area.name);
    setOpen(false);
    onSearch(area.name);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (highlighted >= 0 && suggestions[highlighted]) {
      choose(suggestions[highlighted]);
    } else {
      onSearch(value.trim());
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapper} className="relative">
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon />
          <input
            value={value}
            onChange={(e) => update(e.target.value)}
            onFocus={() => value && setOpen(suggestions.length > 0)}
            onKeyDown={onKeyDown}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Neighbourhood or pincode — try Bandra or 400050"
            aria-label="Search a Mumbai neighbourhood or pincode"
            aria-expanded={open}
            aria-autocomplete="list"
            role="combobox"
            aria-controls="area-suggestions"
            className="w-full rounded-card border border-border bg-surface py-3 pl-10 pr-3 text-base text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-card bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent/40 sm:flex-none"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onUseLocation}
            disabled={locating}
            className="flex flex-1 items-center justify-center gap-2 rounded-card border border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-colors hover:border-accent disabled:opacity-60 sm:flex-none"
          >
            <LocateIcon spinning={locating} />
            {locating ? "Locating…" : "Near me"}
          </button>
        </div>
      </form>

      {locationError && (
        <p className="mt-2 text-xs text-warn" role="status">
          {locationError}
        </p>
      )}

      {open && suggestions.length > 0 && (
        <ul
          id="area-suggestions"
          role="listbox"
          className="absolute z-[500] mt-1 w-full overflow-hidden rounded-card border border-border bg-surface shadow-lg sm:w-[min(28rem,100%)]"
        >
          {suggestions.map((area, i) => (
            <li key={area.name} role="option" aria-selected={i === highlighted}>
              <button
                type="button"
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => choose(area)}
                className={`flex w-full items-baseline justify-between gap-3 px-4 py-3 text-left text-sm ${
                  i === highlighted ? "bg-surface-2" : ""
                }`}
              >
                <span className="font-medium text-text">{area.name}</span>
                <span className="shrink-0 text-xs text-muted tabular-nums">
                  {area.pincodes.join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5L18 18" strokeLinecap="round" />
    </svg>
  );
}

function LocateIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="10" cy="10" r="3.2" />
      <path d="M10 1.5v2.5M10 16v2.5M18.5 10H16M4 10H1.5" strokeLinecap="round" />
    </svg>
  );
}
