import type { ParsedRow } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";

const CSV_DELIMITER = ";";
const UTF8_BOM = "\uFEFF";

export type ExportBlockerSummary = {
  type: ValidationIssue["type"];
  field: string;
  severity: ValidationIssue["severity"];
  risk: ValidationIssue["risk"];
  count: number;
  label: string;
};

export function downloadCsv(filename: string, rows: ParsedRow[]) {
  if (rows.length === 0) return;

  const headers = getStableHeaders(rows).filter(
    (header) => header !== "normalized_invoice_key",
  );

  const csvRows = [
    headers.map(escapeCsvValue).join(CSV_DELIMITER),
    ...rows.map((row) =>
      headers
        .map((header) => escapeCsvValue(row[header] ?? ""))
        .join(CSV_DELIMITER),
    ),
  ];

  downloadFile(
    filename,
    `${UTF8_BOM}${csvRows.join("\n")}`,
    "text/csv;charset=utf-8",
  );
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

  const csvRows = [
    headers.map(escapeCsvValue).join(CSV_DELIMITER),
    ...issues.map((issue) =>
      [
        issue.rowIndex,
        issue.field,
        issue.severity,
        issue.risk,
        issue.category,
        issue.type,
        issue.problem,
        issue.why,
        issue.fix,
        getIssueExportDecision(issue),
      ]
        .map((value) => escapeCsvValue(String(value)))
        .join(CSV_DELIMITER),
    ),
  ];

  downloadFile(
    filename,
    `${UTF8_BOM}${csvRows.join("\n")}`,
    "text/csv;charset=utf-8",
  );
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

function getIssueExportDecision(issue: ValidationIssue) {
  if (issue.severity === "critical") {
    return "excluded_from_clean_export";
  }

  return "included_with_review_warning";
}

function getStableHeaders(rows: ParsedRow[]) {
  return Array.from(
    rows.reduce<Set<string>>((headers, row) => {
      Object.keys(row).forEach((header) => headers.add(header));
      return headers;
    }, new Set<string>()),
  );
}

function escapeCsvValue(value: string) {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

function downloadFile(
  filename: string,
  content: string,
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