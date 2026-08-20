# Theka Finder

A Mumbai liquor shop locator. **Discovery only** — no delivery, no
transactions, no alcohol sales. It answers three questions: where is the
nearest shop, is it open, and what is the place actually like.

## Status

MVP. Public locator, reviews, community submissions and a curator review
queue are complete. No login yet — the WhatsApp-based owner update flow is
a separate phase.

Seeded with **135 real Mumbai venues from OpenStreetMap**.

## Stack

| | |
|---|---|
| Next.js 16 (App Router) + React 19 + TypeScript | |
| Tailwind CSS v4 | Two themes off one token set — clean main site, gritty dive bars |
| Leaflet + OpenStreetMap tiles | **No API key, no account, nothing metered** |
| Postgres + Prisma 7 | Via the `pg` driver adapter |
| Zod | One set of schemas shared by the seed script and the API |

Nothing here costs money to run and nothing needs a key. Neighbourhood and
pincode search is matched against a bundled dataset of 65 Mumbai areas
rather than a geocoding service, so there is no external dependency, no
rate limit and no bill.

## Running it

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL
npx prisma migrate deploy # or `npm run db:migrate` in development
npm run seed
npm run dev
```

`DATABASE_URL` can point at any Postgres. Free options that need no card:

- **Neon** — `postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/db?sslmode=require`
- **Supabase** — `postgresql://postgres:PASS@db-xxx.supabase.co:5432/postgres`
- **Local** — `postgresql://user:pass@127.0.0.1:5432/theka_dev?schema=public`

Use Neon's **direct** connection string (turn the pooling toggle off in the
Connect dialog) — Prisma migrations do not run reliably through a pooler.

### Neon connections

`src/lib/db.ts` picks its driver from the hostname. A `*.neon.tech` URL uses
Neon's HTTP endpoint on 443, which needs no connection setup and so suits
serverless cold starts; anything else uses the normal Postgres wire protocol
on 5432. The HTTP driver cannot do interactive transactions — nothing in
this app uses them, and the code notes what to switch to if that changes.

`prisma migrate deploy` always uses the wire protocol, so run migrations
from somewhere with outbound 5432.

## Where the shop data comes from

```bash
npm run import:osm            # writes data/shops.osm.json
npm run import:osm -- --merge # merges new venues into data/shops.json
npm run seed                  # loads data/shops.json into Postgres
```

The importer queries [Overpass](https://overpass-api.de/) for
`shop=alcohol`, `shop=wine`, `shop=beverages`, `amenity=bar` and
`amenity=pub` across the Mumbai bounding box. Public Overpass mirrors are
volunteer-run and frequently return 503 or an empty database, so it rotates
four of them with backoff and refuses mirrors that answer 200 from an empty
dataset.

**Why not Google Places.** Google's
[Maps Platform terms](https://cloud.google.com/maps-platform/terms/maps-service-terms)
allow storing `place_id` indefinitely and lat/lng for 30 days; names,
addresses, phone numbers, hours and ratings may not be warehoused at all.
This app's `Shop` table is exactly that warehouse, so seeding it from Google
would mean either wiping most columns monthly or breaching the terms — and
it needs a billing account either way. OpenStreetMap is ODbL, which permits
storage and redistribution with attribution.

Everything imports as `standard`. Nothing is auto-promoted to `legendary` or
`dive_bar` — curate those at `/admin`.

You can still hand-edit `data/shops.json`; the format is unchanged.

Seeding is idempotent: shops are upserted on their slug, so re-running
updates rows instead of duplicating them, and **reviews are never touched**.
Bad rows are rejected with per-field messages before anything is written.

`legendary` and `dive_bar` are set by hand in that file. Nothing in the app
promotes a shop into those sections automatically.

Full field reference: [`data/README.md`](data/README.md).

## Community submissions

Anyone can add a shop at `/add` — no account, a draggable map pin, and every
field except name, location and area optional. Submissions land as
**pending** and are invisible everywhere public: search, category pages and
even their own URL 404 until approved.

A curator reviews them at `/admin`, gated by a shared secret in
`ADMIN_TOKEN` (16+ characters, compared in constant time, stored in an
httpOnly cookie). That page is also the curation tool for the Legendary and
Dive Bar lists.

This is deliberately the smallest thing that works: one secret, no roles, no
audit trail beyond `reviewedAt`. Replace it when accounts land.

## How a few things work

**The "Open now" badge.** Green requires *both* that someone verified the
shop today *and* that the current time is inside its listed hours. Verified
but currently shut shows amber; everything else shows grey "Hours may vary
— unverified today". Green never claims more than we actually know.

The schema keeps `verifiedToday` as specified but adds a `verifiedAt`
timestamp, and the badge reads the timestamp. A bare boolean never resets,
so a shop verified in March would still be claiming "verified today" in
August. When the owner flow ships, it just stamps `verifiedAt`.

**Unknown hours.** Only about 16% of OSM venues carry `opening_hours`, so
hours are nullable and the site says "Hours not listed" rather than
inventing plausible ones. `getOpenStatus` never claims open or closed
without hours, even for a shop verified today.

**Hours.** Parsed in IST no matter where the server runs. Overnight ranges
work (`"17:00-01:30"`), including a session that started yesterday and
crossed midnight into a different weekday bucket — which is exactly how
dive bars trade. `"closed"` marks a non-trading day.

**Insider tips.** Dive bars only, enforced server-side. A tip submitted on
any other category is rejected with a message rather than silently dropped,
so nobody loses what they wrote. Tips render separately from the star
rating, and lead the page on a dive bar — for those places the tip is the
reason to make the trip.

**Moderation.** Deliberately light. Slurs, targeted abuse, links, phone
numbers, promo phrases and keyboard mashing are rejected. Ordinary swearing
is left alone, because blunt language is how people genuinely describe a
dive bar, and over-moderation would drive off exactly the contributors this
site needs. Wordlists live in `data/blocklist.json` — edit them without
touching code.

**Rate limiting** is in-process, keyed on a salted hash of IP + user agent.
It stops accidents and casual flooding, not a determined attacker: on
serverless each instance keeps its own counters. If abuse becomes real, put
a shared store behind `checkRateLimit` in `src/lib/ratelimit.ts` — every
caller goes through it, so the swap is local.

**Upvotes** are deduped by localStorage plus that rate limit. Without
accounts there is no way to make this airtight, and the code says so rather
than pretending otherwise.

## Tests

```bash
npm test        # unit tests
npm run lint
npm run typecheck
```

Covers hours parsing (across four host timezones), badge state including
stale-verification expiry, the moderation filter's false-positive
behaviour on realistic blunt reviews, and rate limiting.

## Deploying

Any Node host. On Vercel, set `DATABASE_URL` and `REVIEW_SALT` in project
settings; `postinstall` runs `prisma generate`, and migrations run with
`npx prisma migrate deploy`.

One caveat worth planning for: OpenStreetMap's public tile server is fine
for MVP testing but its
[usage policy](https://operations.osmfoundation.org/policies/tiles/)
discourages production traffic. `TILE_URL` in `src/lib/constants.ts` is the
single line to change when you move to another free tile host.

## Not built yet

- Login / accounts (`/admin` is one shared token, not real auth)
- Owner claim + WhatsApp update flow (phase 2)
- Editing or removing an approved listing from the UI
- Admin moderation queue — moderation is submit-time only, with no way to
  remove a review after the fact
- Photos
