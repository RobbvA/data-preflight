import type { CsvRow } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";

export type InvoicePriority = "critical" | "high" | "medium" | "low" | "clear";

export type InvoicePreviewItem = {
  rowIndex: number;
  row: CsvRow;
  issues: ValidationIssue[];
  priority: InvoicePriority;
  priorityScore: number;
  actionLabel: string;
};

export function createInvoicePreviewItem({
  rowIndex,
  row,
  issues,
}: {
  rowIndex: number;
  row: CsvRow;
  issues: ValidationIssue[];
}): InvoicePreviewItem {
  const priorityScore = calculatePriorityScore(issues);
  const priority = getInvoicePriority(priorityScore, issues);
  const actionLabel = getActionLabel(priority, issues);

  return {
    rowIndex,
    row,
    issues,
    priority,
    priorityScore,
    actionLabel,
  };
}

function calculatePriorityScore(issues: ValidationIssue[]) {
  return issues.reduce((score, issue) => {
    const severityScore = issue.severity === "critical" ? 100 : 35;
    const riskScore = getRiskScore(issue.risk);

    return score + severityScore + riskScore;
  }, 0);
}

function getRiskScore(risk: ValidationIssue["risk"]) {
  const riskScores: Record<ValidationIssue["risk"], number> = {
    import_failure: 40,
    duplicate_risk: 35,
    financial_reporting: 30,
    tax_risk: 30,
    payment_terms: 20,
    workflow_inconsistency: 20,
    regional_compliance: 15,
    data_quality: 10,
  };

  return riskScores[risk];
}

function getInvoicePriority(
  priorityScore: number,
  issues: ValidationIssue[],
): InvoicePriority {
  if (issues.length === 0) return "clear";

  const hasCriticalIssue = issues.some(
    (issue) => issue.severity === "critical",
  );

  if (hasCriticalIssue && priorityScore >= 140) return "critical";
  if (hasCriticalIssue) return "high";
  if (priorityScore >= 70) return "medium";

  return "low";
}

function getActionLabel(
  priority: InvoicePriority,
  issues: ValidationIssue[],
): string {
  if (issues.length === 0) return "Safe to import";

  if (priority === "critical") return "Fix first";
  if (priority === "high") return "Fix before export";
  if (priority === "medium") return "Review before export";
  if (priority === "low") return "Quick review";

  return "Safe to import";
}
