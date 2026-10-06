# DataPreflight Project Status

Last reviewed: 2026-10-06

## Product

DataPreflight is a browser-based quality gate for business data before ERP import. A user explicitly chooses a validation profile, uploads a file, checks field mapping, reviews rule-based results, and exports rows without critical issues.

Core promise: **Validate data before ERP import.**

[Live app](https://data-preflight.vercel.app/) · [Product vision](PRODUCT_VISION.md) · [Roadmap](ROADMAP.md)

## Current milestone

**Milestone 5 — Validated Product Direction: in progress**

Invoice data and Customer master data are working validation profiles. The profile-first workflow, mapping guards, review categories, explanations, CSV exports, and downloadable Validation Report are available.

Initial repeatability checks with fixed Invoice and Customer CSV files passed. The next work is broader reliability testing, measured performance checks, and eventually an unguided new-user test. Milestone 5 is not complete yet.

Milestones 1–4 and the initial industry-feedback phase are complete.

## Available now

- Choose **Invoice data** or **Customer master data** explicitly before uploading or loading an example. Neither profile is selected by default. The upload and example actions remain visible; using them without a profile prompts the user to choose one.
- Read one CSV, XLSX, or XLS file at a time through browser-side input adapters.
- Suggest source-to-profile field mapping and allow manual changes. Ambiguous Customer header matches require a user choice.
- Hold validation and export until required fields are mapped and no source column is assigned to multiple profile fields.
- Reject clear profile mismatches based on recognizable source headers, such as a Customer file selected under Invoice. This is a conservative safeguard, not proof that every uploaded file matches its profile.
- Normalize mapped values and apply code-defined, deterministic validation rules for the selected profile.
- Show **Blocked**, **Needs review**, and **Ready** tabs in both workspaces.
- Show issues with a problem, an explanation of why it matters, and a suggested fix.
- Follow visible **Mapping → Review → Export** steps. Invoice details open within the review cards instead of a separate Inspection mode panel.
- Show the selected profile ID and version, source filename, result counts, and applied field mapping under **Validation details**.
- Download a readable `validation-report.csv` containing the validation context, result counts, and applied mapping.
- Export rows without critical issues and download an issue report. Rows with warnings remain exportable and should be reviewed before import.
- Reject structural CSV parse errors, including malformed quotes and inconsistent field counts, before mapping or validation.

The homepage review preview is illustrative. Actual results appear after the user loads a file.

## Current implementation

- `src/lib/parseCsv.ts`: browser-side CSV and Excel adapters and the `ParsedDataSet` model.
- `src/lib/dataProfile.ts`: shared field definitions and Customer mapping candidates.
- `src/lib/fieldMapping.ts`: Invoice mapping suggestions using headers and sample values.
- `src/lib/validation/validationProfile.ts`: shared mapping and profile execution contract.
- `src/lib/profiles/` and `src/lib/validation/`: code-defined Invoice and Customer profiles, normalization, and rules.
- `src/lib/profileCompatibility.ts`: conservative header-based profile mismatch detection.
- `src/lib/validationReport.ts`: deterministic, readable CSV output for the validation summary and applied mapping.
- `src/components/CsvUploader.tsx`: profile selection and Invoice workflow.
- `src/components/data-preflight/CustomerWorkspace.tsx`: Customer workflow.
- `src/components/data-preflight/WorkspaceLayout.tsx`: shared page shell and header.
- `src/components/data-preflight/ValidationContextPanel.tsx`: visible validation context and report download.
- `src/components/data-preflight/InvoiceReviewSection.tsx` and `DataSetPreview.tsx`: Invoice review tabs and cards with inline details.

The Invoice validation profile is at version `1.0.1`; Customer is at version `1.0.0`.

## Evidence collected

- Repeated runs of the same Invoice CSV with the same mapping produced byte-identical clean exports, issue reports, and Validation Reports.
- Repeated runs of the same Customer CSV with the same mapping produced byte-identical clean exports, issue reports, and Validation Reports.
- A reordered Invoice XLSX with mixed headers mapped all 10 fields and produced the expected **3 blocked / 1 needs review / 2 ready** results.
- A reordered Customer XLSX mapped all 5 fields and produced the expected **3 blocked / 1 needs review / 2 ready** results.
- A deliberately malformed Invoice CSV was stopped before validation.
- The Invoice review tabs were checked after removing the redundant **Show only blocked** control; Blocked, Needs review, and Ready each still showed their respective rows.

These checks establish an initial repeatability baseline. They do not yet cover a wide variety of real-world files, all normalized values independently, larger datasets, or browser performance.

## Product boundaries

- “Ready” means a record passed the **currently implemented checks for the selected profile**. It does not guarantee acceptance by a specific ERP.
- The profile mismatch check catches recognizable wrong-profile headers. A file with unfamiliar headers or a semantically incorrect manual mapping can still require human review.
- Invoice and Customer have separate workspace components. A generic, profile-driven workspace remains a possible later refactor, based on proven shared behavior.
- Users can select between two code-defined profiles. They cannot create or save their own profiles, rules, or mappings.
- Source corrections happen in the original file, followed by another upload. There is no in-app record editor or ERP connector.
- Source-file parsing, mapping, normalization, validation, and export in the current workflow run in the browser. Recheck the complete deployed data flow before expanding privacy claims or adding analytics, APIs, storage, or AI.
- The Validation Report captures profile, version, source filename, result counts, and mapping. It does not contain a cryptographic input fingerprint or a full record of every normalized value and issue.

## Known debt and next work

1. **Reliability matrix:** test more Invoice and Customer files across CSV and XLSX, including missing values, unusual headers, reordered columns, malformed input, and Excel edge cases. Compare results against explicit expectations.
2. **Repeatability depth:** repeat representative CSV and XLSX runs and compare mapping, normalized values, classifications, issues, clean exports, issue reports, and Validation Reports. Investigate any mismatch before expanding scope.
3. **Performance measurements:** test small, normal, and large files; record file size, row count, parse time, validation time, and browser responsiveness. Determine a measured file-size or row guard before adding or advertising one.
4. **New-user test:** after obvious reliability issues have been addressed, observe whether someone unfamiliar with DataPreflight can choose a profile, upload, understand mapping and issues, and export without guidance.
5. **Architecture:** extract shared workspace behavior only where Invoice and Customer demonstrate a real common pattern. Keep domain-specific rules independent.

Do not add a third validation profile or start a broader feature sprint before checking the Milestone 5 exit criteria.

## Documentation

- `README.md`: capabilities, local setup, and code map.
- `PRODUCT_VISION.md`: product thesis and constraints.
- `ROADMAP.md`: milestone progress and next priorities.
- `FEEDBACK.md`: historical external feedback and explicitly labeled product interpretation.
- `SESSION_LOG.md`: dated build history and next-session handoff.