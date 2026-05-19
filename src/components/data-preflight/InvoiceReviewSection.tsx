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
  onToggleCleanOpen,
  onToggleWarningOpen,
  onToggleBlockedOpen,
}: InvoiceReviewSectionProps) {
  const visibleWarningInvoiceItems = showOnlyBlocked ? [] : warningInvoiceItems;
  const visibleCleanInvoiceItems = showOnlyBlocked ? [] : cleanInvoiceItems;

  return (
    <section className="rounded-2xl border border-violet-300/18 bg-violet-400/[0.055] p-4 shadow-xl shadow-violet-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-100/65">
            Review workspace
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
            Invoice review
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
            Priority-ranked review queue for blocked invoices, warning-only
            invoices, and import-ready rows.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBlockedFilter}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            showOnlyBlocked
              ? "border-red-300/25 bg-red-400/[0.08] text-red-100/90"
              : "border-white/12 bg-white/[0.055] text-slate-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
          }`}
        >
          {showOnlyBlocked ? "Showing blocked only" : "Show only blocked"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <DataSetPreview
          title="Blocked invoices"
          description="Rows with critical issues. Sorted by operational priority."
          items={blockedInvoiceItems}
          emptyMessage="No blocked invoices."
          selectedRowIndex={selectedRowIndex}
          onSelectItem={onSelectInvoice}
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
              : "Warning-only rows. Click a row to inspect normalized data and explanations."
          }
          items={visibleWarningInvoiceItems}
          emptyMessage={
            showOnlyBlocked
              ? "Warning-only invoices are hidden in blocked-only mode."
              : "No warning-only invoices."
          }
          selectedRowIndex={selectedRowIndex}
          onSelectItem={onSelectInvoice}
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
              : "Rows without detected issues. Click a row to inspect normalized output."
          }
          items={visibleCleanInvoiceItems}
          emptyMessage={
            showOnlyBlocked
              ? "Import-ready invoices are hidden in blocked-only mode."
              : "No import-ready invoices yet."
          }
          selectedRowIndex={selectedRowIndex}
          onSelectItem={onSelectInvoice}
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
