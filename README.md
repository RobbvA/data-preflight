# DataPreflight

**Validate data before ERP import.**

DataPreflight is a browser-based quality gate for structured business data. Choose a validation profile, upload a CSV or Excel file, check the suggested field mapping, review rule-based results, and export rows without critical issues.

[Live app](https://data-preflight.vercel.app/) · [Project status](PROJECT_STATUS.md) · [Product vision](PRODUCT_VISION.md)

## Available profiles

| Profile | Current checks |
| --- | --- |
| Invoice data | Required fields, duplicate invoice numbers, amounts, VAT, status, country, currency, dates, and related invoice rules. |
| Customer master data | Required customer ID and name, duplicate customer IDs, email format, and country-code format. |

Both profiles are defined and versioned in code. Users can select a profile, but cannot create or edit validation rules in the app. Customer is the second working domain; other master data and ERP-specific profiles are future work.

## Workflow

1. Choose **Invoice data** or **Customer master data**. Invoice is currently selected by default.
2. Upload a CSV, XLSX, or XLS file, or load the matching example.
3. Review suggested field mapping. Resolve missing required fields and duplicate source-column assignments.
4. DataPreflight normalizes the mapped values and runs the selected profile's deterministic checks.
5. Switch between **Blocked**, **Needs review**, and **Ready** to inspect results and suggested fixes.
6. Correct the source file and upload it again if needed. Export rows without critical issues and download the issue report.

The workspaces present mapping, review, and export as visible steps. The homepage preview is illustrative; actual results come from a loaded file.

**Export boundary:** blocked rows are excluded. Rows with warnings remain exportable and need review before import. “Ready” means the implemented checks passed for that profile; it does not guarantee acceptance by a specific ERP.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Choose a profile and load an example or your own file.

When a production check is needed:

```bash
npm run lint
npm run build
```

## Code map

| Responsibility | Location |
| --- | --- |
| CSV/Excel parsing and `ParsedDataSet` | `src/lib/parseCsv.ts` |
| Shared field definitions and Customer mapping candidates | `src/lib/dataProfile.ts` |
| Invoice mapping suggestions | `src/lib/fieldMapping.ts` |
| Shared profile mapping and execution contract | `src/lib/validation/validationProfile.ts` |
| Invoice and Customer profile definitions | `src/lib/profiles/` |
| Domain normalization and rules | `src/lib/normalization/`, `src/lib/validation/`, `src/lib/validateRows.ts` |
| CSV downloads | `src/lib/exportData.ts` |
| Domain selection and Invoice flow | `src/components/CsvUploader.tsx` |
| Customer flow | `src/components/data-preflight/CustomerWorkspace.tsx` |
| Shared page shell and UI sections | `src/components/data-preflight/` |

Invoice and Customer still have separate workspace components. We will extract shared behavior after the two flows reveal what is genuinely common.

## Data handling and repeatability

The current file-processing path reads, parses, maps, normalizes, validates, and exports selected files in the browser. The example Invoice file is fetched as a public static asset. The current path has no DataPreflight endpoint for uploading source files. Review any future analytics, logging, storage, integrations, server processing, or AI calls before extending privacy claims.

Hard validation is rule-based. The intended invariant is:

```text
same input + same mapping + same profile version = same result
```

Profile versions exist in code, but the app does not yet store an applied mapping and profile snapshot alongside each export. Cross-version reproducibility and large-file behavior still need explicit verification.

## Direction

Milestone 5 is in progress. The near-term work is to strengthen the shared profile architecture, traceability, reliable export, and workflow across Invoice and Customer. New data domains, configurable rules, ERP connectors, persistence, and AI assistance are not current capabilities.

See [ROADMAP.md](ROADMAP.md) for delivery order, [FEEDBACK.md](FEEDBACK.md) for historical professional feedback, and [SESSION_LOG.md](SESSION_LOG.md) for build history.