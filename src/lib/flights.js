const LT_PATTERN = /\b(LT|LTS|L\/T)\b/i

function hasLtFlag(values) {
  return values.some(v => LT_PATTERN.test(v))
}

export function normalizeRows(flights) {
  return flights.map(f => ({
    ...f,
    // LT in ARRIVAL columns (FLT/ARR/STA) → Pre-Dep report
    // LT in DEPARTURE columns (FLT DEP/DEP/STD) → Arrival report
    longTransitPredep:   hasLtFlag([f.flt, f.arr, f.sta]),
    longTransitArrival:  hasLtFlag([f.fltDep, f.dep, f.std]),
  }))
}

// Split a mechTech string by "+" into individual trimmed names
export function extractNames(mechTech) {
  if (!mechTech) return []
  return mechTech.split('+').map(n => n.trim()).filter(Boolean)
}

// Collect sorted unique individual names across all flights
export function getAllUniqueNames(flights) {
  const names = new Set()
  flights.forEach(f => extractNames(f.mechTech).forEach(n => names.add(n)))
  return [...names].sort((a, b) => a.localeCompare(b))
}

// Names whose text contains the query (case-insensitive substring)
export function getSuggestedNames(flights, query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return getAllUniqueNames(flights).filter(name => name.toLowerCase().includes(q))
}

// Exact match: flight has this person listed (one of the "+" parts)
export function filterByExactName(flights, name) {
  const target = name.trim().toLowerCase()
  return flights.filter(f =>
    extractNames(f.mechTech).some(n => n.toLowerCase() === target)
  )
}

export function filterByNickname(flights, nickname) {
  const q = nickname.trim().toLowerCase()
  if (!q) return []
  return flights.filter(f => f.mechTech.toLowerCase().includes(q))
}

// PREDEP takes precedence if both flags are true
export function computeReportType(flight) {
  if (flight.longTransitPredep) return 'PREDEP'
  if (flight.longTransitArrival) return 'ARRIVAL'
  return 'TRANSIT'
}
