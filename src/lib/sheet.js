import { parseCsv } from './csv.js'
import { buildCsvUrl, SHEET_ID, TAB_NAME } from '../config/sheet.js'
import { normalizeRows } from './flights.js'

// The actual sheet header row only labels: REG, ARR, DEP, MECH / TECH
// All other used columns are unlabeled and derived by fixed offsets:
//   FLT     = ARR_col - 1          (arrival flight — empty for N/S rows)
//   STA     = ARR_col + 1          (scheduled time of arrival)
//   FLT DEP = DEP_col - 1          (departure flight number)
//   STD     = DEP_col + 1          (scheduled time of departure)
//   BAY     = DEP_col + 4          (parking bay)
// Both flight-number columns sit immediately left of their airport column.
// ARR_col + 2 is ETA and ARR_col + 3 is a blank spacer — do not read those.
// STA uses the labeled "STA" header when present; falls back to ARR_col + 1 if unlabeled.

const MECH_HEADERS = ['MECH / TECH', 'MECH/TECH', 'MECH/ TECH', 'MECH /TECH']

// The offsets above are an assumption about sheet layout, so check that each
// resolved column actually holds the kind of value it should. A wrong offset
// lands either on a blank spacer column (fill drops to ~0) or on a neighbouring
// column of a different shape (e.g. reading T/RD "00:44" as a flight number).
const COLUMN_SHAPE = {
  reg:    { label: 'REG',     pattern: /^[A-Z0-9]{2,4}(-[A-Z0-9]{2,4})?$/i },
  flt:    { label: 'FLT',     pattern: /^\d{1,4}$/ },
  fltDep: { label: 'FLT DEP', pattern: /^\d{1,4}$/ },
  arr:    { label: 'ARR',     pattern: /^([A-Z]{3}|N\/?S|LTS?|L\/T)$/i },
  dep:    { label: 'DEP',     pattern: /^([A-Z]{3}|N\/?S|LTS?|L\/T)$/i },
  sta:    { label: 'STA',     pattern: /^\d{1,2}[:.]\d{2}$/ },
  std:    { label: 'STD',     pattern: /^\d{1,2}[:.]\d{2}$/ },
  bay:    { label: 'BAY',     pattern: /^\d{1,3}$/ },
}

// Thresholds are deliberately loose. Measured against the live sheet, the
// least-filled column is FLT at ~61% and every column matches its shape 100%,
// so these leave wide margin for a light schedule while still catching a
// column that has gone empty or is being read from the wrong position.
const MIN_FILL = 0.2
const MIN_SHAPE = 0.7
const MIN_SAMPLE = 20

// Returns human-readable warnings; never throws. A single bad offset should
// degrade one field, not blank the whole schedule.
function validateColumns(flights) {
  if (flights.length < MIN_SAMPLE) return []

  const warnings = []
  for (const [key, { label, pattern }] of Object.entries(COLUMN_SHAPE)) {
    const values = flights.map(f => f[key]).filter(Boolean)

    if (values.length / flights.length < MIN_FILL) {
      warnings.push(`${label} is empty on ${Math.round((1 - values.length / flights.length) * 100)}% of rows — the column may have moved`)
      continue
    }

    const matched = values.filter(v => pattern.test(v))
    if (matched.length / values.length < MIN_SHAPE) {
      const sample = values.find(v => !pattern.test(v))
      warnings.push(`${label} contains unexpected values (e.g. "${sample}") — the column may have moved`)
    }
  }
  return warnings
}

function normHeader(s) {
  return String(s).toUpperCase().replace(/\s+/g, ' ').trim()
}

// Some header cells have unrelated title/watermark text merged into them
// (e.g. "ab STORE REG", "CEO <= 16 NEO <= 15 MECH / TECH"), so fall back to a
// substring match when no cell equals the label outright.
function findCol(normalized, labels) {
  for (const label of labels) {
    const exact = normalized.indexOf(label)
    if (exact !== -1) return exact
  }
  for (const label of labels) {
    const partial = normalized.findIndex(h => h.includes(label))
    if (partial !== -1) return partial
  }
  return undefined
}

function detectHeaderBlocks(rows) {
  const blocks = []
  rows.forEach((row, rowIdx) => {
    const normalized = row.map(normHeader)

    // ARR and DEP are always cleanly labeled; requiring an exact match on both
    // keeps data rows from being mistaken for headers now that REG is fuzzy.
    const arrCol = normalized.indexOf('ARR')
    const depCol = normalized.indexOf('DEP')
    const regCol = findCol(normalized, ['REG'])
    if (arrCol === -1 || depCol === -1 || regCol === undefined) return

    const colMap = { REG: regCol, ARR: arrCol, DEP: depCol }

    const mechCol = findCol(normalized, MECH_HEADERS)
    if (mechCol !== undefined) colMap['MECH/TECH'] = mechCol

    const staCol = normalized.indexOf('STA')
    colMap['STA'] = staCol !== -1 ? staCol : arrCol + 1  // fallback: offset if unlabeled

    // Derive the remaining unlabeled columns from the ARR / DEP anchors
    colMap['FLT'] = arrCol - 1       // arrival flight number
    colMap['FLT DEP'] = depCol - 1   // departure flight number
    colMap['STD'] = depCol + 1       // scheduled time of departure
    colMap['BAY'] = depCol + 4       // parking bay

    blocks.push({ rowIdx, colMap })
  })
  return blocks
}

export async function fetchFlights() {
  const url = buildCsvUrl(SHEET_ID, TAB_NAME)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`)
  const text = await res.text()
  const rows = parseCsv(text)
  return parseFlights(rows)
}

export function parseFlights(rows) {
  const blocks = detectHeaderBlocks(rows)
  if (blocks.length === 0) {
    throw new Error('No valid header row found — expected columns: REG, ARR, DEP')
  }

  const flights = []
  blocks.forEach(({ rowIdx, colMap }, blockIdx) => {
    const nextHeader = blocks[blockIdx + 1]?.rowIdx ?? rows.length
    const dataRows = rows.slice(rowIdx + 1, nextHeader)

    dataRows.forEach((row, relIdx) => {
      const get = key => (colMap[key] !== undefined ? (row[colMap[key]] ?? '').trim() : '')

      const reg = get('REG')
      if (!reg) return

      flights.push({
        id: `${blockIdx}-${relIdx}-${reg}`,
        reg,
        flt:      get('FLT'),
        arr:      get('ARR'),
        sta:      get('STA'),
        fltDep:   get('FLT DEP'),
        dep:      get('DEP'),
        std:      get('STD'),
        bay:      get('BAY'),
        mechTech: get('MECH/TECH'),
      })
    })
  })

  const normalized = normalizeRows(flights)
  return { flights: normalized, warnings: validateColumns(normalized) }
}
