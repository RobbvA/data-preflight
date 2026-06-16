"use client";

import { useState } from "react";

import type { FieldMapping, MappingSuggestion } from "@/lib/fieldMapping";

type FieldMappingSectionProps = {
  headers: string[];
  fieldMapping: FieldMapping;
  mappingSuggestions: MappingSuggestion[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onUpdateFieldMapping: (
    targetField: keyof FieldMapping,
    sourceField: string,
  ) => void;
};

export function FieldMappingSection({
  headers,
  fieldMapping,
  mappingSuggestions,
  isOpen,
  onToggleOpen,
  onUpdateFieldMapping,
}: FieldMappingSectionProps) {
  const [openReasonField, setOpenReasonField] = useState<
    keyof FieldMapping | null
  >(null);

  const mappedCount = Object.values(fieldMapping).filter(Boolean).length;

  const missingRequiredCount = mappingSuggestions.filter(
    (suggestion) =>
      suggestion.required && !fieldMapping[suggestion.targetField],
  ).length;

  const lowConfidenceCount = mappingSuggestions.filter(
    (suggestion) =>
      suggestion.suggestedHeader && suggestion.confidence === "low",
  ).length;

  const duplicateMappedHeaders = Object.values(fieldMapping)
    .filter(Boolean)
    .filter((header, index, headers) => headers.indexOf(header) !== index);

  const duplicateCount = new Set(duplicateMappedHeaders).size;

  const hasMappingIssues =
    missingRequiredCount > 0 || duplicateCount > 0 || lowConfidenceCount > 0;

  function toggleReason(targetField: keyof FieldMapping) {
    setOpenReasonField((currentField) =>
      currentField === targetField ? null : targetField,
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-4 shadow-xl shadow-black/20">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Advanced mapping
            </p>

            {hasMappingIssues && (
              <span className="rounded-full border border-[color:rgba(182,111,58,0.3)] bg-[rgba(182,111,58,0.09)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-primary)]">
                Needs review
              </span>
            )}
          </div>

          <h2 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
            Field mapping
          </h2>

          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Deterministic auto-mapping based on header meaning, sample values,
            and column behavior.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
            {mappedCount}/{mappingSuggestions.length} mapped
          </span>

          {missingRequiredCount > 0 && (
            <span className="rounded-full border border-[color:rgba(182,111,58,0.3)] bg-[rgba(182,111,58,0.09)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-primary)]">
              {missingRequiredCount} missing
            </span>
          )}

          {lowConfidenceCount > 0 && (
            <span className="rounded-full border border-[color:rgba(182,111,58,0.24)] bg-[rgba(182,111,58,0.08)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-primary)]">
              {lowConfidenceCount} low confidence
            </span>
          )}

          {duplicateCount > 0 && (
            <span className="rounded-full border border-[color:rgba(182,111,58,0.4)] bg-[rgba(182,111,58,0.12)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-primary)]">
              {duplicateCount} duplicate
            </span>
          )}

          <span className="rounded-full border border-white/10 bg-[var(--surface-raised)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition hover:border-[color:rgba(182,111,58,0.35)] hover:text-[var(--text-primary)]">
            {isOpen ? "Hide mapping" : "Show mapping"}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
            {mappingSuggestions.map((suggestion) => {
              const targetField = suggestion.targetField;
              const selectedHeader = fieldMapping[targetField];

              const fieldLabel = suggestion.targetLabel;
              const isRequired = suggestion.required;

              const isMissing = isRequired && !selectedHeader;

              const isDuplicate =
                selectedHeader !== "" &&
                Object.values(fieldMapping).filter(
                  (mappedHeader) => mappedHeader === selectedHeader,
                ).length > 1;

              const needsConfidenceReview =
                selectedHeader !== "" && suggestion.confidence === "low";

              const isReasonOpen = openReasonField === targetField;

              return (
                <div key={targetField} className="relative">
                  <label className="block">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {fieldLabel}
                      </span>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          isRequired
                            ? "border-[color:rgba(182,111,58,0.35)] bg-[rgba(182,111,58,0.1)] text-[var(--text-primary)]"
                            : "border-white/10 bg-white/[0.035] text-[var(--text-muted)]"
                        }`}
                      >
                        {isRequired ? "Required" : "Optional"}
                      </span>

                      {suggestion.confidence !== "none" && (
                        <button
                          type="button"
                          onClick={() => toggleReason(targetField)}
                          className="flex h-5 w-5 items-center justify-center rounded-full border border-[color:rgba(182,111,58,0.28)] bg-[rgba(182,111,58,0.08)] text-xs font-semibold text-[var(--brand-accent-soft)] transition hover:border-[color:rgba(182,111,58,0.45)] hover:bg-[rgba(182,111,58,0.12)] hover:text-[var(--text-primary)]"
                          aria-label={`Show mapping reason for ${fieldLabel}`}
                        >
                          ?
                        </button>
                      )}

                      {suggestion.confidence !== "none" && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getConfidenceClasses(
                            suggestion.confidence,
                          )}`}
                        >
                          {getConfidenceLabel(suggestion.confidence)}
                        </span>
                      )}
                    </div>

                    <select
                      value={selectedHeader}
                      onChange={(event) =>
                        onUpdateFieldMapping(targetField, event.target.value)
                      }
                      className={`mt-1.5 w-full rounded-lg border px-3 py-1.5 text-sm text-[var(--text-primary)] ${
                        isMissing
                          ? "border-[color:rgba(182,111,58,0.4)] bg-[rgba(182,111,58,0.1)]"
                          : isDuplicate
                            ? "border-[color:rgba(182,111,58,0.45)] bg-[rgba(182,111,58,0.12)]"
                            : needsConfidenceReview
                              ? "border-[color:rgba(182,111,58,0.28)] bg-[rgba(182,111,58,0.08)]"
                              : "border-white/10 bg-[var(--surface-deep)]"
                      }`}
                    >
                      <option value="">Not mapped</option>

                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </label>

                  {isReasonOpen && (
                    <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-white/10 bg-[var(--surface-deep)] p-4 shadow-2xl shadow-black/35">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                            Mapping reason
                          </p>

                          <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                            {fieldLabel} →{" "}
                            <span className="text-[var(--brand-accent-soft)]">
                              {suggestion.suggestedHeader || "Not mapped"}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setOpenReasonField(null)}
                          className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-[var(--text-muted)] transition hover:border-[color:rgba(182,111,58,0.35)] hover:text-[var(--text-primary)]"
                          aria-label="Close mapping reason"
                        >
                          ×
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {suggestion.reason}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                            isRequired
                              ? "border-[color:rgba(182,111,58,0.35)] bg-[rgba(182,111,58,0.1)] text-[var(--text-primary)]"
                              : "border-white/10 bg-white/[0.035] text-[var(--text-muted)]"
                          }`}
                        >
                          {isRequired ? "Required" : "Optional"}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getConfidenceClasses(
                            suggestion.confidence,
                          )}`}
                        >
                          {getConfidenceLabel(suggestion.confidence)}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                          Score {suggestion.score}/100
                        </span>
                      </div>

                      {suggestion.alternatives.length > 0 && (
                        <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
                          Alternatives:{" "}
                          {suggestion.alternatives
                            .map(
                              (alternative) =>
                                `${alternative.header} (${alternative.score})`,
                            )
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {isMissing && (
                    <p className="mt-1 text-xs text-[var(--brand-accent-soft)]">
                      Required mapping missing
                    </p>
                  )}

                  {needsConfidenceReview && (
                    <p className="mt-1 text-xs text-[var(--brand-accent-soft)]">
                      Low confidence. Review this mapping before export.
                    </p>
                  )}

                  {isDuplicate && (
                    <p className="mt-1 text-xs text-[var(--brand-accent-soft)]">
                      This CSV column is mapped more than once
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function getConfidenceLabel(confidence: MappingSuggestion["confidence"]) {
  if (confidence === "high") return "High";
  if (confidence === "medium") return "Medium";
  if (confidence === "low") return "Low";

  return "None";
}

function getConfidenceClasses(confidence: MappingSuggestion["confidence"]) {
  if (confidence === "high") {
    return "border-white/10 bg-white/[0.04] text-[var(--text-secondary)]";
  }

  if (confidence === "medium") {
    return "border-[color:rgba(182,111,58,0.22)] bg-[rgba(182,111,58,0.07)] text-[var(--text-secondary)]";
  }

  if (confidence === "low") {
    return "border-[color:rgba(182,111,58,0.32)] bg-[rgba(182,111,58,0.1)] text-[var(--text-primary)]";
  }

  return "border-white/10 bg-white/[0.035] text-[var(--text-muted)]";
}
