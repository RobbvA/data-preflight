import type { ReactNode } from "react";

import type { ParsedRow } from "@/lib/parseCsv";
import { getExportSafetyMessage } from "@/lib/exportData";
import type { ValidationIssue } from "@/lib/validateRows";

type ImportReadinessPanelProps = {
  importReadinessMessage: string;
  totalInvoices: number;
  hasIncompleteMapping: boolean;
  hasDuplicateMappings: boolean;
  blockedCount: number;
  warningCount: number;
  cleanCount: number;
  criticalCount: number;
  hasSuspiciousVat: boolean;
  canExport: boolean;
  cleanRows: ParsedRow[];
  issues: ValidationIssue[];
  onDownloadCleanCsv: (filename: string, rows: ParsedRow[]) => void;
  onDownloadErrorCsv: (filename: string, issues: ValidationIssue[]) => void;
};

export function ImportReadinessPanel({
  importReadinessMessage,
  totalInvoices,
  hasIncompleteMapping,
  hasDuplicateMappings,
  blockedCount,
  warningCount,
  cleanCount,
  criticalCount,
  hasSuspiciousVat,
  canExport,
  cleanRows,
  issues,
  onDownloadCleanCsv,
  onDownloadErrorCsv,
}: ImportReadinessPanelProps) {
  const isBlocked =
    hasIncompleteMapping || hasDuplicateMappings || blockedCount > 0;
  const hasWarnings = warningCount > 0 || hasSuspiciousVat;

  const statusLabel = isBlocked
    ? "Action required"
    : hasWarnings
      ? "Review recommended"
      : "Ready for export";

  const statusTone = isBlocked ? "danger" : hasWarnings ? "warning" : "success";

  const nextAction = getNextActionMessage({
    hasIncompleteMapping,
    hasDuplicateMappings,
    blockedCount,
    warningCount,
    cleanCount,
  });

  const exportSafetyMessage = getExportSafetyMessage({
    hasIncompleteMapping,
    hasDuplicateMappings,
    cleanRowCount: cleanRows.length,
    issues,
  });

  return (
    <section className="rounded-[2rem] bg-slate-900/55 p-6 shadow-xl shadow-black/15 backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
            Control center
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
              {totalInvoices} invoices analysed
            </h2>

            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {importReadinessMessage}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasIncompleteMapping && (
            <StatusPill tone="warning">Mapping incomplete</StatusPill>
          )}

          {hasDuplicateMappings && (
            <StatusPill tone="danger">Duplicate mapping</StatusPill>
          )}

          {hasSuspiciousVat && (
            <StatusPill tone="warning">VAT anomalies</StatusPill>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Invoices" value={totalInvoices} />
        <Metric label="Blocked" value={blockedCount} tone="danger" />
        <Metric label="Need review" value={warningCount} tone="warning" />
        <Metric label="Ready" value={cleanCount} tone="success" />
        <Metric label="Critical" value={criticalCount} tone="danger" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_280px]">
        <div
          className={`rounded-3xl p-5 ${
            isBlocked
              ? "bg-rose-400/[0.055]"
              : hasWarnings
                ? "bg-amber-300/[0.055]"
                : "bg-emerald-400/[0.045]"
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Next action
          </p>

          <p className="mt-2 text-xl font-semibold text-slate-50">
            {nextAction.title}
          </p>

          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-300">
            {nextAction.description}
          </p>

          <button
            type="button"
            onClick={() => {
              document
                .getElementById("invoice-review-workspace")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="mt-4 rounded-xl bg-cyan-100 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            {nextAction.buttonLabel}
          </button>
        </div>

        <aside className="rounded-2xl bg-slate-950/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
                Export
              </p>

              <h3 className="mt-1 text-sm font-semibold text-slate-300">
                Clean output
              </h3>
            </div>

            <StatusPill tone={canExport ? "success" : "warning"}>
              {canExport ? "Available" : "Guarded"}
            </StatusPill>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {exportSafetyMessage}
          </p>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() =>
                onDownloadCleanCsv("clean-invoices.csv", cleanRows)
              }
              disabled={!canExport}
              className="rounded-xl bg-cyan-100 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              Download clean CSV
            </button>

            <button
              type="button"
              onClick={() => onDownloadErrorCsv("invoice-errors.csv", issues)}
              disabled={issues.length === 0}
              className="rounded-xl border border-slate-700/60 bg-slate-900/55 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800/70 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Download issue report
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function getNextActionMessage({
  hasIncompleteMapping,
  hasDuplicateMappings,
  blockedCount,
  warningCount,
  cleanCount,
}: {
  hasIncompleteMapping: boolean;
  hasDuplicateMappings: boolean;
  blockedCount: number;
  warningCount: number;
  cleanCount: number;
}) {
  if (hasIncompleteMapping) {
    return {
      title: "Complete field mapping first.",
      description:
        "Required invoice fields are not mapped yet. Open field mapping before reviewing invoice rows.",
      buttonLabel: "Review mapping",
    };
  }

  if (hasDuplicateMappings) {
    return {
      title: "Resolve duplicate mappings.",
      description:
        "One or more source columns are mapped multiple times. Fix this before exporting trusted data.",
      buttonLabel: "Review mapping",
    };
  }

  if (blockedCount > 0) {
    return {
      title: `${blockedCount} blocked invoice${
        blockedCount === 1 ? "" : "s"
      } need attention.`,
      description:
        "Start with blocked invoices. These rows are excluded from clean export until critical issues are fixed.",
      buttonLabel: "Review blocked invoices",
    };
  }

  if (warningCount > 0) {
    return {
      title: `${warningCount} invoice${
        warningCount === 1 ? "" : "s"
      } need review.`,
      description:
        "No blocking issues found. Review warnings before importing or exporting the clean output.",
      buttonLabel: "Review warnings",
    };
  }

  if (cleanCount > 0) {
    return {
      title: "All mapped invoices are ready.",
      description:
        "No blocking issues or warnings were detected. Export the clean output when ready.",
      buttonLabel: "Review ready invoices",
    };
  }

  return {
    title: "Upload invoice data to start.",
    description:
      "DataPreflight will analyse, normalize, validate, and prepare trusted output.",
    buttonLabel: "Start review",
  };
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    neutral: "text-slate-50",
    success: "text-emerald-100",
    warning: "text-amber-100",
    danger: "text-rose-100",
  };

  const surfaceClasses = {
    neutral: "bg-slate-950/20",
    success: "bg-emerald-400/[0.045]",
    warning: "bg-amber-300/[0.055]",
    danger: "bg-rose-400/[0.055]",
  };

  return (
    <div className={`rounded-2xl p-4 ${surfaceClasses[tone]}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-5xl font-semibold tracking-tight ${toneClasses[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "warning" | "danger" | "success" | "info";
  children: ReactNode;
}) {
  const toneClasses = {
    warning: "border-amber-300/20 bg-amber-300/[0.07] text-amber-100",
    danger: "border-rose-400/20 bg-rose-400/[0.07] text-rose-100",
    success: "border-emerald-300/18 bg-emerald-400/[0.055] text-emerald-100",
    info: "border-slate-500/30 bg-slate-700/25 text-slate-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
