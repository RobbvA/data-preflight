import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";

import { DataSetPreview } from "@/components/data-preflight/DataSetPreview";
import type { InvoicePreviewItem } from "@/components/data-preflight/types";

type InvoiceReviewSectionProps = {
  showOnlyBlocked: boolean;
  cleanInvoiceItems: InvoicePreviewItem[];
  warningInvoiceItems: InvoicePreviewItem[];
  blockedInvoiceItems: InvoicePreviewItem[];
  criticalCount: number;
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

type ReviewTab = "blocked" | "warning" | "ready";

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
  const defaultTab: ReviewTab =
    blockedInvoiceItems.length > 0
      ? "blocked"
      : warningInvoiceItems.length > 0
        ? "warning"
        : "ready";

  const [activeTab, setActiveTab] = useState<ReviewTab>(defaultTab);

  const visibleActiveTab =
    activeTab === "blocked" && blockedInvoiceItems.length === 0
      ? defaultTab
      : activeTab === "warning" && warningInvoiceItems.length === 0
        ? defaultTab
        : activeTab;

  const activeTabConfig = useMemo(() => {
    if (visibleActiveTab === "blocked") {
      return {
        title: "Blocked invoices",
        description:
          "Critical rows that are excluded from clean export until fixed.",
        items: blockedInvoiceItems,
        emptyMessage: "No blocked invoices.",
        isOpen: isBlockedOpen,
        onToggle: onToggleBlockedOpen,
        tone: "danger" as const,
        compact: false,
      };
    }

    if (visibleActiveTab === "warning") {
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
      title: "Import-ready",
      description:
        "Rows that passed the current mapping and validation checks.",
      items: cleanInvoiceItems,
      emptyMessage: "No import-ready invoices yet.",
      isOpen: isCleanOpen,
      onToggle: onToggleCleanOpen,
      tone: "neutral" as const,
      compact: true,
    };
  }, [
    visibleActiveTab,
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

  const reviewStatus = getReviewStatus({
    blockedCount: blockedInvoiceItems.length,
    warningCount: warningInvoiceItems.length,
    cleanCount: cleanInvoiceItems.length,
  });

  return (
    <section
      id="invoice-review-workspace"
      className="rounded-[1.5rem] border border-slate-700/40 bg-slate-900/55 p-4 shadow-xl shadow-black/20 backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-700/40 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Review workspace
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <h2 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-slate-50">
              Invoice review
            </h2>

            <StatusPill tone={reviewStatus.tone}>
              {reviewStatus.label}
            </StatusPill>
          </div>

          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-400">
            Review the most important category first. Fix blocked invoices,
            check warnings, then export clean rows.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleBlockedFilter}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            showOnlyBlocked
              ? "border-rose-400/25 bg-rose-400/[0.08] text-rose-100"
              : "border-slate-700/70 bg-slate-950/30 text-slate-400 hover:border-slate-500/70 hover:bg-slate-800/70 hover:text-slate-100"
          }`}
        >
          {showOnlyBlocked ? "Showing blocked only" : "Show only blocked"}
        </button>
      </div>

      {totalReviewItems > 0 ? (
        <>
          <div className="mt-3 grid gap-2 rounded-2xl border border-slate-700/40 bg-slate-950/25 p-2 sm:grid-cols-3">
            <ReviewTabButton
              label="Blocked"
              description="Fix first"
              count={blockedInvoiceItems.length}
              active={visibleActiveTab === "blocked"}
              tone="danger"
              icon={<AlertTriangle className="h-4 w-4" />}
              onClick={() => setActiveTab("blocked")}
            />

            <ReviewTabButton
              label="Needs Review"
              description="Check before export"
              count={warningInvoiceItems.length}
              active={visibleActiveTab === "warning"}
              tone="warning"
              icon={<Search className="h-4 w-4" />}
              onClick={() => setActiveTab("warning")}
            />

            <ReviewTabButton
              label="Ready"
              description="Clean output"
              count={cleanInvoiceItems.length}
              active={visibleActiveTab === "ready"}
              tone="success"
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={() => setActiveTab("ready")}
            />
          </div>

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
        <div className="mt-3 rounded-2xl border border-slate-700/35 bg-slate-950/25 p-4">
          <p className="text-sm font-medium text-slate-300">
            No invoices ready for review.
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Upload and map invoice data to start the review workflow.
          </p>
        </div>
      )}
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

function ReviewTabButton({
  label,
  description,
  count,
  active,
  tone,
  icon,
  onClick,
}: {
  label: string;
  description: string;
  count: number;
  active: boolean;
  tone: "danger" | "warning" | "success";
  icon: ReactNode;
  onClick: () => void;
}) {
  const activeToneClasses = {
    danger: "border-rose-400/28 bg-rose-400/[0.1] text-rose-50",
    warning: "border-amber-300/28 bg-amber-300/[0.1] text-amber-50",
    success: "border-emerald-300/24 bg-emerald-400/[0.075] text-emerald-50",
  };

  const countToneClasses = {
    danger: "text-rose-100",
    warning: "text-amber-100",
    success: "text-emerald-100",
  };

  const iconToneClasses = {
    danger: "text-rose-200/75",
    warning: "text-amber-200/75",
    success: "text-emerald-200/75",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-left transition ${
        active
          ? activeToneClasses[tone]
          : "border-transparent bg-transparent text-slate-500 hover:border-slate-700/50 hover:bg-slate-900/50 hover:text-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={active ? "" : iconToneClasses[tone]}>{icon}</span>
            <p className="text-sm font-semibold leading-none">{label}</p>
          </div>

          <p className="mt-1.5 text-xs leading-none opacity-75">
            {description}
          </p>
        </div>

        <p
          className={`text-xl font-semibold leading-none tracking-tight ${
            active ? "" : countToneClasses[tone]
          }`}
        >
          {count}
        </p>
      </div>
    </button>
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
    warning: "border-amber-300/22 bg-amber-300/[0.08] text-amber-100",
    danger: "border-rose-400/22 bg-rose-400/[0.08] text-rose-100",
    success: "border-emerald-300/20 bg-emerald-400/[0.065] text-emerald-100",
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
