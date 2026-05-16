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
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-xl shadow-slate-950/20 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300/65">
            Source file
          </p>

          <p className="mt-1 text-sm font-medium text-white">
            Upload invoice CSV
          </p>
        </div>

        {hasActiveFile && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.07] bg-slate-950/35 p-3">
        <input
          type="file"
          accept=".csv"
          onChange={onFileChange}
          disabled={isLoading}
          className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-blue-500/12 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-100 hover:file:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {isLoading && (
          <p className="mt-2 text-xs text-slate-400">Processing file...</p>
        )}

        {fileName && !isLoading && (
          <p className="mt-2 truncate text-xs text-slate-400">
            Selected:{" "}
            <span className="font-medium text-slate-200">{fileName}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-500/25 bg-red-500/[0.08] p-3 text-xs text-red-300">
          {error}
        </div>
      )}
    </section>
  );
}
