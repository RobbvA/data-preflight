import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { priceListProfile, priceListFieldKeys, suggestPriceListMapping } from "../src/lib/profiles/priceListProfile.ts";
import { runPriceListValidation, runPriceListSourceValidation } from "../src/lib/validation/priceListValidation.ts";
import { parseExactSourceFile } from "../src/lib/exactDataInput.ts";
import { getMappingStatus } from "../src/lib/mappingStatus.ts";

const base = { product_id: "001", price_list_id: "RETAIL", currency: "EUR", unit: "EA", unit_price: "12.50" };
const run = (rows, notation = "point", cells = rows.map(row => ({ kind: "text", value: row.unit_price ?? "" }))) =>
  runPriceListValidation(rows, { priceNotation: notation, priceCells: cells });
const issueRules = result => result.validationResult.issues.map(issue => [issue.rowIndex, issue.ruleId, issue.severity]);
const fixture = () => {
  const parsed = Papa.parse(readFileSync(new URL("../public/demo-data/price-list-example.csv", import.meta.url), "utf8"), { header: true, skipEmptyLines: true });
  return {
    sourceType: "csv", fileName: "price-list-example.csv", headers: parsed.meta.fields, rows: parsed.data, rowCount: parsed.data.length,
    capabilities: { hasHeaders: true, hasRows: true, supportsMultipleSheets: false, supportsCellFormatting: false, supportsTextExtraction: false },
    sourceCells: parsed.data.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, { kind: "text", value }]))),
  };
};

test("price fixture: exact 8 blocked / 1 needs review / 2 ready; only rows 1/2/3 export", () => {
  const source = fixture();const before = structuredClone(source);
  const mapping = suggestPriceListMapping(source.headers);
  const result = runPriceListSourceValidation(source, mapping, "point");
  assert.equal(result.available, true);assert.equal(result.normalizedRows.length, 11);
  assert.equal(result.validationResult.errorRows.length, 8);
  assert.deepEqual(issueRules(result), [
    [3, "zero-unit-price", "warning"], [4, "negative-unit-price", "critical"], [5, "invalid-unit-price", "critical"],
    [6, "required-product-id", "critical"], [7, "invalid-currency", "critical"], [8, "required-unit", "critical"],
    [9, "duplicate-price-key", "critical"], [10, "duplicate-price-key", "critical"], [11, "required-price-list-id", "critical"],
  ]);
  assert.deepEqual(result.validationResult.cleanRows, [base, { ...base, price_list_id: "WHOLESALE", unit_price: "10.00" }, { ...base, product_id: "002", unit_price: "0" }]);
  const warnings = new Set(result.validationResult.issues.filter(x => x.severity === "warning").map(x => x.rowIndex));
  assert.equal(warnings.size, 1);assert.equal(result.validationResult.cleanRows.length - warnings.size, 2);
  for (const row of result.normalizedRows) assert.deepEqual(Object.keys(row), [...priceListFieldKeys]);
  for (const issue of result.validationResult.issues) assert.ok(issue.problem && issue.why && issue.fix);
  assert.deepEqual(source, before);assert.deepEqual(runPriceListSourceValidation(source, mapping, "point"), result);
});

test("price mapping: all aliases, ambiguity and required/duplicate/stale mapping gates", () => {
  assert.deepEqual(suggestPriceListMapping(["Artikelnummer", "Prijslijstcode", "Valuta", "Eenheid", "Eenheidsprijs"]), {
    product_id: "Artikelnummer", price_list_id: "Prijslijstcode", currency: "Valuta", unit: "Eenheid", unit_price: "Eenheidsprijs",
  });
  const source = fixture();const mapping = suggestPriceListMapping(source.headers);
  for (const key of priceListFieldKeys) assert.equal(runPriceListSourceValidation(source, { ...mapping, [key]: "" }, "point").available, false);
  assert.equal(runPriceListSourceValidation(source, { ...mapping, unit: mapping.product_id }, "point").unavailableReason, "mapping-required");
  assert.equal(runPriceListSourceValidation(source, { ...mapping, unit_price: "Deleted price column" }, "point").unavailableReason, "mapping-required");
  for (const extras of [["SKU"], ["Price"]]) {
    const ambiguous = suggestPriceListMapping([...source.headers, ...extras]);
    assert.equal(getMappingStatus(priceListProfile, ambiguous).mappingReady, false);
  }
  assert.equal(priceListProfile.version, "1.0.0");
});

test("price context: a saved mapping cannot bypass notation or missing Excel cell metadata", () => {
  const source = fixture();const mapping = suggestPriceListMapping(source.headers);
  const absentNotation = runPriceListSourceValidation(source, mapping, null);
  assert.equal(absentNotation.unavailableReason, "notation-required");assert.equal(absentNotation.validationResult.cleanRows.length, 0);
  for (const sourceCells of [undefined, [], source.sourceCells.slice(1), source.sourceCells.map(() => ({}))]) {
    const result = runPriceListSourceValidation({ ...source, sourceCells }, mapping, "point");
    assert.equal(result.unavailableReason, "source-context");assert.equal(result.normalizedRows.length, 0);
  }
  assert.equal(runPriceListValidation([base], { priceNotation: "point", priceCells: [] }).available, false);
});

test("price normalization: trim only, uppercase currency, textual leading zeros and exact decimal scale", () => {
  const row = { product_id: " 001 ", price_list_id: " A  B ", currency: " eur ", unit: " kg ", unit_price: " 900719925474099312345,123450000 " };
  const result = run([row], "comma");
  assert.deepEqual(result.validationResult.cleanRows, [{ product_id: "001", price_list_id: "A  B", currency: "EUR", unit: "kg", unit_price: "900719925474099312345.123450000" }]);
  assert.equal(run([{ ...base, currency: "ZZZ" }]).validationResult.cleanRows.length, 1);
  assert.equal(run([{ ...base, unit_price: "1.234" }], "point").validationResult.cleanRows[0].unit_price, "1.234");
  assert.equal(run([{ ...base, unit_price: "1.234" }], "comma").validationResult.cleanRows.length, 0);
});

