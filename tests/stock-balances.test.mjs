import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { stockBalancesProfile, stockBalancesFieldKeys, suggestStockBalancesMapping } from "../src/lib/profiles/stockBalancesProfile.ts";
import { runStockBalancesValidation, runStockBalancesSourceValidation } from "../src/lib/validation/stockBalancesValidation.ts";
import { parseExactSourceFile } from "../src/lib/exactDataInput.ts";
import { getMappingStatus } from "../src/lib/mappingStatus.ts";

const base = { product_id: "001", warehouse_id: "WH-A", unit: "EA", quantity: "10" };
const run = (rows, notation = "point", cells = rows.map(row => ({ kind: "text", value: row.quantity ?? "" }))) =>
  runStockBalancesValidation(rows, { quantityNotation: notation, quantityCells: cells });
const rules = result => result.validationResult.issues.map(issue => [issue.rowIndex, issue.ruleId, issue.severity]);
const fixture = () => {
  const parsed = Papa.parse(readFileSync(new URL("../public/demo-data/stock-balances-example.csv", import.meta.url), "utf8"), { header: true, skipEmptyLines: true });
  return {
    sourceType: "csv", fileName: "stock-balances-example.csv", headers: parsed.meta.fields, rows: parsed.data, rowCount: parsed.data.length,
    capabilities: { hasHeaders: true, hasRows: true, supportsMultipleSheets: false, supportsCellFormatting: false, supportsTextExtraction: false },
    sourceCells: parsed.data.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, { kind: "text", value }]))),
  };
};

test("stock fixture: exactly 7 blocked / 0 review / 3 ready; rows 1/2/3 export including zero", () => {
  const source = fixture();const before = structuredClone(source);const mapping = suggestStockBalancesMapping(source.headers);
  const result = runStockBalancesSourceValidation(source, mapping, "point");
  assert.equal(result.available, true);assert.equal(result.normalizedRows.length, 10);
  assert.deepEqual(rules(result), [
    [4, "negative-quantity", "critical"], [5, "invalid-quantity", "critical"], [6, "required-product-id", "critical"],
    [7, "required-warehouse-id", "critical"], [8, "required-unit", "critical"],
    [9, "duplicate-stock-key", "critical"], [10, "duplicate-stock-key", "critical"],
  ]);
  assert.equal(result.validationResult.errorRows.length, 7);
  assert.deepEqual(result.validationResult.cleanRows, [base, { ...base, warehouse_id: "WH-B", quantity: "5.50" }, { ...base, product_id: "002", unit: "KG", quantity: "0" }]);
  assert.equal(result.validationResult.issues.some(issue => issue.severity === "warning"), false);
  for (const row of result.normalizedRows) assert.deepEqual(Object.keys(row), [...stockBalancesFieldKeys]);
  for (const issue of result.validationResult.issues) assert.ok(issue.problem && issue.why && issue.fix);
  assert.deepEqual(source, before);assert.deepEqual(runStockBalancesSourceValidation(source, mapping, "point"), result);
});

test("stock mapping: aliases, ambiguous columns and Location is not a Warehouse alias", () => {
  assert.deepEqual(suggestStockBalancesMapping(["Artikelnummer", "Magazijncode", "Eenheid", "Voorraad"]), { product_id: "Artikelnummer", warehouse_id: "Magazijncode", unit: "Eenheid", quantity: "Voorraad" });
  assert.equal(suggestStockBalancesMapping(["SKU", "Location", "UOM", "On-hand Quantity"]).warehouse_id, "");
  const source = fixture();
  for (const extra of ["SKU", "Warehouse Code", "Stock Quantity"]) {
    assert.equal(getMappingStatus(stockBalancesProfile, suggestStockBalancesMapping([...source.headers, extra])).mappingReady, false);
  }
  assert.equal(getMappingStatus(stockBalancesProfile, suggestStockBalancesMapping(["Product ID", "Price List", "Currency", "Unit", "Unit Price"])).mappingReady, false);
  assert.equal(getMappingStatus(stockBalancesProfile, suggestStockBalancesMapping(["Product ID", "Description", "Base Unit"])).mappingReady, false);
  assert.equal(stockBalancesProfile.version, "1.0.0");
});

