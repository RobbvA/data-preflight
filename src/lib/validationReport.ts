import type { ParsedRow } from "@/lib/parseCsv";

type ValidationReportInput<TField extends string> = {
  profile: { id: string; name: string; version: string };
  fileName: string;
  mapping: Readonly<Record<TField, string>>;
  counts: {
    total: number;
    blocked: number;
    needsReview: number;
    ready: number;
  };
};

export function buildValidationReportRows<TField extends string>({
  profile,
  fileName,
  mapping,
  counts,
}: ValidationReportInput<TField>): ParsedRow[] {
  const row = (section: string, field: string, value: string): ParsedRow => ({
    Section: section,
    "DataPreflight field / metric": field,
    "Source column / value": value,
  });

  const mappingRows = (Object.entries(mapping) as Array<[string, string]>)
    .sort(([first], [second]) =>
      first < second ? -1 : first > second ? 1 : 0,
    )
    .map(([field, sourceColumn]) =>
      row("Field mapping", field, sourceColumn || "Not mapped"),
    );

  return [
    row("Validation", "Validation profile", profile.name),
    row("Validation", "Profile ID", profile.id),
    row("Validation", "Profile version", profile.version),
    row("Validation", "Source filename", fileName),
    row("Result", "Total rows", String(counts.total)),
    row("Result", "Blocked", String(counts.blocked)),
    row("Result", "Needs review", String(counts.needsReview)),
    row("Result", "Ready", String(counts.ready)),
    ...mappingRows,
  ];
}