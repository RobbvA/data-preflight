import type { InvoicePreviewItem } from "./types";

type DataSetPreviewProps = {
  title: string;
  description: string;
  items: InvoicePreviewItem[];
  emptyMessage: string;
  selectedRowIndex?: number | null;
  onSelectItem?: (rowIndex: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  tone?: "neutral" | "danger";
  compact?: boolean;
};

const invoiceFields = [
  "invoice_number",
  "company",
  "email",
  "amount",
  "vat",
  "status",
];

export function DataSetPreview({
  title,
  description,
  items,
  emptyMessage,
  selectedRowIndex,
  onSelectItem,
  isOpen,
  onToggle,
  tone = "neutral",
  compact = false,
}: DataSetPreviewProps) {
  const isDanger = tone === "danger";

  return (
    <section
      className={`rounded-2xl border p-5 shadow-2xl backdrop-blur ${
        isDanger
          ? "border-red-400/20 bg-red-500/[0.045] shadow-red-950/20"
          : "border-white/10 bg-white/[0.035] shadow-blue-950/10"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{title}</h2>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                isDanger
                  ? "border-red-400/30 bg-red-400/10 text-red-100"
                  : "border-white/10 bg-white/[0.04] text-slate-300"
              }`}
            >
              {items.length} row{items.length === 1 ? "" : "s"}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>

        <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white">
          {isOpen ? "Collapse" : "Expand"}
        </span>
      </button>

      {isOpen &&
        (items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
            {emptyMessage}
          </p>
        ) : (
          <div
            className={`mt-4 overflow-auto rounded-xl border border-white/10 bg-slate-950/50 ${
              compact ? "max-h-[260px]" : "max-h-[520px]"
            }`}
          >
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur">
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3 font-medium">Row</th>

                  {invoiceFields.map((field) => (
                    <th key={field} className="px-4 py-3 font-medium">
                      {field}
                    </th>
                  ))}

                  <th className="px-4 py-3 font-medium">Issues</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const isSelected = selectedRowIndex === item.rowIndex;
                  const issueFields = new Set(
                    item.issues.map((issue) => issue.field),
                  );

                  const rowClass = isSelected
                    ? "bg-red-500/12"
                    : isDanger
                      ? "hover:bg-red-500/[0.045]"
                      : "hover:bg-white/[0.035]";

                  return (
                    <tr
                      key={`${title}-${item.rowIndex}`}
                      onClick={
                        onSelectItem
                          ? () => onSelectItem(item.rowIndex)
                          : undefined
                      }
                      className={`border-b border-white/10 transition last:border-b-0 ${
                        onSelectItem ? "cursor-pointer" : ""
                      } ${rowClass}`}
                    >
                      <td className="px-4 py-3 text-xs font-medium text-slate-500">
                        {item.rowIndex}
                      </td>

                      {invoiceFields.map((field) => {
                        const hasIssue = issueFields.has(field);
                        const value = item.row[field] || "—";

                        return (
                          <td key={field} className="px-4 py-3">
                            <span
                              title={value}
                              className={`block max-w-[180px] truncate rounded-md px-2 py-1 ${
                                hasIssue && isDanger
                                  ? "border border-red-400/25 bg-red-500/10 text-red-50"
                                  : "text-slate-300"
                              }`}
                            >
                              {value}
                            </span>
                          </td>
                        );
                      })}

                      <td className="px-4 py-3">
                        {item.issues.length > 0 ? (
                          <span className="rounded-full border border-red-400/30 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-100">
                            {item.issues.length} issue
                            {item.issues.length === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
                            clean
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
    </section>
  );
}