test("stock gates: every required mapping, duplicate/stale mapping, notation and source metadata", () => {
  const source = fixture();const mapping = suggestStockBalancesMapping(source.headers);
  for (const key of stockBalancesFieldKeys) assert.equal(runStockBalancesSourceValidation(source, { ...mapping, [key]: "" }, "point").unavailableReason, "mapping-required");
  assert.equal(runStockBalancesSourceValidation(source, { ...mapping, unit: mapping.product_id }, "point").available, false);
  assert.equal(runStockBalancesSourceValidation(source, { ...mapping, quantity: "Old column" }, "point").available, false);
  const missingNotation = runStockBalancesSourceValidation(source, mapping, null);
  assert.equal(missingNotation.unavailableReason, "notation-required");assert.equal(missingNotation.normalizedRows.length, 0);
  for (const sourceCells of [undefined, [], source.sourceCells.slice(1), source.sourceCells.map(() => ({}))]) {
    const result = runStockBalancesSourceValidation({ ...source, sourceCells }, mapping, "point");
    assert.equal(result.unavailableReason, "source-context");assert.equal(result.validationResult.cleanRows.length, 0);
  }
  assert.equal(runStockBalancesValidation([base], { quantityNotation: "point", quantityCells: [] }).available, false);
});

test("stock quantities: zero/negative zero are Ready, nonzero negatives block with snapshot explanation", () => {
  for (const [quantity, notation, expected] of [["0", "point", "0"], ["-0.000", "point", "0.000"], ["-00,00", "comma", "00.00"]]) {
    const result = run([{ ...base, quantity }], notation);
    assert.equal(result.validationResult.cleanRows[0].quantity, expected);assert.deepEqual(result.validationResult.issues, []);
  }
  for (const quantity of ["-1", "-0.0000000000000001"]) {
    const result = run([{ ...base, quantity }]);assert.equal(result.validationResult.cleanRows.length, 0);
    assert.equal(result.validationResult.issues[0].ruleId, "negative-quantity");assert.match(result.validationResult.issues[0].why, /not mean negative stock is universally invalid/);
  }
  assert.equal(run([{ ...base, quantity: "0.25" }]).validationResult.cleanRows.length, 1, "No invented whole-unit-only rule for EA");
});

test("stock normalization: only trim identifiers/units; exact comma/long decimal scale; no silent repair", () => {
  const result = run([{ product_id: " 001 ", warehouse_id: " WH  A ", unit: " kg ", quantity: " 900719925474099312345,1234500 " }], "comma");
  assert.deepEqual(result.validationResult.cleanRows, [{ product_id: "001", warehouse_id: "WH  A", unit: "kg", quantity: "900719925474099312345.1234500" }]);
  assert.equal(run([{ ...base, quantity: "1.234" }], "point").validationResult.cleanRows[0].quantity, "1.234");
  for (const quantity of ["+1", ".5", "12.", "1e3", "1,234.56", "1  2", "€12", "1\u00a0234"]) {
    const invalid = run([{ ...base, quantity }]);assert.equal(invalid.validationResult.cleanRows.length, 0);assert.match(invalid.validationResult.issues[0].fix, /decimal point/);
  }
  assert.match(run([{ ...base, quantity: "1.234" }], "comma").validationResult.issues[0].fix, /decimal comma/);
});

test("stock required values: each absent field blocks, including blank quantity rather than an invented zero", () => {
  assert.equal(run([{}]).validationResult.issues.length, 4);
  for (const key of stockBalancesFieldKeys) {
    const result = run([{ ...base, [key]: " " }]);assert.equal(result.validationResult.cleanRows.length, 0);
    assert.equal(result.validationResult.issues[0].ruleId, 'required-'+key.replaceAll('_','-'));
  }
});

