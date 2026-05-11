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
  const trimmedValue = value.trim();

  if (!trimmedValue) return "";

  switch (field) {
    case "invoice_number":
      return trimmedValue;

    case "company":
      return normalizeWhitespace(trimmedValue);

    case "email":
      return trimmedValue.toLowerCase();

    case "amount":
    case "vat":
      return normalizeBusinessNumber(trimmedValue);

    case "status":
      return trimmedValue.toLowerCase();

    case "country":
      return trimmedValue.toUpperCase();

    case "currency":
      return trimmedValue.toUpperCase();

    case "invoice_date":
    case "due_date":
      return trimmedValue;

    default:
      return trimmedValue;
  }
}

function normalizeWhitespace(value: string) {
  return value.replaceAll(/\s+/g, " ").trim();
}

function normalizeBusinessNumber(value: string) {
  const withoutCurrency = value
    .replaceAll("€", "")
    .replaceAll("EUR", "")
    .replaceAll("eur", "")
    .replaceAll(" ", "")
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