import { DataSetPreview } from "@/components/data-preflight/DataSetPreview";
import type { InvoicePreviewItem } from "@/components/data-preflight/types";

type InvoiceReviewSectionProps = {
  showOnlyBlocked: boolean;
  cleanInvoiceItems: InvoicePreviewItem[];
  warningInvoiceItems: InvoicePreviewItem[];
  blockedInvoiceItems: InvoicePreviewItem[];
  selectedBlockedRowIndex: number | null;
  isCleanOpen: boolean;
  isWarningOpen: boolean;
  isBlockedOpen: boolean;
  onToggleBlockedFilter: () => void;
  onSelectBlockedInvoice: (rowIndex: number) => void;
  onToggleCleanOpen: () => void;
  onToggleWarningOpen: () => void;
  onToggleBlockedOpen: () => void;
};

export function InvoiceReviewSection({
  showOnlyBlocked,
  cleanInvoiceItems,
  warningInvoiceItems,
  blockedInvoiceItems,
  selectedBlockedRowIndex,
  isCleanOpen,
  isWarningOpen,
  isBlockedOpen,
  onToggleBlockedFilter,
  onSelectBlockedInvoice,
  onToggleCleanOpen,
  onToggleWarningOpen,
  onToggleBlockedOpen,
}: InvoiceReviewSectionProps) {
  const visibleWarningInvoiceItems = showOnlyBlocked ? [] : warningInvoiceItems;
  const visibleCleanInvoiceItems = showOnlyBlocked ? [] : cleanInvoiceItems;

  return (
    <section className="rounded-2xl border border-violet-400/[0.14] bg-violet-500/[0.035] p-4 shadow-xl shadow-slate-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200/60">
            Review workspace
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Invoice review
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            Separate blocked invoices, warning-only invoices, and import-ready
            invoices before export.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBlockedFilter}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            showOnlyBlocked
              ? "border-red-400/25 bg-red-400/[0.07] text-red-100/90"
              : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-slate-200"
          }`}
        >
          {showOnlyBlocked ? "Showing blocked only" : "Show only blocked"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <DataSetPreview
          title="Blocked invoices"
          description="Rows with critical issues. These should be fixed before import."
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
          title="Needs review"
          description={
            showOnlyBlocked
              ? "Hidden while blocked-only mode is active."
              : "Rows with warnings only. Import may be possible, but review is recommended."
          }
          items={visibleWarningInvoiceItems}
          emptyMessage={
            showOnlyBlocked
              ? "Warning-only invoices are hidden in blocked-only mode."
              : "No warning-only invoices."
          }
          isOpen={isWarningOpen}
          onToggle={onToggleWarningOpen}
          tone="warning"
          compact
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
