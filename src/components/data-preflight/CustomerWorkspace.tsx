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

  const canExport = mappingReady && validationResult.cleanRows.length > 0;

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

  const sortedRows = normalizedRows
    .map((row, index) => ({
      row,
      rowIndex: index + 1,
      issues: issuesByRow.get(index + 1) ?? [],
    }))
    .sort((a, b) => getPriority(b.issues) - getPriority(a.issues));

  async function loadFile(file: File) {
    setError(null);
    setDataSet(null);
    setMapping(emptyMapping());
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
            description="Review the mapping and customer records before export. Confirm target ERP requirements separately."
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

          <section className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                  Step 1
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  Review field mapping
                </h2>
              </div>

              <span className="text-xs text-[var(--text-muted)]">
                Profile: {customerValidationProfile.name} v
                {customerValidationProfile.version}
              </span>
            </div>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Known column names are suggested automatically. If more than one
              column matches a field, choose the correct one before export.
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
                    className="mt-1.5 w-full rounded-lg border border-white/15 bg-[var(--surface-deep)] px-3 py-2 text-sm text-[var(--text-primary)]"
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

            {requiredUnmapped.length > 0 && (
              <p className="mt-4 text-sm text-[var(--brand-accent-soft)]">
                Required mapping missing: {requiredUnmapped.join(", ")}.
              </p>
            )}

            {hasDuplicateMapping && (
              <p className="mt-2 text-sm text-[var(--brand-accent-soft)]">
                One source column is mapped to multiple fields.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              Step 2
            </p>
            <h2 className="mt-1 text-xl font-semibold">Customer review</h2>

            {!mappingReady ? (
              <div
                role="status"
                className="mt-4 rounded-xl border border-[color:rgba(209,154,106,0.35)] bg-[rgba(209,154,106,0.08)] p-4 text-sm leading-6 text-[var(--text-secondary)]"
              >
                Complete the required field mapping and resolve duplicate
                column assignments before validating these customer records.
              </div>
            ) : (
              <>
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

                <div className="mt-5 space-y-2">
                  {sortedRows.map(({ row, rowIndex, issues }) => (
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
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
              Step 3
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Export reviewed data
            </h2>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {mappingReady
                ? "Rows with critical issues are excluded. Rows with warnings remain in the export; review them first. Confirm your target ERP requirements separately."
                : "Complete the field mapping before validation and export become available."}
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
                {mappingReady
                  ? "No rows without blockers are available to export. Fix the source file and validate it again."
                  : "Complete required mapping and remove duplicate mappings to enable validation."}
              </p>
            )}
          </section>
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