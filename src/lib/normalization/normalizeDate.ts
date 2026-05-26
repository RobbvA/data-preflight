export function normalizeDate(value?: string): string {
  return value?.trim() ?? "";
}

export function isValidIsoDate(value?: string): boolean {
  const normalizedValue = normalizeDate(value);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) return false;

  const [year, month, day] = normalizedValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = normalizeDate(value).split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}
