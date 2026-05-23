import { parseCsv } from './csv.js'
import { buildCsvUrl, SHEET_ID, TAB_NAME } from '../config/sheet.js'
import { normalizeRows } from './flights.js'

// The actual sheet header row only labels: REG, ARR, DEP, MECH / TECH
// FLT, FLT DEP, STD, BAY are unlabeled columns at fixed offsets:
//   FLT     = REG_col + 1          (arrival flight — empty for N/S rows)
//   FLT DEP = ARR_col + 3 = DEP-1  (departure flight number)
//   STD     = DEP_col + 1          (scheduled departure time)
//   BAY     = DEP_col + 3          (parking bay)
// STA uses the labeled "STA" header when present; falls back to ARR_col + 2 if unlabeled.

const REQUIRED_HEADERS = ['REG', 'ARR', 'DEP']

function normHeader(s) {
  return String(s).toUpperCase().replace(/\s+/g, ' ').trim()
}

function detectHeaderBlocks(rows) {
  const blocks = []
  rows.forEach((row, rowIdx) => {
    const normalized = row.map(normHeader)
    const hasAll = REQUIRED_HEADERS.every(h => normalized.includes(h))
    if (!hasAll) return

    const colMap = {}

    // Map explicitly labeled columns
    normalized.forEach((h, colIdx) => {
      if (h) colMap[h] = colIdx
    })

    // Normalize MECH/TECH spacing variants
    const mechVariants = ['MECH / TECH', 'MECH/TECH', 'MECH/ TECH', 'MECH /TECH']
    for (const v of mechVariants) {
      if (colMap[v] !== undefined) {
        colMap['MECH/TECH'] = colMap[v]
        colMap['MECH / TECH'] = colMap[v]
        break
      }
    }

    // Derive unlabeled column positions from anchor columns
    const regCol = colMap['REG']
    const arrCol = colMap['ARR']
    const depCol = colMap['DEP']

    if (regCol !== undefined) {
      colMap['FLT'] = regCol + 1       // arrival flight number
    }
    if (arrCol !== undefined) {
      if (colMap['STA'] === undefined) colMap['STA'] = arrCol + 2  // fallback: offset if unlabeled
      colMap['FLT DEP'] = arrCol + 3   // departure flight number
    }
    if (depCol !== undefined) {
      colMap['STD'] = depCol + 1       // scheduled time of departure
      colMap['BAY'] = depCol + 3       // parking bay
    }

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
        mechTech: get('MECH/TECH') || get('MECH / TECH'),
      })
    })
  })

  return normalizeRows(flights)
}
