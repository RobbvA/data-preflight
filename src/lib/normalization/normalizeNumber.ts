export function normalizeNumber(value?: string): string {
  if (!value) return "";

  const cleaned = value
    .trim()
    .replace(/[€$£]/g, "")
    .replace(/\s/g, "");

  // European format: 1.234,56
  if (/^[-+]?\d{1,3}(?:\.\d{3})+,\d+$/.test(cleaned)) {
    return cleaned.replaceAll(".", "").replace(",", ".");
  }

  // US format: 1,234.56
  if (/^[-+]?\d{1,3}(?:,\d{3})+\.\d+$/.test(cleaned)) {
    return cleaned.replaceAll(",", "");
  }

  // An unrecognized mix of separators must remain invalid.
  if (cleaned.includes(".") && cleaned.includes(",")) {
    return cleaned;
  }

  return cleaned
    .replace(/\.(?=\d{3}(,|$))/g, "")
    .replace(",", ".");
}

export function parseNormalizedNumber(value?: string): number | null {
  if (!value) return null;

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}