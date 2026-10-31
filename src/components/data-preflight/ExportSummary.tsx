type ExportSummaryProps = {
  exportCount: number;
  warningCount: number;
  blockedCount: number;
};

export function ExportSummary({ exportCount, warningCount, blockedCount }: ExportSummaryProps) {
  return (
    <div aria-label="Export summary" className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
      <p className="text-sm font-medium leading-6 text-[var(--text-primary)]">
        {exportCount} {exportCount === 1 ? "row" : "rows"} will export · {warningCount} with warnings · {blockedCount} blocked
      </p>
      <details>
        <summary className="cursor-pointer py-1 text-sm marker:text-[var(--brand-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]">What is included?</summary>
      <p className="mt-1 text-sm leading-6">
        {exportCount === 0
          ? "No rows without blockers are available. Correct the source file and validate it again."
          : warningCount > 0
            ? "Warning-only rows are included. Review their issues before importing."
            : "The export contains rows that passed the current checks."}
        {" "}Blocked rows are excluded. Ready means the implemented checks passed; it does not guarantee acceptance by your target ERP.
      </p>
      </details>
    </div>
  );
}
