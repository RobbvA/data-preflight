import { getProfileMappingCandidates } from "@/lib/dataProfile";
import { customerProfile } from "@/lib/profiles/customerProfile";
import { vendorProfile } from "@/lib/profiles/vendorProfile";

import { priceListProfile } from "@/lib/profiles/priceListProfile";
import { productProfile } from "@/lib/profiles/productProfile";

type DataDomain = "invoice" | "customer" | "vendor" | "product" | "price-list";

function normalizeHeader(header: string) {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const CUSTOMER_IDENTIFIERS = new Set([
  "customer id",
  "customer number",
  "customer no",
  "customer code",
  "client id",
  "client number",
  "debtor id",
  "debtor number",
  "debiteurnummer",
  "debiteur nummer",
  "klantnummer",
  "klant nummer",
  "klant id",
  "relatienummer",
]);

const INVOICE_IDENTIFIERS = new Set([
  "invoice no",
  "invoice number",
  "invoice nr",
  "invoice id",
  "invoice reference",
  "invoice ref",
  "invoice code",
  "invoicenumber",
  "invoiceid",
  "factuur",
  "factuurnummer",
  "factuur nummer",
  "factuurnr",
  "factuur nr",
  "bill number",
  "bill no",
  "bill id",
]);

const INVOICE_AMOUNT_HEADERS = new Set([
  "amount",
  "invoice amount",
  "invoice total",
  "total",
  "total amount",
  "gross amount",
  "balance due",
  "bedrag",
  "factuurbedrag",
  "factuur bedrag",
  "totaal",
  "totaalbedrag",
  "totaal bedrag",
]);

export function getProfileMismatchMessage(
  headers: string[],
  domain: DataDomain,
): string | null {
  const sourceHeaders = new Set(headers.map(normalizeHeader));

  const customerCandidates = getProfileMappingCandidates(
    customerProfile,
    headers,
  );

  const vendorCandidates = getProfileMappingCandidates(
    vendorProfile,
    headers,
  );

  const hasCustomerId =
    customerCandidates.customer_id.length > 0 ||
    [...CUSTOMER_IDENTIFIERS].some((header) =>
      sourceHeaders.has(header),
    );

  const hasVendorId = vendorCandidates.vendor_id.length > 0;

  const hasInvoiceId = [...INVOICE_IDENTIFIERS].some((header) =>
    sourceHeaders.has(header),
  );

  const hasInvoiceAmount = [...INVOICE_AMOUNT_HEADERS].some((header) =>
    sourceHeaders.has(header),
  );

  const productCandidates = getProfileMappingCandidates(productProfile, headers);
  const hasProductId = productCandidates.product_id.length > 0;
  const priceCandidates = getProfileMappingCandidates(priceListProfile, headers);
  const hasPriceFields = priceCandidates.price_list_id.length > 0 || priceCandidates.unit_price.length > 0;
  const hasPriceSignature = hasProductId && priceCandidates.price_list_id.length > 0 && priceCandidates.unit_price.length > 0;
  if (hasPriceSignature && !hasCustomerId && !hasVendorId && !hasInvoiceId && !hasInvoiceAmount) {
    return domain === "price-list" ? null : "This file looks like price list data. Choose the Price List / Item Prices profile or check the source file.";
  }
  if (domain === "price-list" && hasProductId && !hasPriceFields && productCandidates.description.length > 0 && productCandidates.base_unit.length > 0) {
    return "This file looks like product / material data. Choose the Product / Material profile or check the source file.";
  }

  if ((domain === "product" || domain === "price-list") && !hasProductId) {
    if (hasInvoiceId && hasInvoiceAmount) {
      return "This file looks like invoice data. Choose the Invoice data profile or check the source file.";
    }
    if (hasCustomerId && !hasVendorId) {
      return "This file looks like customer master data. Choose the Customer master data profile or check the source file.";
    }
    if (hasVendorId && !hasCustomerId) {
      return "This file looks like vendor master data. Choose the Vendor master data profile or check the source file.";
    }
  }

  if (domain !== "product" && domain !== "price-list" && !hasPriceSignature && hasProductId && !hasCustomerId && !hasVendorId
    && !hasInvoiceId && !hasInvoiceAmount) {
    return "This file looks like product / material data. Choose the Product / Material profile or check the source file.";
  }

  if (
    domain === "invoice" &&
    !hasInvoiceId &&
    !hasInvoiceAmount
  ) {
    if (hasCustomerId && !hasVendorId) {
      return "This file looks like customer master data. Choose the Customer master data profile or check the source file.";
    }

    if (hasVendorId && !hasCustomerId) {
      return "This file looks like vendor master data. Choose the Vendor master data profile or check the source file.";
    }
  }

  if (
    domain === "customer" &&
    hasInvoiceId &&
    hasInvoiceAmount &&
    !hasCustomerId
  ) {
    return "This file looks like invoice data. Choose the Invoice data profile or check the source file.";
  }

  if (
    domain === "vendor" &&
    hasInvoiceId &&
    hasInvoiceAmount &&
    !hasVendorId
  ) {
    return "This file looks like invoice data. Choose the Invoice data profile or check the source file.";
  }

  if (
    domain === "customer" &&
    hasVendorId &&
    !hasCustomerId
  ) {
    return "This file looks like vendor master data. Choose the Vendor master data profile or check the source file.";
  }

  if (
    domain === "vendor" &&
    hasCustomerId &&
    !hasVendorId
  ) {
    return "This file looks like customer master data. Choose the Customer master data profile or check the source file.";
  }

  return null;
}