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
                        ? "border-[color:rgba(182,111,58,0.5)] bg-[rgba(182,111,58,0.12)] ring-1 ring-[rgba(182,111,58,0.22)]"
                        : `${getRowToneClasses(item.priority)} hover:border-[color:rgba(182,111,58,0.35)] hover:bg-[var(--surface-base)]`
                    }`}
                  >
                    <div className="grid gap-2 xl:grid-cols-[1fr_auto] xl:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PriorityBadge priority={item.priority} />

                          <span className="rounded-full bg-[var(--surface-deep)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                            Row {item.rowIndex}
                          </span>

                          <IssueBadge
                            criticalCount={criticalIssues.length}
                            warningCount={warningIssues.length}
                            totalCount={item.issues.length}
                          />
                        </div>

                        <div className="mt-1.5">
                          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                            {item.row.invoice_number ||
                              "Missing invoice number"}
                          </p>

                          <p className="truncate text-xs text-[var(--text-secondary)]">
                            {item.row.company || "Missing company"}
                          </p>

                          <p className="truncate text-[11px] text-[var(--text-muted)]">
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
                            className="rounded-full border border-white/10 bg-[var(--surface-deep)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-[color:rgba(182,111,58,0.45)] hover:bg-[rgba(182,111,58,0.1)] hover:text-[var(--text-primary)]"
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
                      <div className="mt-1.5 rounded-lg border border-white/10 bg-[var(--surface-deep)] p-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent)]">
                              Review action
                            </p>

                            <p className="mt-0.5 text-sm font-medium text-[var(--text-primary)]">
                              {item.actionLabel}
                            </p>
                          </div>

                          <span className="rounded-full border border-[color:rgba(182,111,58,0.28)] bg-[rgba(182,111,58,0.1)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-primary)]">
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
                              <p className="text-xs text-[var(--text-muted)]">
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
    <div className="rounded-lg bg-[var(--surface-deep)] px-2 py-1.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-medium text-[var(--text-secondary)]">
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
          ? "border-[color:rgba(182,111,58,0.32)] bg-[rgba(182,111,58,0.11)]"
          : "border-[color:rgba(182,111,58,0.2)] bg-[rgba(182,111,58,0.07)]"
      }`}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isCritical
              ? "bg-[var(--brand-accent)]"
              : "bg-[rgba(182,111,58,0.7)]"
          }`}
        />

        <span className="font-semibold text-[var(--text-primary)]">
          {issue.problem}
        </span>

        {selected && (
          <>
            <span className="text-[var(--text-muted)]">·</span>

            <span className="text-[var(--text-muted)]">
              Fix:{" "}
              <span className="text-[var(--text-secondary)]">{issue.fix}</span>
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
    <div className="grid gap-2 rounded-lg bg-[var(--surface-raised)] px-2 py-1.5 sm:grid-cols-[105px_1fr]">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
            isCritical
              ? "border border-[color:rgba(182,111,58,0.32)] bg-[rgba(182,111,58,0.11)] text-[var(--text-primary)]"
              : "border border-white/10 bg-white/[0.04] text-[var(--text-secondary)]"
          }`}
        >
          {issue.severity}
        </span>

        <span className="text-[10px] text-[var(--text-muted)]">
          {issue.field}
        </span>
      </div>

      <p className="text-xs leading-5 text-[var(--text-secondary)]">
        <span className="text-[var(--text-primary)]">{issue.problem}</span>{" "}
        <span className="text-[var(--text-muted)]">·</span> {issue.fix}
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

function getRowToneClasses(priority: InvoicePriority) {
  if (priority === "critical" || priority === "high") {
    return "border-[color:rgba(182,111,58,0.28)] bg-[var(--surface-raised)]";
  }

  if (priority === "medium" || priority === "low") {
    return "border-white/10 bg-[var(--surface-raised)]";
  }

  return "border-white/10 bg-[var(--surface-raised)]";
}

function getStatusPriority(status: string | undefined) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  return statusPriority[normalizedStatus] ?? statusPriority.unknown;
}

function PriorityBadge({ priority }: { priority: InvoicePriority }) {
  const priorityClasses: Record<InvoicePriority, string> = {
    critical:
      "border border-[color:rgba(182,111,58,0.35)] bg-[rgba(182,111,58,0.12)] text-[var(--text-primary)]",
    high: "border border-[color:rgba(182,111,58,0.28)] bg-[rgba(182,111,58,0.1)] text-[var(--text-primary)]",
    medium:
      "border border-white/10 bg-white/[0.04] text-[var(--text-secondary)]",
    low: "border border-white/10 bg-white/[0.04] text-[var(--text-secondary)]",
    clear:
      "border border-white/10 bg-white/[0.04] text-[var(--text-secondary)]",
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
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
        Ready
      </span>
    );
  }

  if (criticalCount > 0) {
    return (
      <span className="rounded-full border border-[color:rgba(182,111,58,0.32)] bg-[rgba(182,111,58,0.11)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-primary)]">
        {criticalCount} critical
        {totalCount > criticalCount ? ` · ${totalCount}` : ""}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
      {warningCount} warning{warningCount === 1 ? "" : "s"}
    </span>
  );
}

function formatMoneyValue(value: string | undefined) {
  if (!value) return "—";
  return value;
}
