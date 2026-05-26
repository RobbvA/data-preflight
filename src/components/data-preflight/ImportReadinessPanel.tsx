import type { ReactNode } from "react";

import type { CsvRow } from "@/lib/parseCsv";
import {
  getExportBlockerSummaries,
  getExportSafetyMessage,
} from "@/lib/exportData";
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

  const exportBlockers = getExportBlockerSummaries(issues);
  const hasExportBlockers = exportBlockers.length > 0;

  return (
    <section className="rounded-[1.75rem] border border-slate-700/45 bg-slate-900/45 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
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

          <div
            className={`mt-4 rounded-2xl border p-3 ${
              isBlocked
                ? "border-rose-400/18 bg-rose-400/[0.055]"
                : hasWarnings
                  ? "border-amber-300/18 bg-amber-300/[0.055]"
                  : "border-emerald-300/16 bg-emerald-400/[0.045]"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Next action
            </p>

            <p className="mt-1 text-sm font-medium text-slate-100">
              {nextAction}
            </p>
          </div>

          {hasExportBlockers && (
            <div className="mt-4 rounded-2xl border border-rose-400/16 bg-rose-400/[0.045] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100/70">
                    Export blockers
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    These issue groups contain critical validation failures and
                    are excluded from clean export.
                  </p>
                </div>

                <StatusPill tone="danger">
                  {criticalCount} critical issue
                  {criticalCount === 1 ? "" : "s"}
                </StatusPill>
              </div>

              <div className="mt-3 grid gap-2">
                {exportBlockers.slice(0, 4).map((blocker) => (
                  <div
                    key={`${blocker.type}-${blocker.field}-${blocker.risk}`}
                    className="rounded-xl border border-slate-700/45 bg-slate-950/30 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-100">
                          {blocker.label}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Field: {blocker.field} · Risk:{" "}
                          {formatLabel(blocker.risk)}
                        </p>
                      </div>

                      <span className="rounded-full border border-rose-400/20 bg-rose-400/[0.06] px-2.5 py-1 text-[11px] font-medium text-rose-100">
                        {blocker.count} row
                        {blocker.count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {exportBlockers.length > 4 && (
                <p className="mt-3 text-xs text-slate-500">
                  +{exportBlockers.length - 4} more blocker group
                  {exportBlockers.length - 4 === 1 ? "" : "s"} in the issue
                  report.
                </p>
              )}
            </div>
          )}

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

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-50">
              Export clean output
            </h3>

            <StatusPill tone={canExport ? "success" : "warning"}>
              {canExport ? "Export available" : "Export guarded"}
            </StatusPill>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {exportSafetyMessage}
          </p>

          {!canExport && (
            <div className="mt-4 rounded-xl border border-amber-300/16 bg-amber-300/[0.055] p-3 text-xs leading-5 text-amber-100/85">
              Clean export stays disabled until mappings are safe and at least
              one import-ready invoice is available.
            </div>
          )}

          {canExport && blockedCount > 0 && (
            <div className="mt-4 rounded-xl border border-cyan-300/14 bg-cyan-300/[0.045] p-3 text-xs leading-5 text-cyan-100/80">
              Clean export will contain {cleanRows.length} ready invoice
              {cleanRows.length === 1 ? "" : "s"}. Blocked invoices stay out of
              the export.
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
    return "Open field mapping and complete the required invoice fields before reviewing rows.";
  }

  if (hasDuplicateMappings) {
    return "Open field mapping and resolve duplicate mappings before export.";
  }

  if (blockedCount > 0) {
    return `${blockedCount} blocked invoice${
      blockedCount === 1 ? "" : "s"
    } need fixes before export. Start with the Blocked invoices section below.`;
  }

  if (warningCount > 0) {
    return `No blocking issues found. Review ${warningCount} warning${
      warningCount === 1 ? "" : "s"
    } in the Needs review section before export.`;
  }

  if (cleanCount > 0) {
    return "All mapped invoices are import-ready. Export the clean output when ready.";
  }

  return "Upload invoice data to start the preflight check.";
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

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}
