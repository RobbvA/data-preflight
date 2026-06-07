import type { ParsedRow } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";

export type InvoicePriority = "critical" | "high" | "medium" | "low" | "clear";

export type InvoicePreviewItem = {
  rowIndex: number;
  row: ParsedRow;
  issues: ValidationIssue[];
  priority: InvoicePriority;
  priorityScore: number;
  actionLabel: string;
};

const SEVERITY_SCORES: Record<ValidationIssue["severity"], number> = {
  critical: 100,
  warning: 35,
};

const RISK_SCORES: Record<ValidationIssue["risk"], number> = {
  import_failure: 45,
  duplicate_risk: 40,
  financial_reporting: 35,
  tax_risk: 35,
  payment_terms: 25,
  workflow_inconsistency: 25,
  regional_compliance: 20,
  data_quality: 10,
};

const CATEGORY_BONUS: Partial<Record<ValidationIssue["category"], number>> = {
  required_data: 25,
  duplicates: 25,
  financial: 15,
  tax: 15,
  dates: 10,
};

export function createInvoicePreviewItem({
  rowIndex,
  row,
  issues,
}: {
  rowIndex: number;
  row: ParsedRow;
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
  if (issues.length === 0) return 0;

  const baseScore = issues.reduce((score, issue) => {
    const severityScore = SEVERITY_SCORES[issue.severity];
    const riskScore = RISK_SCORES[issue.risk];
    const categoryBonus = CATEGORY_BONUS[issue.category] ?? 0;

    return score + severityScore + riskScore + categoryBonus;
  }, 0);

  return baseScore + getIssueCombinationBonus(issues);
}

function getIssueCombinationBonus(issues: ValidationIssue[]) {
  const hasCriticalIssue = issues.some(
    (issue) => issue.severity === "critical",
  );
  const hasDuplicateRisk = issues.some(
    (issue) => issue.risk === "duplicate_risk",
  );
  const hasImportFailure = issues.some(
    (issue) => issue.risk === "import_failure",
  );
  const hasFinancialRisk = issues.some(
    (issue) =>
      issue.risk === "financial_reporting" || issue.risk === "tax_risk",
  );

  let bonus = 0;

  if (hasCriticalIssue && hasImportFailure) bonus += 30;
  if (hasDuplicateRisk) bonus += 25;
  if (hasFinancialRisk && issues.length >= 2) bonus += 20;
  if (issues.length >= 3) bonus += 15;

  return bonus;
}

function getInvoicePriority(
  priorityScore: number,
  issues: ValidationIssue[],
): InvoicePriority {
  if (issues.length === 0) return "clear";

  const hasCriticalIssue = issues.some(
    (issue) => issue.severity === "critical",
  );

  if (hasCriticalIssue && priorityScore >= 170) return "critical";
  if (hasCriticalIssue) return "high";
  if (priorityScore >= 90) return "medium";

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
