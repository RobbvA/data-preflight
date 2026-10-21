import assert from "node:assert/strict";
import test from "node:test";

import {
  suggestVendorMapping,
  vendorProfile,
} from "../src/lib/profiles/vendorProfile.ts";
import { vendorValidationProfile } from "../src/lib/validation/vendorValidation.ts";
import {
  mapRowsToProfile,
  runValidationProfile,
} from "../src/lib/validation/validationProfile.ts";
import { getMappingStatus } from "../src/lib/mappingStatus.ts";
import { buildValidationReportRows } from "../src/lib/validationReport.ts";

const headers = [
  "Supplier Number",
  "Supplier Name",
  "Email",
  "Country Code",
  "VAT Number",
  "Source note",
];

const sourceRows = [
  {
    "Supplier Number": " 001 ",
    "Supplier Name": " Acme   Supply ",
    Email: " FINANCE@ACME.EXAMPLE ",
    "Country Code": " nl ",
    "VAT Number": " NL123456789B01 ",
    "Source note": "Ignored",
  },
  {
    "Supplier Number": "002",
    "Supplier Name": "   ",
  },
  {
    "Supplier Number": "003",
    "Supplier Name": "Warning supplier",
    Email: "wrong-email",
    "Country Code": "NLD",
  },
  {
    "Supplier Number": " V-004 ",
    "Supplier Name": "Duplicate A",
  },
  {
    "Supplier Number": "v-004",
    "Supplier Name": "Duplicate B",
  },
  {
    "Supplier Number": "005",
    "Supplier Name": "Optional fields empty",
  },
];

function runFixture() {
  const mapping = suggestVendorMapping(headers);
  const mappedRows = mapRowsToProfile(sourceRows, mapping, vendorProfile);

  return {
    mapping,
    ...runValidationProfile(vendorValidationProfile, mappedRows),
  };
}

test("vendor mapping: supplier aliases map all five fields", () => {
  const mapping = suggestVendorMapping(headers);

  assert.deepEqual(mapping, {
    vendor_id: "Supplier Number",
    name: "Supplier Name",
    email: "Email",
    country: "Country Code",
    vat_number: "VAT Number",
  });

  assert.equal(getMappingStatus(vendorProfile, mapping).mappingReady, true);

  const dutch = suggestVendorMapping([
    "Crediteurnummer",
    "Leveranciersnaam",
    "Emailadres",
    "Landcode",
    "Btw-nummer",
  ]);

  assert.equal(dutch.vendor_id, "Crediteurnummer");
  assert.equal(dutch.name, "Leveranciersnaam");
  assert.equal(getMappingStatus(vendorProfile, dutch).mappedCount, 5);
});

test("vendor mapping: ambiguous IDs require a manual choice", () => {
  const mapping = suggestVendorMapping([
    "Vendor ID",
    "Supplier Number",
    "Supplier Name",
  ]);

  assert.equal(mapping.vendor_id, "");
  assert.equal(getMappingStatus(vendorProfile, mapping).mappingReady, false);
});

