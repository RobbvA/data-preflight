import { ReviewFilterControls } from "@/components/data-preflight/ReviewFilterControls";
import { EMPTY_REVIEW_FILTERS, filterReviewRows, type ReviewFilters } from "@/lib/reviewFilters";
import type { ParsedRow } from "@/lib/parseCsv";
import { HelpPopover } from "@/components/data-preflight/WorkflowHelp";
import { useMemo, useState } from "react";

import {
  ReviewStatusControls,
} from "@/components/data-preflight/ReviewStatusControls";
import { DataSetPreview } from "@/components/data-preflight/DataSetPreview";
import type { InvoicePreviewItem } from "@/components/data-preflight/types";

type InvoiceReviewSectionProps = {
  sourceRows?: readonly ParsedRow[];
  cleanInvoiceItems: InvoicePreviewItem[];
  warningInvoiceItems: InvoicePreviewItem[];
  blockedInvoiceItems: InvoicePreviewItem[];
  selectedRowIndex: number | null;
  isCleanOpen: boolean;
  isWarningOpen: boolean;
  isBlockedOpen: boolean;
  onSelectInvoice: (rowIndex: number) => void;
  onViewInvoiceDetails: (rowIndex: number) => void;
  onToggleCleanOpen: () => void;
  onToggleWarningOpen: () => void;
  onToggleBlockedOpen: () => void;
  activeTab?: ReviewTab;
  onTabChange?: (tab: ReviewTab) => void;
};

export type ReviewTab = "blocked" | "warning" | "ready";

