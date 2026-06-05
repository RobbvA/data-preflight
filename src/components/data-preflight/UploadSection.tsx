type UploadSectionProps = {
  fileName: string;
  isLoading: boolean;
  error: string | null;
  hasActiveFile: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
};

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
      <section className="rounded-2xl border border-slate-700/45 bg-slate-900/70 p-3 shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Current source
            </p>

            <p className="mt-1 truncate text-sm font-medium text-slate-100">
              {isLoading
                ? "Processing source..."
                : fileName || "No file selected"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-slate-600/70 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-slate-700 hover:text-white">
              Replace
              <input
                type="file"
                accept=".csv"
                onChange={onFileChange}
                disabled={isLoading}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-slate-700/70 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100"
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
    <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-slate-700/45 bg-slate-900/70 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
          Start here
        </p>

        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
          Upload invoice export
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Upload a business export to detect broken rows, risky invoice data,
          mapping problems, and unsafe imports before they reach your system.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-300/[0.055] p-5">
        <input
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onFileChange}
          disabled={isLoading}
          className="block w-full cursor-pointer text-sm text-slate-300 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-cyan-100 file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-slate-950 file:transition hover:file:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        />

        {isLoading && (
          <p className="mt-3 text-sm font-medium text-cyan-100/90">
            Processing source...
          </p>
        )}

        {!fileName && !isLoading && (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            CSV supported now. Excel, PDF, and images are planned for later.
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3 text-xs leading-5 text-rose-100">
          {error}
        </div>
      )}
    </section>
  );
}
