import type { ValidationProfile } from "@/lib/validation/validationProfile";
import {
  normalizeInvoiceRows,
  type NormalizedInvoiceRow,
} from "@/lib/normalizeInvoice";
import { validateRows, type ValidationResult } from "@/lib/validateRows";
import { invoiceProfile, type InvoiceField } from "@/lib/profiles/invoiceProfile";

export const invoiceValidationProfile: ValidationProfile<
  InvoiceField,
  NormalizedInvoiceRow,
  ValidationResult
> = {
  ...invoiceProfile,
  version: "1.0.2",
  normalizeRows: normalizeInvoiceRows,
  validateRows,
};