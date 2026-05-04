"use client";

import { useMemo, useState } from "react";
import { parseCsvFile, type CsvRow } from "@/lib/parseCsv";
import { validateRows, type ValidationIssue } from "@/lib/validateRows";
import { downloadCsv, downloadErrorCsv } from "@/lib/exportData";

type InvoicePreviewItem = {
  rowIndex: number;
  row: CsvRow;
  issues: ValidationIssue[];
};

type FieldMapping = {
  invoice_number: string;
  company: string;
  email: string;
  amount: string;
  vat: string;
  status: string;
};

const expectedInvoiceFields: Array<keyof FieldMapping> = [
  "invoice_number",
  "company",
  "email",
  "amount",
  "vat",
  "status",
];

export function CsvUploader() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    invoice_number: "",
    company: "",
    email: "",
    amount: "",
    vat: "",
    status: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockedRowIndex, setSelectedBlockedRowIndex] = useState<
    number | null
  >(null);
  const [showOnlyBlocked, setShowOnlyBlocked] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);
    setFileName(file.name);
    setSelectedBlockedRowIndex(null);
    setShowOnlyBlocked(false);

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
      setFieldMapping(createSuggestedMapping(detectedHeaders));
    } catch {
      setError("Failed to parse CSV file. Please check the file format.");
      setRows([]);
      setHeaders([]);
      setFieldMapping(createEmptyMapping());
      setSelectedBlockedRowIndex(null);
      setShowOnlyBlocked(false);
    } finally {
      setIsLoading(false);
    }
  }

  function resetFlow() {
    setRows([]);
    setFileName("");
    setHeaders([]);
    setFieldMapping(createEmptyMapping());
    setError(null);
    setIsLoading(false);
    setSelectedBlockedRowIndex(null);
    setShowOnlyBlocked(false);
  }

  function updateFieldMapping(
    targetField: keyof FieldMapping,
    sourceField: string,
  ) {
    setFieldMapping((currentMapping) => ({
      ...currentMapping,
      [targetField]: sourceField,
    }));

    setSelectedBlockedRowIndex(null);
  }

  function toggleBlockedFilter() {
    setShowOnlyBlocked((currentValue) => !currentValue);
    setSelectedBlockedRowIndex(null);
  }

  const selectedRows = useMemo(() => {
    return rows.map((row) => {
      const mappedRow: CsvRow = {};

      expectedInvoiceFields.forEach((targetField) => {
        const sourceField = fieldMapping[targetField];
        mappedRow[targetField] = sourceField ? (row[sourceField] ?? "") : "";
      });

      return mappedRow;
    });
  }, [rows, fieldMapping]);

  const validationResult = useMemo(() => {
    return validateRows(selectedRows);
  }, [selectedRows]);

  const missingExpectedFields = useMemo(() => {
    return expectedInvoiceFields.filter((field) => !fieldMapping[field]);
  }, [fieldMapping]);

  const issuesByRow = useMemo(() => {
    return validationResult.issues.reduce<Record<number, ValidationIssue[]>>(
      (accumulator, issue) => {
        accumulator[issue.rowIndex] = [
          ...(accumulator[issue.rowIndex] ?? []),
          issue,
        ];
        return accumulator;
      },
      {},
    );
  }, [validationResult.issues]);

  const cleanInvoiceItems = useMemo<InvoicePreviewItem[]>(() => {
    return selectedRows
      .map((row, index) => ({
        rowIndex: index + 1,
        row,
        issues: issuesByRow[index + 1] ?? [],
      }))
      .filter((item) => item.issues.length === 0);
  }, [selectedRows, issuesByRow]);

  const blockedInvoiceItems = useMemo<InvoicePreviewItem[]>(() => {
    return selectedRows
      .map((row, index) => ({
        rowIndex: index + 1,
        row,
        issues: issuesByRow[index + 1] ?? [],
      }))
      .filter((item) =>
        item.issues.some((issue) => issue.severity === "critical"),
      );
  }, [selectedRows, issuesByRow]);

  const visibleCleanInvoiceItems = showOnlyBlocked ? [] : cleanInvoiceItems;
  const visibleBlockedInvoiceItems = blockedInvoiceItems;

  const selectedBlockedInvoice =
    blockedInvoiceItems.find(
      (item) => item.rowIndex === selectedBlockedRowIndex,
    ) ?? null;

  const warningCount = validationResult.issues.filter(
    (issue) => issue.severity === "warning",
  ).length;

  const criticalCount = validationResult.issues.filter(
    (issue) => issue.severity === "critical",
  ).length;

  const blockedCount = validationResult.errorRows.length;
  const cleanCount = validationResult.cleanRows.length;

  const hasSuspiciousVat = validationResult.issues.some(
    (issue) =>
      issue.field.toLowerCase().includes("vat") && issue.severity === "warning",
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
            Invoice data preflight
          </p>
          <h1 className="mt-2 text-3xl font-bold">DataPreflight</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Validate invoice CSV data before importing it into an accounting
            system. Map messy CSV headers, inspect issues, and export clean
            invoice data.
          </p>
        </section>

        {selectedRows.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Import readiness</h2>
            <p className="mt-1 text-sm text-slate-400">
              High-level insight before exporting invoice data.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              {blockedCount > 0 && (
                <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-300">
                  ⚠️ {blockedCount} blocked
                </span>
              )}

              {warningCount > 0 && (
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-yellow-200">
                  ⚠️ {warningCount} warning{warningCount === 1 ? "" : "s"}
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

              {blockedCount === 0 && warningCount === 0 && cleanCount > 0 && (
                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-green-200">
                  All selected invoices are ready for import
                </span>
              )}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <label className="block text-sm font-medium text-slate-300">
            Upload invoice CSV
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
            <h2 className="text-xl font-semibold">Field mapping</h2>
            <p className="mt-1 text-sm text-slate-400">
              Map the uploaded CSV headers to the invoice fields DataPreflight
              validates.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {expectedInvoiceFields.map((targetField) => (
                <label key={targetField} className="block">
                  <span className="text-sm font-medium text-slate-300">
                    {targetField}
                  </span>

                  <select
                    value={fieldMapping[targetField]}
                    onChange={(event) =>
                      updateFieldMapping(targetField, event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="">Not mapped</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            {missingExpectedFields.length > 0 ? (
              <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                Missing mappings: {missingExpectedFields.join(", ")}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">
                All expected invoice fields are mapped.
              </div>
            )}
          </section>
        )}

        {headers.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Detected CSV headers</h2>
            <p className="mt-1 text-sm text-slate-400">
              These are the raw fields found in the uploaded file.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {headers.map((header) => (
                <span
                  key={header}
                  className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-sm text-slate-300"
                >
                  {header}
                </span>
              ))}
            </div>
          </section>
        )}

        {selectedRows.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Preflight summary</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard label="Total invoices" value={selectedRows.length} />
              <SummaryCard
                label="Ready for import"
                value={validationResult.cleanRows.length}
              />
              <SummaryCard
                label="Blocked invoices"
                value={validationResult.errorRows.length}
              />
              <SummaryCard label="Critical issues" value={criticalCount} />
              <SummaryCard label="Warnings" value={warningCount} />
            </div>
          </section>
        )}

        {selectedRows.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Invoice review</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Review clean and blocked invoices before exporting.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleBlockedFilter}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  showOnlyBlocked
                    ? "border-red-500/30 bg-red-500/20 text-red-200"
                    : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500"
                }`}
              >
                {showOnlyBlocked ? "Showing blocked only" : "Show only blocked"}
              </button>
            </div>
          </section>
        )}

        {selectedRows.length > 0 && (
          <section className="grid gap-6 lg:grid-cols-2">
            <DataSetPreview
              title="Clean invoices"
              description={
                showOnlyBlocked
                  ? "Hidden while blocked-only mode is active."
                  : "These rows passed the current validation rules and are ready for export."
              }
              items={visibleCleanInvoiceItems}
              emptyMessage={
                showOnlyBlocked
                  ? "Clean invoices are hidden in blocked-only mode."
                  : "No clean invoices yet."
              }
            />

            <DataSetPreview
              title="Blocked invoices"
              description="Click a blocked invoice to inspect its issues."
              items={visibleBlockedInvoiceItems}
              emptyMessage="No blocked invoices."
              selectedRowIndex={selectedBlockedRowIndex}
              onSelectItem={setSelectedBlockedRowIndex}
            />
          </section>
        )}

        {selectedBlockedInvoice && (
          <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Blocked invoice detail
                </h2>
                <p className="mt-1 text-sm text-red-200">
                  Row {selectedBlockedInvoice.rowIndex} has{" "}
                  {selectedBlockedInvoice.issues.length} issue
                  {selectedBlockedInvoice.issues.length === 1 ? "" : "s"} that
                  should be fixed before import.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBlockedRowIndex(null)}
                className="text-sm text-red-200 underline underline-offset-4 hover:text-red-100"
              >
                Close detail
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-lg border border-red-500/20 bg-slate-950 p-4">
                <h3 className="text-sm font-semibold text-slate-200">
                  Invoice data
                </h3>
                <pre className="mt-3 overflow-auto text-xs text-slate-300">
                  {JSON.stringify(selectedBlockedInvoice.row, null, 2)}
                </pre>
              </div>

              <div className="space-y-3">
                {selectedBlockedInvoice.issues.map((issue) => (
                  <div
                    key={`${issue.rowIndex}-${issue.field}-${issue.type}`}
                    className="rounded-lg border border-red-500/20 bg-slate-950 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-700 px-2 py-1 text-xs uppercase text-slate-300">
                        {issue.severity}
                      </span>
                      <span className="text-sm text-slate-400">
                        Field: {issue.field}
                      </span>
                    </div>

                    <h3 className="mt-3 font-semibold">{issue.problem}</h3>
                    <p className="mt-2 text-sm text-slate-300">
                      <span className="font-medium text-slate-100">Why:</span>{" "}
                      {issue.why}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      <span className="font-medium text-slate-100">Fix:</span>{" "}
                      {issue.fix}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {validationResult.issues.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Explainable issues</h2>
            <p className="mt-1 text-sm text-slate-400">
              Every invoice issue explains what went wrong, why it matters, and
              how to fix it before import.
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
            <h2 className="text-xl font-semibold">No invoice issues found</h2>
            <p className="mt-1 text-sm text-slate-400">
              All selected invoices passed the current validation rules.
            </p>
          </section>
        )}

        {selectedRows.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Export</h2>
            <p className="mt-1 text-sm text-slate-400">
              Download clean invoice rows, export the issue report, or copy
              clean invoice JSON.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  downloadCsv("clean-invoices.csv", validationResult.cleanRows)
                }
                disabled={validationResult.cleanRows.length === 0}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download clean-invoices.csv
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadErrorCsv(
                    "invoice-errors.csv",
                    validationResult.issues,
                  )
                }
                disabled={validationResult.issues.length === 0}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Download invoice-errors.csv
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
                Copy clean invoice JSON
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function createEmptyMapping(): FieldMapping {
  return {
    invoice_number: "",
    company: "",
    email: "",
    amount: "",
    vat: "",
    status: "",
  };
}

function createSuggestedMapping(headers: string[]): FieldMapping {
  return {
    invoice_number:
      headers.find((header) => {
        const normalized = normalizeHeader(header);
        return (
          normalized.includes("invoice") ||
          normalized.includes("factuur") ||
          normalized.includes("number") ||
          normalized.includes("nummer")
        );
      }) ?? "",
    company:
      headers.find((header) => {
        const normalized = normalizeHeader(header);
        return (
          normalized.includes("company") ||
          normalized.includes("client") ||
          normalized.includes("customer") ||
          normalized.includes("bedrijf") ||
          normalized.includes("klant")
        );
      }) ?? "",
    email:
      headers.find((header) => {
        const normalized = normalizeHeader(header);
        return normalized.includes("email") || normalized.includes("mail");
      }) ?? "",
    amount:
      headers.find((header) => {
        const normalized = normalizeHeader(header);
        return (
          normalized.includes("amount") ||
          normalized.includes("total") ||
          normalized.includes("price") ||
          normalized.includes("bedrag") ||
          normalized.includes("totaal")
        );
      }) ?? "",
    vat:
      headers.find((header) => {
        const normalized = normalizeHeader(header);
        return (
          normalized.includes("vat") ||
          normalized.includes("btw") ||
          normalized.includes("tax")
        );
      }) ?? "",
    status:
      headers.find((header) => {
        const normalized = normalizeHeader(header);
        return (
          normalized.includes("status") ||
          normalized.includes("state") ||
          normalized.includes("fase")
        );
      }) ?? "",
  };
}

function normalizeHeader(header: string) {
  return header.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-950 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function DataSetPreview({
  title,
  description,
  items,
  emptyMessage,
  selectedRowIndex,
  onSelectItem,
}: {
  title: string;
  description: string;
  items: InvoicePreviewItem[];
  emptyMessage: string;
  selectedRowIndex?: number | null;
  onSelectItem?: (rowIndex: number) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{description}</p>

      {items.length === 0 ? (
        <p className="mt-4 rounded-lg bg-slate-950 p-4 text-sm text-slate-400">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-4 max-h-[360px] space-y-3 overflow-auto">
          {items.map((item) => {
            const isSelected = selectedRowIndex === item.rowIndex;
            const issueCount = item.issues.length;
            const cardContent = (
              <>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {item.row.invoice_number || `Row ${item.rowIndex}`}
                  </p>

                  {issueCount > 0 && (
                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300">
                      {issueCount} issue{issueCount === 1 ? "" : "s"}
                    </span>
                  )}
                </div>

                <pre className="overflow-auto text-xs text-slate-300">
                  {JSON.stringify(item.row, null, 2)}
                </pre>
              </>
            );

            if (!onSelectItem) {
              return (
                <div
                  key={`${title}-${item.rowIndex}`}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                >
                  {cardContent}
                </div>
              );
            }

            return (
              <button
                key={`${title}-${item.rowIndex}`}
                type="button"
                onClick={() => onSelectItem(item.rowIndex)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? "border-red-400 bg-red-500/10"
                    : "border-slate-800 bg-slate-950 hover:border-red-500/40"
                }`}
              >
                {cardContent}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
