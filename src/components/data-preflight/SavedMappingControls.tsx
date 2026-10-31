"use client";

import { useState } from "react";
import type { DataProfile } from "@/lib/dataProfile";
import { getMappingStatus } from "@/lib/mappingStatus";
import {
  prepareSavedMapping,
  readSavedMappings,
  writeSavedMapping,
  type MappingLibrary,
} from "@/lib/savedMappings";

const buttonStyle =
  "min-h-11 rounded-xl border border-white/15 px-3 py-2 text-sm font-medium disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]";

const inputStyle =
  "min-h-11 w-full rounded-xl border border-white/15 bg-[var(--surface-deep)] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[var(--brand-accent-soft)]";

function loadLibrary(): MappingLibrary {
  try {
    return readSavedMappings(window.localStorage);
  } catch {
    return {
      items: [],
      error:
        "Saved mappings are unavailable in this browser. Manual mapping still works.",
    };
  }
}

export function SavedMappingControls<TField extends string>({
  profile,
  headers,
  mapping,
  onApply,
}: {
  profile: DataProfile<TField> & { version: string };
  headers: string[];
  mapping: Readonly<Record<TField, string>>;
  onApply: (mapping: Record<TField, string>) => void;
}) {
  const [library, setLibrary] = useState(loadLibrary);
  const [selectedName, setSelectedName] = useState("");
  const [name, setName] = useState("");
  const [reviewedVersion, setReviewedVersion] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [message, setMessage] = useState("");

  const items = library.items.filter(
    (item) => item.profileId === profile.id,
  );

  const selected = items.find((item) => item.name === selectedName);

  const prepared = selected
    ? prepareSavedMapping(selected, profile, headers)
    : null;

  const trimmedName = name.trim();

  const replacing = items.some((item) => item.name === trimmedName);

  const canSave =
    getMappingStatus(profile, mapping).mappingReady &&
    profile.fields.every(
      ({ key }) => !mapping[key] || headers.includes(mapping[key]),
    );

  function persist(remove = false) {
    const targetName = remove ? selectedName : trimmedName;

    if (!targetName || library.error || (!remove && !canSave)) return;

    try {
      const result = writeSavedMapping(
        window.localStorage,
        {
          profileId: profile.id,
          name: targetName,
        },
        remove
          ? null
          : {
              name: targetName,
              profileId: profile.id,
              profileVersion: profile.version,
              headers: [...headers],
              mapping: Object.fromEntries(
                profile.fields.map(({ key }) => [key, mapping[key]]),
              ),
            },
      );

      setLibrary(result);

      if (!result.error) {
        setMessage(
          remove
            ? "Saved mapping deleted."
            : "Mapping saved in this browser.",
        );
        setSelectedName(remove ? "" : targetName);
        setReviewedVersion(false);
        setDeletePending(false);
      }
    } catch {
      setLibrary({
        ...library,
        error:
          "Browser storage is unavailable. Manual mapping still works.",
      });
    }
  }

  return (
    <details className="rounded-2xl border border-white/10 bg-[var(--surface-deep)] p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        Saved mappings
      </summary>

      <p className="mt-3 text-sm leading-5 text-[var(--text-secondary)]">
        Save column assignments for this profile on this device and browser.
        No file rows are saved. Clearing browser data removes saved mappings.
      </p>

      {library.error ? (
        <div
          role="alert"
          className="mt-3 text-sm text-[var(--brand-accent-soft)]"
        >
          <p>{library.error}</p>

          <button
            type="button"
            className={`${buttonStyle} mt-2`}
            onClick={() => setLibrary(loadLibrary())}
          >
            Retry storage
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            Saved mapping

            <select
              aria-label="Saved mapping"
              className={`${inputStyle} mt-2`}
              value={selectedName}
              onChange={(event) => {
                setSelectedName(event.target.value);
                setReviewedVersion(false);
                setDeletePending(false);
                setMessage("");
              }}
            >
              <option value="">
                {items.length
                  ? "Choose a saved mapping"
                  : "No saved mappings for this profile"}
              </option>

              {items.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          {selected && prepared && (
            <div className="space-y-3 text-sm leading-5 text-[var(--text-secondary)]">
              <p>
                Saved with profile v{selected.profileVersion}. Current profile
                v{profile.version}.
              </p>

              {prepared.missingHeaders.length > 0 && (
                <p>
                  Missing source columns:{" "}
                  {prepared.missingHeaders.join(", ")}. Applying clears those
                  assignments; check the mapping below.
                </p>
              )}

              {prepared.versionChanged && (
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={reviewedVersion}
                    onChange={(event) =>
                      setReviewedVersion(event.target.checked)
                    }
                    className="mt-1"
                  />

                  <span>
                    The profile version changed. I will review these
                    assignments against the current fields and rules.
                  </span>
                </label>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={buttonStyle}
                  disabled={
                    !prepared.sameProfile ||
                    (prepared.versionChanged && !reviewedVersion)
                  }
                  onClick={() => {
                    onApply(prepared.mapping);

                    setMessage(
                      prepared.status.mappingReady
                        ? "Saved mapping applied. Check the assignments and updated results."
                        : "Saved mapping applied. Resolve the mapping errors below before validation can continue.",
                    );
                  }}
                >
                  Apply mapping
                </button>

                <button
                  type="button"
                  className={buttonStyle}
                  onClick={() =>
                    deletePending ? persist(true) : setDeletePending(true)
                  }
                >
                  {deletePending ? "Confirm delete" : "Delete mapping"}
                </button>

                {deletePending && (
                  <button
                    type="button"
                    className={buttonStyle}
                    onClick={() => setDeletePending(false)}
                  >
                    Cancel delete
                  </button>
                )}
              </div>
            </div>
          )}

          <label className="block text-sm">
            Mapping name

            <input
              className={`${inputStyle} mt-2`}
              maxLength={80}
              value={name}
              placeholder="For example: Supplier export"
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <button
            type="button"
            className={buttonStyle}
            disabled={!canSave || !trimmedName}
            onClick={() => persist()}
          >
            {replacing ? "Replace saved mapping" : "Save current mapping"}
          </button>

          {!canSave && (
            <p className="text-sm text-[var(--text-secondary)]">
              Resolve required fields and duplicate assignments before saving.
            </p>
          )}
        </div>
      )}

      {message && (
        <p
          role="status"
          className="mt-3 text-sm text-[var(--brand-accent-soft)]"
        >
          {message}
        </p>
      )}
    </details>
  );
}