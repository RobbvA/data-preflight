import type { DecimalNotation } from "@/lib/strictDecimal";
import { UNIT_REFERENCE_VERSION, type UnitReference } from "@/lib/unitReference";
import type { ParsedRow } from "@/lib/parseCsv";

export type InvoiceValidationContext = { invoiceNotation: DecimalNotation };
export type PriceValidationContext = { priceNotation: DecimalNotation };
export type StockValidationContext = { quantityNotation: DecimalNotation };

type ValidationReportInput<TField extends string> = {
  profile: { id: string; name: string; version: string };
  fileName: string;
  sheetName?: string;
  unitReference?: UnitReference | null;
  invoiceContext?: InvoiceValidationContext;
  priceContext?: PriceValidationContext;
  stockContext?: StockValidationContext;
  mapping: Readonly<Record<TField, string>>;
  counts: {
    total: number;
    blocked: number;
    needsReview: number;
    ready: number;
  };
};

export function buildValidationReportRows<TField extends string>({
  profile,
  fileName,
  sheetName,
  mapping,
  counts,
  unitReference,
  invoiceContext,
  priceContext,
  stockContext,
}: ValidationReportInput<TField>): ParsedRow[] {
  if (profile.id === "invoice" && (!invoiceContext || !["point", "comma"].includes(invoiceContext.invoiceNotation))) {
    throw new Error("Invoice notation is required for an Invoice validation report.");
  }
  if (profile.id === "price-list" && (!priceContext || !["point", "comma"].includes(priceContext.priceNotation))) {
    throw new Error("Price notation is required for a Price List validation report.");
  }
  if (profile.id === "stock-balances" && (!stockContext || !["point", "comma"].includes(stockContext.quantityNotation))) {
    throw new Error("Quantity notation is required for a Stock Balances validation report.");
  }
  const row = (section: string, field: string, value: string): ParsedRow => ({
    Section: section,
    "DataPreflight field / metric": field,
    "Source column / value": value,
  });

  const mappingRows = (Object.entries(mapping) as Array<[string, string]>)
    .sort(([first], [second]) =>
      first < second ? -1 : first > second ? 1 : 0,
    )
    .map(([field, sourceColumn]) =>
      row("Field mapping", field, sourceColumn || "Not mapped"),
    );

  return [
    row("Validation", "Validation profile", profile.name),
    row("Validation", "Profile ID", profile.id),
    row("Validation", "Profile version", profile.version),
    row("Validation", "Source filename", fileName),
    ...(sheetName
      ? [row("Validation", "Source worksheet", sheetName)]
      : []),
    row("Result", "Total rows", String(counts.total)),
    row("Result", "Blocked", String(counts.blocked)),
    row("Result", "Needs review", String(counts.needsReview)),
    row("Result", "Ready", String(counts.ready)),
    ...mappingRows,
    ...(profile.id === "invoice" && invoiceContext ? [
      row("Invoice context", "Amount and VAT notation", invoiceContext.invoiceNotation === "point" ? "Decimal point (12.50)" : "Decimal comma (12,50)"),
      row("Invoice context", "Text amount and VAT rules", "Chosen decimal notation only; no thousands separators, symbols or scientific text. Export uses a point and preserves text scale."),
      row("Invoice context", "Financial comparisons", "Exact decimal comparisons, including VAT above amount and the 30% threshold; no monetary Number conversion or rounding."),
      row("Invoice context", "Excel numeric values", "Stored numeric values without display rounding. Formula, date, boolean, error and percentage cells are rejected for amounts and VAT. Other fields retain formatted text."),
      row("Invoice context", "Checks not performed", "Legal tax correctness, source precision already lost in Excel, live ERP references and target-ERP import acceptance."),
    ] : []),
    ...(profile.id === "price-list" && priceContext ? [
      row("Price context", "Price notation", priceContext.priceNotation === "point" ? "Decimal point (12.50)" : "Decimal comma (12,50)"),
      row("Price context", "Text price rules", "Chosen decimal notation only; no grouping, symbols or scientific text. Export uses a point and preserves text scale."),
      row("Price context", "Excel numeric values", "Stored numeric values without display rounding. Formula, date, boolean, error and percentage cells are rejected for prices."),
      row("Price context", "Checks not performed", "Product, price-list, currency and unit existence in ERP; tiers, validity periods, discounts and target-ERP acceptance."),
    ] : []),
    ...(profile.id === "stock-balances" && stockContext ? [
      row("Stock context", "Quantity notation", stockContext.quantityNotation === "point" ? "Decimal point (12.50)" : "Decimal comma (12,50)"),
      row("Stock context", "Stock interpretation", "One absolute on-hand balance per product and warehouse for one organization/snapshot per file; not movements or deltas."),
      row("Stock context", "Duplicate scope", "Product and warehouse, regardless of unit. Duplicate balances block; quantities are not summed and units are not converted."),
      row("Stock context", "Zero quantity", "Zero is a valid stock balance and does not generate a warning."),
      row("Stock context", "Text quantity rules", "Chosen decimal notation only; no grouping, symbols or scientific text. Export uses a point and preserves text scale."),
      row("Stock context", "Excel numeric values", "Stored numeric values without display rounding. Formula, date, boolean, error and percentage cells are rejected for quantities."),
      row("Stock context", "Checks not performed", "Product, warehouse and unit existence in ERP; organization/snapshot date, actual stock, comparison with previous files, valuation, batches/serials and target-ERP acceptance."),
    ] : []),
    ...(profile.id === "product" ? [
      row("Unit reference", "Reference check", unitReference ? "Run" : "Not run"),
      row("Unit reference", "Reference-check version", UNIT_REFERENCE_VERSION),
      ...(unitReference ? [
        row("Unit reference", "Reference filename", unitReference.fileName),
        row("Unit reference", "Unique unit count", String(unitReference.allowedUnits.length)),
        ...unitReference.allowedUnits.map((unit) => row("Unit reference", "Allowed unit", unit)),
      ] : []),
    ] : []),
  ];
}