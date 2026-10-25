import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseUnitReferenceCsv, readUnitReference } from "../src/lib/unitReference.ts";
import { runProductValidation } from "../src/lib/validation/productValidation.ts";
import { productValidationProfile } from "../src/lib/validation/productValidation.ts";
import { buildValidationReportRows } from "../src/lib/validationReport.ts";

const rows = [
  { product_id: "001", description: "Steel", base_unit: " kg " },
  { product_id: "002", description: "Bracket", base_unit: "EA" },
  { product_id: "003", description: "Missing", base_unit: "" },
];

test("unit CSV: trim, case-fold, deduplicate and sort effective codes", async () => {
  const result = parseUnitReferenceCsv("\uFEFFunit_code\n kg \nEA\nKG\n", "units.csv");
  assert.deepEqual(result, { fileName: "units.csv", allowedUnits: ["EA", "KG"] });
  assert.deepEqual(await readUnitReference(new File(["unit_code\nKG"], "units.csv")), { fileName: "units.csv", allowedUnits: ["KG"] });
});

test("unit CSV: reject missing/duplicate headers, empty values and malformed structures", async () => {
  for (const text of ["", "unit_code", "unit_code\n   ", "code\nKG", "unit_code,unit_code\nKG,EA", 'unit_code\n"KG', "unit_code,note\nKG,note,extra"]) {
    assert.throws(() => parseUnitReferenceCsv(text, "bad.csv"));
  }
  await assert.rejects(readUnitReference(new File(["unit_code\nKG"], "units.xlsx")), /CSV/);
  assert.deepEqual(parseUnitReferenceCsv("unit_code;note\nkg;Allowed", "units.csv").allowedUnits, ["KG"]);
});

test("unit check: unknown codes block, case matches, no conversion, removal restores baseline", () => {
  const reference = parseUnitReferenceCsv(readFileSync(new URL("./fixtures/unit-codes-kg.csv", import.meta.url), "utf8"), "units.csv");
  const original = structuredClone(rows);
  const active = runProductValidation(rows, reference);
  assert.deepEqual(active.validationResult.issues.map(x => [x.rowIndex, x.ruleId]), [[2, "unknown-base-unit"], [3, "required-base-unit"]]);
  assert.deepEqual(active.validationResult.cleanRows, [{ product_id: "001", description: "Steel", base_unit: "kg" }]);
  assert.equal(runProductValidation(rows, null).validationResult.cleanRows.length, 2);
  assert.equal(runProductValidation(rows, { fileName: "replaced.csv", allowedUnits: ["EA"] }).validationResult.cleanRows[0].product_id, "002");
  assert.deepEqual(rows, original);
  assert.deepEqual(runProductValidation(rows, reference), active);
});

test("unit report: active/absent context and exact effective list are explicit and repeatable", () => {
  function report(reference) {
    const { validationResult } = runProductValidation(rows, reference);
    return buildValidationReportRows({ profile: productValidationProfile, fileName: "products.csv", mapping: { product_id: "ID", description: "Description", base_unit: "Unit" }, unitReference: reference, counts: { total: 3, blocked: validationResult.errorRows.length, needsReview: 0, ready: validationResult.cleanRows.length } });
  }
  const reference = parseUnitReferenceCsv("unit_code\nkg\n KG\n", "units.csv");
  const active = report(reference);
  const value = (data, field) => data.find(row => row["DataPreflight field / metric"] === field)?.["Source column / value"];
  assert.equal(value(active, "Reference check"), "Run");
  assert.equal(value(active, "Reference-check version"), "1.0.0");
  assert.equal(value(active, "Reference filename"), "units.csv");
  assert.equal(value(active, "Unique unit count"), "1");
  assert.equal(value(active, "Allowed unit"), "KG");
  assert.equal(value(report(null), "Reference check"), "Not run");
  assert.equal(value(report(null), "Reference filename"), undefined);
  assert.deepEqual(active, report(parseUnitReferenceCsv("unit_code\nKG", "units.csv")));
});
