export function sanitizeCsvCell(value: string) {
  const trimmedStart = value.trimStart();
  if (/^[=+\-@\t\r]/.test(trimmedStart)) {
    return `'${value}`;
  }
  return value;
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = sanitizeCsvCell(String(value ?? ""));
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

export function generateCsv<T extends Record<string, string | number | boolean | null | undefined>>(rows: T[]) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(","));
  return [headers.join(","), ...body].join("\n");
}
