import { invoiceProfile } from "@/lib/profiles/invoiceProfile";

// Descriptor only: Invoice must run through runInvoiceSourceValidation with notation/cell context.
export const invoiceValidationProfile = { ...invoiceProfile, version: "1.1.0" };
