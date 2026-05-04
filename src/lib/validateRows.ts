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
    | "amount-not-positive"
    | "vat-negative"
    | "suspicious-vat-rate"
    | "duplicate-invoice-number"
    | "invalid-status"
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

const allowedStatuses = ["ready", "paid", "draft", "pending", "sent"];

export function validateRows(rows: CsvRow[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const cleanRows: CsvRow[] = [];
  const errorRows: CsvRow[] = [];
  const duplicateInvoiceNumbers = findDuplicateInvoiceNumbers(rows);

  rows.forEach((row, index) => {
    const rowIssues = validateRow(row, index + 1, duplicateInvoiceNumbers);

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

function validateRow(
  row: CsvRow,
  rowIndex: number,
  duplicateInvoiceNumbers: Set<string>,
): ValidationIssue[] {
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

  validateInvoiceNumber(row, rowIndex, duplicateInvoiceNumbers, issues);
  validateAmountAndVat(row, rowIndex, issues);
  validateStatus(row, rowIndex, issues);

  return issues;
}

function validateInvoiceNumber(
  row: CsvRow,
  rowIndex: number,
  duplicateInvoiceNumbers: Set<string>,
  issues: ValidationIssue[],
) {
  const invoiceNumber = row.invoice_number?.trim();

  if (!invoiceNumber) return;

  if (duplicateInvoiceNumbers.has(invoiceNumber)) {
    issues.push({
      rowIndex,
      field: "invoice_number",
      type: "duplicate-invoice-number",
      problem: "Duplicate invoice number",
      why: `Invoice number "${invoiceNumber}" appears more than once. Accounting systems usually require invoice numbers to be unique.`,
      fix: "Use a unique invoice number or remove the duplicate row.",
      severity: "critical",
    });
  }
}

function validateAmountAndVat(
  row: CsvRow,
  rowIndex: number,
  issues: ValidationIssue[],
) {
  const amount = Number(row.amount);
  const vat = Number(row.vat);

  const hasValidAmount = row.amount && !Number.isNaN(amount);
  const hasValidVat = row.vat && !Number.isNaN(vat);

  if (hasValidAmount && amount <= 0) {
    issues.push({
      rowIndex,
      field: "amount",
      type: "amount-not-positive",
      problem: "Amount is not positive",
      why: `Invoice amount ${amount} is zero or below. Regular invoices usually require a positive amount.`,
      fix: "Use a positive invoice amount, or check whether this row is a credit/refund case.",
      severity: "warning",
    });
  }

  if (hasValidVat && vat < 0) {
    issues.push({
      rowIndex,
      field: "vat",
      type: "vat-negative",
      problem: "VAT is negative",
      why: `VAT value ${vat} is below zero, which is unusual for normal invoice imports.`,
      fix: "Check whether this is a credit invoice or correct the VAT value.",
      severity: "warning",
    });
  }

  if (hasValidAmount && hasValidVat && vat > amount) {
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

  if (hasValidAmount && hasValidVat && amount > 0) {
    const vatRate = vat / amount;

    if (vatRate > 0.3) {
      issues.push({
        rowIndex,
        field: "vat",
        type: "suspicious-vat-rate",
        problem: "Suspicious VAT rate",
        why: `VAT is approximately ${(vatRate * 100).toFixed(
          1,
        )}% of the invoice amount, which is higher than expected for most invoice data.`,
        fix: "Check whether the VAT amount is correct or whether amount already includes VAT.",
        severity: "warning",
      });
    }
  }
}

function validateStatus(
  row: CsvRow,
  rowIndex: number,
  issues: ValidationIssue[],
) {
  const status = row.status?.trim().toLowerCase();

  if (!status) return;

  if (!allowedStatuses.includes(status)) {
    issues.push({
      rowIndex,
      field: "status",
      type: "invalid-status",
      problem: "Unknown invoice status",
      why: `"${row.status}" is not one of the expected statuses: ${allowedStatuses.join(
        ", ",
      )}.`,
      fix: "Use a known status or remove this field from the export if it is not needed.",
      severity: "warning",
    });
  }
}

function findDuplicateInvoiceNumbers(rows: CsvRow[]) {
  const seenInvoiceNumbers = new Set<string>();
  const duplicateInvoiceNumbers = new Set<string>();

  rows.forEach((row) => {
    const invoiceNumber = row.invoice_number?.trim();

    if (!invoiceNumber) return;

    if (seenInvoiceNumbers.has(invoiceNumber)) {
      duplicateInvoiceNumbers.add(invoiceNumber);
    }

    seenInvoiceNumbers.add(invoiceNumber);
  });

  return duplicateInvoiceNumbers;
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
