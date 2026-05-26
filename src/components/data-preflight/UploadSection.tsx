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
      <section className="rounded-2xl border border-slate-700/45 bg-slate-950/35 p-3 shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-600">
              Source file
            </p>

            <p className="mt-1 truncate text-sm font-medium text-slate-200">
              {isLoading
                ? "Processing file..."
                : fileName || "No file selected"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100">
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
              className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100"
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
    <section className="rounded-[1.75rem] border border-slate-700/45 bg-slate-900/55 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Source file
          </p>

          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-50">
            Upload invoice CSV
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            Start by uploading a CSV export. DataPreflight will map, normalize,
            validate, and prepare clean output.
          </p>
        </div>

        {hasActiveFile && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 rounded-full border border-slate-700/70 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:bg-slate-800/60 hover:text-slate-100"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-cyan-300/22 bg-cyan-300/[0.035] p-4">
        <input
          type="file"
          accept=".csv"
          onChange={onFileChange}
          disabled={isLoading}
          className="block w-full cursor-pointer text-xs text-slate-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cyan-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-950 file:transition hover:file:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        />

        {isLoading && (
          <p className="mt-3 text-xs font-medium text-cyan-100/85">
            Processing file...
          </p>
        )}

        {fileName && !isLoading && (
          <p className="mt-3 truncate text-xs text-slate-400">
            Selected:{" "}
            <span className="font-medium text-slate-100">{fileName}</span>
          </p>
        )}

        {!fileName && !isLoading && (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            CSV only. Processing runs client-side in this MVP.
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
