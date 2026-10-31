import type { ParsedRow } from "@/lib/parseCsv";
import { normalizeCode, normalizeKey } from "@/lib/normalization/normalizeCode";
import { normalizeDate } from "@/lib/normalization/normalizeDate";

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

export function normalizeInvoiceRows(
  rows: ParsedRow[],
): NormalizedInvoiceRow[] {
  return rows.map((row) => normalizeInvoiceRow(row));
}

export function normalizeInvoiceRow(row: ParsedRow): NormalizedInvoiceRow {
  const invoiceNumber = getCellValue(row, "invoice_number");

  return {
    ...row,
    invoice_number: normalizeInvoiceNumber(invoiceNumber),
    company: normalizeTextValue(getCellValue(row, "company")),
    email: normalizeEmail(getCellValue(row, "email")),
    // Financial interpretation is performed by the context-required Invoice runner.
    amount: getCellValue(row, "amount"),
    vat: getCellValue(row, "vat"),
    status: normalizeKey(getCellValue(row, "status")),
    country: normalizeCode(getCellValue(row, "country")),
    invoice_date: normalizeDate(getCellValue(row, "invoice_date")),
    due_date: normalizeDate(getCellValue(row, "due_date")),
    currency: normalizeCode(getCellValue(row, "currency")),
    normalized_invoice_key: normalizeKey(invoiceNumber),
  };
}

function getCellValue(row: ParsedRow, field: string) {
  return row[field]?.trim() ?? "";
}

function normalizeInvoiceNumber(value: string) {
  return value.replaceAll(/\s+/g, " ").trim();
}

function normalizeTextValue(value: string) {
  return value.replaceAll(/\s+/g, " ").trim();
}

function normalizeEmail(value: string) {
  return value.replaceAll(/\s+/g, "").trim().toLowerCase();
}
