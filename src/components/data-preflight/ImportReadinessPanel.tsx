import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileWarning,
  Search,
} from "lucide-react";

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
    <section className="rounded-[1.75rem] border border-slate-700/35 bg-slate-900/60 p-5 shadow-xl shadow-black/15 backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
            Control center
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h2 className="text-[1.45rem] font-semibold leading-tight tracking-tight text-slate-50">
              {totalInvoices} invoices analysed
            </h2>

            <StatusPill tone={statusTone}>{statusLabel}</StatusPill>

            {criticalCount > 0 && (
              <StatusPill tone="danger">
                {criticalCount} critical issue
                {criticalCount === 1 ? "" : "s"}
              </StatusPill>
            )}
          </div>

          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-400">
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

      <div className="mt-5 grid gap-2 rounded-2xl border border-slate-700/35 bg-slate-950/20 p-2 md:grid-cols-3">
        <Metric
          label="Blocked"
          value={blockedCount}
          description="Fix first"
          tone="danger"
          active={blockedCount > 0 || isBlocked}
          icon={<AlertTriangle className="h-4 w-4" />}
        />

        <Metric
          label="Need review"
          value={warningCount}
          description="Check before export"
          tone="warning"
          active={!isBlocked && warningCount > 0}
          icon={<Search className="h-4 w-4" />}
        />

        <Metric
          label="Ready"
          value={cleanCount}
          description="Clean output"
          tone="success"
          active={!isBlocked && !hasWarnings && cleanCount > 0}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_250px]">
        <div
          className={`rounded-2xl border p-4 ${
            isBlocked
              ? "border-rose-400/20 bg-rose-400/[0.08]"
              : hasWarnings
                ? "border-amber-300/18 bg-amber-300/[0.075]"
                : "border-emerald-300/16 bg-emerald-400/[0.06]"
          }`}
        >
          <div className="flex items-center gap-2">
            <NextActionIcon tone={statusTone} />

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Next action
            </p>
          </div>

          <p className="mt-2 text-[1.15rem] font-semibold leading-snug tracking-tight text-slate-50">
            {nextAction.title}
          </p>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-300">
            {nextAction.description}
          </p>

          <button
            type="button"
            onClick={() => {
              document
                .getElementById("invoice-review-workspace")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-100 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-white"
          >
            <Search className="h-4 w-4" />
            {nextAction.buttonLabel}
          </button>
        </div>

        <aside className="rounded-2xl border border-slate-700/35 bg-slate-950/25 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Download className="h-3.5 w-3.5 text-slate-600" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Export
                </p>
              </div>

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

          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() =>
                onDownloadCleanCsv("clean-invoices.csv", cleanRows)
              }
              disabled={!canExport}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-100 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Download className="h-4 w-4" />
              Download clean CSV
            </button>

            <button
              type="button"
              onClick={() => onDownloadErrorCsv("invoice-errors.csv", issues)}
              disabled={issues.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/55 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800/70 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <FileWarning className="h-4 w-4" />
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
        "Start here. Blocked rows are excluded from clean export until critical issues are fixed.",
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
  description,
  tone,
  active,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  tone: "success" | "warning" | "danger";
  active: boolean;
  icon: ReactNode;
}) {
  const toneClasses = {
    success: "text-emerald-100",
    warning: "text-amber-100",
    danger: "text-rose-100",
  };

  const iconClasses = {
    success: "text-emerald-200/75",
    warning: "text-amber-200/75",
    danger: "text-rose-200/75",
  };

  const activeSurfaceClasses = {
    success: "border-emerald-300/20 bg-emerald-400/[0.075]",
    warning: "border-amber-300/22 bg-amber-300/[0.09]",
    danger: "border-rose-400/28 bg-rose-400/[0.12]",
  };

  const inactiveSurfaceClasses =
    "border-slate-700/30 bg-slate-950/20 opacity-75";

  return (
    <div
      className={`rounded-xl border p-3 transition ${
        active ? activeSurfaceClasses[tone] : inactiveSurfaceClasses
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>

        <span className={active ? iconClasses[tone] : "text-slate-600"}>
          {icon}
        </span>
      </div>

      <p
        className={`mt-1.5 font-semibold leading-none tracking-tight ${
          active
            ? `text-[2.65rem] ${toneClasses[tone]}`
            : "text-3xl text-slate-500"
        }`}
      >
        {value}
      </p>

      <p className="mt-1.5 text-xs font-medium text-slate-500">{description}</p>
    </div>
  );
}

function NextActionIcon({ tone }: { tone: "warning" | "danger" | "success" }) {
  const toneClasses = {
    warning: "text-amber-200/75",
    danger: "text-rose-200/75",
    success: "text-emerald-200/75",
  };

  const Icon =
    tone === "danger"
      ? AlertTriangle
      : tone === "warning"
        ? Search
        : CheckCircle2;

  return <Icon className={`h-4 w-4 ${toneClasses[tone]}`} />;
}

function StatusPill({
  tone,
  children,
}: {
  tone: "warning" | "danger" | "success" | "info";
  children: ReactNode;
}) {
  const toneClasses = {
    warning: "border-amber-300/22 bg-amber-300/[0.08] text-amber-100",
    danger: "border-rose-400/22 bg-rose-400/[0.08] text-rose-100",
    success: "border-emerald-300/20 bg-emerald-400/[0.065] text-emerald-100",
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
