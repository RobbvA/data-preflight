# DataPreflight Project Status

Last reviewed: 2026-10-03

## Product

DataPreflight is a browser-based quality gate for business data before ERP import. A user chooses a validation profile, uploads a file, confirms field mapping, reviews rule-based results, and exports rows without critical issues.

Core promise: **Validate data before ERP import.**

[Live app](https://data-preflight.vercel.app/) · [Product vision](PRODUCT_VISION.md) · [Roadmap](ROADMAP.md)

## Current milestone

**Milestone 5 — Validated Product Direction: in progress**

- Product positioning and the first-use flow have been updated. New-visitor feedback is still needed.
- The shared profile contract and browser-side workflow now support Invoice data and Customer master data.
- Workflow improvements are under way; the two domains still have separate workspace components.

Milestones 1–4 and the initial industry-feedback phase are complete.

## Available now

- Choose **Invoice data** or **Customer master data** before uploading a CSV, XLSX, or XLS file. Invoice is currently the default selection.
- Load an example through the same browser-side processing path as an uploaded file.
- Review suggested source-to-profile field mapping and change it manually. Ambiguous Customer header matches require a user choice.
- Hold validation and export until required fields are mapped and no source header is assigned twice.
- Normalize mapped values and apply deterministic, code-defined validation rules for the selected domain.
- See Blocked, Needs review, and Ready categories in both workspaces, with explanations and suggested fixes.
- Follow visible mapping, review, and export steps, with a prominent next action in the workspace.
- Export rows without critical issues and download an issue report. Rows with warnings remain exportable and require review before import.
- Reject CSV files with structural parse errors, including inconsistent field counts, before validation.

The homepage review preview is illustrative. Actual results appear after the user loads a file.

## Current implementation

- `src/lib/parseCsv.ts`: browser-side CSV and Excel adapters and the `ParsedDataSet` model.
- `src/lib/dataProfile.ts`: shared field definitions and Customer mapping candidates.
- `src/lib/fieldMapping.ts`: Invoice mapping suggestions using headers and sample values.
- `src/lib/validation/validationProfile.ts`: shared mapping and profile execution contract.
- `src/lib/profiles/` and `src/lib/validation/`: code-defined Invoice and Customer profiles, normalization, and rules.
- `src/components/CsvUploader.tsx`: domain selection and Invoice workflow.
- `src/components/data-preflight/CustomerWorkspace.tsx`: Customer workflow.
- `src/components/data-preflight/WorkspaceLayout.tsx`: shared page shell and header.

Both validation profiles identify a version in code. The app does not yet save a mapping, profile snapshot, or result manifest with an export.

## Product boundaries

- “Ready” means a record passed the **currently implemented checks for the selected profile**. It is not a guarantee that the target ERP will accept it.
- Customer master data support is an initial second domain, not proof that all master data types share the same rules.
- Validation profiles are selectable between two code-defined domains. Users cannot create, edit, or persist profiles or rules.
- Source corrections happen in the original file, followed by another upload. There is no in-app record editor or ERP connector.
- Current source-file parsing, mapping, normalization, validation, and export happen in the browser. Recheck this data flow before making broader privacy claims or adding analytics, APIs, storage, or AI.

## Known debt and next work

1. Invoice and Customer use separate workspace components. Extract only behavior that proves shared across both; keep their domain rules separate.
2. Make profile ID/version and applied mapping traceable in the review/export flow so a result can be reproduced and audited.
3. Verify the same input, mapping, and profile version produce the same classification across repeated runs. Test file-size limits, Excel edge cases, and browser behavior.
4. Reduce repeated explanation and show clearer feedback after a mapping or review action.
5. Validate the landing-page wording and workflow with new users before treating positioning as settled.

Do not add another domain just to exercise the architecture. Strengthen Invoice and Customer first.

## Documentation

- `README.md`: current capabilities, local setup, and code map.
- `PRODUCT_VISION.md`: product thesis and constraints.
- `ROADMAP.md`: milestone progress and next priorities.
- `FEEDBACK.md`: historical external feedback and explicitly labeled product interpretation.
- `SESSION_LOG.md`: dated build history and next-session handoff.