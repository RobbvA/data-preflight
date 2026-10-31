import type { ParsedRow } from "@/lib/parseCsv";
import type { ExactParsedDataSet } from "@/lib/exactDataInput";
import { getMappingStatus } from "@/lib/mappingStatus";
import { normalizeInvoiceRows, type NormalizedInvoiceRow } from "@/lib/normalizeInvoice";
import { invoiceValidationProfile } from "@/lib/profiles/invoiceValidationProfile";
import type { InvoiceFieldMapping } from "@/lib/profiles/invoiceProfile";
import { decodeDecimalCell, type DecimalNotation, type DecimalSourceCell } from "@/lib/strictDecimal";
import { validateRows, type ValidationResult } from "@/lib/validateRows";
import { mapRowsToProfile } from "@/lib/validation/validationProfile";

export type InvoiceRun = {
  available: boolean;
  reason?: "mapping-required" | "notation-required" | "source-context";
  normalizedRows: NormalizedInvoiceRow[];
  validationResult: ValidationResult;
};

function unavailable(reason: InvoiceRun["reason"]): InvoiceRun {
  return { available: false, reason, normalizedRows: [], validationResult: { issues: [], cleanRows: [], errorRows: [] } };
}

export function runInvoiceValidation(rows: readonly ParsedRow[], context: {
  notation: DecimalNotation | null;
  amountCells: readonly DecimalSourceCell[];
  vatCells: readonly DecimalSourceCell[];
}): InvoiceRun {
  if (context.notation !== "point" && context.notation !== "comma") return unavailable("notation-required");
  if (!context.amountCells || !context.vatCells || context.amountCells.length !== rows.length || context.vatCells.length !== rows.length || rows.some((_, i) => !context.amountCells[i] || !context.vatCells[i])) return unavailable("source-context");
  const numbers = rows.map((_, index) => ({
    amount: decodeDecimalCell(context.amountCells[index], context.notation),
    vat: decodeDecimalCell(context.vatCells[index], context.notation),
  }));
  const normalizedRows = normalizeInvoiceRows([...rows]).map((row, index) => {
    const { amount, vat } = numbers[index];
    return { ...row, amount: amount.ok ? amount.value : row.amount, vat: vat.ok ? vat.value : row.vat };
  });
  return { available: true, normalizedRows, validationResult: validateRows(normalizedRows, numbers) };
}

export function runInvoiceSourceValidation(source: ExactParsedDataSet, mapping: InvoiceFieldMapping, notation: DecimalNotation | null): InvoiceRun {
  if (!getMappingStatus(invoiceValidationProfile, mapping).mappingReady || invoiceValidationProfile.fields.some(({ key }) => mapping[key] && !source.headers.includes(mapping[key]))) return unavailable("mapping-required");
  if (!source.sourceCells || source.sourceCells.length !== source.rows.length || source.sourceCells.some((row) => !row[mapping.amount] || !row[mapping.vat])) return unavailable("source-context");
  // Keep formatted dates/identifiers as before; only financial cells use stored values.
  const rows = mapRowsToProfile(source.formattedRows ?? source.rows, mapping, invoiceValidationProfile);
  return runInvoiceValidation(rows, {
    notation,
    amountCells: source.sourceCells.map((row) => row[mapping.amount]),
    vatCells: source.sourceCells.map((row) => row[mapping.vat]),
  });
}
