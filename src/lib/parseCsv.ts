import Papa from "papaparse";
import * as XLSX from "xlsx";

export type SourceType = "csv" | "excel";

export type ParsedRow = Record<string, string>;

export type SourceCapability = {
  hasHeaders: boolean;
  hasRows: boolean;
  supportsMultipleSheets: boolean;
  supportsCellFormatting: boolean;
  supportsTextExtraction: boolean;
};

export type SourceMetadata = {
  sheetName?: string;
  sheetCount?: number;
  availableSheets?: string[];
};

export type ParsedDataSet = {
  sourceType: SourceType;
  fileName: string;
  headers: string[];
  rows: ParsedRow[];
  rowCount: number;
  capabilities: SourceCapability;
  metadata?: SourceMetadata;
};

export type InputAdapter = {
  sourceType: SourceType;
  canParse: (file: File) => boolean;
  parse: (file: File) => Promise<ParsedDataSet>;
};

export const csvAdapter: InputAdapter = {
  sourceType: "csv",

  canParse(file) {
    return file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
  },

  parse(file) {
    return parseCsvFile(file);
  },
};

export const excelAdapter: InputAdapter = {
  sourceType: "excel",

  canParse(file) {
    const fileName = file.name.toLowerCase();

    return (
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
    );
  },

  parse(file) {
    return parseExcelFile(file);
  },
};

export function getInputAdapter(file: File): InputAdapter | null {
  const adapters: InputAdapter[] = [csvAdapter, excelAdapter];

  return adapters.find((adapter) => adapter.canParse(file)) ?? null;
}

export async function parseCsvFile(file: File): Promise<ParsedDataSet> {
  return new Promise((resolve, reject) => {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: "greedy",

      transformHeader: (header) => normalizeHeader(header),
      transform: (value) => normalizeCell(value),

      complete: (result) => {
        const rows = sanitizeRows(result.data);
        const headers = extractHeaders(rows);

        resolve({
          sourceType: "csv",
          fileName: file.name,
          headers,
          rows,
          rowCount: rows.length,
          capabilities: {
            hasHeaders: headers.length > 0,
            hasRows: rows.length > 0,
            supportsMultipleSheets: false,
            supportsCellFormatting: false,
            supportsTextExtraction: false,
          },
        });
      },

      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function parseExcelFile(file: File): Promise<ParsedDataSet> {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: false,
  });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("Excel file has no sheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];

  const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  const rows = createRowsFromSheet(sheetRows);
  const headers = extractHeaders(rows);

  return {
    sourceType: "excel",
    fileName: file.name,
    headers,
    rows,
    rowCount: rows.length,
    capabilities: {
      hasHeaders: headers.length > 0,
      hasRows: rows.length > 0,
      supportsMultipleSheets: workbook.SheetNames.length > 1,
      supportsCellFormatting: false,
      supportsTextExtraction: false,
    },
    metadata: {
      sheetName: firstSheetName,
      sheetCount: workbook.SheetNames.length,
      availableSheets: workbook.SheetNames,
    },
  };
}

function createRowsFromSheet(sheetRows: unknown[][]): ParsedRow[] {
  if (sheetRows.length === 0) return [];

  const headerRow = sheetRows[0] ?? [];

  const headers = createUniqueHeaders(
    headerRow.map((header, index) => {
      const normalizedHeader = normalizeCellValue(header);
      return normalizedHeader || `Column ${index + 1}`;
    }),
  );

  const dataRows = sheetRows.slice(1);

  return sanitizeRows(
    dataRows.map((sheetRow) => {
      return headers.reduce<ParsedRow>((row, header, index) => {
        row[header] = normalizeCellValue(sheetRow[index]);
        return row;
      }, {});
    }),
  );
}

function createUniqueHeaders(headers: string[]) {
  const seenHeaders = new Map<string, number>();

  return headers.map((header) => {
    const normalizedHeader = normalizeHeader(header);
    const count = seenHeaders.get(normalizedHeader) ?? 0;

    seenHeaders.set(normalizedHeader, count + 1);

    if (count === 0) return normalizedHeader;

    return `${normalizedHeader} ${count + 1}`;
  });
}

function sanitizeRows(rows: ParsedRow[]) {
  return rows.filter((row) => {
    return Object.values(row).some((value) => value.trim().length > 0);
  });
}

function extractHeaders(rows: ParsedRow[]) {
  return Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
}

function normalizeHeader(header: string) {
  return header
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function normalizeCell(value: string) {
  return value
    .replaceAll(/\u00A0/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function normalizeCellValue(value: unknown) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll(/\u00A0/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}
