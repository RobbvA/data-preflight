import { suggestProfileMapping, type DataProfile } from "@/lib/dataProfile";

export const productFieldKeys = ["product_id", "description", "base_unit"] as const;
export type ProductField = (typeof productFieldKeys)[number];
export type ProductMapping = Record<ProductField, string>;

export const productProfile: DataProfile<ProductField> = {
  id: "product",
  name: "Product / Material",
  description: "Check product identifiers, descriptions and base units before ERP import.",
  fields: [
    {
      key: "product_id", label: "Product ID", required: true,
      synonyms: ["product id", "product number", "product code", "material id", "material number", "material code", "item id", "item number", "item code", "sku", "artikelnummer", "artikelcode", "productnummer", "materiaalnummer"],
    },
    {
      key: "description", label: "Description", required: true,
      synonyms: ["description", "product description", "material description", "item description", "product name", "material name", "item name", "omschrijving", "artikelomschrijving", "productomschrijving"],
    },
    {
      key: "base_unit", label: "Base unit", required: true,
      synonyms: ["base unit", "base unit of measure", "unit of measure", "unit", "uom", "base uom", "eenheid", "basiseenheid"],
    },
  ],
};

export function suggestProductMapping(headers: string[]): ProductMapping {
  return suggestProfileMapping(productProfile, headers);
}
