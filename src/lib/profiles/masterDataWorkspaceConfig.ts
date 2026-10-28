import { stockBalancesProfile } from "@/lib/profiles/stockBalancesProfile";
import { priceListProfile } from "@/lib/profiles/priceListProfile";
import type { UnitReference } from "@/lib/unitReference";
import { productValidationProfile, runProductValidation } from "@/lib/validation/productValidation";
import type { DataProfile } from "@/lib/dataProfile";
import type { ParsedRow } from "@/lib/parseCsv";
import {
  customerValidationProfile,
} from "@/lib/validation/customerValidation";
import {
  vendorValidationProfile,
} from "@/lib/validation/vendorValidation";
import {
  runValidationProfile,
} from "@/lib/validation/validationProfile";

export type MasterDataDomain = "customer" | "vendor" | "product";

export type MasterDataIssue = {
  rowIndex: number;
  field: string;
  severity: "critical" | "warning";
  ruleId: string;
  problem: string;
  why: string;
  fix: string;
};

export type MasterDataValidationResult = {
  issues: MasterDataIssue[];
  cleanRows: ParsedRow[];
  errorRows: ParsedRow[];
};

export type MasterDataWorkspaceConfig = {
  profile: DataProfile<string> & {
    version: string;
  };
  guidance?: string;
  labels: {
    results: string;
    blocked: string;
    ready: string;
    sort: string;
    missingId: string;
    missingName: string;
  };
  preview: {
    idField: string;
    nameField: string;
    secondaryField: string;
    secondaryFallback: string;
    details: {
      field: string;
      label: string;
    }[];
  };
  example: {
    fileName: string;
    csv: string;
  };
  exports: {
    rows: string;
    issues: string;
  };
  runValidation: (rows: ParsedRow[], reference?: UnitReference | null) => {
    normalizedRows: ParsedRow[];
    validationResult: MasterDataValidationResult;
  };
};

export const customerWorkspaceConfig: MasterDataWorkspaceConfig = {
  profile: customerValidationProfile,

  labels: {
    results: "Customer results",
    blocked: "Blocked customers",
    ready: "Ready customers",
    sort: "Sort customers",
    missingId: "Missing customer ID",
    missingName: "Missing customer name",
  },

  preview: {
    idField: "customer_id",
    nameField: "name",
    secondaryField: "email",
    secondaryFallback: "No email",
    details: [
      {
        field: "country",
        label: "Country",
      },
      {
        field: "vat_number",
        label: "VAT number",
      },
      {
        field: "customer_id",
        label: "Customer ID",
      },
    ],
  },

  example: {
    fileName: "customer-example.csv",
    csv: [
      "Customer Number,Customer Name,Email,Country Code,VAT Number",
      "C-1001,Acme BV,finance@acme.nl,NL,NL123456789B01",
      "C-1002,North Trading,wrong-email,DE,DE123456789",
      "C-1002,North Trading Berlin,accounts@north.example,DE,DE123456789",
      ",Missing Identifier,contact@example.com,NL,",
      "C-1003,Green Supply,hello@green.example,NL,",
    ].join("\n"),
  },

  exports: {
    rows: "customer-rows-without-blockers.csv",
    issues: "customer-issues.csv",
  },

  runValidation(rows) {
    return runValidationProfile(customerValidationProfile, rows);
  },
};

export const vendorWorkspaceConfig: MasterDataWorkspaceConfig = {
  profile: vendorValidationProfile,

  labels: {
    results: "Vendor results",
    blocked: "Blocked vendors",
    ready: "Ready vendors",
    sort: "Sort vendors",
    missingId: "Missing vendor ID",
    missingName: "Missing vendor name",
  },

  preview: {
    idField: "vendor_id",
    nameField: "name",
    secondaryField: "email",
    secondaryFallback: "No email",
    details: [
      {
        field: "country",
        label: "Country",
      },
      {
        field: "vat_number",
        label: "VAT number",
      },
      {
        field: "vendor_id",
        label: "Vendor ID",
      },
    ],
  },

  example: {
    fileName: "vendor-example.csv",
    csv: [
      "Supplier Number,Supplier Name,Email,Country Code,VAT Number",
      " 001 , Acme   Supply , FINANCE@ACME.EXAMPLE , nl , NL123456789B01 ",
      "002,   ,,,",
      "003,Warning supplier,wrong-email,NLD,",
      " V-004 ,Duplicate A,,,",
      "v-004,Duplicate B,,,",
      "005,Optional fields empty,,,",
    ].join("\n"),
  },

  exports: {
    rows: "vendor-rows-without-blockers.csv",
    issues: "vendor-issues.csv",
  },

  runValidation(rows) {
    return runValidationProfile(vendorValidationProfile, rows);
  },
};

