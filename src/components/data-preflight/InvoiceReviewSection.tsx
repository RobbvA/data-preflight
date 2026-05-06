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
    <>
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Invoice review</h2>

            <p className="mt-1 text-sm text-slate-400">
              Review clean and blocked invoices before exporting.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleBlockedFilter}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              showOnlyBlocked
                ? "border-red-500/30 bg-red-500/20 text-red-200"
                : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500"
            }`}
          >
            {showOnlyBlocked ? "Showing blocked only" : "Show only blocked"}
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <DataSetPreview
          title="Clean invoices"
          description={
            showOnlyBlocked
              ? "Hidden while blocked-only mode is active."
              : "These rows passed the current validation rules and are ready for export."
          }
          items={visibleCleanInvoiceItems}
          emptyMessage={
            showOnlyBlocked
              ? "Clean invoices are hidden in blocked-only mode."
              : "No clean invoices yet."
          }
          isOpen={isCleanOpen}
          onToggle={onToggleCleanOpen}
        />

        <DataSetPreview
          title="Blocked invoices"
          description="Click a blocked invoice to inspect its issues."
          items={blockedInvoiceItems}
          emptyMessage="No blocked invoices."
          selectedRowIndex={selectedBlockedRowIndex}
          onSelectItem={onSelectBlockedInvoice}
          isOpen={isBlockedOpen}
          onToggle={onToggleBlockedOpen}
        />
      </section>
    </>
  );
}