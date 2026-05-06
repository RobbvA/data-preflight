import type { InvoicePreviewItem } from "@/components/data-preflight/types";

type BlockedInvoiceDetailProps = {
  selectedBlockedInvoice: InvoicePreviewItem;
  onClose: () => void;
};

export function BlockedInvoiceDetail({
  selectedBlockedInvoice,
  onClose,
}: BlockedInvoiceDetailProps) {
  return (
    <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Blocked invoice detail</h2>

          <p className="mt-1 text-sm text-red-200">
            Row {selectedBlockedInvoice.rowIndex} has{" "}
            {selectedBlockedInvoice.issues.length} issue
            {selectedBlockedInvoice.issues.length === 1 ? "" : "s"} that should
            be fixed before import.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-sm text-red-200 underline underline-offset-4 hover:text-red-100"
        >
          Close detail
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-red-500/20 bg-slate-950 p-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Invoice data
          </h3>

          <pre className="mt-3 overflow-auto text-xs text-slate-300">
            {JSON.stringify(selectedBlockedInvoice.row, null, 2)}
          </pre>
        </div>

        <div className="space-y-3">
          {selectedBlockedInvoice.issues.map((issue) => (
            <div
              key={`${issue.rowIndex}-${issue.field}-${issue.type}`}
              className="rounded-lg border border-red-500/20 bg-slate-950 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-700 px-2 py-1 text-xs uppercase text-slate-300">
                  {issue.severity}
                </span>

                <span className="text-sm text-slate-400">
                  Field: {issue.field}
                </span>
              </div>

              <h3 className="mt-3 font-semibold">{issue.problem}</h3>

              <p className="mt-2 text-sm text-slate-300">
                <span className="font-medium text-slate-100">Why:</span>{" "}
                {issue.why}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                <span className="font-medium text-slate-100">Fix:</span>{" "}
                {issue.fix}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}