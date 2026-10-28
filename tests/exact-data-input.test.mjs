import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { parseExactSourceFile, getExactReadableExcelSheetNames } from "../src/lib/exactDataInput.ts";
import { parseExcelFile, parseCsvFile } from "../src/lib/parseCsv.ts";
import { decodeDecimalCell } from "../src/lib/strictDecimal.ts";

function fileFor(sheet, bookType = "xlsx", extraSheets = []) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Data");
  for (const [name, extra] of extraSheets) XLSX.utils.book_append_sheet(book, extra, name);
  return new File([XLSX.write(book, { type: "buffer", bookType })], `exact.${bookType}`);
}

function sheetFor(cells) {
  const sheet = XLSX.utils.aoa_to_sheet([["Product ID", "Price"], ...cells.map((_, index) => [`00${index + 1}`, ""]) ]);
  cells.forEach((cell, index) => { sheet[`B${index + 2}`] = cell; });
  return sheet;
}

for (const type of ["xlsx", "xls"]) {
  test(`exact ${type}: numeric formatting never rounds the stored value; text scale and leading zeros survive`, async () => {
    const cells = [
      { t: "n", v: 12.3456, z: "0.00" }, { t: "n", v: 1234.567, z: "#,##0.00" },
      { t: "n", v: 12.3456, z: '"€"0.00' }, { t: "n", v: 0.00000123, z: "0.00E+00" },
      { t: "s", v: "12,5000" }, { t: "s", v: "900719925474099312345.00000001" },
      { t: "s", v: "1e3" }, { t: "s", v: "1  2" }, { t: "n", v: Number.MAX_SAFE_INTEGER + 1 },
    ];
    const file = fileFor(sheetFor(cells), type);
    const bytes = Buffer.from(await file.arrayBuffer());
    const parsed = await parseExactSourceFile(file);
    assert.equal(parsed.rows[0]["Product ID"], "001");
    assert.deepEqual(parsed.sourceCells.slice(0, 4).map(row => decodeDecimalCell(row.Price, "comma").value), ["12.3456", "1234.567", "12.3456", "0.00000123"]);
    assert.equal(decodeDecimalCell(parsed.sourceCells[4].Price, "comma").value, "12.5000");
    assert.equal(decodeDecimalCell(parsed.sourceCells[5].Price, "point").value, cells[5].v);
    assert.equal(decodeDecimalCell(parsed.sourceCells[6].Price, "point").ok, false);
    assert.equal(decodeDecimalCell(parsed.sourceCells[7].Price, "point").ok, false);
    assert.equal(decodeDecimalCell(parsed.sourceCells[8].Price, "point").error, "unsafe-number");
    assert.equal(parsed.sourceCells[7].Price.value, "1  2");
    assert.deepEqual(await parseExactSourceFile(file), parsed);
    assert.deepEqual(Buffer.from(await file.arrayBuffer()), bytes);
    const legacy = await parseExcelFile(file);
    assert.equal(legacy.rows[0].Price, "12.35");
    assert.equal(legacy.rows[7].Price, "1 2");
  });

  test(`exact ${type}: date, boolean, error and percentage cells block; literal percent signs are not percentage formats`, async () => {
    const parsed = await parseExactSourceFile(fileFor(sheetFor([
      { t: "n", v: 45000, z: "yyyy-mm-dd" }, { t: "b", v: true }, { t: "e", v: 7 },
      { t: "n", v: 0.125, z: "0.0%" }, { t: "n", v: 12.5, z: '0.0"%"' },
      { t: "n", v: 12.5, z: "0.0\\%" },
    ]), type));
    assert.deepEqual(parsed.sourceCells.slice(0, 4).map(row => row.Price.kind), ["date", "boolean", "error", "percentage"]);
    for (const row of parsed.sourceCells.slice(0, 4)) assert.equal(decodeDecimalCell(row.Price, "point").ok, false);
    assert.deepEqual(parsed.sourceCells.slice(4).map(row => decodeDecimalCell(row.Price, "point").value), ["12.5", "12.5"]);
  });

  test(`exact ${type}: collision-safe headers, empty rows and worksheet selection retain source-cell alignment`, async () => {
    const sheet = XLSX.utils.aoa_to_sheet([["ID", "ID", "ID 2", "Price"], ["001", "x", "y", 1.234], [], ["A  B", "z", "q", 2.345]]);
    sheet.D2.z = "0.00";
    const file = fileFor(sheet, type, [["Empty", {}], ["Other", XLSX.utils.aoa_to_sheet([["Note"], ["Choose Data"]])]]);
    assert.deepEqual(await getExactReadableExcelSheetNames(file), ["Data", "Other"]);
    await assert.rejects(parseExactSourceFile(file), /multiple sheets/);
    await assert.rejects(parseExactSourceFile(file, "Empty"), /empty or unavailable/);
    const parsed = await parseExactSourceFile(file, "Data");
    assert.deepEqual(parsed.headers, ["ID", "ID 3", "ID 2", "Price"]);
    assert.equal(parsed.rows.length, 2);assert.equal(parsed.sourceCells.length, 2);
    assert.equal(parsed.rows[1].ID, "A  B");
    assert.equal(decodeDecimalCell(parsed.sourceCells[0].Price, "point").value, "1.234");
    assert.equal(parsed.metadata.sheetName, "Data");
    assert.deepEqual(parsed.metadata.availableSheets, ["Data", "Empty", "Other"]);
  });
}

