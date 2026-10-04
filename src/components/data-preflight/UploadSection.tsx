import { useRef } from "react";
import type { DataDomain } from "@/components/data-preflight/WorkspaceLayout";

type UploadSectionProps = {
  domain: DataDomain | null;
  onDomainChange: (domain: DataDomain) => void;
  profilePrompt?: boolean;
  onProfileRequired?: () => void;
  fileName: string;
  isLoading: boolean;
  error: string | null;
  hasActiveFile: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTryExample: () => void;
  onReset: () => void;
};

const ACCEPTED_SOURCE_TYPES =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const EXAMPLE_FILES = [
  { label: "Clean", href: "/demo-data/clean-invoices.csv" },
  { label: "Messy", href: "/demo-data/messy-export.csv" },
  { label: "High-risk", href: "/demo-data/high-risk-invoices.csv" },
];

export function UploadSection({
  domain,
  onDomainChange,
  profilePrompt = false,
  onProfileRequired,
  fileName,
  isLoading,
  error,
  hasActiveFile,
  onFileChange,
  onTryExample,
  onReset,
}: UploadSectionProps) {
  const profileChoicesRef = useRef<HTMLDivElement | null>(null);

  function promptForProfile() {
    onProfileRequired?.();
    profileChoicesRef.current?.querySelector("button")?.focus();
  }

  if (hasActiveFile) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-3 shadow-lg shadow-black/10">
        <ProfileSelector
          domain={domain}
          onDomainChange={onDomainChange}
          disabled={isLoading}
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Current source
            </p>
            <p className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]">
              {isLoading ? "Reading source file..." : fileName || "No file selected"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-white/10 bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--brand-accent)] hover:text-[var(--text-primary)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--brand-accent-soft)]">
              Replace
              <input
                type="file"
                accept={ACCEPTED_SOURCE_TYPES}
                onChange={onFileChange}
                disabled={isLoading}
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-white/10 bg-[var(--surface-deep)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              Reset
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-xs leading-5 text-rose-100"
          >
            {error}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="flex h-full w-full flex-col rounded-[1.5rem] border border-white/10 bg-[var(--surface-base)] p-5 shadow-xl shadow-black/20 sm:p-7">
      <h2
        className="text-3xl font-semibold tracking-tight sm:text-4xl"
        style={{ color: "var(--brand-accent)" }}
      >
        Try DataPreflight
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Choose the type of data you want to validate before ERP import.
      </p>

      <div className="mt-5" ref={profileChoicesRef}>
        <h3
          className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-accent-soft)]"
          style={{ marginBottom: 20 }}
        >
          Choose a validation profile
        </h3>

        <ProfileSelector
          domain={domain}
          onDomainChange={onDomainChange}
          disabled={isLoading}
        />

        {profilePrompt && !domain && (
          <p
            role="status"
            className="mt-3 text-sm font-medium text-[var(--brand-accent-soft)]"
          >
            Choose Invoice data or Customer master data first.
          </p>
        )}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={domain ? onTryExample : promptForProfile}
          disabled={isLoading}
          className="inline-flex max-w-full cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-semibold text-[var(--text-primary)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)] disabled:cursor-wait disabled:opacity-60"
          style={{
            width: "max-content",
            maxWidth: "100%",
            backgroundColor: "var(--brand-accent)",
          }}
        >
          {isLoading
            ? "Validating..."
            : `Validate example ${domain ? `${domain} ` : ""}file →`}
        </button>
      </div>

      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
        The example is processed using the same rules as your own{" "}
        {domain ? `${domain} ` : ""}file.
      </p>

      <div className="mt-6 border-t border-white/10 pt-5">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          Use your own {domain ? `${domain} ` : ""}file
        </h3>

        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
          CSV, XLSX, or XLS {domain ? `${domain} ` : ""}exports are supported.
        </p>

        <div className="mt-3">
          <div
            className="inline-flex max-w-full rounded-xl border border-dashed border-[color:rgba(209,154,106,0.35)] bg-[rgba(209,154,106,0.05)] p-3"
            style={{ width: "max-content", maxWidth: "100%" }}
          >
            {domain ? (
              <label className="inline-flex cursor-pointer rounded-lg border border-white/15 bg-[var(--surface-raised)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-accent)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--brand-accent-soft)]">
                Choose file
                <input
                  type="file"
                  accept={ACCEPTED_SOURCE_TYPES}
                  onChange={onFileChange}
                  disabled={isLoading}
                  className="sr-only"
                />
              </label>
            ) : (
              <button
                type="button"
                onClick={promptForProfile}
                className="inline-flex cursor-pointer rounded-lg border border-white/15 bg-[var(--surface-raised)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]"
              >
                Choose file
              </button>
            )}
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
          Your file is processed in your browser and is not sent to our servers.
        </p>
      </div>

      {isLoading && (
        <p
          role="status"
          className="mt-4 text-xs text-[var(--brand-accent-soft)]"
        >
          Preparing {domain} review...
        </p>
      )}

      {domain === "invoice" && (
        <details className="mt-auto pt-5 text-xs text-[var(--text-secondary)]">
          <summary className="cursor-pointer hover:text-[var(--text-primary)]">
            Download example CSV files
          </summary>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_FILES.map((file) => (
              <a
                key={file.href}
                href={file.href}
                download
                className="rounded-lg border border-white/10 bg-[var(--surface-raised)] px-3 py-1.5 font-medium text-[var(--text-primary)] transition hover:border-[color:rgba(209,154,106,0.45)]"
              >
                {file.label}
              </a>
            ))}
          </div>
        </details>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-xs leading-5 text-rose-100"
        >
          {error}
        </p>
      )}
    </section>
  );
}

function ProfileSelector({
  domain,
  onDomainChange,
  disabled,
}: {
  domain: DataDomain | null;
  onDomainChange: (domain: DataDomain) => void;
  disabled: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Validation profile"
      className="flex flex-wrap gap-2"
    >
      {(["invoice", "customer"] as const).map((choice) => (
        <button
          key={choice}
          type="button"
          aria-pressed={domain === choice}
          disabled={disabled}
          onClick={() => onDomainChange(choice)}
          className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            domain === choice
              ? "border-[color:rgba(209,154,106,0.45)] bg-[rgba(209,154,106,0.07)] text-[var(--text-primary)]"
              : "border-white/10 bg-[var(--surface-deep)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          {choice === "customer" ? "Customer master data" : "Invoice data"}
        </button>
      ))}
    </div>
  );
}