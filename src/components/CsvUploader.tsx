"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  getInputAdapter,
  type ParsedDataSet,
  type ParsedRow,
} from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";
import { invoiceValidationProfile } from "@/lib/profiles/invoiceValidationProfile";
import {
  mapRowsToProfile,
  runValidationProfile,
} from "@/lib/validation/validationProfile";
import { downloadCsv, downloadErrorCsv } from "@/lib/exportData";

import {
  createEmptyMapping,
  createMappingSuggestions,
  createSuggestedMapping,
} from "@/lib/fieldMapping";
import type { FieldMapping, MappingSuggestion } from "@/lib/fieldMapping";

import { BlockedInvoiceDetail } from "@/components/data-preflight/BlockedInvoiceDetail";
import { FieldMappingSection } from "@/components/data-preflight/FieldMappingSection";
import { CustomerWorkspace } from "@/components/data-preflight/CustomerWorkspace";
import {
  ActiveWorkspaceHeader,
  LandingWorkspace,
  WorkspaceLayout,
  type DataDomain,
} from "@/components/data-preflight/WorkspaceLayout";
import { ImportReadinessPanel } from "@/components/data-preflight/ImportReadinessPanel";
import { InvoiceReviewSection } from "@/components/data-preflight/InvoiceReviewSection";
import { UploadSection } from "@/components/data-preflight/UploadSection";

import {
  createInvoicePreviewItem,
  type InvoicePreviewItem,
} from "@/components/data-preflight/types";

