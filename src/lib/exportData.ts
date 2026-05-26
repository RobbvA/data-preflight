import type { CsvRow } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";

export type ExportBlockerSummary = {
  type: ValidationIssue["type"];
  field: string;
  severity: ValidationIssue["severity"];
  risk: ValidationIssue["risk"];
  count: number;
  label: string;
};

export function downloadCsv(filename: string, rows: CsvRow[]) {
  if (rows.length === 0) return;

  const headers = getStableHeaders(rows);
  const csvRows = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header] ?? "")).join(","),
    ),
  ];

  downloadFile(filename, csvRows.join("\n"), "text/csv;charset=utf-8");
}

export function downloadErrorCsv(filename: string, issues: ValidationIssue[]) {
  if (issues.length === 0) return;

  const headers = [
    "row",
    "field",
    "severity",
    "risk",
    "category",
    "type",
    "problem",
    "why",
    "fix",
  ];

  const csvRows = [
    headers.map(escapeCsvValue).join(","),
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
      ]
        .map((value) => escapeCsvValue(String(value)))
        .join(","),
    ),
  ];

  downloadFile(filename, csvRows.join("\n"), "text/csv;charset=utf-8");
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

  if (hasIncompleteMapping) {
    return "Clean export is blocked because required invoice fields are not mapped.";
  }

  if (hasDuplicateMappings) {
    return "Clean export is blocked because one or more source columns are mapped multiple times.";
  }

  if (cleanRowCount === 0) {
    return "Clean export is disabled because no import-ready invoices are available.";
  }

  if (criticalIssueCount > 0) {
    return "Clean export will include only import-ready invoices. Blocked invoices are excluded.";
  }

  return "Clean export is safe. All exported invoices passed blocking checks.";
}

function getStableHeaders(rows: CsvRow[]) {
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

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
