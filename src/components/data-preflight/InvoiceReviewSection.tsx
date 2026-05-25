import { DataSetPreview } from "@/components/data-preflight/DataSetPreview";
import type { InvoicePreviewItem } from "@/components/data-preflight/types";

type InvoiceReviewSectionProps = {
  showOnlyBlocked: boolean;
  cleanInvoiceItems: InvoicePreviewItem[];
  warningInvoiceItems: InvoicePreviewItem[];
  blockedInvoiceItems: InvoicePreviewItem[];
  selectedRowIndex: number | null;
  isCleanOpen: boolean;
  isWarningOpen: boolean;
  isBlockedOpen: boolean;
  onToggleBlockedFilter: () => void;
  onSelectInvoice: (rowIndex: number) => void;
  onViewInvoiceDetails: (rowIndex: number) => void;
  onToggleCleanOpen: () => void;
  onToggleWarningOpen: () => void;
  onToggleBlockedOpen: () => void;
};

export function InvoiceReviewSection({
  showOnlyBlocked,
  cleanInvoiceItems,
  warningInvoiceItems,
  blockedInvoiceItems,
  selectedRowIndex,
  isCleanOpen,
  isWarningOpen,
  isBlockedOpen,
  onToggleBlockedFilter,
  onSelectInvoice,
  onViewInvoiceDetails,
  onToggleCleanOpen,
  onToggleWarningOpen,
  onToggleBlockedOpen,
}: InvoiceReviewSectionProps) {
  const visibleWarningInvoiceItems = showOnlyBlocked ? [] : warningInvoiceItems;
  const visibleCleanInvoiceItems = showOnlyBlocked ? [] : cleanInvoiceItems;

  return (
    <section className="rounded-[1.75rem] border border-slate-700/45 bg-slate-900/45 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-700/45 pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Review workspace
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
            Invoice review
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Review invoices by business risk. Blocked rows need fixes first;
            warning rows can import, but should be checked before export.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBlockedFilter}
          className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${
            showOnlyBlocked
              ? "border-rose-400/25 bg-rose-400/[0.08] text-rose-100"
              : "border-slate-700/70 bg-slate-950/30 text-slate-400 hover:border-slate-500/70 hover:bg-slate-800/70 hover:text-slate-100"
          }`}
        >
          {showOnlyBlocked ? "Showing blocked only" : "Show only blocked"}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <DataSetPreview
          title="Blocked invoices"
          description="These rows will fail or corrupt an import unless fixed."
          items={blockedInvoiceItems}
          emptyMessage="No blocked invoices."
          selectedRowIndex={selectedRowIndex}
          onSelectItem={onSelectInvoice}
          onViewDetails={onViewInvoiceDetails}
          isOpen={isBlockedOpen}
          onToggle={onToggleBlockedOpen}
          tone="danger"
          embedded
        />

        <DataSetPreview
          title="Needs review"
          description={
            showOnlyBlocked
              ? "Hidden while blocked-only mode is active."
              : "These rows can import, but should be checked first."
          }
          items={visibleWarningInvoiceItems}
          emptyMessage={
            showOnlyBlocked
              ? "Warning-only invoices are hidden in blocked-only mode."
              : "No warning-only invoices."
          }
          selectedRowIndex={selectedRowIndex}
          onSelectItem={onSelectInvoice}
          onViewDetails={onViewInvoiceDetails}
          isOpen={isWarningOpen}
          onToggle={onToggleWarningOpen}
          tone="warning"
          embedded
        />

        <DataSetPreview
          title="Import-ready"
          description={
            showOnlyBlocked
              ? "Hidden while blocked-only mode is active."
              : "Clean rows that passed the current mapping and validation checks."
          }
          items={visibleCleanInvoiceItems}
          emptyMessage={
            showOnlyBlocked
              ? "Import-ready invoices are hidden in blocked-only mode."
              : "No import-ready invoices yet."
          }
          selectedRowIndex={selectedRowIndex}
          onSelectItem={onSelectInvoice}
          onViewDetails={onViewInvoiceDetails}
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
