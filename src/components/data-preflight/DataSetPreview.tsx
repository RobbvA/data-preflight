import { useMemo, useState } from "react";

import type {
  InvoicePreviewItem,
  InvoicePriority,
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
      className={`rounded-2xl border border-[#34373d] ${
        embedded
          ? `p-2.5 ${getEmbeddedToneClasses(tone)}`
          : "bg-[#171a20] p-4 shadow-xl shadow-black/20"
      }`}
    >
      <div className="flex w-full flex-wrap items-start justify-between gap-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[#f7f0f0]">{title}</h3>
            <CountBadge tone={tone} count={items.length} />
          </div>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#8f969f]">
            {description}
          </p>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {isOpen && items.length > 1 && (
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="rounded-full border border-[#34373d] bg-[#252525] px-3 py-1.5 text-[10px] font-medium text-[#d0d4da] outline-none transition hover:border-[#fa5f1a]/45 focus:border-[#fa5f1a]/60"
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
            className="rounded-full border border-[#34373d] bg-[#252525] px-3 py-1.5 text-[10px] font-medium text-[#d0d4da] transition hover:border-[#fa5f1a]/45 hover:bg-[#2f2f2f] hover:text-white"
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isOpen &&
        (items.length === 0 ? (
          <p className="mt-3 rounded-xl border border-[#34373d] bg-[#1c2027] p-3 text-sm text-[#8f969f]">
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
                const criticalIssues = item.issues.filter(
                  (issue) => issue.severity === "critical",
                );
                const warningIssues = item.issues.filter(
                  (issue) => issue.severity === "warning",
                );
                const mainIssue = item.issues[0];

                return (
                  <article
                    key={`${title}-${item.rowIndex}`}
                    onClick={
                      onSelectItem
                        ? () => onSelectItem(item.rowIndex)
                        : undefined
                    }
                    className={`group rounded-xl border p-2 transition ${
                      onSelectItem ? "cursor-pointer" : ""
                    } ${
                      isSelected
                        ? "border-[#fa5f1a]/45 bg-[#fa5f1a]/10 ring-1 ring-[#fa5f1a]/20"
                        : `${getRowToneClasses(item.priority)} hover:border-[#fa5f1a]/35 hover:bg-[#252525]`
                    }`}
                  >
                    <div className="grid gap-2 xl:grid-cols-[1fr_auto] xl:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PriorityBadge priority={item.priority} />

                          <span className="rounded-full bg-[#111318] px-2 py-0.5 text-[10px] font-medium text-[#8f969f]">
                            Row {item.rowIndex}
                          </span>

                          <IssueBadge
                            criticalCount={criticalIssues.length}
                            warningCount={warningIssues.length}
                            totalCount={item.issues.length}
                          />
                        </div>

                        <div className="mt-1.5">
                          <p className="truncate text-sm font-semibold text-[#f7f0f0]">
                            {item.row.invoice_number ||
                              "Missing invoice number"}
                          </p>

                          <p className="truncate text-xs text-[#d0d4da]">
                            {item.row.company || "Missing company"}
                          </p>

                          <p className="truncate text-[11px] text-[#8f969f]">
                            {item.row.email || "Missing email"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        {onViewDetails && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onViewDetails(item.rowIndex);
                            }}
                            className="rounded-full border border-[#34373d] bg-[#111318] px-3 py-1.5 text-[10px] font-medium text-[#d0d4da] transition hover:border-[#fa5f1a]/45 hover:bg-[#fa5f1a]/10 hover:text-white"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-1.5 grid gap-1 md:grid-cols-3">
                      <ReviewDataPoint
                        label="Amount"
                        value={formatMoneyValue(item.row.amount)}
                      />

                      <ReviewDataPoint
                        label="VAT"
                        value={formatMoneyValue(item.row.vat)}
                      />

                      <ReviewDataPoint
                        label="Context"
                        value={`${item.row.status || "unknown"} · ${
                          item.row.country || "—"
                        } / ${item.row.currency || "—"}`}
                      />
                    </div>

                    {mainIssue && (
                      <MainIssueInline
                        issue={mainIssue}
                        selected={isSelected}
                      />
                    )}

                    {isSelected && (
                      <div className="mt-1.5 rounded-lg border border-[#34373d] bg-[#111318] p-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fa5f1a]">
                              Review action
                            </p>

                            <p className="mt-0.5 text-sm font-medium text-[#f7f0f0]">
                              {item.actionLabel}
                            </p>
                          </div>

                          <span className="rounded-full border border-[#fa5f1a]/25 bg-[#fa5f1a]/10 px-2 py-0.5 text-[10px] font-medium text-[#f7f0f0]">
                            {item.priorityScore} score
                          </span>
                        </div>

                        {item.issues.length > 0 && (
                          <div className="mt-2 grid gap-1.5">
                            {item.issues.slice(0, 3).map((issue, index) => (
                              <IssueSummaryLine
                                key={`${issue.field}-${issue.type}-${index}`}
                                issue={issue}
                              />
                            ))}

                            {item.issues.length > 3 && (
                              <p className="text-xs text-[#8f969f]">
                                +{item.issues.length - 3} more issue
                                {item.issues.length - 3 === 1 ? "" : "s"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
    </section>
  );
}

function ReviewDataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#111318] px-2 py-1.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8f969f]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-medium text-[#d0d4da]">
        {value}
      </p>
    </div>
  );
}

function MainIssueInline({
  issue,
  selected,
}: {
  issue: InvoicePreviewItem["issues"][number];
  selected: boolean;
}) {
  const isCritical = issue.severity === "critical";

  return (
    <div
      className={`mt-1 rounded-lg border px-2 py-1 text-xs ${
        isCritical
          ? "border-[#fa5f1a]/30 bg-[#fa5f1a]/10"
          : "border-[#fa5f1a]/18 bg-[#fa5f1a]/6"
      }`}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isCritical ? "bg-[#fa5f1a]" : "bg-[#fa5f1a]/70"
          }`}
        />

        <span className="font-semibold text-[#f7f0f0]">{issue.problem}</span>

        {selected && (
          <>
            <span className="text-[#8f969f]">·</span>

            <span className="text-[#9ca3af]">
              Fix: <span className="text-[#d0d4da]">{issue.fix}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function IssueSummaryLine({
  issue,
}: {
  issue: InvoicePreviewItem["issues"][number];
}) {
  const isCritical = issue.severity === "critical";

  return (
    <div className="grid gap-2 rounded-lg bg-[#1c2027] px-2 py-1.5 sm:grid-cols-[105px_1fr]">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
            isCritical
              ? "border border-[#fa5f1a]/30 bg-[#fa5f1a]/10 text-[#f7f0f0]"
              : "border border-white/10 bg-white/[0.04] text-[#d0d4da]"
          }`}
        >
          {issue.severity}
        </span>

        <span className="text-[10px] text-[#8f969f]">{issue.field}</span>
      </div>

      <p className="text-xs leading-5 text-[#d0d4da]">
        <span className="text-[#f7f0f0]">{issue.problem}</span>{" "}
        <span className="text-[#8f969f]">·</span> {issue.fix}
      </p>
    </div>
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
    danger: "border border-[#fa5f1a]/35 bg-[#fa5f1a]/10 text-[#f7f0f0]",
    warning: "border border-[#fa5f1a]/22 bg-[#fa5f1a]/8 text-[#f7f0f0]",
    neutral: "border border-white/10 bg-white/[0.04] text-[#f7f0f0]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${toneClasses[tone]}`}
    >
      {count} row{count === 1 ? "" : "s"}
    </span>
  );
}

function getEmbeddedToneClasses(tone: "neutral" | "danger" | "warning") {
  if (tone === "danger") {
    return "bg-[#171a20]";
  }

  if (tone === "warning") {
    return "bg-[#171a20]";
  }

  return "bg-[#171a20]";
}

function getRowToneClasses(priority: InvoicePriority) {
  if (priority === "critical" || priority === "high") {
    return "border-[#fa5f1a]/30 bg-[#252525]";
  }

  if (priority === "medium" || priority === "low") {
    return "border-[#34373d] bg-[#252525]";
  }

  return "border-[#34373d] bg-[#252525]";
}

function getStatusPriority(status: string | undefined) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  return statusPriority[normalizedStatus] ?? statusPriority.unknown;
}

function PriorityBadge({ priority }: { priority: InvoicePriority }) {
  const priorityClasses: Record<InvoicePriority, string> = {
    critical: "border border-[#fa5f1a]/35 bg-[#fa5f1a]/12 text-[#f7f0f0]",
    high: "border border-[#fa5f1a]/25 bg-[#fa5f1a]/10 text-[#f7f0f0]",
    medium: "border border-white/10 bg-white/[0.04] text-[#d0d4da]",
    low: "border border-white/10 bg-white/[0.04] text-[#d0d4da]",
    clear: "border border-white/10 bg-white/[0.04] text-[#d0d4da]",
  };

  const labels: Record<InvoicePriority, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    clear: "Clear",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityClasses[priority]}`}
    >
      {labels[priority]}
    </span>
  );
}

function IssueBadge({
  criticalCount,
  warningCount,
  totalCount,
}: {
  criticalCount: number;
  warningCount: number;
  totalCount: number;
}) {
  if (totalCount === 0) {
    return (
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[#d0d4da]">
        Ready
      </span>
    );
  }

  if (criticalCount > 0) {
    return (
      <span className="rounded-full border border-[#fa5f1a]/30 bg-[#fa5f1a]/10 px-2 py-0.5 text-[10px] font-medium text-[#f7f0f0]">
        {criticalCount} critical
        {totalCount > criticalCount ? ` · ${totalCount}` : ""}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[#d0d4da]">
      {warningCount} warning{warningCount === 1 ? "" : "s"}
    </span>
  );
}

function formatMoneyValue(value: string | undefined) {
  if (!value) return "—";
  return value;
}
