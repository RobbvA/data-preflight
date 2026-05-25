"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { parseCsvFile, type CsvRow } from "@/lib/parseCsv";
import { validateRows, type ValidationIssue } from "@/lib/validateRows";
import { normalizeInvoiceRows } from "@/lib/normalizeInvoice";
import { downloadCsv, downloadErrorCsv } from "@/lib/exportData";

import {
  createEmptyMapping,
  createMappingSuggestions,
  createSuggestedMapping,
} from "@/lib/fieldMapping";

import type { FieldMapping, MappingSuggestion } from "@/lib/fieldMapping";

import { BlockedInvoiceDetail } from "@/components/data-preflight/BlockedInvoiceDetail";
import { FieldMappingSection } from "@/components/data-preflight/FieldMappingSection";
import { ImportReadinessPanel } from "@/components/data-preflight/ImportReadinessPanel";
import { InvoiceReviewSection } from "@/components/data-preflight/InvoiceReviewSection";
import { UploadSection } from "@/components/data-preflight/UploadSection";

import {
  createInvoicePreviewItem,
  type InvoicePreviewItem,
} from "@/components/data-preflight/types";

export function CsvUploader() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] =
    useState<FieldMapping>(createEmptyMapping());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPreviewRowIndex, setSelectedPreviewRowIndex] = useState<
    number | null
  >(null);
  const [selectedDetailRowIndex, setSelectedDetailRowIndex] = useState<
    number | null
  >(null);

  const [showOnlyBlocked, setShowOnlyBlocked] = useState(false);

  const [isCleanOpen, setIsCleanOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(true);
  const [isBlockedOpen, setIsBlockedOpen] = useState(true);

  const [isFieldMappingOpen, setIsFieldMappingOpen] = useState(false);

  const detailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedDetailRowIndex || !detailRef.current) return;

    detailRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedDetailRowIndex]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setIsLoading(true);
    setFileName(file.name);
    setSelectedPreviewRowIndex(null);
    setSelectedDetailRowIndex(null);
    setShowOnlyBlocked(false);
    setIsCleanOpen(false);
    setIsWarningOpen(true);
    setIsBlockedOpen(true);
    setIsFieldMappingOpen(false);

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
      setFieldMapping(createSuggestedMapping(detectedHeaders, parsedRows));
    } catch {
      setError("Failed to parse CSV file. Please check the file format.");
      setRows([]);
      setHeaders([]);
      setFieldMapping(createEmptyMapping());
      setSelectedPreviewRowIndex(null);
      setSelectedDetailRowIndex(null);
      setShowOnlyBlocked(false);
      setIsCleanOpen(false);
      setIsWarningOpen(true);
      setIsBlockedOpen(true);
      setIsFieldMappingOpen(false);
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
    setSelectedPreviewRowIndex(null);
    setSelectedDetailRowIndex(null);
    setShowOnlyBlocked(false);
    setIsCleanOpen(false);
    setIsWarningOpen(true);
    setIsBlockedOpen(true);
    setIsFieldMappingOpen(false);
  }

  function updateFieldMapping(
    targetField: keyof FieldMapping,
    sourceField: string,
  ) {
    setFieldMapping((currentMapping) => ({
      ...currentMapping,
      [targetField]: sourceField,
    }));

    setSelectedPreviewRowIndex(null);
    setSelectedDetailRowIndex(null);
  }

  function toggleBlockedFilter() {
    setShowOnlyBlocked((currentValue) => !currentValue);
    setSelectedPreviewRowIndex(null);
    setSelectedDetailRowIndex(null);
  }

  function toggleSelectedPreviewInvoice(rowIndex: number) {
    setSelectedPreviewRowIndex((currentRowIndex) =>
      currentRowIndex === rowIndex ? null : rowIndex,
    );
  }

  function viewInvoiceDetails(rowIndex: number) {
    setSelectedPreviewRowIndex(rowIndex);
    setSelectedDetailRowIndex(rowIndex);
  }

  const mappingSuggestions = useMemo<MappingSuggestion[]>(() => {
    return createMappingSuggestions(headers, rows);
  }, [headers, rows]);

  const selectedRows = useMemo(() => {
    return rows.map((row) => {
      const mappedRow: CsvRow = {};

      mappingSuggestions.forEach((suggestion) => {
        const targetField = suggestion.targetField;
        const sourceField = fieldMapping[targetField];

        mappedRow[targetField] = sourceField ? (row[sourceField] ?? "") : "";
      });

      return mappedRow;
    });
  }, [rows, fieldMapping, mappingSuggestions]);

  const normalizedRows = useMemo(() => {
    return normalizeInvoiceRows(selectedRows);
  }, [selectedRows]);

  const validationResult = useMemo(() => {
    return validateRows(normalizedRows);
  }, [normalizedRows]);

  const missingExpectedFields = useMemo(() => {
    return mappingSuggestions
      .filter((suggestion) => suggestion.required)
      .filter((suggestion) => !fieldMapping[suggestion.targetField])
      .map((suggestion) => suggestion.targetField);
  }, [fieldMapping, mappingSuggestions]);

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

  const invoiceItems = useMemo<InvoicePreviewItem[]>(() => {
    return normalizedRows
      .map((row, index) =>
        createInvoicePreviewItem({
          rowIndex: index + 1,
          row,
          issues: issuesByRow[index + 1] ?? [],
        }),
      )
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [normalizedRows, issuesByRow]);

  const blockedInvoiceItems = useMemo(() => {
    return invoiceItems.filter((item) =>
      item.issues.some((issue) => issue.severity === "critical"),
    );
  }, [invoiceItems]);

  const warningInvoiceItems = useMemo(() => {
    return invoiceItems.filter(
      (item) =>
        item.issues.length > 0 &&
        item.issues.every((issue) => issue.severity === "warning"),
    );
  }, [invoiceItems]);

  const cleanInvoiceItems = useMemo(() => {
    return invoiceItems.filter((item) => item.issues.length === 0);
  }, [invoiceItems]);

  const selectedInvoice =
    invoiceItems.find((item) => item.rowIndex === selectedDetailRowIndex) ??
    null;

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

  const hasUploadedRows = normalizedRows.length > 0;
  const hasHeaders = headers.length > 0;
  const mappedCount = Object.values(fieldMapping).filter(Boolean).length;

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b14] px-5 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-slate-500/12 blur-3xl" />
        <div className="absolute right-[-220px] top-28 h-[500px] w-[620px] rounded-full bg-blue-500/7 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[420px] w-[620px] rounded-full bg-cyan-500/6 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.18),_rgba(7,11,20,1))]" />
      </div>

      <div className="mx-auto max-w-[1380px] space-y-7">
        <section className="grid gap-6 pt-4 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Data profile preflight
            </p>

            <h1 className="mt-4 max-w-3xl bg-gradient-to-r from-slate-50 via-slate-200 to-cyan-100 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
              DataPreflight
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              A trust layer for messy business data exports. Map headers,
              validate business rules, inspect issues, and export only trusted
              data.
            </p>
          </div>

          <UploadSection
            fileName={fileName}
            isLoading={isLoading}
            error={error}
            hasActiveFile={
              rows.length > 0 || Boolean(error) || Boolean(fileName)
            }
            onFileChange={handleFileChange}
            onReset={resetFlow}
          />
        </section>

        {hasUploadedRows && (
          <ImportReadinessPanel
            importReadinessMessage={importReadinessMessage}
            totalInvoices={normalizedRows.length}
            hasIncompleteMapping={hasIncompleteMapping}
            hasDuplicateMappings={hasDuplicateMappings}
            blockedCount={blockedCount}
            warningCount={warningCount}
            cleanCount={cleanCount}
            criticalCount={criticalCount}
            hasSuspiciousVat={hasSuspiciousVat}
            canExport={canExport}
            cleanRows={validationResult.cleanRows}
            issues={validationResult.issues}
            onDownloadCleanCsv={downloadCsv}
            onDownloadErrorCsv={downloadErrorCsv}
          />
        )}

        {hasUploadedRows && (
          <InvoiceReviewSection
            showOnlyBlocked={showOnlyBlocked}
            cleanInvoiceItems={cleanInvoiceItems}
            warningInvoiceItems={warningInvoiceItems}
            blockedInvoiceItems={blockedInvoiceItems}
            selectedRowIndex={selectedPreviewRowIndex}
            isCleanOpen={isCleanOpen}
            isWarningOpen={isWarningOpen}
            isBlockedOpen={isBlockedOpen}
            onToggleBlockedFilter={toggleBlockedFilter}
            onSelectInvoice={toggleSelectedPreviewInvoice}
            onViewInvoiceDetails={viewInvoiceDetails}
            onToggleCleanOpen={() => setIsCleanOpen((current) => !current)}
            onToggleWarningOpen={() => setIsWarningOpen((current) => !current)}
            onToggleBlockedOpen={() => setIsBlockedOpen((current) => !current)}
          />
        )}

        {selectedInvoice && (
          <div ref={detailRef}>
            <BlockedInvoiceDetail
              selectedInvoice={selectedInvoice}
              onClose={() => setSelectedDetailRowIndex(null)}
            />
          </div>
        )}

        {!hasHeaders && (
          <section className="rounded-[1.75rem] border border-dashed border-slate-700/55 bg-slate-900/35 p-5 shadow-xl shadow-black/15 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600">
              Mapping setup
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-100">
              Waiting for CSV headers
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Upload a CSV to detect headers and create the field mapping layer.
            </p>
          </section>
        )}

        <ProductFooter />
      </div>

      {hasHeaders && !isFieldMappingOpen && (
        <button
          type="button"
          onClick={() => setIsFieldMappingOpen(true)}
          className="fixed right-0 top-1/2 z-40 flex h-24 w-9 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-slate-700/60 bg-slate-950/70 text-slate-400 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:w-10 hover:border-cyan-300/25 hover:bg-slate-900 hover:text-cyan-100"
          aria-label="Open field mapping panel"
          title="Open field mapping"
        >
          <span className="text-base leading-none">⚙</span>

          {(hasIncompleteMapping || hasDuplicateMappings) && (
            <span className="absolute left-1 top-2 h-2 w-2 rounded-full bg-amber-300 shadow-lg shadow-amber-300/35" />
          )}
        </button>
      )}

      {hasHeaders && isFieldMappingOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close mapping panel"
            onClick={() => setIsFieldMappingOpen(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-700/55 bg-[#090f1d]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-700/45 pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Configuration layer
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-50">
                  Field mapping
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Review how CSV headers are mapped into invoice fields. Keep
                  this closed during normal invoice review.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2.5 py-1 text-[11px] text-slate-400">
                    {mappedCount}/{mappingSuggestions.length} mapped
                  </span>

                  {(hasIncompleteMapping || hasDuplicateMappings) && (
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-2.5 py-1 text-[11px] font-medium text-amber-100">
                      Needs review
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFieldMappingOpen(false)}
                className="rounded-full border border-slate-700/70 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800/70 hover:text-slate-100"
              >
                Close
              </button>
            </div>

            <FieldMappingSection
              headers={headers}
              fieldMapping={fieldMapping}
              mappingSuggestions={mappingSuggestions}
              isOpen
              onToggleOpen={() => setIsFieldMappingOpen(false)}
              onUpdateFieldMapping={updateFieldMapping}
            />
          </aside>
        </div>
      )}
    </main>
  );
}

function ProductFooter() {
  return (
    <footer className="border-t border-slate-800/80 py-6">
      <div className="flex flex-col gap-3 text-xs text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-slate-500">
            © 2026 DataPreflight. All rights reserved.
          </p>

          <p className="mt-1">
            Built for trusted operational imports and explainable data review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Privacy-first processing</span>
          <span className="hidden text-slate-700 sm:inline">•</span>
          <span>Client-side validation</span>
          <span className="hidden text-slate-700 sm:inline">•</span>
          <span>MVP v1</span>
        </div>
      </div>
    </footer>
  );
}
