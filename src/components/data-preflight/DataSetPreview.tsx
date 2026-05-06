import type { InvoicePreviewItem } from "./types";

export function DataSetPreview({
  title,
  description,
  items,
  emptyMessage,
  selectedRowIndex,
  onSelectItem,
  isOpen,
  onToggle,
}: {
  title: string;
  description: string;
  items: InvoicePreviewItem[];
  emptyMessage: string;
  selectedRowIndex?: number | null;
  onSelectItem?: (rowIndex: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>

        <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-300">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      {isOpen &&
        (items.length === 0 ? (
          <p className="mt-4 rounded-lg bg-slate-950 p-4 text-sm text-slate-400">
            {emptyMessage}
          </p>
        ) : (
          <div className="mt-4 max-h-[360px] space-y-3 overflow-auto">
            {items.map((item) => {
              const isSelected = selectedRowIndex === item.rowIndex;
              const issueCount = item.issues.length;
              const cardContent = (
                <>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      {item.row.invoice_number || `Row ${item.rowIndex}`}
                    </p>

                    {issueCount > 0 && (
                      <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300">
                        {issueCount} issue{issueCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  <pre className="overflow-auto text-xs text-slate-300">
                    {JSON.stringify(item.row, null, 2)}
                  </pre>
                </>
              );

              if (!onSelectItem) {
                return (
                  <div
                    key={`${title}-${item.rowIndex}`}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                  >
                    {cardContent}
                  </div>
                );
              }

              return (
                <button
                  key={`${title}-${item.rowIndex}`}
                  type="button"
                  onClick={() => onSelectItem(item.rowIndex)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    isSelected
                      ? "border-red-400 bg-red-500/10"
                      : "border-slate-800 bg-slate-950 hover:border-red-500/40"
                  }`}
                >
                  {cardContent}
                </button>
              );
            })}
          </div>
        ))}
    </section>
  );
}