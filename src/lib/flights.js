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
