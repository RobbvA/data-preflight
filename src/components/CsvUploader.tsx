"use client";

import { useMemo, useState } from "react";
import { parseCsvFile, type CsvRow } from "@/lib/parseCsv";
import { validateRows } from "@/lib/validateRows";
import { downloadCsv, downloadErrorCsv } from "@/lib/exportData";

export function CsvUploader() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);
    setFileName(file.name);

    try {
      const parsedRows = await parseCsvFile(file);

      if (parsedRows.length === 0) {
        throw new Error("CSV file is empty.");
      }

      const detectedHeaders = Object.keys(parsedRows[0] ?? {});

      if (detectedHeaders.length === 0) {
        throw new Error("CSV file has no headers.");
      }

      setRows(parsedRows);
      setHeaders(detectedHeaders);
      setSelectedFields(detectedHeaders);
    } catch {
      setError("Failed to parse CSV file. Please check the file format.");
      setRows([]);
      setHeaders([]);
      setSelectedFields([]);
    } finally {
      setIsLoading(false);
    }
  }

  function resetFlow() {
    setRows([]);
    setFileName("");
    setHeaders([]);
    setSelectedFields([]);
    setError(null);
    setIsLoading(false);
  }

  function toggleField(field: string) {
    setSelectedFields((currentFields) => {
      if (currentFields.includes(field)) {
        return currentFields.filter((item) => item !== field);
      }

      return [...currentFields, field];
    });
  }

  const selectedRows = useMemo(() => {
    return rows.map((row) => {
      const selectedRow: CsvRow = {};

      selectedFields.forEach((field) => {
        selectedRow[field] = row[field] ?? "";
      });

      return selectedRow;
    });
  }, [rows, selectedFields]);

  const validationResult = useMemo(() => {
    return validateRows(selectedRows);
  }, [selectedRows]);

  const warningCount = validationResult.issues.filter(
    (issue) => issue.severity === "warning",
  ).length;

  const criticalCount = validationResult.issues.filter(
    (issue) => issue.severity === "critical",
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
            Data trust layer
          </p>
          <h1 className="mt-2 text-3xl font-bold">DataPreflight</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Upload a CSV file, select the fields you need, and inspect what is
            safe to export before data enters another system.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <label className="block text-sm font-medium text-slate-300">
            Upload CSV
          </label>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="mt-4 block w-full text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          />

          {isLoading && (
            <p className="mt-3 text-sm text-slate-400">Processing file...</p>
          )}

          {fileName && !isLoading && (
            <p className="mt-3 text-sm text-slate-400">
              Selected file: {fileName}
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {(rows.length > 0 || error || fileName) && (
            <button
              type="button"
              onClick={resetFlow}
              className="mt-4 text-sm text-slate-400 underline underline-offset-4 hover:text-slate-200"
            >
              Reset
            </button>
          )}
        </section>

        {headers.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Detected fields</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select which fields should continue through the preflight check.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {headers.map((header) => (
                <label
                  key={header}
                  className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(header)}
                    onChange={() => toggleField(header)}
                  />
                  <span>{header}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {selectedRows.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Preflight summary</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard label="Total rows" value={selectedRows.length} />
              <SummaryCard
                label="Clean rows"
                value={validationResult.cleanRows.length}
              />
              <SummaryCard
                label="Error rows"
                value={validationResult.errorRows.length}
              />
              <SummaryCard label="Critical issues" value={criticalCount} />
              <SummaryCard label="Warnings" value={warningCount} />
            </div>
          </section>
        )}

        {selectedRows.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Selected data preview</h2>
            <p className="mt-1 text-sm text-slate-400">
              Total rows: {selectedRows.length} | Selected fields:{" "}
              {selectedFields.length}
            </p>

            <pre className="mt-4 max-h-[360px] overflow-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
              {JSON.stringify(selectedRows, null, 2)}
            </pre>
          </section>
        )}

        {validationResult.issues.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Explainable issues</h2>
            <p className="mt-1 text-sm text-slate-400">
              Every issue explains what went wrong, why it matters, and how to
              fix it.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 pr-4">Row</th>
                    <th className="py-2 pr-4">Field</th>
                    <th className="py-2 pr-4">Severity</th>
                    <th className="py-2 pr-4">Problem</th>
                    <th className="py-2 pr-4">Why</th>
                    <th className="py-2 pr-4">Fix</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResult.issues.map((issue) => (
                    <tr
                      key={`${issue.rowIndex}-${issue.field}-${issue.type}`}
                      className="border-b border-slate-800 align-top"
                    >
                      <td className="py-3 pr-4">{issue.rowIndex}</td>
                      <td className="py-3 pr-4">{issue.field}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-xs uppercase">
                          {issue.severity}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{issue.problem}</td>
                      <td className="max-w-xs py-3 pr-4 text-slate-300">
                        {issue.why}
                      </td>
                      <td className="max-w-xs py-3 pr-4 text-slate-300">
                        {issue.fix}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {selectedRows.length > 0 && validationResult.issues.length === 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">No issues found</h2>
            <p className="mt-1 text-sm text-slate-400">
              All selected rows passed the current validation rules.
            </p>
          </section>
        )}

        {selectedRows.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Export</h2>
            <p className="mt-1 text-sm text-slate-400">
              Download clean rows, export the issue report, or copy clean JSON.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  downloadCsv("clean.csv", validationResult.cleanRows)
                }
                disabled={validationResult.cleanRows.length === 0}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download clean.csv
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadErrorCsv("errors.csv", validationResult.issues)
                }
                disabled={validationResult.issues.length === 0}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download errors.csv
              </button>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify(validationResult.cleanRows, null, 2),
                  )
                }
                disabled={validationResult.cleanRows.length === 0}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Copy clean JSON
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-950 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
