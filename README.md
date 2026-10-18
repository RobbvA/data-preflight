# DataPreflight

**Validate data before ERP import.**

DataPreflight is a browser-based quality gate for structured business data. Choose a validation profile, upload a CSV or Excel file, check the suggested field mapping, review rule-based results, and export rows without critical issues.

[Live app](https://data-preflight.vercel.app/) · [Project status](PROJECT_STATUS.md) · [Product vision](PRODUCT_VISION.md)

## Available profiles

| Profile | Current checks |
| --- | --- |
| Invoice data | Required fields, duplicate invoice numbers, amounts, VAT, status, country, currency, dates, and related invoice rules. |
| Customer master data | Required customer ID and name, duplicate customer IDs, email format, and country-code format. |

Both profiles are defined and versioned in code. Users can select a profile, but cannot create or edit validation rules in the app.

Vendor/Supplier, Product/Material, saved mappings, and reference-data validation are planned M6 work. They are not available yet.

## Workflow

1. Explicitly choose Invoice data or Customer master data. Neither is selected by default.
2. Upload a CSV, XLSX, or XLS file, or load the matching example.
3. Choose a worksheet if the Excel workbook contains multiple populated worksheets.
4. Review suggested field mapping. Resolve missing required fields and duplicate source-column assignments.
5. DataPreflight normalizes the mapped values and runs the selected profile's deterministic checks.
6. Switch between Blocked, Needs review, and Ready to inspect results and suggested fixes.
7. Correct the source file and upload it again if needed.
8. Export rows without critical issues, download the issue report, and download the Validation Report.

Both workspaces show Mapping → Review → Export as visible steps. They use the same field mapping panel and shared mapping guards.

The mapping panel provides required/optional labels, duplicate-assignment feedback, keyboard navigation, Escape dismissal, and focus restoration after manual opening. Invoice retains its header/sample-based mapping suggestions; Customer retains its header-based suggestions.

The homepage preview is illustrative. Actual results come from a loaded file.

**Export boundary:** blocked rows are excluded. Rows with warnings remain exportable and need review before import. “Ready” means the implemented checks passed for that profile; it does not guarantee acceptance by a specific ERP.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

At a coherent implementation checkpoint, or when a change warrants it:

```bash
npm run lint
npm run build
```

Use focused browser checks during smaller implementation steps. Do not repeat full checks after every minor edit without a reason.

## Code map

| Responsibility | Location |
| --- | --- |
| CSV/Excel parsing and ParsedDataSet | `src/lib/parseCsv.ts` |
| Shared field definitions and Customer mapping candidates | `src/lib/dataProfile.ts` |
| Invoice mapping suggestions | `src/lib/fieldMapping.ts` |
| Shared mapping readiness and duplicate checks | `src/lib/mappingStatus.ts` |
| Shared profile mapping and execution contract | `src/lib/validation/validationProfile.ts` |
| Profile definitions | `src/lib/profiles/` |
| Domain normalization and validation | `src/lib/normalization/`, `src/lib/validation/`, `src/lib/validateRows.ts` |
| CSV downloads | `src/lib/exportData.ts` |
| Validation Report generation | `src/lib/validationReport.ts` |
| Profile selection and Invoice flow | `src/components/CsvUploader.tsx` |
| Customer flow | `src/components/data-preflight/CustomerWorkspace.tsx` |
| Shared mapping dialog | `src/components/data-preflight/ProfileMappingPanel.tsx` |
| Validation details and report download | `src/components/data-preflight/ValidationContextPanel.tsx` |
| Shared page shell and UI sections | `src/components/data-preflight/` |

Invoice and Customer still have separate workspace components and review implementations. Shared behavior is extracted incrementally; a complete generic workspace has not been implemented.

Both upload flows ignore outdated asynchronous reads after replacement, reset, profile changes, or workspace unmounting.

## Data handling and repeatability

The current file-processing path reads, parses, maps, normalizes, validates, and exports selected files in the browser. The Invoice example is fetched as a public static asset.

The current path has no DataPreflight endpoint for uploading source files. Review future analytics, logging, storage, integrations, server processing, and AI calls before extending privacy claims.

Hard validation is rule-based. The repeatability target is:

```text
same input
+ same worksheet where applicable
+ same mapping
+ same profile version
= same result
```

The Validation Report records profile ID/version, source filename, selected worksheet where applicable, applied mapping, and result counts.

Fixed M5 runs produced byte-identical row exports, issue reports, and Validation Reports. This is evidence for the tested cases, not a guarantee for every file or future release.

Reports do not contain a complete rule snapshot or cryptographic input fingerprint.

## Current development

M5 is internally complete. M6 implementation started on 2026-10-18.

The first local M6 increment includes upload lifecycle guards, shared mapping status, and one mapping panel for Invoice and Customer. Local lint, TypeScript, production build, and focused browser checks passed.

An independent unguided test with a new ERP/data user has not been completed.

See ROADMAP.md for delivery order, PROJECT_STATUS.md for evidence and limits, FEEDBACK.md for historical professional feedback, and SESSION_LOG.md for build history.