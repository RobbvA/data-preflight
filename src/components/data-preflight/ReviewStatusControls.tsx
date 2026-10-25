"use client";

import { AlertTriangle, CheckCircle2, Search } from "lucide-react";

export type ReviewCategory = "blocked" | "review" | "ready";

export type ReviewCounts = {
  blocked: number;
  needsReview: number;
  ready: number;
};

const categories = [
  {
    key: "blocked",
    countKey: "blocked",
    label: "Blocked",
    description: "Fix first",
    icon: AlertTriangle,
    activeClass:
      "border-[color:rgba(180,90,80,0.35)] bg-[rgba(180,90,80,0.07)]",
    iconClass: "text-[#c9958d]",
  },
  {
    key: "review",
    countKey: "needsReview",
    label: "Needs review",
    description: "Check before export",
    icon: Search,
    activeClass:
      "border-[color:rgba(195,170,80,0.35)] bg-[rgba(195,170,80,0.07)]",
    iconClass: "text-[#c9b77e]",
  },
  {
    key: "ready",
    countKey: "ready",
    label: "Ready",
    description: "Passed current checks",
    icon: CheckCircle2,
    activeClass:
      "border-[color:rgba(120,180,120,0.35)] bg-[rgba(120,180,120,0.07)]",
    iconClass: "text-[#a8c9a8]",
  },
] as const;

export function ReviewStatusControls({
  counts,
  activeCategory,
  onCategoryChange,
}: {
  counts: ReviewCounts;
  activeCategory: ReviewCategory;
  onCategoryChange: (category: ReviewCategory) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter validation results"
      className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-[var(--surface-deep)] p-2 sm:grid-cols-3"
    >
      {categories.map((category) => {
        const active = activeCategory === category.key;
        const count = counts[category.countKey];
        const Icon = category.icon;

        return (
          <button
            key={category.key}
            type="button"
            aria-pressed={active}
            onClick={() => onCategoryChange(category.key)}
            className={`min-h-16 rounded-xl border px-3 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)] ${
              active
                ? `${category.activeClass} text-[var(--text-primary)]`
                : "border-transparent text-[var(--text-secondary)] hover:border-white/10 hover:bg-[var(--surface-raised)]"
            }`}
          >
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="flex items-center gap-2">
                  <Icon
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 ${category.iconClass}`}
                  />

                  <span className="text-sm font-semibold leading-5">
                    {category.label}
                  </span>
                </span>

                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                  {category.description}
                </span>
              </span>

              <span className="text-xl font-semibold leading-6 tabular-nums">
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ReviewStatusSummary({
  counts,
}: {
  counts: ReviewCounts;
}) {
  const status =
    counts.blocked > 0
      ? {
          label: "Fix blocked first",
          className:
            "border-[color:rgba(182,111,58,0.4)] bg-[rgba(182,111,58,0.1)]",
        }
      : counts.needsReview > 0
        ? {
            label: "Review warnings",
            className:
              "border-[color:rgba(209,154,106,0.3)] bg-[rgba(209,154,106,0.08)]",
          }
        : counts.ready > 0
          ? {
              label: "Passed current checks",
              className:
                "border-[color:rgba(120,180,120,0.3)] bg-[rgba(120,180,120,0.07)]",
            }
          : {
              label: "No results yet",
              className: "border-white/10 bg-white/[0.04]",
            };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] ${status.className}`}
    >
      {status.label}
    </span>
  );
}