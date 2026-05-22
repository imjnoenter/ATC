import { FORM_BASE_URL, ENTRY, OPTIONS } from '../config/form.js'
import { computeReportType } from './flights.js'

function extractFlightNumber(flt) {
  const match = String(flt).match(/\d+/)
  return match ? match[0] : flt.trim()
}

function extractAirportCode(airport) {
  const match = String(airport).trim().match(/^[A-Z]{3}/i)
  return match ? match[0].toUpperCase() : airport.trim()
}

export function buildPrefillUrl(flight) {
  const reportType = computeReportType(flight)
  const params = new URLSearchParams()
  params.set('usp', 'pp_url')

  // Page 2: Report type only — RE-FUEL user handles themselves
  const reportTypeValue =
    reportType === 'PREDEP'    ? OPTIONS.reportType.predep
    : reportType === 'ARRIVAL' ? OPTIONS.reportType.arrival
    : OPTIONS.reportType.transit
  params.set(ENTRY.reportType, reportTypeValue)

  // Page 4: Flight details
  const rawFlight  = reportType === 'PREDEP' ? flight.fltDep : flight.flt
  const rawAirport = reportType === 'PREDEP' ? flight.dep    : flight.arr
  params.set(ENTRY.arrivalFlightNumber, extractFlightNumber(rawFlight))
  params.set(ENTRY.arrivalAirport,      extractAirportCode(rawAirport))
  params.set(ENTRY.fleet, OPTIONS.fleet)

  // Page 5: Aircraft inspection
  const hsReg = /^HS-/i.test(flight.reg) ? flight.reg.toUpperCase() : `HS-${flight.reg.toUpperCase()}`
  params.set(ENTRY.acRegister,     hsReg)
  params.set(ENTRY.atcDefect,      OPTIONS.atcDefect)
  params.set(ENTRY.doorScratch,    OPTIONS.doorScratch)
  params.set(ENTRY.cargoScratch,   OPTIONS.cargoScratch)
  params.set(ENTRY.otherScratch,   OPTIONS.otherScratch)
  params.set(ENTRY.leftSideUpper,  OPTIONS.sideClean)
  params.set(ENTRY.leftSideLower,  OPTIONS.sideClean)
  params.set(ENTRY.rightSideUpper, OPTIONS.sideClean)

  // Google Forms requires literal / in option values — URLSearchParams encodes it as %2F which breaks dropdown matching
  return `${FORM_BASE_URL}?${params.toString().replace(/%2F/gi, '/')}`
}

export { computeReportType }
