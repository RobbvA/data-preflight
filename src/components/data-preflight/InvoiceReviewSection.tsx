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

  const totalReviewItems =
    blockedInvoiceItems.length +
    warningInvoiceItems.length +
    cleanInvoiceItems.length;

  const reviewStatus = getReviewStatus({
    blockedCount: blockedInvoiceItems.length,
    warningCount: warningInvoiceItems.length,
    cleanCount: cleanInvoiceItems.length,
  });

  return (
    <section
      id="invoice-review-workspace"
      className="rounded-[1.75rem] border border-slate-700/45 bg-slate-900/45 p-5 shadow-xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-700/45 pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Review workspace
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
              Invoice review
            </h2>

            <StatusPill tone={reviewStatus.tone}>
              {reviewStatus.label}
            </StatusPill>
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Review invoices by business risk. Blocked rows are excluded from
            clean export; warning rows can export, but should be reviewed first.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ReviewMetric
            label="Blocked"
            value={blockedInvoiceItems.length}
            tone="danger"
          />

          <ReviewMetric
            label="Needs review"
            value={warningInvoiceItems.length}
            tone="warning"
          />

          <ReviewMetric
            label="Ready"
            value={cleanInvoiceItems.length}
            tone="success"
          />

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
      </div>

      {totalReviewItems > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-700/45 bg-slate-950/25 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Review path
          </p>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <ReviewStep
              title="1. Fix blocked"
              description="Critical rows are excluded from clean export until fixed."
              active={blockedInvoiceItems.length > 0}
              tone="danger"
            />

            <ReviewStep
              title="2. Check warnings"
              description="Warning rows can export, but may still carry operational risk."
              active={
                blockedInvoiceItems.length === 0 &&
                warningInvoiceItems.length > 0
              }
              tone="warning"
            />

            <ReviewStep
              title="3. Export ready"
              description="Clean rows passed current mapping and validation checks."
              active={
                blockedInvoiceItems.length === 0 &&
                warningInvoiceItems.length === 0 &&
                cleanInvoiceItems.length > 0
              }
              tone="success"
            />
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <DataSetPreview
          title="Blocked invoices"
          description="These rows contain critical issues and are excluded from clean export."
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
              : "These rows can export, but should be checked before import."
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
              : "Rows that passed the current mapping and validation checks."
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

function getReviewStatus({
  blockedCount,
  warningCount,
  cleanCount,
}: {
  blockedCount: number;
  warningCount: number;
  cleanCount: number;
}) {
  if (blockedCount > 0) {
    return {
      label: "Fix blocked first",
      tone: "danger" as const,
    };
  }

  if (warningCount > 0) {
    return {
      label: "Review warnings",
      tone: "warning" as const,
    };
  }

  if (cleanCount > 0) {
    return {
      label: "Ready for export",
      tone: "success" as const,
    };
  }

  return {
    label: "Waiting for invoices",
    tone: "neutral" as const,
  };
}

function ReviewMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "success";
}) {
  const toneClasses = {
    danger: "text-rose-100",
    warning: "text-amber-100",
    success: "text-emerald-100",
  };

  return (
    <div className="rounded-2xl border border-slate-700/45 bg-slate-950/30 px-3 py-2">
      <p className="text-[10px] text-slate-600">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${toneClasses[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function ReviewStep({
  title,
  description,
  active,
  tone,
}: {
  title: string;
  description: string;
  active: boolean;
  tone: "danger" | "warning" | "success";
}) {
  const activeToneClasses = {
    danger: "border-rose-400/20 bg-rose-400/[0.055]",
    warning: "border-amber-300/20 bg-amber-300/[0.055]",
    success: "border-emerald-300/18 bg-emerald-400/[0.045]",
  };

  return (
    <div
      className={`rounded-2xl border p-3 ${
        active ? activeToneClasses[tone] : "border-slate-700/35 bg-slate-950/20"
      }`}
    >
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "warning" | "danger" | "success" | "neutral";
  children: React.ReactNode;
}) {
  const toneClasses = {
    warning: "border-amber-300/20 bg-amber-300/[0.07] text-amber-100",
    danger: "border-rose-400/20 bg-rose-400/[0.07] text-rose-100",
    success: "border-emerald-300/18 bg-emerald-400/[0.055] text-emerald-100",
    neutral: "border-slate-500/30 bg-slate-700/25 text-slate-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
