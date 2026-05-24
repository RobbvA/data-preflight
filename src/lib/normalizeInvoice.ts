import type { CsvRow } from "@/lib/parseCsv";
import {
  invoiceFieldKeys,
  type InvoiceField,
} from "@/lib/profiles/invoiceProfile";

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
  nl: "NL",
  duitsland: "DE",
  germany: "DE",
  deutschland: "DE",
  de: "DE",
  belgie: "BE",
  belgium: "BE",
  belgië: "BE",
  be: "BE",
  france: "FR",
  frankrijk: "FR",
  fr: "FR",
  spain: "ES",
  spanje: "ES",
  es: "ES",
  italy: "IT",
  italie: "IT",
  italië: "IT",
  it: "IT",
  unitedkingdom: "GB",
  "united kingdom": "GB",
  uk: "GB",
  gb: "GB",
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

  invoiceFieldKeys.forEach((field) => {
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
      return normalizeCompany(trimmedValue);

    case "email":
      return normalizeEmail(trimmedValue);

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
  return value
    .replaceAll(/\u00a0/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function normalizeCompany(value: string) {
  return normalizeWhitespace(value);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeStatus(value: string) {
  const normalizedValue = normalizeWhitespace(value).toLowerCase();

  return statusAliases[normalizedValue] ?? normalizedValue;
}

function normalizeCountry(value: string) {
  const normalizedValue = normalizeWhitespace(value).toLowerCase();

  return countryAliases[normalizedValue] ?? value.toUpperCase();
}

function normalizeCurrency(value: string) {
  const normalizedValue = normalizeWhitespace(value).toLowerCase();

  return currencyAliases[normalizedValue] ?? value.toUpperCase();
}

function normalizeDate(value: string) {
  const normalizedValue = normalizeWhitespace(value);

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return normalizedValue;

  const europeanMatch = normalizedValue.match(
    /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/,
  );

  if (europeanMatch) {
    const [, day, month, year] = europeanMatch;

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const compactEuropeanMatch = normalizedValue.match(/^(\d{2})(\d{2})(\d{4})$/);

  if (compactEuropeanMatch) {
    const [, day, month, year] = compactEuropeanMatch;

    return `${year}-${month}-${day}`;
  }

  const compactIsoMatch = normalizedValue.match(/^(\d{4})(\d{2})(\d{2})$/);

  if (compactIsoMatch) {
    const [, year, month, day] = compactIsoMatch;

    return `${year}-${month}-${day}`;
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
    .replaceAll(/\u00a0/g, "")
    .replaceAll(/\s/g, "")
    .trim();

  if (!withoutCurrency) return "";

  const withoutAccountingParentheses = withoutCurrency.match(/^\((.+)\)$/)
    ? `-${withoutCurrency.replaceAll(/[()]/g, "")}`
    : withoutCurrency;

  const sanitizedValue = withoutAccountingParentheses.replaceAll(
    /[^0-9,.-]/g,
    "",
  );

  if (!sanitizedValue || sanitizedValue === "-") return sanitizedValue;

  const hasComma = sanitizedValue.includes(",");
  const hasDot = sanitizedValue.includes(".");

  if (hasComma && hasDot) {
    const lastCommaIndex = sanitizedValue.lastIndexOf(",");
    const lastDotIndex = sanitizedValue.lastIndexOf(".");

    if (lastCommaIndex > lastDotIndex) {
      return sanitizedValue.replaceAll(".", "").replaceAll(",", ".");
    }

    return sanitizedValue.replaceAll(",", "");
  }

  if (hasComma) {
    return sanitizedValue.replaceAll(",", ".");
  }

  return sanitizedValue;
}
