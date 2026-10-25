import Papa from "papaparse";

export const UNIT_REFERENCE_VERSION = "1.0.0";
export type UnitReference = {
  fileName: string;
  allowedUnits: string[];
};

export function normalizeUnit(value: string): string {
  return value.trim().toUpperCase();
}

export function parseUnitReferenceCsv(text: string, fileName: string): UnitReference {
  const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ""), {
    skipEmptyLines: "greedy",
  });
  // A single-column list has no delimiter to detect; Papa defaults to comma.
  if (parsed.errors.some((error) => error.code !== "UndetectableDelimiter")) {
    throw new Error("Could not read the unit CSV. Check its quotation marks and structure.");
  }
  const [headers, ...rows] = parsed.data;
  const columns = headers?.map((header) => header.trim().toLowerCase()) ?? [];
  if (columns.filter((header) => header === "unit_code").length !== 1) {
    throw new Error("The reference CSV must contain exactly one unit_code column.");
  }
  if (rows.some((row) => row.length !== headers.length)) {
    throw new Error("The reference CSV has inconsistent columns. Correct it and upload it again.");
  }
  const index = columns.indexOf("unit_code");
  const allowedUnits = [...new Set(rows.map((row) => normalizeUnit(row[index] ?? "")).filter(Boolean))].sort();
  if (allowedUnits.length === 0) {
    throw new Error("The reference CSV contains no usable unit codes. Add codes below unit_code.");
  }
  return { fileName, allowedUnits };
}

export async function readUnitReference(file: File): Promise<UnitReference> {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Choose a CSV reference file with a unit_code column.");
  }
  return parseUnitReferenceCsv(await file.text(), file.name);
}
