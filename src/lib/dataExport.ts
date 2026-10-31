import * as XLSX from "xlsx";
import type { ParsedRow } from "@/lib/parseCsv";

export type ExportFormat = "csv" | "xlsx" | "txt" | "tsv" | "json";
export type CsvDelimiter = ";" | ",";
export type DataExportOptions = { format: ExportFormat; csvDelimiter?: CsvDelimiter };
export type ExportDataSet = { headers: string[]; rows: string[][] };
export type ExportFile = { extension: ExportFormat; mimeType: string; content: string | ArrayBuffer };

export const DATA_EXPORT_FORMATS = [
  { value: "csv", label: "CSV (.csv)" },
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "txt", label: "Tab-separated text (.txt)" },
  { value: "tsv", label: "TSV (.tsv)" },
  { value: "json", label: "JSON (.json)" },
] as const;

/** One stable, text-preserving dataset for every writer; caller supplies validated exportable rows. */
export function createExportDataSet(rows: readonly ParsedRow[]): ExportDataSet {
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))].filter((key) => key !== "normalized_invoice_key");
  return { headers, rows: rows.map((row) => headers.map((header) => row[header] ?? "")) };
}

function spreadsheetFormula(value: string): boolean {
  // Plain negative decimal values remain legitimate data, not expressions.
  if (/^-?[0-9]+(?:\.[0-9]+)?$/.test(value)) return false;
  return /^[\t\r\n]/.test(value) || /^[\s\u0000-\u001f]*[=+\-@＝＋－＠]/u.test(value);
}

export function hasSpreadsheetFormulaText(data: ExportDataSet): boolean {
  return data.headers.some(spreadsheetFormula) || data.rows.some((row) => row.some(spreadsheetFormula));
}

function delimitedText(data: ExportDataSet, delimiter: string): string {
  if (hasSpreadsheetFormulaText(data)) {
    throw new Error("Some text could be treated as a spreadsheet formula. Choose Excel or JSON to preserve the values without changing them.");
  }
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return "\uFEFF" + [data.headers, ...data.rows].map((row) => row.map(escape).join(delimiter)).join("\n");
}

export function serializeDataExport(data: ExportDataSet, options: DataExportOptions): ExportFile | null {
  if (!data.rows.length || !data.headers.length) return null;
  if (options.format === "csv") {
    const delimiter = options.csvDelimiter ?? ";";
    if (delimiter !== ";" && delimiter !== ",") throw new Error("Choose comma or semicolon for CSV export.");
    return { extension: "csv", mimeType: "text/csv;charset=utf-8", content: delimitedText(data, delimiter) };
  }
  if (options.format === "txt" || options.format === "tsv") {
    return { extension: options.format, mimeType: options.format === "tsv" ? "text/tab-separated-values;charset=utf-8" : "text/plain;charset=utf-8", content: delimitedText(data, "\t") };
  }
  if (options.format === "json") {
    const rows = data.rows.map((row) => Object.fromEntries(data.headers.map((header, index) => [header, row[index]])));
    return { extension: "json", mimeType: "application/json;charset=utf-8", content: JSON.stringify(rows, null, 2) };
  }
  if (options.format === "xlsx") {
    if (data.rows.length > 1_048_575 || data.headers.length > 16_384) throw new Error("This dataset exceeds Excel's sheet limits. Choose CSV, tab-separated text or JSON.");
    if ([data.headers, ...data.rows].some((row) => row.some((value) => value.length > 32_767))) throw new Error("A value exceeds Excel's cell text limit. Choose CSV, tab-separated text or JSON.");
    const sheet = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
    for (const [address, cell] of Object.entries(sheet)) {
      if (!address.startsWith("!")) {
        // Every value is text, including numeric-looking IDs, dates and exact decimals.
        cell.t = "s";
        cell.z = "@";
        delete cell.f;
      }
    }
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Data");
    return { extension: "xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", content: XLSX.write(book, { type: "array", bookType: "xlsx" }) as ArrayBuffer };
  }
  throw new Error("Choose a supported export format.");
}
