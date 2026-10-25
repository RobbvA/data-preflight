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