export function CsvUploader() {
  const [activeDomain, setActiveDomain] = useState<DataDomain>("invoice");
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

  const rows = useMemo(() => parsedDataSet?.rows ?? [], [parsedDataSet]);
  const headers = useMemo(() => parsedDataSet?.headers ?? [], [parsedDataSet]);

  const fileName = parsedDataSet?.fileName ?? "";

  useEffect(() => {
    if (!selectedDetailRowIndex || !detailRef.current) return;

    detailRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedDetailRowIndex]);

  async function loadSource(source: Promise<File>) {
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
      const file = await source;
      const adapter = getInputAdapter(file);

      if (!adapter) {
        throw new Error("Unsupported file type.");
      }

      const nextParsedDataSet = await adapter.parse(file);

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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to read source file. Please try again.",
      );
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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    void loadSource(Promise.resolve(file));
    event.target.value = "";
  }

  function handleTryExample() {
    void loadSource(
      fetch("/demo-data/messy-export.csv").then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "The example file could not be opened. Please try again.",
          );
        }

        return new File([await response.blob()], "messy-export.csv", {
          type: "text/csv",
        });
      }),
    );
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

  const selectedRows = useMemo(
    () => mapRowsToProfile(rows, fieldMapping, invoiceValidationProfile),
    [rows, fieldMapping],
  );

  const { normalizedRows, validationResult } = useMemo(
    () => runValidationProfile(invoiceValidationProfile, selectedRows),
    [selectedRows],
  );

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
    ? "Review required: mandatory invoice fields are not mapped."
    : hasDuplicateMappings
      ? "Review required: a source column is mapped more than once."
      : blockedCount > 0
        ? "Blocked invoices are excluded from clean export. Fix them in the source and recheck."
        : warningCount > 0
          ? "Warnings found. Review them before export."
          : cleanCount > 0
            ? "All mapped invoices passed the current checks. Confirm target ERP requirements before import."
            : "Upload and map an invoice export to start the review.";

  const hasUploadedRows = normalizedRows.length > 0;
  const hasHeaders = headers.length > 0;
  const mappedCount = Object.values(fieldMapping).filter(Boolean).length;

  function changeDomain(nextDomain: DataDomain) {
    if (nextDomain === activeDomain) return;

    resetFlow();
    setActiveDomain(nextDomain);
  }

  if (activeDomain === "customer") {
    return <CustomerWorkspace onDomainChange={changeDomain} />;
  }

  return (
    <WorkspaceLayout>
      {!hasUploadedRows ? (
        <LandingWorkspace
          domain="invoice"
          upload={
            <UploadSection
              domain="invoice"
              onDomainChange={changeDomain}
              fileName={fileName}
              isLoading={isLoading}
              error={error}
              hasActiveFile={false}
              onFileChange={handleFileChange}
              onTryExample={handleTryExample}
              onReset={resetFlow}
            />
          }
        />
      ) : (
        <>
          <ActiveWorkspaceHeader
            domain="invoice"
            description="Review the analysis summary, then inspect the invoice rows that need action."
            upload={
              <UploadSection
                domain="invoice"
                onDomainChange={changeDomain}
                fileName={fileName}
                isLoading={isLoading}
                error={error}
                hasActiveFile={
                  rows.length > 0 || Boolean(error) || Boolean(fileName)
                }
                onFileChange={handleFileChange}
                onTryExample={handleTryExample}
                onReset={resetFlow}
              />
            }
          />

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

      {hasUploadedRows && (
        <FloatingExportButton
          canExport={canExport}
          cleanRows={validationResult.cleanRows}
          issues={validationResult.issues}
          onDownloadCleanCsv={downloadCsv}
          onDownloadErrorCsv={downloadErrorCsv}
        />
      )}

      {hasHeaders && !isFieldMappingOpen && (
        <button
          type="button"
          onClick={() => setIsFieldMappingOpen(true)}
          className="fixed right-0 top-1/2 z-40 flex h-24 w-9 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-white/10 bg-[var(--surface-base)]/95 text-[var(--text-primary)] shadow-lg shadow-black/20 backdrop-blur-xl transition hover:w-10 hover:border-[color:rgba(182,111,58,0.6)] hover:bg-[var(--surface-raised)] hover:text-[var(--brand-accent)]"
          aria-label="Open field mapping panel"
          title="Open field mapping"
        >
          <span className="text-base leading-none">⚙</span>

          {(hasIncompleteMapping || hasDuplicateMappings) && (
            <span className="absolute left-1 top-2 h-2 w-2 rounded-full bg-[var(--brand-accent)] shadow-lg shadow-[rgba(182,111,58,0.35)]" />
          )}
        </button>
      )}

      {hasHeaders && isFieldMappingOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close mapping panel"
            onClick={() => setIsFieldMappingOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[var(--surface-base)]/98 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]">
                  Configuration layer
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                  Field mapping
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                  Review how source headers are mapped into invoice fields. Keep
                  this closed during normal invoice review.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-[var(--surface-deep)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                    {mappedCount}/{mappingSuggestions.length} mapped
                  </span>

                  {parsedDataSet && (
                    <span className="rounded-full border border-white/10 bg-[var(--surface-deep)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                      {parsedDataSet.sourceType.toUpperCase()} source
                    </span>
                  )}

                  {parsedDataSet?.metadata?.sheetName && (
                    <span className="rounded-full border border-white/10 bg-[var(--surface-deep)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                      Sheet: {parsedDataSet.metadata.sheetName}
                    </span>
                  )}

                  {(hasIncompleteMapping || hasDuplicateMappings) && (
                    <span className="rounded-full border border-[color:rgba(182,111,58,0.35)] bg-[rgba(182,111,58,0.1)] px-2.5 py-1 text-[11px] font-medium text-[var(--brand-accent)]">
                      Needs review
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFieldMappingOpen(false)}
                className="rounded-full border border-white/10 bg-[var(--surface-deep)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[color:rgba(182,111,58,0.45)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
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
    </WorkspaceLayout>
  );
}

function FloatingExportButton({
  canExport,
  cleanRows,
  issues,
  onDownloadCleanCsv,
  onDownloadErrorCsv,
}: {
  canExport: boolean;
  cleanRows: ParsedRow[];
  issues: ValidationIssue[];
  onDownloadCleanCsv: (filename: string, rows: ParsedRow[]) => void;
  onDownloadErrorCsv: (filename: string, issues: ValidationIssue[]) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2 rounded-2xl border border-white/10 bg-[var(--surface-base)]/95 p-3 shadow-2xl shadow-black/35 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => onDownloadCleanCsv("clean-invoices.csv", cleanRows)}
        disabled={!canExport}
        className="rounded-xl bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--brand-accent-soft)] disabled:cursor-not-allowed disabled:opacity-35"
      >
        Export clean CSV
      </button>

      <button
        type="button"
        onClick={() => onDownloadErrorCsv("invoice-errors.csv", issues)}
        disabled={issues.length === 0}
        className="rounded-xl border border-white/10 bg-[var(--surface-deep)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[color:rgba(182,111,58,0.45)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-35"
      >
        Issue report
      </button>
    </div>
  );
}