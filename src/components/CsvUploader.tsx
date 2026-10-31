"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  getInputAdapter,
} from "@/lib/parseCsv";
import type { ValidationIssue } from "@/lib/validateRows";
import { parseExactSourceFile, getExactReadableExcelSheetNames, type ExactParsedDataSet } from "@/lib/exactDataInput";
import { runInvoiceSourceValidation } from "@/lib/validation/invoiceValidation";
import type { DecimalNotation } from "@/lib/strictDecimal";
import { DecimalNotationControls } from "@/components/data-preflight/DecimalNotationControls";
import { invoiceValidationProfile } from "@/lib/profiles/invoiceValidationProfile";
import { getProfileMismatchMessage } from "@/lib/profileCompatibility";
import { getMappingStatus } from "@/lib/mappingStatus";
import {
  createEmptyMapping,
  createMappingSuggestions,
  createSuggestedMapping,
} from "@/lib/fieldMapping";
import type { FieldMapping, MappingSuggestion } from "@/lib/fieldMapping";
import { HelpPopover } from "@/components/data-preflight/WorkflowHelp";
import { ExportPanel } from "@/components/data-preflight/ExportPanel";
import { ExportSummary } from "@/components/data-preflight/ExportSummary";
import { ProfileMappingPanel } from "@/components/data-preflight/ProfileMappingPanel";
import { MasterDataWorkspace } from "@/components/data-preflight/MasterDataWorkspace";
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
      loadRequestId.current += 1;
    };
  }, []);

  const [activeDomain, setActiveDomain] = useState<DataDomain | null>(null);
  const [profilePrompt, setProfilePrompt] = useState(false);
  const [parsedDataSet, setParsedDataSet] = useState<ExactParsedDataSet | null>(null);
  const [invoiceNotation, setInvoiceNotation] = useState<DecimalNotation | null>(null);
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
  const [activeReviewTab, setActiveReviewTab] = useState<ReviewTab | null>(null);

  const rows = useMemo(() => parsedDataSet?.formattedRows ?? parsedDataSet?.rows ?? [], [parsedDataSet]);
  const headers = useMemo(() => parsedDataSet?.headers ?? [], [parsedDataSet]);
  const fileName = parsedDataSet?.fileName ?? "";

  async function loadSource(
    source: Promise<File>,
    selectedSheetName?: string,
    exampleNotation?: DecimalNotation,
  ) {
    if (!activeDomain) {
      setProfilePrompt(true);
      return;
    }

    const requestId = ++loadRequestId.current;

    setError(null);
    setParsedDataSet(null);
    setInvoiceNotation(null);
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
      if (!adapter) throw new Error("Choose a CSV, XLSX, or XLS file.");

      if (adapter.sourceType === "excel" && !selectedSheetName) {
        const sheetNames = await getExactReadableExcelSheetNames(file);
        if (requestId !== loadRequestId.current) return;

        if (sheetNames.length > 1) {
          setPendingExcelSheets({ file, names: sheetNames });
          return;
        }
      }

      const nextParsedDataSet = await parseExactSourceFile(file, selectedSheetName);
      if (requestId !== loadRequestId.current) return;

      if (nextParsedDataSet.rows.length === 0) {
        throw new Error("No data rows were found. Add rows below the column headers and upload the file again.");
      }
      if (nextParsedDataSet.headers.length === 0) {
        throw new Error("No column headers were found. Add a header row and upload the file again.");
      }

      const mismatchMessage = getProfileMismatchMessage(
        nextParsedDataSet.headers,
        "invoice",
      );
      if (mismatchMessage) throw new Error(mismatchMessage);

      const suggestedMapping = createSuggestedMapping(
        nextParsedDataSet.headers,
        nextParsedDataSet.formattedRows ?? nextParsedDataSet.rows,
      );
      const { mappingReady: suggestedMappingReady } =
        getMappingStatus(invoiceValidationProfile, suggestedMapping);

      setParsedDataSet(nextParsedDataSet);
      setInvoiceNotation(exampleNotation ?? null);
      setFieldMapping(suggestedMapping);
      setIsFieldMappingOpen(!suggestedMappingReady);
    } catch (caught) {
      if (requestId !== loadRequestId.current) return;

      setError(
        caught instanceof Error
          ? caught.message
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
      if (requestId === loadRequestId.current) setIsLoading(false);
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
      undefined,
      "point",
    );
  }

  function resetFlow() {
    loadRequestId.current += 1;
    setPendingExcelSheets(null);
    setParsedDataSet(null);
    setInvoiceNotation(null);
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
    setFieldMapping((current) => ({
      ...current,
      [targetField]: sourceField,
    }));
    setSelectedPreviewRowIndex(null);
  }

  function toggleSelectedPreviewInvoice(rowIndex: number) {
    setSelectedPreviewRowIndex((current) =>
      current === rowIndex ? null : rowIndex,
    );
  }

  const mappingSuggestions = useMemo<MappingSuggestion[]>(
    () => createMappingSuggestions(headers, rows),
    [headers, rows],
  );

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

  const validationRun = useMemo(
    () => parsedDataSet
      ? runInvoiceSourceValidation(parsedDataSet, fieldMapping, invoiceNotation)
      : { available: false, normalizedRows: [], validationResult: { issues: [], cleanRows: [], errorRows: [] } },
    [parsedDataSet, fieldMapping, invoiceNotation],
  );
  const { normalizedRows, validationResult } = validationRun;
  const resultsReady = mappingReady && validationRun.available;

  const issuesByRow = useMemo(
    () => validationResult.issues.reduce<Record<number, ValidationIssue[]>>(
      (grouped, issue) => {
        grouped[issue.rowIndex] = [
          ...(grouped[issue.rowIndex] ?? []),
          issue,
        ];
        return grouped;
      },
      {},
    ),
    [validationResult.issues],
  );

  const invoiceItems = useMemo<InvoicePreviewItem[]>(
    () => normalizedRows
      .map((row, index) =>
        createInvoicePreviewItem({
          rowIndex: index + 1,
          row,
          issues: issuesByRow[index + 1] ?? [],
        }),
      )
      .sort((a, b) => b.priorityScore - a.priorityScore),
    [normalizedRows, issuesByRow],
  );

  const blockedInvoiceItems = useMemo(
    () => invoiceItems.filter((item) =>
      item.issues.some((issue) => issue.severity === "critical"),
    ),
    [invoiceItems],
  );
  const warningInvoiceItems = useMemo(
    () => invoiceItems.filter((item) =>
      item.issues.length > 0 &&
      item.issues.every((issue) => issue.severity === "warning"),
    ),
    [invoiceItems],
  );
  const cleanInvoiceItems = useMemo(
    () => invoiceItems.filter((item) => item.issues.length === 0),
    [invoiceItems],
  );

  const blockedCount = blockedInvoiceItems.length;
  const warningCount = warningInvoiceItems.length;
  const cleanCount = cleanInvoiceItems.length;
  const canExport = resultsReady && validationResult.cleanRows.length > 0;
  const reportInput = useMemo(() => ({
    profile: invoiceValidationProfile, fileName, sheetName: parsedDataSet?.metadata?.sheetName,
    mapping: fieldMapping, invoiceContext: invoiceNotation ? { invoiceNotation } : undefined,
    counts: { total: normalizedRows.length, blocked: blockedCount, needsReview: warningCount, ready: cleanCount },
    sourceRows: parsedDataSet?.rows ?? [], displayRows: parsedDataSet?.formattedRows,
    normalizedRows, issues: validationResult.issues,
  }), [fileName, parsedDataSet, fieldMapping, invoiceNotation, normalizedRows, blockedCount, warningCount, cleanCount, validationResult.issues]);
  const hasUploadedRows = rows.length > 0;
  const hasHeaders = headers.length > 0;

  function changeDomain(nextDomain: DataDomain) {
    setProfilePrompt(false);
    if (nextDomain === activeDomain) return;
    resetFlow();
    setActiveDomain(nextDomain);
  }

  if (activeDomain !== null && activeDomain !== "invoice") {
    return (
      <MasterDataWorkspace
        domain={activeDomain}
        onDomainChange={changeDomain}
      />
    );
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
            data-guide="mapping"
            className={`rounded-2xl border bg-[var(--surface-base)] ${
              mappingReady
                ? "border-white/10 p-4"
                : "border-[color:rgba(209,154,106,0.45)] p-5 sm:p-6"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2"><h2 className="text-xl font-semibold leading-snug tracking-tight text-[var(--brand-accent)]">
                  Step 1 · Field mapping
                </h2><HelpPopover title="Field mapping">Match the source columns to the fields you want to check. Required fields and duplicate assignments must be resolved before validation can run.</HelpPopover></div>
                <p className="mt-2 text-base font-medium text-[var(--text-primary)]">
                  {mappedCount}/{mappingSuggestions.length} fields mapped
                </p>
                <p className={mappingReady ? "mt-1 text-sm leading-6 text-[var(--text-secondary)]" : "mt-1 text-sm leading-6 text-[var(--brand-accent-soft)]"}>
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
            <DecimalNotationControls label="Amount and VAT notation" appliesTo="amounts and VAT" value={invoiceNotation} onChange={(value) => {
              setInvoiceNotation(value);
              setSelectedPreviewRowIndex(null);
            }} />
          </section>

          {resultsReady && (
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
                onToggleWarningOpen={() => setIsWarningOpen((current) => !current)}
                onToggleBlockedOpen={() => setIsBlockedOpen((current) => !current)}
              />

              <section
                id="invoice-export"
                data-guide="export"
                className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6"
              >
                <div className="flex items-center gap-2"><h2 className="text-xl font-semibold leading-snug tracking-tight text-[var(--brand-accent)]">
                  Step 3 · Export
                </h2><HelpPopover title="Choose the right download">Data export contains rows without blockers. Reports include the findings and blocked rows so you can share the complete review. Review filters do not change the exported data.</HelpPopover></div>
                <ExportSummary
                  exportCount={validationResult.cleanRows.length}
                  warningCount={warningCount}
                  blockedCount={blockedCount}
                />

                <ValidationContextPanel
                  profile={invoiceValidationProfile}
                  invoiceContext={invoiceNotation ? { invoiceNotation } : undefined}
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

                <ExportPanel fileName="clean-invoices.csv" rows={validationResult.cleanRows} disabled={!canExport} input={reportInput} issueFileName="invoice-errors.csv" />
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
