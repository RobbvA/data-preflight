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

  return (
    <section aria-label="Allowed base units" className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-4">
      <h2 className="text-base font-semibold">Allowed base units <span className="text-sm font-normal text-[var(--text-secondary)]">· Optional</span></h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Upload a CSV with a unit_code column to block units outside your list. Codes are compared without case or surrounding spaces; units are never converted.
      </p>
      <p role="status" className="mt-3 text-sm text-[var(--brand-accent-soft)]">
        {loading ? "Reading unit list. Results and exports will return when reading finishes."
          : reference ? `Reference check active · ${reference.fileName} · ${reference.allowedUnits.length} unique units`
          : "Reference check not run. No unit list is active; base units are checked for presence only."}
      </p>
      {reference && <details className="mt-2 text-xs text-[var(--text-secondary)]"><summary className="cursor-pointer">View allowed units</summary><p className="mt-2 break-words">{reference.allowedUnits.join(", ")}</p></details>}
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
      {error && <p role="alert" className="mt-3 text-sm text-[var(--brand-accent-soft)]">{error} No unit list is active. Upload a corrected CSV to run the reference check.</p>}
      <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">The list stays in memory and is cleared when you reset, replace the source file, change profile, or reload the page.</p>
    </section>
  );
}
