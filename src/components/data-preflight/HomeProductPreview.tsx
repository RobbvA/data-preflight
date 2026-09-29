import { AlertTriangle, CheckCircle2, Search } from "lucide-react";

const statuses = [
  {
    label: "Blocked",
    count: 2,
    icon: AlertTriangle,
    className:
      "border-[color:rgba(182,111,58,0.45)] bg-[rgba(182,111,58,0.12)] text-[var(--brand-accent-soft)]",
  },
  {
    label: "Needs review",
    count: 1,
    icon: Search,
    className:
      "border-[color:rgba(209,154,106,0.3)] bg-[rgba(209,154,106,0.07)] text-[var(--brand-accent-soft)]",
  },
  {
    label: "Ready",
    count: 3,
    icon: CheckCircle2,
    className:
      "border-[color:rgba(120,180,120,0.3)] bg-[rgba(120,180,120,0.07)] text-[#a8c9a8]",
  },
];

const issues = [
  {
    reference: "INV-1042",
    problem: "Invoice number appears more than once",
    status: "Blocked",
    className: "text-[var(--brand-accent-soft)]",
  },
  {
    reference: "INV-1045",
    problem: "Due date is before invoice date",
    status: "Review",
    className: "text-[var(--text-secondary)]",
  },
];

export function HomeProductPreview() {
  return (
    <section
      aria-label="Illustrative invoice validation preview"
      className="h-full w-full overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[var(--surface-base)]/65"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5 sm:px-7">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Invoice example
          </p>
          <h2 className="mt-1 text-base font-medium text-[var(--text-secondary)] sm:text-lg">
            Review workspace
          </h2>
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-[var(--text-secondary)]">
          Preview
        </span>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid grid-cols-3 gap-2">
          {statuses.map(({ label, count, icon: Icon, className }) => (
            <div
              key={label}
              className={`min-w-0 rounded-xl border p-2.5 sm:p-4 ${className}`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              <p className="mt-3 text-2xl font-semibold leading-none text-[var(--text-primary)] sm:text-3xl">
                {count}
              </p>
              <p className="mt-2 text-[11px] leading-tight">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-[var(--surface-deep)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <p className="text-xs font-semibold text-[var(--text-primary)]">
              Issues to inspect
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              Priority first
            </span>
          </div>

          <div className="divide-y divide-white/10">
            {issues.map((issue) => (
              <div
                key={issue.reference}
                className="flex items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {issue.reference}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-primary)]">
                    {issue.problem}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[11px] font-medium ${issue.className}`}
                >
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">
          Example invoice data. Validate your own file to see its results.
        </p>
      </div>
    </section>
  );
}