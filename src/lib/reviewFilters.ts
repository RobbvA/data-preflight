import type { ParsedRow } from "@/lib/parseCsv";
export type ReviewFilterIssue = { severity: "critical" | "warning"; field: string; problem: string; why: string; fix: string; ruleId?: string; type?: string };
export type ReviewFilterRow = { row: ParsedRow; rowIndex: number; issues: ReviewFilterIssue[]; sourceRow?: ParsedRow; priorityScore?: number };
export type ReviewFilters = { query: string; severity: string; field: string; issueType: string; sort: "priority" | "row" | "issues"; allStatuses: boolean };
export const EMPTY_REVIEW_FILTERS: ReviewFilters = { query: "", severity: "", field: "", issueType: "", sort: "priority", allStatuses: false };
export function reviewIssueType(issue: ReviewFilterIssue) { return issue.ruleId ?? issue.type ?? ""; }
export function filterReviewRows<T extends ReviewFilterRow>(rows: readonly T[], filters: ReviewFilters): T[] {
  const rowQuery = filters.query.trim().match(/^row\s+(\d+)$/i);
  const terms = (rowQuery ? "" : filters.query).trim().normalize("NFKC").toLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter(item => {
    if (rowQuery && item.rowIndex !== Number(rowQuery[1])) return false;
    if ((filters.severity || filters.field || filters.issueType) && !item.issues.some(issue =>
      (!filters.severity || issue.severity === filters.severity) && (!filters.field || issue.field === filters.field) && (!filters.issueType || reviewIssueType(issue) === filters.issueType))) return false;
    const text = [String(item.rowIndex), `row ${item.rowIndex}`, ...Object.keys(item.row), ...Object.values(item.row), ...Object.keys(item.sourceRow ?? {}), ...Object.values(item.sourceRow ?? {}), ...item.issues.flatMap(issue => [issue.field, issue.problem, issue.why, issue.fix, reviewIssueType(issue)])].join(" ").normalize("NFKC").toLowerCase();
    return terms.every(term => text.includes(term));
  }).sort((a, b) => {
    if (filters.sort === "row") return a.rowIndex - b.rowIndex;
    const score = (item: T) => item.priorityScore ?? item.issues.reduce((sum, issue) => sum + (issue.severity === "critical" ? 100 : 10), 0);
    return (filters.sort === "issues" ? b.issues.length - a.issues.length : score(b) - score(a)) || a.rowIndex - b.rowIndex;
  });
}
