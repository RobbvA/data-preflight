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
    <section className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-blue-950/20 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300/70">
              Review workspace
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Invoice review
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Focus on blocked invoices first. Clean invoices stay collapsed by
              default.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleBlockedFilter}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              showOnlyBlocked
                ? "border-red-400/30 bg-red-400/10 text-red-100"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {showOnlyBlocked ? "Showing blocked only" : "Show only blocked"}
          </button>
        </div>
      </div>

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
      />
    </section>
  );
}