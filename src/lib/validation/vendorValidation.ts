import type { ParsedRow } from "@/lib/parseCsv";
import {
  isValidCountryCode,
  normalizeCode,
} from "@/lib/normalization/normalizeCode";
import {
  vendorProfile,
  type VendorField,
} from "@/lib/profiles/vendorProfile";
import type { ValidationProfile } from "@/lib/validation/validationProfile";

export type NormalizedVendorRow = ParsedRow & Record<VendorField, string>;

export type VendorIssue = {
  rowIndex: number;
  field: VendorField | "row";
  severity: "critical" | "warning";
  ruleId: string;
  problem: string;
  why: string;
  fix: string;
};

export type VendorValidationResult = {
  issues: VendorIssue[];
  cleanRows: NormalizedVendorRow[];
  errorRows: NormalizedVendorRow[];
};

function normalizeVendorRows(rows: ParsedRow[]): NormalizedVendorRow[] {
  return rows.map((row) => ({
    vendor_id: (row.vendor_id ?? "").trim(),
    name: (row.name ?? "").trim().replace(/\s+/g, " "),
    email: (row.email ?? "").trim().toLowerCase(),
    country: normalizeCode(row.country),
    vat_number: (row.vat_number ?? "").trim(),
  }));
}

function validateVendorRows(
  rows: NormalizedVendorRow[],
): VendorValidationResult {
  const idCounts = new Map<string, number>();

  for (const row of rows) {
    const key = row.vendor_id.toUpperCase();

    if (key) {
      idCounts.set(key, (idCounts.get(key) ?? 0) + 1);
    }
  }

  const issues: VendorIssue[] = rows.flatMap((row, index) => {
    const rowIndex = index + 1;
    const rowIssues: VendorIssue[] = [];

    if (Object.values(row).every((value) => !value)) {
      const emptyIssue: VendorIssue = {
        rowIndex,
        field: "row",
        severity: "critical",
        ruleId: "empty-row",
        problem: "This vendor row is empty.",
        why: "An empty row cannot become a useful supplier record.",
        fix: "Remove the empty row from the source file.",
      };

      return [emptyIssue];
    }

    if (!row.vendor_id) {
      rowIssues.push({
        rowIndex,
        field: "vendor_id",
        severity: "critical",
        ruleId: "required-vendor-id",
        problem: "Vendor ID is missing.",
        why: "A stable identifier is needed to distinguish supplier records in this profile.",
        fix: "Add a vendor ID to the source record.",
      });
    } else if ((idCounts.get(row.vendor_id.toUpperCase()) ?? 0) > 1) {
      rowIssues.push({
        rowIndex,
        field: "vendor_id",
        severity: "critical",
        ruleId: "duplicate-vendor-id",
        problem: "Vendor ID appears more than once in this file.",
        why: "Duplicate identifiers can cause the wrong supplier to be created or updated.",
        fix: "Confirm whether these are duplicates and assign unique IDs where needed.",
      });
    }

    if (!row.name) {
      rowIssues.push({
        rowIndex,
        field: "name",
        severity: "critical",
        ruleId: "required-name",
        problem: "Vendor name is missing.",
        why: "A name is required by this vendor validation profile.",
        fix: "Add the supplier name to the source record.",
      });
    }

    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      rowIssues.push({
        rowIndex,
        field: "email",
        severity: "warning",
        ruleId: "invalid-email",
        problem: "Email address has an invalid format.",
        why: "Contact and purchasing messages may not reach this supplier.",
        fix: "Check the email address in the source record.",
      });
    }

    if (row.country && !isValidCountryCode(row.country)) {
      rowIssues.push({
        rowIndex,
        field: "country",
        severity: "warning",
        ruleId: "country-code-format",
        problem: "Country code must have two letters.",
        why: "The current profile checks the two-letter format, not whether the country code exists.",
        fix: "Check the country value and use a two-letter code.",
      });
    }

    return rowIssues;
  });

  const blockedRows = new Set(
    issues
      .filter((issue) => issue.severity === "critical")
      .map((issue) => issue.rowIndex),
  );

  return {
    issues,
    cleanRows: rows.filter((_, index) => !blockedRows.has(index + 1)),
    errorRows: rows.filter((_, index) => blockedRows.has(index + 1)),
  };
}

export const vendorValidationProfile: ValidationProfile<
  VendorField,
  NormalizedVendorRow,
  VendorValidationResult
> = {
  ...vendorProfile,
  version: "1.0.0",
  normalizeRows: normalizeVendorRows,
  validateRows: validateVendorRows,
};