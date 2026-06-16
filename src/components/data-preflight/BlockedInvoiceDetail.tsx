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
    <section className="rounded-[1.5rem] border border-white/10 bg-[var(--surface-base)] p-4 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]">
            Inspection mode
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Invoice detail
            </h2>

            <StatusPill tone={inspectionSummary.tone}>
              {inspectionSummary.label}
            </StatusPill>
          </div>

          <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">
            Row{" "}
            <span className="font-medium text-[var(--text-primary)]">
              {selectedInvoice.rowIndex}
            </span>{" "}
            ·{" "}
            <span className="font-medium text-[var(--text-primary)]">
              {selectedInvoice.issues.length}
            </span>{" "}
            detected issue
            {selectedInvoice.issues.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--surface-deep)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
            {selectedInvoice.actionLabel}
          </span>

          <span className="rounded-full border border-[color:rgba(182,111,58,0.35)] bg-[rgba(182,111,58,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-primary)]">
            Priority {selectedInvoice.priorityScore}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[color:rgba(182,111,58,0.45)] hover:bg-[var(--surface-deep)] hover:text-[var(--text-primary)]"
          >
            Close
          </button>
        </div>
      </div>

      {primaryIssue && (
        <div className="mt-4 rounded-2xl border border-[color:rgba(182,111,58,0.35)] bg-[var(--surface-raised)] p-3.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                Primary review focus
              </p>

              <h3 className="mt-1.5 text-lg font-semibold text-[var(--text-primary)]">
                {primaryIssue.problem}
              </h3>
            </div>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                primaryIssue.severity === "critical"
                  ? "bg-[rgba(182,111,58,0.12)] text-[var(--text-primary)]"
                  : "bg-white/[0.04] text-[var(--text-primary)]"
              }`}
            >
              {primaryIssue.severity}
            </span>
          </div>

          <p className="mt-2 rounded-lg border border-[color:rgba(182,111,58,0.25)] bg-[rgba(182,111,58,0.08)] px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">Fix:</span>{" "}
            {primaryIssue.fix}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.66fr_1.34fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-[var(--surface-raised)] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Operational summary
                </h3>

                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  Import decision and review priority.
                </p>
              </div>

              <span className="rounded-full bg-[var(--surface-deep)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                row {selectedInvoice.rowIndex}
              </span>
            </div>

            <div className="mt-3 grid gap-1.5">
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

          <div className="rounded-2xl border border-white/10 bg-[var(--surface-raised)] p-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Key invoice fields
              </h3>

              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                Most relevant mapped fields for review.
              </p>
            </div>

            <dl className="mt-3 grid gap-1.5">
              {keyFieldEntries.map(([key, value]) => (
                <DataField key={key} label={formatLabel(key)} value={value} />
              ))}
            </dl>

            {remainingFieldEntries.length > 0 && (
              <details className="mt-3 rounded-xl bg-[var(--surface-deep)] px-3 py-2">
                <summary className="cursor-pointer text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
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

        <div className="rounded-2xl border border-white/10 bg-[var(--surface-raised)] p-3.5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Issue explanations
              </h3>

              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                Review risks and fixes for detected issues.
              </p>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                hasIssues
                  ? "bg-[rgba(182,111,58,0.1)] text-[var(--text-primary)]"
                  : "bg-white/[0.04] text-[var(--text-primary)]"
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
              {selectedInvoice.issues.map((issue, index) => (
                <IssueExplanationCard
                  key={`${issue.rowIndex}-${issue.field}-${issue.type}`}
                  issue={issue}
                  primary={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-[var(--surface-deep)] p-3.5">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                No issues detected for this row.
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
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

function IssueExplanationCard({
  issue,
  primary,
}: {
  issue: ValidationIssue;
  primary: boolean;
}) {
  const impact = getOperationalImpact(issue);

  return (
    <article
      className={`rounded-xl border p-3 ${
        primary
          ? issue.severity === "critical"
            ? "border-[color:rgba(182,111,58,0.35)] bg-[var(--surface-base)]"
            : "border-[color:rgba(182,111,58,0.22)] bg-[var(--surface-base)]"
          : issue.severity === "critical"
            ? "border-[color:rgba(182,111,58,0.22)] bg-[var(--surface-base)]"
            : "border-white/10 bg-[var(--surface-base)]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
            issue.severity === "critical"
              ? "bg-[rgba(182,111,58,0.14)] text-[var(--text-primary)]"
              : "bg-white/[0.04] text-[var(--text-secondary)]"
          }`}
        >
          {issue.severity}
        </span>

        <span className="rounded-full bg-[var(--surface-deep)] px-2 py-0.5 text-[9px] text-[var(--text-muted)]">
          {issue.field}
        </span>

        <span className="rounded-full bg-[var(--surface-deep)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-[var(--text-secondary)]">
          {formatRiskLabel(issue.risk)}
        </span>

        <span className="rounded-full bg-[var(--surface-deep)] px-2 py-0.5 text-[9px] text-[var(--text-muted)]">
          {formatIssueType(issue.type)}
        </span>
      </div>

      <h4
        className={`mt-2 font-semibold text-[var(--text-primary)] ${
          primary ? "text-base" : "text-sm"
        }`}
      >
        {issue.problem}
      </h4>

      <div className="mt-2 grid gap-1.5">
        <ExplanationLine label="Risk" value={impact} />
        <ExplanationLine label="Fix" value={issue.fix} stronger />
      </div>

      <details className="mt-2 rounded-lg bg-[var(--surface-deep)] px-3 py-2">
        <summary className="cursor-pointer text-[11px] font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]">
          Show explanation
        </summary>

        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">Why:</span>{" "}
          {issue.why}
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
      className={`rounded-lg px-3 py-2 text-xs leading-5 ${
        stronger
          ? "border border-[color:rgba(182,111,58,0.22)] bg-[rgba(182,111,58,0.08)] text-[var(--text-secondary)]"
          : "bg-[var(--surface-deep)] text-[var(--text-secondary)]"
      }`}
    >
      <span className="font-medium text-[var(--text-primary)]">{label}:</span>{" "}
      {value}
    </p>
  );
}

function DataField({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="grid gap-2 rounded-lg bg-[var(--surface-deep)] px-3 py-2 sm:grid-cols-[118px_1fr]">
      <dt className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
        {label}
      </dt>

      <dd className="min-w-0 break-words text-xs font-medium text-[var(--text-secondary)]">
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
    danger: "text-[var(--text-primary)]",
    warning: "text-[var(--text-primary)]",
    success: "text-[var(--text-primary)]",
    neutral: "text-[var(--text-secondary)]",
  };

  return (
    <div className="grid gap-2 rounded-lg bg-[var(--surface-deep)] px-3 py-2 sm:grid-cols-[82px_1fr]">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
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
    danger:
      "border border-[color:rgba(182,111,58,0.35)] bg-[rgba(182,111,58,0.1)] text-[var(--text-primary)]",
    warning:
      "border border-[color:rgba(182,111,58,0.22)] bg-[rgba(182,111,58,0.08)] text-[var(--text-primary)]",
    success:
      "border border-white/10 bg-white/[0.04] text-[var(--text-primary)]",
    neutral:
      "border border-white/10 bg-white/[0.04] text-[var(--text-secondary)]",
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
