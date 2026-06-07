import type { ParsedRow } from "@/lib/parseCsv";
import { normalizeCode, normalizeKey } from "@/lib/normalization/normalizeCode";
import { normalizeDate } from "@/lib/normalization/normalizeDate";
import { normalizeNumber } from "@/lib/normalization/normalizeNumber";

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

export function normalizeInvoiceRow(row: ParsedRow): NormalizedInvoiceRow {
  const invoiceNumber = getCellValue(row, "invoice_number");

  return {
    ...row,
    invoice_number: invoiceNumber,
    company: getCellValue(row, "company"),
    email: getCellValue(row, "email"),
    amount: normalizeNumber(getCellValue(row, "amount")),
    vat: normalizeNumber(getCellValue(row, "vat")),
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
