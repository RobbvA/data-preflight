import type { InvoicePreviewItem } from "@/components/data-preflight/types";

type BlockedInvoiceDetailProps = {
  selectedInvoice: InvoicePreviewItem;
  onClose: () => void;
};

export function BlockedInvoiceDetail({
  selectedInvoice,
  onClose,
}: BlockedInvoiceDetailProps) {
  const hasIssues = selectedInvoice.issues.length > 0;

  return (
    <section className="rounded-[1.75rem] border border-slate-700/45 bg-slate-900/45 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-700/45 pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Inspection mode
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
            Invoice detail
          </h2>

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
          <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2.5 py-1 text-[11px] font-medium text-slate-400">
            {selectedInvoice.actionLabel}
          </span>

          <span className="rounded-full border border-cyan-300/18 bg-cyan-400/[0.055] px-2.5 py-1 text-[11px] font-medium text-cyan-100/85">
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

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-slate-700/45 bg-slate-950/35 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Normalized invoice data
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Final mapped output used for validation and export.
              </p>
            </div>

            <span className="rounded-full border border-slate-700/60 bg-slate-900/50 px-2 py-0.5 text-[10px] text-slate-500">
              row {selectedInvoice.rowIndex}
            </span>
          </div>

          <dl className="mt-4 grid gap-2">
            {Object.entries(selectedInvoice.row).map(([key, value]) => (
              <div
                key={key}
                className="grid gap-2 rounded-xl border border-slate-700/40 bg-slate-900/35 px-3 py-2.5 sm:grid-cols-[140px_1fr]"
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

        <div className="rounded-2xl border border-slate-700/45 bg-slate-950/35 p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Issue explanations
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                What failed, why it matters, and how to fix it.
              </p>
            </div>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                hasIssues
                  ? "border-amber-300/20 bg-amber-300/[0.07] text-amber-100"
                  : "border-emerald-300/18 bg-emerald-400/[0.055] text-emerald-100"
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
                <article
                  key={`${issue.rowIndex}-${issue.field}-${issue.type}`}
                  className="rounded-xl border border-slate-700/45 bg-slate-900/40 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                        issue.severity === "critical"
                          ? "border-rose-400/20 bg-rose-400/[0.07] text-rose-100"
                          : "border-amber-300/20 bg-amber-300/[0.07] text-amber-100"
                      }`}
                    >
                      {issue.severity}
                    </span>

                    <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2 py-0.5 text-[9px] text-slate-500">
                      {issue.field}
                    </span>

                    <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-slate-400">
                      {formatRiskLabel(issue.risk)}
                    </span>

                    <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2 py-0.5 text-[9px] text-slate-500">
                      {formatIssueType(issue.type)}
                    </span>
                  </div>

                  <h4 className="mt-3 text-sm font-semibold text-slate-50">
                    {issue.problem}
                  </h4>

                  <div className="mt-3 grid gap-2">
                    <p className="rounded-lg border border-slate-700/35 bg-slate-950/25 p-3 text-xs leading-5 text-slate-500">
                      <span className="font-medium text-slate-300">Why:</span>{" "}
                      {issue.why}
                    </p>

                    <p className="rounded-lg border border-slate-700/35 bg-slate-950/25 p-3 text-xs leading-5 text-slate-400">
                      <span className="font-medium text-slate-200">Fix:</span>{" "}
                      {issue.fix}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-300/16 bg-emerald-400/[0.045] p-4">
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

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatRiskLabel(risk: string) {
  return risk.replaceAll("_", " ");
}

function formatIssueType(type: string) {
  return type.replaceAll("-", " ");
}
