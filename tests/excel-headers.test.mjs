import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";
import { parseExcelFile } from "../src/lib/parseCsv.ts";

async function parseHeaders(headers) {
  const values = headers.map((_, index) => `value-${index + 1}`);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([headers, values]), "Data");
  const file = new File([XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })], "headers.xlsx");
  return { parsed: await parseExcelFile(file), values };
}

for (const [name, headers, expected] of [
  ["generated suffix cannot overwrite a source column", ["ID", "ID", "ID 2"], ["ID", "ID 3", "ID 2"]],
  ["repeated headers skip reserved and already generated suffixes", ["ID", "ID", "ID 2", "ID", "ID 3", "ID 2"], ["ID", "ID 4", "ID 2", "ID 5", "ID 3", "ID 2 2"]],
  ["normalization collisions preserve every cell", [" Café ", "Cafe", "Cafe 2", "Customer   ID", "Customer ID"], ["Cafe", "Cafe 3", "Cafe 2", "Customer ID", "Customer ID 2"]],
  ["empty-header fallback cannot overwrite a named column", ["", "Column 1", "Column 1 2"], ["Column 1", "Column 1 3", "Column 1 2"]],
  ["unique source headers remain unchanged", ["ID", "ID 2", "Customer Name"], ["ID", "ID 2", "Customer Name"]],
]) {
  test(`Excel headers: ${name}`, async () => {
    const { parsed, values } = await parseHeaders(headers);
    assert.deepEqual(parsed.headers, expected);
    assert.equal(new Set(parsed.headers).size, headers.length);
    assert.equal(parsed.rowCount, 1);
    assert.deepEqual(expected.map((header) => parsed.rows[0][header]), values);
  });
}
