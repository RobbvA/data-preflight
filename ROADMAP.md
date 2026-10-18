# DataPreflight Roadmap

Last reviewed: 2026-10-18

## Milestones 1–4 — MVP foundation

Status: Completed.

Delivered:

- Browser-based CSV parsing and a ParsedDataSet model.
- Invoice mapping, normalization, deterministic rules, review, and CSV export.
- XLSX and XLS input adapters.
- Initial visual identity and public deployment.
- Example datasets and an initial professional feedback round.

Completion describes the original scope, not universal reliability or proven market demand.

## Milestone 5 — Validated Product Direction

Status: Internally complete on 2026-10-11.

M5 established a repeatable, explainable quality gate across Invoice and Customer.

### Delivered

- Explicit profile selection before upload or example loading.
- Visible Mapping → Review → Export steps.
- Customer as the second working profile.
- Shared DataProfile definitions and a ValidationProfile execution contract.
- Shared profile mapping and execution functions.
- Separate domain normalization and rules.
- Versioned profiles.
- Conservative recognizable-profile mismatch detection.
- Guards against incomplete and duplicate field mapping.
- Blocked, Needs review, and Ready categories.
- Problem, why, and fix explanations.
- Exports excluding critical rows while retaining warning-only rows.
- Visible Validation details.
- Deterministic Validation Reports containing profile/version, file, worksheet where applicable, mapping, and counts.
- Structural CSV parse-error handling.
- Explicit selection among populated Excel worksheets.
- Tested Invoice numeric-normalization corrections.
- Removal of an internal duplicate-detection key from the Invoice row export.

### Internal evidence

- Fixed identical Invoice and Customer CSV runs produced byte-identical downloads.
- Reordered XLSX fixtures produced expected 3 blocked / 1 needs review / 2 ready results.
- Six-row CSV fixtures matched expected mappings, values, issues, classifications, and exports.
- Multi-sheet worksheet selection and recognizable-profile mismatch cases were checked.
- A malformed-quotes CSV was rejected.
- An empty-first-sheet workbook produced expected results from its populated Invoice worksheet.
- A deployed Network check found no outgoing requests during the tested Invoice upload/download actions.
- A mobile walkthrough found the flow usable, with spacing noted for later improvement.
- Manual Invoice files up to 5,000 rows showed no noticeable delay.

These are targeted checks, not a complete file-format audit, measured performance ceiling, or guarantee of target-ERP acceptance.

### Outstanding validation

No independent unguided new ERP/data user test was completed.

That earlier M5 exit requirement was consciously moved to later product validation. M5 internal completion does not establish independently proven self-service usability.

Simon's informal interaction is not treated as reliable UX evidence.

Historical implementation details remain in SESSION_LOG.md.

## Milestone 6 — Professional ERP validation platform

Status: In progress. Implementation started locally on 2026-10-18.

### Goal

Extend the current foundation into a consistent platform across:

- Invoice.
- Customer.
- Vendor/Supplier.
- Product/Material.

Add locally reusable mappings and one narrow reference-data check.

Processing remains browser-side. Hard validation remains deterministic.

A complete generic workspace rewrite is not required. Extract proven common behavior and preserve meaningful domain differences.

### Quality standard

Each increment follows:

Problem → Design → Implementation → Edge cases → UX → Testing → Polish → Done.

An increment must be effective, reliable, understandable, visually polished, and consistent.

Essential accessibility belongs in the implementation: keyboard operation, visible focus, labels, and understandable error feedback.

Performance becomes blocking when it prevents the intended workflow. Larger-file optimization remains conditional on evidence.

### 6.1 Shared workflow foundation

Status: In progress.

#### 6.1a Upload lifecycle safety

Status: Complete locally.

Delivered:

- Request IDs for asynchronous upload actions in both workspaces.
- Outdated results, errors, and loading updates ignored.
- Reset and profile changes invalidate earlier actions.
- Workspace cleanup invalidates pending work.
- Customer reset clears loading.

Acceptance:

- Old completions cannot overwrite a newer file.
- Reset does not allow old results to return.
- Old errors and finally handlers cannot change the newer flow.
- Normal example and worksheet paths continue to work.

Evidence:

- Sixteen focused checks using mocked parser/state behavior passed.
- User-reported local example, reset, and profile-switching checks passed.

This invalidates outdated state updates; it does not cancel parser work.

#### 6.1b Shared mapping readiness

Status: Complete locally.

Delivered:

- Shared `getMappingStatus` in `src/lib/mappingStatus.ts`.
- Required-field detection.
- Duplicate source-column detection.
- Mapped-field count.
- Shared validation/export readiness.

Acceptance:

- Missing required mappings block review/export.
- Duplicate assignments block review/export.
- Restoring a valid mapping restores results.
- Existing suggestion algorithms remain separate.

Evidence:

- Generated mapping combinations were compared with the previous guard behavior.
- User-reported local checks passed for both profiles.

#### 6.1c Shared mapping interface

Status: Complete locally.

