import type { ParsedRow } from "@/lib/parseCsv";
import {
  isValidCountryCode,
  normalizeCode,
} from "@/lib/normalization/normalizeCode";
import {
  customerProfile,
  type CustomerField,
} from "@/lib/profiles/customerProfile";
import type { ValidationProfile } from "@/lib/validation/validationProfile";

export type NormalizedCustomerRow = ParsedRow & Record<CustomerField, string>;

export type CustomerIssue = {
  rowIndex: number;
  field: CustomerField | "row";
  severity: "critical" | "warning";
  ruleId: string;
  problem: string;
  why: string;
  fix: string;
};

export type CustomerValidationResult = {
  issues: CustomerIssue[];
  cleanRows: NormalizedCustomerRow[];
  errorRows: NormalizedCustomerRow[];
};

function normalizeCustomerRows(rows: ParsedRow[]): NormalizedCustomerRow[] {
  return rows.map((row) => ({
    customer_id: (row.customer_id ?? "").trim(),
    name: (row.name ?? "").trim().replace(/\s+/g, " "),
    email: (row.email ?? "").trim().toLowerCase(),
    country: normalizeCode(row.country),
    vat_number: (row.vat_number ?? "").trim(),
  }));
}

function validateCustomerRows(
  rows: NormalizedCustomerRow[],
): CustomerValidationResult {
  const idCounts = new Map<string, number>();

  for (const row of rows) {
    const key = row.customer_id.toUpperCase();
    if (key) idCounts.set(key, (idCounts.get(key) ?? 0) + 1);
  }

  const issues: CustomerIssue[] = rows.flatMap((row, index) => {
    const rowIndex = index + 1;
    const rowIssues: CustomerIssue[] = [];
    const idKey = row.customer_id.toUpperCase();

    if (Object.values(row).every((value) => !value)) {
      const emptyIssue: CustomerIssue = {
        rowIndex,
        field: "row",
        severity: "critical",
        ruleId: "empty-row",
        problem: "This customer row is empty.",
        why: "An empty row cannot become a useful customer record.",
        fix: "Remove the empty row from the source file.",
      };
      return [emptyIssue];
    }

    if (!row.customer_id) {
      rowIssues.push({
        rowIndex,
        field: "customer_id",
        severity: "critical",
        ruleId: "required-customer-id",
        problem: "Customer ID is missing.",
        why: "A stable identifier is needed to distinguish customer records in this profile.",
        fix: "Add a customer ID to the source record.",
      });
    } else if ((idCounts.get(idKey) ?? 0) > 1) {
      rowIssues.push({
        rowIndex,
        field: "customer_id",
        severity: "critical",
        ruleId: "duplicate-customer-id",
        problem: "Customer ID appears more than once in this file.",
        why: "Duplicate identifiers can cause the wrong customer to be created or updated.",
        fix: "Confirm whether these are duplicates and assign unique IDs where needed.",
      });
    }

    if (!row.name) {
      rowIssues.push({
        rowIndex,
        field: "name",
        severity: "critical",
        ruleId: "required-name",
        problem: "Customer name is missing.",
        why: "A name is required by this customer validation profile.",
        fix: "Add the customer name to the source record.",
      });
    }

    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      rowIssues.push({
        rowIndex,
        field: "email",
        severity: "warning",
        ruleId: "invalid-email",
        problem: "Email address has an invalid format.",
        why: "Contact and billing messages may not reach this customer.",
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
        why: "The current profile expects a two-letter country code.",
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

export const customerValidationProfile: ValidationProfile<
  CustomerField,
  NormalizedCustomerRow,
  CustomerValidationResult
> = {
  ...customerProfile,
  version: "1.0.0",
  normalizeRows: normalizeCustomerRows,
  validateRows: validateCustomerRows,
};