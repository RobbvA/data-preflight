import type { ReactNode } from "react";
import { HomeProductPreview } from "@/components/data-preflight/HomeProductPreview";

export type DataDomain = "invoice" | "customer";

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--surface-deep)] px-4 py-6 text-[var(--text-primary)] sm:px-8 lg:px-10 xl:px-12">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[rgba(182,111,58,0.1)] blur-3xl" />
        <div className="absolute right-[-240px] top-20 h-[500px] w-[620px] rounded-full bg-[rgba(182,111,58,0.07)] blur-3xl" />
        <div className="absolute bottom-[-240px] left-[-180px] h-[460px] w-[620px] rounded-full bg-white/[0.035] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(10,9,7,0.94),_rgba(17,16,13,0.98),_rgba(10,9,7,1))]" />
      </div>

      <div className="mx-auto max-w-[1480px] space-y-7">
        {children}
        <ProductFooter />
      </div>
    </main>
  );
}

export function LandingWorkspace({
  domain,
  upload,
}: {
  domain: DataDomain;
  upload: ReactNode;
}) {
  return (
    <section className="w-full py-5 sm:py-8 lg:flex lg:min-h-[calc(100svh-9rem)] lg:flex-col lg:justify-center lg:py-10">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl xl:text-6xl">
          DataPreflight
        </h1>

        <p className="mt-2 text-base font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)] sm:text-lg xl:text-xl">
          ERP data validation
        </p>

        <h2 className="mt-7 text-xl font-semibold leading-snug tracking-tight text-[var(--text-primary)] sm:text-2xl">
          Validate data before ERP import.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
          See what needs attention, why it matters, and which records passed
          the current checks.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:items-stretch lg:gap-7">
        <div className="order-2 lg:order-1">
          <HomeProductPreview domain={domain} />
        </div>

        <div className="order-1 lg:order-2">{upload}</div>
      </div>
    </section>
  );
}

export function ActiveWorkspaceHeader({
  domain,
  description,
  upload,
}: {
  domain: DataDomain;
  description: string;
  upload: ReactNode;
}) {
  return (
    <section className="grid gap-5 pt-4 lg:grid-cols-[1fr_420px] lg:items-start">
      <div className="py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--brand-accent)]">
          {domain === "invoice"
            ? "Invoice validation workspace"
            : "Customer master data workspace"}
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          DataPreflight
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>

      {upload}
    </section>
  );
}

function ProductFooter() {
  return (
    <footer className="border-t border-white/10 py-6">
      <div className="flex flex-col gap-3 text-xs text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-[var(--text-secondary)]">
            © 2026 DataPreflight. All rights reserved.
          </p>

          <p className="mt-1">Trusted business data before import.</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Privacy-first processing</span>
          <span className="hidden text-white/20 sm:inline">
            •
          </span>
          <span>Client-side validation</span>
          <span className="hidden text-white/20 sm:inline">
            •
          </span>
          <span>Explainable review</span>
        </div>
      </div>
    </footer>
  );
}