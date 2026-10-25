import { normalizeUnit, type UnitReference } from "@/lib/unitReference";
import type { ParsedRow } from "@/lib/parseCsv";
import { productProfile, type ProductField } from "@/lib/profiles/productProfile";
import type { ValidationProfile } from "@/lib/validation/validationProfile";

export type NormalizedProductRow = ParsedRow & Record<ProductField, string>;
export type ProductIssue = {
  rowIndex: number;
  field: ProductField | "row";
  severity: "critical" | "warning";
  ruleId: string;
  problem: string;
  why: string;
  fix: string;
};
export type ProductValidationResult = {
  issues: ProductIssue[];
  cleanRows: NormalizedProductRow[];
  errorRows: NormalizedProductRow[];
};

function normalizeProductRows(rows: ParsedRow[]): NormalizedProductRow[] {
  return rows.map((row) => ({
    product_id: (row.product_id ?? "").trim(),
    description: (row.description ?? "").trim().replace(/\s+/g, " "),
    base_unit: (row.base_unit ?? "").trim(),
  }));
}

function validateProductRows(rows: NormalizedProductRow[], reference?: UnitReference | null): ProductValidationResult {
  const allowedUnits = reference ? new Set(reference.allowedUnits) : null;
  const idCounts = new Map<string, number>();
  for (const row of rows) {
    const key = row.product_id.toUpperCase();
    if (key) idCounts.set(key, (idCounts.get(key) ?? 0) + 1);
  }

  const issues: ProductIssue[] = rows.flatMap((row, index) => {
    const rowIndex = index + 1;
    if (Object.values(row).every((value) => !value)) {
      return [{ rowIndex, field: "row", severity: "critical", ruleId: "empty-row",
        problem: "This product row is empty.",
        why: "An empty row cannot become a useful product record.",
        fix: "Remove the empty row from the source file." }];
    }
    const rowIssues: ProductIssue[] = [];
    if (!row.product_id) {
      rowIssues.push({ rowIndex, field: "product_id", severity: "critical", ruleId: "required-product-id",
        problem: "Product ID is missing.",
        why: "A stable identifier is required to distinguish product and material records.",
        fix: "Add a product ID to the source record." });
    } else if ((idCounts.get(row.product_id.toUpperCase()) ?? 0) > 1) {
      rowIssues.push({ rowIndex, field: "product_id", severity: "critical", ruleId: "duplicate-product-id",
        problem: "Product ID appears more than once in this file.",
        why: "Duplicate identifiers can cause the wrong product to be created or updated.",
        fix: "Check all records with this ID and assign unique IDs where needed." });
    }
    if (!row.description) {
      rowIssues.push({ rowIndex, field: "description", severity: "critical", ruleId: "required-description",
        problem: "Product description is missing.",
        why: "A description is required by this product validation profile.",
        fix: "Add the product or material description in the source file." });
    }
    if (!row.base_unit) {
      rowIssues.push({ rowIndex, field: "base_unit", severity: "critical", ruleId: "required-base-unit",
        problem: "Base unit is missing.",
        why: "A base unit is required to describe the quantity of this product.",
        fix: "Add the base unit used by your target ERP, such as KG or EA." });
    }
    if (row.base_unit && allowedUnits && !allowedUnits.has(normalizeUnit(row.base_unit))) {
      rowIssues.push({ rowIndex, field: "base_unit", severity: "critical", ruleId: "unknown-base-unit",
        problem: "Base unit is not in the active allowed-unit list.",
        why: "The uploaded reference list does not allow this unit for the current validation.",
        fix: "Correct the source unit or upload the correct allowed-unit list. Units are not automatically converted." });
    }
    return rowIssues;
  });
  const blockedRows = new Set(issues.filter((issue) => issue.severity === "critical").map((issue) => issue.rowIndex));
  return {
    issues,
    cleanRows: rows.filter((_, index) => !blockedRows.has(index + 1)),
    errorRows: rows.filter((_, index) => blockedRows.has(index + 1)),
  };
}

export const productValidationProfile: ValidationProfile<ProductField, NormalizedProductRow, ProductValidationResult> = {
  ...productProfile,
  version: "1.0.0",
  normalizeRows: normalizeProductRows,
  validateRows: validateProductRows,
};

export function runProductValidation(rows: ParsedRow[], reference?: UnitReference | null) {
  const normalizedRows = normalizeProductRows(rows);
  return { normalizedRows, validationResult: validateProductRows(normalizedRows, reference) };
}
