import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getProfileMismatchMessage } from "../src/lib/profileCompatibility.ts";
import { priceListWorkspaceConfig } from "../src/lib/profiles/masterDataWorkspaceConfig.ts";
import { priceListProfile, suggestPriceListMapping } from "../src/lib/profiles/priceListProfile.ts";
import { buildValidationReportRows } from "../src/lib/validationReport.ts";
import { prepareSavedMapping } from "../src/lib/savedMappings.ts";

const headers = ["Product ID", "Price List", "Currency", "Unit", "Unit Price"];
const mapping = suggestPriceListMapping(headers);
const counts = { total: 11, blocked: 8, needsReview: 1, ready: 2 };
const reportInput = { profile: priceListProfile, fileName: "prices.xlsx", sheetName: "Prices", mapping, counts, priceContext: { priceNotation: "point" } };
const value = (report, name) => report.find(row => row["DataPreflight field / metric"] === name)?.["Source column / value"];

test("price compatibility: full signature precedes Product fallback without auto-selecting partial/ambiguous data", () => {
  for (const domain of ["invoice", "customer", "vendor", "product"]) {
    assert.match(getProfileMismatchMessage(headers, domain), /Price List/);
  }
  assert.equal(getProfileMismatchMessage(headers, "price-list"), null);
  assert.equal(getProfileMismatchMessage(["Product ID", "Price"], "price-list"), null);
  assert.equal(getProfileMismatchMessage(["Product ID"], "price-list"), null);
  assert.equal(getProfileMismatchMessage([...headers, "Customer ID"], "customer"), null);
  assert.equal(getProfileMismatchMessage([...headers, "Customer ID"], "price-list"), null);
  assert.match(getProfileMismatchMessage(["Product ID", "Description", "Base Unit"], "price-list"), /Product \/ Material/);
  assert.match(getProfileMismatchMessage(["Invoice Number", "Amount"], "price-list"), /Invoice data/);
  assert.match(getProfileMismatchMessage(["Supplier Number", "Supplier Name"], "price-list"), /Vendor/);
});

test("price example configuration stays identical to the accepted downloadable fixture", () => {
  assert.equal(priceListWorkspaceConfig.example.csv, readFileSync(new URL("../public/demo-data/price-list-example.csv", import.meta.url), "utf8"));
  assert.equal(priceListWorkspaceConfig.profile.id, "price-list");
  assert.equal("runValidation" in priceListWorkspaceConfig, false);
  assert.match(priceListWorkspaceConfig.guidance, /not checked/);
});

test("price report: selected notation, source context, precise scope, counts and determinism", () => {
  const report = buildValidationReportRows(reportInput);
  assert.equal(value(report, "Profile ID"), "price-list");
  assert.equal(value(report, "Price notation"), "Decimal point (12.50)");
  assert.equal(value(report, "Source worksheet"), "Prices");
  assert.equal(value(report, "unit_price"), "Unit Price");
  assert.equal(value(report, "Blocked"), "8");
  assert.equal(value(report, "Needs review"), "1");
  assert.equal(value(report, "Ready"), "2");
  assert.match(value(report, "Excel numeric values"), /without display rounding/);
  assert.match(value(report, "Checks not performed"), /existence in ERP/);
  assert.equal(value(report, "Reference check"), undefined);
  assert.deepEqual(buildValidationReportRows(reportInput), report);
  assert.equal(value(buildValidationReportRows({ ...reportInput, priceContext: { priceNotation: "comma" } }), "Price notation"), "Decimal comma (12,50)");
});

test("price reports cannot silently omit notation; unrelated profiles gain no price context", () => {
  assert.throws(() => buildValidationReportRows({ ...reportInput, priceContext: undefined }), /Price notation is required/);
  assert.throws(() => buildValidationReportRows({ ...reportInput, priceContext: { priceNotation: "guess" } }), /Price notation is required/);
  const report = buildValidationReportRows({ ...reportInput, profile: { id: "customer", name: "Customer", version: "1.0.0" } });
  assert.equal(value(report, "Price notation"), undefined);
});

test("price saved mappings restore column assignments without persisting notation or source cells", () => {
  const saved = { name: "Prices", profileId: "price-list", profileVersion: "1.0.0", headers, mapping };
  const prepared = prepareSavedMapping(saved, priceListProfile, [...headers].reverse());
  assert.equal(prepared.status.mappingReady, true);
  assert.equal(prepared.sameProfile, true);
  assert.deepEqual(prepared.mapping, mapping);
  assert.equal("priceNotation" in prepared, false);
  assert.equal("sourceCells" in prepared, false);
});
