import { useMemo, useState } from "react";

import { ReviewRecord } from "@/components/data-preflight/ReviewRecord";

import type {
  InvoicePreviewItem,
} from "@/components/data-preflight/types";

type DataSetPreviewProps = {
  title: string;
  description: string;
  items: InvoicePreviewItem[];
  emptyMessage: string;
  selectedRowIndex?: number | null;
  onSelectItem?: (rowIndex: number) => void;
  onViewDetails?: (rowIndex: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  tone?: "neutral" | "danger" | "warning";
  compact?: boolean;
  embedded?: boolean;
};

type SortMode = "priority" | "row" | "issues" | "status";

const statusPriority: Record<string, number> = {
  unknown: 0,
  "": 0,
  pending: 1,
  sent: 2,
  ready: 3,
  draft: 4,
  paid: 5,
};

export function DataSetPreview({
  title,
  description,
  items,
  emptyMessage,
  selectedRowIndex,
  onSelectItem,
  onViewDetails,
  isOpen,
  onToggle,
  tone = "neutral",
  compact = false,
  embedded = false,
}: DataSetPreviewProps) {
  const [sortMode, setSortMode] = useState<SortMode>("priority");

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortMode === "priority") return b.priorityScore - a.priorityScore;
      if (sortMode === "issues") return b.issues.length - a.issues.length;

      if (sortMode === "status") {
        const statusA = getStatusPriority(a.row.status);
        const statusB = getStatusPriority(b.row.status);

        if (statusA !== statusB) return statusA - statusB;

        return b.priorityScore - a.priorityScore;
      }

      return a.rowIndex - b.rowIndex;
    });
  }, [items, sortMode]);

  return (
    <section
      className={`rounded-2xl border border-white/10 ${
        embedded
          ? `p-2.5 ${getEmbeddedToneClasses(tone)}`
          : "bg-[var(--surface-base)] p-4 shadow-xl shadow-black/20"
      }`}
    >
      <div className="flex w-full flex-wrap items-start justify-between gap-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {title}
            </h3>

            <CountBadge tone={tone} count={items.length} />
          </div>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-muted)]">
            {description}
          </p>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {isOpen && items.length > 1 && (
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="rounded-full border border-white/10 bg-[var(--surface-raised)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] outline-none transition hover:border-[color:rgba(182,111,58,0.45)] focus:border-[color:rgba(182,111,58,0.6)]"
            >
              <option value="priority">Sort: priority</option>
              <option value="status">Sort: status</option>
              <option value="row">Sort: row</option>
              <option value="issues">Sort: issues</option>
            </select>
          )}

          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-white/10 bg-[var(--surface-raised)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-[color:rgba(182,111,58,0.45)] hover:bg-[var(--surface-base)] hover:text-[var(--text-primary)]"
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isOpen &&
        (items.length === 0 ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-[var(--surface-raised)] p-3 text-sm text-[var(--text-muted)]">
            {emptyMessage}
          </p>
        ) : (
          <div
            className={`mt-2.5 overflow-y-auto pr-1 ${
              compact ? "max-h-[420px]" : "max-h-[620px]"
            }`}
          >
            <div className="space-y-1.5">
              {sortedItems.map((item) => {
                const isSelected = selectedRowIndex === item.rowIndex;
                return (
                  <ReviewRecord
                    key={`${title}-${item.rowIndex}`}
                    title={item.row.invoice_number || "Missing invoice number"}
                    subtitle={item.row.company || "Missing company"}
                    context={[item.row.amount, item.row.currency].filter(Boolean).join(" ")}
                    rowIndex={item.rowIndex}
                    issues={item.issues}
                    expanded={isSelected}
                    onToggle={() => (onViewDetails ?? onSelectItem)?.(item.rowIndex)}
                    detailsNote={item.actionLabel}
                    fields={Object.entries(item.row)
                      .filter(([field]) => field !== "normalized_invoice_key")
                      .map(([field, value]) => ({ label: field.replaceAll("_", " "), value }))}
                  />
                );
              })}
            </div>
          </div>
        ))}
    </section>
  );
}

function CountBadge({
  tone,
  count,
}: {
  tone: "neutral" | "danger" | "warning";
  count: number;
}) {
  const toneClasses = {
    danger:
      "border border-[color:rgba(182,111,58,0.35)] bg-[rgba(182,111,58,0.11)] text-[var(--text-primary)]",
    warning:
      "border border-[color:rgba(182,111,58,0.24)] bg-[rgba(182,111,58,0.08)] text-[var(--text-primary)]",
    neutral:
      "border border-white/10 bg-white/[0.04] text-[var(--text-primary)]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${toneClasses[tone]}`}
    >
      {count} row{count === 1 ? "" : "s"}
    </span>
  );
}

function getEmbeddedToneClasses(_tone: "neutral" | "danger" | "warning") {
  return "bg-[var(--surface-base)]";
}

function getStatusPriority(status: string | undefined) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  return statusPriority[normalizedStatus] ?? statusPriority.unknown;
}
