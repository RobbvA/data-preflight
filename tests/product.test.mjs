import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";
import { productProfile, suggestProductMapping } from "../src/lib/profiles/productProfile.ts";
import { productValidationProfile } from "../src/lib/validation/productValidation.ts";
import { productWorkspaceConfig } from "../src/lib/profiles/masterDataWorkspaceConfig.ts";
import { mapRowsToProfile, runValidationProfile } from "../src/lib/validation/validationProfile.ts";
import { getMappingStatus } from "../src/lib/mappingStatus.ts";
import { getProfileMismatchMessage } from "../src/lib/profileCompatibility.ts";
import { parseExcelFile } from "../src/lib/parseCsv.ts";
import { prepareSavedMapping } from "../src/lib/savedMappings.ts";
import { buildValidationReportRows } from "../src/lib/validationReport.ts";

const source = [
  { "Material Number": " 001 ", "Material Description": " Steel   bracket ", "Base Unit": " EA " },
  { "Material Number": "002", "Material Description": "   ", "Base Unit": "KG" },
  { "Material Number": "003", "Material Description": "Missing unit", "Base Unit": "" },
  { "Material Number": " P-004 ", "Material Description": "Duplicate A", "Base Unit": "KG" },
  { "Material Number": "p-004", "Material Description": "Duplicate B", "Base Unit": "kg" },
  { "Material Number": "", "Material Description": "Missing identifier", "Base Unit": "EA" },
  { "Material Number": "005", "Material Description": "Aluminium sheet", "Base Unit": "kg" },
];
const headers = Object.keys(source[0]);
function run(rows = source, columns = headers) {
  const mapping = suggestProductMapping(columns);
  return { mapping, ...runValidationProfile(productValidationProfile, mapRowsToProfile(rows, mapping, productProfile)) };
}

test("product fixture: exact blockers, normalized values and export rows", () => {
  const original = structuredClone(source);
  const result = run();
  assert.equal(result.normalizedRows.length, 7);
  assert.deepEqual(result.normalizedRows[0], { product_id: "001", description: "Steel bracket", base_unit: "EA" });
  assert.deepEqual(result.validationResult.issues.map(x => [x.rowIndex, x.ruleId, x.severity]), [
    [2, "required-description", "critical"], [3, "required-base-unit", "critical"],
    [4, "duplicate-product-id", "critical"], [5, "duplicate-product-id", "critical"], [6, "required-product-id", "critical"],
  ]);
  assert.deepEqual(result.validationResult.cleanRows, [
    { product_id: "001", description: "Steel bracket", base_unit: "EA" },
    { product_id: "005", description: "Aluminium sheet", base_unit: "kg" },
  ]);
  assert.equal(result.validationResult.errorRows.length, 5);
  assert.deepEqual(source, original);
  assert.deepEqual(run(), result);
});

test("product mapping: aliases, ambiguity and all required mapping guards", () => {
  assert.deepEqual(suggestProductMapping(["Artikelnummer", "Omschrijving", "Eenheid"]), { product_id: "Artikelnummer", description: "Omschrijving", base_unit: "Eenheid" });
  const ambiguous = suggestProductMapping(["SKU", "Material Number", "Description", "UOM"]);
  assert.equal(ambiguous.product_id, "");
  assert.equal(getMappingStatus(productProfile, ambiguous).mappingReady, false);
  const mapping = suggestProductMapping(headers);
  for (const key of ["product_id", "description", "base_unit"]) {
    assert.equal(getMappingStatus(productProfile, { ...mapping, [key]: "" }).mappingReady, false);
  }
  assert.equal(getMappingStatus(productProfile, { ...mapping, base_unit: mapping.description }).mappingReady, false);
});

test("product rules: empty rows block; IDs and units are not converted", () => {
  const result = runValidationProfile(productValidationProfile, [
    {}, { product_id: "001", description: "First", base_unit: " odd-unit " },
    { product_id: "1", description: "Second", base_unit: "kg" },
  ]);
  assert.deepEqual(result.validationResult.issues.map(x => x.ruleId), ["empty-row"]);
  assert.deepEqual(result.validationResult.cleanRows.map(x => [x.product_id, x.base_unit]), [["001", "odd-unit"], ["1", "kg"]]);
  for (const issue of result.validationResult.issues) assert.ok(issue.problem && issue.why && issue.fix);
});

test("product Excel: reordered columns and explicit worksheet match the CSV fixture", async () => {
  const reordered = ["Base Unit", "Material Number", "Material Description"];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Note"], ["Choose Products"]]), "Notes");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([reordered, ...source.map(row => reordered.map(h => row[h]))]), "Products");
  const file = new File([XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })], "products.xlsx");
  await assert.rejects(parseExcelFile(file), /multiple sheets/);
  const parsed = await parseExcelFile(file, "Products");
  assert.equal(parsed.metadata.sheetName, "Products");
  assert.deepEqual(run(parsed.rows, parsed.headers).validationResult, run().validationResult);
});

test("product saved mappings and reports retain product context", () => {
  const result = run();
  const saved = { name: "Materials", profileId: "product", profileVersion: "1.0.0", headers, mapping: result.mapping };
  const prepared = prepareSavedMapping(saved, productValidationProfile, [...headers].reverse());
  assert.equal(prepared.status.mappingReady, true);
  assert.equal(prepared.sameProfile, true);
  const report = buildValidationReportRows({ profile: productValidationProfile, fileName: "products.xlsx", sheetName: "Products", mapping: prepared.mapping, counts: { total: 7, blocked: 5, needsReview: 0, ready: 2 } });
  const value = field => report.find(row => row["DataPreflight field / metric"] === field)?.["Source column / value"];
  assert.equal(value("Profile ID"), "product");
  assert.equal(value("Profile version"), "1.0.0");
  assert.equal(value("Source worksheet"), "Products");
  assert.equal(value("base_unit"), "Base Unit");
  assert.equal(value("Blocked"), "5");
});

test("product compatibility: known mismatches rejected, ambiguous headers remain mappable", () => {
  assert.equal(getProfileMismatchMessage(headers, "product"), null);
  assert.match(getProfileMismatchMessage(headers, "invoice"), /Product \/ Material/);
  assert.match(getProfileMismatchMessage(["Supplier Number", "Supplier Name"], "product"), /Vendor/);
  assert.match(getProfileMismatchMessage(["Customer Number", "Customer Name"], "product"), /Customer/);
  assert.match(getProfileMismatchMessage(["Invoice Number", "Amount"], "product"), /Invoice/);
  assert.equal(getProfileMismatchMessage(["Code", "Text", "Measure"], "product"), null);
  assert.equal(getProfileMismatchMessage(["Product ID", "Customer ID", "Description", "Base Unit"], "product"), null);
  assert.equal(productWorkspaceConfig.profile.id, "product");
  assert.match(productWorkspaceConfig.guidance, /optional unit list/);
});
