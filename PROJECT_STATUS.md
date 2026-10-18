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

M6 implementation started locally on 2026-10-18. The first increment covers upload lifecycle safety, shared mapping guards, and a shared mapping panel.

The changes recorded in this session were checked locally. Commit, push, and deployment confirmation are separate steps; local test results do not establish that the deployed site already contains this increment.

An independent, unguided test with a new ERP/data user remains outstanding.

## Completed in M6 so far

### M6.1a — Upload lifecycle safety

- Both workspaces assign a request ID to each asynchronous file-loading action.
- Results from outdated actions are ignored.
- Outdated errors cannot replace the current error state.
- Outdated finally handlers cannot clear a newer loading state.
- Reset invalidates earlier actions.
- Profile changes invalidate pending work.
- Workspace cleanup invalidates pending actions on unmount.
- Customer reset explicitly clears loading.

This prevents outdated asynchronous completions from restoring old data or changing a newer flow.

It does not cancel work already being performed by the parser.

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
- Explicit labels and field-level accessibility attributes.
- Native modal keyboard behavior.
- Escape dismissal.
- Focus restoration after manual opening.
- Background scroll locking.
- Responsive width.

The initial panel appeared on the left. Explicit positioning on the dialog element corrected the alignment; the user confirmed the right-side placement.

Customer now opens the mapping panel automatically when a newly loaded file requires mapping correction, matching the Invoice flow.

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
- Warning rows remain exportable and should be reviewed.
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
| CSV downloads | `src/lib/exportData.ts` |
| Profile selection and Invoice flow | `src/components/CsvUploader.tsx` |
| Customer flow | `src/components/data-preflight/CustomerWorkspace.tsx` |
| Shared mapping dialog | `src/components/data-preflight/ProfileMappingPanel.tsx` |
| File and worksheet controls | `src/components/data-preflight/UploadSection.tsx` |
| Shared page shell | `src/components/data-preflight/WorkspaceLayout.tsx` |
| Visible validation context | `src/components/data-preflight/ValidationContextPanel.tsx` |

Invoice and Customer retain separate workspace components and review implementations.

Invoice profile version: `1.0.2`.

Customer profile version: `1.0.0`.

The M6 mapping/UI work did not intentionally change domain normalization or validation rules.

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

### M6 checks on 2026-10-18

Development-time checks:

- Sixteen focused asynchronous-flow checks passed using mocked parsing and state setters.
- Shared mapping guards were compared with the previous behavior using generated mapping combinations for the existing profiles.
- These checks were run in the assistant's development environment; they are not a committed application test suite or browser end-to-end tests.

User-reported local browser checks:

- Invoice and Customer example loading, reset, and profile switching worked.
- Missing required mappings blocked review/export.
- Duplicate source-column assignments blocked review/export.
- Restoring valid mappings restored results.
- The shared mapping panel worked in both profiles.
- Escape worked; the user confirmed the remaining requested keyboard/focus checks.
- Right-side placement worked after the positioning correction.

Local project checks:

- `npm run lint`: 0 errors, 2 existing warnings.
- TypeScript passed during the production build.
- `npm run build`: passed.

Existing warnings:

- Unused Metadata import in `src/app/layout.tsx`.
- Unused `_tone` parameter in `src/components/data-preflight/DataSetPreview.tsx`.

The new mapping dialog has not received a separate mobile visual walkthrough or assistive-technology audit.

## Product boundaries

- Ready means the selected profile's implemented checks passed. It is not a target-ERP acceptance guarantee.
- Warning rows may remain in the export.
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

## Next work

1. Continue M6.1 with shared review controls and consistent status behavior.
2. Preserve domain-specific row presentation, normalization, and rules.
3. Resolve overly strong import-safety wording when editing the relevant review components.
4. Add the limited Vendor profile after the shared foundation is sufficient.
5. Add local reusable mappings.
6. Run the first independent usage test after Vendor and mapping reuse, if a suitable tester is available.
7. Add the limited Product profile and bounded reference-data check.
8. Complete cross-profile, privacy, responsive, and outreach-readiness checks.

Keep DataPreflight as the working product name. Renaming is not a prerequisite for implementation; do not interpret this as legal clearance.

## Documentation

- README.md: capabilities, setup, and code map.
- PRODUCT_VISION.md: product thesis and boundaries.
- ROADMAP.md: agreed delivery order and acceptance criteria.
- FEEDBACK.md: historical external feedback and labeled product interpretation.
- SESSION_LOG.md: dated history and handoff.

Update documentation at coherent session checkpoints. Run lint/build at a completed implementation checkpoint or when a change warrants it, rather than after every minor edit.