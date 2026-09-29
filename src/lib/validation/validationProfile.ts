import type { DataProfile } from "@/lib/dataProfile";
import type { ParsedRow } from "@/lib/parseCsv";

export type ValidationProfile<
  TField extends string,
  TNormalizedRow extends ParsedRow,
  TResult,
> = DataProfile<TField> & {
  version: string;
  normalizeRows: (rows: ParsedRow[]) => TNormalizedRow[];
  validateRows: (rows: TNormalizedRow[]) => TResult;
};

export function mapRowsToProfile<TField extends string>(
  rows: ParsedRow[],
  mapping: Record<TField, string>,
  profile: DataProfile<TField>,
): ParsedRow[] {
  return rows.map((row) =>
    Object.fromEntries(
      profile.fields.map(({ key }) => {
        const sourceField = mapping[key];
        return [key, sourceField ? (row[sourceField] ?? "") : ""];
      }),
    ),
  );
}

export function runValidationProfile<
  TField extends string,
  TNormalizedRow extends ParsedRow,
  TResult,
>(
  profile: ValidationProfile<TField, TNormalizedRow, TResult>,
  mappedRows: ParsedRow[],
): { normalizedRows: TNormalizedRow[]; validationResult: TResult } {
  const normalizedRows = profile.normalizeRows(mappedRows);
  const validationResult = profile.validateRows(normalizedRows);

  return { normalizedRows, validationResult };
}