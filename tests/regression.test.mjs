import assert from "node:assert/strict";
import test from "node:test";

import { getMappingStatus } from "../src/lib/mappingStatus.ts";
import {
  downloadCsv,
  downloadErrorCsv,
  getExportBlockerSummaries,
  getExportSafetyMessage,
} from "../src/lib/exportData.ts";
import { parseCsvFile } from "../src/lib/parseCsv.ts";

const profile = {
  fields: [
    { key: "id", required: true },
    { key: "name", required: true },
    { key: "email", required: false },
  ],
};

function issue(overrides = {}) {
  return {
    rowIndex: 2,
    field: "id",
    severity: "critical",
    risk: "high",
    category: "completeness",
    type: "missing_value",
    problem: "Missing ID",
    why: "The record needs an identifier.",
    fix: "Add an ID in the source file.",
    ...overrides,
  };
}

function captureDownloads(t) {
  const downloads = [];
  const revokedUrls = [];
  const previousDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tag) {
        assert.equal(tag, "a");

        return {
          href: "",
          download: "",
          click() {
            downloads.at(-1).filename = this.download;
            downloads.at(-1).href = this.href;
          },
        };
      },
    },
  });

  t.after(() => {
    if (previousDocument) {
      Object.defineProperty(globalThis, "document", previousDocument);
    } else {
      delete globalThis.document;
    }
  });

  t.mock.method(URL, "createObjectURL", (blob) => {
    const url = `blob:test-${downloads.length}`;
    downloads.push({ blob, url });
    return url;
  });

  t.mock.method(URL, "revokeObjectURL", (url) => {
    revokedUrls.push(url);
  });

  return { downloads, revokedUrls };
}

async function csvText(download) {
  return Buffer.from(await download.blob.arrayBuffer()).toString("utf8");
}

test("mapping: unmapped optional fields do not block validation", () => {
  const status = getMappingStatus(profile, {
    id: "Customer ID",
    name: "Customer Name",
    email: "",
  });

  assert.equal(status.mappingReady, true);
  assert.equal(status.mappedCount, 2);
  assert.deepEqual(status.missingRequiredFields, []);
  assert.deepEqual(status.duplicateMappedHeaders, []);
});

test("mapping: a missing required field blocks validation", () => {
  const status = getMappingStatus(profile, {
    id: "",
    name: "Customer Name",
    email: "Email",
  });

  assert.equal(status.mappingReady, false);
  assert.equal(status.hasIncompleteMapping, true);

  assert.deepEqual(
    status.missingRequiredFields.map((field) => field.key),
    ["id"],
  );
});

test("mapping: duplicate assignments also block optional fields", () => {
  const status = getMappingStatus(profile, {
    id: "Customer ID",
    name: "Customer Name",
    email: "Customer Name",
  });

  assert.equal(status.hasIncompleteMapping, false);
  assert.equal(status.hasDuplicateMappings, true);
  assert.equal(status.mappingReady, false);
  assert.deepEqual(status.duplicateMappedHeaders, ["Customer Name"]);
});

test("mapping: correcting an invalid assignment restores readiness", () => {
  const mapping = {
    id: "Customer ID",
    name: "Customer ID",
    email: "",
  };

  assert.equal(getMappingStatus(profile, mapping).mappingReady, false);

  const corrected = { ...mapping, name: "Customer Name" };

  assert.equal(getMappingStatus(profile, corrected).mappingReady, true);
  assert.equal(mapping.name, "Customer ID");
});

test("export guidance: invalid mappings take priority over available rows", () => {
  const base = {
    hasIncompleteMapping: false,
    hasDuplicateMappings: false,
    cleanRowCount: 3,
    issues: [],
  };

  assert.match(
    getExportSafetyMessage({ ...base, hasIncompleteMapping: true }),
    /Export is unavailable.*required fields/i,
  );

  assert.match(
    getExportSafetyMessage({ ...base, hasDuplicateMappings: true }),
    /Export is unavailable.*multiple fields/i,
  );

  assert.match(
    getExportSafetyMessage({ ...base, cleanRowCount: 0 }),
    /No rows without blockers/i,
  );
});

test("export guidance: warnings stay included without promising ERP acceptance", () => {
  const base = {
    hasIncompleteMapping: false,
    hasDuplicateMappings: false,
    cleanRowCount: 2,
  };

  const mixed = getExportSafetyMessage({
    ...base,
    issues: [issue(), issue({ severity: "warning" })],
  });

  assert.match(mixed, /Blocked rows are excluded/i);
  assert.match(mixed, /warning rows remain included/i);

  const warningsOnly = getExportSafetyMessage({
    ...base,
    issues: [issue({ severity: "warning" })],
  });

  assert.match(warningsOnly, /includes warning rows/i);

  const passed = getExportSafetyMessage({
    ...base,
    issues: [],
  });

  assert.match(passed, /passed the current profile checks/i);
  assert.match(passed, /does not guarantee acceptance/i);
});

test("blocker summary: groups critical issues and excludes warnings", () => {
  const summaries = getExportBlockerSummaries([
    issue(),
    issue({ rowIndex: 3 }),
    issue({
      severity: "warning",
      field: "email",
      type: "invalid_email",
    }),
  ]);

  assert.equal(summaries.length, 1);
  assert.equal(summaries[0].count, 2);
  assert.equal(summaries[0].severity, "critical");
  assert.equal(summaries[0].field, "id");
});

test("row CSV: preserves IDs, escapes values, omits internal keys and repeats exactly", async (t) => {
  const { downloads, revokedUrls } = captureDownloads(t);

  const rows = [
    {
      id: "001",
      name: 'Acme; "North"',
      normalized_invoice_key: "internal-key",
    },
    {
      id: "002",
      name: "Second",
      note: "Extra field",
    },
  ];

  downloadCsv("rows.csv", rows);
  downloadCsv("rows.csv", rows);

  assert.equal(downloads.length, 2);

  const first = await csvText(downloads[0]);
  const second = await csvText(downloads[1]);

  assert.equal(first, second);

  assert.equal(
    first,
    '\uFEFF"id";"name";"note"\n"001";"Acme; ""North""";""\n"002";"Second";"Extra field"',
  );

  assert.equal(downloads[0].filename, "rows.csv");
  assert.equal(downloads[0].href, downloads[0].url);
  assert.equal(downloads[0].blob.type, "text/csv;charset=utf-8");

  assert.deepEqual(
    revokedUrls,
    downloads.map((download) => download.url),
  );
});

test("issue CSV: distinguishes blocked records from review warnings", async (t) => {
  const { downloads } = captureDownloads(t);

  downloadErrorCsv("issues.csv", [
    issue(),
    issue({
      rowIndex: 3,
      severity: "warning",
      field: "email",
      type: "invalid_email",
    }),
  ]);

  assert.equal(downloads.length, 1);

  const csv = await csvText(downloads[0]);
  const lines = csv.split("\n");

  assert.match(lines[0], /"export_decision"$/);
  assert.match(lines[1], /"excluded_from_clean_export"$/);
  assert.match(lines[2], /"included_with_review_warning"$/);
});

test("downloads: empty row and issue collections do not create files", (t) => {
  const { downloads } = captureDownloads(t);

  downloadCsv("empty-rows.csv", []);
  downloadErrorCsv("empty-issues.csv", []);

  assert.equal(downloads.length, 0);
});

test("CSV input: zero-byte files have a specific recoverable error", async () => {
  await assert.rejects(
    parseCsvFile(
      new File([], "empty.csv", {
        type: "text/csv",
      }),
    ),
    {
      message:
        "This file is empty. Upload a file containing column headers and data.",
    },
  );
});