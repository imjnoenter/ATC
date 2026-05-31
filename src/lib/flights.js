const LT_PATTERN = /\b(LT|LTS|L\/T)\b/i
const NS_PATTERN = /\b(N\/S|NS)\b/i

function hasLtFlag(values) {
  return values.some(v => LT_PATTERN.test(v))
}

function hasNsFlag(values) {
  return values.some(v => NS_PATTERN.test(v))
}

export function normalizeRows(flights) {
  return flights.map(f => ({
    ...f,
    // LT in ARRIVAL columns (FLT/ARR/STA) → Pre-Dep report
    // LT in DEPARTURE columns (FLT DEP/DEP/STD) → Arrival report
    longTransitPredep:   hasLtFlag([f.flt, f.arr, f.sta]),
    longTransitArrival:  hasLtFlag([f.fltDep, f.dep, f.std]),
    // N/S in ARRIVAL columns → First Flight (same form as Pre-Dep)
    // N/S in DEPARTURE columns → Nightstop (same form as Arrival)
    nightstopPredep:     hasNsFlag([f.flt, f.arr, f.sta]),
    nightstopArrival:    hasNsFlag([f.fltDep, f.dep, f.std]),
    // Blank FLT and ARR in arrival section → First Flight
    blankArrival:        !f.flt?.trim() && !f.arr?.trim(),
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

// LT flags take precedence over N/S flags when both are present
export function computeReportType(flight) {
  if (flight.longTransitPredep)                        return 'PREDEP'
  if (flight.nightstopPredep || flight.blankArrival)   return 'FIRST_FLIGHT'
  if (flight.longTransitArrival)                       return 'ARRIVAL'
  if (flight.nightstopArrival)                         return 'NIGHTSTOP'
  return 'TRANSIT'
}
