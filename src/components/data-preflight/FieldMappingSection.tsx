type FieldMapping = {
  invoice_number: string;
  company: string;
  email: string;
  amount: string;
  vat: string;
  status: string;
};

type FieldMappingSectionProps = {
  headers: string[];
  expectedInvoiceFields: Array<keyof FieldMapping>;
  fieldMapping: FieldMapping;
  onUpdateFieldMapping: (
    targetField: keyof FieldMapping,
    sourceField: string,
  ) => void;
};

export function FieldMappingSection({
  headers,
  expectedInvoiceFields,
  fieldMapping,
  onUpdateFieldMapping,
}: FieldMappingSectionProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Field mapping</h2>

      <p className="mt-1 text-sm text-slate-400">
        Map the uploaded CSV headers to the invoice fields DataPreflight
        validates.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {expectedInvoiceFields.map((targetField) => {
          const selectedHeader = fieldMapping[targetField];

          const isMissing = !selectedHeader;

          const isDuplicate =
            selectedHeader !== "" &&
            Object.values(fieldMapping).filter(
              (mappedHeader) => mappedHeader === selectedHeader,
            ).length > 1;

          return (
            <label key={targetField} className="block">
              <span className="text-sm font-medium text-slate-300">
                {targetField}
              </span>

              <select
                value={selectedHeader}
                onChange={(event) =>
                  onUpdateFieldMapping(
                    targetField,
                    event.target.value,
                  )
                }
                className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-100 ${
                  isMissing
                    ? "border-yellow-500/40 bg-yellow-500/10"
                    : isDuplicate
                      ? "border-red-500/40 bg-red-500/10"
                      : "border-slate-800 bg-slate-950"
                }`}
              >
                <option value="">Not mapped</option>

                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>

              {isMissing && (
                <p className="mt-1 text-xs text-yellow-200">
                  Required mapping missing
                </p>
              )}

              {isDuplicate && (
                <p className="mt-1 text-xs text-red-300">
                  This CSV column is mapped more than once
                </p>
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}