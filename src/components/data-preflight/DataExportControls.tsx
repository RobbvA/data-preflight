"use client";
import { HelpPopover } from "@/components/data-preflight/WorkflowHelp";

import { useId, useMemo, useState } from "react";
import type { ParsedRow } from "@/lib/parseCsv";
import { DATA_EXPORT_FORMATS, createExportDataSet, hasSpreadsheetFormulaText, type ExportFormat, type CsvDelimiter } from "@/lib/dataExport";
import { downloadDataExport } from "@/lib/exportData";

export function DataExportControls({ fileName, rows, disabled }: {
  fileName: string;
  rows: readonly ParsedRow[];
  disabled: boolean;
}) {
  const id = useId();
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(";");
  const [error, setError] = useState<string | null>(null);
  const formulaText = useMemo(() => hasSpreadsheetFormulaText(createExportDataSet(rows)), [rows]);
  const blockedTextExport = formulaText && (format === "csv" || format === "txt" || format === "tsv");
  function download(action: () => void) {
    setError(null);
    try { action(); } catch (caught) { setError(caught instanceof Error ? caught.message : "The export could not be created. Choose another format and try again."); }
  }
  const help = format === "xlsx"
    ? "Excel cells contain text to preserve IDs, dates and exact decimals. Confirm the column types required by your target import."
    : format === "json"
      ? "An array of records for scripts and integrations. Values remain strings, including IDs and decimals; this is not an ERP-specific API payload."
      : "UTF-8 with a header row and decimal points. Spreadsheet apps may change IDs or decimals when opening text files; choose Excel to preserve them. Match the format to your target import.";
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[var(--surface-deep)] p-4">
      <div className="mb-3 flex items-center justify-between gap-2"><div><h3 className="text-base font-semibold text-[var(--text-primary)]">Rows without blockers</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">Prepare your data for the next import.</p></div><HelpPopover title="Data export formats">CSV is configurable text, Excel preserves text cells, TXT and TSV use tabs, and JSON is for scripts. Match the format and column requirements to your target import. No format guarantees ERP acceptance.</HelpPopover></div>
      <div className="flex flex-wrap gap-3">
        <label className="block text-sm font-medium text-[var(--text-primary)]">
          Export format
          <select aria-label="Export format" aria-describedby={`${id}-help`} value={format} onChange={(event) => { setFormat(event.target.value as ExportFormat); setError(null); }}
            className="mt-2 block min-h-11 w-full rounded-xl border border-white/15 bg-[var(--surface-deep)] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]">
            {DATA_EXPORT_FORMATS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        {format === "csv" && <label className="block text-sm font-medium text-[var(--text-primary)]">
          Column separator
          <select aria-label="CSV column separator" value={delimiter} onChange={(event) => { setDelimiter(event.target.value as CsvDelimiter); setError(null); }}
            className="mt-2 block min-h-11 w-full rounded-xl border border-white/15 bg-[var(--surface-deep)] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]">
            <option value=";">Semicolon (;)</option><option value=",">Comma (,)</option>
          </select>
        </label>}
      </div>
      <p id={`${id}-help`} className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{help}</p>
      {blockedTextExport && <p role="status" className="mt-2 text-sm leading-6 text-[var(--brand-accent-soft)]">Some text could be treated as a spreadsheet formula. Choose Excel or JSON to preserve it without changing the values.</p>}
      {error && <p role="alert" className="mt-2 text-sm leading-6 text-[var(--brand-accent-soft)]">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={disabled || blockedTextExport} onClick={() => download(() => downloadDataExport(fileName, rows, { format, csvDelimiter: delimiter }))}
          className="rounded-xl bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[var(--brand-accent-soft)] disabled:cursor-not-allowed disabled:opacity-35">
          Export rows without blockers
        </button>

      </div>
    </div>
  );
}
