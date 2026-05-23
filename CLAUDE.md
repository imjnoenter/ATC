# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server at http://localhost:5173
npm run build    # Production build (use to verify no compile errors)
npm run preview  # Serve the production build locally
```

No test runner is configured. Use `npm run build` as the correctness check — it will catch import errors, missing files, and type-level issues.

## Architecture

Pure client-side React 18 + Vite + Tailwind CSS app. No backend. Two external data sources, both accessed directly from the browser:

- **Google Sheet** (read-only, public): fetched as CSV via the gviz endpoint — `src/config/sheet.js` has the sheet ID and URL builder.
- **Google Form** (write-only, user-facing): pre-fill URL is constructed client-side and opened in a new tab — never submitted programmatically.

### Screen flow

```
Home → FormGuide → Done
```

Managed by a single `useReducer` in `src/hooks/useAppReducer.js`. Reducer state: `screen`, `nickname`, `selectedName`, `selectedFlight`, `progress` (per-flight status map). `nickname`, `selectedName`, and `progress` are persisted to `localStorage` under the key `atc-app-state` and restored on load.

**Reducer actions:**
- `SET_NICKNAME` — updates raw input, clears `selectedName`
- `SET_SELECTED_NAME` — sets both `selectedName` and `nickname` to the chosen name
- `CLEAR_NAME` — resets both to empty/null
- `SELECT_FLIGHT` — navigates to `formGuide`, marks flight `inProgress`
- `TOGGLE_DONE` — toggles a flight's progress between `done` and unset
- `COMPLETE` — navigates to `done`, marks flight `done`
- `BACK_HOME` — returns to `home`

`useFlights` (`src/hooks/useFlights.js`) fetches and caches flight data in `sessionStorage` (5-min TTL). It is independent of the reducer.

### Name search

Typing into the nickname input shows suggestion chips (substring match via `getSuggestedNames`). Selecting a chip sets `selectedName` and switches to **exact-match** filtering via `filterByExactName` — the `mechTech` field is split on `+` and each part is compared literally. Flights only display after a name chip is selected, not during freeform typing.

The `mechTech` field can contain a single person (`A`, `Joe C`, `Xxx(T)`) or multiple people joined by ` + ` (`Name1 + Name2`). All name utilities in `src/lib/flights.js` split on `+` before comparing.

### Data pipeline

```
Google Sheet CSV
  → csv.js (RFC 4180 parser)
  → sheet.js (header detection + column mapping)
  → flights.js (flag detection, name utilities, report type)
  → TransitCard / FormGuideScreen
```

**Critical: the sheet header row only explicitly labels `REG`, `ARR`, `DEP`, `MECH / TECH`.** All other used columns are unlabeled and derived by fixed offsets (verified against live sheet): `FLT = REG+1`, `STA = ARR+1`, `FLT DEP = ARR+3`, `STD = DEP+1`, `BAY = DEP+4`. See comments in `src/lib/sheet.js`. `STA` uses the labeled header when present; falls back to `ARR+1` if unlabeled.

### Report type flag logic

Four boolean flags are added to each flight row by `normalizeRows` in `flights.js`. LT flags take precedence over N/S flags when both appear in the same row.

| Flag | Pattern | Columns checked | → Report type |
|------|---------|-----------------|---------------|
| `longTransitPredep` | `LT`, `LTS`, `L/T` | FLT, ARR, STA (arrival) | `PREDEP` |
| `nightstopPredep` | `N/S`, `NS` | FLT, ARR, STA (arrival) | `FIRST_FLIGHT` |
| `longTransitArrival` | `LT`, `LTS`, `L/T` | FLT DEP, DEP, STD (departure) | `ARRIVAL` |
| `nightstopArrival` | `N/S`, `NS` | FLT DEP, DEP, STD (departure) | `NIGHTSTOP` |
| *(none)* | | | `TRANSIT` |

**Form pre-fill grouping:** `FIRST_FLIGHT` uses identical form fields as `PREDEP` (departure flight/airport, predep option string). `NIGHTSTOP` uses identical form fields as `ARRIVAL` (arrival flight/airport, arrival option string). This is reflected in `formUrl.js` via the `isPredepLike` / `isArrivalLike` booleans.

### Google Form pre-fill

`src/lib/formUrl.js` builds the pre-fill URL. `src/config/form.js` holds all entry IDs and option strings.

**Critical gotcha:** `URLSearchParams` encodes `/` as `%2F`, which breaks Google Forms dropdown/radio matching. The URL builder always applies `.replace(/%2F/gi, '/')` at the end.

**Entry ID discovery:** Google Forms embeds field data in hidden sentinel inputs (`name="entry.XXXXXXXXXX_sentinel"`). The DOM order of sentinels does **not** match visual field order on the page. Entry IDs were confirmed by having a user manually fill all fields and reading `el.value` from each `input[name*="entry."]:not([name*="_sentinel"])`. Do not remap entry IDs based on DOM order alone.

**Page 1 email field:** has no entry ID — Google collects it automatically from the signed-in Google account. It cannot be pre-filled via URL parameters.

**Page 5 field mapping:** checkbox grid rows (Door Scratch, Cargo Scratch, Left/Right Side) are pre-filled in the form's internal state via URL params but do **not** show visual checkmarks — this is a Google Forms limitation. The values are submitted correctly when the form is submitted.

**Flight number extraction:** the form's "Arrival Flight Number" field requires digits only (e.g., `FD3354` → `3354`). `extractFlightNumber()` in `formUrl.js` handles this.

### Styling

Tailwind with a custom warm-neutral palette (`cream`, `beige`, `warm-gray*`, `accent`, `blue-soft`, `danger`). Dark mode uses Tailwind's `class` strategy toggled by `useTheme` (`src/hooks/useTheme.js`), which persists to `localStorage` and reads `prefers-color-scheme` on first visit.

Component-level classes (`.card`, `.btn-primary`, `.btn-secondary`, `.input-base`) are defined in `src/index.css` using `@layer components` and include `dark:` variants.

### Key config values (do not change without re-verifying against the live form/sheet)

- **Sheet ID:** `1N21gf1NVkwVxBVtUs_PpDLu1P12oV8Jt4V_NVNSF6CY`, tab `DAY`
- **Form ID:** `1FAIpQLSdxxFmc_XosF8fY82NdkIQeFxuZzG4VvfpoGCQGIorSPEJ-Ow`
- **Report type option strings** in `OPTIONS.reportType` must match the form's radio labels character-for-character (including the space before the underscore in `LONG _TRANSIT - ARRIVAL`)
