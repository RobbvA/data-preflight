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
      className={`rounded-2xl backdrop-blur ${
        embedded
          ? `p-3 ${getEmbeddedToneClasses(tone)}`
          : "bg-slate-950/20 p-5 shadow-xl"
      }`}
    >
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
            <CountBadge tone={tone} count={items.length} />
          </div>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            {description}
          </p>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {isOpen && items.length > 1 && (
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="rounded-full border border-slate-700/50 bg-slate-950/40 px-3 py-1.5 text-[10px] font-medium text-slate-400 outline-none transition hover:border-slate-500 focus:border-cyan-300/40"
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
            className="rounded-full bg-slate-950/30 px-3 py-1.5 text-[10px] font-medium text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-200"
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isOpen &&
        (items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-slate-700/35 bg-slate-950/25 p-4 text-sm text-slate-500">
            {emptyMessage}
          </p>
        ) : (
          <div
            className={`mt-4 overflow-y-auto pr-1 ${
              compact ? "max-h-[420px]" : "max-h-[620px]"
            }`}
          >
            <div className="space-y-2">
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
                    className={`group rounded-2xl border p-3 transition ${
                      onSelectItem ? "cursor-pointer" : ""
                    } ${
                      isSelected
                        ? "border-cyan-300/40 bg-cyan-300/[0.09] ring-1 ring-cyan-300/20"
                        : `${getRowToneClasses(item.priority)} hover:border-slate-600/55 hover:bg-slate-900/55`
                    }`}
                  >
                    <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <PriorityBadge priority={item.priority} />

                          <span className="rounded-full bg-slate-950/30 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Row {item.rowIndex}
                          </span>

                          <IssueBadge
                            criticalCount={criticalIssues.length}
                            warningCount={warningIssues.length}
                            totalCount={item.issues.length}
                          />
                        </div>

                        <div className="mt-2">
                          <p className="truncate text-base font-semibold text-slate-50">
                            {item.row.invoice_number ||
                              "Missing invoice number"}
                          </p>

                          <p className="mt-0.5 truncate text-sm text-slate-400">
                            {item.row.company || "Missing company"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-600">
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
                            className="rounded-full bg-slate-950/35 px-3 py-1.5 text-[10px] font-medium text-slate-400 transition hover:bg-cyan-300/[0.08] hover:text-cyan-100"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-3">
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
                      <div className="mt-2 rounded-lg border border-slate-700/35 bg-slate-950/25 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/55">
                              Review action
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-100">
                              {item.actionLabel}
                            </p>
                          </div>

                          <span className="rounded-full bg-cyan-400/[0.06] px-2 py-0.5 text-[10px] font-medium text-cyan-100/80">
                            {item.priorityScore} score
                          </span>
                        </div>

                        {item.issues.length > 0 && (
                          <div className="mt-3 grid gap-2">
                            {item.issues.slice(0, 3).map((issue, index) => (
                              <IssueSummaryLine
                                key={`${issue.field}-${issue.type}-${index}`}
                                issue={issue}
                              />
                            ))}

                            {item.issues.length > 3 && (
                              <p className="text-xs text-slate-600">
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
    <div className="rounded-lg bg-slate-950/22 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-700">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-medium text-slate-300">
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
      className={`mt-2 rounded-lg border px-3 py-1.5 text-xs ${
        isCritical
          ? "border-rose-400/12 bg-rose-400/[0.06]"
          : "border-amber-300/12 bg-amber-300/[0.06]"
      }`}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isCritical ? "bg-rose-300" : "bg-amber-300"
          }`}
        />

        <span
          className={`font-semibold ${
            isCritical ? "text-rose-100" : "text-amber-100"
          }`}
        >
          {issue.problem}
        </span>

        {selected && (
          <>
            <span className="text-slate-700">·</span>

            <span className="text-slate-500">
              Fix: <span className="text-slate-400">{issue.fix}</span>
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
    <div className="grid gap-2 rounded-lg bg-slate-900/35 px-3 py-2 sm:grid-cols-[120px_1fr]">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
            isCritical
              ? "bg-rose-400/[0.08] text-rose-100"
              : "bg-amber-300/[0.08] text-amber-100"
          }`}
        >
          {issue.severity}
        </span>

        <span className="text-[10px] text-slate-600">{issue.field}</span>
      </div>

      <p className="text-xs leading-5 text-slate-400">
        <span className="text-slate-200">{issue.problem}</span>{" "}
        <span className="text-slate-600">·</span> {issue.fix}
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
    danger: "bg-rose-400/[0.08] text-rose-100",
    warning: "bg-amber-300/[0.08] text-amber-100",
    neutral: "bg-emerald-400/[0.055] text-emerald-100",
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
    return "bg-rose-400/[0.035]";
  }

  if (tone === "warning") {
    return "bg-amber-300/[0.035]";
  }

  return "bg-emerald-400/[0.025]";
}

function getRowToneClasses(priority: InvoicePriority) {
  if (priority === "critical" || priority === "high") {
    return "border-rose-400/18 bg-rose-400/[0.025]";
  }

  if (priority === "medium" || priority === "low") {
    return "border-amber-300/18 bg-amber-300/[0.022]";
  }

  return "border-emerald-300/14 bg-emerald-400/[0.018]";
}

function getStatusPriority(status: string | undefined) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  return statusPriority[normalizedStatus] ?? statusPriority.unknown;
}

function PriorityBadge({ priority }: { priority: InvoicePriority }) {
  const priorityClasses: Record<InvoicePriority, string> = {
    critical: "bg-rose-500/20 text-rose-50 ring-1 ring-rose-400/30",
    high: "bg-rose-300/[0.08] text-rose-100",
    medium: "bg-amber-300/[0.09] text-amber-50",
    low: "bg-amber-300/[0.06] text-amber-100",
    clear: "bg-emerald-400/[0.04] text-emerald-200",
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
      <span className="rounded-full bg-emerald-400/[0.065] px-2 py-0.5 text-[10px] font-medium text-emerald-100">
        Ready
      </span>
    );
  }

  if (criticalCount > 0) {
    return (
      <span className="rounded-full bg-rose-400/[0.09] px-2 py-0.5 text-[10px] font-medium text-rose-100">
        {criticalCount} critical
        {totalCount > criticalCount ? ` · ${totalCount}` : ""}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-300/[0.09] px-2 py-0.5 text-[10px] font-medium text-amber-100">
      {warningCount} warning{warningCount === 1 ? "" : "s"}
    </span>
  );
}

function formatMoneyValue(value: string | undefined) {
  if (!value) return "—";
  return value;
}
