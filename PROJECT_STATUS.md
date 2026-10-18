# DataPreflight Project Status

Last reviewed: 2026-10-18

## Product

DataPreflight is a browser-based quality gate for business data before ERP import.

A user explicitly chooses a validation profile, uploads a file, checks field mapping, reviews deterministic results, and exports rows without critical issues.

Core promise: **Validate data before ERP import.**

[Live app](https://data-preflight.vercel.app/) · [Product vision](PRODUCT_VISION.md) · [Roadmap](ROADMAP.md)

## Current milestone

**Milestone 6 — Professional ERP validation platform: in progress**

M5 was internally completed on 2026-10-11.

M6 implementation started on 2026-10-18.

**M6.1 — Shared workflow foundation is complete within its agreed scope.**

Completed:

- Upload lifecycle guards.
- Shared mapping readiness.
- Shared mapping dialog.
- Shared review controls.
- Consistent Invoice review selection and empty-category behavior.
- More precise review and export guidance.

Delivery status:

- `6d96ccd`: upload lifecycle guards and shared mapping; committed and pushed.
- `e68938b`: shared review controls; committed and pushed.
- Final review-selection and wording changes: locally applied and verified; commit and push still pending at this documentation checkpoint.

Local verification does not establish that the deployed site contains all changes.

An independent, unguided test with a new ERP/data user remains outstanding.

## Completed in M6 so far

### M6.1a — Upload lifecycle safety

Both workspaces now:

- Assign a request ID to each asynchronous file-loading action.
- Ignore results from outdated actions.
- Ignore outdated errors.
- Prevent outdated finally handlers from clearing a newer loading state.
- Invalidate earlier actions on reset.
- Invalidate pending work on profile changes.
- Invalidate pending actions during workspace cleanup.

Customer reset also explicitly clears loading.

This prevents outdated asynchronous completions from restoring old data or changing a newer flow.

It does not cancel parser work already in progress.

### M6.1b — Shared mapping readiness

Added `src/lib/mappingStatus.ts`.

Both workspaces use it to determine:

- Missing required fields.
- Duplicate source-column assignments.
- Number of mapped fields.
- Whether validation can proceed.

The helper does not replace mapping suggestion algorithms or domain validation rules.

Invoice retains its header/sample-based suggestions. Customer retains its header-based suggestions.

### M6.1c — Shared mapping interface

Added `src/components/data-preflight/ProfileMappingPanel.tsx`.

Both profiles now use the same mapping dialog with:

- Required and optional field labels.
- Clear missing-mapping feedback.
- Duplicate feedback on affected fields.
- A live mapping-status summary.
- Invoice automatic-suggestion explanations.
- Customer ambiguous-header hints.
- Associated labels and field-level accessibility attributes.
- Native modal keyboard behavior.
- Escape dismissal.
- Focus restoration after manual opening.
- Background scroll locking.
- Responsive width.

The initial panel appeared on the left. Explicit positioning on the dialog element corrected the alignment; the user confirmed the right-side placement.

Customer opens the mapping panel automatically when a newly loaded file requires mapping correction, matching the Invoice flow.

### M6.1d — Shared review controls

Added `src/components/data-preflight/ReviewStatusControls.tsx`.

Invoice and Customer now share:

- Blocked, Needs review, and Ready category controls.
- Category counts.
- Selected-state styling.
- Visible keyboard focus.
- Status-summary presentation.
- The explanation “Passed current checks” for Ready results.

The controls use buttons with pressed-state semantics rather than incomplete tab semantics.

Invoice category wording changed from “Import-ready” to “Ready invoices”.

Domain-specific row content, normalization, validation, and explanations remain separate.

### M6.1e — Review selection and export guidance

Aligned Invoice review behavior:

- A fresh result initially selects Blocked when blockers exist.
- Otherwise it selects Needs review when warnings exist.
- Otherwise it selects Ready.
- Explicitly selecting an empty category keeps that category selected and shows its empty state.
- Selecting a collapsed category opens its list.
- List collapse remains available.
- Loading another file or resetting clears the previous category choice.

Updated relevant row-status and export guidance:

- Ready means “Passed current checks”.
- Passing implemented checks is not presented as guaranteed acceptance by a target ERP.
- Warning-only rows remain exportable and require review.
- Critical rows remain excluded from the rows-without-blockers export.

This increment changes review behavior and explanatory copy. It does not intentionally change domain normalization, validation rules, or CSV serialization.

### M6.1 scope assessment

The shared foundation is sufficient to begin Vendor.

M6.1 does not require a complete generic workspace rewrite.

Invoice and Customer still retain separate workspace components and domain-specific row presentation. Further extraction should follow concrete reuse needs when adding Vendor and Product.

## Available profiles and workflow

Available profiles:

- Invoice data.
- Customer master data.

Both are defined and versioned in code.

Current workflow:

Profile → Upload → Worksheet where applicable → Mapping → Normalize/Validate → Review → Export.

Available behavior:

- Explicit profile selection before uploading or loading an example.
- Browser-side CSV, XLSX, and XLS parsing.
- Worksheet selection when several populated Excel worksheets exist.
- Suggested and manually adjustable field mapping.
- Shared guards against missing required mappings and duplicate assignments.
- Conservative recognizable-profile mismatch detection.
- Deterministic normalization and validation.
- Blocked, Needs review, and Ready categories.
- Problem, why, and fix explanations.
- Export excluding rows with critical issues.
- Warning-only rows remain exportable and should be reviewed.
- Validation details and a downloadable Validation Report.
- Structural CSV errors rejected before validation.
- Outdated asynchronous reads ignored.

Vendor, Product, saved mappings, reference data, user-authored rules, and ERP connectors are not implemented yet.

## Current implementation

| Responsibility | Location |
| --- | --- |
| Input adapters, worksheet handling, ParsedDataSet | `src/lib/parseCsv.ts` |
| Shared field definitions and basic mapping candidates | `src/lib/dataProfile.ts` |
| Invoice mapping suggestions | `src/lib/fieldMapping.ts` |
| Shared mapping readiness | `src/lib/mappingStatus.ts` |
| Shared profile execution contract | `src/lib/validation/validationProfile.ts` |
| Profile definitions | `src/lib/profiles/` |
| Domain normalization and validation | `src/lib/normalization/`, `src/lib/validation/`, `src/lib/validateRows.ts` |
| Recognizable-profile mismatch detection | `src/lib/profileCompatibility.ts` |
| Deterministic Validation Report | `src/lib/validationReport.ts` |
| CSV downloads and export guidance | `src/lib/exportData.ts` |
| Profile selection and Invoice flow | `src/components/CsvUploader.tsx` |
| Customer flow | `src/components/data-preflight/CustomerWorkspace.tsx` |
| Shared mapping dialog | `src/components/data-preflight/ProfileMappingPanel.tsx` |
| Shared review controls | `src/components/data-preflight/ReviewStatusControls.tsx` |
| Invoice review behavior | `src/components/data-preflight/InvoiceReviewSection.tsx` |
| Review types and status copy | `src/components/data-preflight/types.ts` |
| File and worksheet controls | `src/components/data-preflight/UploadSection.tsx` |
| Shared page shell | `src/components/data-preflight/WorkspaceLayout.tsx` |
| Visible validation context | `src/components/data-preflight/ValidationContextPanel.tsx` |

Invoice profile version: `1.0.2`.

Customer profile version: `1.0.0`.

The M6.1 work did not intentionally change domain normalization or validation rules.

## Evidence collected

### M5 reliability baseline

- Repeated identical Invoice CSV runs produced byte-identical row exports, issue reports, and Validation Reports.
- Repeated identical Customer CSV runs produced byte-identical row exports, issue reports, and Validation Reports.
- Reordered Invoice and Customer XLSX fixtures produced the expected 3 blocked / 1 needs review / 2 ready classifications.
- A multi-sheet Invoice workbook exposed incorrect automatic sheet selection. Explicit worksheet selection resolved the tested case.
- Repeated runs using the same workbook and worksheet produced byte-identical Validation Reports.
- A recognizable Invoice worksheet under Customer was rejected.
- A malformed-quotes CSV was rejected before validation.
- Six-row Invoice and Customer CSV fixtures were checked against explicit mapping, normalized values, issues, classifications, and exported rows.
- An empty-first-sheet Invoice workbook produced the expected 1 blocked / 1 needs review / 1 ready from its populated worksheet.
- The selected worksheet appeared in the Validation Report.

### Value-level corrections during M5

The Invoice fixture exposed:

- Incorrect automatic mapping from Invoice Number to an unrelated Source note column.
- Rejection of a valid US-style grouped amount.
- An internal duplicate-detection key appearing in the row export.

Header matching and numeric sample detection were corrected. Tested European and US grouped values normalize consistently. The internal key was excluded from the row export.

Invoice version advanced to `1.0.2` after the normalization behavior changed.

The final Invoice fixture exported exactly INV-V101, INV-V102, and INV-V105, including the warning-only row.

The Customer fixture exported exactly C-401, C-403, and C-405. Its normalized name, email, country, and VAT values matched expectations; the warning-only row remained exportable.

### M5 responsiveness observations

Manual Invoice checks covered:

- CSV: 100, 1,000, and 5,000 rows.
- XLSX: 1,000 and 5,000 rows.

No noticeable delay was reported.

Parse time, validation time, memory use, and a supported maximum were not measured. These observations are not a performance guarantee.

### M5 privacy and usability checks

On 2026-10-11, Chrome Network showed no outgoing requests during the tested deployed Invoice upload and downloads.

Source review found browser-side processing and Blob downloads in that flow. This evidence covers the tested path and must not be generalized to future integrations.

A mobile walkthrough found the flow usable, with cramped spacing noted.

No independent unguided new-user test was completed. Simon's informal interaction is not treated as reliable self-service UX evidence.

### M6.1 checks on 2026-10-18

Development-time checks:

- Sixteen focused asynchronous-flow checks passed using mocked parsing and state setters.
- Shared mapping guards were compared with previous behavior using generated mapping combinations for the existing profiles.
- 135 focused checks exercised extracted Invoice category-selection and list-toggle behavior.

These were development-time checks in the assistant's environment. They are not a committed application test suite or browser end-to-end tests.

User-reported local browser checks:

- Invoice and Customer example loading, reset, and profile switching worked.
- Missing required mappings blocked review/export.
- Duplicate source-column assignments blocked review/export.
- Restoring valid mappings restored results.
- The shared mapping panel worked in both profiles.
- Escape worked; the user confirmed the requested keyboard/focus checks.
- Right-side placement worked after the positioning correction.
- Shared review controls showed the expected counts and rows.
- Switching categories opened the relevant list.
- Selecting an empty category preserved the selection and displayed an empty state.
- Updated Ready guidance appeared in the reviewed flow.
- The requested narrow-desktop-viewport checks were reported complete.

Final local project checks:

- `npm run lint`: 0 errors, 2 existing warnings.
- TypeScript passed during the production build.
- `npm run build`: passed.

Existing warnings:

- Unused Metadata import in `src/app/layout.tsx`.
- Unused `_tone` parameter in `src/components/data-preflight/DataSetPreview.tsx`.

The narrow desktop check is not a full real-device mobile review.

No screen-reader audit or fresh deployed M6 Network check was performed.

## Product boundaries

- Ready means the selected profile's implemented checks passed. It is not a target-ERP acceptance guarantee.
- Warning-only rows may remain in the export.
- Mapping suggestions and recognizable-profile detection do not prove semantic correctness.
- Correcting records happens in the source file, followed by another upload.
- Users cannot create rules or save mappings yet.
- Reports record profile/version, source filename, worksheet where applicable, mapping, and counts.
- Reports do not include a cryptographic input fingerprint or complete rule snapshot.
- No measured maximum file size or row count has been established.
- The historical deployed privacy check is not a fresh deployed M6 verification.
- No independent evidence of self-service usability or willingness to pay has been established in this milestone.

## Quality standard

Each increment follows:

Problem → Design → Implementation → Edge cases → UX → Testing → Polish → Done.

Every increment should be:

- Effective for the intended task.
- Reliable under normal and relevant abnormal input.
- Clear about errors and recovery.
- Consistent with the rest of the product.
- Visually polished and readable.
- Usable with essential keyboard and focus support.

Quality belongs in each implementation step, rather than being postponed to a final redesign.

Product decisions should support this promise:

“DataPreflight should be the tool you run before ERP data is allowed to go anywhere important.”

## Next work

1. Commit and push the final M6.1 review-selection, wording, and documentation changes.
2. Begin M6.2 by specifying Vendor fields, normalization, rules, and expected fixture outcomes.
3. Implement the limited Vendor profile using the existing execution contract and shared UI.
4. Add local reusable mappings.
5. Run the first independent usage test after Vendor and mapping reuse, if a suitable tester is available.
6. Add the limited Product profile and bounded reference-data check.
7. Complete cross-profile, privacy, responsive, and outreach-readiness checks.

Do not add a complete copied workspace for Vendor without first assessing which existing behavior can be reused.

Keep DataPreflight as the working product name. Renaming is not a prerequisite for implementation; do not interpret this as legal clearance.

## Documentation

- README.md: capabilities, setup, and code map.
- PRODUCT_VISION.md: product thesis and boundaries.
- ROADMAP.md: agreed delivery order and acceptance criteria.
- FEEDBACK.md: historical external feedback and labeled product interpretation.
- SESSION_LOG.md: dated history and handoff.

Update documentation at coherent session checkpoints.

Run lint/build at a completed implementation checkpoint or when a change warrants it, rather than after every minor edit.