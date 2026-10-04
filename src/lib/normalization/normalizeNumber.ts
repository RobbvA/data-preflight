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
  if (!value) return null;

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}