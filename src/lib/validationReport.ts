import { UNIT_REFERENCE_VERSION, type UnitReference } from "@/lib/unitReference";
import type { ParsedRow } from "@/lib/parseCsv";

type ValidationReportInput<TField extends string> = {
  profile: { id: string; name: string; version: string };
  fileName: string;
  sheetName?: string;
  unitReference?: UnitReference | null;
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
  sheetName,
  mapping,
  counts,
  unitReference,
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
    ...(sheetName
      ? [row("Validation", "Source worksheet", sheetName)]
      : []),
    row("Result", "Total rows", String(counts.total)),
    row("Result", "Blocked", String(counts.blocked)),
    row("Result", "Needs review", String(counts.needsReview)),
    row("Result", "Ready", String(counts.ready)),
    ...mappingRows,
    ...(profile.id === "product" ? [
      row("Unit reference", "Reference check", unitReference ? "Run" : "Not run"),
      row("Unit reference", "Reference-check version", UNIT_REFERENCE_VERSION),
      ...(unitReference ? [
        row("Unit reference", "Reference filename", unitReference.fileName),
        row("Unit reference", "Unique unit count", String(unitReference.allowedUnits.length)),
        ...unitReference.allowedUnits.map((unit) => row("Unit reference", "Allowed unit", unit)),
      ] : []),
    ] : []),
  ];
}