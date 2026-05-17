import type { CsvRow } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";

export type InvoicePreviewItem = {
  rowIndex: number;
  row: CsvRow;
  issues: ValidationIssue[];
};
