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
  const isBlocked = hasIncompleteMapping || hasDuplicateMappings || blockedCount > 0;
  const hasWarnings = warningCount > 0 || hasSuspiciousVat;

  const statusLabel = isBlocked
    ? "Import blocked"
    : hasWarnings
      ? "Review recommended"
      : "Ready for import";

  const statusTone = isBlocked ? "danger" : hasWarnings ? "warning" : "success";

  return (
    <section className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.08] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/70">
            Control center
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              Import readiness
            </h2>

            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">
            {importReadinessMessage}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Total" value={totalInvoices} />
            <Metric label="Ready" value={cleanCount} tone="success" />
            <Metric label="Blocked" value={blockedCount} tone="danger" />
            <Metric label="Critical" value={criticalCount} tone="danger" />
            <Metric label="Warnings" value={warningCount} tone="warning" />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
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
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Trusted export
          </p>

          <h3 className="mt-2 text-lg font-semibold text-white">
            Export validated data
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            Export only after mapping is safe and clean invoice rows are
            available.
          </p>

          {!canExport && (
            <div className="mt-4 rounded-xl border border-yellow-400/25 bg-yellow-400/10 p-3 text-xs leading-5 text-yellow-100">
              Clean export is disabled until mappings are complete, duplicate
              mappings are resolved, and at least one clean invoice is available.
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onDownloadCleanCsv("clean-invoices.csv", cleanRows)}
              disabled={!canExport}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download clean CSV
            </button>

            <button
              type="button"
              onClick={() => onDownloadErrorCsv("invoice-errors.csv", issues)}
              disabled={issues.length === 0}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download issue report
            </button>

            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(cleanRows, null, 2))
              }
              disabled={!canExport}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Copy clean JSON
            </button>
          </div>
        </div>
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
    warning: "text-yellow-100",
    danger: "text-red-100",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
      <p className="text-xs text-slate-500">{label}</p>
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
    warning: "border-yellow-400/30 bg-yellow-400/10 text-yellow-100",
    danger: "border-red-400/30 bg-red-400/10 text-red-100",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    info: "border-violet-400/30 bg-violet-400/10 text-violet-100",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}