export const productWorkspaceConfig: MasterDataWorkspaceConfig = {
  profile: productValidationProfile,
  guidance: "Check mapping and review blocked products. Base units are checked for presence; add an optional unit list below to check allowed values. Units are never converted.",
  labels: {
    results: "Product results",
    blocked: "Blocked products",
    ready: "Ready products",
    sort: "Sort products",
    missingId: "Missing product ID",
    missingName: "Missing product description",
  },
  preview: {
    idField: "product_id",
    nameField: "description",
    secondaryField: "base_unit",
    secondaryFallback: "Missing base unit",
    details: [
      { field: "product_id", label: "Product ID" },
      { field: "description", label: "Description" },
      { field: "base_unit", label: "Base unit" },
    ],
  },
  example: {
    fileName: "product-example.csv",
    csv: [
      "Material Number,Material Description,Base Unit",
      " 001 , Steel   bracket , EA ",
      "002,   ,KG",
      "003,Missing unit,",
      " P-004 ,Duplicate A,KG",
      "p-004,Duplicate B,kg",
      ",Missing identifier,EA",
      "005,Aluminium sheet,kg",
    ].join("\n"),
  },
  exports: {
    rows: "product-rows-without-blockers.csv",
    issues: "product-issues.csv",
  },
  runValidation(rows, reference) {
    return runProductValidation(rows, reference);
  },
};

export const masterDataWorkspaceConfigs: Record<
  MasterDataDomain,
  MasterDataWorkspaceConfig
> = {
  customer: customerWorkspaceConfig,
  vendor: vendorWorkspaceConfig,
  product: productWorkspaceConfig,
};

export type PriceListWorkspaceConfig = Omit<MasterDataWorkspaceConfig, "runValidation"> & { kind: "price-list" };

export const priceListWorkspaceConfig: PriceListWorkspaceConfig = {
  kind: "price-list",
  profile: priceListProfile,
  guidance: "Check mapping and price notation, then review prices. Product, price-list, currency and unit existence in your ERP is not checked.",
  labels: {
    results: "Price list results", blocked: "Blocked prices", ready: "Ready prices", sort: "Sort prices",
    missingId: "Missing product ID", missingName: "Missing price list",
  },
  preview: {
    idField: "product_id", nameField: "price_list_id", secondaryField: "unit_price", secondaryFallback: "Missing price",
    details: priceListProfile.fields.map(({ key, label }) => ({ field: key, label })),
  },
  example: { fileName: "price-list-example.csv", csv: "Product ID,Price List,Currency,Unit,Unit Price\n001,RETAIL,EUR,EA,12.50\n001,WHOLESALE,EUR,EA,10.00\n002,RETAIL,EUR,EA,0\n003,RETAIL,EUR,KG,-1.00\n004,RETAIL,EUR,EA,twelve\n,RETAIL,EUR,EA,5.00\n005,RETAIL,EURO,EA,5.00\n006,RETAIL,EUR,,5.00\n007,RETAIL,EUR,EA,9.95\n007,retail,eur,ea,10.95\n008,,EUR,EA,5.00\n" },
  exports: { rows: "price-list-rows-without-blockers.csv", issues: "price-list-issues.csv" },
};


export type StockBalancesWorkspaceConfig = Omit<MasterDataWorkspaceConfig, "runValidation"> & { kind: "stock-balances" };

export const stockBalancesWorkspaceConfig: StockBalancesWorkspaceConfig = {
  kind: "stock-balances",
  profile: stockBalancesProfile,
  guidance: "Check one absolute stock balance per product and warehouse. This is one snapshot, not stock movements. Units are not converted; the snapshot date and ERP code existence are not checked.",
  labels: {
    results: "Stock balance results", blocked: "Blocked stock balances", ready: "Ready stock balances", sort: "Sort stock balances",
    missingId: "Missing product ID", missingName: "Missing warehouse",
  },
  preview: {
    idField: "product_id", nameField: "warehouse_id", secondaryField: "quantity", secondaryFallback: "Missing quantity",
    details: stockBalancesProfile.fields.map(({ key, label }) => ({ field: key, label })),
  },
  example: { fileName: "stock-balances-example.csv", csv: "Product ID,Warehouse,Unit,Quantity\n001,WH-A,EA,10\n001,WH-B,EA,5.50\n002,WH-A,KG,0\n003,WH-A,EA,-1\n004,WH-A,EA,ten\n,WH-A,EA,5\n005,,EA,5\n006,WH-A,,5\n007,WH-A,EA,2\n007,wh-a,ea,3\n" },
  exports: { rows: "stock-balances-rows-without-blockers.csv", issues: "stock-balances-issues.csv" },
};
