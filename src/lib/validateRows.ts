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

const requiredFields = [
  "invoice_number",
  "company",
  "email",
  "amount",
  "vat",
];

const allowedStatuses = ["ready", "paid", "draft", "pending", "sent"];

export function validateRows(rows: CsvRow[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const invoiceNumberCounts = countInvoiceNumbers(rows);

  rows.forEach((row, index) => {
    const rowIndex = index + 1;

    if (isEmptyRow(row)) {
      issues.push({
        rowIndex,
        field: "row",
        type: "empty-row",
        problem: "This row is empty.",
        why: "Empty rows can create failed imports or meaningless records in downstream systems.",
        fix: "Remove the empty row from the CSV before importing.",
        severity: "critical",
      });

      return;
    }

    requiredFields.forEach((field) => {
      if (!row[field]?.trim()) {
        issues.push({
          rowIndex,
          field,
          type: "required",
          problem: `${field} is missing.`,
          why: "Required invoice fields are needed to safely identify and import the invoice.",
          fix: `Add a value for ${field}.`,
          severity: "critical",
        });
      }
    });

    if (row.email && !isValidEmail(row.email)) {
      issues.push({
        rowIndex,
        field: "email",
        type: "email",
        problem: "Email address is invalid.",
        why: "Invalid email addresses can break billing communication, invoice routing, or customer matching.",
        fix: "Use a valid email address such as finance@example.com.",
        severity: "critical",
      });
    }

    const amount = parseNumber(row.amount);
    const vat = parseNumber(row.vat);

    if (row.amount && amount === null) {
      issues.push({
        rowIndex,
        field: "amount",
        type: "number",
        problem: "Amount is not a valid number.",
        why: "Accounting systems need numeric invoice amounts to calculate totals and balances.",
        fix: "Remove currency symbols or text and use a numeric value.",
        severity: "critical",
      });
    }

    if (row.vat && vat === null) {
      issues.push({
        rowIndex,
        field: "vat",
        type: "number",
        problem: "VAT is not a valid number.",
        why: "VAT must be numeric so tax totals can be calculated correctly.",
        fix: "Remove currency symbols or text and use a numeric VAT value.",
        severity: "critical",
      });
    }

    if (amount !== null && amount <= 0) {
      issues.push({
        rowIndex,
        field: "amount",
        type: "amount-not-positive",
        problem: "Amount is zero or negative.",
        why: "A non-positive invoice amount may indicate a credit note, refund, or incorrect export.",
        fix: "Verify whether this should be a normal invoice, credit note, or corrected amount.",
        severity: "warning",
      });
    }

    if (vat !== null && vat < 0) {
      issues.push({
        rowIndex,
        field: "vat",
        type: "vat-negative",
        problem: "VAT is negative.",
        why: "Negative VAT can indicate a refund, credit note, or incorrectly mapped VAT column.",
        fix: "Check whether the VAT value is correct or whether the invoice type should be handled separately.",
        severity: "warning",
      });
    }

    if (amount !== null && vat !== null && vat > amount) {
      issues.push({
        rowIndex,
        field: "vat",
        type: "vat-higher-than-amount",
        problem: "VAT is higher than the invoice amount.",
        why: "VAT higher than the invoice amount is usually invalid and may cause accounting import errors.",
        fix: "Check whether amount and VAT columns were swapped or exported incorrectly.",
        severity: "warning",
      });
    }

    if (amount !== null && vat !== null && amount > 0) {
      const vatRate = vat / amount;

      if (vatRate > 0.3) {
        issues.push({
          rowIndex,
          field: "vat",
          type: "suspicious-vat-rate",
          problem: "VAT rate looks unusually high.",
          why: "A VAT rate above 30% is uncommon for standard invoice imports and may indicate incorrect data.",
          fix: "Verify the VAT amount and check whether the amount column excludes or includes VAT.",
          severity: "warning",
        });
      }
    }

    if (
      row.invoice_number &&
      invoiceNumberCounts[row.invoice_number.trim()] > 1
    ) {
      issues.push({
        rowIndex,
        field: "invoice_number",
        type: "duplicate-invoice-number",
        problem: "Invoice number appears more than once.",
        why: "Duplicate invoice numbers can create duplicate records or overwrite existing invoices.",
        fix: "Remove the duplicate row or correct the invoice number.",
        severity: "critical",
      });
    }

    if (
      row.status &&
      !allowedStatuses.includes(row.status.trim().toLowerCase())
    ) {
      issues.push({
        rowIndex,
        field: "status",
        type: "invalid-status",
        problem: "Invoice status is not recognized.",
        why: "Unexpected statuses can fail imports or create inconsistent workflow states.",
        fix: `Use one of: ${allowedStatuses.join(", ")}.`,
        severity: "warning",
      });
    }
  });

  const rowsWithCriticalIssues = new Set(
    issues
      .filter((issue) => issue.severity === "critical")
      .map((issue) => issue.rowIndex),
  );

  return {
    issues,
    cleanRows: rows.filter((_, index) => !rowsWithCriticalIssues.has(index + 1)),
    errorRows: rows.filter((_, index) => rowsWithCriticalIssues.has(index + 1)),
  };
}

function isEmptyRow(row: CsvRow) {
  return Object.values(row).every((value) => !value?.trim());
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseNumber(value: string) {
  const cleanedValue = value
    .trim()
    .replaceAll("€", "")
    .replaceAll(" ", "")
    .replaceAll(",", ".");

  if (!cleanedValue) return null;

  const parsedValue = Number(cleanedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function countInvoiceNumbers(rows: CsvRow[]) {
  return rows.reduce<Record<string, number>>((accumulator, row) => {
    const invoiceNumber = row.invoice_number?.trim();

    if (!invoiceNumber) return accumulator;

    accumulator[invoiceNumber] = (accumulator[invoiceNumber] ?? 0) + 1;

    return accumulator;
  }, {});
}