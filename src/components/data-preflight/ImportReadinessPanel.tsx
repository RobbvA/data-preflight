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
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">
        Import readiness
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        {importReadinessMessage}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        {hasIncompleteMapping && (
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-yellow-200">
            ⚠️ Mapping incomplete
          </span>
        )}

        {hasDuplicateMappings && (
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-300">
            ⚠️ Duplicate mapping
          </span>
        )}

        {blockedCount > 0 && (
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-300">
            ⚠️ {blockedCount} blocked
          </span>
        )}

        {warningCount > 0 && (
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-yellow-200">
            ⚠️ {warningCount} warning
            {warningCount === 1 ? "" : "s"}
          </span>
        )}

        {cleanCount > 0 && (
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-green-200">
            ✅ {cleanCount} ready
          </span>
        )}

        {hasSuspiciousVat && (
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-purple-200">
            ⚠️ VAT anomalies detected
          </span>
        )}
      </div>
    </section>
  );
}