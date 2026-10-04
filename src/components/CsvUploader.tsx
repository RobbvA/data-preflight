"use client";

import { useMemo, useState } from "react";

import { getInputAdapter, type ParsedDataSet } from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";
import { invoiceValidationProfile } from "@/lib/profiles/invoiceValidationProfile";
import { getProfileMismatchMessage } from "@/lib/profileCompatibility";
import {
  mapRowsToProfile,
  runValidationProfile,
} from "@/lib/validation/validationProfile";
import {
  downloadCsv,
  downloadErrorCsv,
  getExportSafetyMessage,
} from "@/lib/exportData";

import {
  createEmptyMapping,
  createMappingSuggestions,
  createSuggestedMapping,
} from "@/lib/fieldMapping";
import type { FieldMapping, MappingSuggestion } from "@/lib/fieldMapping";

import { FieldMappingSection } from "@/components/data-preflight/FieldMappingSection";
import { CustomerWorkspace } from "@/components/data-preflight/CustomerWorkspace";
import {
  ActiveWorkspaceHeader,
  LandingWorkspace,
  WorkspaceLayout,
  type DataDomain,
} from "@/components/data-preflight/WorkspaceLayout";
import { ImportReadinessPanel } from "@/components/data-preflight/ImportReadinessPanel";
import {
  InvoiceReviewSection,
  type ReviewTab,
} from "@/components/data-preflight/InvoiceReviewSection";
import { UploadSection } from "@/components/data-preflight/UploadSection";
import { ValidationContextPanel } from "@/components/data-preflight/ValidationContextPanel";

import {
  createInvoicePreviewItem,
  type InvoicePreviewItem,
} from "@/components/data-preflight/types";

