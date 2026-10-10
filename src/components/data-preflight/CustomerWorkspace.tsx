"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import {
  getInputAdapter,
  getReadableExcelSheetNames,
  type ParsedDataSet,
  type ParsedRow,
} from "@/lib/parseCsv";
import { downloadCsv } from "@/lib/exportData";
import { getProfileMappingCandidates } from "@/lib/dataProfile";
import { getProfileMismatchMessage } from "@/lib/profileCompatibility";
import { UploadSection } from "@/components/data-preflight/UploadSection";
import { ValidationContextPanel } from "@/components/data-preflight/ValidationContextPanel";
import {
  ActiveWorkspaceHeader,
  LandingWorkspace,
  WorkspaceLayout,
  type DataDomain,
} from "@/components/data-preflight/WorkspaceLayout";
import {
  customerFieldKeys,
  suggestCustomerMapping,
  type CustomerMapping,
} from "@/lib/profiles/customerProfile";
import {
  customerValidationProfile,
  type CustomerIssue,
} from "@/lib/validation/customerValidation";
import {
  mapRowsToProfile,
  runValidationProfile,
} from "@/lib/validation/validationProfile";

type CustomerReviewTab = "blocked" | "review" | "ready";
type ReviewSortMode = "priority" | "row" | "issues";

const EXAMPLE_CSV = [
  "Customer Number,Customer Name,Email,Country Code,VAT Number",
  "C-1001,Acme BV,finance@acme.nl,NL,NL123456789B01",
  "C-1002,North Trading,wrong-email,DE,DE123456789",
  "C-1002,North Trading Berlin,accounts@north.example,DE,DE123456789",
  ",Missing Identifier,contact@example.com,NL,",
  "C-1003,Green Supply,hello@green.example,NL,",
].join("\n");

function emptyMapping(): CustomerMapping {
  return Object.fromEntries(
    customerFieldKeys.map((key) => [key, ""]),
  ) as CustomerMapping;
}

