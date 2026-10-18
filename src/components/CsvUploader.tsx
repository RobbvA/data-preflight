"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  getInputAdapter,
  getReadableExcelSheetNames,
  type ParsedDataSet,
} from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";
import { invoiceValidationProfile } from "@/lib/profiles/invoiceValidationProfile";
import { getProfileMismatchMessage } from "@/lib/profileCompatibility";
import { getMappingStatus } from "@/lib/mappingStatus";
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

import { ProfileMappingPanel } from "@/components/data-preflight/ProfileMappingPanel";
import { CustomerWorkspace } from "@/components/data-preflight/CustomerWorkspace";
import {
  ActiveWorkspaceHeader,
  LandingWorkspace,
  WorkspaceLayout,
  type DataDomain,
} from "@/components/data-preflight/WorkspaceLayout";
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
  const loadRequestId = useRef(0);

  useEffect(() => {
    return () => {
      // Ignore any pending read when this workspace unmounts.
      loadRequestId.current += 1;
    };
  }, []);

  const [activeDomain, setActiveDomain] = useState<DataDomain | null>(null);
  const [profilePrompt, setProfilePrompt] = useState(false);
  const [parsedDataSet, setParsedDataSet] =
    useState<ParsedDataSet | null>(null);

  const [pendingExcelSheets, setPendingExcelSheets] = useState<{
    file: File;
    names: string[];
  } | null>(null);

  const [fieldMapping, setFieldMapping] =
    useState<FieldMapping>(createEmptyMapping());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPreviewRowIndex, setSelectedPreviewRowIndex] =
    useState<number | null>(null);

  const [isCleanOpen, setIsCleanOpen] = useState(true);
  const [isWarningOpen, setIsWarningOpen] = useState(true);
  const [isBlockedOpen, setIsBlockedOpen] = useState(true);

  const [isFieldMappingOpen, setIsFieldMappingOpen] = useState(false);
  const [activeReviewTab, setActiveReviewTab] =
    useState<ReviewTab | null>(null);

  const rows = useMemo(() => parsedDataSet?.rows ?? [], [parsedDataSet]);
  const headers = useMemo(() => parsedDataSet?.headers ?? [], [parsedDataSet]);
  const fileName = parsedDataSet?.fileName ?? "";

  async function loadSource(
    source: Promise<File>,
    selectedSheetName?: string,
  ) {
    if (!activeDomain) {
      setProfilePrompt(true);
      return;
    }

    const requestId = ++loadRequestId.current;

    setError(null);
    setParsedDataSet(null);
    setFieldMapping(createEmptyMapping());
    setPendingExcelSheets(null);
    setIsLoading(true);
    setSelectedPreviewRowIndex(null);
    setIsCleanOpen(true);
    setIsWarningOpen(true);
    setIsBlockedOpen(true);
    setIsFieldMappingOpen(false);
    setActiveReviewTab(null);

    try {
      const file = await source;
      if (requestId !== loadRequestId.current) return;

      const adapter = getInputAdapter(file);

      if (!adapter) {
        throw new Error("Unsupported file type.");
      }

      if (adapter.sourceType === "excel" && !selectedSheetName) {
        const sheetNames = await getReadableExcelSheetNames(file);
        if (requestId !== loadRequestId.current) return;

        if (sheetNames.length > 1) {
          setPendingExcelSheets({ file, names: sheetNames });
          return;
        }
      }

      const nextParsedDataSet = await adapter.parse(file, selectedSheetName);
      if (requestId !== loadRequestId.current) return;

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

      const { mappingReady: suggestedMappingReady } = getMappingStatus(
        invoiceValidationProfile,
        suggestedMapping,
      );

      setParsedDataSet(nextParsedDataSet);
      setFieldMapping(suggestedMapping);
      setIsFieldMappingOpen(!suggestedMappingReady);
    } catch (error) {
      if (requestId !== loadRequestId.current) return;

      setError(
        error instanceof Error
          ? error.message
          : "Failed to read source file. Please try again.",
      );

      setParsedDataSet(null);
      setFieldMapping(createEmptyMapping());
      setSelectedPreviewRowIndex(null);
      setIsCleanOpen(true);
      setIsWarningOpen(true);
      setIsBlockedOpen(true);
      setIsFieldMappingOpen(false);
      setActiveReviewTab(null);
    } finally {
      if (requestId === loadRequestId.current) {
        setIsLoading(false);
      }
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

  function handleExcelSheetSelect(sheetName: string) {
    if (!pendingExcelSheets) return;
    void loadSource(Promise.resolve(pendingExcelSheets.file), sheetName);
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
    loadRequestId.current += 1;
    setPendingExcelSheets(null);
    setParsedDataSet(null);
    setFieldMapping(createEmptyMapping());
    setError(null);
    setIsLoading(false);
    setSelectedPreviewRowIndex(null);
    setIsCleanOpen(true);
    setIsWarningOpen(true);
    setIsBlockedOpen(true);
    setIsFieldMappingOpen(false);
    setActiveReviewTab(null);
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

  function toggleSelectedPreviewInvoice(rowIndex: number) {
    setSelectedPreviewRowIndex((currentRowIndex) =>
      currentRowIndex === rowIndex ? null : rowIndex,
    );
  }

  const mappingSuggestions = useMemo<MappingSuggestion[]>(() => {
    return createMappingSuggestions(headers, rows);
  }, [headers, rows]);

  const {
    missingRequiredFields,
    hasIncompleteMapping,
    hasDuplicateMappings,
    mappingReady,
    mappedCount,
  } = useMemo(
    () => getMappingStatus(invoiceValidationProfile, fieldMapping),
    [fieldMapping],
  );

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
            validationResult: {
              issues: [],
              cleanRows: [],
              errorRows: [],
            },
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

  const canExport = mappingReady && validationResult.cleanRows.length > 0;
  const hasUploadedRows = rows.length > 0;
  const hasHeaders = headers.length > 0;

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
              pendingExcelSheets={
                pendingExcelSheets
                  ? {
                      fileName: pendingExcelSheets.file.name,
                      names: pendingExcelSheets.names,
                    }
                  : null
              }
              onSelectExcelSheet={handleExcelSheetSelect}
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
            description="Inspect invoice rows that need attention, then export rows without blockers."
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
                    ? `Choose a column for: ${missingRequiredFields
                        .map((field) => field.label)
                        .join(", ")}.${hasDuplicateMappings ? " Resolve duplicate assignments too." : ""}`
                    : hasDuplicateMappings
                      ? "One source column is assigned to multiple fields."
                      : "Required fields ready. Change a column if needed."}
                </p>
              </div>

              <button
                type="button"
                aria-haspopup="dialog"
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
              <InvoiceReviewSection
                activeTab={activeReviewTab ?? undefined}
                onTabChange={setActiveReviewTab}
                cleanInvoiceItems={cleanInvoiceItems}
                warningInvoiceItems={warningInvoiceItems}
                blockedInvoiceItems={blockedInvoiceItems}
                selectedRowIndex={selectedPreviewRowIndex}
                isCleanOpen={isCleanOpen}
                isWarningOpen={isWarningOpen}
                isBlockedOpen={isBlockedOpen}
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
                  sheetName={parsedDataSet?.metadata?.sheetName}
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
                      downloadCsv(
                        "clean-invoices.csv",
                        validationResult.cleanRows,
                      )
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
        <ProfileMappingPanel
          profile={invoiceValidationProfile}
          headers={headers}
          mapping={fieldMapping}
          suggestions={mappingSuggestions}
          onUpdateMapping={updateFieldMapping}
          onClose={() => setIsFieldMappingOpen(false)}
        />
      )}
    </WorkspaceLayout>
  );
}