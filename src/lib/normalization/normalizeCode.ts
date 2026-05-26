export function normalizeCode(value?: string): string {
  return value?.trim().toUpperCase() ?? "";
}

export function normalizeKey(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

export function isValidCountryCode(value?: string): boolean {
  return /^[A-Z]{2}$/.test(normalizeCode(value));
}

export function isValidCurrencyCode(value?: string): boolean {
  return /^[A-Z]{3}$/.test(normalizeCode(value));
}
