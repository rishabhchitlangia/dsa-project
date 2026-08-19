# Data files

## `shops.json` (yours) / `shops.sample.json` (placeholder)

The seed script reads `data/shops.json` if it exists, otherwise falls back to
`data/shops.sample.json`. Drop your curated list in as `shops.json` and re-run
`npm run seed` — nothing else needs to change.

> **`shops.sample.json` is fictional.** Names, addresses and phone numbers are
> invented placeholders for development only. Coordinates sit inside the right
> neighbourhoods so the map looks realistic, but no listing corresponds to a
> real business. Replace the whole file before showing this to anyone.

### Format

An array of objects:

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Shop name |
| `address` | yes | Street address, no need to repeat the area |
| `area` | yes | Must match a `name` or alias in `mumbai-areas.json` |
| `pincode` | yes | 6 digits |
| `latitude` / `longitude` | yes | Must fall inside the Mumbai bounding box |
| `phone` | no | Any format; shown as a tap-to-call link |
| `hoursWeekday` | yes | `"HH:MM-HH:MM"`, or `"closed"`. Overnight ranges like `"17:00-01:30"` are fine |
| `hoursWeekend` | yes | Same format |
| `category` | no | `standard` (default), `legendary`, or `dive_bar` |
| `verifiedToday` | no | Defaults `false`. `true` stamps `verifiedAt` to seed time |
| `slug` | no | Derived from name + area when omitted |

Curation for `legendary` and `dive_bar` is manual — set the category here by
hand. Nothing in the app promotes a shop into those sections automatically.

## `mumbai-areas.json`

65 Mumbai neighbourhoods with pincodes, aliases and centroid coordinates.
This is what powers neighbourhood/pincode search — there is no external
geocoding service and no API key anywhere in this project.

To add an area: append `{ name, pincodes[], aliases[], lat, lng }`.
