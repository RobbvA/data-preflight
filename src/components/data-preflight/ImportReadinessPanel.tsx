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
    <section className="rounded-2xl border border-cyan-300/18 bg-cyan-400/[0.055] p-4 shadow-xl shadow-cyan-950/20 backdrop-blur">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Control center
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-white">
              Import readiness
            </h2>

            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
          </div>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-cyan-50/75">
            {importReadinessMessage}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Total" value={totalInvoices} />
            <Metric label="Ready" value={cleanCount} tone="success" />
            <Metric label="Blocked" value={blockedCount} tone="danger" />
            <Metric label="Critical" value={criticalCount} tone="danger" />
            <Metric label="Warnings" value={warningCount} tone="warning" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
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

        <div className="rounded-2xl border border-white/12 bg-white/[0.055] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Trusted export
          </p>

          <h3 className="mt-1.5 text-base font-semibold text-white">
            Export validated data
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-300">
            Export only after mapping is safe and clean invoice rows are
            available.
          </p>

          {!canExport && (
            <div className="mt-3 rounded-xl border border-yellow-300/25 bg-yellow-400/[0.08] p-2.5 text-xs leading-5 text-yellow-100">
              Clean export is disabled until mappings are complete, duplicate
              mappings are resolved, and at least one clean invoice is
              available.
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                onDownloadCleanCsv("clean-invoices.csv", cleanRows)
              }
              disabled={!canExport}
              className="rounded-xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download clean CSV
            </button>

            <button
              type="button"
              onClick={() => onDownloadErrorCsv("invoice-errors.csv", issues)}
              disabled={issues.length === 0}
              className="rounded-xl border border-white/12 bg-white/[0.055] px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-40"
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
              className="rounded-xl border border-white/12 bg-white/[0.055] px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-40"
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
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-2.5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-0.5 text-xl font-semibold ${toneClasses[tone]}`}>
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
    warning: "border-yellow-300/20 bg-yellow-400/[0.08] text-yellow-100/90",
    danger: "border-red-300/20 bg-red-400/[0.08] text-red-100/90",
    success: "border-emerald-300/20 bg-emerald-400/[0.08] text-emerald-100/90",
    info: "border-violet-300/18 bg-violet-400/[0.07] text-violet-100/85",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
