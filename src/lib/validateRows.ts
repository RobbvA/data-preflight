import type { CsvRow } from "@/lib/parseCsv";

export type Severity = "critical" | "warning";

export type ValidationIssue = {
  rowIndex: number;
  field: string;
  type:
    | "required"
    | "email"
    | "number"
    | "empty-row"
    | "vat-higher-than-amount"
    | "missing-expected-field";
  problem: string;
  why: string;
  fix: string;
  severity: Severity;
};

export type ValidationResult = {
  issues: ValidationIssue[];
  cleanRows: CsvRow[];
  errorRows: CsvRow[];
};

const expectedInvoiceFields = [
  "invoice_number",
  "company",
  "email",
  "amount",
  "vat",
];

export function validateRows(rows: CsvRow[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const cleanRows: CsvRow[] = [];
  const errorRows: CsvRow[] = [];

  rows.forEach((row, index) => {
    const rowIssues = validateRow(row, index + 1);

    if (rowIssues.some((issue) => issue.severity === "critical")) {
      errorRows.push(row);
    } else {
      cleanRows.push(row);
    }

    issues.push(...rowIssues);
  });

  return {
    issues,
    cleanRows,
    errorRows,
  };
}

export function getMissingExpectedInvoiceFields(headers: string[]) {
  return expectedInvoiceFields.filter((field) => !headers.includes(field));
}

function validateRow(row: CsvRow, rowIndex: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const values = Object.values(row);
  const isEmptyRow = values.every((value) => value.trim() === "");

  if (isEmptyRow) {
    return [
      {
        rowIndex,
        field: "row",
        type: "empty-row",
        problem: "Empty row",
        why: "All selected fields in this row are empty.",
        fix: "Remove this row or provide values for the required fields.",
        severity: "critical",
      },
    ];
  }

  Object.entries(row).forEach(([field, value]) => {
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      issues.push({
        rowIndex,
        field,
        type: "required",
        problem: "Missing value",
        why: `The field "${field}" is empty, so this invoice may fail when imported into an accounting system.`,
        fix: `Add a value for "${field}" or deselect this field if it is not needed.`,
        severity: "critical",
      });

      return;
    }

    if (field.toLowerCase().includes("email") && !isValidEmail(trimmedValue)) {
      issues.push({
        rowIndex,
        field,
        type: "email",
        problem: "Invalid email",
        why: `"${trimmedValue}" does not match a valid email format.`,
        fix: "Use an email format like finance@example.com.",
        severity: "critical",
      });
    }

    if (isLikelyNumberField(field) && Number.isNaN(Number(trimmedValue))) {
      issues.push({
        rowIndex,
        field,
        type: "number",
        problem: "Invalid number",
        why: `"${trimmedValue}" cannot be converted into a number.`,
        fix: "Use only numeric values, for example 100 or 99.95.",
        severity: "critical",
      });
    }
  });

  const amount = Number(row.amount);
  const vat = Number(row.vat);

  if (
    row.amount &&
    row.vat &&
    !Number.isNaN(amount) &&
    !Number.isNaN(vat) &&
    vat > amount
  ) {
    issues.push({
      rowIndex,
      field: "vat",
      type: "vat-higher-than-amount",
      problem: "VAT is higher than amount",
      why: `VAT value ${vat} is higher than invoice amount ${amount}, which is usually incorrect.`,
      fix: "Check whether amount and VAT were entered in the correct fields.",
      severity: "warning",
    });
  }

  return issues;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLikelyNumberField(field: string) {
  const normalizedField = field.toLowerCase();

  return (
    normalizedField.includes("amount") ||
    normalizedField.includes("price") ||
    normalizedField.includes("total") ||
    normalizedField.includes("vat") ||
    normalizedField.includes("quantity")
  );
}
