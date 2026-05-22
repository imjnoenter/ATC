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

Managed by a single `useReducer` in `src/hooks/useAppReducer.js`. The reducer holds `screen`, `nickname`, `selectedFlight`, and `progress` (per-flight status map). Tapping a card sets `screen: 'formGuide'` directly — there is no checklist step.

`useFlights` (`src/hooks/useFlights.js`) fetches and caches flight data in `sessionStorage` (5-min TTL). It is independent of the reducer.

### Data pipeline

```
Google Sheet CSV
  → csv.js (RFC 4180 parser)
  → sheet.js (header detection + column mapping)
  → flights.js (long-transit flag detection, nickname filter, report type)
  → TransitCard / FormGuideScreen
```

**Critical: the sheet header row only explicitly labels `REG`, `ARR`, `DEP`, `MECH / TECH`.** The columns `FLT`, `STA`, `FLT DEP`, `STD`, `BAY` are unlabeled and derived by fixed offsets from the labeled anchors (see comments in `src/lib/sheet.js`). Do not assume column positions — always derive from anchor columns.

**Long-transit flag logic (counterintuitive):**
- LT/LTS/L/T in **ARRIVAL** columns (FLT, ARR, STA) → `longTransitPredep = true` → report type `PREDEP`
- LT/LTS/L/T in **DEPARTURE** columns (FLT DEP, DEP, STD) → `longTransitArrival = true` → report type `ARRIVAL`

### Google Form pre-fill

`src/lib/formUrl.js` builds the pre-fill URL. `src/config/form.js` holds all entry IDs and option strings.

**Critical gotcha:** `URLSearchParams` encodes `/` as `%2F`, which breaks Google Forms dropdown/radio matching. The URL builder always applies `.replace(/%2F/gi, '/')` at the end.

**Entry ID discovery:** Google Forms embeds field data in hidden sentinel inputs (`name="entry.XXXXXXXXXX_sentinel"`). The DOM order of sentinels does **not** match visual field order on the page. Entry IDs were confirmed by having a user manually fill all fields and reading `el.value` from each `input[name*="entry."]:not([name*="_sentinel"])`. Do not remap entry IDs based on DOM order alone.

**Page 5 field mapping:** checkbox grid rows (Door Scratch, Cargo Scratch, Left/Right Side) are pre-filled in the form's internal state via URL params but do **not** show visual checkmarks — this is a Google Forms limitation. The values are submitted correctly when the form is submitted.

**Flight number extraction:** the form's "Arrival Flight Number" field requires digits only (e.g., `FD3354` → `3354`). `extractFlightNumber()` in `formUrl.js` handles this.

### Styling

Tailwind with a custom warm-neutral palette (`cream`, `beige`, `warm-gray*`, `accent`, `blue-soft`, `danger`). Dark mode uses Tailwind's `class` strategy toggled by `useTheme` (`src/hooks/useTheme.js`), which persists to `localStorage` and reads `prefers-color-scheme` on first visit.

Component-level classes (`.card`, `.btn-primary`, `.btn-secondary`, `.input-base`) are defined in `src/index.css` using `@layer components` and include `dark:` variants.

### Key config values (do not change without re-verifying against the live form/sheet)

- **Sheet ID:** `1N21gf1NVkwVxBVtUs_PpDLu1P12oV8Jt4V_NVNSF6CY`, tab `DAY`
- **Form ID:** `1FAIpQLSdxxFmc_XosF8fY82NdkIQeFxuZzG4VvfpoGCQGIorSPEJ-Ow`
- **Report type option strings** in `OPTIONS.reportType` must match the form's radio labels character-for-character (including the space before the underscore in `LONG _TRANSIT - ARRIVAL`)
