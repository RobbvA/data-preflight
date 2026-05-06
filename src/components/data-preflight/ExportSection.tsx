import type { CsvRow } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";

type ExportSectionProps = {
  canExport: boolean;
  cleanRows: CsvRow[];
  issues: ValidationIssue[];
  onDownloadCleanCsv: (filename: string, rows: CsvRow[]) => void;
  onDownloadErrorCsv: (filename: string, issues: ValidationIssue[]) => void;
};

export function ExportSection({
  canExport,
  cleanRows,
  issues,
  onDownloadCleanCsv,
  onDownloadErrorCsv,
}: ExportSectionProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Export</h2>

      <p className="mt-1 text-sm text-slate-400">
        Download clean invoice rows, export the issue report, or copy clean
        invoice JSON.
      </p>

      {!canExport && (
        <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Clean export is disabled until required mappings are complete,
          duplicate mappings are resolved, and at least one clean invoice is
          available.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onDownloadCleanCsv("clean-invoices.csv", cleanRows)}
          disabled={!canExport}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Download clean-invoices.csv
        </button>

        <button
          type="button"
          onClick={() => onDownloadErrorCsv("invoice-errors.csv", issues)}
          disabled={issues.length === 0}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Download invoice-errors.csv
        </button>

        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(cleanRows, null, 2))
          }
          disabled={!canExport}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Copy clean invoice JSON
        </button>
      </div>
    </section>
  );
}