export function InvoiceReviewSection({
  sourceRows = [],
  cleanInvoiceItems,
  warningInvoiceItems,
  blockedInvoiceItems,
  selectedRowIndex,
  isCleanOpen,
  isWarningOpen,
  isBlockedOpen,
  onSelectInvoice,
  onViewInvoiceDetails,
  onToggleCleanOpen,
  onToggleWarningOpen,
  onToggleBlockedOpen,
  activeTab: controlledTab,
  onTabChange,
}: InvoiceReviewSectionProps) {
  const defaultTab: ReviewTab =
    blockedInvoiceItems.length > 0
      ? "blocked"
      : warningInvoiceItems.length > 0
        ? "warning"
        : "ready";

  const [allOpen, setAllOpen] = useState(true);
  const [filters, setFilters] = useState<ReviewFilters>({ ...EMPTY_REVIEW_FILTERS });
  const [internalTab, setInternalTab] = useState<ReviewTab | null>(null);
  const activeTab = controlledTab ?? internalTab ?? defaultTab;

  function selectTab(tab: ReviewTab) {
    setFilters(current => ({ ...current, allStatuses: false }));
    if (tab === "blocked" && !isBlockedOpen) onToggleBlockedOpen();
    if (tab === "warning" && !isWarningOpen) onToggleWarningOpen();
    if (tab === "ready" && !isCleanOpen) onToggleCleanOpen();

    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  }

  const activeTabConfig = useMemo(() => {
    if (filters.allStatuses) return { title: "All invoices", description: "All source rows, including blocked rows and warnings.", items: [...blockedInvoiceItems, ...warningInvoiceItems, ...cleanInvoiceItems], emptyMessage: "No matching rows. Reset filters to show the original list.", isOpen: allOpen, onToggle: () => setAllOpen(open => !open), tone: "neutral" as const, compact: false };
    if (activeTab === "blocked") {
      return {
        title: "Blocked invoices",
        description:
          "Rows with critical issues are excluded from the export until fixed.",
        items: blockedInvoiceItems,
        emptyMessage: "No blocked invoices.",
        isOpen: isBlockedOpen,
        onToggle: onToggleBlockedOpen,
        tone: "danger" as const,
        compact: false,
      };
    }

    if (activeTab === "warning") {
      return {
        title: "Needs review",
        description:
          "Rows that can export, but should be checked before import.",
        items: warningInvoiceItems,
        emptyMessage: "No warning-only invoices.",
        isOpen: isWarningOpen,
        onToggle: onToggleWarningOpen,
        tone: "warning" as const,
        compact: false,
      };
    }

    return {
      title: "Ready invoices",
      description:
        "Rows that passed the current mapping and validation checks.",
      items: cleanInvoiceItems,
      emptyMessage: "No invoices passed the current checks.",
      isOpen: isCleanOpen,
      onToggle: onToggleCleanOpen,
      tone: "neutral" as const,
      compact: true,
    };
  }, [
    filters.allStatuses,
    allOpen,
    activeTab,
    blockedInvoiceItems,
    warningInvoiceItems,
    cleanInvoiceItems,
    isBlockedOpen,
    isWarningOpen,
    isCleanOpen,
    onToggleBlockedOpen,
    onToggleWarningOpen,
    onToggleCleanOpen,
  ]);

  const totalReviewItems =
    blockedInvoiceItems.length +
    warningInvoiceItems.length +
    cleanInvoiceItems.length;

  const reviewCounts = {
    blocked: blockedInvoiceItems.length,
    needsReview: warningInvoiceItems.length,
    ready: cleanInvoiceItems.length,
  };

  const attachSource = (item: InvoicePreviewItem) => ({ ...item, sourceRow: sourceRows[item.rowIndex - 1] });
  const allItems = [...blockedInvoiceItems, ...warningInvoiceItems, ...cleanInvoiceItems].map(attachSource);
  const filteredItems = filterReviewRows(activeTabConfig.items.map(attachSource), filters);
  return (
    <section data-guide="review"
      id="invoice-review-workspace"
      className="rounded-[1.5rem] border border-white/10 bg-[var(--surface-base)] p-4 shadow-xl shadow-black/20"
    >
      <div className="border-b border-white/10 pb-3">
        <div className="flex items-center gap-2"><h2 className="text-xl font-semibold leading-snug tracking-tight text-[var(--brand-accent)]">
          Step 2 · Review
        </h2><HelpPopover title="Review results">Blocked rows cannot enter the data export. Needs review rows can export with warnings. Open Details for all issues, then correct your source file and upload it again.</HelpPopover></div>
      </div>

      {totalReviewItems > 0 ? (
        <>
          <ReviewStatusControls
            counts={reviewCounts}
            activeCategory={filters.allStatuses ? "all" : activeTab === "warning" ? "review" : activeTab}
            onCategoryChange={(category) =>
              selectTab(category === "review" ? "warning" : category)
            }
          />

          <ReviewFilterControls rows={allItems} value={filters} onChange={setFilters} visible={filteredItems.length} total={activeTabConfig.items.length} issueCount={filteredItems.reduce((sum, item) => sum + item.issues.length, 0)} />
          {filteredItems.length === 0 && <div className="mt-3 text-sm text-[var(--text-secondary)]"><p>No matching rows. Try Search all statuses or reset the filters.</p><button type="button" onClick={() => setFilters({ ...EMPTY_REVIEW_FILTERS })} className="min-h-11 underline">Clear review filters</button></div>}
          <div className="mt-3">
            <DataSetPreview
              title={activeTabConfig.title}
              description={activeTabConfig.description}
              items={filteredItems}
              ordered
              emptyMessage="No rows in this filtered list."
              selectedRowIndex={selectedRowIndex}
              onSelectItem={onSelectInvoice}
              onViewDetails={onViewInvoiceDetails}
              isOpen={activeTabConfig.isOpen}
              onToggle={activeTabConfig.onToggle}
              tone={activeTabConfig.tone}
              compact={activeTabConfig.compact}
              embedded
            />
          </div>
        </>
      ) : (
        <div className="mt-3 rounded-2xl border border-white/10 bg-[var(--surface-raised)] p-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            No invoices ready for review.
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            Upload and map invoice data to start the review workflow.
          </p>
        </div>
      )}
    </section>
  );
}