import Papa from "papaparse";

export type ParsedRow = Record<string, string>;

export type ParsedDataSet = {
  sourceType: "csv";
  fileName: string;
  headers: string[];
  rows: ParsedRow[];
  rowCount: number;
};

export async function parseCsvFile(file: File): Promise<ParsedDataSet> {
  return new Promise((resolve, reject) => {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: "greedy",

      transformHeader: (header) => {
        return normalizeHeader(header);
      },

      transform: (value) => {
        return normalizeCell(value);
      },

      complete: (result) => {
        const rows = sanitizeRows(result.data);

        const headers = extractHeaders(rows);

        resolve({
          sourceType: "csv",
          fileName: file.name,
          headers,
          rows,
          rowCount: rows.length,
        });
      },

      error: (error) => {
        reject(error);
      },
    });
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
