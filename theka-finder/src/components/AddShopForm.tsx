"use client";

import { useState } from "react";
import Link from "next/link";
import { PinPicker } from "@/components/map/PinPicker";
import { AREAS, findArea, suggestAreas } from "@/lib/areas";
import { MUMBAI_CENTER } from "@/lib/constants";

type Result =
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string; field?: string | null; existingSlug?: string | null };

const CATEGORY_CHOICES = [
  { value: "standard", label: "Wine shop / theka", hint: "A bottle shop" },
  { value: "dive_bar", label: "Dive bar / permit room", hint: "Somewhere you sit and drink" },
  { value: "legendary", label: "An institution", hint: "Been there forever" },
] as const;

export function AddShopForm() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [area, setArea] = useState<string>("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [hoursWeekday, setHoursWeekday] = useState("");
  const [hoursWeekend, setHoursWeekend] = useState("");
  const [category, setCategory] = useState<string>("standard");
  const [submittedByName, setSubmittedByName] = useState("");
  const [note, setNote] = useState("");

  const [point, setPoint] = useState<[number, number]>(MUMBAI_CENTER);
  const [pinMoved, setPinMoved] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const areaSuggestions = areaQuery && areaQuery !== area ? suggestAreas(areaQuery, 5) : [];

  /** Choosing an area moves the map there, which saves a lot of panning. */
  const chooseArea = (nameOfArea: string) => {
    const found = findArea(nameOfArea);
    setArea(nameOfArea);
    setAreaQuery(nameOfArea);
    if (found) {
      if (!pinMoved) setPoint([found.lat, found.lng]);
      if (!pincode) setPincode(found.pincodes[0]);
    }
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setPoint([pos.coords.latitude, pos.coords.longitude]);
      setPinMoved(true);
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!area || !AREAS.some((a) => a.name === area)) {
      setResult({ kind: "error", message: "Pick a neighbourhood from the list.", field: "area" });
      return;
    }
    if (!pinMoved) {
      setResult({
        kind: "error",
        message: "Drag the pin to where the shop actually is.",
        field: "pin",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/shops/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          area,
          pincode: pincode.trim(),
          latitude: point[0],
          longitude: point[1],
          phone: phone.trim() || undefined,
          hoursWeekday: hoursWeekday.trim() || undefined,
          hoursWeekend: hoursWeekend.trim() || undefined,
          suggestedCategory: category,
          submittedByName: submittedByName.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResult({
          kind: "error",
          message: data.error ?? "Couldn't send that. Try again.",
          field: data.field,
          existingSlug: data.existingSlug,
        });
        return;
      }

      setResult({ kind: "ok", message: data.message });
      setName("");
      setAddress("");
      setPhone("");
      setHoursWeekday("");
      setHoursWeekend("");
      setNote("");
      setPinMoved(false);
    } catch {
      setResult({ kind: "error", message: "Network trouble — nothing was sent." });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.kind === "ok") {
    return (
      <div className="rounded-card border border-open/30 bg-open-soft p-6 text-center">
        <h2 className="text-base font-semibold text-open">Sent for review</h2>
        <p className="mt-1.5 text-sm text-muted">{result.message}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="rounded-card bg-accent px-4 py-2.5 text-sm font-semibold text-white"
          >
            Add another
          </button>
          <Link
            href="/"
            className="rounded-card border border-border px-4 py-2.5 text-sm font-medium text-text"
          >
            Back to the map
          </Link>
        </div>
      </div>
    );
  }

  const invalid = (field: string) =>
    result?.kind === "error" && result.field === field
      ? "border-warn"
      : "border-border";

  const input =
    "w-full rounded-card border bg-surface px-3 py-2.5 text-base text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-text">The basics</h2>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-medium text-text">
            Shop name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            placeholder="e.g. Sagar Wine Mart"
            className={`${input} ${invalid("name")}`}
          />
        </label>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-medium text-text">
            Street or landmark
          </span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            maxLength={300}
            placeholder="e.g. Hill Road, opposite the bus depot"
            className={`${input} ${invalid("address")}`}
          />
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text">
                Neighbourhood
              </span>
              <input
                value={areaQuery}
                onChange={(e) => {
                  setAreaQuery(e.target.value);
                  setArea("");
                }}
                required
                autoComplete="off"
                placeholder="Start typing — e.g. Bandra"
                className={`${input} ${invalid("area")}`}
              />
            </label>
            {areaSuggestions.length > 0 && (
              <ul className="absolute z-[500] mt-1 w-full overflow-hidden rounded-card border border-border bg-surface shadow-lg">
                {areaSuggestions.map((a) => (
                  <li key={a.name}>
                    <button
                      type="button"
                      onClick={() => chooseArea(a.name)}
                      className="flex w-full items-baseline justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-surface-2"
                    >
                      <span className="text-text">{a.name}</span>
                      <span className="text-xs text-muted tabular-nums">
                        {a.pincodes[0]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text">
              Pincode
            </span>
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              inputMode="numeric"
              placeholder="400050"
              className={`${input} ${invalid("pincode")} tabular-nums`}
            />
          </label>
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-text">Where exactly?</h2>
          <button
            type="button"
            onClick={useMyLocation}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-accent hover:text-accent"
          >
            Use my location
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          Tap the map or drag the pin onto the shop. This is what puts it in
          the right place for everyone else.
        </p>

        <div
          className={`mt-3 h-64 overflow-hidden rounded-card border-2 ${
            result?.kind === "error" && result.field === "pin"
              ? "border-warn"
              : pinMoved
                ? "border-open/40"
                : "border-border"
          }`}
        >
          <PinPicker
            latitude={point[0]}
            longitude={point[1]}
            onChange={(lat, lng) => {
              setPoint([lat, lng]);
              setPinMoved(true);
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted tabular-nums">
          {pinMoved
            ? `Pin set at ${point[0].toFixed(5)}, ${point[1].toFixed(5)}`
            : "Pin not placed yet"}
        </p>
      </section>

      <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-text">
          What kind of place is it?
        </h2>
        <p className="mt-1 text-sm text-muted">
          A suggestion only — the Legendary and Dive Bar lists are curated by
          hand.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {CATEGORY_CHOICES.map((choice) => (
            <label
              key={choice.value}
              className={`flex cursor-pointer items-start gap-3 rounded-card border p-3 ${
                category === choice.value
                  ? "border-accent bg-accent-soft"
                  : "border-border"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={choice.value}
                checked={category === choice.value}
                onChange={() => setCategory(choice.value)}
                className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm font-medium text-text">
                  {choice.label}
                </span>
                <span className="block text-xs text-muted">{choice.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-text">
          Anything else?{" "}
          <span className="font-normal text-muted">All optional</span>
        </h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              maxLength={40}
              placeholder="+91 22 …"
              className={`${input} ${invalid("phone")}`}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text">
              Your name
            </span>
            <input
              value={submittedByName}
              onChange={(e) => setSubmittedByName(e.target.value)}
              maxLength={40}
              placeholder="Anonymous"
              className={`${input} ${invalid("submittedByName")}`}
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text">
              Weekday hours
            </span>
            <input
              value={hoursWeekday}
              onChange={(e) => setHoursWeekday(e.target.value)}
              placeholder="10:00-22:00"
              className={`${input} ${invalid("hoursWeekday")} tabular-nums`}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text">
              Weekend hours
            </span>
            <input
              value={hoursWeekend}
              onChange={(e) => setHoursWeekend(e.target.value)}
              placeholder="10:00-23:00"
              className={`${input} ${invalid("hoursWeekend")} tabular-nums`}
            />
          </label>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Leave hours blank if you&apos;re not sure — we&apos;d rather show
          nothing than something wrong.
        </p>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-medium text-text">
            Note for whoever reviews this
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Anything that helps confirm it — how long it's been there, what it's known for…"
            className={`${input} ${invalid("note")} resize-y leading-relaxed`}
          />
        </label>
      </section>

      {result?.kind === "error" && (
        <p role="alert" className="rounded-card bg-warn-soft px-4 py-3 text-sm text-warn">
          {result.message}
          {result.existingSlug && (
            <>
              {" "}
              <Link href={`/shop/${result.existingSlug}`} className="font-semibold underline">
                See the listing
              </Link>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="safe-bottom w-full rounded-card bg-accent px-5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send for review"}
      </button>
    </form>
  );
}
