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

const invoiceFields = [
  "invoice_number",
  "company",
  "email",
  "amount",
  "vat",
  "status",
  "country",
  "invoice_date",
  "due_date",
  "currency",
];

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
      if (sortMode === "priority") {
        return b.priorityScore - a.priorityScore;
      }

      if (sortMode === "issues") {
        return b.issues.length - a.issues.length;
      }

      if (sortMode === "status") {
        const statusA = getStatusPriority(a.row.status);
        const statusB = getStatusPriority(b.row.status);

        if (statusA !== statusB) {
          return statusA - statusB;
        }

        return b.priorityScore - a.priorityScore;
      }

      return a.rowIndex - b.rowIndex;
    });
  }, [items, sortMode]);

  return (
    <section
      className={`rounded-xl border backdrop-blur ${
        embedded ? "p-3 shadow-none" : "p-4 shadow-xl"
      } ${
        isDanger
          ? "border-red-300/[0.14] bg-red-400/[0.04] shadow-slate-950/15"
          : isWarning
            ? "border-yellow-300/[0.14] bg-yellow-400/[0.04] shadow-slate-950/15"
            : "border-white/10 bg-white/[0.045] shadow-slate-950/15"
      }`}
    >
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>

            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                isDanger
                  ? "border-red-300/18 bg-red-400/[0.07] text-red-100/85"
                  : isWarning
                    ? "border-yellow-300/18 bg-yellow-400/[0.07] text-yellow-100/85"
                    : "border-white/10 bg-white/[0.04] text-slate-300"
              }`}
            >
              {items.length} row{items.length === 1 ? "" : "s"}
            </span>
          </div>

          <p className="mt-0.5 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {isOpen && items.length > 1 && (
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="rounded-full border border-cyan-300/20 bg-[#111c33] px-3 py-1 text-[10px] font-medium text-slate-100 outline-none transition hover:border-cyan-300/35 hover:bg-[#17243f] focus:border-cyan-300/50"
            >
              <option value="priority" className="bg-[#111c33] text-slate-100">
                Sort: priority
              </option>
              <option value="status" className="bg-[#111c33] text-slate-100">
                Sort: payment status
              </option>
              <option value="row" className="bg-[#111c33] text-slate-100">
                Sort: CSV row
              </option>
              <option value="issues" className="bg-[#111c33] text-slate-100">
                Sort: issue count
              </option>
            </select>
          )}

          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-slate-400 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-slate-200"
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isOpen &&
        (items.length === 0 ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-400">
            {emptyMessage}
          </p>
        ) : (
          <div
            className={`mt-3 overflow-auto rounded-xl border border-white/10 bg-[#10182b]/70 ${
              compact ? "max-h-[460px]" : "max-h-[720px]"
            }`}
          >
            <table className="w-full min-w-[1500px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#10182b]/95 backdrop-blur">
                <tr className="border-b border-white/10 uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-3 py-2 text-[10px] font-medium">
                    Priority
                  </th>

                  <th className="px-3 py-2 text-[10px] font-medium">Row</th>

                  {invoiceFields.map((field) => (
                    <th
                      key={field}
                      className="px-3 py-2 text-[10px] font-medium"
                    >
                      {formatColumnLabel(field)}
                    </th>
                  ))}

                  <th className="px-3 py-2 text-[10px] font-medium">Issues</th>
                  <th className="px-3 py-2 text-[10px] font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {sortedItems.map((item) => {
                  const isSelected = selectedRowIndex === item.rowIndex;

                  const issueFields = new Set(
                    item.issues.map((issue) => issue.field),
                  );

                  const criticalIssues = item.issues.filter(
                    (issue) => issue.severity === "critical",
                  );

                  const warningIssues = item.issues.filter(
                    (issue) => issue.severity === "warning",
                  );

                  const rowClass = isSelected
                    ? "bg-cyan-400/[0.08]"
                    : isDanger
                      ? "hover:bg-red-400/[0.035]"
                      : isWarning
                        ? "hover:bg-yellow-400/[0.03]"
                        : "hover:bg-white/[0.035]";

                  return (
                    <Fragment key={`${title}-${item.rowIndex}`}>
                      <tr
                        onClick={
                          onSelectItem
                            ? () => onSelectItem(item.rowIndex)
                            : undefined
                        }
                        className={`border-b border-white/[0.08] transition last:border-b-0 ${
                          onSelectItem ? "cursor-pointer" : ""
                        } ${rowClass}`}
                        title="Click row for quick overview"
                      >
                        <td className="px-3 py-2">
                          <PriorityBadge priority={item.priority} />
                        </td>

                        <td className="px-3 py-2 text-[11px] font-medium text-slate-400">
                          {item.rowIndex}
                        </td>

                        {invoiceFields.map((field) => {
                          const hasIssue = issueFields.has(field);
                          const value = item.row[field] || "—";

                          const fieldIssue = item.issues.find(
                            (issue) => issue.field === field,
                          );

                          const fieldTooltip = fieldIssue
                            ? `Fix: ${fieldIssue.fix}`
                            : value;

                          return (
                            <td key={field} className="px-3 py-2">
                              <span
                                title={fieldTooltip}
                                className={`block max-w-[170px] truncate rounded px-1.5 py-0.5 ${
                                  hasIssue && isDanger
                                    ? "border border-red-300/18 bg-red-400/[0.07] text-red-50"
                                    : hasIssue && isWarning
                                      ? "border border-yellow-300/18 bg-yellow-400/[0.07] text-yellow-50"
                                      : "text-slate-200"
                                }`}
                              >
                                {value}
                              </span>
                            </td>
                          );
                        })}

                        <td className="px-3 py-2">
                          {item.issues.length > 0 ? (
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                criticalIssues.length > 0
                                  ? "border-red-300/20 bg-red-400/[0.07] text-red-100/90"
                                  : "border-yellow-300/20 bg-yellow-400/[0.07] text-yellow-100/90"
                              }`}
                            >
                              {criticalIssues.length > 0
                                ? `${criticalIssues.length} critical`
                                : `${warningIssues.length} warning`}
                              {item.issues.length > 1
                                ? ` · ${item.issues.length}`
                                : ""}
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-300/18 bg-emerald-400/[0.07] px-2 py-0.5 text-[10px] font-medium text-emerald-100/85">
                              ready
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] font-medium text-slate-300">
                            {item.actionLabel}
                          </span>
                        </td>
                      </tr>

                      {isSelected && (
                        <tr className="border-b border-cyan-300/[0.08] bg-cyan-400/[0.025]">
                          <td
                            colSpan={invoiceFields.length + 4}
                            className="px-3 py-3"
                          >
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/75">
                                    Quick row overview
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-slate-400">
                                    {item.actionLabel}. Use full details for
                                    normalized data and complete issue
                                    explanations.
                                  </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  <PriorityBadge priority={item.priority} />

                                  <span className="rounded-full border border-cyan-300/20 bg-cyan-400/[0.08] px-2 py-0.5 text-[10px] font-medium text-cyan-100/90">
                                    {item.priorityScore} score
                                  </span>

                                  {onViewDetails && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onViewDetails(item.rowIndex)
                                      }
                                      className="rounded-full border border-cyan-300/25 bg-cyan-400/[0.1] px-3 py-1 text-[10px] font-semibold text-cyan-100 transition hover:border-cyan-200/45 hover:bg-cyan-400/[0.16] hover:text-white"
                                    >
                                      View full details
                                    </button>
                                  )}
                                </div>
                              </div>

                              {item.issues.length > 0 ? (
                                <div className="divide-y divide-white/[0.08] rounded-lg border border-white/[0.08] bg-white/[0.035]">
                                  {item.issues.map((issue, index) => (
                                    <div
                                      key={`${issue.field}-${issue.type}-${index}`}
                                      className="grid gap-2 px-2.5 py-2 md:grid-cols-[1fr_auto]"
                                    >
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <p className="truncate text-xs font-medium text-white">
                                            {issue.problem}
                                          </p>

                                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-slate-400">
                                            {issue.field}
                                          </span>

                                          <span className="rounded-full border border-cyan-300/14 bg-cyan-400/[0.07] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-cyan-100/85">
                                            {formatRiskLabel(issue.risk)}
                                          </span>

                                          <span className="rounded-full border border-white/10 bg-white/[0.035] px-1.5 py-0.5 text-[9px] text-slate-500">
                                            {formatIssueType(issue.type)}
                                          </span>
                                        </div>

                                        <p className="mt-1 text-[11px] leading-5 text-slate-300">
                                          <span className="font-medium text-slate-100">
                                            Fix:
                                          </span>{" "}
                                          {issue.fix}
                                        </p>
                                      </div>

                                      <span
                                        className={`h-fit shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${
                                          issue.severity === "critical"
                                            ? "border-red-300/20 bg-red-400/[0.08] text-red-100/90"
                                            : "border-yellow-300/20 bg-yellow-400/[0.08] text-yellow-100/90"
                                        }`}
                                      >
                                        {issue.severity}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-lg border border-emerald-300/18 bg-emerald-400/[0.055] p-3">
                                  <p className="text-xs font-medium text-emerald-100">
                                    No issues detected. This row is import-ready
                                    based on the current mapping and validation
                                    rules.
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
    </section>
  );
}

function getStatusPriority(status: string | undefined) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";

  return statusPriority[normalizedStatus] ?? statusPriority.unknown;
}

function PriorityBadge({ priority }: { priority: InvoicePriority }) {
  const priorityClasses: Record<InvoicePriority, string> = {
    critical: "border-red-300/25 bg-red-400/[0.09] text-red-50",
    high: "border-orange-300/25 bg-orange-400/[0.09] text-orange-50",
    medium: "border-yellow-300/25 bg-yellow-400/[0.08] text-yellow-50",
    low: "border-blue-300/20 bg-blue-400/[0.07] text-blue-100",
    clear: "border-emerald-300/18 bg-emerald-400/[0.07] text-emerald-100",
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

function formatColumnLabel(field: string) {
  return field.replaceAll("_", " ");
}

function formatRiskLabel(risk: string) {
  return risk.replaceAll("_", " ");
}

function formatIssueType(type: string) {
  return type.replaceAll("-", " ");
}
