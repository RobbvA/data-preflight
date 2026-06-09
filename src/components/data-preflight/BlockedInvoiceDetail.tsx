import type { InvoicePreviewItem } from "@/components/data-preflight/types";
import type { ValidationIssue } from "@/lib/validateRows";

type BlockedInvoiceDetailProps = {
  selectedInvoice: InvoicePreviewItem;
  onClose: () => void;
};

const KEY_FIELDS = [
  "invoice_number",
  "company",
  "amount",
  "vat",
  "status",
  "invoice_date",
  "due_date",
  "currency",
];

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
  const primaryIssue = selectedInvoice.issues[0];

  const keyFieldEntries = Object.entries(selectedInvoice.row).filter(([key]) =>
    KEY_FIELDS.includes(key),
  );

  const remainingFieldEntries = Object.entries(selectedInvoice.row).filter(
    ([key]) => !KEY_FIELDS.includes(key),
  );

  return (
    <section className="rounded-[1.5rem] bg-slate-900/55 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Inspection mode
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-50">
              Invoice detail
            </h2>

            <StatusPill tone={inspectionSummary.tone}>
              {inspectionSummary.label}
            </StatusPill>
          </div>

          <p className="mt-1.5 text-xs leading-5 text-slate-500">
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

          <span className="rounded-full border border-cyan-300/15 bg-cyan-400/[0.08] px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
            Priority {selectedInvoice.priorityScore}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700/70 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800/70 hover:text-slate-100"
          >
            Close
          </button>
        </div>
      </div>

      {primaryIssue && (
        <div
          className={`mt-4 rounded-2xl p-3.5 ${
            primaryIssue.severity === "critical"
              ? "bg-rose-400/[0.06]"
              : "bg-amber-300/[0.06]"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Primary review focus
              </p>

              <h3 className="mt-1.5 text-base font-semibold text-slate-50">
                {primaryIssue.problem}
              </h3>
            </div>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                primaryIssue.severity === "critical"
                  ? "bg-rose-400/[0.1] text-rose-50"
                  : "bg-amber-300/[0.09] text-amber-50"
              }`}
            >
              {primaryIssue.severity}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            <span className="font-medium text-slate-100">Fix:</span>{" "}
            {primaryIssue.fix}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-950/25 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Operational summary
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Import decision and review priority.
                </p>
              </div>

              <span className="rounded-full bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-500">
                row {selectedInvoice.rowIndex}
              </span>
            </div>

            <div className="mt-3 grid gap-2">
              <SummaryItem
                label="Decision"
                value={inspectionSummary.decision}
                tone={inspectionSummary.tone}
              />

              <SummaryItem
                label="Issues"
                value={`${criticalIssues.length} blocker${
                  criticalIssues.length === 1 ? "" : "s"
                } · ${warningIssues.length} warning${
                  warningIssues.length === 1 ? "" : "s"
                }`}
                tone={
                  criticalIssues.length > 0
                    ? "danger"
                    : warningIssues.length > 0
                      ? "warning"
                      : "success"
                }
              />

              <SummaryItem
                label="Top risk"
                value={
                  primaryRisks.length > 0
                    ? primaryRisks.map(formatRiskLabel).join(", ")
                    : "none"
                }
                tone={primaryRisks.length > 0 ? "warning" : "success"}
              />

              <SummaryItem
                label="Priority"
                value={`${selectedInvoice.priority} · ${selectedInvoice.priorityScore}`}
                tone={inspectionSummary.tone}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950/25 p-3.5">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Key invoice fields
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Most relevant mapped fields for review.
              </p>
            </div>

            <dl className="mt-3 grid gap-1.5">
              {keyFieldEntries.map(([key, value]) => (
                <DataField key={key} label={formatLabel(key)} value={value} />
              ))}
            </dl>

            {remainingFieldEntries.length > 0 && (
              <details className="mt-3 rounded-xl bg-slate-900/30 px-3 py-2">
                <summary className="cursor-pointer text-xs font-medium text-slate-400 transition hover:text-slate-200">
                  Show all normalized fields
                </summary>

                <dl className="mt-3 grid gap-1.5">
                  {remainingFieldEntries.map(([key, value]) => (
                    <DataField
                      key={key}
                      label={formatLabel(key)}
                      value={value}
                    />
                  ))}
                </dl>
              </details>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950/25 p-3.5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Issue explanations
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Review the risk and required fix for each detected issue.
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
            <div className="space-y-2.5">
              {selectedInvoice.issues.map((issue) => (
                <IssueExplanationCard
                  key={`${issue.rowIndex}-${issue.field}-${issue.type}`}
                  issue={issue}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-400/[0.045] p-3.5">
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
      className={`rounded-xl p-3 ${
        issue.severity === "critical"
          ? "bg-rose-400/[0.06]"
          : "bg-amber-300/[0.06]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
            issue.severity === "critical"
              ? "bg-rose-400/[0.1] text-rose-50"
              : "bg-amber-300/[0.09] text-amber-50"
          }`}
        >
          {issue.severity}
        </span>

        <span className="rounded-full bg-slate-950/35 px-2 py-0.5 text-[9px] text-slate-500">
          {issue.field}
        </span>

        <span className="rounded-full bg-cyan-400/[0.06] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-slate-400">
          {formatRiskLabel(issue.risk)}
        </span>

        <span className="rounded-full bg-slate-950/35 px-2 py-0.5 text-[9px] text-slate-500">
          {formatIssueType(issue.type)}
        </span>
      </div>

      <h4 className="mt-2 text-sm font-semibold text-slate-50">
        {issue.problem}
      </h4>

      <div className="mt-2 grid gap-1.5">
        <ExplanationLine label="Risk" value={impact} />
        <ExplanationLine label="Fix" value={issue.fix} stronger />
      </div>

      <details className="mt-2 rounded-lg bg-slate-950/20 px-3 py-2">
        <summary className="cursor-pointer text-[11px] font-medium text-slate-500 transition hover:text-slate-300">
          Show explanation
        </summary>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          <span className="font-medium text-slate-200">Why:</span> {issue.why}
        </p>
      </details>
    </article>
  );
}

function ExplanationLine({
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
      className={`rounded-lg bg-slate-950/25 px-3 py-2 text-xs leading-5 ${
        stronger
          ? "border border-cyan-300/10 bg-cyan-300/[0.04] text-slate-200"
          : "text-slate-500"
      }`}
    >
      <span className="font-medium text-slate-200">{label}:</span> {value}
    </p>
  );
}

function DataField({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="grid gap-2 rounded-lg bg-slate-900/35 px-3 py-2 sm:grid-cols-[118px_1fr]">
      <dt className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600">
        {label}
      </dt>

      <dd className="min-w-0 break-words text-xs font-medium text-slate-300">
        {String(value || "—")}
      </dd>
    </div>
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
    <div className="grid gap-2 rounded-lg bg-slate-900/35 px-3 py-2 sm:grid-cols-[82px_1fr]">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600">
        {label}
      </p>

      <p
        className={`min-w-0 break-words text-xs font-medium ${toneClasses[tone]}`}
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
    danger: "bg-rose-400/[0.08] text-rose-100",
    warning: "bg-amber-300/[0.08] text-amber-100",
    success: "bg-emerald-400/[0.06] text-emerald-100",
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
      decision: "Excluded until critical issues are fixed",
      tone: "danger" as const,
    };
  }

  if (warningCount > 0 || priority === "medium" || priority === "low") {
    return {
      label: "Review before import",
      decision: "Exportable, but review recommended",
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
    import_failure: "Can cause row, batch, or target import failure.",
    financial_reporting:
      "Can distort totals, reporting periods, revenue, balances, or reconciliation.",
    tax_risk:
      "Can create incorrect VAT/tax reporting or manual correction work.",
    workflow_inconsistency:
      "Can place the invoice in the wrong operational state.",
    duplicate_risk:
      "Can create duplicate records, double processing, or reconciliation conflicts.",
    data_quality:
      "Reduces trust in the dataset and may require manual cleanup.",
    payment_terms:
      "Can break payment tracking, reminders, aging reports, or cash-flow planning.",
    regional_compliance:
      "Can create incorrect country-based routing, tax handling, or compliance assumptions.",
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
