import type { ParsedRow } from "@/lib/parseCsv";
import type { ExactParsedDataSet } from "@/lib/exactDataInput";
import { stockBalancesProfile, type StockBalancesField, type StockBalancesMapping } from "@/lib/profiles/stockBalancesProfile";
import { decodeDecimalCell, type DecimalNotation, type DecimalResult, type DecimalSourceCell } from "@/lib/strictDecimal";
import { createCompositeKey } from "@/lib/compositeKey";
import { getMappingStatus } from "@/lib/mappingStatus";
import { mapRowsToProfile } from "@/lib/validation/validationProfile";

export type NormalizedStockBalancesRow = ParsedRow & Record<StockBalancesField, string>;
export type StockBalancesIssue = {
  rowIndex: number;
  field: StockBalancesField | "row";
  severity: "critical" | "warning";
  ruleId: string;
  problem: string;
  why: string;
  fix: string;
};
export type StockBalancesValidationResult = {
  issues: StockBalancesIssue[];
  cleanRows: NormalizedStockBalancesRow[];
  errorRows: NormalizedStockBalancesRow[];
};
export type StockBalancesRun = {
  available: boolean;
  unavailableReason?: "notation-required" | "mapping-required" | "source-context";
  normalizedRows: NormalizedStockBalancesRow[];
  validationResult: StockBalancesValidationResult;
};
export type StockBalancesContext = {
  quantityNotation: DecimalNotation | null;
  quantityCells: readonly DecimalSourceCell[];
};

function unavailable(reason: StockBalancesRun["unavailableReason"]): StockBalancesRun {
  return { available: false, unavailableReason: reason, normalizedRows: [], validationResult: { issues: [], cleanRows: [], errorRows: [] } };
}

function stockKey(row: NormalizedStockBalancesRow): string | null {
  return row.product_id && row.warehouse_id ? createCompositeKey([row.product_id, row.warehouse_id]) : null;
}

function quantityFailure(decoded: Extract<DecimalResult, { ok: false }>, cell: DecimalSourceCell, notation: DecimalNotation) {
  const expected = notation === "point" ? "decimal point (12.50)" : "decimal comma (12,50)";
  if (decoded.error === "unsafe-number") return {
    ruleId: "unsafe-quantity-number", problem: "The stored Excel quantity cannot be used safely.",
    why: "Non-finite numbers and values beyond the safe numeric magnitude cannot be trusted as exact quantities.",
    fix: `Replace the source cell with the exact quantity as text using ${expected}; do not rely on digits Excel already lost.`,
  };
  if (decoded.error === "unsupported-cell") return {
    ruleId: "unsupported-quantity-cell", problem: `Quantity uses an unsupported ${cell.kind} cell.`,
    why: "This snapshot profile accepts quantity text or a stored numeric value; it does not evaluate formulas or trust cached formula results.",
    fix: `Replace the source cell with a plain number or exact quantity text using ${expected}. Dates, booleans, errors and percentages are not stock quantities.`,
  };
  return {
    ruleId: "invalid-quantity", problem: `Quantity does not match the chosen ${expected}.`,
    why: "Ambiguous separators, grouping and silent repairs can change the imported stock quantity.",
    fix: `Correct the quantity in the source file using ${expected}, without grouping, symbols, scientific notation or internal spaces.`,
  };
}

