type FieldMapping = {
  invoice_number: string;
  company: string;
  email: string;
  amount: string;
  vat: string;
  status: string;
};

export function createEmptyMapping(): FieldMapping {
  return {
    invoice_number: "",
    company: "",
    email: "",
    amount: "",
    vat: "",
    status: "",
  };
}

export function createSuggestedMapping(
  headers: string[],
): FieldMapping {
  return {
    invoice_number:
      headers.find((header) => {
        const normalized =
          normalizeHeader(header);

        return (
          normalized.includes("invoice") ||
          normalized.includes("factuur") ||
          normalized.includes("number") ||
          normalized.includes("nummer")
        );
      }) ?? "",

    company:
      headers.find((header) => {
        const normalized =
          normalizeHeader(header);

        return (
          normalized.includes("company") ||
          normalized.includes("client") ||
          normalized.includes("customer") ||
          normalized.includes("bedrijf") ||
          normalized.includes("klant")
        );
      }) ?? "",

    email:
      headers.find((header) => {
        const normalized =
          normalizeHeader(header);

        return (
          normalized.includes("email") ||
          normalized.includes("mail")
        );
      }) ?? "",

    amount:
      headers.find((header) => {
        const normalized =
          normalizeHeader(header);

        return (
          normalized.includes("amount") ||
          normalized.includes("total") ||
          normalized.includes("price") ||
          normalized.includes("bedrag") ||
          normalized.includes("totaal")
        );
      }) ?? "",

    vat:
      headers.find((header) => {
        const normalized =
          normalizeHeader(header);

        return (
          normalized.includes("vat") ||
          normalized.includes("btw") ||
          normalized.includes("tax")
        );
      }) ?? "",

    status:
      headers.find((header) => {
        const normalized =
          normalizeHeader(header);

        return (
          normalized.includes("status") ||
          normalized.includes("state") ||
          normalized.includes("fase")
        );
      }) ?? "",
  };
}

function normalizeHeader(header: string) {
  return header
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/g, "");
}