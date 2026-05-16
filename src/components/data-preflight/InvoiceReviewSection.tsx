import { DataSetPreview } from "@/components/data-preflight/DataSetPreview";
import type { InvoicePreviewItem } from "@/components/data-preflight/types";

type InvoiceReviewSectionProps = {
  showOnlyBlocked: boolean;
  cleanInvoiceItems: InvoicePreviewItem[];
  blockedInvoiceItems: InvoicePreviewItem[];
  selectedBlockedRowIndex: number | null;
  isCleanOpen: boolean;
  isBlockedOpen: boolean;
  onToggleBlockedFilter: () => void;
  onSelectBlockedInvoice: (rowIndex: number) => void;
  onToggleCleanOpen: () => void;
  onToggleBlockedOpen: () => void;
};

export function InvoiceReviewSection({
  showOnlyBlocked,
  cleanInvoiceItems,
  blockedInvoiceItems,
  selectedBlockedRowIndex,
  isCleanOpen,
  isBlockedOpen,
  onToggleBlockedFilter,
  onSelectBlockedInvoice,
  onToggleCleanOpen,
  onToggleBlockedOpen,
}: InvoiceReviewSectionProps) {
  const visibleCleanInvoiceItems = showOnlyBlocked ? [] : cleanInvoiceItems;

  return (
    <section className="rounded-2xl border border-violet-400/[0.14] bg-violet-500/[0.035] p-4 shadow-xl shadow-slate-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200/70">
            Review workspace
          </p>

          <h2 className="mt-1.5 text-lg font-semibold text-white">
            Invoice review
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Inspect blocked invoices first. Clean invoices stay secondary to
            reduce operational noise.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBlockedFilter}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            showOnlyBlocked
              ? "border-red-400/25 bg-red-400/[0.07] text-red-100/90"
              : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          {showOnlyBlocked ? "Showing blocked only" : "Show only blocked"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <DataSetPreview
          title="Blocked invoices"
          description="Rows with critical issues. Click an invoice to inspect the full explanation."
          items={blockedInvoiceItems}
          emptyMessage="No blocked invoices."
          selectedRowIndex={selectedBlockedRowIndex}
          onSelectItem={onSelectBlockedInvoice}
          isOpen={isBlockedOpen}
          onToggle={onToggleBlockedOpen}
          tone="danger"
          embedded
        />

        <DataSetPreview
          title="Clean invoices"
          description={
            showOnlyBlocked
              ? "Hidden while blocked-only mode is active."
              : "Rows that passed validation. Kept collapsed to reduce noise."
          }
          items={visibleCleanInvoiceItems}
          emptyMessage={
            showOnlyBlocked
              ? "Clean invoices are hidden in blocked-only mode."
              : "No clean invoices yet."
          }
          isOpen={isCleanOpen}
          onToggle={onToggleCleanOpen}
          tone="neutral"
          compact
          embedded
        />
      </div>
    </section>
  );
}
