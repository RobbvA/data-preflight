import { suggestProfileMapping, type DataProfile } from "@/lib/dataProfile";

export const priceListFieldKeys = ["product_id", "price_list_id", "currency", "unit", "unit_price"] as const;
export type PriceListField = (typeof priceListFieldKeys)[number];
export type PriceListMapping = Record<PriceListField, string>;

export const priceListProfile: DataProfile<PriceListField> & { version: string } = {
  id: "price-list",
  version: "1.0.0",
  name: "Price List / Item Prices",
  description: "Check one price per product, price list, currency and unit before ERP import.",
  fields: [
    { key: "product_id", label: "Product ID", required: true, synonyms: ["product id", "product code", "item code", "sku", "artikelnummer"] },
    { key: "price_list_id", label: "Price list", required: true, synonyms: ["price list", "price list code", "prijslijst", "prijslijstcode"] },
    { key: "currency", label: "Currency", required: true, synonyms: ["currency", "currency code", "valuta"] },
    { key: "unit", label: "Unit", required: true, synonyms: ["unit", "uom", "unit of measure", "eenheid"] },
    { key: "unit_price", label: "Unit price", required: true, synonyms: ["unit price", "price", "eenheidsprijs", "prijs"] },
  ],
};

export function suggestPriceListMapping(headers: string[]): PriceListMapping {
  return suggestProfileMapping(priceListProfile, headers);
}
