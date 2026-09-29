type UploadSectionProps = {
  fileName: string;
  isLoading: boolean;
  error: string | null;
  hasActiveFile: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTryDemo: () => void;
  onReset: () => void;
};

const ACCEPTED_SOURCE_TYPES =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const DEMO_FILES = [
  {
    label: "Clean",
    href: "/demo-data/clean-invoices.csv",
  },
  {
    label: "Messy",
    href: "/demo-data/messy-export.csv",
  },
  {
    label: "High-risk",
    href: "/demo-data/high-risk-invoices.csv",
  },
];

export function UploadSection({
  fileName,
  isLoading,
  error,
  hasActiveFile,
  onFileChange,
  onTryDemo,
  onReset,
}: UploadSectionProps) {
  if (hasActiveFile) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[var(--surface-base)] p-3 shadow-lg shadow-black/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
    <section className="flex h-full w-full flex-col rounded-[1.5rem] border border-white/10 bg-[var(--surface-base)] p-5 shadow-xl shadow-black/20 sm:p-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]">
        Start here
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
        Try DataPreflight
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Run the same validation used for your own file.
      </p>

      <button
        type="button"
        onClick={onTryDemo}
        disabled={isLoading}
        className="mt-5 w-full rounded-xl bg-[var(--brand-accent-soft)] px-5 py-3 text-left text-sm font-semibold text-[var(--surface-deep)] transition hover:bg-[#f1c49b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)] disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? "Validating..." : "Validate example file →"}
      </button>

      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
        Uses an example invoice export. No file needed.
      </p>

      <div className="mt-6 border-t border-white/10 pt-5">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          Use your own file
        </h3>

        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
          CSV, XLSX, or XLS invoice exports are supported today.
        </p>

        <div className="mt-3 rounded-xl border border-dashed border-[color:rgba(209,154,106,0.35)] bg-[rgba(209,154,106,0.05)] p-4">
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

          <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
            Your file is processed in your browser and is not sent to our
            servers.
          </p>
        </div>
      </div>

      {isLoading && (
        <p role="status" className="mt-4 text-xs text-[var(--brand-accent-soft)]">
          Preparing invoice review...
        </p>
      )}

      <details className="mt-auto pt-5 text-xs text-[var(--text-secondary)]">
        <summary className="cursor-pointer hover:text-[var(--text-primary)]">
          Download example CSV files
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_FILES.map((file) => (
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