"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryValue } from "@/lib/validation";

export type PendingShop = {
  id: string;
  name: string;
  address: string;
  area: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  hoursWeekday: string | null;
  hoursWeekend: string | null;
  suggestedCategory: CategoryValue | null;
  submittedByName: string | null;
  submittedNote: string | null;
  createdAt: string;
};

const CATEGORIES: Array<{ value: CategoryValue; label: string }> = [
  { value: "standard", label: "Theka" },
  { value: "legendary", label: "Legendary" },
  { value: "dive_bar", label: "Dive Bar" },
];

export function PendingList({ shops }: { shops: PendingShop[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  // Start from what the submitter suggested — they stood outside the place.
  // It is still only a default; approving is an explicit choice.
  const [choice, setChoice] = useState<Record<string, CategoryValue>>(() =>
    Object.fromEntries(
      shops
        .filter((s) => s.suggestedCategory)
        .map((s) => [s.id, s.suggestedCategory as CategoryValue]),
    ),
  );
  const [done, setDone] = useState<Record<string, string>>({});

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/shops/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "approve" ? { category: choice[id] ?? "standard" } : {}),
        }),
      });
      if (!res.ok) throw new Error();
      setDone((d) => ({ ...d, [id]: action === "approve" ? "Approved" : "Rejected" }));
      router.refresh();
    } catch {
      setDone((d) => ({ ...d, [id]: "Failed — try again" }));
    } finally {
      setBusy(null);
    }
  };

  if (shops.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-border p-8 text-center text-sm text-muted">
        Nothing waiting. Submissions from{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">/add</code>{" "}
        land here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {shops.map((shop) => (
        <li key={shop.id} className="rounded-card border border-border bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-text">{shop.name}</h3>
              <p className="mt-0.5 text-sm text-muted">
                {shop.address}, {shop.area} {shop.pincode}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted">
              {new Date(shop.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
            <Row label="Submitted by" value={shop.submittedByName ?? "Anonymous"} />
            <Row label="Phone" value={shop.phone ?? "—"} />
            <Row label="Weekday" value={shop.hoursWeekday ?? "not given"} />
            <Row label="Weekend" value={shop.hoursWeekend ?? "not given"} />
            <Row
              label="Pin"
              value={`${shop.latitude.toFixed(5)}, ${shop.longitude.toFixed(5)}`}
            />
          </dl>

          {shop.submittedNote && (
            <p className="mt-2 whitespace-pre-line rounded-card bg-surface-2 px-3 py-2 text-sm text-text">
              {shop.submittedNote}
            </p>
          )}

          <div className="mt-3">
            <a
              href={`https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=18/${shop.latitude}/${shop.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-accent hover:text-accent"
            >
              Check the pin ↗
            </a>
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <span className="text-xs font-medium text-muted">
              Approve as
              {shop.suggestedCategory && shop.suggestedCategory !== "standard" && (
                <span className="ml-1 font-normal">
                  · submitter suggested{" "}
                  {CATEGORIES.find((c) => c.value === shop.suggestedCategory)?.label}
                </span>
              )}
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setChoice((p) => ({ ...p, [shop.id]: c.value }))}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    (choice[shop.id] ?? "standard") === c.value
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-muted"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy === shop.id || Boolean(done[shop.id])}
              onClick={() => act(shop.id, "approve")}
              className="flex-1 rounded-card bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:flex-none"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busy === shop.id || Boolean(done[shop.id])}
              onClick={() => act(shop.id, "reject")}
              className="flex-1 rounded-card border border-border px-4 py-2.5 text-sm font-medium text-text disabled:opacity-50 sm:flex-none"
            >
              Reject
            </button>
            {done[shop.id] && (
              <span className="self-center text-sm font-medium text-open">
                {done[shop.id]}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 sm:justify-start sm:gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="truncate text-text">{value}</dd>
    </div>
  );
}
