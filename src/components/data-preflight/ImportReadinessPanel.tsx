import type { ReactNode } from "react";

import type { CsvRow } from "@/lib/parseCsv";
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
  cleanRows: CsvRow[];
  issues: ValidationIssue[];
  onDownloadCleanCsv: (filename: string, rows: CsvRow[]) => void;
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
    ? "Import blocked"
    : hasWarnings
      ? "Review recommended"
      : "Ready for import";

  const statusTone = isBlocked ? "danger" : hasWarnings ? "warning" : "success";

  return (
    <section className="rounded-[1.75rem] border border-slate-700/45 bg-slate-900/45 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Control center
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
              Import readiness
            </h2>

            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {importReadinessMessage}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Total invoices" value={totalInvoices} />
            <Metric label="Ready" value={cleanCount} tone="success" />
            <Metric label="Blocked" value={blockedCount} tone="danger" />
            <Metric label="Critical" value={criticalCount} tone="danger" />
            <Metric label="Warnings" value={warningCount} tone="warning" />
          </div>

          {(hasIncompleteMapping ||
            hasDuplicateMappings ||
            hasSuspiciousVat) && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {hasIncompleteMapping && (
                <StatusPill tone="warning">Mapping incomplete</StatusPill>
              )}

              {hasDuplicateMappings && (
                <StatusPill tone="danger">Duplicate mapping</StatusPill>
              )}

              {hasSuspiciousVat && (
                <StatusPill tone="info">VAT anomalies detected</StatusPill>
              )}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-700/45 bg-slate-950/35 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
            Trusted export
          </p>

          <h3 className="mt-2 text-base font-semibold text-slate-50">
            Export clean output
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Export only rows that passed mapping and validation checks.
          </p>

          {!canExport && (
            <div className="mt-4 rounded-xl border border-amber-300/16 bg-amber-300/[0.055] p-3 text-xs leading-5 text-amber-100/85">
              Clean export is disabled until mappings are safe and at least one
              clean invoice is available.
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
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

            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(
                  JSON.stringify(cleanRows, null, 2),
                )
              }
              disabled={!canExport}
              className="rounded-xl border border-slate-700/60 bg-slate-900/55 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800/70 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Copy clean JSON
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
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
    neutral: "text-slate-100",
    success: "text-emerald-100",
    warning: "text-amber-100",
    danger: "text-rose-100",
  };

  return (
    <div className="rounded-2xl border border-slate-700/45 bg-slate-950/30 p-3">
      <p className="text-[11px] text-slate-600">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClasses[tone]}`}>
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