Delivered:

- One ProfileMappingPanel used by Invoice and Customer.
- Required/optional labels.
- Field-level missing and duplicate feedback.
- Invoice suggestion explanations.
- Customer ambiguous-column hints.
- Native modal behavior, Escape handling, focus restoration, and scroll locking.
- Automatic opening when a newly loaded file needs mapping correction.
- Explicit right-side positioning after a local visual defect was observed.

Acceptance:

- Same mapping interaction in both profiles.
- Incomplete mapping remains recoverable without re-upload.
- Keyboard interaction and dismissal work.
- Valid mapping restores review/export.

Evidence:

- User confirmed the local requested browser checks, including Escape.
- Screenshots showed duplicate feedback and blocked downstream review.
- User confirmed corrected right-side placement.
- Lint: 0 errors, 2 existing warnings.
- TypeScript and production build passed.

A separate mobile visual walkthrough of the new panel remains pending.

#### Remaining 6.1 work

- Share review controls and align their behavior.
- Preserve profile-specific row content and business rules.
- Align relevant status and import-safety wording.
- Extract only the shared foundation needed for expansion.
- Avoid copying a complete workspace for Vendor.

Stop condition:

If a refactor becomes broader than the concrete expansion requires, reduce it to the necessary shared components and behavior.

### 6.2 Vendor/Supplier profile

Status: Planned.

User-facing domain: Vendor / Supplier master data.

Initial fields:

| Field | Required | Initial rule |
| --- | --- | --- |
| Vendor ID | Yes | Required; duplicate detection within the file |
| Vendor name | Yes | Required after trimming |
| Country code | No | Two-letter format warning when populated |
| Email | No | Format warning when populated |
| VAT number | No | Conservative normalization; no fiscal validity claim |

Build order:

1. Define fields, aliases, and profile version 1.0.0.
2. Reuse suitable normalization helpers.
3. Treat identifiers as text.
4. Check duplicate IDs after trimming, case-insensitively.
5. Add required-field checks.
6. Add optional format warnings.
7. Connect shared mapping, review, reports, and export.
8. Add examples and explicit acceptance fixtures.

Acceptance:

- Leading zeros are preserved when present in the parsed source value.
- Missing ID or name blocks the row.
- All rows sharing a duplicate normalized ID are blocked.
- Invalid optional email/country format produces warnings.
- Warning-only rows remain exportable.
- CSV and reordered XLSX cases match expected results.
- Reports contain the same validation context as existing profiles.

Out of scope:

IBAN, bank verification, VIES, payment terms, fiscal validation, and ERP-specific supplier structures.

### 6.3 Locally reusable mappings

Status: Planned.

Goal: reduce repeated mapping work.

Store:

- Mapping name.
- Profile ID and profile version.
- Mapping-storage schema version.
- Source column names and field assignments.

Do not store source rows or complete source files.

Build order:

1. Add a small browser-storage module.
2. Save a valid mapping with a user-chosen name.
3. List mappings for the selected profile.
4. Apply a mapping explicitly.
5. Check compatibility with source columns.
6. Support replacement and deletion.
7. Handle corrupt or unavailable storage without blocking ordinary validation.

Compatibility:

- Reordered source columns remain usable.
- Extra unused columns do not invalidate the mapping.
- Missing required source columns require correction.
- Ambiguous duplicate headers require manual resolution.
- A profile-version change requires visible review before reuse.
- Mappings from other profiles are not offered.

Acceptance:

- Mapping survives reload.
- Applying it triggers validation with the current configuration.
- No saved mapping bypasses guards.
- Deletion/replacement does not damage unrelated mappings.
- Storage failures are recoverable.
- The UI explains device/browser scope and browser-data deletion.

Out of scope:

Accounts, cloud sync, sharing, mapping import/export, and silent automatic application.

### 6.4 Product/Material profile

Status: Planned.

Initial fields:

| Field | Required | Initial rule |
| --- | --- | --- |
| Product ID | Yes | Required; duplicate detection |
| Description | Yes | Required after trimming |
| Base unit | Yes | Required; optional reference check in 6.5 |

Build order:

1. Define fields, aliases, and version 1.0.0.
2. Preserve Product ID as text.
3. Normalize descriptions conservatively.
4. Trim units and compare case-insensitively where relevant.
5. Add required-field and duplicate-ID rules.
6. Connect shared mapping, saved mappings, review, reports, and export.
7. Add examples and acceptance fixtures.

Acceptance:

- Product codes retain leading zeros when present in the parsed source value.
- Missing required values block.
- Case-variant duplicate IDs are handled consistently.
- Units are not automatically translated or converted.
- CSV and XLSX cases match explicit expected output.
- No separate Product workflow is introduced.

Out of scope:

Prices, inventory, batches, serial numbers, BOMs, unit conversion, fuzzy matching, and ERP-specific material structures.

### 6.5 Limited local reference-data check

Status: Planned.

Scope:

Compare Product base units with a user-provided CSV containing `unit_code`.

Rules:

