# DataPreflight Project Status

Last reviewed: 2026-10-07

## Product

DataPreflight is a browser-based quality gate for business data before ERP import. A user explicitly chooses a validation profile, uploads a file, checks field mapping, reviews rule-based results, and exports rows without critical issues.

Core promise: **Validate data before ERP import.**

[Live app](https://data-preflight.vercel.app/) · [Product vision](PRODUCT_VISION.md) · [Roadmap](ROADMAP.md)

## Current milestone

**Milestone 5 — Validated Product Direction: in progress**

Invoice data and Customer master data are working validation profiles. The profile-first workflow, mapping guards, review categories, explanations, CSV exports, and downloadable Validation Report are available.

Initial repeatability checks passed for fixed Invoice and Customer CSV files. An Invoice workbook with a cover sheet exposed an Excel worksheet-selection problem; users can now choose the worksheet before that file is parsed for validation. The selected worksheet appears in Validation details and the Validation Report.

Targeted CSV and XLSX files with up to 5,000 Invoice rows worked without noticeable browser delay in manual testing. These observations are not timed performance measurements or a tested maximum file size.

The next work is broader reliability testing with representative files, measured performance checks where needed, and eventually an unguided new-user test. Milestone 5 is not complete yet.

Milestones 1–4 and the initial industry-feedback phase are complete.

## Available now

- Choose **Invoice data** or **Customer master data** explicitly before uploading or loading an example. Neither profile is selected by default. The upload and example actions remain visible; using them without a profile prompts the user to choose one.
- Read one CSV, XLSX, or XLS file at a time through browser-side input adapters.
- Choose the relevant worksheet when an Excel workbook contains multiple populated worksheets. The chosen sheet is used for parsing and recorded with the validation context.
- Suggest source-to-profile field mapping and allow manual changes. Ambiguous Customer header matches require a user choice.
- Hold validation and export until required fields are mapped and no source column is assigned to multiple profile fields.
- Reject clear profile mismatches based on recognizable source headers, such as a Customer file selected under Invoice. This is a conservative safeguard, not proof that every uploaded file matches its profile.
- Normalize mapped values and apply code-defined, deterministic validation rules for the selected profile.
- Show **Blocked**, **Needs review**, and **Ready** tabs in both workspaces.
- Show issues with a problem, an explanation of why it matters, and a suggested fix.
- Follow visible **Mapping → Review → Export** steps. Invoice details open within the review cards instead of a separate Inspection mode panel.
- Show the selected profile ID and version, source filename, result counts, applied field mapping, and, for a selected Excel worksheet, the worksheet name under **Validation details**.
- Download a readable `validation-report.csv` containing the validation context, result counts, and applied mapping. The selected Excel worksheet is included when applicable.
- Export rows without critical issues and download an issue report. Rows with warnings remain exportable and should be reviewed before import.
- Reject structural CSV parse errors, including malformed quotes and inconsistent field counts, before mapping or validation.

The homepage review preview is illustrative. Actual results appear after the user loads a file.

## Current implementation

- `src/lib/parseCsv.ts`: browser-side CSV and Excel adapters, worksheet selection, and the `ParsedDataSet` model.
- `src/lib/dataProfile.ts`: shared field definitions and Customer mapping candidates.
- `src/lib/fieldMapping.ts`: Invoice mapping suggestions using headers and sample values.
- `src/lib/validation/validationProfile.ts`: shared mapping and profile execution contract.
- `src/lib/profiles/` and `src/lib/validation/`: code-defined Invoice and Customer profiles, normalization, and rules.
- `src/lib/profileCompatibility.ts`: conservative header-based profile mismatch detection.
- `src/lib/validationReport.ts`: deterministic, readable CSV output for the validation summary and applied mapping, including the selected worksheet where applicable.
- `src/components/CsvUploader.tsx`: profile selection and Invoice workflow.
- `src/components/data-preflight/CustomerWorkspace.tsx`: Customer workflow.
- `src/components/data-preflight/UploadSection.tsx`: file selection and worksheet-choice controls.
- `src/components/data-preflight/WorkspaceLayout.tsx`: shared page shell and header.
- `src/components/data-preflight/ValidationContextPanel.tsx`: visible validation context and report download.
- `src/components/data-preflight/InvoiceReviewSection.tsx` and `DataSetPreview.tsx`: Invoice review tabs and cards with inline details.

The Invoice validation profile is at version `1.0.1`; Customer is at version `1.0.0`.

## Evidence collected

- Repeated runs of the same Invoice CSV with the same mapping produced byte-identical clean exports, issue reports, and Validation Reports.
- Repeated runs of the same Customer CSV with the same mapping produced byte-identical clean exports, issue reports, and Validation Reports.
- A reordered Invoice XLSX with mixed headers mapped all 10 fields and produced the expected **3 blocked / 1 needs review / 2 ready** results.
- A reordered Customer XLSX mapped all 5 fields and produced the expected **3 blocked / 1 needs review / 2 ready** results.
- An Invoice XLSX with a populated `Read me` sheet before its `Invoice export` sheet initially selected the wrong content. After worksheet selection was added, choosing `Invoice export` mapped all 10 fields and produced the expected **3 blocked / 1 needs review / 2 ready** results.
- The selected worksheet appeared in the Invoice Validation Report. Repeating the same file and worksheet selection produced byte-identical reports.
- Selecting the Invoice worksheet under the Customer profile was rejected as a recognizable profile mismatch.
- The existing Customer XLSX still worked in the updated Customer workspace.
- A deliberately malformed Invoice CSV was stopped before validation.
- The Invoice review tabs were checked after removing the redundant **Show only blocked** control; Blocked, Needs review, and Ready each still showed their respective rows.
- Manually tested Invoice CSV files with **100, 1,000, and 5,000 rows**. The browser showed no noticeable delay. The first synthetic files used values such as `Company 000001`, which lowered automatic mapping confidence for `Company`; selecting that field manually gave the expected Ready results. A corrected 100-row fixture with ordinary company names mapped `Company` automatically.
- Manually tested Invoice XLSX files with **1,000 and 5,000 rows** and ordinary company names. Mapping completed automatically and the browser showed no noticeable delay.

These checks establish an initial repeatability and reliability baseline. They do not prove a maximum supported file size, cover all real-world workbooks, or independently verify every normalized value and issue across all tested files. No parse or validation timings were recorded.

## Product boundaries

- “Ready” means a record passed the **currently implemented checks for the selected profile**. It does not guarantee acceptance by a specific ERP.
- The profile mismatch check catches recognizable wrong-profile headers. A file with unfamiliar headers or a semantically incorrect manual mapping can still require human review.
- Invoice and Customer have separate workspace components. A generic, profile-driven workspace remains a possible later refactor, based on proven shared behavior.
- Users can select between two code-defined profiles. They cannot create or save their own profiles, rules, or mappings.
- Source corrections happen in the original file, followed by another upload. There is no in-app record editor or ERP connector.
- Source-file parsing, mapping, normalization, validation, and export in the current workflow run in the browser. Recheck the complete deployed data flow before expanding privacy claims or adding analytics, APIs, storage, or AI.
- The Validation Report captures profile, version, source filename, selected worksheet where applicable, result counts, and mapping. It does not contain a cryptographic input fingerprint or a full record of every normalized value and issue.
- No file-size or row-count limit has been established from the current manual checks.

## Known debt and next work

1. **Reliability matrix:** test more representative Invoice and Customer files across CSV and XLSX, including missing values, unusual headers, reordered columns, malformed input, and Excel edge cases. Compare individual normalized values and issues against explicit expectations.
2. **Repeatability depth:** repeat representative CSV and XLSX runs and compare mapping, normalized values, classifications, issues, clean exports, issue reports, and Validation Reports. Investigate any mismatch before expanding scope.
3. **Performance measurements:** record file size, row count, parse time, validation time, and browser responsiveness for representative files. The current 5,000-row checks are subjective observations. Determine a measured file-size or row guard before adding or advertising one.
4. **New-user test:** after obvious reliability issues have been addressed, observe whether someone unfamiliar with DataPreflight can choose a profile, upload, understand mapping and issues, and export without guidance.
5. **Architecture:** extract shared workspace behavior only where Invoice and Customer demonstrate a real common pattern. Keep domain-specific rules independent.

Do not add a third validation profile or start a broader feature sprint before checking the Milestone 5 exit criteria.

## Documentation

- `README.md`: capabilities, local setup, and code map.
- `PRODUCT_VISION.md`: product thesis and constraints.
- `ROADMAP.md`: milestone progress and next priorities.
- `FEEDBACK.md`: historical external feedback and explicitly labeled product interpretation.
- `SESSION_LOG.md`: dated build history and next-session handoff.