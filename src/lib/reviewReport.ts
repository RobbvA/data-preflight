import type { ParsedRow } from "@/lib/parseCsv";
import { buildValidationReportRows, type ValidationReportInput } from "@/lib/validationReport";

export type ReportIssue = {
  rowIndex: number;
  field: string;
  severity: "critical" | "warning";
  problem: string;
  why: string;
  fix: string;
  type?: string;
  ruleId?: string;
  category?: string;
  risk?: string;
};
export type ReviewReportInput<TField extends string = string> = ValidationReportInput<TField> & {
  sourceRows: readonly ParsedRow[];
  displayRows?: readonly ParsedRow[];
  normalizedRows: readonly ParsedRow[];
  issues: readonly ReportIssue[];
};
export const ISSUE_REPORT_HEADERS = ["row", "record_id", "field", "source_column", "source_value", "displayed_value", "normalized_value", "severity", "rule", "category", "risk", "problem", "why_it_matters", "suggested_fix", "row_status", "export_decision"];
export type ReviewReport = {
  profile: { id: string; name: string; version: string };
  fileName: string;
  organization: string;
  summary: ParsedRow[];
  context: ParsedRow[];
  issues: ParsedRow[];
  rows: ParsedRow[];
};

const CHECKS: Record<string, string> = {
  invoice: "Required invoice fields, email format, exact amount/VAT interpretation and financial warning thresholds, duplicate invoice references, status, country/currency format and date/payment-term checks.",
  customer: "Required customer ID and name, duplicate customer IDs, optional email format and country-code format.",
  vendor: "Required vendor ID and name, duplicate vendor IDs, optional email format and country-code format.",
  product: "Required product ID, description and base unit; duplicate product IDs; allowed-unit membership only when an active unit reference is recorded.",
  "price-list": "Required product/list/currency/unit/price, currency-code format, exact price interpretation, negative-price blockers, zero-price warnings and duplicate product/list/currency/unit combinations.",
  "stock-balances": "Required product/warehouse/unit/quantity, exact quantity interpretation, negative-balance blockers, duplicate product/warehouse keys and unit conflicts. Zero is valid.",
};

function identity(row: ParsedRow): string {
  const fields = row.invoice_number !== undefined ? ["invoice_number"] : row.customer_id !== undefined ? ["customer_id"]
    : row.vendor_id !== undefined ? ["vendor_id"] : row.warehouse_id !== undefined ? ["product_id", "warehouse_id"]
      : row.price_list_id !== undefined ? ["product_id", "price_list_id", "currency", "unit"] : ["product_id"];
  return fields.map((field) => row[field] || "(missing)").join(" / ");
}

/** Snapshot of the complete current run, independent of visible review filters. */
export function buildReviewReport<TField extends string>(input: ReviewReportInput<TField>, organization = ""): ReviewReport {
  if (organization.trim().length > 120) throw new Error("Use at most 120 characters for the report organization.");
  const total = input.normalizedRows.length;
  if (!total || input.sourceRows.length !== total || (input.displayRows && input.displayRows.length !== total)) throw new Error("The report requires one complete, current validation run. Validate the file again.");
  const byRow = new Map<number, ReportIssue[]>();
  for (const issue of input.issues) {
    if (!Number.isInteger(issue.rowIndex) || issue.rowIndex < 1 || issue.rowIndex > total) throw new Error("An issue does not match the current source rows. Validate the file again.");
    byRow.set(issue.rowIndex, [...(byRow.get(issue.rowIndex) ?? []), issue]);
  }
  const rows = input.normalizedRows.map((record, index): ParsedRow => {
    const issues = byRow.get(index + 1) ?? [];
    const blocked = issues.some((issue) => issue.severity === "critical");
    return { row: String(index + 1), record_id: identity(record), status: blocked ? "Blocked" : issues.length ? "Needs review" : "Ready", issue_count: String(issues.length), export_decision: blocked ? "excluded_from_clean_export" : issues.length ? "included_with_review_warning" : "included_without_issues" };
  });
  const counts = { total, blocked: rows.filter((row) => row.status === "Blocked").length, needsReview: rows.filter((row) => row.status === "Needs review").length, ready: rows.filter((row) => row.status === "Ready").length };
  if ((Object.keys(counts) as Array<keyof typeof counts>).some((key) => input.counts[key] !== counts[key])) throw new Error("Report counts do not match the current run. Validate the file again.");
  const context = buildValidationReportRows(input);
  context.push({ Section: "Scope", "DataPreflight field / metric": "Checks performed", "Source column / value": CHECKS[input.profile.id] ?? "Only the rules of the named validation profile." });
  context.push({ Section: "Scope", "DataPreflight field / metric": "Ready boundary", "Source column / value": "Ready means the implemented checks passed. This is not a guarantee of target-ERP acceptance or a legal/compliance audit. Parsed source values cannot recover information already lost before upload." });
  const issueRows = [...input.issues].sort((a, b) => a.rowIndex - b.rowIndex || (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1)).map((issue): ParsedRow => {
    const index = issue.rowIndex - 1;
    const field = issue.field as TField;
    const column = input.mapping[field];
    const source = input.sourceRows[index];
    const display = input.displayRows?.[index] ?? source;
    const normalized = input.normalizedRows[index];
    const wholeRow = issue.field === "row";
    return { row: String(issue.rowIndex), record_id: rows[index].record_id, field: issue.field,
      source_column: column || (wholeRow ? "Entire row" : "Not mapped"),
      source_value: column ? source[column] ?? "" : wholeRow ? JSON.stringify(source) : "",
      displayed_value: column ? display[column] ?? "" : wholeRow ? JSON.stringify(display) : "",
      normalized_value: wholeRow ? JSON.stringify(Object.fromEntries(Object.entries(normalized).filter(([key]) => key !== "normalized_invoice_key"))) : normalized[issue.field] ?? "",
      severity: issue.severity, rule: issue.ruleId ?? issue.type ?? "", category: issue.category ?? "", risk: issue.risk ?? "",
      problem: issue.problem, why_it_matters: issue.why, suggested_fix: issue.fix,
      row_status: rows[index].status, export_decision: rows[index].export_decision };
  });
  const summary = Object.entries({ "Profile": input.profile.name, "Profile version": input.profile.version, "Source file": input.fileName,
    ...(input.sheetName ? { Worksheet: input.sheetName } : {}), ...(organization.trim() ? { Organization: organization.trim() } : {}),
    "Total rows": String(total), Blocked: String(counts.blocked), "Needs review": String(counts.needsReview), Ready: String(counts.ready),
    "Rows included in data export": String(total - counts.blocked), "Issue count": String(issueRows.length),
    "Export scope": "All rows without blockers, including warning-only rows; independent of review filters.",
    "Value interpretation": "Source value is the parsed source cell; displayed value is available formatting; normalized value is the value checked. A data-row number identifies the parsed data row, not necessarily the physical Excel line.",
    "Report boundary": "This report records checks, not human approval or a guarantee of ERP acceptance." }).map(([Metric, Value]) => ({ Metric, Value }));
  return { profile: { id: input.profile.id, name: input.profile.name, version: input.profile.version }, fileName: input.fileName, organization: organization.trim(), summary, context, issues: issueRows, rows };
}
