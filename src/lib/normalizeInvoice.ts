import type { ParsedRow } from "@/lib/parseCsv";
import {
  invoiceFieldKeys,
  type InvoiceField,
} from "@/lib/profiles/invoiceProfile";

export type NormalizedInvoiceRow = ParsedRow & {
  invoice_number: string;
  company: string;
  email: string;
  amount: string;
  vat: string;
  status: string;
  country: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  normalized_invoice_key: string;
};

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

export function normalizeInvoiceRows(
  rows: ParsedRow[],
): NormalizedInvoiceRow[] {
  return rows.map((row) => normalizeInvoiceRow(row));
}

export function normalizeInvoiceRow(row: ParsedRow): NormalizedInvoiceRow {
  const normalizedRow = {} as NormalizedInvoiceRow;

  invoiceFieldKeys.forEach((field) => {
    normalizedRow[field] = normalizeInvoiceValue(field, row[field] ?? "");
  });

  normalizedRow.normalized_invoice_key = normalizeTextKey(
    normalizedRow.invoice_number,
  );

  return normalizedRow;
}

function normalizeInvoiceValue(field: InvoiceField, value: string) {
  const trimmedValue = normalizeWhitespace(value);

  if (!trimmedValue) return "";

  switch (field) {
    case "invoice_number":
      return normalizeInvoiceNumber(trimmedValue);

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
      return normalizeInvoiceDate(trimmedValue);

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

function normalizeTextKey(value: string) {
  return normalizeWhitespace(value)
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeInvoiceNumber(value: string) {
  return normalizeWhitespace(value);
}

function normalizeCompany(value: string) {
  return normalizeWhitespace(value);
}

function normalizeEmail(value: string) {
  return normalizeWhitespace(value).toLowerCase();
}

function normalizeStatus(value: string) {
  const normalizedValue = normalizeTextKey(value);

  return statusAliases[normalizedValue] ?? normalizedValue;
}

function normalizeCountry(value: string) {
  const normalizedValue = normalizeTextKey(value).replaceAll(/\s/g, "");

  return countryAliases[normalizedValue] ?? normalizedValue.toUpperCase();
}

function normalizeCurrency(value: string) {
  const normalizedValue = normalizeTextKey(value).replaceAll(/\s/g, "");

  return currencyAliases[normalizedValue] ?? normalizedValue.toUpperCase();
}

function normalizeInvoiceDate(value: string) {
  const normalizedValue = normalizeWhitespace(value);

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

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
    .replaceAll(/\u00a0/g, "")
    .replaceAll(/\s/g, "")
    .replaceAll(/eur/gi, "")
    .replaceAll(/usd/gi, "")
    .replaceAll(/gbp/gi, "")
    .replaceAll("€", "")
    .replaceAll("$", "")
    .replaceAll("£", "")
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
