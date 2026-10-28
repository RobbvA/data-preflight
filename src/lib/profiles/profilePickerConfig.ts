import { FileText, UsersRound, Truck, Package, Tags, Warehouse, type LucideIcon } from "lucide-react";
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
  product: {
    domain: "product",
    name: "Product / Material",
    description: "Check product IDs, duplicates, descriptions and required base units.",
    keywords: "item article sku unit uom artikel materiaal product eenheid",
    icon: Package,
  },
  "price-list": {
    domain: "price-list",
    name: "Price List / Item Prices",
    description: "Check item prices, currency, units and duplicate price-list entries.",
    keywords: "price pricing prices list item prijs prijzen prijslijst eenheidsprijs",
    icon: Tags,
  },
  "stock-balances": {
    domain: "stock-balances",
    name: "Stock Balances / On-hand Inventory",
    description: "Check one absolute stock balance per product and warehouse.",
    keywords: "stock balances inventory warehouse quantity on hand voorraad voorraadstanden magazijn aantal",
    icon: Warehouse,
  },
} satisfies Record<DataDomain, ProfilePickerOption>;

export const profilePickerOptions: readonly ProfilePickerOption[] =
  Object.values(profilePickerConfig);
