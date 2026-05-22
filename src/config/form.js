// Google Form: Additional Transit Checklist V6
// https://docs.google.com/forms/d/e/1FAIpQLSdxxFmc_XosF8fY82NdkIQeFxuZzG4VvfpoGCQGIorSPEJ-Ow/viewform

export const FORM_BASE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdxxFmc_XosF8fY82NdkIQeFxuZzG4VvfpoGCQGIorSPEJ-Ow/viewform'

// Real entry IDs extracted from the live form (7 pages total)
// Page 1: Email consent checkbox — no entry ID, Google records automatically
// Page 3: RE-FUEL photo upload — file field, no pre-fillable entry ID
// Pages 6–7: Review / Submit — no entry IDs
export const ENTRY = {
  // Page 2
  reportType:           'entry.1775466483',
  refuel:               'entry.127827365',

  // Page 4: Flight Information
  arrivalFlightNumber:  'entry.284945702',   // numbers only (strip airline prefix)
  arrivalAirport:       'entry.1962817498',  // IATA code only
  fleet:                'entry.876246303',

  // Page 5: Aircraft Inspection
  // Mapping confirmed by user manually filling all fields and reading hidden input values
  acRegister:           'entry.934696329',   // user entered HS-ABX here
  atcDefect:            'entry.2028735217',  // "NO" group
  doorScratch:          'entry.1483513228',  // "NO" group
  cargoScratch:         'entry.2097497901',  // "NO" group
  otherScratch:         'entry.1173273695',  // user typed "NOT DIRTY" here = text field
  leftSideUpper:        'entry.881164414',   // "NOT DIRTY" group
  leftSideLower:        'entry.1150451627',  // "NOT DIRTY" group
  rightSideUpper:       'entry.1274238037',  // "NOT DIRTY" group
  rightSideLower:       'entry.2026641667',  // confirmed last field, Right Side Lower
}

export const OPTIONS = {
  reportType: {
    transit: 'TRANSIT',
    predep:  'FIRST FLIGHT/PRE-DEP / LONG_TRANSIT - PRE-DEP',
    arrival: 'NIGHTSTOP/STAY OVER / LONG _TRANSIT - ARRIVAL',
  },
  refuel: {
    yes: 'YES',
    no:  'NO',
  },
  fleet:        'A320/A321',
  atcDefect:    'NO',
  doorScratch:  'NO',
  cargoScratch: 'NO',
  otherScratch: 'NOT DIRTY',
  sideClean:    'NOT DIRTY',
}
