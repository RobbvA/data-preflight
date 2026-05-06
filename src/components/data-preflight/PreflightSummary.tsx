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
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Preflight summary</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Total invoices" value={totalInvoices} />
        <SummaryCard label="Ready for import" value={cleanCount} />
        <SummaryCard label="Blocked invoices" value={blockedCount} />
        <SummaryCard label="Critical issues" value={criticalCount} />
        <SummaryCard label="Warnings" value={warningCount} />
      </div>
    </section>
  );
}