test("exact XLSX: cached formulas and uncached formula-only rows/sheets are preserved for rejection", async () => {
  const sheet = sheetFor([{ t: "n", f: "1+1", v: 2 }, { t: "s", f: 'TEXT(1,"0.00")', v: "1.00" }]);
  const formulaOnly = { A1: { t: "s", v: "Price" }, A2: { t: "n", f: "1+1" }, "!ref": "A1:A2" };
  const file = fileFor(sheet, "xlsx", [["Formulas", formulaOnly]]);
  const parsed = await parseExactSourceFile(file, "Data");
  assert.deepEqual(parsed.sourceCells.map(row => row.Price.kind), ["formula", "formula"]);
  assert.equal(decodeDecimalCell(parsed.sourceCells[0].Price, "point").error, "unsupported-cell");
  const only = await parseExactSourceFile(file, "Formulas");
  assert.equal(only.rowCount, 1);assert.equal(only.sourceCells[0].Price.kind, "formula");
});

test("exact XLS: a real BIFF8 formula is rejected even when its numeric cache looks valid", async () => {
  // The fixture contains B2=1+1, cached as 2. The XLS writer drops formulas,
  // so its NUMBER record was replaced with a BIFF8 FORMULA record once.
  const bytes = readFileSync(new URL("./fixtures/price-formula.xls", import.meta.url));
  const cell = XLSX.read(bytes, { type: "buffer", cellFormula: true }).Sheets.Data.B2;
  assert.equal(cell.f, "1+1");assert.equal(cell.v, 2);
  const parsed = await parseExactSourceFile(new File([bytes], "formula.xls"));
  assert.equal(parsed.sourceCells[0].Price.kind, "formula");
  assert.equal(decodeDecimalCell(parsed.sourceCells[0].Price, "point").error, "unsupported-cell");
});

test("exact CSV: preserve internal whitespace and raw numeric text while legacy parsing stays unchanged", async (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "FileReader");
  Object.defineProperty(globalThis, "FileReader", { configurable: true, value: class {
    readAsText(blob) { blob.text().then(result => this.onload({ target: { result } }), error => this.onerror(error)); }
  } });
  t.after(() => { if (previous) Object.defineProperty(globalThis, "FileReader", previous); else delete globalThis.FileReader; });
  const file = new File(['Product ID;Price\n"  A  B  ";" 12,5000 "\n001;"1\u00a0234"'], "exact.csv", { type: "text/csv" });
  const parsed = await parseExactSourceFile(file);
  assert.equal(parsed.rows[0]["Product ID"], "A  B");
  assert.equal(decodeDecimalCell(parsed.sourceCells[0].Price, "comma").value, "12.5000");
  assert.equal(parsed.rows[1].Price, "1\u00a0234");
  assert.equal(decodeDecimalCell(parsed.sourceCells[1].Price, "point").ok, false);
  const legacy = await parseCsvFile(file);
  assert.equal(legacy.rows[0]["Product ID"], "A B");
  assert.equal(legacy.rows[1].Price, "1 234");
  assert.deepEqual(await parseExactSourceFile(file), parsed);
});
