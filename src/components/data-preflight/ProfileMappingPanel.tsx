"use client";

import { useEffect, useId, useRef } from "react";
import type { DataProfile } from "@/lib/dataProfile";
import { getMappingStatus } from "@/lib/mappingStatus";

type MappingHint<TField extends string> = {
  targetField: TField;
  suggestedHeader: string;
  confidence: string;
  reason: string;
};

type ProfileMappingPanelProps<TField extends string> = {
  profile: DataProfile<TField> & { version: string };
  headers: string[];
  mapping: Readonly<Record<TField, string>>;
  suggestions?: readonly MappingHint<TField>[];
  candidates?: Partial<Record<TField, string[]>>;
  onUpdateMapping: (field: TField, header: string) => void;
  onClose: () => void;
};

export function ProfileMappingPanel<TField extends string>({
  profile,
  headers,
  mapping,
  suggestions,
  candidates,
  onUpdateMapping,
  onClose,
}: ProfileMappingPanelProps<TField>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const titleId = useId();
  const descriptionId = useId();
  const fieldIdPrefix = useId();

  const status = getMappingStatus(profile, mapping);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: "auto",
        right: 0,
        margin: 0,
        width: "min(100vw, 42rem)",
        maxWidth: "100vw",
        height: "100dvh",
        maxHeight: "100dvh",
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;

        const bounds = event.currentTarget.getBoundingClientRect();

        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          onClose();
        }
      }}
      className="overflow-y-auto border-0 border-l border-white/10 bg-[var(--surface-base)] p-0 text-[var(--text-primary)] shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[var(--surface-base)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent-soft)]">
              Step 1 · Field mapping
            </p>

            <h2
              id={titleId}
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              Match your columns
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]"
          >
            Close
          </button>
        </div>

        <p
          id={descriptionId}
          className="mt-3 text-sm leading-6 text-[var(--text-secondary)]"
        >
          Choose the source column for each field. Results update as you change
          the mapping. Required fields and duplicate assignments must be resolved.
        </p>

        <p className="mt-3 text-xs text-[var(--text-muted)]">
          {profile.name} · v{profile.version}
        </p>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-4 rounded-xl border border-white/10 bg-[var(--surface-deep)] px-4 py-3 text-sm"
        >
          <p className="font-semibold">
            {status.mappedCount}/{profile.fields.length} fields mapped
          </p>

          <p className="mt-1 text-[var(--text-secondary)]">
            {status.mappingReady
              ? "Required fields ready. You can return to review."
              : [
                  status.hasIncompleteMapping
                    ? `${status.missingRequiredFields.length} required field(s) need a column.`
                    : "",
                  status.hasDuplicateMappings
                    ? "Each source column can be assigned only once."
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {profile.fields.map((field, index) => {
          const selectedHeader = mapping[field.key];
          const missing = field.required && !selectedHeader;

          const duplicate =
            status.duplicateMappedHeaders.includes(selectedHeader);

          const invalid = missing || duplicate;

          const suggestion = suggestions?.find(
            (item) => item.targetField === field.key,
          );

          const ambiguousCandidates = candidates?.[field.key] ?? [];

          const selectId = `${fieldIdPrefix}-${index}`;
          const feedbackId = `${selectId}-feedback`;

          return (
            <div
              key={field.key}
              className={`rounded-2xl border bg-[var(--surface-raised)] p-4 ${
                invalid
                  ? "border-[var(--brand-accent-soft)]/50"
                  : "border-white/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor={selectId}
                  className="text-sm font-semibold"
                >
                  {field.label}
                </label>

                <span className="text-xs text-[var(--text-muted)]">
                  {field.required ? "Required" : "Optional"}
                </span>
              </div>

              <select
                id={selectId}
                value={selectedHeader}
                aria-required={field.required}
                aria-invalid={invalid}
                aria-describedby={feedbackId}
                onChange={(event) =>
                  onUpdateMapping(field.key, event.target.value)
                }
                className="mt-3 min-h-11 w-full rounded-xl border border-white/15 bg-[var(--surface-deep)] px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]"
              >
                <option value="">Not mapped</option>

                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>

              <p
                id={feedbackId}
                className={`mt-2 text-xs leading-5 ${
                  invalid
                    ? "text-[var(--brand-accent-soft)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {duplicate
                  ? "This column is assigned more than once. Choose a different column."
                  : missing
                    ? "Choose a source column before validation can continue."
                    : selectedHeader
                      ? `Using source column: ${selectedHeader}.`
                      : "Optional field. Leave unmapped if it is not in your file."}
              </p>

              {!selectedHeader && ambiguousCandidates.length > 1 && (
                <p className="mt-2 text-xs leading-5 text-[var(--brand-accent-soft)]">
                  Multiple possible columns: {ambiguousCandidates.join(", ")}.
                  Choose the correct one.
                </p>
              )}

              {suggestion && (
                <details className="mt-3 border-t border-white/10 pt-3 text-xs text-[var(--text-secondary)]">
                  <summary className="cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]">
                    About the automatic suggestion
                  </summary>

                  <p className="mt-2 leading-5">
                    Suggested column: {suggestion.suggestedHeader || "None"}.
                    {suggestion.confidence !== "none" &&
                      ` Confidence: ${suggestion.confidence}.`}
                  </p>

                  <p className="mt-1 leading-5">
                    {suggestion.reason}
                  </p>

                  {selectedHeader !== suggestion.suggestedHeader && (
                    <p className="mt-2 leading-5">
                      Your current selection overrides this suggestion.
                    </p>
                  )}
                </details>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={onClose}
          className="min-h-11 w-full rounded-xl bg-[var(--brand-accent)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--brand-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]"
        >
          {status.mappingReady ? "Return to review" : "Close mapping"}
        </button>
      </div>
    </dialog>
  );
}