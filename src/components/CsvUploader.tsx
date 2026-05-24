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
    <main className="min-h-screen overflow-hidden bg-[#0b1020] px-5 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-180px] h-[620px] w-[980px] -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute right-[-140px] top-28 h-[520px] w-[680px] rounded-full bg-violet-500/18 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[-120px] h-[440px] w-[660px] rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.14),_transparent_36%),linear-gradient(180deg,_rgba(30,41,59,0.28),_rgba(11,16,32,1))]" />
      </div>

      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="grid gap-5 pt-4 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">
              Data profile preflight
            </p>

            <h1 className="mt-3 max-w-3xl bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
              DataPreflight
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
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
          <section className="rounded-2xl border border-dashed border-white/12 bg-white/[0.045] p-4 shadow-xl shadow-slate-950/15 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Mapping setup
            </p>

            <h2 className="mt-1.5 text-lg font-semibold text-slate-100">
              Waiting for CSV headers
            </h2>

            <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-400">
              Upload a CSV to detect headers and create the field mapping layer.
            </p>
          </section>
        )}
      </div>

      {hasHeaders && !isFieldMappingOpen && (
        <button
          type="button"
          onClick={() => setIsFieldMappingOpen(true)}
          className="fixed right-0 top-1/2 z-40 flex h-24 w-9 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-cyan-300/10 bg-[#10182b]/70 text-cyan-100/70 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:w-10 hover:border-cyan-200/25 hover:bg-[#14203a]/90 hover:text-white"
          aria-label="Open field mapping panel"
          title="Open field mapping"
        >
          <span className="text-base leading-none">⚙</span>

          {(hasIncompleteMapping || hasDuplicateMappings) && (
            <span className="absolute left-1 top-2 h-2 w-2 rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/40" />
          )}
        </button>
      )}

      {hasHeaders && isFieldMappingOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close mapping panel"
            onClick={() => setIsFieldMappingOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-white/12 bg-[#0d1528]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
                  Configuration layer
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  Field mapping
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                  Review how CSV headers are mapped into invoice fields. Keep
                  this closed during normal invoice review.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                    {mappedCount}/{mappingSuggestions.length} mapped
                  </span>

                  {(hasIncompleteMapping || hasDuplicateMappings) && (
                    <span className="rounded-full border border-yellow-300/20 bg-yellow-400/[0.08] px-2.5 py-1 text-[11px] font-medium text-yellow-100/90">
                      Needs review
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFieldMappingOpen(false)}
                className="rounded-full border border-white/12 bg-white/[0.055] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
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