- One reference list.
- Product base units only.
- Reference data stays in memory.
- Trim, compare case-insensitively, and deduplicate reference values.
- No reference file means the reference check is explicitly not run.
- Unknown units block when a valid allowed-values list is active.
- An invalid replacement must not silently leave an old list active.

Build order:

1. Add optional reference upload.
2. Validate header and usable values.
3. Show reference filename and unique-value count.
4. Apply membership validation.
5. Add problem/why/fix explanations.
6. Record reference context in Validation details and the report.
7. Revalidate after replacement or removal.

Report context:

- Whether the check ran.
- Reference filename.
- Unique-value count.
- Effective allowed-values list.
- Reference-check version.

Acceptance:

- Empty and structurally invalid reference files are rejected.
- `kg` and ` KG ` match `KG`.
- An unlisted unit is blocked while the list is active.
- No check is claimed when the list is absent.
- Identical source, worksheet, mapping, profile version, reference-check version, and effective reference values produce repeatable results.

Out of scope:

Multiple reference lists, cross-domain joins, database lookups, API checks, and automatic correction.

### 6.6 Cross-profile consistency and export clarity

Status: Planned; quality work also happens during every earlier step.

- Align labels, controls, typography, spacing, and status meaning.
- Show how many rows will export, including warning-only rows.
- Show how many rows are excluded.
- Keep Ready wording limited to implemented checks.
- Check empty, loading, error, blocked, and successful states.
- Verify desktop and mobile behavior.
- Address essential accessibility as part of the flow.
- Preserve source-based correction and re-upload.

Acceptance:

- Status meanings agree across all profiles.
- Blocked rows cannot enter the rows-without-blockers export.
- Warning inclusion is understandable.
- Review, export, and report wording do not conflict.
- The workflow remains readable and usable on smaller screens.

Out of scope:

A dashboard, full redesign, bulk record correction, and an in-app data editor.

### 6.7 Naming and positioning

Status: Deferred as a blocking task.

Keep DataPreflight as the working name following the user's decision to continue building.

Do not reopen naming research during ordinary implementation.

If the user chooses to reconsider:

1. Check candidates before presenting a shortlist.
2. Review existing use, relevant domains, and public trademark records.
3. Do not claim guaranteed legal clearance.
4. Make one consistent branding change after a decision.
5. Treat domain/repository/deployment changes separately.

A rename is not required for a usage test.

### 6.8 Independent usage test and next outreach

Status: Not completed.

First target moment:

After Vendor and local mapping reuse, without waiting for all remaining scope.

Ask a new ERP/data user to:

1. Choose the right profile.
2. Load a file and choose a worksheet if needed.
3. Understand and correct mapping.
4. Explain a blocker and a warning.
5. Correct the source and re-upload.
6. Save and reuse a mapping.
7. Choose the intended export.

Record where guidance was needed. Assisted tasks do not count as independently completed.

Acceptance:

- The core flow is independently usable.
- The user understands warning inclusion.
- Ready is not interpreted as an ERP guarantee.
- Error explanations support source corrections.
- Blocking confusion is fixed and the affected task is tried again.

A single successful test does not prove demand or willingness to pay.

After technical M6 completion and resolution of core usability blockers, run a small outreach round focused on real recurring tasks, remaining manual work, reuse, missing rules, and intent to use the tool again.

### 6.9 Verification and closeout

Status: Planned.

At relevant checkpoints:

- New-profile value-level fixtures.
- Mapping reuse compatibility and storage failure checks.
- Reference-data replacement/removal checks.
- Repeatability checks for new behavior.
- Network checks for new file-processing paths.
- Focused regressions for changed shared components.
- Desktop/mobile and keyboard checks.
- Lint and production build.

Do not repeat completed checks without a concrete risk.

Update documentation and review the staged diff before commit/push.

### M6 internal exit criteria

- Four profiles use one recognizable workflow.
- Local saved mappings work reliably.
- The limited Product reference check works and is traceable.
- New processing remains local and deterministic.
- Required acceptance checks, lint, and build pass.
- Documentation accurately distinguishes implemented features, limitations, and evidence.

Outreach-ready status additionally requires an independent usage test and resolution of core workflow blockers.

If scope must shrink, defer the reference-data experiment first and explicitly revise the roadmap. Do not silently mark unfinished scope complete.

### Explicitly outside M6

- AI.
- Accounts and cloud storage.
- ERP connectors.
- User-authored rules or a full rule builder.
- Additional profiles.
- In-app source editing.
- Large-file optimization without an observed need.

## Milestone 7 — AI assistance

Status: Future.

Possible uses:

- Mapping proposals.
- Explanations.
- Suggested fixes.

AI output must remain distinguishable from deterministic rule results and respect the data-handling model.

## Next build step

Continue M6.1 with shared review controls and consistent status behavior.

Use the locally verified upload guards, mapping status helper, and mapping panel as the baseline.

Preserve domain-specific rules and row presentation. No Vendor code until the shared foundation is sufficient.