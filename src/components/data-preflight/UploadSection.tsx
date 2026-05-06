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
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <label className="block text-sm font-medium text-slate-300">
        Upload invoice CSV
      </label>

      <input
        type="file"
        accept=".csv"
        onChange={onFileChange}
        disabled={isLoading}
        className="mt-4 block w-full text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
      />

      {isLoading && (
        <p className="mt-3 text-sm text-slate-400">Processing file...</p>
      )}

      {fileName && !isLoading && (
        <p className="mt-3 text-sm text-slate-400">
          Selected file: {fileName}
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {hasActiveFile && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 text-sm text-slate-400 underline underline-offset-4 hover:text-slate-200"
        >
          Reset
        </button>
      )}
    </section>
  );
}