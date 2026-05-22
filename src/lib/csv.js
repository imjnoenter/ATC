// Minimal RFC 4180-compliant CSV parser
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        row.push(field.trim())
        field = ''
      } else if (ch === '\n') {
        row.push(field.trim())
        rows.push(row)
        row = []
        field = ''
        i++
        continue
      } else if (ch === '\r') {
        // skip CR
      } else {
        field += ch
      }
    }
    i++
  }

  if (field || row.length > 0) {
    row.push(field.trim())
    rows.push(row)
  }

  return rows
}