export function CsvUploader() {
  const [activeDomain, setActiveDomain] = useState<DataDomain | null>(null);
  const [profilePrompt, setProfilePrompt] = useState(false);
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
  const [showOnlyBlocked, setShowOnlyBlocked] = useState(false);

  const [isCleanOpen, setIsCleanOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(true);
  const [isBlockedOpen, setIsBlockedOpen] = useState(true);

  const [isFieldMappingOpen, setIsFieldMappingOpen] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState<ReviewTab>("blocked");

  const rows = useMemo(() => parsedDataSet?.rows ?? [], [parsedDataSet]);
  const headers = useMemo(() => parsedDataSet?.headers ?? [], [parsedDataSet]);

  const fileName = parsedDataSet?.fileName ?? "";

  async function loadSource(source: Promise<File>) {
    if (!activeDomain) {
      setProfilePrompt(true);
      return;
    }

    setError(null);
    setIsLoading(true);
    setSelectedPreviewRowIndex(null);
    setShowOnlyBlocked(false);
    setIsCleanOpen(false);
    setIsWarningOpen(true);
    setIsBlockedOpen(true);
    setIsFieldMappingOpen(false);
    setActiveReviewTab("blocked");

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

      const mismatchMessage = getProfileMismatchMessage(
        nextParsedDataSet.headers,
        "invoice",
      );

      if (mismatchMessage) {
        throw new Error(mismatchMessage);
      }

      const suggestedMapping = createSuggestedMapping(
        nextParsedDataSet.headers,
        nextParsedDataSet.rows,
      );
      const selectedHeaders = Object.values(suggestedMapping).filter(Boolean);
      const requiresMappingReview =
        invoiceValidationProfile.fields.some(
          (field) => field.required && !suggestedMapping[field.key],
        ) || new Set(selectedHeaders).size !== selectedHeaders.length;

      setParsedDataSet(nextParsedDataSet);
      setFieldMapping(suggestedMapping);
      setIsFieldMappingOpen(requiresMappingReview);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to read source file. Please try again.",
      );
      setParsedDataSet(null);
      setFieldMapping(createEmptyMapping());
      setSelectedPreviewRowIndex(null);
      setShowOnlyBlocked(false);
      setIsCleanOpen(false);
      setIsWarningOpen(true);
      setIsBlockedOpen(true);
      setIsFieldMappingOpen(false);
      setActiveReviewTab("blocked");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!activeDomain) {
      setProfilePrompt(true);
      event.target.value = "";
      return;
    }

    void loadSource(Promise.resolve(file));
    event.target.value = "";
  }

  function handleTryExample() {
    if (!activeDomain) {
      setProfilePrompt(true);
      return;
    }

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
    setShowOnlyBlocked(false);
    setIsCleanOpen(false);
    setIsWarningOpen(true);
    setIsBlockedOpen(true);
    setIsFieldMappingOpen(false);
    setActiveReviewTab("blocked");
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
  }

  function toggleBlockedFilter() {
    setShowOnlyBlocked((currentValue) => !currentValue);
    setSelectedPreviewRowIndex(null);
  }

  function handleReviewAction(target: ReviewTab) {
    setActiveReviewTab(target);
    setShowOnlyBlocked(false);
    setSelectedPreviewRowIndex(null);

    if (target === "blocked") setIsBlockedOpen(true);
    if (target === "warning") setIsWarningOpen(true);
    if (target === "ready") setIsCleanOpen(true);

    requestAnimationFrame(() => {
      document
        .getElementById("invoice-review-workspace")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleSelectedPreviewInvoice(rowIndex: number) {
    setSelectedPreviewRowIndex((currentRowIndex) =>
      currentRowIndex === rowIndex ? null : rowIndex,
    );
  }

  const mappingSuggestions = useMemo<MappingSuggestion[]>(() => {
    return createMappingSuggestions(headers, rows);
  }, [headers, rows]);

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
  const mappingReady = !hasIncompleteMapping && !hasDuplicateMappings;

  const selectedRows = useMemo(
    () =>
      mappingReady
        ? mapRowsToProfile(rows, fieldMapping, invoiceValidationProfile)
        : [],
    [rows, fieldMapping, mappingReady],
  );

  const { normalizedRows, validationResult } = useMemo(
    () =>
      mappingReady
        ? runValidationProfile(invoiceValidationProfile, selectedRows)
        : {
            normalizedRows: [],
            validationResult: { issues: [], cleanRows: [], errorRows: [] },
          },
    [mappingReady, selectedRows],
  );

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

  const canExport = mappingReady && validationResult.cleanRows.length > 0;

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

  const hasUploadedRows = rows.length > 0;
  const hasHeaders = headers.length > 0;
  const mappedCount = Object.values(fieldMapping).filter(Boolean).length;

  function changeDomain(nextDomain: DataDomain) {
    setProfilePrompt(false);
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
          domain={activeDomain ?? "invoice"}
          upload={
            <UploadSection
              domain={activeDomain}
              onDomainChange={changeDomain}
              profilePrompt={profilePrompt}
              onProfileRequired={() => setProfilePrompt(true)}
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

          <section
            aria-label="Field mapping"
            className={`rounded-2xl border bg-[var(--surface-base)] ${
              mappingReady
                ? "border-white/10 p-4"
                : "border-[color:rgba(209,154,106,0.45)] p-5 sm:p-6"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  Step 1 · Field mapping
                </p>
                <h2 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                  {mappedCount}/{mappingSuggestions.length} fields mapped
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  {hasIncompleteMapping
                    ? `Choose a column for: ${missingExpectedFields
                        .map(
                          (key) =>
                            invoiceValidationProfile.fields.find(
                              (field) => field.key === key,
                            )?.label ?? key,
                        )
                        .join(", ")}.${hasDuplicateMappings ? " Resolve duplicate assignments too." : ""}`
                    : hasDuplicateMappings
                      ? "One source column is assigned to multiple fields."
                      : "Required fields ready. Change a column if needed."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFieldMappingOpen(true)}
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mappingReady
                    ? "border border-white/15 bg-[var(--surface-raised)] text-[var(--text-primary)] hover:border-[var(--brand-accent)]"
                    : "bg-[var(--brand-accent)] text-[var(--text-primary)] hover:bg-[var(--brand-accent-soft)]"
                }`}
              >
                {mappingReady ? "Edit mapping" : "Complete mapping"}
              </button>
            </div>
          </section>

          {mappingReady && (
            <>
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
                onReviewAction={handleReviewAction}
                onExportAction={() =>
                  document.getElementById("invoice-export")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              />

              <InvoiceReviewSection
                activeTab={activeReviewTab}
                onTabChange={setActiveReviewTab}
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
                onViewInvoiceDetails={toggleSelectedPreviewInvoice}
                onToggleCleanOpen={() => setIsCleanOpen((current) => !current)}
                onToggleWarningOpen={() =>
                  setIsWarningOpen((current) => !current)
                }
                onToggleBlockedOpen={() =>
                  setIsBlockedOpen((current) => !current)
                }
              />

              <section
                id="invoice-export"
                className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  Step 3 · Export
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  Export reviewed data
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                  {getExportSafetyMessage({
                    hasIncompleteMapping,
                    hasDuplicateMappings,
                    cleanRowCount: validationResult.cleanRows.length,
                    issues: validationResult.issues,
                  })}
                </p>

                <ValidationContextPanel
                  profile={invoiceValidationProfile}
                  fileName={fileName}
                  mapping={fieldMapping}
                  counts={{
                    total: normalizedRows.length,
                    blocked: blockedCount,
                    needsReview: warningCount,
                    ready: cleanCount,
                  }}
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      downloadCsv("clean-invoices.csv", validationResult.cleanRows)
                    }
                    disabled={!canExport}
                    className="rounded-xl bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--brand-accent-soft)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Export rows without blockers
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
                    className="rounded-xl border border-white/10 bg-[var(--surface-deep)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[color:rgba(182,111,58,0.45)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Download issue report
                  </button>
                </div>
              </section>
            </>
          )}
        </>
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
                  Choose which source column belongs to each invoice field.
                  Changes update the validation results immediately.
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