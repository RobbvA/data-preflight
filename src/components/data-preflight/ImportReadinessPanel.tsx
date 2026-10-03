import { Search } from "lucide-react";

import type { ParsedRow } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";

type ReviewTarget = "blocked" | "warning" | "ready";

type ImportReadinessPanelProps = {
  importReadinessMessage: string;
  totalInvoices: number;
  hasIncompleteMapping: boolean;
  hasDuplicateMappings: boolean;
  blockedCount: number;
  warningCount: number;
  cleanCount: number;
  criticalCount: number;
  hasSuspiciousVat: boolean;
  canExport: boolean;
  cleanRows: ParsedRow[];
  issues: ValidationIssue[];
  onDownloadCleanCsv: (filename: string, rows: ParsedRow[]) => void;
  onDownloadErrorCsv: (filename: string, issues: ValidationIssue[]) => void;
  onReviewAction?: (target: ReviewTarget) => void;
  onExportAction?: () => void;
};

export function ImportReadinessPanel({
  blockedCount,
  warningCount,
  cleanCount,
  onReviewAction,
  onExportAction,
}: ImportReadinessPanelProps) {
  const nextAction = getNextActionMessage({
    blockedCount,
    warningCount,
    cleanCount,
  });

  function handleNextAction() {
    if (nextAction.target === "ready" && onExportAction) {
      onExportAction();
      return;
    }

    if (nextAction.target && onReviewAction) {
      onReviewAction(nextAction.target);
      return;
    }

    document.getElementById("invoice-review-workspace")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[var(--surface-base)] p-5 shadow-xl shadow-black/20 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
        Step 2 · Review
      </p>

      <div className="mt-4 rounded-3xl border border-white/10 bg-[var(--surface-raised)] p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
          Next action
        </p>

        <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
          {nextAction.title}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
          {nextAction.description}
        </p>

        <button
          type="button"
          onClick={handleNextAction}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--brand-accent-soft)]"
        >
          <Search className="h-4 w-4" />
          {nextAction.target === "ready" && onExportAction
            ? "Go to export"
            : nextAction.buttonLabel}
        </button>
      </div>
    </section>
  );
}

function getNextActionMessage({
  blockedCount,
  warningCount,
  cleanCount,
}: {
  blockedCount: number;
  warningCount: number;
  cleanCount: number;
}): {
  title: string;
  description: string;
  buttonLabel: string;
  target: ReviewTarget | null;
} {
  if (blockedCount > 0) {
    return {
      title: `${blockedCount} blocked ${blockedCount === 1 ? "invoice needs" : "invoices need"} attention`,
      description:
        "Review the critical issues first. Blocked rows are excluded from the clean export.",
      buttonLabel: "Review blocked invoices",
      target: "blocked",
    };
  }

  if (warningCount > 0) {
    return {
      title: `${warningCount} ${warningCount === 1 ? "invoice needs" : "invoices need"} review`,
      description: "Check the warnings before exporting rows without blockers.",
      buttonLabel: "Review warnings",
      target: "warning",
    };
  }

  if (cleanCount > 0) {
    return {
      title: "Rows ready for export",
      description:
        "The current checks passed. Confirm your target ERP requirements before import.",
      buttonLabel: "Review ready rows",
      target: "ready",
    };
  }

  return {
    title: "No rows to review",
    description: "Upload an invoice file with data rows to continue.",
    buttonLabel: "View review workspace",
    target: null,
  };
}