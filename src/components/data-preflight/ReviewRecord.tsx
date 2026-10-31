"use client";

import { useId } from "react";

type ReviewRecordIssue = {
  severity: "critical" | "warning";
  problem: string;
  why: string;
  fix: string;
};

type ReviewRecordProps = {
  title: string;
  subtitle?: string;
  context?: string;
  rowIndex: number;
  fields: { label: string; value: string | undefined }[];
  issues: ReviewRecordIssue[];
  expanded: boolean;
  onToggle: () => void;
  detailsNote?: string;
};

export function ReviewRecord({ title, subtitle, context, rowIndex, fields, issues, expanded, onToggle, detailsNote }: ReviewRecordProps) {
  const detailsId = useId();
  const mainIssue = issues.find((issue) => issue.severity === "critical") ?? issues[0];

  return (
    <article className="rounded-xl border border-[rgba(229,218,200,0.14)] bg-[#1a1a18] px-3 py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h4 className="break-all text-base font-semibold text-[var(--text-primary)]">{title}</h4>
          {subtitle && <p className="break-words text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
        <p className="text-sm leading-5 text-[var(--text-secondary)]">
          Row {rowIndex} · {issues.length ? issues.length + (issues.length === 1 ? " issue" : " issues") : "Ready"}
        </p>
      </div>

      {mainIssue ? (
        <div className="mt-1">
          <p className="break-words text-base font-semibold leading-6 text-[var(--text-primary)]">{mainIssue.problem}</p>
          <p className="mt-0.5 break-words text-base leading-6 text-[var(--text-primary)]"><span className="font-semibold">Fix:</span> {mainIssue.fix}</p>
        </div>
      ) : (
        <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">{context ? context + " · " : ""}Passed current checks</p>
      )}

      <button type="button" aria-expanded={expanded} aria-controls={detailsId} onClick={onToggle}
        className="mt-1 inline-flex min-h-9 items-center gap-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]">
        <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
        {expanded ? "Hide details" : issues.length > 1 ? "Details · all " + issues.length + " issues" : "Details"}
      </button>

      <div id={detailsId} hidden={!expanded} className="mt-2 border-t border-white/10 pt-3">
        <dl className="grid gap-2 sm:grid-cols-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="min-w-0 rounded-lg bg-[var(--surface-deep)] p-2">
              <dt className="text-sm text-[var(--text-secondary)]">{label}</dt>
              <dd className="mt-1 break-words text-sm text-[var(--text-primary)]">{value || "—"}</dd>
            </div>
          ))}
        </dl>
        {detailsNote && <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{detailsNote}</p>}
        {issues.length ? (
          <div className="mt-2 space-y-2">
            {issues.map((issue, index) => (
              <div key={issue.problem + "-" + index} className="break-words text-base leading-6">
                {issue !== mainIssue && <p className="font-semibold text-[var(--text-primary)]">{issue.problem}</p>}
                <p className="text-[var(--text-secondary)]"><span className="font-semibold">Why:</span> {issue.why}</p>
                {issue !== mainIssue && <p className="mt-1 text-[var(--text-secondary)]"><span className="font-semibold">Fix:</span> {issue.fix}</p>}
              </div>
            ))}
          </div>
        ) : <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">This row passed the current profile checks. Confirm your target ERP requirements before import.</p>}
      </div>
    </article>
  );
}
