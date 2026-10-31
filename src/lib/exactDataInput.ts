import * as XLSX from "xlsx";
import { createUniqueHeaders, getInputAdapter, parseCsvFile, type ParsedDataSet, type ParsedRow } from "@/lib/parseCsv";
import type { DecimalSourceCell } from "@/lib/strictDecimal";

export type SourceCellRow = Record<string, DecimalSourceCell>;
export type ExactParsedDataSet = ParsedDataSet & { sourceCells: SourceCellRow[]; formattedRows?: ParsedRow[] };

// The installed XLSX package exposes SSF differently in Node CJS and browser ESM.
const numberFormats: { is_date: (format: string) => boolean } =
  Reflect.get(XLSX, "SSF") ?? Reflect.get(Reflect.get(XLSX, "default") ?? {}, "SSF");

function sourceCell(cell?: XLSX.CellObject): DecimalSourceCell {
  if (!cell) return { kind: "text", value: "" };
  const text = cell.v === undefined ? "" : String(cell.v).trim();
  if (cell.f !== undefined || cell.F !== undefined) return { kind: "formula", value: cell.f ?? "" };
  if (cell.t === "d") return { kind: "date", value: text };
  if (cell.t === "b") return { kind: "boolean", value: text };
  if (cell.t === "e") return { kind: "error", value: cell.w ?? text };
  if (cell.t === "n") {
    const format = String(cell.z ?? "General");
    if (numberFormats.is_date(format)) return { kind: "date", value: text };
    // Quoted/escaped percent signs and layout padding are literals, not percentages.
    const tokens = format.replace(/"[^"]*"|\\.|[_*].|\[[^\]]*\]/g, "");
    if (tokens.includes("%")) return { kind: "percentage", value: text };
    if (typeof cell.v === "number") return { kind: "number", value: cell.v };
    return { kind: "error", value: text };
  }
  return { kind: "text", value: text };
}

function sheetRows(sheet: XLSX.WorkSheet): Map<number, Map<number, XLSX.CellObject>> {
  const rows = new Map<number, Map<number, XLSX.CellObject>>();
  for (const [address, cell] of Object.entries(sheet)) {
    if (!/^[A-Z]+[1-9][0-9]*$/.test(address) || !cell) continue;
    const value = sourceCell(cell);
    if (value.kind === "text" && !value.value) continue;
    const position = XLSX.utils.decode_cell(address);
    const row = rows.get(position.r) ?? new Map<number, XLSX.CellObject>();
    row.set(position.c, cell);
    rows.set(position.r, row);
  }
  return rows;
}

async function readExactWorkbook(file: File): Promise<XLSX.WorkBook> {
  return XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false, cellNF: true, cellFormula: true, sheetStubs: true });
}

export async function getExactReadableExcelSheetNames(file: File): Promise<string[]> {
  const workbook = await readExactWorkbook(file);
  return workbook.SheetNames.filter((name) => sheetRows(workbook.Sheets[name]).size > 0);
}

/** Exact financial input for Invoice/Price/Stock; other profiles retain their adapters. */
export async function parseExactSourceFile(file: File, selectedSheetName?: string): Promise<ExactParsedDataSet> {
  const adapter = getInputAdapter(file);
  if (!adapter) throw new Error("Choose a CSV, XLSX, or XLS file.");
  if (adapter.sourceType === "csv") {
    const parsed = await parseCsvFile(file, { preserveCellText: true });
    return {
      ...parsed,
      sourceCells: parsed.rows.map((row) => Object.fromEntries(
        parsed.headers.map((header) => [header, { kind: "text" as const, value: row[header] }]),
      )),
    };
  }

  const workbook = await readExactWorkbook(file);
  const sheets = workbook.SheetNames.map((name) => ({ name, rows: sheetRows(workbook.Sheets[name]) }));
  const readable = sheets.filter((sheet) => sheet.rows.size > 0);
  if (!readable.length) throw new Error("Excel file has no readable sheets.");
  if (!selectedSheetName && readable.length > 1) {
    throw new Error("This Excel file has multiple sheets with data. Choose a sheet before validation.");
  }
  const selected = selectedSheetName ? readable.find((sheet) => sheet.name === selectedSheetName) : readable[0];
  if (!selected) throw new Error("The selected Excel sheet is empty or unavailable. Choose another sheet.");

  const entries = [...selected.rows.entries()].sort(([first], [second]) => first - second);
  let firstColumn = Infinity;
  let lastColumn = -1;
  for (const [, row] of entries) {
    for (const column of row.keys()) {
      firstColumn = Math.min(firstColumn, column);
      lastColumn = Math.max(lastColumn, column);
    }
  }
  const columns = Array.from({ length: lastColumn - firstColumn + 1 }, (_, index) => firstColumn + index);
  const headerRow = entries[0][1];
  const headers = createUniqueHeaders(columns.map((column, index) => {
    const cell = headerRow.get(column);
    return String(cell?.w ?? cell?.v ?? "").trim() || `Column ${index + 1}`;
  }));
  const sourceCells = entries.slice(1).map(([, row]) => Object.fromEntries(
    headers.map((header, index) => [header, sourceCell(row.get(columns[index]))]),
  ));
  const formattedRows: ParsedRow[] = entries.slice(1).map(([, row]) => Object.fromEntries(
    headers.map((header, index) => {
      const cell = row.get(columns[index]);
      const value = cell ? String(cell.w ?? XLSX.utils.format_cell(cell)) : "";
      return [header, value.replaceAll(/\u00A0/g, " ").replaceAll(/\s+/g, " ").trim()];
    }),
  ));
  const rows: ParsedRow[] = sourceCells.map((row) => Object.fromEntries(
    headers.map((header) => [header, String(row[header].value)]),
  ));
  return {
    sourceType: "excel", fileName: file.name, headers, rows, rowCount: rows.length, sourceCells, formattedRows,
    capabilities: { hasHeaders: headers.length > 0, hasRows: rows.length > 0, supportsMultipleSheets: workbook.SheetNames.length > 1, supportsCellFormatting: true, supportsTextExtraction: false },
    metadata: { sheetName: selected.name, sheetCount: workbook.SheetNames.length, availableSheets: workbook.SheetNames },
  };
}
