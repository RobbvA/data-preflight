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

  const duplicateMappedHeaders = Object.values(fieldMapping)
    .filter(Boolean)
    .filter((header, index, headers) => headers.indexOf(header) !== index);

  const duplicateCount = new Set(duplicateMappedHeaders).size;

  const hasMappingIssues = missingRequiredCount > 0 || duplicateCount > 0;

  function toggleReason(targetField: keyof FieldMapping) {
    setOpenReasonField((currentField) =>
      currentField === targetField ? null : targetField,
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-slate-950/15 backdrop-blur">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Advanced mapping
            </p>

            {hasMappingIssues && (
              <span className="rounded-full border border-yellow-300/20 bg-yellow-400/[0.08] px-2 py-0.5 text-[10px] font-medium text-yellow-100/90">
                Needs review
              </span>
            )}
          </div>

          <h2 className="mt-1 text-base font-semibold text-white">
            Field mapping
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Optional configuration layer. Mapping uses header semantics and
            sample values.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-300">
            {mappedCount}/{mappingSuggestions.length} mapped
          </span>

          {missingRequiredCount > 0 && (
            <span className="rounded-full border border-yellow-300/20 bg-yellow-400/[0.08] px-2 py-0.5 text-[10px] font-medium text-yellow-100/90">
              {missingRequiredCount} missing
            </span>
          )}

          {duplicateCount > 0 && (
            <span className="rounded-full border border-red-300/20 bg-red-400/[0.08] px-2 py-0.5 text-[10px] font-medium text-red-100/90">
              {duplicateCount} duplicate
            </span>
          )}

          <span className="rounded-full border border-white/12 bg-white/[0.055] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white">
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

              const isReasonOpen = openReasonField === targetField;

              return (
                <div key={targetField} className="relative">
                  <label className="block">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">
                        {fieldLabel}
                      </span>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          isRequired
                            ? "border-red-300/18 bg-red-400/[0.07] text-red-100/85"
                            : "border-white/10 bg-white/[0.035] text-slate-400"
                        }`}
                      >
                        {isRequired ? "Required" : "Optional"}
                      </span>

                      {suggestion.confidence !== "none" && (
                        <button
                          type="button"
                          onClick={() => toggleReason(targetField)}
                          className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/[0.07] text-xs font-semibold text-cyan-100/85 transition hover:border-cyan-200/40 hover:bg-cyan-400/12 hover:text-cyan-50"
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
                      className={`mt-1.5 w-full rounded-lg border px-3 py-1.5 text-sm text-slate-100 ${
                        isMissing
                          ? "border-yellow-300/35 bg-yellow-400/[0.08]"
                          : isDuplicate
                            ? "border-red-300/35 bg-red-400/[0.08]"
                            : "border-white/10 bg-[#10182b]/80"
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
                    <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-white/12 bg-[#10182b] p-4 shadow-2xl shadow-black/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                            Mapping reason
                          </p>

                          <p className="mt-2 text-sm font-medium text-slate-100">
                            {fieldLabel} →{" "}
                            <span className="text-cyan-100">
                              {suggestion.suggestedHeader || "Not mapped"}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setOpenReasonField(null)}
                          className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-slate-200"
                          aria-label="Close mapping reason"
                        >
                          ×
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {suggestion.reason}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                            isRequired
                              ? "border-red-300/18 bg-red-400/[0.07] text-red-100/85"
                              : "border-white/10 bg-white/[0.035] text-slate-400"
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

                        <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-xs text-slate-400">
                          Score {suggestion.score}/100
                        </span>
                      </div>

                      {suggestion.alternatives.length > 0 && (
                        <p className="mt-3 text-xs leading-5 text-slate-400">
                          Alternatives:{" "}
                          {suggestion.alternatives
                            .map((alternative) => alternative.header)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {isMissing && (
                    <p className="mt-1 text-xs text-yellow-100">
                      Required mapping missing
                    </p>
                  )}

                  {isDuplicate && (
                    <p className="mt-1 text-xs text-red-200">
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
    return "border-emerald-300/18 bg-emerald-400/[0.07] text-emerald-100/85";
  }

  if (confidence === "medium") {
    return "border-cyan-300/18 bg-cyan-400/[0.07] text-cyan-100/85";
  }

  if (confidence === "low") {
    return "border-yellow-300/18 bg-yellow-400/[0.07] text-yellow-100/85";
  }

  return "border-white/10 bg-white/[0.035] text-slate-400";
}
