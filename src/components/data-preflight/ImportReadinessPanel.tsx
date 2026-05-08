type ImportReadinessPanelProps = {
  importReadinessMessage: string;
  hasIncompleteMapping: boolean;
  hasDuplicateMappings: boolean;
  blockedCount: number;
  warningCount: number;
  cleanCount: number;
  hasSuspiciousVat: boolean;
};

export function ImportReadinessPanel({
  importReadinessMessage,
  hasIncompleteMapping,
  hasDuplicateMappings,
  blockedCount,
  warningCount,
  cleanCount,
  hasSuspiciousVat,
}: ImportReadinessPanelProps) {
  return (
    <section className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.08] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/70">
            Control center
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Import readiness
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">
            {importReadinessMessage}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        {hasIncompleteMapping && (
          <StatusPill tone="warning">⚠️ Mapping incomplete</StatusPill>
        )}

        {hasDuplicateMappings && (
          <StatusPill tone="danger">⚠️ Duplicate mapping</StatusPill>
        )}

        {blockedCount > 0 && (
          <StatusPill tone="danger">⚠️ {blockedCount} blocked</StatusPill>
        )}

        {warningCount > 0 && (
          <StatusPill tone="warning">
            ⚠️ {warningCount} warning{warningCount === 1 ? "" : "s"}
          </StatusPill>
        )}

        {cleanCount > 0 && (
          <StatusPill tone="success">✅ {cleanCount} ready</StatusPill>
        )}

        {hasSuspiciousVat && (
          <StatusPill tone="info">⚠️ VAT anomalies detected</StatusPill>
        )}
      </div>
    </section>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "warning" | "danger" | "success" | "info";
  children: React.ReactNode;
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