"use client";

import { useEffect, useRef, useState } from "react";
import { readUnitReference, type UnitReference } from "@/lib/unitReference";

export function UnitReferenceControls({ reference, onChange, onLoading }: {
  reference: UnitReference | null;
  onChange: (reference: UnitReference | null) => void;
  onLoading: (loading: boolean) => void;
}) {
  const requestId = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => { requestId.current += 1; }, []);

  function remove() {
    requestId.current += 1;
    setLoading(false);
    onLoading(false);
    onChange(null);
    setError("");
  }

  async function upload(file: File) {
    const request = ++requestId.current;
    // An invalid replacement must never leave an older list active.
    onChange(null);
    setError("");
    setLoading(true);
    onLoading(true);
    try {
      const next = await readUnitReference(file);
      if (request === requestId.current) onChange(next);
    } catch (caught) {
      if (request === requestId.current) {
        setError(caught instanceof Error ? caught.message : "Could not read this unit list.");
      }
    } finally {
      if (request === requestId.current) {
        setLoading(false);
        onLoading(false);
      }
    }
  }

  const referenceStatus = loading
    ? "Reading unit list · Results and exports temporarily unavailable"
    : error
      ? "Not run · Unit list rejected"
      : reference
        ? `Active · ${reference.fileName} · ${reference.allowedUnits.length} unique units`
        : "Not run · Base units checked for presence only";

  return (
    <div role="group" aria-label="Allowed base units" className="mt-4 border-t border-white/10 pt-2">
      <details>
        <summary className="min-h-11 cursor-pointer rounded-lg py-2 text-sm text-[var(--text-secondary)] marker:text-[var(--brand-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]">
          <span className="font-medium text-[var(--text-primary)]">Allowed base units</span>
          <span> · Optional</span>
          <span role="status" aria-live="polite" aria-atomic="true" className="mt-1 block break-words text-sm leading-5">
            {referenceStatus}
          </span>
        </summary>

        <div className="mt-2 pb-2">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Upload a CSV with a unit_code column to block units outside your list. Codes are compared without case or surrounding spaces; units are never converted.
          </p>
          {reference && <details className="mt-2 text-sm text-[var(--text-secondary)]"><summary className="cursor-pointer">View allowed units</summary><p className="mt-2 break-words">{reference.allowedUnits.join(", ")}</p></details>}
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-medium focus-within:outline-2 focus-within:outline-[var(--brand-accent-soft)]">
              {reference || loading ? "Replace unit CSV" : "Upload unit CSV"}
              <input type="file" accept=".csv,text/csv" aria-label="Upload allowed unit CSV" className="sr-only" onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file);
              }} />
            </label>
            {(reference || loading) && <button type="button" onClick={remove} className="min-h-11 rounded-xl border border-white/15 px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[var(--brand-accent-soft)]">{loading ? "Cancel unit upload" : "Remove unit list"}</button>}
          </div>
          <p className="mt-3 text-sm leading-5 text-[var(--text-secondary)]">The list stays in memory and is cleared when you reset, replace the source file, change profile, or reload the page.</p>
        </div>
      </details>
      {error && <p role="alert" className="mt-2 break-words text-sm leading-6 text-[var(--brand-accent-soft)]">{error} No unit list is active. Open Allowed base units and upload a corrected CSV to run the reference check.</p>}
    </div>
  );
}
