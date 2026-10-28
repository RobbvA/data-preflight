import type { ParsedRow } from "@/lib/parseCsv";
import type { ExactParsedDataSet } from "@/lib/exactDataInput";
import { priceListProfile, type PriceListField, type PriceListMapping } from "@/lib/profiles/priceListProfile";
import { decodeDecimalCell, type DecimalNotation, type DecimalResult, type DecimalSourceCell } from "@/lib/strictDecimal";
import { createCompositeKey } from "@/lib/compositeKey";
import { getMappingStatus } from "@/lib/mappingStatus";
import { mapRowsToProfile } from "@/lib/validation/validationProfile";

export type NormalizedPriceListRow = ParsedRow & Record<PriceListField, string>;
export type PriceListIssue = {
  rowIndex: number;
  field: PriceListField | "row";
  severity: "critical" | "warning";
  ruleId: string;
  problem: string;
  why: string;
  fix: string;
};
export type PriceListValidationResult = {
  issues: PriceListIssue[];
  cleanRows: NormalizedPriceListRow[];
  errorRows: NormalizedPriceListRow[];
};
export type PriceListRun = {
  available: boolean;
  unavailableReason?: "notation-required" | "mapping-required" | "source-context";
  normalizedRows: NormalizedPriceListRow[];
  validationResult: PriceListValidationResult;
};
export type PriceListContext = {
  priceNotation: DecimalNotation | null;
  priceCells: readonly DecimalSourceCell[];
};

function unavailable(reason: PriceListRun["unavailableReason"]): PriceListRun {
  return { available: false, unavailableReason: reason, normalizedRows: [], validationResult: { issues: [], cleanRows: [], errorRows: [] } };
}

function priceKey(row: NormalizedPriceListRow): string | null {
  return row.product_id && row.price_list_id && /^[A-Z]{3}$/.test(row.currency) && row.unit
    ? createCompositeKey([row.product_id, row.price_list_id, row.currency, row.unit]) : null;
}

function priceFailure(decoded: Extract<DecimalResult, { ok: false }>, cell: DecimalSourceCell, notation: DecimalNotation) {
  const expected = notation === "point" ? "decimal point (12.50)" : "decimal comma (12,50)";
  if (decoded.error === "unsafe-number") {
    return {
      ruleId: "unsafe-unit-price-number", problem: "The stored Excel price cannot be used safely.",
      why: "Non-finite numbers and values beyond the safe numeric magnitude cannot be trusted as exact prices.",
      fix: `Replace the source cell with the exact price as text using ${expected}; do not rely on digits Excel already lost.`,
    };
  }
  if (decoded.error === "unsupported-cell") {
    return {
      ruleId: "unsupported-unit-price-cell", problem: `Unit price uses an unsupported ${cell.kind} cell.`,
      why: "This profile accepts price text or a stored numeric value; it does not evaluate formulas or trust cached formula results.",
      fix: `Replace the source cell with a plain number or exact price text using ${expected}. Dates, booleans, errors and percentages are not prices.`,
    };
  }
  return {
    ruleId: "invalid-unit-price", problem: `Unit price does not match the chosen ${expected}.`,
    why: "Ambiguous separators, grouping and silent repairs can change the imported price.",
    fix: `Correct the price in the source file using ${expected}, without grouping, symbols, scientific notation or internal spaces.`,
  };
}

