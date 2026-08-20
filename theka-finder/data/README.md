# Data files

## `shops.json`

The live seed file, read by `npm run seed`. It currently holds 135 real
Mumbai venues imported from OpenStreetMap.

Regenerate or extend it with `npm run import:osm -- --merge`, which adds
venues not already present and never overwrites hand-edited rows. A plain
`npm run import:osm` writes `shops.osm.json` instead, so you can diff before
merging.

Two upstream sources, both permitting storage and redistribution with
attribution (the site footer carries both):

- **Overture Maps** (`npm run import:overture -- --merge`) — CDLA-Permissive
  2.0. The bulk of the data; roughly ten times OpenStreetMap's coverage of
  Mumbai retail, with street addresses and phone numbers on most records.
- **OpenStreetMap** (`npm run import:osm -- --merge`) — ODbL. Fewer records
  but occasionally carries `opening_hours`, which Overture does not have
  at all.

Run both; each skips places the other already imported.

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
| `hoursWeekday` | no | `"HH:MM-HH:MM"`, or `"closed"`. Overnight ranges like `"17:00-01:30"` are fine. Omit when genuinely unknown — the site shows "Hours not listed" rather than guessing |
| `hoursWeekend` | no | Same format |
| `category` | no | `standard` (default), `legendary`, or `dive_bar` |
| `verifiedToday` | no | Defaults `false`. `true` stamps `verifiedAt` to seed time |
| `slug` | no | Derived from name + area when omitted |
| `source` | no | `curated` (default), `osm`, `overture`, or `community` |
| `osmId` | no | e.g. `"node/123"`. Lets a re-import update the row in place |
| `overtureId` | no | Overture GERS id, same purpose |

Curation for `legendary` and `dive_bar` is manual — set the category here by
hand. Nothing in the app promotes a shop into those sections automatically.

## `mumbai-areas.json`

65 Mumbai neighbourhoods with pincodes, aliases and centroid coordinates.
This is what powers neighbourhood/pincode search — there is no external
geocoding service and no API key anywhere in this project.

To add an area: append `{ name, pincodes[], aliases[], lat, lng }`.