/** One nonnegative absolute snapshot per product/warehouse; not a stock movement. */
export function runStockBalancesValidation(rows: readonly ParsedRow[], context: StockBalancesContext): StockBalancesRun {
  const notation = context.quantityNotation;
  if (notation !== "point" && notation !== "comma") return unavailable("notation-required");
  if (!context.quantityCells || context.quantityCells.length !== rows.length) return unavailable("source-context");
  const decoded = context.quantityCells.map((cell) => decodeDecimalCell(cell, notation));
  const normalizedRows: NormalizedStockBalancesRow[] = rows.map((row, index) => ({
    product_id: (row.product_id ?? "").trim(), warehouse_id: (row.warehouse_id ?? "").trim(), unit: (row.unit ?? "").trim(),
    quantity: decoded[index].ok ? decoded[index].value : (row.quantity ?? "").trim(),
  }));
  const groups = new Map<string, { count: number; units: Set<string> }>();
  for (const row of normalizedRows) {
    const key = stockKey(row);
    if (key === null) continue;
    const group = groups.get(key) ?? { count: 0, units: new Set<string>() };
    group.count += 1;
    if (row.unit) group.units.add(row.unit.toLowerCase());
    groups.set(key, group);
  }
  const issues: StockBalancesIssue[] = [];
  normalizedRows.forEach((row, index) => {
    const rowIndex = index + 1;
    const add = (field: StockBalancesIssue["field"], ruleId: string, problem: string, why: string, fix: string) => {
      issues.push({ rowIndex, field, ruleId, problem, why, fix, severity: "critical" });
    };
    const quantity = decoded[index];
    for (const { key, label } of stockBalancesProfile.fields) {
      const missing = key === "quantity" ? !quantity.ok && quantity.error === "empty" : !row[key];
      if (missing) add(key, `required-${key.replaceAll("_", "-")}`, `${label} is missing.`,
        "This field is required to define a stock balance in a product/warehouse snapshot.", `Add ${label.toLowerCase()} to the source record.`);
    }
    if (!quantity.ok && quantity.error !== "empty") {
      const failure = quantityFailure(quantity, context.quantityCells[index], notation);
      add("quantity", failure.ruleId, failure.problem, failure.why, failure.fix);
    } else if (quantity.ok && quantity.isNegative) {
      add("quantity", "negative-quantity", "Stock quantity is negative.",
        "Negative snapshots are outside this profile's initial contract. This does not mean negative stock is universally invalid.",
        "Verify the source balance. Use an appropriate import process for negative inventory or stock movements; do not remove the sign automatically.");
    }
    const key = stockKey(row);
    const group = key === null ? undefined : groups.get(key);
    if (group && group.count > 1) {
      add("row", "duplicate-stock-key", "This product and warehouse appears more than once.",
        "A single snapshot must contain one absolute balance per product and warehouse, even if quantities match or use different units.",
        "Check all matching source rows and keep one intended balance for the same snapshot. Rows are not added or merged automatically.");
      if (group.units.size > 1) add("unit", "stock-unit-conflict", "The same product and warehouse uses different units.",
        "Different units do not make duplicate product/warehouse balances independent. Their quantities cannot safely be compared or summed here.",
        "Resolve the conflicting source units and retain one intended product/warehouse balance. Units are never converted automatically.");
    }
    // Zero is an ordinary stock balance. No warning is generated for zero or -0.
  });
  const blocked = new Set(issues.filter((issue) => issue.severity === "critical").map((issue) => issue.rowIndex));
  return { available: true, normalizedRows, validationResult: {
    issues, cleanRows: normalizedRows.filter((_, index) => !blocked.has(index + 1)), errorRows: normalizedRows.filter((_, index) => blocked.has(index + 1)),
  } };
}

export function runStockBalancesSourceValidation(source: ExactParsedDataSet, mapping: StockBalancesMapping, quantityNotation: DecimalNotation | null): StockBalancesRun {
  if (!getMappingStatus(stockBalancesProfile, mapping).mappingReady || stockBalancesProfile.fields.some(({ key }) => !source.headers.includes(mapping[key]))) return unavailable("mapping-required");
  if (!source.sourceCells || source.sourceCells.length !== source.rows.length || source.sourceCells.some((row) => !row[mapping.quantity])) return unavailable("source-context");
  return runStockBalancesValidation(mapRowsToProfile(source.rows, mapping, stockBalancesProfile), {
    quantityNotation, quantityCells: source.sourceCells.map((row) => row[mapping.quantity]),
  });
}
