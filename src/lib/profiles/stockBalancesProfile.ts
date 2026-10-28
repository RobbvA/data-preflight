import { suggestProfileMapping, type DataProfile } from "@/lib/dataProfile";

export const stockBalancesFieldKeys = ["product_id", "warehouse_id", "unit", "quantity"] as const;
export type StockBalancesField = (typeof stockBalancesFieldKeys)[number];
export type StockBalancesMapping = Record<StockBalancesField, string>;

export const stockBalancesProfile: DataProfile<StockBalancesField> & { version: string } = {
  id: "stock-balances",
  version: "1.0.0",
  name: "Stock Balances / On-hand Inventory",
  description: "Check one absolute stock quantity per product and warehouse in a single snapshot.",
  fields: [
    { key: "product_id", label: "Product ID", required: true, synonyms: ["product id", "product code", "item code", "sku", "artikelnummer"] },
    { key: "warehouse_id", label: "Warehouse", required: true, synonyms: ["warehouse", "warehouse code", "warehouse id", "magazijn", "magazijncode"] },
    { key: "unit", label: "Unit", required: true, synonyms: ["unit", "uom", "unit of measure", "eenheid"] },
    { key: "quantity", label: "Quantity", required: true, synonyms: ["quantity", "stock quantity", "on hand", "on-hand quantity", "aantal", "voorraad"] },
  ],
};

export function suggestStockBalancesMapping(headers: string[]): StockBalancesMapping {
  return suggestProfileMapping(stockBalancesProfile, headers);
}