export function CustomerWorkspace({
  onDomainChange,
}: {
  onDomainChange: (domain: DataDomain) => void;
}) {
  const [dataSet, setDataSet] = useState<ParsedDataSet | null>(null);
  const [mapping, setMapping] = useState<CustomerMapping>(emptyMapping);
  const [pendingExcelSheets, setPendingExcelSheets] = useState<{
    file: File;
    names: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeReviewTab, setActiveReviewTab] =
    useState<CustomerReviewTab | null>(null);
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [selectedCustomerRowIndex, setSelectedCustomerRowIndex] =
    useState<number | null>(null);
  const [isReviewListOpen, setIsReviewListOpen] = useState(true);
  const [reviewSortMode, setReviewSortMode] =
    useState<ReviewSortMode>("priority");

  const rows = useMemo(() => dataSet?.rows ?? [], [dataSet]);
  const headers = dataSet?.headers ?? [];

  const mappingCandidates = getProfileMappingCandidates(
    customerValidationProfile,
    headers,
  );

  const requiredUnmapped = customerValidationProfile.fields
    .filter((field) => field.required && !mapping[field.key])
    .map((field) => field.label);

  const selectedHeaders = Object.values(mapping).filter(Boolean);
  const hasDuplicateMapping =
    new Set(selectedHeaders).size !== selectedHeaders.length;
  const mappingReady =
    requiredUnmapped.length === 0 && !hasDuplicateMapping;

  const mappedRows = useMemo(
    () =>
      mappingReady
        ? mapRowsToProfile(rows, mapping, customerValidationProfile)
        : [],
    [rows, mapping, mappingReady],
  );

  const { normalizedRows, validationResult } = useMemo(
    () => runValidationProfile(customerValidationProfile, mappedRows),
    [mappedRows],
  );

  const canExport =
    mappingReady && validationResult.cleanRows.length > 0;

  const issuesByRow = useMemo(() => {
    const grouped = new Map<number, CustomerIssue[]>();

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

    return (
      issues.length > 0 &&
      issues.every((issue) => issue.severity === "warning")
    );
  }).length;

  const readyCount = normalizedRows.length - blockedCount - reviewCount;
  const mappedCount = selectedHeaders.length;
  const showMappingFields = !mappingReady || isMappingOpen;

  const reviewRows = normalizedRows.map((row, index) => ({
    row,
    rowIndex: index + 1,
    issues: issuesByRow.get(index + 1) ?? [],
  }));

  const defaultReviewTab: CustomerReviewTab =
    blockedCount > 0 ? "blocked" : reviewCount > 0 ? "review" : "ready";
  const visibleReviewTab = activeReviewTab ?? defaultReviewTab;

  const visibleRows = reviewRows.filter(({ issues }) => {
    if (visibleReviewTab === "blocked") {
      return issues.some((issue) => issue.severity === "critical");
    }

    if (visibleReviewTab === "review") {
      return (
        issues.length > 0 &&
        issues.every((issue) => issue.severity === "warning")
      );
    }

    return issues.length === 0;
  });

  visibleRows.sort((a, b) => {
    if (reviewSortMode === "row") return a.rowIndex - b.rowIndex;
    if (reviewSortMode === "issues") {
      return b.issues.length - a.issues.length;
    }

    return getPriority(b.issues) - getPriority(a.issues);
  });

  const reviewStatus =
    blockedCount > 0
      ? { label: "Fix blocked first", tone: "danger" as const }
      : reviewCount > 0
        ? { label: "Review warnings", tone: "warning" as const }
        : { label: "Ready for export", tone: "success" as const };

  const categoryTitle =
    visibleReviewTab === "blocked"
      ? "Blocked customers"
      : visibleReviewTab === "review"
        ? "Needs review"
        : "Ready customers";

  const categoryDescription =
    visibleReviewTab === "blocked"
      ? "Rows with critical issues are excluded from the export until fixed."
      : visibleReviewTab === "review"
        ? "Rows that can export, but should be checked before import."
        : "Rows that passed the current profile checks.";

  function selectReviewTab(tab: CustomerReviewTab) {
    setActiveReviewTab(tab);
    setSelectedCustomerRowIndex(null);
    setIsReviewListOpen(true);
  }

  async function loadFile(file: File, selectedSheetName?: string) {
    setError(null);
    setDataSet(null);
    setMapping(emptyMapping());
    setPendingExcelSheets(null);
    setActiveReviewTab(null);
    setIsMappingOpen(false);
    setSelectedCustomerRowIndex(null);
    setIsReviewListOpen(true);
    setReviewSortMode("priority");
    setIsLoading(true);

    try {
      const adapter = getInputAdapter(file);

      if (!adapter) {
        throw new Error("Choose a CSV, XLSX, or XLS file.");
      }

      if (adapter.sourceType === "excel" && !selectedSheetName) {
        const sheetNames = await getReadableExcelSheetNames(file);

        if (sheetNames.length > 1) {
          setPendingExcelSheets({ file, names: sheetNames });
          return;
        }
      }

      const parsed = await adapter.parse(file, selectedSheetName);

      if (parsed.rows.length === 0 || parsed.headers.length === 0) {
        throw new Error("The file has no readable rows and headers.");
      }

      const mismatchMessage = getProfileMismatchMessage(
        parsed.headers,
        "customer",
      );

      if (mismatchMessage) {
        throw new Error(mismatchMessage);
      }

      setDataSet(parsed);
      setMapping(suggestCustomerMapping(parsed.headers));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not read the file.",
      );
    } finally {
      setIsLoading(false);
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
      new File([EXAMPLE_CSV], "customer-example.csv", {
        type: "text/csv",
      }),
    );
  }

  function resetFlow() {
    setPendingExcelSheets(null);
    setDataSet(null);
    setMapping(emptyMapping());
    setError(null);
    setActiveReviewTab(null);
    setIsMappingOpen(false);
    setSelectedCustomerRowIndex(null);
    setIsReviewListOpen(true);
    setReviewSortMode("priority");
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

    downloadCsv("customer-issues.csv", report);
  }

  return (
    <WorkspaceLayout>
      {!dataSet ? (
        <LandingWorkspace
          domain="customer"
          upload={
            <UploadSection
              domain="customer"
              onDomainChange={onDomainChange}
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
            domain="customer"
            description="Validate the mapping, inspect records that need attention, then export."
            upload={
              <UploadSection
                domain="customer"
                onDomainChange={onDomainChange}
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
            id="customer-mapping"
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
                  {mappedCount}/{customerValidationProfile.fields.length} fields
                  mapped
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  {requiredUnmapped.length > 0
                    ? `Choose a column for: ${requiredUnmapped.join(", ")}.${
                        hasDuplicateMapping
                          ? " Resolve duplicate assignments too."
                          : ""
                      }`
                    : hasDuplicateMapping
                      ? "One source column is assigned to multiple fields."
                      : "Required fields ready. Change a column if needed."}
                </p>
              </div>

              {mappingReady && (
                <button
                  type="button"
                  aria-expanded={isMappingOpen}
                  aria-controls="customer-mapping-fields"
                  onClick={() => setIsMappingOpen((open) => !open)}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-[var(--surface-raised)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-accent)]"
                >
                  {isMappingOpen ? "Close mapping" : "Edit mapping"}
                </button>
              )}
            </div>

            <div id="customer-mapping-fields" hidden={!showMappingFields}>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  Check the suggested columns. Required fields are marked *.
                </p>
                <span className="text-xs text-[var(--text-muted)]">
                  Profile: {customerValidationProfile.name} v
                  {customerValidationProfile.version}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {customerValidationProfile.fields.map((field) => (
                  <label key={field.key} className="block text-sm font-medium">
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-[var(--brand-accent-soft)]">
                        *
                      </span>
                    )}

                    <select
                      value={mapping[field.key]}
                      onChange={(event) =>
                        setMapping((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      className={`mt-1.5 w-full rounded-lg border bg-[var(--surface-deep)] px-3 py-2 text-sm text-[var(--text-primary)] ${
                        (field.required && !mapping[field.key]) ||
                        (mapping[field.key] &&
                          selectedHeaders.filter(
                            (header) => header === mapping[field.key],
                          ).length > 1)
                          ? "border-[var(--brand-accent)]"
                          : "border-white/15"
                      }`}
                    >
                      <option value="">Not mapped</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>

                    {!mapping[field.key] &&
                      mappingCandidates[field.key].length > 1 && (
                        <span className="mt-2 block text-xs leading-5 text-[var(--brand-accent-soft)]">
                          Multiple possible columns:{" "}
                          {mappingCandidates[field.key].join(", ")}. Choose one.
                        </span>
                      )}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {mappingReady && (
            <>
              <section
                id="customer-review"
                className="rounded-[1.5rem] border border-white/10 bg-[var(--surface-base)] p-4 shadow-xl shadow-black/20"
              >
                <div className="border-b border-white/10 pb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-accent)]">
                    Step 2 · Review
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <h2 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
                      Customer results
                    </h2>
                    <CustomerStatusPill tone={reviewStatus.tone}>
                      {reviewStatus.label}
                    </CustomerStatusPill>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-[var(--surface-deep)] p-2 sm:grid-cols-3">
                  <CustomerReviewTabButton
                    label="Blocked"
                    description="Fix first"
                    count={blockedCount}
                    active={visibleReviewTab === "blocked"}
                    tone="danger"
                    icon={<AlertTriangle className="h-4 w-4" />}
                    onClick={() => selectReviewTab("blocked")}
                  />
                  <CustomerReviewTabButton
                    label="Needs Review"
                    description="Check before export"
                    count={reviewCount}
                    active={visibleReviewTab === "review"}
                    tone="warning"
                    icon={<Search className="h-4 w-4" />}
                    onClick={() => selectReviewTab("review")}
                  />
                  <CustomerReviewTabButton
                    label="Ready"
                    description="No issues found"
                    count={readyCount}
                    active={visibleReviewTab === "ready"}
                    tone="success"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    onClick={() => selectReviewTab("ready")}
                  />
                </div>

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
                          aria-label="Sort customers"
                          value={reviewSortMode}
                          onChange={(event) =>
                            setReviewSortMode(
                              event.target.value as ReviewSortMode,
                            )
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

                  {isReviewListOpen &&
                    (visibleRows.length === 0 ? (
                      <p className="mt-3 rounded-xl border border-white/10 bg-[var(--surface-raised)] p-3 text-sm text-[var(--text-muted)]">
                        No rows in this category.
                      </p>
                    ) : (
                      <div className="mt-2.5 max-h-[620px] space-y-1.5 overflow-y-auto pr-1">
                        {visibleRows.map(({ row, rowIndex, issues }) => {
                          const isSelected =
                            selectedCustomerRowIndex === rowIndex;
                          const criticalCount = issues.filter(
                            (issue) => issue.severity === "critical",
                          ).length;
                          const mainIssue = issues[0];

                          return (
                            <article
                              key={rowIndex}
                              className="rounded-xl border border-white/10 bg-[var(--surface-raised)] p-2 transition hover:border-[color:rgba(182,111,58,0.35)]"
                            >
                              <div className="grid gap-2 xl:grid-cols-[1fr_auto] xl:items-start">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                                      {criticalCount > 0
                                        ? "Critical"
                                        : issues.length > 0
                                          ? "Needs review"
                                          : "Ready"}
                                    </span>
                                    <span className="rounded-full bg-[var(--surface-deep)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                                      Row {rowIndex}
                                    </span>
                                    {issues.length > 0 && (
                                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                                        {issues.length} issue
                                        {issues.length === 1 ? "" : "s"}
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-1.5 truncate text-sm font-semibold text-[var(--text-primary)]">
                                    {row.customer_id || "Missing customer ID"}
                                  </p>
                                  <p className="truncate text-xs text-[var(--text-secondary)]">
                                    {row.name || "Missing customer name"}
                                  </p>
                                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                                    {row.email || "No email"}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  aria-expanded={isSelected}
                                  onClick={() =>
                                    setSelectedCustomerRowIndex(
                                      isSelected ? null : rowIndex,
                                    )
                                  }
                                  className="self-start rounded-full border border-white/10 bg-[var(--surface-deep)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-[color:rgba(182,111,58,0.45)] hover:text-[var(--text-primary)]"
                                >
                                  {isSelected ? "Hide details" : "Details"}
                                </button>
                              </div>

                              <div className="mt-1.5 grid gap-1 md:grid-cols-3">
                                <CustomerDataPoint
                                  label="Country"
                                  value={row.country || "—"}
                                />
                                <CustomerDataPoint
                                  label="VAT number"
                                  value={row.vat_number || "—"}
                                />
                                <CustomerDataPoint
                                  label="Customer ID"
                                  value={row.customer_id || "—"}
                                />
                              </div>

                              {mainIssue && (
                                <div className="mt-1 rounded-lg border border-[color:rgba(182,111,58,0.3)] bg-[rgba(182,111,58,0.08)] px-2 py-1 text-xs font-semibold text-[var(--text-primary)]">
                                  {mainIssue.problem}
                                </div>
                              )}

                              {isSelected && (
                                <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-[var(--surface-deep)] p-3">
                                  {issues.length > 0 ? (
                                    issues.map((issue, index) => (
                                      <div
                                        key={`${issue.ruleId}-${issue.field}-${index}`}
                                        className="rounded-lg border border-white/10 bg-[var(--surface-raised)] p-3 text-xs leading-5"
                                      >
                                        <p className="font-semibold text-[var(--text-primary)]">
                                          {issue.problem}
                                        </p>
                                        <p className="mt-1 text-[var(--text-secondary)]">
                                          {issue.why}
                                        </p>
                                        <p className="mt-1 text-[var(--text-muted)]">
                                          Fix: {issue.fix}
                                        </p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-[var(--text-secondary)]">
                                      This row passed the current profile checks.
                                    </p>
                                  )}
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    ))}
                </div>
              </section>

              <section
                id="customer-export"
                className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  Step 3 · Export
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  Export reviewed data
                </h2>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Rows with critical issues are excluded. Check warnings before
                  using the export, and confirm your target ERP requirements.
                </p>

                <ValidationContextPanel
                  profile={customerValidationProfile}
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
                      downloadCsv(
                        "customer-rows-without-blockers.csv",
                        validationResult.cleanRows,
                      )
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

                {!canExport && (
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    No rows without blockers are available. Fix the source file
                    and validate it again.
                  </p>
                )}
              </section>
            </>
          )}
        </>
      )}
    </WorkspaceLayout>
  );
}

function getPriority(issues: CustomerIssue[]): number {
  if (issues.some((issue) => issue.severity === "critical")) return 2;
  return issues.length > 0 ? 1 : 0;
}

function CustomerDataPoint({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--surface-deep)] px-2 py-1.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-medium text-[var(--text-secondary)]">
        {value}
      </p>
    </div>
  );
}

function CustomerReviewTabButton({
  label,
  description,
  count,
  active,
  tone,
  icon,
  onClick,
}: {
  label: string;
  description: string;
  count: number;
  active: boolean;
  tone: "danger" | "warning" | "success";
  icon: ReactNode;
  onClick: () => void;
}) {
  const activeToneClasses = {
    danger:
      "border-[color:rgba(182,111,58,0.5)] bg-[rgba(182,111,58,0.08)] text-[var(--text-primary)]",
    warning:
      "border-[color:rgba(209,154,106,0.32)] bg-[rgba(209,154,106,0.06)] text-[var(--text-primary)]",
    success:
      "border-[color:rgba(120,180,120,0.24)] bg-[rgba(120,180,120,0.045)] text-[var(--text-primary)]",
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-left transition ${
        active
          ? activeToneClasses[tone]
          : "border-transparent bg-transparent text-[var(--text-muted)] hover:border-white/10 hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={
                tone === "danger"
                  ? "text-[var(--brand-accent)]"
                  : "text-[var(--text-secondary)]"
              }
            >
              {icon}
            </span>
            <p className="text-sm font-semibold leading-none">{label}</p>
          </div>
          <p className="mt-1.5 text-xs leading-none opacity-75">
            {description}
          </p>
        </div>
        <p className="text-xl font-semibold leading-none tracking-tight">
          {count}
        </p>
      </div>
    </button>
  );
}

function CustomerStatusPill({
  tone,
  children,
}: {
  tone: "warning" | "danger" | "success";
  children: ReactNode;
}) {
  const toneClasses = {
    warning:
      "border-[color:rgba(182,111,58,0.25)] bg-[rgba(182,111,58,0.08)] text-[var(--text-primary)]",
    danger:
      "border-[color:rgba(182,111,58,0.4)] bg-[rgba(182,111,58,0.1)] text-[var(--text-primary)]",
    success:
      "border-white/10 bg-white/[0.04] text-[var(--text-primary)]",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}