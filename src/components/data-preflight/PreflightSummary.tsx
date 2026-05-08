import { SummaryCard } from "@/components/data-preflight/SummaryCard";

type PreflightSummaryProps = {
  totalInvoices: number;
  cleanCount: number;
  blockedCount: number;
  criticalCount: number;
  warningCount: number;
};

export function PreflightSummary({
  totalInvoices,
  cleanCount,
  blockedCount,
  criticalCount,
  warningCount,
}: PreflightSummaryProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300/70">
          Dataset overview
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          Preflight summary
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          A quick operational view of the uploaded invoice dataset.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Total invoices" value={totalInvoices} />
        <SummaryCard label="Ready for import" value={cleanCount} />
        <SummaryCard label="Blocked invoices" value={blockedCount} />
        <SummaryCard label="Critical issues" value={criticalCount} />
        <SummaryCard label="Warnings" value={warningCount} />
      </div>
    </section>
  );
}