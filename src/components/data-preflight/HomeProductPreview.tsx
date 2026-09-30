import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import type { DataDomain } from "@/components/data-preflight/WorkspaceLayout";

const toneClasses = {
  blocked:
    "border-[color:rgba(182,111,58,0.45)] bg-[rgba(182,111,58,0.12)] text-[var(--brand-accent-soft)]",
  review:
    "border-[color:rgba(209,154,106,0.3)] bg-[rgba(209,154,106,0.07)] text-[var(--brand-accent-soft)]",
  ready:
    "border-[color:rgba(120,180,120,0.3)] bg-[rgba(120,180,120,0.07)] text-[#a8c9a8]",
};

const examples = {
  invoice: {
    label: "Invoice example",
    counts: [2, 1, 3],
    issues: [
      {
        reference: "INV-1042",
        problem: "Invoice number appears more than once",
        status: "Blocked",
      },
      {
        reference: "INV-1045",
        problem: "Due date is before invoice date",
        status: "Review",
      },
    ],
  },
  customer: {
    label: "Customer example",
    counts: [3, 0, 2],
    issues: [
      {
        reference: "C-1002",
        problem: "Customer ID appears more than once",
        status: "Blocked",
      },
      {
        reference: "Row 4",
        problem: "Customer ID is missing",
        status: "Blocked",
      },
    ],
  },
};

export function HomeProductPreview({ domain }: { domain: DataDomain }) {
  const example = examples[domain];

  const statuses = [
    {
      label: "Blocked",
      count: example.counts[0],
      icon: AlertTriangle,
      className: toneClasses.blocked,
    },
    {
      label: "Needs review",
      count: example.counts[1],
      icon: Search,
      className: toneClasses.review,
    },
    {
      label: domain === "invoice" ? "Ready" : "Passed checks",
      count: example.counts[2],
      icon: CheckCircle2,
      className: toneClasses.ready,
    },
  ];

  return (
    <section
      aria-label={`Illustrative ${domain} validation preview`}
      className="h-full w-full overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-[var(--surface-base)]/65"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5 sm:px-7">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {example.label}
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
            {example.issues.map((issue) => (
              <div
                key={`${issue.reference}-${issue.problem}`}
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
                <span className="shrink-0 text-[11px] font-medium text-[var(--brand-accent-soft)]">
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">
          Illustrative {domain} data. Open the example file to inspect actual
          results.
        </p>
      </div>
    </section>
  );
}