import type { CsvRow } from "@/lib/parseCsv";
import {
  isValidCountryCode,
  isValidCurrencyCode,
} from "@/lib/normalization/normalizeCode";
import {
  isValidIsoDate,
  parseIsoDate,
} from "@/lib/normalization/normalizeDate";
import {
  normalizeInvoiceRow,
  type NormalizedInvoiceRow,
} from "@/lib/normalization/normalizeInvoiceRow";
import { parseNormalizedNumber } from "@/lib/normalization/normalizeNumber";
import {
  invoiceAllowedStatuses,
  invoiceProfile,
} from "@/lib/profiles/invoiceProfile";

export type Severity = "critical" | "warning";

export type IssueCategory =
  | "required_data"
  | "contact_data"
  | "financial"
  | "tax"
  | "duplicates"
  | "workflow"
  | "regional"
  | "dates"
  | "row_quality";

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
  category: IssueCategory;
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

type InvoiceValidationContext = {
  rows: CsvRow[];
  row: CsvRow;
  normalizedRow: NormalizedInvoiceRow;
  rowIndex: number;
  invoiceNumberCounts: Record<string, number>;
};

type InvoiceValidationRule = (
  context: InvoiceValidationContext,
) => ValidationIssue[];

const requiredFields = invoiceProfile.fields
  .filter((field) => field.required)
  .map((field) => field.key);

const allowedStatuses = [...invoiceAllowedStatuses];

const invoiceValidationRules: InvoiceValidationRule[] = [
  validateEmptyRow,
  validateRequiredFields,
  validateEmail,
  validateAmount,
  validateVat,
  validateVatConsistency,
  validateDuplicateInvoiceNumber,
  validateStatus,
  validateCountry,
  validateCurrency,
  validateInvoiceDate,
  validateDueDate,
  validatePaymentTerms,
];

export function validateRows(rows: CsvRow[]): ValidationResult {
  const normalizedRows = rows.map(normalizeInvoiceRow);
  const invoiceNumberCounts = countInvoiceNumbers(normalizedRows);
  const issues: ValidationIssue[] = [];

  rows.forEach((row, index) => {
    const context: InvoiceValidationContext = {
      rows,
      row,
      normalizedRow: normalizedRows[index],
      rowIndex: index + 1,
      invoiceNumberCounts,
    };

    const rowIssues = invoiceValidationRules.flatMap((rule) => rule(context));
    issues.push(...rowIssues);
  });

  const rowsWithCriticalIssues = new Set(
    issues
      .filter((issue) => issue.severity === "critical")
      .map((issue) => issue.rowIndex),
  );

  return {
    issues,
    cleanRows: rows.filter(
      (_, index) => !rowsWithCriticalIssues.has(index + 1),
    ),
    errorRows: rows.filter((_, index) => rowsWithCriticalIssues.has(index + 1)),
  };
}

