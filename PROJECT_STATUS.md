# DataPreflight Project Status

Last reviewed: 2026-10-11

## Product

DataPreflight is a browser-based quality gate for business data before ERP import. A user explicitly chooses a validation profile, uploads a file, checks or adjusts field mapping, reviews rule-based results, and exports rows without critical issues.

Core promise: **Validate data before ERP import.**

[Live app](https://data-preflight.vercel.app/) · [Product vision](PRODUCT_VISION.md) · [Roadmap](ROADMAP.md)

## Current milestone

**Milestone 5 — Validated Product Direction: internally complete (2026-10-11)**

Invoice and Customer are working profiles with explicit selection, guarded mapping, deterministic review, explainable issues, controlled exports, and a Validation Report. Fixed runs produced byte-identical outputs. Representative value-level files matched expected normalization, issues, classifications, and exported rows.

Targeted CSV and XLSX files with up to 5,000 Invoice rows worked without noticeable browser delay. This is not a measured performance limit.

A deployed browser-network check during the tested Invoice upload and downloads showed no outgoing requests from those actions. An XLSX with an empty first sheet and populated Invoice sheet returned the expected **1 blocked / 1 needs review / 1 ready**. The user reported that the mobile flow worked, though the layout felt cramped.

**Scope of completion:** M5 is closed against internal reliability and workflow checks. An independent, unguided new-user test has not been completed; first-use understanding and adoption remain unverified. Carry these questions into later outreach. Simon's informal interaction is not treated as UX evidence.

Milestones 1–4 and the initial industry-feedback phase are also complete.

## Available now

- Choose **Invoice data** or **Customer master data** explicitly before uploading or loading an example. Neither profile is selected by default. The upload and example actions remain visible; using them without a profile prompts the user to choose one.
- Read one CSV, XLSX, or XLS file at a time through browser-side input adapters.
- Choose the relevant worksheet when an Excel workbook contains multiple populated worksheets. The chosen sheet is used for parsing and recorded with the validation context.
- Suggest source-to-profile field mapping and allow manual changes. Mapping is a visible workspace tool; a correct automatic suggestion does not require the user to open it.
- Hold validation and export until required fields are mapped and no source column is assigned to multiple profile fields.
- Reject clear profile mismatches based on recognizable source headers. This is a conservative safeguard, not proof that every uploaded file matches its profile.
- Normalize mapped values and apply code-defined, deterministic rules for the selected profile.
- Show **Blocked**, **Needs review**, and **Ready** tabs in both workspaces.
- Show issues with a problem, an explanation of why it matters, and a suggested fix.
- Follow visible **Mapping → Review → Export** steps. Both workspaces use a compact mapping summary when mapping is complete and place the review results in Step 2.
- Show the selected profile ID and version, source filename, result counts, applied field mapping, and, for a selected Excel worksheet, the worksheet name under **Validation details**.
- Download a readable `validation-report.csv` containing the validation context, result counts, and applied mapping. The selected Excel worksheet is included when applicable.
- Export rows without critical issues and download an issue report. Rows with warnings remain exportable and should be reviewed before import.
- Reject structural CSV parse errors, including malformed quotes and inconsistent field counts, before mapping or validation.

The homepage review preview is illustrative. Actual results appear after the user loads a file.

## Current implementation

- `src/lib/parseCsv.ts`: browser-side CSV and Excel adapters, worksheet selection, and the `ParsedDataSet` model.
- `src/lib/dataProfile.ts`: shared field definitions and Customer mapping candidates.
- `src/lib/fieldMapping.ts`: Invoice mapping suggestions using headers and sample values.
- `src/lib/normalization/`: normalization helpers, including supported European and US number formats.
- `src/lib/validation/validationProfile.ts`: shared mapping and profile execution contract.
- `src/lib/profiles/` and `src/lib/validation/`: code-defined Invoice and Customer profiles, normalization, and rules.
- `src/lib/profileCompatibility.ts`: conservative header-based profile mismatch detection.
- `src/lib/validationReport.ts`: deterministic CSV output for the validation summary and applied mapping, including the selected worksheet where applicable.
- `src/lib/exportData.ts`: CSV downloads; the internal Invoice duplicate-detection key is omitted from the user-facing row export.
- `src/components/CsvUploader.tsx`: profile selection and Invoice workflow.
- `src/components/data-preflight/CustomerWorkspace.tsx`: Customer workflow, aligned with the Invoice mapping, review, and export layout.
- `src/components/data-preflight/UploadSection.tsx`: file selection and worksheet-choice controls.
- `src/components/data-preflight/WorkspaceLayout.tsx`: shared page shell and header.
- `src/components/data-preflight/ValidationContextPanel.tsx`: visible validation context and report download.
- `src/components/data-preflight/InvoiceReviewSection.tsx` and `DataSetPreview.tsx`: Invoice review tabs and cards with inline details.

The Invoice validation profile is at version `1.0.2` after the number-normalization change. Customer is at version `1.0.0`.

## Evidence collected

### Repeatability and Excel handling

- Repeated runs of the same Invoice CSV with the same mapping produced byte-identical row exports, issue reports, and Validation Reports.
- Repeated runs of the same Customer CSV with the same mapping produced byte-identical row exports, issue reports, and Validation Reports.
- A reordered Invoice XLSX with mixed headers mapped all 10 fields and produced the expected **3 blocked / 1 needs review / 2 ready** results.
- A reordered Customer XLSX mapped all 5 fields and produced the expected **3 blocked / 1 needs review / 2 ready** results.
- An Invoice XLSX with a populated `Read me` sheet before its `Invoice export` sheet initially selected the wrong content. After worksheet selection was added, choosing `Invoice export` mapped all 10 fields and produced the expected **3 blocked / 1 needs review / 2 ready** results.
- The selected worksheet appeared in the Invoice Validation Report. Repeating the same file and worksheet selection produced byte-identical reports.
- Selecting the Invoice worksheet under the Customer profile was rejected as a recognizable profile mismatch.
- The existing Customer XLSX still worked in the updated Customer workspace.
- A deliberately malformed Invoice CSV was stopped before validation.
- The Invoice review tabs were checked after removing the redundant **Show only blocked** control.

### Value-level CSV checks on 2026-10-10

- The six-row Invoice fixture exposed an incorrect automatic mapping from `invoice_number` to an unrelated `Source note` column. Header matching and numeric sample detection were corrected. A fresh upload then mapped `Invoice No.` automatically without requiring manual mapping.
- The same fixture exposed rejection of a valid US-style amount, `1,234.56`. Number normalization was adjusted so that this value and the European-style `1.234,56` both normalize to `1234.56`.
- With the corrected automatic mapping and normalization, the Invoice fixture produced **3 blocked / 1 needs review / 2 ready**. Duplicate numbers differing only by letter case were blocked, a missing amount was blocked, and the date-order warning remained exportable.
- The Invoice row export contained exactly the three rows without blockers. Its normalized amounts and dates were checked from the CSV. An internal `normalized_invoice_key` column was found in the export and removed from the downloaded row file without removing it from duplicate detection.
- The six-row Customer fixture mapped all five profile fields automatically and produced **3 blocked / 1 needs review / 2 ready**. A missing name and both case-variant duplicate IDs were blocked. One row had an invalid email and three-letter country-code warning.
- The Customer row export contained exactly `C-401`, `C-403`, and `C-405`. Its normalized name, email, country, and VAT values were checked directly from the CSV. The warning row remained exportable under the current rules.
- The Customer review layout was brought closer to Invoice: completed mapping is compact, the separate dominant next-action card was removed, and the result tabs and cards form the main review area.

### Responsiveness

- Manually tested Invoice CSV files with **100, 1,000, and 5,000 rows**. The browser showed no noticeable delay.
- Manually tested Invoice XLSX files with **1,000 and 5,000 rows**. Mapping completed automatically and the browser showed no noticeable delay.
- No parse time, validation time, memory use, or maximum supported size was measured. A size guard should be based on evidence if one becomes necessary; these measurements are not a blocker for the current Milestone 5 flow.

### Final internal checks on 2026-10-11

- On the deployed site, Chrome Network stayed empty during the tested Invoice upload and downloads of the Validation Report, row export, and issue report. Source review found browser-side parsing and Blob downloads in this file flow. This verifies the tested path, not future integrations.
- An XLSX with a genuinely empty first worksheet and three rows on the populated `Invoice data` worksheet gave the expected **1 blocked / 1 needs review / 1 ready**; the worksheet appeared in the Validation Report.
- The user completed a mobile walkthrough and found the flow usable. Cramped spacing is later polish, not a blocker. Desktop Invoice/Customer flows and review tabs were exercised earlier.
- No independent unguided new-user result was collected. Simon's informal interaction did not justify a UX change.

These checks provide a targeted reliability baseline. They do not cover every real-world workbook, prove a maximum supported file size, or establish how an unfamiliar ERP/data user understands the product.

## Product boundaries

- “Ready” means a record passed the **currently implemented checks for the selected profile**. It does not guarantee acceptance by a specific ERP.
- Rows with warnings can remain in the export. Users should inspect them before ERP import.
- The profile mismatch check catches recognizable wrong-profile headers. A file with unfamiliar headers or a semantically incorrect manual mapping can still require human review.
- Invoice and Customer have separate workspace components. A generic, profile-driven workspace remains a possible later refactor based on proven shared behavior.
- Users can select between two code-defined profiles. They cannot create or save their own profiles, rules, or mappings.
- Source corrections happen in the original file, followed by another upload. There is no in-app record editor or ERP connector.
- Source-file parsing, mapping, normalization, validation, and export in the current workflow run in the browser. The deployed Network check found no outgoing requests during the tested file and download flow. Recheck privacy whenever analytics, APIs, storage, AI, or deployment behavior changes.
- The Validation Report captures profile, version, source filename, selected worksheet where applicable, result counts, and mapping. It does not contain a cryptographic input fingerprint or a full record of every normalized value and issue.
- No file-size or row-count limit has been established from the current manual checks.

## Known debt and next work

1. **M6 planning:** define a cohesive platform increment before implementation. Candidates are Vendor/Supplier and Product/Material profiles, locally reusable mappings, and a narrow reference-data validation prototype. Keep the workspaces visually and behaviorally consistent.
2. **Independent product understanding:** an unfamiliar ERP/data user has not completed an unguided workflow. Test before claiming self-service usability or using it as outreach evidence.
3. **Focused polish:** mobile spacing, first-use hierarchy, landing preview consistency, and rule visibility can be revisited when concrete friction appears; avoid a speculative redesign.
4. **Reliability on new scope:** repeat value-level and privacy checks as new profiles or processing paths are added. Establish a file-size guard only after measuring a real limit.
5. **Architecture:** extract shared workspace behavior where Invoice and Customer show a stable common pattern; keep domain-specific rules independent.
6. **Branding:** research and verify a more distinctive product name before broader outreach or launch.

No Vendor, Product, saved mapping, or reference-data feature was implemented as part of the M5 close. The independent usability question remains open.

## Documentation

- `README.md`: capabilities, local setup, and code map.
- `PRODUCT_VISION.md`: product thesis and constraints.
- `ROADMAP.md`: milestone progress and next priorities.
- `FEEDBACK.md`: historical external feedback and explicitly labeled product interpretation.
- `SESSION_LOG.md`: dated build history and next-session handoff.

Project Markdown is synchronized at the end of each build session.