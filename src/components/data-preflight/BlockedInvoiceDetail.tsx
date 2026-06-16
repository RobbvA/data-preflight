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
    <section className="rounded-[1.5rem] border border-[#34373d] bg-[#171a20] p-4 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#34373d] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#fa5f1a]">
            Inspection mode
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-[#f7f0f0]">
              Invoice detail
            </h2>

            <StatusPill tone={inspectionSummary.tone}>
              {inspectionSummary.label}
            </StatusPill>
          </div>

          <p className="mt-1.5 text-xs leading-5 text-[#9ca3af]">
            Row{" "}
            <span className="font-medium text-[#f7f0f0]">
              {selectedInvoice.rowIndex}
            </span>{" "}
            ·{" "}
            <span className="font-medium text-[#f7f0f0]">
              {selectedInvoice.issues.length}
            </span>{" "}
            detected issue
            {selectedInvoice.issues.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#111318] px-2.5 py-1 text-[11px] font-medium text-[#d0d4da]">
            {selectedInvoice.actionLabel}
          </span>

          <span className="rounded-full border border-[#fa5f1a]/35 bg-[#fa5f1a]/10 px-2.5 py-1 text-[11px] font-semibold text-[#f7f0f0]">
            Priority {selectedInvoice.priorityScore}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#34373d] bg-[#1c2027] px-3 py-1.5 text-xs font-medium text-[#d0d4da] transition hover:border-[#fa5f1a]/45 hover:bg-[#252525] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>

      {primaryIssue && (
        <div className="mt-4 rounded-2xl border border-[#fa5f1a]/35 bg-[#1c2027] p-3.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fa5f1a]">
                Primary review focus
              </p>

              <h3 className="mt-1.5 text-lg font-semibold text-[#f7f0f0]">
                {primaryIssue.problem}
              </h3>
            </div>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                primaryIssue.severity === "critical"
                  ? "bg-[#fa5f1a]/12 text-[#f7f0f0]"
                  : "bg-white/[0.06] text-[#f7f0f0]"
              }`}
            >
              {primaryIssue.severity}
            </span>
          </div>

          <p className="mt-2 rounded-lg border border-[#fa5f1a]/25 bg-[#fa5f1a]/8 px-3 py-2 text-xs leading-5 text-[#d0d4da]">
            <span className="font-medium text-[#f7f0f0]">Fix:</span>{" "}
            {primaryIssue.fix}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.66fr_1.34fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#34373d] bg-[#1c2027] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#f7f0f0]">
                  Operational summary
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#8f969f]">
                  Import decision and review priority.
                </p>
              </div>

              <span className="rounded-full bg-[#111318] px-2 py-0.5 text-[10px] text-[#9ca3af]">
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

          <div className="rounded-2xl border border-[#34373d] bg-[#1c2027] p-3">
            <div>
              <h3 className="text-sm font-semibold text-[#f7f0f0]">
                Key invoice fields
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#8f969f]">
                Most relevant mapped fields for review.
              </p>
            </div>

            <dl className="mt-3 grid gap-1.5">
              {keyFieldEntries.map(([key, value]) => (
                <DataField key={key} label={formatLabel(key)} value={value} />
              ))}
            </dl>

            {remainingFieldEntries.length > 0 && (
              <details className="mt-3 rounded-xl bg-[#111318] px-3 py-2">
                <summary className="cursor-pointer text-xs font-medium text-[#d0d4da] transition hover:text-white">
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

        <div className="rounded-2xl border border-[#34373d] bg-[#1c2027] p-3.5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#f7f0f0]">
                Issue explanations
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#8f969f]">
                Review risks and fixes for detected issues.
              </p>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                hasIssues
                  ? "bg-[#fa5f1a]/10 text-[#f7f0f0]"
                  : "bg-white/[0.06] text-[#f7f0f0]"
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
            <div className="rounded-xl bg-[#111318] p-3.5">
              <p className="text-sm font-medium text-[#f7f0f0]">
                No issues detected for this row.
              </p>

              <p className="mt-1 text-xs leading-5 text-[#d0d4da]">
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
            ? "border-[#fa5f1a]/35 bg-[#252525]"
            : "border-[#fa5f1a]/22 bg-[#252525]"
          : issue.severity === "critical"
            ? "border-[#fa5f1a]/22 bg-[#252525]"
            : "border-[#34373d] bg-[#252525]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
            issue.severity === "critical"
              ? "bg-[#fa5f1a]/14 text-[#f7f0f0]"
              : "bg-white/[0.06] text-[#d0d4da]"
          }`}
        >
          {issue.severity}
        </span>

        <span className="rounded-full bg-[#111318] px-2 py-0.5 text-[9px] text-[#9ca3af]">
          {issue.field}
        </span>

        <span className="rounded-full bg-[#111318] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-[#d0d4da]">
          {formatRiskLabel(issue.risk)}
        </span>

        <span className="rounded-full bg-[#111318] px-2 py-0.5 text-[9px] text-[#9ca3af]">
          {formatIssueType(issue.type)}
        </span>
      </div>

      <h4
        className={`mt-2 font-semibold text-[#f7f0f0] ${primary ? "text-base" : "text-sm"}`}
      >
        {issue.problem}
      </h4>

      <div className="mt-2 grid gap-1.5">
        <ExplanationLine label="Risk" value={impact} />
        <ExplanationLine label="Fix" value={issue.fix} stronger />
      </div>

      <details className="mt-2 rounded-lg bg-[#111318] px-3 py-2">
        <summary className="cursor-pointer text-[11px] font-medium text-[#9ca3af] transition hover:text-[#f7f0f0]">
          Show explanation
        </summary>

        <p className="mt-2 text-xs leading-5 text-[#d0d4da]">
          <span className="font-medium text-[#f7f0f0]">Why:</span> {issue.why}
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
          ? "border border-[#fa5f1a]/22 bg-[#fa5f1a]/8 text-[#d0d4da]"
          : "bg-[#111318] text-[#d0d4da]"
      }`}
    >
      <span className="font-medium text-[#f7f0f0]">{label}:</span> {value}
    </p>
  );
}

function DataField({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="grid gap-2 rounded-lg bg-[#111318] px-3 py-2 sm:grid-cols-[118px_1fr]">
      <dt className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8f969f]">
        {label}
      </dt>

      <dd className="min-w-0 break-words text-xs font-medium text-[#d0d4da]">
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
    danger: "text-[#f7f0f0]",
    warning: "text-[#f7f0f0]",
    success: "text-[#f7f0f0]",
    neutral: "text-[#d0d4da]",
  };

  return (
    <div className="grid gap-2 rounded-lg bg-[#111318] px-3 py-2 sm:grid-cols-[82px_1fr]">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#8f969f]">
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
    danger: "border border-[#fa5f1a]/35 bg-[#fa5f1a]/10 text-[#f7f0f0]",
    warning: "border border-[#fa5f1a]/22 bg-[#fa5f1a]/8 text-[#f7f0f0]",
    success: "border border-white/10 bg-white/[0.04] text-[#f7f0f0]",
    neutral: "border border-white/10 bg-white/[0.04] text-[#d0d4da]",
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
