import { Fragment } from "react";

import type { InvoicePreviewItem } from "./types";

type DataSetPreviewProps = {
  title: string;
  description: string;
  items: InvoicePreviewItem[];
  emptyMessage: string;
  selectedRowIndex?: number | null;
  onSelectItem?: (rowIndex: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  tone?: "neutral" | "danger" | "warning";
  compact?: boolean;
  embedded?: boolean;
};

const invoiceFields = [
  "invoice_number",
  "company",
  "email",
  "amount",
  "vat",
  "status",
];

export function DataSetPreview({
  title,
  description,
  items,
  emptyMessage,
  selectedRowIndex,
  onSelectItem,
  isOpen,
  onToggle,
  tone = "neutral",
  compact = false,
  embedded = false,
}: DataSetPreviewProps) {
  const isDanger = tone === "danger";
  const isWarning = tone === "warning";

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
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
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
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-slate-400 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-slate-200">
          {isOpen ? "Collapse" : "Expand"}
        </span>
      </button>

      {isOpen &&
        (items.length === 0 ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-400">
            {emptyMessage}
          </p>
        ) : (
          <div
            className={`mt-3 overflow-auto rounded-xl border border-white/10 bg-[#10182b]/70 ${
              compact ? "max-h-[240px]" : "max-h-[500px]"
            }`}
          >
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-[#10182b]/95 backdrop-blur">
                <tr className="border-b border-white/10 uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-3 py-2 text-[10px] font-medium">Row</th>

                  {invoiceFields.map((field) => (
                    <th
                      key={field}
                      className="px-3 py-2 text-[10px] font-medium"
                    >
                      {field}
                    </th>
                  ))}

                  <th className="px-3 py-2 text-[10px] font-medium">Issues</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
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

                  const mainIssue = criticalIssues[0] ?? warningIssues[0];

                  const tooltipText = mainIssue
                    ? `Fix: ${mainIssue.fix} • Click row for details`
                    : "";

                  const rowClass = isSelected
                    ? "bg-red-400/[0.09]"
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
                      >
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
                            ? `Fix: ${fieldIssue.fix} • Click row for details`
                            : value;

                          return (
                            <td key={field} className="px-3 py-2">
                              <span
                                title={fieldTooltip}
                                className={`block max-w-[160px] truncate rounded px-1.5 py-0.5 ${
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
                              title={tooltipText}
                              className={`inline-flex cursor-help rounded-full border px-2 py-0.5 text-[10px] font-medium ${
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
                      </tr>

                      {isSelected && item.issues.length > 0 && (
                        <tr className="border-b border-red-300/[0.08] bg-red-400/[0.025]">
                          <td
                            colSpan={invoiceFields.length + 2}
                            className="px-3 py-2"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-100/75">
                                    Quick issue overview
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-slate-400">
                                    Compact fixes. Full details are shown in the
                                    detail panel below.
                                  </p>
                                </div>

                                <span className="shrink-0 rounded-full border border-red-300/20 bg-red-400/[0.08] px-2 py-0.5 text-[10px] font-medium text-red-100/90">
                                  {item.issues.length} issue
                                  {item.issues.length === 1 ? "" : "s"}
                                </span>
                              </div>

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

function formatRiskLabel(risk: string) {
  return risk.replaceAll("_", " ");
}

function formatIssueType(type: string) {
  return type.replaceAll("-", " ");
}
