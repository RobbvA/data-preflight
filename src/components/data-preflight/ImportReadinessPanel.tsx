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
    <section className="rounded-[2rem] border border-white/10 bg-[var(--surface-base)] p-6 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brand-accent)]">
            Control center
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-[1.7rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
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

          <p className="mt-2 max-w-3xl text-[0.93rem] leading-6 text-[var(--text-secondary)]">
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

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Metric
          label="Blocked"
          value={blockedCount}
          description="Fix first"
          tone="danger"
          icon={<AlertTriangle className="h-4 w-4" />}
        />

        <Metric
          label="Need review"
          value={warningCount}
          description="Check before export"
          tone="warning"
          icon={<Search className="h-4 w-4" />}
        />

        <Metric
          label="Ready"
          value={cleanCount}
          description="Clean output"
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_280px]">
        <div
          className={`rounded-3xl border p-4 ${
            isBlocked
              ? "border-[color:rgba(182,111,58,0.28)] bg-[var(--surface-raised)]"
              : hasWarnings
                ? "border-white/10 bg-[var(--surface-raised)]"
                : "border-white/10 bg-[var(--surface-raised)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <NextActionIcon tone={statusTone} />

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Next action
            </p>
          </div>

          <p className="mt-2 text-[1.25rem] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">
            {nextAction.title}
          </p>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            {nextAction.description}
          </p>

          <button
            type="button"
            onClick={() => {
              document
                .getElementById("invoice-review-workspace")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--brand-accent-soft)]"
          >
            <Search className="h-4 w-4" />
            {nextAction.buttonLabel}
          </button>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-[var(--surface-raised)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Download className="h-3.5 w-3.5 text-[var(--text-muted)]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  Export
                </p>
              </div>

              <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                Clean output
              </h3>
            </div>

            <StatusPill tone={canExport ? "success" : "warning"}>
              {canExport ? "Available" : "Guarded"}
            </StatusPill>
          </div>

          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
            {exportSafetyMessage}
          </p>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() =>
                onDownloadCleanCsv("clean-invoices.csv", cleanRows)
              }
              disabled={!canExport}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--brand-accent-soft)] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Download className="h-4 w-4" />
              Download clean CSV
            </button>

            <button
              type="button"
              onClick={() => onDownloadErrorCsv("invoice-errors.csv", issues)}
              disabled={issues.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[var(--surface-deep)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[color:rgba(182,111,58,0.45)] hover:bg-[var(--surface-base)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-35"
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
  description,
  tone,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  tone: "success" | "warning" | "danger";
  icon: ReactNode;
}) {
  const toneClasses = {
    success: "text-[var(--text-primary)]",
    warning: "text-[var(--text-primary)]",
    danger: "text-[var(--text-primary)]",
  };

  const iconClasses = {
    success: "text-[var(--text-secondary)]",
    warning: "text-[var(--text-secondary)]",
    danger: "text-[var(--brand-accent)]",
  };

  const surfaceClasses = {
    success: "border-white/10 bg-[var(--surface-raised)]",
    warning: "border-white/10 bg-[var(--surface-raised)]",
    danger: "border-[color:rgba(182,111,58,0.35)] bg-[var(--surface-raised)]",
  };

  const labelClasses = {
    success: "text-[var(--text-secondary)]",
    warning: "text-[var(--text-secondary)]",
    danger: "text-[var(--brand-accent)]",
  };

  return (
    <div className={`rounded-2xl border p-4 ${surfaceClasses[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${labelClasses[tone]}`}
        >
          {label}
        </p>

        <span className={iconClasses[tone]}>{icon}</span>
      </div>

      <p
        className={`mt-2 text-[2.75rem] font-semibold leading-none tracking-tight ${toneClasses[tone]}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">
        {description}
      </p>
    </div>
  );
}

function NextActionIcon({ tone }: { tone: "warning" | "danger" | "success" }) {
  const toneClasses = {
    warning: "text-[var(--text-secondary)]",
    danger: "text-[var(--brand-accent)]",
    success: "text-[var(--text-secondary)]",
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
    warning: "border-white/10 bg-white/[0.04] text-[var(--text-primary)]",
    danger:
      "border-[color:rgba(182,111,58,0.4)] bg-[rgba(182,111,58,0.1)] text-[var(--text-primary)]",
    success: "border-white/10 bg-white/[0.04] text-[var(--text-primary)]",
    info: "border-white/10 bg-white/[0.04] text-[var(--text-secondary)]",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
