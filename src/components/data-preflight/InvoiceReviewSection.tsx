import { useMemo, useState } from "react";

import {
  ReviewStatusControls,
  ReviewStatusSummary,
} from "@/components/data-preflight/ReviewStatusControls";
import { DataSetPreview } from "@/components/data-preflight/DataSetPreview";
import type { InvoicePreviewItem } from "@/components/data-preflight/types";

type InvoiceReviewSectionProps = {
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

  const [internalTab, setInternalTab] = useState<ReviewTab | null>(null);
  const activeTab = controlledTab ?? internalTab ?? defaultTab;

  function selectTab(tab: ReviewTab) {
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

  return (
    <section
      id="invoice-review-workspace"
      className="rounded-[1.5rem] border border-white/10 bg-[var(--surface-base)] p-4 shadow-xl shadow-black/20"
    >
      <div className="border-b border-white/10 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-accent)]">
          Step 2 · Review
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <h2 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
            Invoice results
          </h2>

          <ReviewStatusSummary counts={reviewCounts} />
        </div>
      </div>

      {totalReviewItems > 0 ? (
        <>
          <ReviewStatusControls
            counts={reviewCounts}
            activeCategory={activeTab === "warning" ? "review" : activeTab}
            onCategoryChange={(category) =>
              selectTab(category === "review" ? "warning" : category)
            }
          />

          <div className="mt-3">
            <DataSetPreview
              title={activeTabConfig.title}
              description={activeTabConfig.description}
              items={activeTabConfig.items}
              emptyMessage={activeTabConfig.emptyMessage}
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