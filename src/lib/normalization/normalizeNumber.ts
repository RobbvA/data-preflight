export function normalizeNumber(value?: string): string {
  if (!value) return "";

  return value
    .trim()
    .replace(/[€$£]/g, "")
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(,|$))/g, "")
    .replace(",", ".");
}

export function parseNormalizedNumber(value?: string): number | null {
  const normalizedValue = normalizeNumber(value);

  if (!normalizedValue) return null;

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}
