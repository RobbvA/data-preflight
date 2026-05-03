import type { CsvRow } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";

export function downloadCsv(filename: string, rows: CsvRow[]) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header] ?? "")).join(","),
    ),
  ];

  downloadFile(filename, csvRows.join("\n"), "text/csv");
}

export function downloadErrorCsv(filename: string, issues: ValidationIssue[]) {
  if (issues.length === 0) return;

  const headers = ["row", "field", "severity", "problem", "why", "fix"];

  const csvRows = [
    headers.join(","),
    ...issues.map((issue) =>
      [
        issue.rowIndex,
        issue.field,
        issue.severity,
        issue.problem,
        issue.why,
        issue.fix,
      ]
        .map((value) => escapeCsvValue(String(value)))
        .join(","),
    ),
  ];

  downloadFile(filename, csvRows.join("\n"), "text/csv");
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
