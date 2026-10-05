"use client";

import { downloadCsv } from "@/lib/exportData";
import { buildValidationReportRows } from "@/lib/validationReport";

type ValidationContextPanelProps<TField extends string> = {
  profile: { id: string; name: string; version: string };
  fileName: string;
  mapping: Readonly<Record<TField, string>>;
  counts: {
    total: number;
    blocked: number;
    needsReview: number;
    ready: number;
  };
};

export function ValidationContextPanel<TField extends string>({
  profile,
  fileName,
  mapping,
  counts,
}: ValidationContextPanelProps<TField>) {
  const appliedMapping: Record<string, string> = Object.fromEntries(
    (Object.entries(mapping) as Array<[string, string]>).sort(
      ([first], [second]) => first.localeCompare(second),
    ),
  );

  function downloadReport() {
    downloadCsv(
      "validation-report.csv",
      buildValidationReportRows({ profile, fileName, mapping, counts }),
    );
  }

  return (
    <section
      aria-label="Applied validation context"
      className="mt-5 rounded-xl border border-white/10 bg-[var(--surface-deep)] p-4"
    >
      <details className="text-xs">
        <summary className="cursor-pointer text-sm font-medium text-[var(--text-primary)]">
          Validation details · {profile.name} v{profile.version}
        </summary>

        <dl className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-[var(--text-muted)]">Profile ID and version</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {profile.id} · v{profile.version}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-[var(--text-muted)]">Source file</dt>
            <dd className="mt-1 break-all text-[var(--text-primary)]">
              {fileName}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-[var(--text-muted)]">Validation result</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {counts.total} rows · {counts.blocked} blocked ·{" "}
              {counts.needsReview} need review · {counts.ready} ready
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="font-medium text-[var(--text-secondary)]">
              Applied field mapping
            </dt>
            <dd>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                {Object.entries(appliedMapping).map(([field, header]) => (
                  <div key={field} className="min-w-0">
                    <dt className="text-[var(--text-muted)]">{field}</dt>
                    <dd className="break-all text-[var(--text-primary)]">
                      {header || "Not mapped"}
                    </dd>
                  </div>
                ))}
              </dl>
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={downloadReport}
          className="mt-4 rounded-lg border border-white/15 bg-[var(--surface-raised)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--brand-accent)]"
        >
          Download validation report CSV
        </button>
      </details>
    </section>
  );
}