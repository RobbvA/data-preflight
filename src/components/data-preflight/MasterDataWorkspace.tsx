"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ReviewStatusControls,
  ReviewStatusSummary,
} from "@/components/data-preflight/ReviewStatusControls";
import {
  getInputAdapter,
  getReadableExcelSheetNames,
  type ParsedDataSet,
  type ParsedRow,
} from "@/lib/parseCsv";
import { getExactReadableExcelSheetNames, parseExactSourceFile, type ExactParsedDataSet } from "@/lib/exactDataInput";
import type { DecimalNotation } from "@/lib/strictDecimal";
import type { StockBalancesMapping } from "@/lib/profiles/stockBalancesProfile";
import { runStockBalancesSourceValidation } from "@/lib/validation/stockBalancesValidation";
import { QuantityNotationControls } from "@/components/data-preflight/QuantityNotationControls";
import { StockBalancesReviewRecord } from "@/components/data-preflight/StockBalancesReviewRecord";
import type { PriceListMapping } from "@/lib/profiles/priceListProfile";
import { runPriceListSourceValidation } from "@/lib/validation/priceListValidation";
import { PriceNotationControls } from "@/components/data-preflight/PriceNotationControls";
import { PriceListReviewRecord } from "@/components/data-preflight/PriceListReviewRecord";
import type { UnitReference } from "@/lib/unitReference";
import { UnitReferenceControls } from "@/components/data-preflight/UnitReferenceControls";
import { downloadCsv } from "@/lib/exportData";
import {
  getProfileMappingCandidates,
  suggestProfileMapping,
} from "@/lib/dataProfile";
import { getProfileMismatchMessage } from "@/lib/profileCompatibility";
import { getMappingStatus } from "@/lib/mappingStatus";
import { ExportSummary } from "@/components/data-preflight/ExportSummary";
import { ReviewRecord } from "@/components/data-preflight/ReviewRecord";
import { ProductReviewRecord } from "@/components/data-preflight/ProductReviewRecord";
import { ProfileMappingPanel } from "@/components/data-preflight/ProfileMappingPanel";
import { UploadSection } from "@/components/data-preflight/UploadSection";
import { ValidationContextPanel } from "@/components/data-preflight/ValidationContextPanel";
import {
  ActiveWorkspaceHeader,
  LandingWorkspace,
  WorkspaceLayout,
  type DataDomain,
} from "@/components/data-preflight/WorkspaceLayout";
import {
  masterDataWorkspaceConfigs,
  priceListWorkspaceConfig,
  stockBalancesWorkspaceConfig,
  type StockBalancesWorkspaceConfig,
  type PriceListWorkspaceConfig,
  type MasterDataDomain,
  type MasterDataIssue,
  type MasterDataWorkspaceConfig,
} from "@/lib/profiles/masterDataWorkspaceConfig";
import { mapRowsToProfile } from "@/lib/validation/validationProfile";

type MasterDataReviewTab = "blocked" | "review" | "ready";
type ReviewSortMode = "priority" | "row" | "issues";
type MasterDataMapping = Record<string, string>;

function emptyMapping(config: Pick<MasterDataWorkspaceConfig, "profile">): MasterDataMapping {
  return Object.fromEntries(
    config.profile.fields.map(({ key }) => [key, ""]),
  );
}

export function MasterDataWorkspace({
  domain,
  onDomainChange,
}: {
  domain: MasterDataDomain | "price-list" | "stock-balances";
  onDomainChange: (domain: DataDomain) => void;
}) {
  return (
    <MasterDataWorkspaceContent
      key={domain}
      domain={domain}
      config={domain === "price-list" ? priceListWorkspaceConfig : domain === "stock-balances" ? stockBalancesWorkspaceConfig : masterDataWorkspaceConfigs[domain]}
      onDomainChange={onDomainChange}
    />
  );
}

