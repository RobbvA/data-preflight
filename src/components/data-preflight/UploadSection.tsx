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
    label: "Clean demo",
    href: "/demo-data/clean-invoices.csv",
  },
  {
    label: "Messy demo",
    href: "/demo-data/messy-export.csv",
  },
  {
    label: "High-risk demo",
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
      <section className="rounded-2xl border border-stone-700/45 bg-stone-950/70 p-3 shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
              Current source
            </p>

            <p className="mt-1 truncate text-sm font-medium text-[#f1ece4]">
              {isLoading
                ? "Reading source file..."
                : fileName || "No file selected"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-stone-600/70 bg-stone-900/70 px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:border-orange-300/35 hover:bg-stone-800 hover:text-[#f1ece4]">
              Replace
              <input
                type="file"
                accept={ACCEPTED_SOURCE_TYPES}
                onChange={onFileChange}
                disabled={isLoading}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-stone-700/70 bg-black/30 px-3 py-1.5 text-xs font-medium text-stone-400 transition hover:border-stone-500 hover:bg-stone-800 hover:text-stone-100"
            >
              Reset
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-xs leading-5 text-rose-100">
            {error}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-stone-700/45 bg-stone-950/70 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-200/70">
          Start here
        </p>

        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#f1ece4]">
          Upload invoice export
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-400">
          Upload a CSV or Excel export to detect broken rows, risky invoice
          data, mapping problems, and unsafe imports before they reach your
          system.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-orange-300/24 bg-orange-300/[0.045] p-5">
        <input
          type="file"
          accept={ACCEPTED_SOURCE_TYPES}
          onChange={onFileChange}
          disabled={isLoading}
          className="block w-full cursor-pointer text-sm text-stone-300 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-[#d19a6a] file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-[#0a0907] file:transition hover:file:bg-[#f1c49b] disabled:cursor-not-allowed disabled:opacity-50"
        />

        {isLoading && (
          <p className="mt-3 text-sm font-medium text-orange-100/90">
            Reading source file and preparing invoice review...
          </p>
        )}

        {!fileName && !isLoading && (
          <p className="mt-3 text-xs leading-5 text-stone-500">
            CSV, XLSX, and XLS files are supported. PDF and image imports are
            planned for later.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">
          Test safely
        </p>

        <p className="mt-1.5 text-sm leading-6 text-stone-400">
          Want to try DataPreflight without using real company data? Download a
          demo file first and upload it above.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_FILES.map((file) => (
            <a
              key={file.href}
              href={file.href}
              download
              className="rounded-full border border-orange-300/20 bg-orange-300/[0.06] px-3 py-1.5 text-xs font-medium text-orange-100 transition hover:border-orange-300/40 hover:bg-orange-300/[0.1]"
            >
              {file.label}
            </a>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-xs leading-5 text-rose-100">
          {error}
        </div>
      )}
    </section>
  );
}