test("price rules: every required value blocks, invalid currency shape blocks", () => {
  const empty = run([{}]);
  assert.equal(empty.validationResult.issues.length, 5);
  assert.equal(empty.validationResult.errorRows.length, 1);
  for (const key of priceListFieldKeys) {
    const result = run([{ ...base, [key]: "  " }]);
    assert.equal(result.validationResult.cleanRows.length, 0, key);
    assert.equal(result.validationResult.issues[0].field, key);
  }
  for (const currency of ["EURO", "E1R", "ÉUR", "E R"]) assert.equal(run([{ ...base, currency }]).validationResult.cleanRows.length, 0, currency);
});

test("price rules: negatives block, all zero forms warn/export, invalid text explains chosen notation", () => {
  for (const [unit_price, notation, value] of [["0", "point", "0"], ["-0.0000", "point", "0.0000"], ["-00,00", "comma", "00.00"]]) {
    const result = run([{ ...base, unit_price }], notation);
    assert.equal(result.validationResult.cleanRows[0].unit_price, value);
    assert.deepEqual(issueRules(result), [[1, "zero-unit-price", "warning"]]);
  }
  for (const unit_price of ["-1", "-0.0000000000000001"]) assert.equal(run([{ ...base, unit_price }]).validationResult.cleanRows.length, 0);
  for (const unit_price of ["+1", ".5", "12.", "1e3", "1,234.56", "1  2", "€12"]) {
    const result = run([{ ...base, unit_price }]);
    assert.equal(result.validationResult.cleanRows.length, 0);
    assert.match(result.validationResult.issues[0].fix, /decimal point/);
  }
  assert.match(run([{ ...base, unit_price: "12.50" }], "comma").validationResult.issues[0].fix, /decimal comma/);
});

test("price duplicates: all complete tuple members block even with identical, zero or invalid prices", () => {
  const result = run([base, { ...base, product_id: " 001 ", price_list_id: "retail", currency: "eur", unit: "ea", unit_price: "bad" }, { ...base, unit_price: "0" }]);
  assert.equal(result.validationResult.cleanRows.length, 0);
  assert.deepEqual(result.validationResult.issues.filter(x => x.ruleId === "duplicate-price-key").map(x => x.rowIndex), [1, 2, 3]);
  assert.equal(run([base, { ...base }]).validationResult.errorRows.length, 2);
  for (const changed of [{ price_list_id: "WHOLESALE" }, { unit: "BOX" }, { product_id: "1" }, { currency: "USD" }]) {
    assert.equal(run([base, { ...base, ...changed }]).validationResult.cleanRows.length, 2);
  }
});

test("price duplicate keys: incomplete/invalid keys do not collide, delimiters and internal spaces remain distinct", () => {
  for (const changed of [{ product_id: "" }, { price_list_id: "" }, { unit: "" }, { currency: "EURO" }]) {
    const issues = run([{ ...base, ...changed }, { ...base, ...changed }]).validationResult.issues;
    assert.equal(issues.some(x => x.ruleId === "duplicate-price-key"), false);
  }
  const rows = [
    { ...base, product_id: "A|B", price_list_id: "C" }, { ...base, product_id: "A", price_list_id: "B|C" },
    { ...base, product_id: "A  B" }, { ...base, product_id: "A B" },
  ];
  assert.equal(run(rows).validationResult.cleanRows.length, 4);
});

test("price cell types: stored numbers ignore textual notation; unsupported types and unsafe magnitude block", () => {
  assert.equal(run([base], "comma", [{ kind: "number", value: 12.3456 }]).validationResult.cleanRows[0].unit_price, "12.3456");
  for (const kind of ["formula", "date", "boolean", "error", "percentage"]) {
    const result = run([base], "point", [{ kind, value: "12.50" }]);
    assert.equal(result.validationResult.cleanRows.length, 0);
    assert.equal(result.validationResult.issues[0].ruleId, "unsupported-unit-price-cell");
    assert.match(result.validationResult.issues[0].problem, new RegExp(kind));
    assert.ok(result.validationResult.issues[0].fix);
  }
  assert.equal(run([base], "point", [{ kind: "number", value: Number.MAX_SAFE_INTEGER + 1 }]).validationResult.issues[0].ruleId, "unsafe-unit-price-number");
});

test("price exact XLS/XLSX source integration: reordered columns, numeric formatting and source cells survive mapping", async () => {
  for (const type of ["xlsx", "xls"]) {
    const headers = ["Unit Price", "Unit", "Currency", "Price List", "Product ID"];
    const sheet = XLSX.utils.aoa_to_sheet([headers, [12.3456, "EA", "EUR", "RETAIL", "001"]]);sheet.A2.z = "0.00";
    const book = XLSX.utils.book_new();XLSX.utils.book_append_sheet(book, sheet, "Prices");
    const source = await parseExactSourceFile(new File([XLSX.write(book, { type: "buffer", bookType: type })], `prices.${type}`));
    const before = structuredClone(source);const mapping = suggestPriceListMapping(source.headers);
    const result = runPriceListSourceValidation(source, mapping, "comma");
    assert.deepEqual(result.validationResult.cleanRows, [{ ...base, unit_price: "12.3456" }]);
    assert.deepEqual(source, before);assert.deepEqual(runPriceListSourceValidation(source, mapping, "comma"), result);
  }
});
