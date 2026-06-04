"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { csvAdapter, type ParsedDataSet, type ParsedRow } from "@/lib/parseCsv";
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
  const [parsedDataSet, setParsedDataSet] = useState<ParsedDataSet | null>(
    null,
  );

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

  const rows = parsedDataSet?.rows ?? [];
  const headers = parsedDataSet?.headers ?? [];
  const fileName = parsedDataSet?.fileName ?? "";
  const sourceType = parsedDataSet?.sourceType ?? "csv";

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
    setSelectedPreviewRowIndex(null);
    setSelectedDetailRowIndex(null);
    setShowOnlyBlocked(false);
    setIsCleanOpen(false);
    setIsWarningOpen(true);
    setIsBlockedOpen(true);
    setIsFieldMappingOpen(false);

    try {
      if (!csvAdapter.canParse(file)) {
        throw new Error("Unsupported file type.");
      }

      const nextParsedDataSet = await csvAdapter.parse(file);

      if (nextParsedDataSet.rows.length === 0) {
        throw new Error("Source file is empty.");
      }

      if (nextParsedDataSet.headers.length === 0) {
        throw new Error("Source file has no headers.");
      }

      setParsedDataSet(nextParsedDataSet);
      setFieldMapping(
        createSuggestedMapping(
          nextParsedDataSet.headers,
          nextParsedDataSet.rows,
        ),
      );
    } catch {
      setError("Failed to parse source file. Please check the file format.");
      setParsedDataSet(null);
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
    setParsedDataSet(null);
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
      const mappedRow: ParsedRow = {};

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

  const blockedCount = blockedInvoiceItems.length;
  const warningCount = warningInvoiceItems.length;
  const cleanCount = cleanInvoiceItems.length;

  const criticalCount = validationResult.issues.filter(
    (issue) => issue.severity === "critical",
  ).length;

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
      ? "Import blocked: one or more source columns are mapped multiple times."
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
    <main className="min-h-screen overflow-hidden bg-[#08111f] px-5 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-220px] top-28 h-[500px] w-[620px] rounded-full bg-blue-500/8 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[420px] w-[620px] rounded-full bg-slate-400/8 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.16),_rgba(8,17,31,1))]" />
      </div>

      <div className="mx-auto max-w-[1380px] space-y-7">
        {!hasUploadedRows ? (
          <section className="flex min-h-[calc(100vh-6rem)] items-center py-10">
            <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_520px] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
                  Operational invoice preflight
                </p>

                <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-slate-50 sm:text-6xl lg:text-7xl">
                  Find risky invoice data before it enters your system.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
                  DataPreflight analyzes messy business exports, detects
                  operational risks, explains what needs attention, and prepares
                  trusted clean output.
                </p>

                <div className="mt-7 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                  <ValuePoint text="Detect blocked invoices and risky rows" />
                  <ValuePoint text="Normalize messy invoice data" />
                  <ValuePoint text="Validate business rules before import" />
                  <ValuePoint text="Export only trusted clean data" />
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-2">
                  <SourcePill label="CSV supported" tone="active" />
                  <SourcePill label="Excel planned" />
                  <SourcePill label="PDF planned" />
                  <SourcePill label="Images planned" />
                </div>
              </div>

              <UploadSection
                fileName={fileName}
                isLoading={isLoading}
                error={error}
                hasActiveFile={false}
                onFileChange={handleFileChange}
                onReset={resetFlow}
              />
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-5 pt-4 lg:grid-cols-[1fr_420px] lg:items-start">
              <div className="py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
                  Operational invoice preflight
                </p>

                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
                  DataPreflight
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                  Review the analysis summary first, then inspect only the rows
                  that need action.
                </p>

                {parsedDataSet && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-700/60 bg-slate-900/55 px-2.5 py-1 text-[11px] text-slate-400">
                      {parsedDataSet.rowCount} invoices detected
                    </span>

                    <span className="rounded-full border border-slate-700/60 bg-slate-900/55 px-2.5 py-1 text-[11px] text-slate-400">
                      {sourceType.toUpperCase()} source
                    </span>

                    <span className="rounded-full border border-slate-700/60 bg-slate-900/55 px-2.5 py-1 text-[11px] text-slate-400">
                      {headers.length} mapped header
                      {headers.length === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
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

            <InvoiceReviewSection
              showOnlyBlocked={showOnlyBlocked}
              cleanInvoiceItems={cleanInvoiceItems}
              warningInvoiceItems={warningInvoiceItems}
              blockedInvoiceItems={blockedInvoiceItems}
              criticalCount={criticalCount}
              selectedRowIndex={selectedPreviewRowIndex}
              isCleanOpen={isCleanOpen}
              isWarningOpen={isWarningOpen}
              isBlockedOpen={isBlockedOpen}
              onToggleBlockedFilter={toggleBlockedFilter}
              onSelectInvoice={toggleSelectedPreviewInvoice}
              onViewInvoiceDetails={viewInvoiceDetails}
              onToggleCleanOpen={() => setIsCleanOpen((current) => !current)}
              onToggleWarningOpen={() =>
                setIsWarningOpen((current) => !current)
              }
              onToggleBlockedOpen={() =>
                setIsBlockedOpen((current) => !current)
              }
            />

            {selectedInvoice && (
              <div ref={detailRef}>
                <BlockedInvoiceDetail
                  selectedInvoice={selectedInvoice}
                  onClose={() => setSelectedDetailRowIndex(null)}
                />
              </div>
            )}
          </>
        )}

        <ProductFooter />
      </div>

      {hasHeaders && !isFieldMappingOpen && (
        <button
          type="button"
          onClick={() => setIsFieldMappingOpen(true)}
          className="fixed right-0 top-1/2 z-40 flex h-24 w-9 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-slate-700/60 bg-slate-950/75 text-slate-400 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:w-10 hover:border-cyan-300/25 hover:bg-slate-900 hover:text-cyan-100"
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
                  Review how source headers are mapped into invoice fields. Keep
                  this closed during normal invoice review.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2.5 py-1 text-[11px] text-slate-400">
                    {mappedCount}/{mappingSuggestions.length} mapped
                  </span>

                  {parsedDataSet && (
                    <span className="rounded-full border border-slate-700/60 bg-slate-950/35 px-2.5 py-1 text-[11px] text-slate-400">
                      {parsedDataSet.sourceType.toUpperCase()} source
                    </span>
                  )}

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

function ValuePoint({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/45 bg-slate-900/45 px-4 py-3 text-slate-300">
      <span className="mr-2 text-cyan-200">✓</span>
      {text}
    </div>
  );
}

function SourcePill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "active" | "neutral";
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        tone === "active"
          ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-100"
          : "border-slate-700/60 bg-slate-900/45 text-slate-500"
      }`}
    >
      {label}
    </span>
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
