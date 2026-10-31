import type { ParsedRow } from "@/lib/parseCsv";
import type { MasterDataValidationResult, MasterDataIssue } from "@/lib/profiles/masterDataWorkspaceConfig";
import { ODOO_19_COUNTRIES } from "@/lib/odoo19Countries";

export const ODOO_CUSTOMER_TEMPLATE = {
  id: "odoo-19-customer-company", version: "1.0.0", profileId: "customer",
  label: "Odoo 19 · Company contacts",
  namespace: "datapreflight_customer",
  headers: ["id", "name", "is_company", "email", "country_id/id", "vat", "ref"],
  checks: "Customer profile checks plus External ID character restrictions and country membership in Odoo 19 base data. Customer IDs become datapreflight_customer.customer_<Customer ID>; Reference preserves the Customer ID. All exported contacts are companies.",
  boundary: "Documentation and source-code checked; no Odoo trial import performed. Existing External IDs can update contacts. Target database IDs, installed modules, permissions, Tax ID validity and accounting setup are not checked. Country references use bundled Odoo 19 base data, not a live database.",
} as const;
export type ErpTemplateId = "generic" | typeof ODOO_CUSTOMER_TEMPLATE.id;
export type ErpTemplateContext = { id: typeof ODOO_CUSTOMER_TEMPLATE.id; version: string };

/** Overlay the existing run; never remove or weaken a generic issue. */
export function applyOdooCustomerTemplate(normalizedRows: ParsedRow[], result: MasterDataValidationResult): MasterDataValidationResult {
  const issues: MasterDataIssue[] = [...result.issues];
  normalizedRows.forEach((row, index) => {
    const add = (field: string, ruleId: string, problem: string, why: string, fix: string) => issues.push({ rowIndex: index + 1, field, ruleId, problem, why, fix, severity: "critical" });
    if (row.customer_id && !/^[A-Za-z0-9_-]+$/.test(row.customer_id)) {
      add("customer_id", "odoo-external-id-characters", "Customer ID cannot be used by this Odoo template.", "This template accepts letters A–Z, digits, underscores and hyphens so the generated External ID has one explicit namespace. This is a template restriction, not a universal Odoo ID rule.", "Use a stable ID containing only these characters, or choose Generic customer.");
    }
    if (row.country && !Object.hasOwn(ODOO_19_COUNTRIES, row.country)) {
      add("country", "odoo-country-reference", "Country code is not in the Odoo 19 base list.", "The template exports an exact Country/External ID reference from Odoo base data; an unknown code cannot be resolved by this template.", "Use a country code present in Odoo 19, or clear this optional source value and validate again.");
    }
  });
  const blocked = new Set(issues.filter(issue => issue.severity === "critical").map(issue => issue.rowIndex));
  return { issues, cleanRows: normalizedRows.filter((_, i) => !blocked.has(i + 1)), errorRows: normalizedRows.filter((_, i) => blocked.has(i + 1)) };
}

/** Call with clean rows from the template run. Defensive checks prevent bypassing template blockers. */
export function createOdooCustomerExport(rows: readonly ParsedRow[]): ParsedRow[] {
  return rows.map(row => {
    if (!row.name || !row.customer_id || !/^[A-Za-z0-9_-]+$/.test(row.customer_id) || (row.country && !Object.hasOwn(ODOO_19_COUNTRIES, row.country))) throw new Error("Validate the current rows with the Odoo template before exporting.");
    return {
      id: `${ODOO_CUSTOMER_TEMPLATE.namespace}.customer_${row.customer_id}`,
      name: row.name, is_company: "True", email: row.email ?? "",
      "country_id/id": row.country ? `base.${ODOO_19_COUNTRIES[row.country]}` : "",
      vat: row.vat_number ?? "", ref: row.customer_id,
    };
  });
}