/** Explicit context is required: an Excel formula must never fall back to cached text. */
export function runPriceListValidation(rows: readonly ParsedRow[], context: PriceListContext): PriceListRun {
  const notation = context.priceNotation;
  if (notation !== "point" && notation !== "comma") return unavailable("notation-required");
  if (!context.priceCells || context.priceCells.length !== rows.length) return unavailable("source-context");

  const decoded = context.priceCells.map((cell) => decodeDecimalCell(cell, notation));
  const normalizedRows: NormalizedPriceListRow[] = rows.map((row, index) => ({
    product_id: (row.product_id ?? "").trim(),
    price_list_id: (row.price_list_id ?? "").trim(),
    currency: (row.currency ?? "").trim().toUpperCase(),
    unit: (row.unit ?? "").trim(),
    unit_price: decoded[index].ok ? decoded[index].value : (row.unit_price ?? "").trim(),
  }));
  const counts = new Map<string, number>();
  for (const row of normalizedRows) {
    const key = priceKey(row);
    if (key !== null) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const issues: PriceListIssue[] = [];
  normalizedRows.forEach((row, index) => {
    const rowIndex = index + 1;
    const add = (field: PriceListIssue["field"], ruleId: string, problem: string, why: string, fix: string, severity: PriceListIssue["severity"] = "critical") => {
      issues.push({ rowIndex, field, ruleId, problem, why, fix, severity });
    };
    const price = decoded[index];
    for (const { key, label } of priceListProfile.fields) {
      const missing = key === "unit_price" ? !price.ok && price.error === "empty" : !row[key];
      if (missing) add(key, `required-${key.replaceAll("_", "-")}`, `${label} is missing.`,
        "This field is required to define a price-list item.", `Add ${label.toLowerCase()} to the source record.`);
    }
    if (row.currency && !/^[A-Z]{3}$/.test(row.currency)) {
      add("currency", "invalid-currency", "Currency must contain exactly three letters.",
        "This profile checks the currency-code shape; it does not verify that the code exists or belongs to the price list.",
        "Correct the source currency to a three-letter code such as EUR. Do not include digits or symbols.");
    }
    if (!price.ok && price.error !== "empty") {
      const failure = priceFailure(price, context.priceCells[index], notation);
      add("unit_price", failure.ruleId, failure.problem, failure.why, failure.fix);
    } else if (price.ok && price.isNegative) {
      add("unit_price", "negative-unit-price", "Unit price is negative.",
        "Negative prices are outside this profile's initial import contract.",
        "Correct the source price or use an appropriate process for credits and adjustments.");
    } else if (price.ok && price.isZero) {
      add("unit_price", "zero-unit-price", "Unit price is zero.",
        "A zero price can be intentional, but may also indicate missing pricing. This row remains exportable unless another issue blocks it.",
        "Confirm that zero is intended for this product and price list; otherwise correct the source price.", "warning");
    }
    const key = priceKey(row);
    if (key !== null && (counts.get(key) ?? 0) > 1) {
      add("row", "duplicate-price-key", "This product, price list, currency and unit appears more than once.",
        "Each combination must define one price. All matching rows are blocked, even if prices match or one price is invalid.",
        "Check every matching source row and retain one intended price per combination. Rows are not merged automatically.");
    }
  });
  const blocked = new Set(issues.filter((issue) => issue.severity === "critical").map((issue) => issue.rowIndex));
  return {
    available: true, normalizedRows,
    validationResult: { issues, cleanRows: normalizedRows.filter((_, index) => !blocked.has(index + 1)), errorRows: normalizedRows.filter((_, index) => blocked.has(index + 1)) },
  };
}

/** Mapping gates and source-cell alignment for the eventual workspace integration. */
export function runPriceListSourceValidation(source: ExactParsedDataSet, mapping: PriceListMapping, priceNotation: DecimalNotation | null): PriceListRun {
  if (!getMappingStatus(priceListProfile, mapping).mappingReady || priceListProfile.fields.some(({ key }) => !source.headers.includes(mapping[key]))) {
    return unavailable("mapping-required");
  }
  if (!source.sourceCells || source.sourceCells.length !== source.rows.length || source.sourceCells.some((row) => !row[mapping.unit_price])) {
    return unavailable("source-context");
  }
  return runPriceListValidation(mapRowsToProfile(source.rows, mapping, priceListProfile), {
    priceNotation, priceCells: source.sourceCells.map((row) => row[mapping.unit_price]),
  });
}