test("vendor fixture: three blocked, one review, two ready; exact export rows", () => {
  const { normalizedRows, validationResult } = runFixture();
  const { issues, cleanRows, errorRows } = validationResult;

  assert.equal(normalizedRows.length, 6);

  assert.deepEqual(
    issues.map(({ rowIndex, ruleId, severity }) => ({
      rowIndex,
      ruleId,
      severity,
    })),
    [
      {
        rowIndex: 2,
        ruleId: "required-name",
        severity: "critical",
      },
      {
        rowIndex: 3,
        ruleId: "invalid-email",
        severity: "warning",
      },
      {
        rowIndex: 3,
        ruleId: "country-code-format",
        severity: "warning",
      },
      {
        rowIndex: 4,
        ruleId: "duplicate-vendor-id",
        severity: "critical",
      },
      {
        rowIndex: 5,
        ruleId: "duplicate-vendor-id",
        severity: "critical",
      },
    ],
  );

  assert.deepEqual(
    errorRows.map((row) => row.vendor_id),
    ["002", "V-004", "v-004"],
  );

  assert.deepEqual(
    cleanRows.map((row) => row.vendor_id),
    ["001", "003", "005"],
  );

  const reviewRows = new Set(
    issues
      .filter((issue) => issue.severity === "warning")
      .map((issue) => issue.rowIndex),
  );

  const rowsWithIssues = new Set(
    issues.map((issue) => issue.rowIndex),
  );

  assert.equal(errorRows.length, 3);
  assert.equal(reviewRows.size, 1);
  assert.equal(normalizedRows.length - rowsWithIssues.size, 2);

  assert.deepEqual(normalizedRows[0], {
    vendor_id: "001",
    name: "Acme Supply",
    email: "finance@acme.example",
    country: "NL",
    vat_number: "NL123456789B01",
  });
});

test("vendor rules: missing IDs and empty rows cannot export", () => {
  const { validationResult } = runValidationProfile(
    vendorValidationProfile,
    [
      {
        vendor_id: " ",
        name: "Missing ID",
      },
      {},
    ],
  );

  assert.deepEqual(
    validationResult.issues.map((issue) => issue.ruleId),
    ["required-vendor-id", "empty-row"],
  );

  assert.equal(validationResult.cleanRows.length, 0);
  assert.equal(validationResult.errorRows.length, 2);

  for (const issue of validationResult.issues) {
    assert.ok(issue.problem);
    assert.ok(issue.why);
    assert.ok(issue.fix);
  }
});

test("vendor boundaries: IDs stay textual and VAT is not fiscally validated", () => {
  const { normalizedRows, validationResult } = runValidationProfile(
    vendorValidationProfile,
    [
      {
        vendor_id: "001",
        name: "First",
        vat_number: " not-verified ",
      },
      {
        vendor_id: "1",
        name: "Second",
        country: "zz",
      },
    ],
  );

  assert.deepEqual(
    normalizedRows.map((row) => row.vendor_id),
    ["001", "1"],
  );

  assert.equal(normalizedRows[0].vat_number, "not-verified");
  assert.equal(normalizedRows[1].country, "ZZ");
  assert.deepEqual(validationResult.issues, []);
  assert.equal(validationResult.cleanRows.length, 2);
});

test("vendor repeatability: identical inputs repeat without changing the source", () => {
  const original = structuredClone(sourceRows);
  const first = runFixture();
  const second = runFixture();

  assert.deepEqual(first, second);
  assert.deepEqual(sourceRows, original);
  assert.equal(vendorValidationProfile.id, "vendor");
  assert.equal(vendorValidationProfile.version, "1.0.0");
});

test("vendor report: records the profile, worksheet, mapping and counts", () => {
  const { mapping } = runFixture();

  const input = {
    profile: vendorValidationProfile,
    fileName: "vendors.xlsx",
    sheetName: "Suppliers",
    mapping,
    counts: {
      total: 6,
      blocked: 3,
      needsReview: 1,
      ready: 2,
    },
  };

  const report = buildValidationReportRows(input);

  const valueFor = (field) =>
    report.find(
      (row) => row["DataPreflight field / metric"] === field,
    )?.["Source column / value"];

  assert.equal(valueFor("Profile ID"), "vendor");
  assert.equal(valueFor("Profile version"), "1.0.0");
  assert.equal(valueFor("Source filename"), "vendors.xlsx");
  assert.equal(valueFor("Source worksheet"), "Suppliers");
  assert.equal(valueFor("vendor_id"), "Supplier Number");
  assert.equal(valueFor("Blocked"), "3");
  assert.equal(valueFor("Needs review"), "1");
  assert.equal(valueFor("Ready"), "2");

  assert.deepEqual(report, buildValidationReportRows(input));
});