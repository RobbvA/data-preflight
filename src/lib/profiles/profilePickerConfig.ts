import { FileText, UsersRound, Truck, type LucideIcon } from "lucide-react";
import type { DataDomain } from "@/components/data-preflight/WorkspaceLayout";

export type ProfilePickerOption = {
  domain: DataDomain;
  name: string;
  description: string;
  keywords: string;
  icon: LucideIcon;
};

export const profilePickerConfig = {
  invoice: {
    domain: "invoice",
    name: "Invoice data",
    description: "Check invoice references, dates, amounts and required fields.",
    keywords: "finance billing factuur facturen",
    icon: FileText,
  },
  customer: {
    domain: "customer",
    name: "Customer master data",
    description: "Check customer IDs, duplicates, names and contact details.",
    keywords: "client debtor klant klanten debiteur",
    icon: UsersRound,
  },
  vendor: {
    domain: "vendor",
    name: "Vendor master data",
    description: "Check supplier IDs, duplicates, names and contact details.",
    keywords: "supplier creditor leverancier leveranciers crediteur",
    icon: Truck,
  },
} satisfies Record<DataDomain, ProfilePickerOption>;

export const profilePickerOptions: readonly ProfilePickerOption[] =
  Object.values(profilePickerConfig);