test("stock duplicates: same product/warehouse blocks all rows even with equal, invalid or absent quantity/unit", () => {
  for (const changed of [{}, { quantity: "" }, { quantity: "ten" }, { unit: "" }, { quantity: "0" }]) {
    const result = run([base, { ...base, ...changed, warehouse_id: " wh-a " }]);
    assert.equal(result.validationResult.cleanRows.length, 0);
    assert.deepEqual(result.validationResult.issues.filter(x => x.ruleId === "duplicate-stock-key").map(x => x.rowIndex), [1, 2]);
  }
  assert.equal(run([base, { ...base, warehouse_id: "WH-B" }]).validationResult.cleanRows.length, 2);
});

test("stock unit conflict: EA/BOX cannot form separate Ready balances or be silently converted", () => {
  const result = run([base, { ...base, unit: "BOX", quantity: "2" }]);
  assert.equal(result.validationResult.errorRows.length, 2);assert.equal(result.validationResult.cleanRows.length, 0);
  const conflicts = result.validationResult.issues.filter(x => x.ruleId === "stock-unit-conflict");
  assert.deepEqual(conflicts.map(x => x.rowIndex), [1, 2]);
  assert.ok(conflicts.every(x => /never converted/.test(x.fix)));
  assert.deepEqual(result.normalizedRows.map(x => [x.unit, x.quantity]), [["EA", "10"], ["BOX", "2"]]);
  assert.equal(run([base, { ...base, unit: " ea " }]).validationResult.issues.some(x => x.ruleId === "stock-unit-conflict"), false);
});

test("stock keys: incomplete keys never collide; delimiters, internal whitespace and leading zeros retain identity", () => {
  for (const changed of [{ product_id: "" }, { warehouse_id: "" }]) {
    assert.equal(run([{ ...base, ...changed }, { ...base, ...changed }]).validationResult.issues.some(x => x.ruleId === "duplicate-stock-key"), false);
  }
  const rows = [
    { ...base, product_id: "A|B", warehouse_id: "C" }, { ...base, product_id: "A", warehouse_id: "B|C" },
    { ...base, product_id: "A  B" }, { ...base, product_id: "A B" }, base, { ...base, product_id: "1" },
  ];
  assert.equal(run(rows).validationResult.cleanRows.length, 6);
});

test("stock typed cells: stored numbers need notation; unsupported/unsafe cells cannot fall back to cached quantity", () => {
  assert.equal(run([base], "comma", [{ kind: "number", value: 12.3456 }]).validationResult.cleanRows[0].quantity, "12.3456");
  assert.equal(run([base], null, [{ kind: "number", value: 10 }]).available, false);
  for (const kind of ["formula", "date", "boolean", "error", "percentage"]) {
    const result = run([base], "point", [{ kind, value: "10" }]);
    assert.equal(result.validationResult.cleanRows.length, 0);assert.equal(result.validationResult.issues[0].ruleId, "unsupported-quantity-cell");
  }
  assert.equal(run([base], "point", [{ kind: "number", value: Number.MAX_SAFE_INTEGER + 1 }]).validationResult.issues[0].ruleId, "unsafe-quantity-number");
});

test("stock exact XLS/XLSX source: reordered columns, stored precision, zero and non-mutation", async () => {
  for (const type of ["xlsx", "xls"]) {
    const headers = ["Quantity", "Unit", "Warehouse", "Product ID"];
    const sheet = XLSX.utils.aoa_to_sheet([headers, [12.3456, "EA", "WH-A", "001"], [0, "KG", "WH-A", "002"]]);sheet.A2.z = "0.00";
    const book = XLSX.utils.book_new();XLSX.utils.book_append_sheet(book, sheet, "Stock");
    const source = await parseExactSourceFile(new File([XLSX.write(book, { type: "buffer", bookType: type })], `stock.${type}`));
    const before = structuredClone(source);const mapping = suggestStockBalancesMapping(source.headers);
    const result = runStockBalancesSourceValidation(source, mapping, "comma");
    assert.deepEqual(result.validationResult.cleanRows, [{ ...base, quantity: "12.3456" }, { product_id: "002", warehouse_id: "WH-A", unit: "KG", quantity: "0" }]);
    assert.deepEqual(result.validationResult.issues, []);assert.deepEqual(source, before);
    assert.deepEqual(runStockBalancesSourceValidation(source, mapping, "comma"), result);
  }
});
