# DataPreflight

**Validate data before ERP import.**

DataPreflight is a browser-based quality gate for structured business data. Choose a validation profile, upload a CSV or Excel file, check the suggested field mapping, review rule-based results, and export rows without critical issues.

[Live app](https://data-preflight.vercel.app/) · [Project status](PROJECT_STATUS.md) · [Product vision](PRODUCT_VISION.md)

## Available profiles

| Profile | Current checks |
| --- | --- |
| Invoice data | Required fields, duplicate invoice numbers, amounts, VAT, status, country, currency, dates, and related invoice rules. |
| Customer master data | Required customer ID and name, duplicate customer IDs, email format, and country-code format. |
| Vendor master data | Required vendor ID and name, case-insensitive duplicate IDs, email format, and country-code format. VAT is not fiscally validated. |
| Product / Material | Required ID, description and base unit; case-insensitive duplicate IDs; optional local allowed-unit CSV. |

All four profiles are defined and versioned in code. Users can select a profile, but cannot create or edit validation rules in the app.

Saved mappings work locally per profile. Product supports an optional reference CSV with one `unit_code` column. Effective codes are trimmed, compared case-insensitively, deduplicated and sorted. Unknown units block while the list is active; no unit conversion is performed.

## Workflow

1. Explicitly choose Invoice, Customer, Vendor, or Product / Material through the searchable profile picker. Neither is selected by default.
2. Upload a CSV, XLSX, or XLS file, or load the matching example.
3. Choose a worksheet if the Excel workbook contains multiple populated worksheets.
4. Review suggested field mapping. Resolve missing required fields and duplicate source-column assignments.
5. DataPreflight normalizes the mapped values and runs the selected profile's deterministic checks.
6. Switch between Blocked, Needs review, and Ready to inspect results and suggested fixes.
7. Correct the source file and upload it again if needed.
8. Export rows without critical issues, download the issue report, and download the Validation Report.

The workspaces show Mapping → Review → Export as visible steps. They use the same field mapping panel and shared mapping guards.

The mapping panel provides required/optional labels, duplicate-assignment feedback, keyboard navigation, Escape dismissal, and focus restoration after manual opening. Invoice retains its header/sample-based mapping suggestions; Customer, Vendor, and Product retain header-based suggestions.

The homepage preview is illustrative. Actual results come from a loaded file.

The export step shows how many rows will export, how many included rows have warnings, and how many blocked rows are excluded. Category filtering changes the review list, not the export scope.

**Export boundary:** blocked rows are excluded. Rows with warnings remain exportable and need review before import. “Ready” means the implemented checks passed for that profile; it does not guarantee acceptance by a specific ERP.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

At a coherent implementation checkpoint, or when a change warrants it:

```bash
npm test
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
| Shared Customer/Vendor flow | `src/components/data-preflight/MasterDataWorkspace.tsx` |
| Master-data workspace configuration | `src/lib/profiles/masterDataWorkspaceConfig.ts` |
| Profile picker and choices | `src/components/data-preflight/ProfilePicker.tsx`, `src/lib/profiles/profilePickerConfig.ts` |
| Shared mapping dialog | `src/components/data-preflight/ProfileMappingPanel.tsx` |
| Validation details and report download | `src/components/data-preflight/ValidationContextPanel.tsx` |
| Shared page shell and UI sections | `src/components/data-preflight/` |

Customer, Vendor, and Product share a configured MasterDataWorkspace. Invoice retains its own workspace. Extract further shared behavior only when a concrete change requires it.

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

M5 and M6 are internally complete. M6 technical signoff: 2026-10-25; deployment after the final commit/push must be confirmed separately.

Four profiles are implemented with mapping, review, reports and export; Vendor CSV and multi-sheet XLSX checks are complete. The landing page includes a searchable profile picker and guarded profile switching.

The current parser fix reserves normalized Excel source headers before generating unique suffixes, preventing duplicate headers from silently overwriting cells. Existing unique normalized headers retain their names. The picker opens over the content without changing card height.

Outreach is deferred during the current build phase. See the project status for verification evidence, limitations and delivery status.

Saved mappings store only names, profile/version, source column names and field assignments in this browser's localStorage. They do not store file rows; clearing site data removes them. Applying a mapping is explicit and retains mapping guards. Profile-version changes require review.

Unit reference lists stay in memory and clear on source replacement, reset, profile change or reload. Invalid replacement clears the older list. During reference loading results/exports are withheld. Without an active list, the check is explicitly not run. Product Validation Reports record check status/version and the active reference filename, unique count and full effective list.

An independent unguided test with a new ERP/data user has not been completed.

See ROADMAP.md for delivery order, PROJECT_STATUS.md for evidence and limits, FEEDBACK.md for historical professional feedback, and SESSION_LOG.md for build history.