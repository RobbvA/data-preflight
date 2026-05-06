"use client";

import { useMemo, useState } from "react";
import { parseCsvFile, type CsvRow } from "@/lib/parseCsv";
import { validateRows, type ValidationIssue } from "@/lib/validateRows";
import { downloadCsv, downloadErrorCsv } from "@/lib/exportData";

import { BlockedInvoiceDetail } from "@/components/data-preflight/BlockedInvoiceDetail";
import { DataSetPreview } from "@/components/data-preflight/DataSetPreview";
import { ExportSection } from "@/components/data-preflight/ExportSection";
import { FieldMappingSection } from "@/components/data-preflight/FieldMappingSection";
import { ImportReadinessPanel } from "@/components/data-preflight/ImportReadinessPanel";
import { PreflightSummary } from "@/components/data-preflight/PreflightSummary";
import { UploadSection } from "@/components/data-preflight/UploadSection";

import type { InvoicePreviewItem } from "@/components/data-preflight/types";

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
  const [isCleanOpen, setIsCleanOpen] = useState(false);
  const [isBlockedOpen, setIsBlockedOpen] = useState(true);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setIsLoading(true);
    setFileName(file.name);
    setSelectedBlockedRowIndex(null);
    setShowOnlyBlocked(false);
    setIsCleanOpen(false);
    setIsBlockedOpen(true);

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
      setIsCleanOpen(false);
      setIsBlockedOpen(true);
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
    setIsCleanOpen(false);
    setIsBlockedOpen(true);
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

  const duplicateMappedHeaders = useMemo(() => {
    const usedHeaders = Object.values(fieldMapping).filter(Boolean);

    return usedHeaders.filter(
      (header, index) => usedHeaders.indexOf(header) !== index,
    );
  }, [fieldMapping]);

  const hasDuplicateMappings = duplicateMappedHeaders.length > 0;
  const hasIncompleteMapping = missingExpectedFields.length > 0;

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

  const canExport =
    !hasIncompleteMapping &&
    !hasDuplicateMappings &&
    validationResult.cleanRows.length > 0;

  const importReadinessMessage = hasIncompleteMapping
    ? "Import blocked: required fields are not mapped."
    : hasDuplicateMappings
      ? "Import blocked: one or more CSV columns are mapped multiple times."
      : blockedCount > 0
        ? "Import will fail unless blocked invoices are fixed."
        : warningCount > 0
          ? "Import possible, but warnings should be reviewed first."
          : cleanCount > 0
            ? "All mapped invoices are ready for import."
            : "Upload and map invoice data to start the preflight check.";

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
          <ImportReadinessPanel
            importReadinessMessage={importReadinessMessage}
            hasIncompleteMapping={hasIncompleteMapping}
            hasDuplicateMappings={hasDuplicateMappings}
            blockedCount={blockedCount}
            warningCount={warningCount}
            cleanCount={cleanCount}
            hasSuspiciousVat={hasSuspiciousVat}
          />
        )}

        <UploadSection
          fileName={fileName}
          isLoading={isLoading}
          error={error}
          hasActiveFile={rows.length > 0 || Boolean(error) || Boolean(fileName)}
          onFileChange={handleFileChange}
          onReset={resetFlow}
        />

        {headers.length > 0 && (
          <FieldMappingSection
            headers={headers}
            expectedInvoiceFields={expectedInvoiceFields}
            fieldMapping={fieldMapping}
            onUpdateFieldMapping={updateFieldMapping}
          />
        )}

        {selectedRows.length > 0 && (
          <PreflightSummary
            totalInvoices={selectedRows.length}
            cleanCount={cleanCount}
            blockedCount={blockedCount}
            criticalCount={criticalCount}
            warningCount={warningCount}
          />
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
              isOpen={isCleanOpen}
              onToggle={() => setIsCleanOpen((current) => !current)}
            />

            <DataSetPreview
              title="Blocked invoices"
              description="Click a blocked invoice to inspect its issues."
              items={visibleBlockedInvoiceItems}
              emptyMessage="No blocked invoices."
              selectedRowIndex={selectedBlockedRowIndex}
              onSelectItem={setSelectedBlockedRowIndex}
              isOpen={isBlockedOpen}
              onToggle={() => setIsBlockedOpen((current) => !current)}
            />
          </section>
        )}

        {selectedBlockedInvoice && (
          <BlockedInvoiceDetail
            selectedBlockedInvoice={selectedBlockedInvoice}
            onClose={() => setSelectedBlockedRowIndex(null)}
          />
        )}

        {selectedRows.length > 0 && (
          <ExportSection
            canExport={canExport}
            cleanRows={validationResult.cleanRows}
            issues={validationResult.issues}
            onDownloadCleanCsv={downloadCsv}
            onDownloadErrorCsv={downloadErrorCsv}
          />
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