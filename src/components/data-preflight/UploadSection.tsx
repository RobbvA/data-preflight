type UploadSectionProps = {
  fileName: string;
  isLoading: boolean;
  error: string | null;
  hasActiveFile: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    <section className="w-full rounded-[1.5rem] border border-white/10 bg-[var(--surface-base)] p-5 shadow-xl shadow-black/20 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent)]">
        Try DataPreflight
      </p>

      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
        Upload CSV or Excel
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Start with an invoice export. See which records are blocked, need
        review, or are ready.
      </p>

      <div className="mt-5 rounded-2xl border border-dashed border-[color:rgba(209,154,106,0.35)] bg-[rgba(209,154,106,0.05)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-xl bg-[var(--brand-accent-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--surface-deep)] transition hover:bg-[#f1c49b] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--brand-accent-soft)]">
            Choose file
            <input
              type="file"
              accept={ACCEPTED_SOURCE_TYPES}
              onChange={onFileChange}
              disabled={isLoading}
              className="sr-only"
            />
          </label>

          <span className="text-xs text-[var(--text-secondary)]">
            CSV, XLSX or XLS
          </span>
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
          Your file is processed in your browser and is not sent to our
          servers.
        </p>

        {isLoading && (
          <p
            role="status"
            className="mt-3 text-xs font-medium text-[var(--brand-accent-soft)]"
          >
            Reading file and preparing invoice review...
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          No file handy? Try a demo export:
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_FILES.map((file) => (
            <a
              key={file.href}
              href={file.href}
              download
              className="rounded-lg border border-white/10 bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:border-[color:rgba(209,154,106,0.45)]"
            >
              {file.label}
            </a>
          ))}
        </div>
      </div>

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