import type { InvoicePreviewItem } from "@/components/data-preflight/types";
import type { ValidationIssue } from "@/lib/validateRows";

type BlockedInvoiceDetailProps = {
  selectedInvoice: InvoicePreviewItem;
  onClose: () => void;
};

export function BlockedInvoiceDetail({
  selectedInvoice,
  onClose,
}: BlockedInvoiceDetailProps) {
  const hasIssues = selectedInvoice.issues.length > 0;
  const criticalIssues = selectedInvoice.issues.filter(
    (issue) => issue.severity === "critical",
  );
  const warningIssues = selectedInvoice.issues.filter(
    (issue) => issue.severity === "warning",
  );

  const inspectionSummary = getInspectionSummary({
    criticalCount: criticalIssues.length,
    warningCount: warningIssues.length,
    priority: selectedInvoice.priority,
  });

  const primaryRisks = getPrimaryRisks(selectedInvoice.issues);

  return (
    <section className="rounded-[1.75rem] bg-slate-900/55 p-5 shadow-xl shadow-black/15 backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/70 pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Inspection mode
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
              Invoice detail
            </h2>

            <StatusPill tone={inspectionSummary.tone}>
              {inspectionSummary.label}
            </StatusPill>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Row{" "}
            <span className="font-medium text-slate-200">
              {selectedInvoice.rowIndex}
            </span>{" "}
            ·{" "}
            <span className="font-medium text-slate-200">
              {selectedInvoice.issues.length}
            </span>{" "}
            detected issue
            {selectedInvoice.issues.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-950/30 px-2.5 py-1 text-[11px] font-medium text-slate-400">
            {selectedInvoice.actionLabel}
          </span>

          <span className="rounded-full bg-cyan-400/[0.07] px-2.5 py-1 text-[11px] font-medium text-cyan-100/85">
            {selectedInvoice.priorityScore} score
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700/70 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800/70 hover:text-slate-100"
          >
            Close detail
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-950/25 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Operational summary
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Import decision, risk level, and review priority for this row.
                </p>
              </div>

              <span className="rounded-full bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-500">
                row {selectedInvoice.rowIndex}
              </span>
            </div>

            <div className="mt-4 grid gap-2">
              <SummaryItem
                label="Decision"
                value={inspectionSummary.decision}
                tone={inspectionSummary.tone}
              />

              <SummaryItem
                label="Blockers"
                value={String(criticalIssues.length)}
                tone={criticalIssues.length > 0 ? "danger" : "success"}
              />

              <SummaryItem
                label="Warnings"
                value={String(warningIssues.length)}
                tone={warningIssues.length > 0 ? "warning" : "success"}
              />

              <SummaryItem
                label="Risks"
                value={
                  primaryRisks.length > 0
                    ? primaryRisks.map(formatRiskLabel).join(", ")
                    : "none"
                }
                tone={primaryRisks.length > 0 ? "warning" : "success"}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950/25 p-4">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Normalized invoice data
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Final mapped output used for validation and export.
              </p>
            </div>

            <dl className="mt-4 grid gap-1.5">
              {Object.entries(selectedInvoice.row).map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-2 rounded-xl bg-slate-900/35 px-3 py-2.5 sm:grid-cols-[140px_1fr]"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-600">
                    {formatLabel(key)}
                  </dt>

                  <dd className="min-w-0 break-words text-sm text-slate-300">
                    {String(value || "—")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950/25 p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Issue explanations
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                What failed, why it matters, operational impact, and how to fix
                it.
              </p>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                hasIssues
                  ? "bg-amber-300/[0.07] text-amber-100"
                  : "bg-emerald-400/[0.055] text-emerald-100"
              }`}
            >
              {hasIssues
                ? `${selectedInvoice.issues.length} issue${
                    selectedInvoice.issues.length === 1 ? "" : "s"
                  }`
                : "No issues"}
            </span>
          </div>

          {hasIssues ? (
            <div className="space-y-3">
              {selectedInvoice.issues.map((issue) => (
                <IssueExplanationCard
                  key={`${issue.rowIndex}-${issue.field}-${issue.type}`}
                  issue={issue}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-400/[0.045] p-4">
              <p className="text-sm font-medium text-emerald-100">
                No issues detected for this row.
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                This invoice is currently import-ready based on the mapped and
                normalized fields.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function IssueExplanationCard({ issue }: { issue: ValidationIssue }) {
  const impact = getOperationalImpact(issue);

  return (
    <article
      className={`rounded-xl p-4 ${
        issue.severity === "critical"
          ? "bg-rose-400/[0.055]"
          : "bg-amber-300/[0.055]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
            issue.severity === "critical"
              ? "bg-rose-400/[0.08] text-rose-100"
              : "bg-amber-300/[0.08] text-amber-100"
          }`}
        >
          {issue.severity}
        </span>

        <span className="rounded-full bg-slate-950/35 px-2 py-0.5 text-[9px] text-slate-500">
          {issue.field}
        </span>

        <span className="rounded-full bg-slate-950/35 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-slate-400">
          {formatRiskLabel(issue.risk)}
        </span>

        <span className="rounded-full bg-slate-950/35 px-2 py-0.5 text-[9px] text-slate-500">
          {formatIssueType(issue.type)}
        </span>
      </div>

      <h4 className="mt-3 text-sm font-semibold text-slate-50">
        {issue.problem}
      </h4>

      <div className="mt-3 grid gap-2">
        <ExplanationBlock label="Why it matters" value={issue.why} />

        <ExplanationBlock label="Operational impact" value={impact} />

        <ExplanationBlock label="Fix" value={issue.fix} stronger />
      </div>
    </article>
  );
}

function ExplanationBlock({
  label,
  value,
  stronger = false,
}: {
  label: string;
  value: string;
  stronger?: boolean;
}) {
  return (
    <p
      className={`rounded-lg bg-slate-950/25 p-3 text-xs leading-5 ${
        stronger ? "text-slate-300" : "text-slate-500"
      }`}
    >
      <span className="font-medium text-slate-200">{label}:</span> {value}
    </p>
  );
}

function SummaryItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "danger" | "warning" | "success" | "neutral";
}) {
  const toneClasses = {
    danger: "text-rose-100",
    warning: "text-amber-100",
    success: "text-emerald-100",
    neutral: "text-slate-300",
  };

  return (
    <div className="grid gap-2 rounded-xl bg-slate-900/35 px-3 py-2.5 sm:grid-cols-[100px_1fr]">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-600">
        {label}
      </p>

      <p
        className={`min-w-0 break-words text-sm font-medium ${toneClasses[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "danger" | "warning" | "success" | "neutral";
  children: React.ReactNode;
}) {
  const toneClasses = {
    danger: "bg-rose-400/[0.07] text-rose-100",
    warning: "bg-amber-300/[0.07] text-amber-100",
    success: "bg-emerald-400/[0.055] text-emerald-100",
    neutral: "bg-slate-700/25 text-slate-300",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

function getInspectionSummary({
  criticalCount,
  warningCount,
  priority,
}: {
  criticalCount: number;
  warningCount: number;
  priority: InvoicePreviewItem["priority"];
}) {
  if (criticalCount > 0) {
    return {
      label: "Blocked from clean export",
      decision: "Excluded from clean export until critical issues are fixed",
      tone: "danger" as const,
    };
  }

  if (warningCount > 0 || priority === "medium" || priority === "low") {
    return {
      label: "Review before import",
      decision: "Can be exported, but should be reviewed first",
      tone: "warning" as const,
    };
  }

  return {
    label: "Import-ready",
    decision: "Safe for clean export",
    tone: "success" as const,
  };
}

function getPrimaryRisks(issues: ValidationIssue[]) {
  return Array.from(new Set(issues.map((issue) => issue.risk))).slice(0, 3);
}

function getOperationalImpact(issue: ValidationIssue) {
  const impactByRisk: Record<ValidationIssue["risk"], string> = {
    import_failure:
      "This can cause the row, batch, or target import process to fail.",
    financial_reporting:
      "This can distort totals, reporting periods, revenue, balances, or reconciliation.",
    tax_risk:
      "This can create incorrect VAT/tax reporting or require manual correction later.",
    workflow_inconsistency:
      "This can place the invoice in the wrong operational state or break follow-up processes.",
    duplicate_risk:
      "This can create duplicate records, double processing, overwrites, or reconciliation conflicts.",
    data_quality:
      "This reduces trust in the dataset and may require manual cleanup before use.",
    payment_terms:
      "This can break payment tracking, reminders, aging reports, or cash-flow planning.",
    regional_compliance:
      "This can create incorrect country-based routing, tax handling, or compliance assumptions.",
  };

  return impactByRisk[issue.risk];
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatRiskLabel(risk: string) {
  return risk.replaceAll("_", " ");
}

function formatIssueType(type: string) {
  return type.replaceAll("-", " ");
}
