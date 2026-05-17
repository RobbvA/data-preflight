import type { CsvRow } from "@/lib/parseCsv";

const invoiceFields = [
  "invoice_number",
  "company",
  "email",
  "amount",
  "vat",
  "status",
  "country",
  "invoice_date",
  "due_date",
  "currency",
] as const;

type InvoiceField = (typeof invoiceFields)[number];

const statusAliases: Record<string, string> = {
  ready: "ready",
  open: "ready",
  new: "draft",
  concept: "draft",
  draft: "draft",
  pending: "pending",
  sent: "sent",
  paid: "paid",
  payed: "paid",
  voldaan: "paid",
  betaald: "paid",
  verzonden: "sent",
  openstaand: "pending",
};

const countryAliases: Record<string, string> = {
  nederland: "NL",
  netherlands: "NL",
  holland: "NL",
  duitsland: "DE",
  germany: "DE",
  belgie: "BE",
  belgium: "BE",
  france: "FR",
  frankrijk: "FR",
};

const currencyAliases: Record<string, string> = {
  "€": "EUR",
  euro: "EUR",
  euros: "EUR",
  eur: "EUR",
  $: "USD",
  dollar: "USD",
  dollars: "USD",
  usd: "USD",
  "£": "GBP",
  pound: "GBP",
  pounds: "GBP",
  gbp: "GBP",
};

export function normalizeInvoiceRows(rows: CsvRow[]): CsvRow[] {
  return rows.map((row) => normalizeInvoiceRow(row));
}

export function normalizeInvoiceRow(row: CsvRow): CsvRow {
  const normalizedRow: CsvRow = {};

  invoiceFields.forEach((field) => {
    normalizedRow[field] = normalizeInvoiceValue(field, row[field] ?? "");
  });

  return normalizedRow;
}

function normalizeInvoiceValue(field: InvoiceField, value: string) {
  const trimmedValue = normalizeWhitespace(value);

  if (!trimmedValue) return "";

  switch (field) {
    case "invoice_number":
      return trimmedValue;

    case "company":
      return trimmedValue;

    case "email":
      return trimmedValue.toLowerCase();

    case "amount":
    case "vat":
      return normalizeBusinessNumber(trimmedValue);

    case "status":
      return normalizeStatus(trimmedValue);

    case "country":
      return normalizeCountry(trimmedValue);

    case "currency":
      return normalizeCurrency(trimmedValue);

    case "invoice_date":
    case "due_date":
      return normalizeDate(trimmedValue);

    default:
      return trimmedValue;
  }
}

function normalizeWhitespace(value: string) {
  return value.replaceAll(/\s+/g, " ").trim();
}

function normalizeStatus(value: string) {
  const normalizedValue = value.toLowerCase().trim();

  return statusAliases[normalizedValue] ?? normalizedValue;
}

function normalizeCountry(value: string) {
  const normalizedValue = value.toLowerCase().trim();

  return countryAliases[normalizedValue] ?? value.toUpperCase();
}

function normalizeCurrency(value: string) {
  const normalizedValue = value.toLowerCase().trim();

  return currencyAliases[normalizedValue] ?? value.toUpperCase();
}

function normalizeDate(value: string) {
  const normalizedValue = value.trim();

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return normalizedValue;

  const europeanMatch = normalizedValue.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/,
  );

  if (europeanMatch) {
    const [, day, month, year] = europeanMatch;

    return `${year}-${day.padStart(2, "0")}-${month.padStart(2, "0")}`;
  }

  return normalizedValue;
}

function normalizeBusinessNumber(value: string) {
  const withoutCurrency = value
    .replaceAll("€", "")
    .replaceAll("EUR", "")
    .replaceAll("eur", "")
    .replaceAll("$", "")
    .replaceAll("USD", "")
    .replaceAll("usd", "")
    .replaceAll("£", "")
    .replaceAll("GBP", "")
    .replaceAll("gbp", "")
    .replaceAll(/\s/g, "")
    .trim();

  if (!withoutCurrency) return "";

  const hasComma = withoutCurrency.includes(",");
  const hasDot = withoutCurrency.includes(".");

  if (hasComma && hasDot) {
    const lastCommaIndex = withoutCurrency.lastIndexOf(",");
    const lastDotIndex = withoutCurrency.lastIndexOf(".");

    if (lastCommaIndex > lastDotIndex) {
      return withoutCurrency.replaceAll(".", "").replaceAll(",", ".");
    }

    return withoutCurrency.replaceAll(",", "");
  }

  if (hasComma) {
    return withoutCurrency.replaceAll(",", ".");
  }

  return withoutCurrency;
}
