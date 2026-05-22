export const SHEET_ID = '1N21gf1NVkwVxBVtUs_PpDLu1P12oV8Jt4V_NVNSF6CY'
export const TAB_NAME = 'DAY'

export function buildCsvUrl(sheetId, tabName) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`
}
