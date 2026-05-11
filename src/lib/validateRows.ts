import type { CsvRow } from "@/lib/parseCsv";

export type Severity = "critical" | "warning";

export type BusinessRisk =
  | "import_failure"
  | "financial_reporting"
  | "tax_risk"
  | "workflow_inconsistency"
  | "duplicate_risk"
  | "data_quality"
  | "payment_terms"
  | "regional_compliance";

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
    | "invalid-invoice-date"
    | "invalid-due-date"
    | "due-before-invoice-date"
    | "missing-currency"
    | "invalid-currency"
    | "missing-country"
    | "invalid-country"
    | "missing-expected-field";
  problem: string;
  why: string;
  fix: string;
  severity: Severity;
  risk: BusinessRisk;
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
        risk: "import_failure",
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
          risk: "import_failure",
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
        risk: "workflow_inconsistency",
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
        risk: "financial_reporting",
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
        risk: "tax_risk",
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
        risk: "financial_reporting",
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
        risk: "tax_risk",
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
        risk: "tax_risk",
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
          risk: "tax_risk",
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
        risk: "duplicate_risk",
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
        risk: "workflow_inconsistency",
      });
    }

    if (!row.country?.trim()) {
      issues.push({
        rowIndex,
        field: "country",
        type: "missing-country",
        problem: "Country is missing.",
        why: "Country helps determine tax handling, currency expectations, and import routing.",
        fix: "Add a valid country code such as NL, DE, or FR.",
        severity: "warning",
        risk: "regional_compliance",
      });
    }

    if (row.country && !isValidCountryCode(row.country)) {
      issues.push({
        rowIndex,
        field: "country",
        type: "invalid-country",
        problem: "Country code is invalid.",
        why: "Invalid country codes can cause incorrect tax handling or failed imports.",
        fix: "Use a two-letter country code such as NL, DE, or FR.",
        severity: "warning",
        risk: "regional_compliance",
      });
    }

    if (!row.currency?.trim()) {
      issues.push({
        rowIndex,
        field: "currency",
        type: "missing-currency",
        problem: "Currency is missing.",
        why: "Missing currency can make invoice totals ambiguous in downstream systems.",
        fix: "Add a valid currency code such as EUR, USD, or GBP.",
        severity: "warning",
        risk: "financial_reporting",
      });
    }

    if (row.currency && !isValidCurrencyCode(row.currency)) {
      issues.push({
        rowIndex,
        field: "currency",
        type: "invalid-currency",
        problem: "Currency code is invalid.",
        why: "Invalid currency codes can cause failed imports or incorrect financial reporting.",
        fix: "Use a three-letter currency code such as EUR, USD, or GBP.",
        severity: "warning",
        risk: "financial_reporting",
      });
    }

    if (row.invoice_date && !isValidIsoDate(row.invoice_date)) {
      issues.push({
        rowIndex,
        field: "invoice_date",
        type: "invalid-invoice-date",
        problem: "Invoice date is invalid.",
        why: "Invalid invoice dates can break reporting periods, payment terms, or accounting imports.",
        fix: "Use a valid date in YYYY-MM-DD format.",
        severity: "warning",
        risk: "financial_reporting",
      });
    }

    if (row.due_date && !isValidIsoDate(row.due_date)) {
      issues.push({
        rowIndex,
        field: "due_date",
        type: "invalid-due-date",
        problem: "Due date is invalid.",
        why: "Invalid due dates can break payment tracking and aging reports.",
        fix: "Use a valid date in YYYY-MM-DD format.",
        severity: "warning",
        risk: "payment_terms",
      });
    }

    if (
      row.invoice_date &&
      row.due_date &&
      isValidIsoDate(row.invoice_date) &&
      isValidIsoDate(row.due_date) &&
      row.due_date < row.invoice_date
    ) {
      issues.push({
        rowIndex,
        field: "due_date",
        type: "due-before-invoice-date",
        problem: "Due date is before the invoice date.",
        why: "A due date before the invoice date usually indicates incorrect payment terms or swapped date fields.",
        fix: "Check whether the invoice date and due date columns are mapped correctly.",
        severity: "warning",
        risk: "payment_terms",
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

function isValidCountryCode(value: string) {
  return /^[A-Z]{2}$/.test(value.trim());
}

function isValidCurrencyCode(value: string) {
  return /^[A-Z]{3}$/.test(value.trim());
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function countInvoiceNumbers(rows: CsvRow[]) {
  return rows.reduce<Record<string, number>>((accumulator, row) => {
    const invoiceNumber = row.invoice_number?.trim();

    if (!invoiceNumber) return accumulator;

    accumulator[invoiceNumber] = (invoiceNumberCounts(accumulator, invoiceNumber));

    return accumulator;
  }, {});
}

function invoiceNumberCounts(
  accumulator: Record<string, number>,
  invoiceNumber: string,
) {
  return (accumulator[invoiceNumber] ?? 0) + 1;
}