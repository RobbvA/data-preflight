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
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-100/60">
            Review workspace
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Invoice review
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Review invoices by operational risk. Only the essential fields are
            shown first; expand a row when you need context, fixes, or
            normalized output.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBlockedFilter}
          className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${
            showOnlyBlocked
              ? "border-red-300/25 bg-red-400/[0.08] text-red-100/90"
              : "border-white/12 bg-white/[0.045] text-slate-300 hover:border-white/20 hover:bg-white/[0.075] hover:text-white"
          }`}
        >
          {showOnlyBlocked ? "Showing blocked only" : "Show only blocked"}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <DataSetPreview
          title="Blocked invoices"
          description="Critical rows that must be fixed before import."
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
              : "Warning-only rows that may be importable, but need human review."
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
              : "Rows without detected issues."
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