function MasterDataWorkspaceContent({
  domain,
  config,
  onDomainChange,
}: {
  domain: MasterDataDomain | "price-list" | "stock-balances";
  config: MasterDataWorkspaceConfig | PriceListWorkspaceConfig | StockBalancesWorkspaceConfig;
  onDomainChange: (domain: DataDomain) => void;
}) {
  const loadRequestId = useRef(0);
  const profile = config.profile;
  const isNumeric = domain === "price-list" || domain === "stock-balances";

  useEffect(() => {
    return () => {
      loadRequestId.current += 1;
    };
  }, []);

  const [unitReference, setUnitReference] = useState<UnitReference | null>(null);
  const [isReferenceLoading, setIsReferenceLoading] = useState(false);

  const [dataSet, setDataSet] = useState<ParsedDataSet | ExactParsedDataSet | null>(null);
  const [priceNotation, setPriceNotation] = useState<DecimalNotation | null>(null);
  const [quantityNotation, setQuantityNotation] = useState<DecimalNotation | null>(null);
  const [mapping, setMapping] = useState<MasterDataMapping>(() =>
    emptyMapping(config),
  );
  const [pendingExcelSheets, setPendingExcelSheets] = useState<{
    file: File;
    names: string[];
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeReviewTab, setActiveReviewTab] =
    useState<MasterDataReviewTab | null>(null);
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [isReviewListOpen, setIsReviewListOpen] = useState(true);
  const [reviewSortMode, setReviewSortMode] =
    useState<ReviewSortMode>("priority");

  const rows = useMemo(() => dataSet?.rows ?? [], [dataSet]);
  const headers = dataSet?.headers ?? [];
  const mappingCandidates = getProfileMappingCandidates(profile, headers);

  const {
    missingRequiredFields,
    hasDuplicateMappings,
    mappingReady,
    mappedCount,
  } = useMemo(
    () => getMappingStatus(profile, mapping),
    [profile, mapping],
  );

  const requiredUnmapped = missingRequiredFields.map((field) => field.label);

  const mappedRows = useMemo(
    () => mappingReady ? mapRowsToProfile(rows, mapping, profile) : [],
    [rows, mapping, profile, mappingReady],
  );

  const validationRun = useMemo(() => {
    if ("runValidation" in config) return { ...config.runValidation(mappedRows, unitReference), available: true };
    if (!dataSet || !("sourceCells" in dataSet)) {
      return { available: false, normalizedRows: [], validationResult: { issues: [], cleanRows: [], errorRows: [] } };
    }
    return config.kind === "stock-balances"
      ? runStockBalancesSourceValidation(dataSet, mapping as StockBalancesMapping, quantityNotation)
      : runPriceListSourceValidation(dataSet, mapping as PriceListMapping, priceNotation);
  }, [config, mappedRows, unitReference, dataSet, mapping, priceNotation, quantityNotation]);
  const { normalizedRows, validationResult } = validationRun;
  const resultsReady = mappingReady && !isReferenceLoading && validationRun.available;
  const canExport = resultsReady && validationResult.cleanRows.length > 0;

  const issuesByRow = useMemo(() => {
    const grouped = new Map<number, MasterDataIssue[]>();

    for (const issue of validationResult.issues) {
      grouped.set(issue.rowIndex, [
        ...(grouped.get(issue.rowIndex) ?? []),
        issue,
      ]);
    }

    return grouped;
  }, [validationResult.issues]);

  const blockedCount = validationResult.errorRows.length;
  const reviewCount = normalizedRows.filter((_, index) => {
    const issues = issuesByRow.get(index + 1) ?? [];
    return issues.length > 0 &&
      issues.every((issue) => issue.severity === "warning");
  }).length;
  const readyCount = normalizedRows.length - blockedCount - reviewCount;

  const reviewRows = normalizedRows.map((row, index) => ({
    row,
    rowIndex: index + 1,
    issues: issuesByRow.get(index + 1) ?? [],
  }));

  const defaultReviewTab: MasterDataReviewTab =
    blockedCount > 0 ? "blocked" : reviewCount > 0 ? "review" : "ready";
  const visibleReviewTab = activeReviewTab ?? defaultReviewTab;

  const visibleRows = reviewRows.filter(({ issues }) => {
    if (visibleReviewTab === "blocked") {
      return issues.some((issue) => issue.severity === "critical");
    }
    if (visibleReviewTab === "review") {
      return issues.length > 0 &&
        issues.every((issue) => issue.severity === "warning");
    }
    return issues.length === 0;
  });

  visibleRows.sort((a, b) => {
    if (reviewSortMode === "row") return a.rowIndex - b.rowIndex;
    if (reviewSortMode === "issues") return b.issues.length - a.issues.length;
    return getPriority(b.issues) - getPriority(a.issues);
  });

  const reviewCounts = {
    blocked: blockedCount,
    needsReview: reviewCount,
    ready: readyCount,
  };

  const categoryTitle =
    visibleReviewTab === "blocked"
      ? config.labels.blocked
      : visibleReviewTab === "review"
        ? "Needs review"
        : config.labels.ready;

  const categoryDescription =
    visibleReviewTab === "blocked"
      ? "Rows with critical issues are excluded from the export until fixed."
      : visibleReviewTab === "review"
        ? "Rows that can export, but should be checked before import."
        : "Rows that passed the current profile checks.";

  function selectReviewTab(tab: MasterDataReviewTab) {
    setActiveReviewTab(tab);
    setSelectedRowIndex(null);
    setIsReviewListOpen(true);
  }

  async function loadFile(file: File, selectedSheetName?: string, exampleNotation: DecimalNotation | null = null) {
    const requestId = ++loadRequestId.current;

    setError(null);
    setDataSet(null);
    setPriceNotation(null);
    setQuantityNotation(null);
    setUnitReference(null);
    setIsReferenceLoading(false);
    setMapping(emptyMapping(config));
    setPendingExcelSheets(null);
    setActiveReviewTab(null);
    setIsMappingOpen(false);
    setSelectedRowIndex(null);
    setIsReviewListOpen(true);
    setReviewSortMode("priority");
    setIsLoading(true);

    try {
      const adapter = getInputAdapter(file);
      if (!adapter) {
        throw new Error("Choose a CSV, XLSX, or XLS file.");
      }

      if (adapter.sourceType === "excel" && !selectedSheetName) {
        const sheetNames = await (isNumeric ? getExactReadableExcelSheetNames(file) : getReadableExcelSheetNames(file));
        if (requestId !== loadRequestId.current) return;

        if (sheetNames.length > 1) {
          setPendingExcelSheets({ file, names: sheetNames });
          return;
        }
      }

      const parsed = await (isNumeric ? parseExactSourceFile(file, selectedSheetName) : adapter.parse(file, selectedSheetName));
      if (requestId !== loadRequestId.current) return;

      if (parsed.rows.length === 0 || parsed.headers.length === 0) {
        throw new Error("No data rows or column headers were found. Include a header row and data below it, then upload the file again.");
      }

      const mismatchMessage = getProfileMismatchMessage(parsed.headers, domain);
      if (mismatchMessage) throw new Error(mismatchMessage);

      const suggestedMapping = suggestProfileMapping(profile, parsed.headers);
      const { mappingReady: suggestedMappingReady } =
        getMappingStatus(profile, suggestedMapping);

      setDataSet(parsed);
      if (domain === "price-list") setPriceNotation(exampleNotation);
      if (domain === "stock-balances") setQuantityNotation(exampleNotation);
      setMapping(suggestedMapping);
      setIsMappingOpen(!suggestedMappingReady);
    } catch (caught) {
      if (requestId !== loadRequestId.current) return;
      setError(
        caught instanceof Error ? caught.message : "Could not read the file.",
      );
    } finally {
      if (requestId === loadRequestId.current) setIsLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void loadFile(file);
    event.target.value = "";
  }

  function handleExcelSheetSelect(sheetName: string) {
    if (!pendingExcelSheets) return;
    void loadFile(pendingExcelSheets.file, sheetName);
  }

  function loadExample() {
    void loadFile(
      new File([config.example.csv], config.example.fileName, {
        type: "text/csv",
      }),
      undefined,
      isNumeric ? "point" : null,
    );
  }

  function resetFlow() {
    loadRequestId.current += 1;
    setPendingExcelSheets(null);
    setDataSet(null);
    setPriceNotation(null);
    setQuantityNotation(null);
    setUnitReference(null);
    setIsReferenceLoading(false);
    setMapping(emptyMapping(config));
    setError(null);
    setIsLoading(false);
    setActiveReviewTab(null);
    setIsMappingOpen(false);
    setSelectedRowIndex(null);
    setIsReviewListOpen(true);
    setReviewSortMode("priority");
  }

  function changeDomain(nextDomain: DataDomain) {
    if (nextDomain === domain) return;
    resetFlow();
    onDomainChange(nextDomain);
  }

  function exportIssues() {
    const report: ParsedRow[] = validationResult.issues.map((issue) => ({
      row: String(issue.rowIndex),
      field: issue.field,
      severity: issue.severity,
      rule: issue.ruleId,
      problem: issue.problem,
      why_it_matters: issue.why,
      suggested_fix: issue.fix,
    }));
    downloadCsv(config.exports.issues, report);
  }

  return (
    <WorkspaceLayout>
      {!dataSet ? (
        <LandingWorkspace
          domain={domain}
          upload={
            <UploadSection
              domain={domain}
              onDomainChange={changeDomain}
              fileName=""
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
              onTryExample={loadExample}
              onReset={resetFlow}
            />
          }
        />
      ) : (
        <>
          <ActiveWorkspaceHeader
            domain={domain}
            description={config.guidance ?? "Validate the mapping, inspect records that need attention, then export."}
            upload={
              <UploadSection
                domain={domain}
                onDomainChange={changeDomain}
                fileName={dataSet.fileName}
                isLoading={isLoading}
                error={error}
                hasActiveFile
                onFileChange={handleFileChange}
                onTryExample={loadExample}
                onReset={resetFlow}
              />
            }
          />

          <section
            id={`${domain}-mapping`}
            aria-label="Field mapping"
            className={`rounded-2xl border bg-[var(--surface-base)] ${
              mappingReady
                ? "border-white/10 p-4"
                : "border-[color:rgba(209,154,106,0.45)] p-5 sm:p-6"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-[var(--brand-accent)]">
                  Step 1 · Field mapping
                </h2>
                <p className="mt-2 text-base font-medium text-[var(--text-primary)]">
                  {mappedCount}/{profile.fields.length} fields mapped
                </p>
                <p className={mappingReady ? "mt-1 text-xs leading-5 text-[var(--text-secondary)]" : "mt-1 text-sm leading-6 text-[var(--brand-accent-soft)]"}>
                  {requiredUnmapped.length > 0
                    ? `Choose a column for: ${requiredUnmapped.join(", ")}.${
                        hasDuplicateMappings
                          ? " Resolve duplicate assignments too."
                          : ""
                      }`
                    : hasDuplicateMappings
                      ? "One source column is assigned to multiple fields."
                      : "Required fields ready. Change a column if needed."}
                </p>
              </div>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setIsMappingOpen(true)}
                className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mappingReady
                    ? "border border-white/15 bg-[var(--surface-raised)] text-[var(--text-primary)] hover:border-[var(--brand-accent)]"
                    : "bg-[var(--brand-accent)] text-[var(--text-primary)] hover:bg-[var(--brand-accent-soft)]"
                }`}
              >
                {mappingReady ? "Edit mapping" : "Complete mapping"}
              </button>
            </div>
            {domain === "price-list" && (
              <PriceNotationControls value={priceNotation} onChange={(value) => {
                setPriceNotation(value);
                setActiveReviewTab(null);
                setSelectedRowIndex(null);
              }} />
            )}
            {domain === "stock-balances" && (
              <QuantityNotationControls value={quantityNotation} onChange={(value) => {
                setQuantityNotation(value);
                setActiveReviewTab(null);
                setSelectedRowIndex(null);
              }} />
            )}
            {domain === "product" && (
              <UnitReferenceControls
                reference={unitReference}
                onChange={(reference) => {
                  setUnitReference(reference);
                  setActiveReviewTab(null);
                  setSelectedRowIndex(null);
                }}
                onLoading={setIsReferenceLoading}
              />
            )}
          </section>

          {resultsReady && (
            <>
              <section
                id={`${domain}-review`}
                className="rounded-[1.5rem] border border-white/10 bg-[var(--surface-base)] p-4 shadow-xl shadow-black/20"
              >
                <div className="border-b border-white/10 pb-3">
                  <h2 className="text-xl font-semibold leading-snug tracking-tight text-[var(--brand-accent)]">
                    Step 2 · Review
                  </h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <p className="text-base font-medium text-[var(--text-secondary)]">
                      {config.labels.results}
                    </p>
                    <ReviewStatusSummary counts={reviewCounts} />
                  </div>
                </div>

                <ReviewStatusControls
                  counts={reviewCounts}
                  activeCategory={visibleReviewTab}
                  onCategoryChange={selectReviewTab}
                />

                <div className="mt-3 rounded-2xl border border-white/10 bg-[var(--surface-base)] p-2.5">
                  <div className="flex flex-wrap items-start justify-between gap-2.5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                          {categoryTitle}
                        </h3>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-[var(--text-primary)]">
                          {visibleRows.length} row
                          {visibleRows.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--text-muted)]">
                        {categoryDescription}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isReviewListOpen && visibleRows.length > 1 && (
                        <select
                          aria-label={config.labels.sort}
                          value={reviewSortMode}
                          onChange={(event) =>
                            setReviewSortMode(event.target.value as ReviewSortMode)
                          }
                          className="rounded-full border border-white/10 bg-[var(--surface-raised)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)]"
                        >
                          <option value="priority">Sort: priority</option>
                          <option value="row">Sort: row</option>
                          <option value="issues">Sort: issues</option>
                        </select>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsReviewListOpen((open) => !open)}
                        className="rounded-full border border-white/10 bg-[var(--surface-raised)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--brand-accent)] hover:text-[var(--text-primary)]"
                      >
                        {isReviewListOpen ? "Collapse" : "Expand"}
                      </button>
                    </div>
                  </div>

                  {isReviewListOpen && (
                    visibleRows.length === 0 ? (
                      <p className="mt-3 rounded-xl border border-white/10 bg-[var(--surface-raised)] p-3 text-sm text-[var(--text-muted)]">
                        No rows in this category.
                      </p>
                    ) : (
                      <div className="mt-2.5 max-h-[620px] space-y-1.5 overflow-y-auto pr-1">
                        {visibleRows.map(({ row, rowIndex, issues }) => {
                          const isSelected = selectedRowIndex === rowIndex;
                          if (domain === "stock-balances") {
                            return <StockBalancesReviewRecord key={rowIndex} row={row} rowIndex={rowIndex} issues={issues} expanded={isSelected} onToggle={() => setSelectedRowIndex(isSelected ? null : rowIndex)} />;
                          }
                          if (domain === "price-list") {
                            return <PriceListReviewRecord key={rowIndex} row={row} rowIndex={rowIndex} issues={issues} expanded={isSelected} onToggle={() => setSelectedRowIndex(isSelected ? null : rowIndex)} />;
                          }
                          if (domain === "product") {
                            return (
                              <ProductReviewRecord
                                key={rowIndex}
                                row={row}
                                rowIndex={rowIndex}
                                issues={issues}
                                expanded={isSelected}
                                onToggle={() => setSelectedRowIndex(isSelected ? null : rowIndex)}
                              />
                            );
                          }
                          return (
                            <ReviewRecord
                              key={rowIndex}
                              title={row[config.preview.idField] || config.labels.missingId}
                              subtitle={row[config.preview.nameField] || config.labels.missingName}
                              context={row[config.preview.secondaryField]}
                              rowIndex={rowIndex}
                              fields={profile.fields.map(({ key, label }) => ({ label, value: row[key] }))}
                              issues={issues}
                              expanded={isSelected}
                              onToggle={() => setSelectedRowIndex(isSelected ? null : rowIndex)}
                            />
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </section>

              <section
                id={`${domain}-export`}
                className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6"
              >
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-[var(--brand-accent)]">
                  Step 3 · Export
                </h2>
                <ExportSummary
                  exportCount={validationResult.cleanRows.length}
                  warningCount={reviewCount}
                  blockedCount={blockedCount}
                />

                <ValidationContextPanel
                  profile={profile}
                  unitReference={unitReference}
                  priceContext={domain === "price-list" && priceNotation ? { priceNotation } : undefined}
                  stockContext={domain === "stock-balances" && quantityNotation ? { quantityNotation } : undefined}
                  fileName={dataSet.fileName}
                  sheetName={dataSet.metadata?.sheetName}
                  mapping={mapping}
                  counts={{
                    total: normalizedRows.length,
                    blocked: blockedCount,
                    needsReview: reviewCount,
                    ready: readyCount,
                  }}
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={!canExport}
                    onClick={() =>
                      downloadCsv(config.exports.rows, validationResult.cleanRows)
                    }
                    className="rounded-xl bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--brand-accent-soft)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Export rows without blockers
                  </button>
                  <button
                    type="button"
                    disabled={validationResult.issues.length === 0}
                    onClick={exportIssues}
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

      {dataSet && isMappingOpen && (
        <ProfileMappingPanel
          profile={profile}
          headers={headers}
          mapping={mapping}
          candidates={mappingCandidates}
          onUpdateMapping={(field, header) => {
            setMapping((current) => ({ ...current, [field]: header }));
            setSelectedRowIndex(null);
          }}
          onClose={() => setIsMappingOpen(false)}
        />
      )}
    </WorkspaceLayout>
  );
}

function getPriority(issues: MasterDataIssue[]): number {
  if (issues.some((issue) => issue.severity === "critical")) return 2;
  return issues.length > 0 ? 1 : 0;
}
