import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getProfileMismatchMessage } from "../src/lib/profileCompatibility.ts";
import { stockBalancesWorkspaceConfig } from "../src/lib/profiles/masterDataWorkspaceConfig.ts";
import { stockBalancesProfile, suggestStockBalancesMapping } from "../src/lib/profiles/stockBalancesProfile.ts";
import { buildValidationReportRows } from "../src/lib/validationReport.ts";
import { prepareSavedMapping } from "../src/lib/savedMappings.ts";

const headers = ["Product ID", "Warehouse", "Unit", "Quantity"];
const mapping = suggestStockBalancesMapping(headers);
const reportInput = {
  profile: stockBalancesProfile, fileName: "stock.xlsx", sheetName: "Stock", mapping,
  counts: { total: 10, blocked: 7, needsReview: 0, ready: 3 }, stockContext: { quantityNotation: "point" },
};
const value = (rows, name) => rows.find(row => row["DataPreflight field / metric"] === name)?.["Source column / value"];

test("stock compatibility: full signature precedes Product fallback; Price and Stock remain distinct", () => {
  for (const domain of ["invoice", "customer", "vendor", "product", "price-list"]) assert.match(getProfileMismatchMessage(headers, domain), /Stock Balances/);
  assert.equal(getProfileMismatchMessage(headers, "stock-balances"), null);
  assert.match(getProfileMismatchMessage(["Product ID", "Price List", "Currency", "Unit", "Unit Price"], "stock-balances"), /Price List/);
  assert.match(getProfileMismatchMessage(["Product ID", "Description", "Base Unit"], "stock-balances"), /Product \/ Material/);
  assert.match(getProfileMismatchMessage(["Invoice Number", "Amount"], "stock-balances"), /Invoice data/);
});

test("stock compatibility: partial/competing signatures stay mappable; Product ID alone proves no domain", () => {
  const domains = ["invoice", "customer", "vendor", "product", "price-list", "stock-balances"];
  for (const domain of domains) {
    assert.equal(getProfileMismatchMessage(["Product ID"], domain), null);
    assert.equal(getProfileMismatchMessage([...headers, "Price List", "Unit Price"], domain), null);
  }
  assert.equal(getProfileMismatchMessage(["Product ID", "Warehouse"], "stock-balances"), null);
  assert.equal(getProfileMismatchMessage(["Product ID", "Location", "Quantity"], "stock-balances"), null);
  assert.equal(getProfileMismatchMessage([...headers, "Customer ID"], "stock-balances"), null);
  assert.equal(getProfileMismatchMessage([...headers, "Customer ID"], "customer"), null);
});

test("stock example configuration equals the accepted downloadable 10-row fixture", () => {
  assert.equal(stockBalancesWorkspaceConfig.example.csv, readFileSync(new URL("../public/demo-data/stock-balances-example.csv", import.meta.url), "utf8"));
  assert.equal(stockBalancesWorkspaceConfig.profile.id, "stock-balances");
  assert.equal("runValidation" in stockBalancesWorkspaceConfig, false);
  assert.match(stockBalancesWorkspaceConfig.guidance, /absolute stock balance/);
});

test("stock report: quantity notation, snapshot limits, duplicate scope, zero semantics and counts", () => {
  const rows = buildValidationReportRows(reportInput);
  assert.equal(value(rows, "Profile ID"), "stock-balances");
  assert.equal(value(rows, "Quantity notation"), "Decimal point (12.50)");
  assert.equal(value(rows, "Source worksheet"), "Stock");
  assert.equal(value(rows, "quantity"), "Quantity");
  assert.equal(value(rows, "Blocked"), "7");assert.equal(value(rows, "Needs review"), "0");assert.equal(value(rows, "Ready"), "3");
  assert.match(value(rows, "Stock interpretation"), /not movements or deltas/);
  assert.match(value(rows, "Duplicate scope"), /not summed/);
  assert.match(value(rows, "Zero quantity"), /does not generate a warning/);
  assert.match(value(rows, "Checks not performed"), /snapshot date/);
  assert.match(value(rows, "Excel numeric values"), /without display rounding/);
  assert.equal(value(rows, "Price notation"), undefined);assert.equal(value(rows, "Reference check"), undefined);
  assert.deepEqual(buildValidationReportRows(reportInput), rows);
  assert.equal(value(buildValidationReportRows({ ...reportInput, stockContext: { quantityNotation: "comma" } }), "Quantity notation"), "Decimal comma (12,50)");
});

test("stock report: missing/invalid quantity context cannot be omitted or leak into another profile", () => {
  assert.throws(() => buildValidationReportRows({ ...reportInput, stockContext: undefined }), /Quantity notation is required/);
  assert.throws(() => buildValidationReportRows({ ...reportInput, stockContext: { quantityNotation: "guess" } }), /Quantity notation is required/);
  const other = buildValidationReportRows({ ...reportInput, profile: { id: "customer", name: "Customer", version: "1.0.0" } });
  assert.equal(value(other, "Quantity notation"), undefined);assert.equal(value(other, "Stock interpretation"), undefined);
});

test("stock saved mappings restore only columns, remain separate from Price and never persist quantity notation", () => {
  const saved = { name: "Stock", profileId: "stock-balances", profileVersion: "1.0.0", headers, mapping };
  const prepared = prepareSavedMapping(saved, stockBalancesProfile, [...headers].reverse());
  assert.equal(prepared.status.mappingReady, true);assert.equal(prepared.sameProfile, true);assert.deepEqual(prepared.mapping, mapping);
  assert.equal("quantityNotation" in prepared, false);assert.equal("sourceCells" in prepared, false);
  assert.equal(prepareSavedMapping({ ...saved, profileId: "price-list" }, stockBalancesProfile, headers).sameProfile, false);
});
