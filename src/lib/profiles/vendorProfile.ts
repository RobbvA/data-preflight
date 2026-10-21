import {
  suggestProfileMapping,
  type DataProfile,
} from "@/lib/dataProfile";

export const vendorFieldKeys = [
  "vendor_id",
  "name",
  "email",
  "country",
  "vat_number",
] as const;

export type VendorField = (typeof vendorFieldKeys)[number];
export type VendorMapping = Record<VendorField, string>;

export const vendorProfile: DataProfile<VendorField> = {
  id: "vendor",
  name: "Vendor Master Data",
  description: "Check supplier records before preparing an ERP import.",
  fields: [
    {
      key: "vendor_id",
      label: "Vendor ID",
      required: true,
      synonyms: [
        "vendor id",
        "vendor number",
        "vendor no",
        "vendor code",
        "supplier id",
        "supplier number",
        "supplier no",
        "supplier code",
        "creditor id",
        "creditor number",
        "leverancier id",
        "leveranciersnummer",
        "leveranciernummer",
        "leverancier nummer",
        "crediteurnummer",
        "crediteur nummer",
      ],
    },
    {
      key: "name",
      label: "Vendor name",
      required: true,
      synonyms: [
        "vendor name",
        "supplier name",
        "creditor name",
        "company name",
        "company",
        "organization",
        "organisation",
        "name",
        "naam",
        "bedrijfsnaam",
        "leverancier",
        "leveranciersnaam",
        "leverancier naam",
        "crediteurnaam",
        "crediteur naam",
      ],
    },
    {
      key: "email",
      label: "Email",
      required: false,
      synonyms: [
        "email",
        "e-mail",
        "email address",
        "vendor email",
        "supplier email",
        "contact email",
        "billing email",
        "mail",
        "emailadres",
      ],
    },
    {
      key: "country",
      label: "Country code",
      required: false,
      synonyms: [
        "country",
        "country code",
        "vendor country",
        "supplier country",
        "land",
        "landcode",
        "land code",
      ],
    },
    {
      key: "vat_number",
      label: "VAT number",
      required: false,
      synonyms: [
        "vat number",
        "vat id",
        "tax id",
        "tax number",
        "btw nummer",
        "btw-nummer",
        "btwnummer",
        "omzetbelastingnummer",
      ],
    },
  ],
};

export function suggestVendorMapping(headers: string[]): VendorMapping {
  return suggestProfileMapping(vendorProfile, headers);
}