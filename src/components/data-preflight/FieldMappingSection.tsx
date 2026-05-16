"use client";

import { useState } from "react";

import type { FieldMapping, MappingSuggestion } from "@/lib/fieldMapping";

type FieldMappingSectionProps = {
  headers: string[];
  fieldMapping: FieldMapping;
  mappingSuggestions: MappingSuggestion[];
  onUpdateFieldMapping: (
    targetField: keyof FieldMapping,
    sourceField: string,
  ) => void;
};

export function FieldMappingSection({
  headers,
  fieldMapping,
  mappingSuggestions,
  onUpdateFieldMapping,
}: FieldMappingSectionProps) {
  const [openReasonField, setOpenReasonField] = useState<
    keyof FieldMapping | null
  >(null);

  function toggleReason(targetField: keyof FieldMapping) {
    setOpenReasonField((currentField) =>
      currentField === targetField ? null : targetField,
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-lg font-semibold">Field mapping</h2>

      <p className="mt-1 text-sm text-slate-400">
        Map the uploaded CSV headers to the active data profile fields
        DataPreflight validates.
      </p>

      <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
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
                  <span className="text-sm font-medium text-slate-300">
                    {fieldLabel}
                  </span>

                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      isRequired
                        ? "border-red-400/18 bg-red-500/[0.06] text-red-200/85"
                        : "border-slate-700/70 bg-slate-800/60 text-slate-500"
                    }`}
                  >
                    {isRequired ? "Required" : "Optional"}
                  </span>

                  {suggestion.confidence !== "none" && (
                    <button
                      type="button"
                      onClick={() => toggleReason(targetField)}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/[0.06] text-xs font-semibold text-blue-200/85 transition hover:border-blue-300/40 hover:bg-blue-500/12 hover:text-blue-100"
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
                      ? "border-yellow-500/40 bg-yellow-500/10"
                      : isDuplicate
                        ? "border-red-500/40 bg-red-500/10"
                        : "border-slate-800 bg-slate-950"
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
                <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/80">
                        Mapping reason
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-200">
                        {fieldLabel} →{" "}
                        <span className="text-blue-200">
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
                          ? "border-red-400/18 bg-red-500/[0.06] text-red-200/85"
                          : "border-slate-700/70 bg-slate-800/60 text-slate-500"
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

                    <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-2 py-0.5 text-xs text-slate-500">
                      Score {suggestion.score}/100
                    </span>
                  </div>

                  {suggestion.alternatives.length > 0 && (
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Alternatives:{" "}
                      {suggestion.alternatives
                        .map((alternative) => alternative.header)
                        .join(", ")}
                    </p>
                  )}
                </div>
              )}

              {isMissing && (
                <p className="mt-1 text-xs text-yellow-200">
                  Required mapping missing
                </p>
              )}

              {isDuplicate && (
                <p className="mt-1 text-xs text-red-300">
                  This CSV column is mapped more than once
                </p>
              )}
            </div>
          );
        })}
      </div>
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
    return "border-emerald-400/18 bg-emerald-500/[0.06] text-emerald-200/85";
  }

  if (confidence === "medium") {
    return "border-blue-400/18 bg-blue-500/[0.06] text-blue-200/85";
  }

  if (confidence === "low") {
    return "border-yellow-400/18 bg-yellow-500/[0.06] text-yellow-200/85";
  }

  return "border-slate-700/70 bg-slate-800/60 text-slate-500";
}
