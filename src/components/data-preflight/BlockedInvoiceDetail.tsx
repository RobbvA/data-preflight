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
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-slate-950/18 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
            Inspection mode
          </p>

          <h2 className="mt-1 text-base font-semibold text-white">
            Invoice detail
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Row{" "}
            <span className="font-medium text-slate-100">
              {selectedInvoice.rowIndex}
            </span>{" "}
            has{" "}
            <span className="font-medium text-cyan-100">
              {selectedInvoice.issues.length}
            </span>{" "}
            detected issue
            {selectedInvoice.issues.length === 1 ? "" : "s"}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] font-medium text-slate-300">
            {selectedInvoice.actionLabel}
          </span>

          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/[0.08] px-2 py-0.5 text-[10px] font-medium text-cyan-100/90">
            {selectedInvoice.priorityScore} score
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/12 bg-white/[0.055] px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
          >
            Close detail
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.3fr]">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-100">
              Normalized invoice data
            </h3>

            <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] text-slate-400">
              row {selectedInvoice.rowIndex}
            </span>
          </div>

          <pre className="mt-3 max-h-[360px] overflow-auto rounded-lg bg-[#10182b]/80 p-3 text-[11px] leading-5 text-slate-300">
            {JSON.stringify(selectedInvoice.row, null, 2)}
          </pre>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Issue explanations
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                What failed, why it matters, and how to fix it.
              </p>
            </div>

            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                hasIssues
                  ? "border-yellow-300/20 bg-yellow-400/[0.08] text-yellow-100/90"
                  : "border-emerald-300/18 bg-emerald-400/[0.07] text-emerald-100/85"
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
            <div className="divide-y divide-white/[0.08] rounded-lg border border-white/[0.08] bg-[#10182b]/60">
              {selectedInvoice.issues.map((issue) => (
                <article
                  key={`${issue.rowIndex}-${issue.field}-${issue.type}`}
                  className="grid gap-2 px-3 py-3 md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${
                          issue.severity === "critical"
                            ? "border-red-300/20 bg-red-400/[0.08] text-red-100/90"
                            : "border-yellow-300/20 bg-yellow-400/[0.08] text-yellow-100/90"
                        }`}
                      >
                        {issue.severity}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.035] px-1.5 py-0.5 text-[9px] text-slate-400">
                        {issue.field}
                      </span>

                      <span className="rounded-full border border-cyan-300/14 bg-cyan-400/[0.07] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-cyan-100/85">
                        {formatRiskLabel(issue.risk)}
                      </span>
                    </div>

                    <h4 className="mt-2 text-sm font-semibold text-white">
                      {issue.problem}
                    </h4>

                    <p className="mt-1.5 text-xs leading-5 text-slate-400">
                      <span className="font-medium text-slate-100">Why:</span>{" "}
                      {issue.why}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      <span className="font-medium text-white">Fix:</span>{" "}
                      {issue.fix}
                    </p>
                  </div>

                  <span className="h-fit rounded-full border border-white/10 bg-white/[0.035] px-1.5 py-0.5 text-[9px] text-slate-500">
                    {formatIssueType(issue.type)}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-300/18 bg-emerald-400/[0.055] p-4">
              <p className="text-sm font-medium text-emerald-100">
                No issues detected for this row.
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-300">
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

function formatRiskLabel(risk: string) {
  return risk.replaceAll("_", " ");
}

function formatIssueType(type: string) {
  return type.replaceAll("-", " ");
}