function validateEmptyRow({
  row,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  if (!isEmptyRow(row)) return [];

  return [
    createIssue({
      rowIndex,
      field: "row",
      type: "empty-row",
      category: "row_quality",
      problem: "This row is empty.",
      why: "Empty rows can create failed imports, blank records, or meaningless entries in downstream systems.",
      fix: "Remove the empty row from the CSV before importing.",
      severity: "critical",
      risk: "import_failure",
    }),
  ];
}

function validateRequiredFields({
  row,
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  if (isEmptyRow(row)) return [];

  return requiredFields
    .filter((field) => !normalizedRow[field])
    .map((field) =>
      createIssue({
        rowIndex,
        field,
        type: "required",
        category: "required_data",
        problem: `${formatFieldName(field)} is missing.`,
        why: "This field is required to safely identify, validate, and import the invoice record.",
        fix: `Add a value for ${formatFieldName(field)} before exporting the clean data.`,
        severity: "critical",
        risk: "import_failure",
      }),
    );
}

function validateEmail({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  if (!normalizedRow.email || isValidEmail(normalizedRow.email)) return [];

  return [
    createIssue({
      rowIndex,
      field: "email",
      type: "email",
      category: "contact_data",
      problem: "Email address is invalid.",
      why: "Invalid email addresses can break billing communication, invoice routing, customer matching, or automated reminders.",
      fix: "Use a valid email address such as finance@example.com.",
      severity: "critical",
      risk: "workflow_inconsistency",
    }),
  ];
}

function validateAmount({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  const amount = parseNormalizedNumber(normalizedRow.amount);
  const issues: ValidationIssue[] = [];

  if (normalizedRow.amount && amount === null) {
    issues.push(
      createIssue({
        rowIndex,
        field: "amount",
        type: "number",
        category: "financial",
        problem: "Amount is not a valid number.",
        why: "Accounting and reporting systems need numeric invoice amounts to calculate totals, balances, and revenue correctly.",
        fix: "Remove currency symbols, text, or invalid formatting and use a numeric value.",
        severity: "critical",
        risk: "financial_reporting",
      }),
    );
  }

  if (amount !== null && amount <= 0) {
    issues.push(
      createIssue({
        rowIndex,
        field: "amount",
        type: "amount-not-positive",
        category: "financial",
        problem: "Amount is zero or negative.",
        why: "A non-positive invoice amount may indicate a credit note, refund, test record, or incorrect export.",
        fix: "Verify whether this row is a normal invoice, credit note, refund, or corrected amount.",
        severity: "warning",
        risk: "financial_reporting",
      }),
    );
  }

  return issues;
}

function validateVat({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  const vat = parseNormalizedNumber(normalizedRow.vat);
  const issues: ValidationIssue[] = [];

  if (normalizedRow.vat && vat === null) {
    issues.push(
      createIssue({
        rowIndex,
        field: "vat",
        type: "number",
        category: "tax",
        problem: "VAT is not a valid number.",
        why: "VAT must be numeric so tax totals, declarations, and invoice totals can be calculated correctly.",
        fix: "Remove currency symbols, text, or invalid formatting and use a numeric VAT value.",
        severity: "critical",
        risk: "tax_risk",
      }),
    );
  }

  if (vat !== null && vat < 0) {
    issues.push(
      createIssue({
        rowIndex,
        field: "vat",
        type: "vat-negative",
        category: "tax",
        problem: "VAT is negative.",
        why: "Negative VAT can indicate a refund, credit note, incorrectly mapped VAT column, or reversed transaction.",
        fix: "Check whether the VAT value is correct or whether this row should be handled as a separate credit/refund flow.",
        severity: "warning",
        risk: "tax_risk",
      }),
    );
  }

  return issues;
}

function validateVatConsistency({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  const amount = parseNormalizedNumber(normalizedRow.amount);
  const vat = parseNormalizedNumber(normalizedRow.vat);
  const issues: ValidationIssue[] = [];

  if (amount === null || vat === null || amount <= 0) return issues;

  if (vat > amount) {
    issues.push(
      createIssue({
        rowIndex,
        field: "vat",
        type: "vat-higher-than-amount",
        category: "tax",
        problem: "VAT is higher than the invoice amount.",
        why: "VAT higher than the invoice amount is usually invalid and may cause accounting import errors or incorrect tax reporting.",
        fix: "Check whether the amount and VAT columns were swapped, exported incorrectly, or mapped to the wrong fields.",
        severity: "warning",
        risk: "tax_risk",
      }),
    );
  }

  const vatRate = vat / amount;

  if (vatRate > 0.3) {
    issues.push(
      createIssue({
        rowIndex,
        field: "vat",
        type: "suspicious-vat-rate",
        category: "tax",
        problem: "VAT rate looks unusually high.",
        why: "A VAT rate above 30% is uncommon for standard invoice imports and may indicate incorrect data, wrong mapping, or a total/VAT mismatch.",
        fix: "Verify the VAT amount and check whether the amount column includes or excludes VAT.",
        severity: "warning",
        risk: "tax_risk",
      }),
    );
  }

  return issues;
}

function validateDuplicateInvoiceNumber({
  normalizedRow,
  rowIndex,
  invoiceNumberCounts,
}: InvoiceValidationContext): ValidationIssue[] {
  const invoiceNumber = normalizedRow.normalized_invoice_key;

  if (!invoiceNumber || invoiceNumberCounts[invoiceNumber] <= 1) return [];

  return [
    createIssue({
      rowIndex,
      field: "invoice_number",
      type: "duplicate-invoice-number",
      category: "duplicates",
      problem: "Invoice number appears more than once.",
      why: "Duplicate invoice numbers can create duplicate records, overwrite existing invoices, or cause reconciliation problems.",
      fix: "Remove the duplicate row or assign a unique invoice number before exporting.",
      severity: "critical",
      risk: "duplicate_risk",
    }),
  ];
}

function validateStatus({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  const status = normalizedRow.status;

  if (!status || allowedStatuses.includes(status as never)) return [];

  return [
    createIssue({
      rowIndex,
      field: "status",
      type: "invalid-status",
      category: "workflow",
      problem: "Invoice status is not recognized.",
      why: "Unexpected statuses can fail imports or create inconsistent workflow states in the target system.",
      fix: `Use one of: ${allowedStatuses.join(", ")}.`,
      severity: "warning",
      risk: "workflow_inconsistency",
    }),
  ];
}

function validateCountry({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  const country = normalizedRow.country;

  if (!country) {
    return [
      createIssue({
        rowIndex,
        field: "country",
        type: "missing-country",
        category: "regional",
        problem: "Country is missing.",
        why: "Country helps determine tax handling, currency expectations, regional rules, and import routing.",
        fix: "Add a valid two-letter country code such as NL, DE, or FR.",
        severity: "warning",
        risk: "regional_compliance",
      }),
    ];
  }

  if (isValidCountryCode(country)) return [];

  return [
    createIssue({
      rowIndex,
      field: "country",
      type: "invalid-country",
      category: "regional",
      problem: "Country code is invalid.",
      why: "Invalid country codes can cause incorrect tax handling, failed imports, or wrong regional classification.",
      fix: "Use a two-letter uppercase country code such as NL, DE, or FR.",
      severity: "warning",
      risk: "regional_compliance",
    }),
  ];
}

function validateCurrency({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  const currency = normalizedRow.currency;

  if (!currency) {
    return [
      createIssue({
        rowIndex,
        field: "currency",
        type: "missing-currency",
        category: "financial",
        problem: "Currency is missing.",
        why: "Missing currency makes invoice totals ambiguous, especially when data is imported into financial or reporting systems.",
        fix: "Add a valid three-letter currency code such as EUR, USD, or GBP.",
        severity: "warning",
        risk: "financial_reporting",
      }),
    ];
  }

  if (isValidCurrencyCode(currency)) return [];

  return [
    createIssue({
      rowIndex,
      field: "currency",
      type: "invalid-currency",
      category: "financial",
      problem: "Currency code is invalid.",
      why: "Invalid currency codes can cause failed imports, incorrect conversion, or unreliable financial reporting.",
      fix: "Use a three-letter uppercase currency code such as EUR, USD, or GBP.",
      severity: "warning",
      risk: "financial_reporting",
    }),
  ];
}

function validateInvoiceDate({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  const invoiceDate = normalizedRow.invoice_date;

  if (!invoiceDate || isValidIsoDate(invoiceDate)) return [];

  return [
    createIssue({
      rowIndex,
      field: "invoice_date",
      type: "invalid-invoice-date",
      category: "dates",
      problem: "Invoice date is invalid.",
      why: "Invalid invoice dates can break reporting periods, payment terms, accounting imports, or aging analysis.",
      fix: "Use a valid date in YYYY-MM-DD format.",
      severity: "warning",
      risk: "financial_reporting",
    }),
  ];
}

function validateDueDate({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  const dueDate = normalizedRow.due_date;

  if (!dueDate || isValidIsoDate(dueDate)) return [];

  return [
    createIssue({
      rowIndex,
      field: "due_date",
      type: "invalid-due-date",
      category: "dates",
      problem: "Due date is invalid.",
      why: "Invalid due dates can break payment tracking, reminders, cash-flow planning, and aging reports.",
      fix: "Use a valid date in YYYY-MM-DD format.",
      severity: "warning",
      risk: "payment_terms",
    }),
  ];
}

function validatePaymentTerms({
  normalizedRow,
  rowIndex,
}: InvoiceValidationContext): ValidationIssue[] {
  const invoiceDate = normalizedRow.invoice_date;
  const dueDate = normalizedRow.due_date;

  if (
    !invoiceDate ||
    !dueDate ||
    !isValidIsoDate(invoiceDate) ||
    !isValidIsoDate(dueDate)
  ) {
    return [];
  }

  if (parseIsoDate(dueDate).getTime() >= parseIsoDate(invoiceDate).getTime()) {
    return [];
  }

  return [
    createIssue({
      rowIndex,
      field: "due_date",
      type: "due-before-invoice-date",
      category: "dates",
      problem: "Due date is before the invoice date.",
      why: "A due date before the invoice date usually indicates incorrect payment terms, swapped date fields, or invalid source data.",
      fix: "Check whether invoice date and due date are mapped correctly and correct the payment terms if needed.",
      severity: "warning",
      risk: "payment_terms",
    }),
  ];
}

function createIssue(issue: ValidationIssue): ValidationIssue {
  return issue;
}

function isEmptyRow(row: CsvRow) {
  return Object.values(row).every((value) => !value?.trim());
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function countInvoiceNumbers(rows: NormalizedInvoiceRow[]) {
  return rows.reduce<Record<string, number>>((accumulator, row) => {
    const invoiceNumber = row.normalized_invoice_key;

    if (!invoiceNumber) return accumulator;

    accumulator[invoiceNumber] = (accumulator[invoiceNumber] ?? 0) + 1;

    return accumulator;
  }, {});
}

function formatFieldName(field: string) {
  return field.replaceAll("_", " ");
}
