import { HelpPopover, WorkflowGuideButton } from "@/components/data-preflight/WorkflowHelp";
import { useRef } from "react";
import { ProfilePicker } from "@/components/data-preflight/ProfilePicker";
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
  pendingExcelSheets?: {
    fileName: string;
    names: string[];
  } | null;
  onSelectExcelSheet?: (sheetName: string) => void;
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
  pendingExcelSheets,
  onSelectExcelSheet,
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
      <section data-guide="source" className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-3 shadow-lg shadow-black/10">
        <div style={{ width: "100%", maxWidth: 460 }}>
          <ProfilePicker
            domain={domain}
            onDomainChange={onDomainChange}
            disabled={isLoading}
            hasActiveWorkflow={hasActiveFile || Boolean(pendingExcelSheets)}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Current source
            </p>

            <p className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]">
              {isLoading
                ? "Reading source file..."
                : fileName || "No file selected"}
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
    <section className="flex h-full w-full flex-col rounded-[1.5rem] border border-white/10 bg-[var(--surface-base)] p-4 shadow-xl shadow-black/20 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Start validation</h2><WorkflowGuideButton /></div>

      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
        Choose your data, then try an example or use your own file.
      </p>

      <div data-guide="profile" className="mt-5" ref={profileChoicesRef}>
        <div className="flex items-center gap-2"><h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
          Step 1 · Validation profile
        </h3><HelpPopover title="Validation profiles">Choose the type of data in your file. Each profile has its own fields and checks. No source rows are uploaded to a server for validation.</HelpPopover></div>

        <div
          style={{
            marginTop: 16,
            width: "100%",
            maxWidth: 460,
          }}
        >
          <ProfilePicker
            domain={domain}
            onDomainChange={onDomainChange}
            disabled={isLoading}
            hasActiveWorkflow={Boolean(pendingExcelSheets)}
          />
        </div>

        {profilePrompt && !domain && (
          <p
            role="status"
            className="mt-2 text-sm font-medium text-[var(--brand-accent-soft)]"
          >
            Choose a validation profile first.
          </p>
        )}
      </div>

      <div data-guide="source" className="mt-5 border-t border-white/10 pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]">
          Step 2 · Choose a file
        </h3>

        <div className="mt-4 flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={domain ? onTryExample : promptForProfile}
            disabled={isLoading}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-[var(--surface-raised)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)] disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? "Reading file..." : "Try example file"}
          </button>

          {domain ? (
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-[var(--brand-accent)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:brightness-110 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--brand-accent-soft)]">
              Upload your file
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
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-[var(--brand-accent)] px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]"
            >
              Upload your file
            </button>
          )}
        </div>

        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
          CSV, XLSX or XLS. Files are processed locally in your browser.
        </p>
      </div>

      {pendingExcelSheets && onSelectExcelSheet && (
        <section
          aria-label="Choose Excel worksheet"
          className="mt-4 rounded-xl border border-[color:rgba(209,154,106,0.45)] bg-[rgba(209,154,106,0.07)] p-3"
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Choose a worksheet
          </h3>

          <p className="mt-1 break-words text-xs leading-5 text-[var(--text-secondary)]">
            {pendingExcelSheets.fileName} contains multiple sheets. Choose the
            sheet to validate.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {pendingExcelSheets.names.map((sheetName) => (
              <button
                key={sheetName}
                type="button"
                onClick={() => onSelectExcelSheet(sheetName)}
                disabled={isLoading}
                className="min-h-11 rounded-lg border border-[color:rgba(209,154,106,0.5)] bg-[var(--surface-raised)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-accent)] disabled:cursor-wait disabled:opacity-50"
              >
                {sheetName}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onReset}
            className="mt-3 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Cancel file
          </button>
        </section>
      )}

      {isLoading && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p role="status" className="text-xs text-[var(--brand-accent-soft)]">
            Preparing {domain} review...
          </p>
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]"
          >
            Cancel file
          </button>
        </div>
      )}

      {domain === "invoice" && (
        <details className="mt-3 text-xs text-[var(--text-secondary)]">
          <summary className="cursor-pointer hover:text-[var(--text-primary)]">
            Download example CSV files
          </summary>

          <div className="mt-2 flex flex-wrap gap-2">
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
          className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-xs leading-5 text-rose-100"
        >
          {error}
        </p>
      )}
    </section>
  );
}