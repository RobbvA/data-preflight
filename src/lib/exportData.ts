import { createExportDataSet, serializeDataExport, type DataExportOptions } from "@/lib/dataExport";
import type { ParsedRow } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";

export type ExportBlockerSummary = {
  type: ValidationIssue["type"];
  field: string;
  severity: ValidationIssue["severity"];
  risk: ValidationIssue["risk"];
  count: number;
  label: string;
};

export function downloadDataExport(filename: string, rows: readonly ParsedRow[], options: DataExportOptions) {
  const file = serializeDataExport(createExportDataSet(rows), options);
  if (!file) return;
  const stem = filename.replace(/\.(?:csv|xlsx|txt|tsv|json)$/i, "");
  downloadExportFile(`${stem}.${file.extension}`, file.content, file.mimeType);
}

export function downloadCsv(filename: string, rows: ParsedRow[]) {
  downloadDataExport(filename, rows, { format: "csv", csvDelimiter: ";" });
}

export function downloadErrorCsv(
  filename: string,
  issues: ValidationIssue[],
) {
  if (issues.length === 0) return;

  const headers = [
    "row",
    "field",
    "severity",
    "risk",
    "category",
    "type",
    "problem",
    "why_it_matters",
    "operational_fix",
    "export_decision",
  ];

  const blockedRows = new Set(issues.filter((issue) => issue.severity === "critical").map((issue) => issue.rowIndex));
  const rows = issues.map((issue) => Object.fromEntries(headers.map((header, index) => [header, String([
    issue.rowIndex, issue.field, issue.severity, issue.risk, issue.category, issue.type,
    issue.problem, issue.why, issue.fix,
    blockedRows.has(issue.rowIndex) ? "excluded_from_clean_export" : "included_with_review_warning",
  ][index])])));
  downloadCsv(filename, rows);
}

export function getExportBlockerSummaries(
  issues: ValidationIssue[],
): ExportBlockerSummary[] {
  const criticalIssues = issues.filter(
    (issue) => issue.severity === "critical",
  );

  const groupedIssues = criticalIssues.reduce<
    Record<string, ExportBlockerSummary>
  >((accumulator, issue) => {
    const key = `${issue.type}-${issue.field}-${issue.risk}`;

    accumulator[key] ??= {
      type: issue.type,
      field: issue.field,
      severity: issue.severity,
      risk: issue.risk,
      count: 0,
      label: issue.problem,
    };

    accumulator[key].count += 1;

    return accumulator;
  }, {});

  return Object.values(groupedIssues).sort((a, b) => b.count - a.count);
}

export function getExportSafetyMessage({
  hasIncompleteMapping,
  hasDuplicateMappings,
  cleanRowCount,
  issues,
}: {
  hasIncompleteMapping: boolean;
  hasDuplicateMappings: boolean;
  cleanRowCount: number;
  issues: ValidationIssue[];
}) {
  const criticalIssueCount = issues.filter(
    (issue) => issue.severity === "critical",
  ).length;

  const warningIssueCount = issues.filter(
    (issue) => issue.severity === "warning",
  ).length;

  if (hasIncompleteMapping) {
    return "Export is unavailable because required fields are not mapped. Complete the mapping to validate your data.";
  }

  if (hasDuplicateMappings) {
    return "Export is unavailable because a source column is assigned to multiple fields. Resolve the duplicate assignments.";
  }

  if (cleanRowCount === 0) {
    return "No rows without blockers are available. Correct the source file and validate it again.";
  }

  if (criticalIssueCount > 0 && warningIssueCount > 0) {
    return "Export includes rows without critical issues. Blocked rows are excluded; warning rows remain included and should be reviewed before import.";
  }

  if (criticalIssueCount > 0) {
    return "Export includes rows without critical issues. Blocked rows are excluded. Confirm your target ERP requirements separately.";
  }

  if (warningIssueCount > 0) {
    return "Export includes warning rows. Review their issues before import and confirm your target ERP requirements.";
  }

  return "These rows passed the current profile checks. This does not guarantee acceptance by your target ERP.";
}

export function downloadExportFile(
  filename: string,
  content: string | ArrayBuffer,
  type: string,
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}