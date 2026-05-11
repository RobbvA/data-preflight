"use client";

import { useMemo, useState } from "react";

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

import type { InvoicePreviewItem } from "@/components/data-preflight/types";

const expectedInvoiceFields: Array<keyof FieldMapping> = [
  "invoice_number",
  "company",
  "email",
  "amount",
  "vat",
  "status",
  "country",
  "invoice_date",
  "due_date",
  "currency",
];

export function CsvUploader() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] =
    useState<FieldMapping>(createEmptyMapping());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockedRowIndex, setSelectedBlockedRowIndex] = useState<
    number | null
  >(null);
  const [showOnlyBlocked, setShowOnlyBlocked] = useState(false);
  const [isCleanOpen, setIsCleanOpen] = useState(false);
  const [isBlockedOpen, setIsBlockedOpen] = useState(true);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setIsLoading(true);
    setFileName(file.name);
    setSelectedBlockedRowIndex(null);
    setShowOnlyBlocked(false);
    setIsCleanOpen(false);
    setIsBlockedOpen(true);

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
      setSelectedBlockedRowIndex(null);
      setShowOnlyBlocked(false);
      setIsCleanOpen(false);
      setIsBlockedOpen(true);
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
    setSelectedBlockedRowIndex(null);
    setShowOnlyBlocked(false);
    setIsCleanOpen(false);
    setIsBlockedOpen(true);
  }

  function updateFieldMapping(
    targetField: keyof FieldMapping,
    sourceField: string,
  ) {
    setFieldMapping((currentMapping) => ({
      ...currentMapping,
      [targetField]: sourceField,
    }));

    setSelectedBlockedRowIndex(null);
  }

  function toggleBlockedFilter() {
    setShowOnlyBlocked((currentValue) => !currentValue);
    setSelectedBlockedRowIndex(null);
  }

  const mappingSuggestions = useMemo<MappingSuggestion[]>(() => {
    return createMappingSuggestions(headers, rows);
  }, [headers, rows]);

  const selectedRows = useMemo(() => {
    return rows.map((row) => {
      const mappedRow: CsvRow = {};

      expectedInvoiceFields.forEach((targetField) => {
        const sourceField = fieldMapping[targetField];

        mappedRow[targetField] = sourceField ? (row[sourceField] ?? "") : "";
      });

      return mappedRow;
    });
  }, [rows, fieldMapping]);

  const normalizedRows = useMemo(() => {
    return normalizeInvoiceRows(selectedRows);
  }, [selectedRows]);

  const validationResult = useMemo(() => {
    return validateRows(normalizedRows);
  }, [normalizedRows]);

  const missingExpectedFields = useMemo(() => {
    return expectedInvoiceFields.filter((field) => !fieldMapping[field]);
  }, [fieldMapping]);

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

  const cleanInvoiceItems = useMemo<InvoicePreviewItem[]>(() => {
    return normalizedRows
      .map((row, index) => ({
        rowIndex: index + 1,
        row,
        issues: issuesByRow[index + 1] ?? [],
      }))
      .filter((item) => item.issues.length === 0);
  }, [normalizedRows, issuesByRow]);

  const blockedInvoiceItems = useMemo<InvoicePreviewItem[]>(() => {
    return normalizedRows
      .map((row, index) => ({
        rowIndex: index + 1,
        row,
        issues: issuesByRow[index + 1] ?? [],
      }))
      .filter((item) =>
        item.issues.some((issue) => issue.severity === "critical"),
      );
  }, [normalizedRows, issuesByRow]);

  const selectedBlockedInvoice =
    blockedInvoiceItems.find(
      (item) => item.rowIndex === selectedBlockedRowIndex,
    ) ?? null;

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

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 px-5 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-160px] h-[620px] w-[980px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-[460px] w-[620px] rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-120px] h-[420px] w-[620px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.1),_rgba(2,6,23,1))]" />
      </div>

      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 pt-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300/80">
              Invoice data preflight
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              DataPreflight
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              A trust layer for messy invoice CSV exports. Map headers, validate
              business rules, inspect issues, and export only clean invoice data.
            </p>
          </div>

          <UploadSection
            fileName={fileName}
            isLoading={isLoading}
            error={error}
            hasActiveFile={rows.length > 0 || Boolean(error) || Boolean(fileName)}
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

        {hasHeaders ? (
          <FieldMappingSection
            headers={headers}
            expectedInvoiceFields={expectedInvoiceFields}
            fieldMapping={fieldMapping}
            mappingSuggestions={mappingSuggestions}
            onUpdateFieldMapping={updateFieldMapping}
          />
        ) : (
          <section className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-6 shadow-2xl shadow-blue-950/10 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Mapping setup
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-200">
              Waiting for CSV headers
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Upload an invoice CSV to detect headers and create the field
              mapping layer.
            </p>
          </section>
        )}

        {hasUploadedRows && (
          <InvoiceReviewSection
            showOnlyBlocked={showOnlyBlocked}
            cleanInvoiceItems={cleanInvoiceItems}
            blockedInvoiceItems={blockedInvoiceItems}
            selectedBlockedRowIndex={selectedBlockedRowIndex}
            isCleanOpen={isCleanOpen}
            isBlockedOpen={isBlockedOpen}
            onToggleBlockedFilter={toggleBlockedFilter}
            onSelectBlockedInvoice={setSelectedBlockedRowIndex}
            onToggleCleanOpen={() => setIsCleanOpen((current) => !current)}
            onToggleBlockedOpen={() => setIsBlockedOpen((current) => !current)}
          />
        )}

        {selectedBlockedInvoice && (
          <BlockedInvoiceDetail
            selectedBlockedInvoice={selectedBlockedInvoice}
            onClose={() => setSelectedBlockedRowIndex(null)}
          />
        )}
      </div>
    </main>
  );
}