"use client";

import { useMemo, useState } from "react";
import {
  getInputAdapter,
  type ParsedDataSet,
  type ParsedRow,
} from "@/lib/parseCsv";
import { downloadCsv } from "@/lib/exportData";
import { getProfileMappingCandidates } from "@/lib/dataProfile";
import { UploadSection } from "@/components/data-preflight/UploadSection";
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeReviewTab, setActiveReviewTab] =
    useState<CustomerReviewTab | null>(null);

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

  const nextAction = !mappingReady
    ? {
        title: "Complete field mapping",
        detail:
          requiredUnmapped.length > 0
            ? `Choose a source column for ${requiredUnmapped.join(", ")}.`
            : "One source column is assigned to multiple fields.",
        button: "Review mapping",
        target: "customer-mapping",
        tab: null,
      }
    : blockedCount > 0
      ? {
          title: `Review ${blockedCount} blocked customer${
            blockedCount === 1 ? "" : "s"
          }`,
          detail: "See what failed and what to fix in the source file.",
          button: "View blocked rows",
          target: "customer-review",
          tab: "blocked" as const,
        }
      : reviewCount > 0
        ? {
            title: `Review ${reviewCount} customer${
              reviewCount === 1 ? "" : "s"
            } with warnings`,
            detail: "Check these rows before using the export.",
            button: "View rows to review",
            target: "customer-review",
            tab: "review" as const,
          }
        : {
            title: "Export the checked rows",
            detail: "The current profile found no issues in these rows.",
            button: "Go to export",
            target: "customer-export",
            tab: null,
          };

  const sortedRows = normalizedRows
    .map((row, index) => ({
      row,
      rowIndex: index + 1,
      issues: issuesByRow.get(index + 1) ?? [],
    }))
    .sort((a, b) => getPriority(b.issues) - getPriority(a.issues));

  const defaultReviewTab: CustomerReviewTab =
    blockedCount > 0 ? "blocked" : reviewCount > 0 ? "review" : "ready";
  const visibleReviewTab = activeReviewTab ?? defaultReviewTab;

  const visibleRows = sortedRows.filter(({ issues }) => {
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

  function handleNextAction() {
    if (nextAction.tab) setActiveReviewTab(nextAction.tab);

    requestAnimationFrame(() => {
      document
        .getElementById(nextAction.target)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function loadFile(file: File) {
    setError(null);
    setDataSet(null);
    setMapping(emptyMapping());
    setActiveReviewTab(null);
    setIsLoading(true);

    try {
      const adapter = getInputAdapter(file);

      if (!adapter) {
        throw new Error("Choose a CSV, XLSX, or XLS file.");
      }

      const parsed = await adapter.parse(file);

      if (parsed.rows.length === 0 || parsed.headers.length === 0) {
        throw new Error("The file has no readable rows and headers.");
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

  function loadExample() {
    void loadFile(
      new File([EXAMPLE_CSV], "customer-example.csv", {
        type: "text/csv",
      }),
    );
  }

  function resetFlow() {
    setDataSet(null);
    setMapping(emptyMapping());
    setError(null);
    setActiveReviewTab(null);
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

          <section className="rounded-2xl border border-[color:rgba(209,154,106,0.35)] bg-[var(--surface-base)] p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              Next action
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  {nextAction.title}
                </h2>
                <p
                  role="status"
                  className="mt-1 text-sm text-[var(--text-secondary)]"
                >
                  {nextAction.detail}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextAction}
                className="rounded-xl bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--brand-accent-soft)]"
              >
                {nextAction.button}
              </button>
            </div>
          </section>

          <section
            id="customer-mapping"
            className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  Step 1
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  Field mapping · {mappedCount}/
                  {customerValidationProfile.fields.length} fields mapped
                </h2>
              </div>

              <span className="text-xs text-[var(--text-muted)]">
                Profile: {customerValidationProfile.name} v
                {customerValidationProfile.version}
              </span>
            </div>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Check the suggested columns. Required fields are marked *.
            </p>

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
          </section>

          {mappingReady && (
            <>
              <section
                id="customer-review"
                className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  Step 2
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  Customer review
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Blocked"
                    value={blockedCount}
                    tone="border-[color:rgba(182,111,58,0.5)] bg-[rgba(182,111,58,0.12)]"
                  />
                  <Metric
                    label="Needs review"
                    value={reviewCount}
                    tone="border-[color:rgba(209,154,106,0.35)] bg-[rgba(209,154,106,0.08)]"
                  />
                  <Metric
                    label="Passed checks"
                    value={readyCount}
                    tone="border-[color:rgba(120,180,120,0.3)] bg-[rgba(120,180,120,0.07)]"
                  />
                </div>

                <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-[var(--surface-deep)] p-2 sm:grid-cols-3">
                  {(
                    [
                      {
                        key: "blocked",
                        label: "Blocked",
                        count: blockedCount,
                      },
                      {
                        key: "review",
                        label: "Needs review",
                        count: reviewCount,
                      },
                      {
                        key: "ready",
                        label: "Ready",
                        count: readyCount,
                      },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      aria-pressed={visibleReviewTab === tab.key}
                      onClick={() => setActiveReviewTab(tab.key)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                        visibleReviewTab === tab.key
                          ? "border-[color:rgba(209,154,106,0.45)] bg-[var(--surface-raised)] text-[var(--text-primary)]"
                          : "border-transparent text-[var(--text-secondary)] hover:border-white/10 hover:bg-[var(--surface-raised)]"
                      }`}
                    >
                      <span className="font-medium">{tab.label}</span>
                      <span className="font-semibold">{tab.count}</span>
                    </button>
                  ))}
                </div>

                <p
                  role="status"
                  className="mt-3 text-xs text-[var(--text-secondary)]"
                >
                  Showing {visibleRows.length}{" "}
                  {visibleReviewTab === "blocked"
                    ? "blocked"
                    : visibleReviewTab === "review"
                      ? "needs review"
                      : "ready"}{" "}
                  row{visibleRows.length === 1 ? "" : "s"}.
                </p>

                <div className="mt-5 space-y-2">
                  {visibleRows.map(({ row, rowIndex, issues }) => (
                    <article
                      key={rowIndex}
                      className="rounded-xl border border-white/10 bg-[var(--surface-deep)] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">
                            Row {rowIndex} · {row.customer_id || "No ID"}
                          </p>
                          <h3 className="mt-1 font-medium">
                            {row.name || "No customer name"}
                          </h3>
                        </div>

                        <span className="text-xs text-[var(--text-secondary)]">
                          {issues.some(
                            (issue) => issue.severity === "critical",
                          )
                            ? "Blocked"
                            : issues.length > 0
                              ? "Needs review"
                              : "Passed checks"}
                        </span>
                      </div>

                      {issues.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {issues.map((issue) => (
                            <li
                              key={`${issue.ruleId}-${issue.field}`}
                              className="border-t border-white/10 pt-2 text-sm"
                            >
                              <p className="font-medium text-[var(--text-primary)]">
                                {issue.problem}
                              </p>
                              <p className="mt-1 text-[var(--text-secondary)]">
                                {issue.why}
                              </p>
                              <p className="mt-1 text-[var(--text-muted)]">
                                Fix: {issue.fix}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}

                  {visibleRows.length === 0 && (
                    <p className="rounded-xl border border-white/10 bg-[var(--surface-deep)] p-4 text-sm text-[var(--text-secondary)]">
                      No rows in this category.
                    </p>
                  )}
                </div>
              </section>

              <section
                id="customer-export"
                className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  Step 3
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  Export reviewed data
                </h2>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Rows with critical issues are excluded. Check warnings before
                  using the export, and confirm your target ERP requirements.
                </p>

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
                    className="rounded-xl bg-[var(--brand-accent-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--surface-deep)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Export rows without blockers
                  </button>

                  <button
                    type="button"
                    disabled={validationResult.issues.length === 0}
                    onClick={exportIssues}
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
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

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}