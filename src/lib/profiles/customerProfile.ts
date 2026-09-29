import type { DataProfile } from "@/lib/dataProfile";

export const customerFieldKeys = [
  "customer_id",
  "name",
  "email",
  "country",
  "vat_number",
] as const;

export type CustomerField = (typeof customerFieldKeys)[number];
export type CustomerMapping = Record<CustomerField, string>;

export const customerProfile: DataProfile<CustomerField> = {
  id: "customer",
  name: "Customer Master Data",
  description: "Check customer records before preparing an ERP import.",
  fields: [
    {
      key: "customer_id",
      label: "Customer ID",
      required: true,
      synonyms: [
        "customer id",
        "customer_id",
        "customer number",
        "customer no",
        "customer code",
        "client id",
        "client number",
        "account number",
        "debtor number",
        "debtor id",
        "debiteurnummer",
        "debiteur nummer",
        "klantnummer",
        "klant nummer",
        "klant id",
        "relatienummer",
      ],
    },
    {
      key: "name",
      label: "Customer name",
      required: true,
      synonyms: [
        "customer name",
        "customer_name",
        "client name",
        "account name",
        "company name",
        "company",
        "organization",
        "organisation",
        "name",
        "naam",
        "klantnaam",
        "bedrijfsnaam",
        "relatienaam",
        "debiteur naam",
        "debiteurnaam",
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
        "customer email",
        "contact email",
        "billing email",
        "mail",
        "emailadres",
        "klant email",
      ],
    },
    {
      key: "country",
      label: "Country code",
      required: false,
      synonyms: [
        "country",
        "country code",
        "country_code",
        "customer country",
        "billing country",
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
        "vat_number",
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

export function suggestCustomerMapping(headers: string[]): CustomerMapping {
  const usedHeaders = new Set<string>();

  return Object.fromEntries(
    customerProfile.fields.map((field) => {
      const synonyms = new Set(
        [field.key, ...field.synonyms].map(normalizeHeader),
      );
      const match = headers.find(
        (header) =>
          !usedHeaders.has(header) && synonyms.has(normalizeHeader(header)),
      );

      if (match) usedHeaders.add(match);
      return [field.key, match ?? ""];
    }),
  ) as CustomerMapping;
}

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}