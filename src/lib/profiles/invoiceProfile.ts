import type { DataProfile } from "../dataProfile";

export const invoiceProfile: DataProfile = {
  id: "invoice",

  name: "Invoice Import",

  description:
    "Validate and prepare invoice data for safe import into business systems.",

  fields: [
    {
      key: "invoice_number",
      label: "Invoice Number",
      required: true,
      synonyms: [
        "invoice",
        "invoice number",
        "invoice no",
        "invoice_id",
        "factuurnummer",
        "ref",
        "reference",
      ],
    },

    {
      key: "company",
      label: "Company",
      required: true,
      synonyms: [
        "company",
        "client",
        "customer",
        "bedrijf",
        "klant",
      ],
    },

    {
      key: "email",
      label: "Email",
      required: true,
      synonyms: [
        "email",
        "mail",
        "customer email",
        "client email",
      ],
    },

    {
      key: "amount",
      label: "Amount",
      required: true,
      synonyms: [
        "amount",
        "total",
        "price",
        "bedrag",
        "totaal",
      ],
    },

    {
      key: "vat",
      label: "VAT",
      required: true,
      synonyms: [
        "vat",
        "btw",
        "tax",
        "vat amount",
      ],
    },

    {
      key: "status",
      label: "Status",
      required: false,
      synonyms: [
        "status",
        "state",
        "payment status",
      ],
    },

    {
      key: "country",
      label: "Country",
      required: false,
      synonyms: [
        "country",
        "land",
        "country code",
      ],
    },

    {
      key: "invoice_date",
      label: "Invoice Date",
      required: false,
      synonyms: [
        "invoice date",
        "date",
        "factuurdatum",
      ],
    },

    {
      key: "due_date",
      label: "Due Date",
      required: false,
      synonyms: [
        "due date",
        "payment due",
        "vervaldatum",
      ],
    },

    {
      key: "currency",
      label: "Currency",
      required: false,
      synonyms: [
        "currency",
        "valuta",
        "currency code",
      ],
    },
  ],
};