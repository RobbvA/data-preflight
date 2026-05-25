import { Fragment, useMemo, useState } from "react";

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

  const isDanger = tone === "danger";
  const isWarning = tone === "warning";

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
      className={`rounded-2xl border backdrop-blur ${
        embedded ? "p-4 shadow-none" : "p-5 shadow-xl"
      } ${
        isDanger
          ? "border-rose-400/15 bg-rose-950/[0.13]"
          : isWarning
            ? "border-amber-300/15 bg-amber-950/[0.12]"
            : "border-slate-700/50 bg-slate-950/20"
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

            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                isDanger
                  ? "border-rose-400/20 bg-rose-400/[0.06] text-rose-100/85"
                  : isWarning
                    ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-100/85"
                    : "border-slate-700/70 bg-slate-900/60 text-slate-400"
              }`}
            >
              {items.length} row{items.length === 1 ? "" : "s"}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {isOpen && items.length > 1 && (
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1.5 text-[10px] font-medium text-slate-300 outline-none transition hover:border-slate-500 focus:border-cyan-300/45"
            >
              <option value="priority">Sort: priority</option>
              <option value="status">Sort: payment status</option>
              <option value="row">Sort: CSV row</option>
              <option value="issues">Sort: issue count</option>
            </select>
          )}

          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-slate-700/70 bg-slate-950/40 px-3 py-1.5 text-[10px] font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800/60 hover:text-slate-200"
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isOpen &&
        (items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-slate-700/45 bg-slate-950/35 p-4 text-sm text-slate-500">
            {emptyMessage}
          </p>
        ) : (
          <div
            className={`mt-4 space-y-2 overflow-y-auto pr-1 ${
              compact ? "max-h-[420px]" : "max-h-[680px]"
            }`}
          >
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
                <Fragment key={`${title}-${item.rowIndex}`}>
                  <article
                    onClick={
                      onSelectItem
                        ? () => onSelectItem(item.rowIndex)
                        : undefined
                    }
                    className={`rounded-xl border p-4 transition ${
                      onSelectItem ? "cursor-pointer" : ""
                    } ${
                      isSelected
                        ? "border-cyan-300/25 bg-cyan-300/[0.045]"
                        : "border-slate-700/45 bg-slate-950/35 hover:border-slate-500/55 hover:bg-slate-900/70"
                    }`}
                  >
                    <div className="grid gap-4 lg:grid-cols-[170px_1.15fr_0.85fr_0.95fr_auto] lg:items-center">
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={item.priority} />

                        <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-500">
                          Row {item.rowIndex}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-50">
                          {item.row.invoice_number || "Missing invoice number"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.row.company || "Missing company"} ·{" "}
                          {item.row.email || "Missing email"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
                          Financials
                        </p>

                        <p className="mt-1 truncate text-xs font-medium text-slate-300">
                          {formatMoneyValue(item.row.amount)} · VAT{" "}
                          {formatMoneyValue(item.row.vat)}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
                          Context
                        </p>

                        <p className="mt-1 truncate text-xs font-medium text-slate-300">
                          {item.row.status || "unknown"} ·{" "}
                          {item.row.country || "—"} / {item.row.currency || "—"}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-slate-600">
                          {item.row.invoice_date || "no invoice date"} →{" "}
                          {item.row.due_date || "no due date"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <IssueBadge
                          criticalCount={criticalIssues.length}
                          warningCount={warningIssues.length}
                          totalCount={item.issues.length}
                        />

                        <span className="rounded-full border border-slate-700/60 bg-slate-950/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                          {item.actionLabel}
                        </span>
                      </div>
                    </div>

                    {mainIssue && <MainIssueAlert issue={mainIssue} />}
                  </article>

                  {isSelected && (
                    <div className="rounded-xl border border-cyan-300/[0.14] bg-slate-950/40 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/60">
                            Quick review
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-50">
                            {item.actionLabel}
                          </p>

                          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                            This overview shows what blocks or weakens trust for
                            this invoice. Open full details only when you need
                            normalized data and complete explanations.
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/[0.06] px-2 py-0.5 text-[10px] font-medium text-cyan-100/85">
                            {item.priorityScore} score
                          </span>

                          {onViewDetails && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onViewDetails(item.rowIndex);
                              }}
                              className="rounded-full border border-cyan-300/25 bg-cyan-300/[0.09] px-3 py-1.5 text-[10px] font-semibold text-cyan-100 transition hover:border-cyan-200/45 hover:bg-cyan-300/[0.14] hover:text-white"
                            >
                              View full details
                            </button>
                          )}
                        </div>
                      </div>

                      {item.issues.length > 0 ? (
                        <div className="mt-4 grid gap-2">
                          {item.issues.map((issue, index) => (
                            <div
                              key={`${issue.field}-${issue.type}-${index}`}
                              className="rounded-lg border border-slate-700/45 bg-slate-900/45 p-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                                    issue.severity === "critical"
                                      ? "border-rose-400/20 bg-rose-400/[0.07] text-rose-100"
                                      : "border-amber-300/20 bg-amber-300/[0.07] text-amber-100"
                                  }`}
                                >
                                  {issue.severity}
                                </span>

                                <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2 py-0.5 text-[9px] text-slate-500">
                                  {issue.field}
                                </span>

                                <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-slate-400">
                                  {formatRiskLabel(issue.risk)}
                                </span>
                              </div>

                              <p className="mt-2 text-sm font-medium text-slate-50">
                                {issue.problem}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                <span className="font-medium text-slate-200">
                                  Fix:
                                </span>{" "}
                                {issue.fix}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-lg border border-emerald-300/16 bg-emerald-400/[0.045] p-3">
                          <p className="text-xs font-medium text-emerald-100">
                            No issues detected. This row is import-ready based
                            on the current mapping and validation rules.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        ))}
    </section>
  );
}

function MainIssueAlert({
  issue,
}: {
  issue: InvoicePreviewItem["issues"][number];
}) {
  const isCritical = issue.severity === "critical";

  return (
    <div
      className={`mt-4 rounded-xl border p-3 ${
        isCritical
          ? "border-rose-400/18 bg-rose-400/[0.055]"
          : "border-amber-300/18 bg-amber-300/[0.055]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${
            isCritical
              ? "border-rose-400/20 bg-rose-400/[0.08] text-rose-100"
              : "border-amber-300/20 bg-amber-300/[0.08] text-amber-100"
          }`}
        >
          Main issue
        </span>

        <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2 py-0.5 text-[9px] text-slate-500">
          {issue.field}
        </span>

        <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2 py-0.5 text-[9px] text-slate-500">
          {formatRiskLabel(issue.risk)}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-50">
        {issue.problem}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        <span className="font-medium text-slate-200">Fix:</span> {issue.fix}
      </p>
    </div>
  );
}

function getStatusPriority(status: string | undefined) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  return statusPriority[normalizedStatus] ?? statusPriority.unknown;
}

function PriorityBadge({ priority }: { priority: InvoicePriority }) {
  const priorityClasses: Record<InvoicePriority, string> = {
    critical: "border-rose-400/25 bg-rose-400/[0.08] text-rose-100",
    high: "border-orange-300/22 bg-orange-300/[0.07] text-orange-100",
    medium: "border-amber-300/22 bg-amber-300/[0.07] text-amber-100",
    low: "border-slate-500/30 bg-slate-700/25 text-slate-300",
    clear: "border-emerald-300/18 bg-emerald-400/[0.055] text-emerald-100",
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
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityClasses[priority]}`}
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
      <span className="rounded-full border border-emerald-300/18 bg-emerald-400/[0.055] px-2 py-0.5 text-[10px] font-medium text-emerald-100">
        Ready
      </span>
    );
  }

  if (criticalCount > 0) {
    return (
      <span className="rounded-full border border-rose-400/20 bg-rose-400/[0.07] px-2 py-0.5 text-[10px] font-medium text-rose-100">
        {criticalCount} critical
        {totalCount > criticalCount ? ` · ${totalCount}` : ""}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-2 py-0.5 text-[10px] font-medium text-amber-100">
      {warningCount} warning{warningCount === 1 ? "" : "s"}
    </span>
  );
}

function formatMoneyValue(value: string | undefined) {
  if (!value) return "—";
  return value;
}

function formatRiskLabel(risk: string) {
  return risk.replaceAll("_", " ");
}
