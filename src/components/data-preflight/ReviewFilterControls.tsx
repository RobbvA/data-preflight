"use client";
import { useId } from "react";
import { EMPTY_REVIEW_FILTERS, reviewIssueType, type ReviewFilterRow, type ReviewFilters } from "@/lib/reviewFilters";
export function ReviewFilterControls({ rows, value, onChange, visible, total, issueCount }: { rows: readonly ReviewFilterRow[]; value: ReviewFilters; onChange: (value: ReviewFilters) => void; visible: number; total: number; issueCount: number }) {
  const id = useId();
  const issues = rows.flatMap(row => row.issues);
  const fields = [...new Set(issues.map(issue => issue.field))].sort();
  const types = [...new Set(issues.map(reviewIssueType).filter(Boolean))].sort();
  const update = (next: Partial<ReviewFilters>) => onChange({ ...value, ...next });
  const control = "mt-1 min-h-11 w-full rounded-xl border border-white/15 bg-[var(--surface-deep)] px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]";
  const active = Object.entries(EMPTY_REVIEW_FILTERS).some(([key, initial]) => value[key as keyof ReviewFilters] !== initial);
  return <div role="group" aria-label="Review search and filters" className="mt-3 rounded-xl border border-white/10 bg-[var(--surface-deep)] p-3 text-sm text-[var(--text-secondary)]">
    <details>
      <summary className="min-h-11 cursor-pointer py-2 font-medium text-[var(--text-primary)] marker:text-[var(--brand-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]">
        Search and filters{active && <span className="ml-2 font-normal text-[var(--text-secondary)]">· Active · {visible}/{total} rows</span>}
      </summary>
      <div className="mt-2">
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-0 basis-full sm:flex-1">Search records<input id={`${id}-search`} type="search" value={value.query} onChange={event => update({ query: event.target.value })} placeholder="ID, row, value or problem" className={control} /></label>
      <label>Sort records<select value={value.sort} onChange={event => update({ sort: event.target.value as ReviewFilters["sort"] })} className={control}><option value="priority">Priority first</option><option value="row">Source row</option><option value="issues">Most issues</option></select></label>
      <button type="button" disabled={!active} onClick={() => onChange({ ...EMPTY_REVIEW_FILTERS })} className="min-h-11 rounded-xl border border-white/15 px-3 py-2 text-[var(--text-primary)] disabled:opacity-40">Reset filters</button>
    </div>
    <label className="mt-3 flex min-h-9 items-center gap-2"><input type="checkbox" checked={value.allStatuses} onChange={event => update({ allStatuses: event.target.checked })} className="h-4 w-4 accent-[var(--brand-accent)]" />Search all statuses</label>
    <details className="mt-1"><summary className="cursor-pointer py-2">Filter by severity, field or issue type</summary><div className="mt-1 grid gap-3 sm:grid-cols-3">
      <label>Severity<select value={value.severity} onChange={event => update({ severity: event.target.value })} className={control}><option value="">Any severity</option><option value="critical">Blocking issues</option><option value="warning">Warnings</option></select></label>
      <label>Field<select value={value.field} onChange={event => update({ field: event.target.value })} className={control}><option value="">Any field</option>{fields.map(field => <option key={field} value={field}>{field.replaceAll("_", " ")}</option>)}</select></label>
      <label>Issue type<select value={value.issueType} onChange={event => update({ issueType: event.target.value })} className={control}><option value="">Any issue type</option>{types.map(type => <option key={type} value={type}>{type.replaceAll("_", " ").replaceAll("-", " ")}</option>)}</select></label>
    </div></details>
    <p role="status" aria-live="polite" className="mt-2 leading-6">Showing {visible} of {total} rows · {issueCount} {issueCount === 1 ? "issue" : "issues"} in these rows. {value.allStatuses ? "All statuses." : "Current status category."}</p>
    <p className="mt-1 leading-6">Filters change this list only. Data export still includes every row without blockers.</p>
      </div>
    </details>
  </div>;
}
