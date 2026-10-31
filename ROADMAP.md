# DataPreflight Roadmap

Last reviewed: 2026-10-26

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

Status: Internally complete on 2026-10-25. Implementation started on 2026-10-18. Commit/push and deployment confirmation remain separate delivery steps.

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

Essential accessibility belongs in the implementation:

- Keyboard operation.
- Visible focus.
- Associated labels.
- Understandable error feedback.
- Recoverable interaction.

Performance becomes blocking when it prevents the intended workflow. Larger-file optimization remains conditional on evidence.

### 6.1 Shared workflow foundation

Status: Complete within the agreed foundation scope on 2026-10-18.

Delivery:

- Upload lifecycle and shared mapping committed and pushed as `6d96ccd`.
- Shared review controls committed and pushed as `e68938b`.
- Review-selection and wording changes are present in the repository; the old pending-commit checkpoint is superseded.

Vendor now uses the shared foundation through MasterDataWorkspace. Invoice retains its own workspace.

#### 6.1a Upload lifecycle safety

Status: Complete.

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

Status: Complete.

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

- Generated mapping combinations were compared with previous guard behavior.
- User-reported local checks passed for both profiles.

#### 6.1c Shared mapping interface

Status: Complete.

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

- User confirmed the requested local browser checks, including Escape.
- Screenshots showed duplicate feedback and blocked downstream review.
- User confirmed corrected right-side placement.

A later narrow-desktop-viewport check was reported complete. Full real-device mobile and screen-reader checks remain part of wider M6 verification.

#### 6.1d Shared review controls

Status: Complete; committed and pushed as `e68938b`.

Delivered:

- Shared ReviewStatusControls component.
- Consistent category labels, counts, selected states, and focus styling.
- Shared status-summary presentation.
- Button pressed-state semantics.
- “Passed current checks” explanation for Ready.
- “Ready invoices” category wording.

Acceptance:

- Invoice and Customer use the shared controls.
- Category counts and displayed rows agree.
- Keyboard focus is visible.
- Domain-specific row presentation and validation remain intact.

Evidence:

- User confirmed local category and keyboard checks.
- Lint, TypeScript, and production build passed.

#### 6.1e Review selection and export guidance

Status: Complete; present in the repository.

Delivered:

- Invoice initially selects Blocked, then Needs review, then Ready according to available results.
- A user's explicit selection of an empty category remains selected.
- Empty categories display their empty state.
- Selecting a collapsed category opens its list.
- Manual list collapse continues to work.
- Loading or resetting clears the previous Invoice category choice.
- Relevant Ready and export guidance describes implemented checks without promising target-ERP acceptance.

Acceptance:

- Initial review selection follows issue priority.
- Explicit empty-category selection is not silently replaced.
- Category selection opens the relevant list.
- Collapse remains available.
- Warning-only rows remain exportable.
- Critical rows remain excluded.
- Domain rules and CSV serialization are not intentionally changed.

Evidence:

- 135 focused development-time checks exercised extracted Invoice selection and list-toggle behavior.
- User confirmed the requested browser checks.
- Final lint: 0 errors, 2 existing warnings.
- TypeScript and production build passed.

Development-time checks are not a committed application test suite or browser end-to-end coverage.

#### M6.1 exit assessment

Complete:

- Shared upload guards.
- Shared mapping readiness.
- Shared mapping interaction.
- Shared review controls.
- Reviewed category-selection behavior.
- More precise relevant status/export wording.
- Local browser and build checkpoint.

The next profile can now be added against this foundation.

Keep domain-specific row content and business rules separate where that improves clarity.

If further extraction becomes broader than the concrete expansion requires, reduce it to the necessary shared components and behavior.

### 6.2 Vendor/Supplier profile

Status: Complete on 2026-10-25; Vendor CSV export and reordered multi-sheet XLSX acceptance checked.

Vendor rules and regression tests were added in `641ad84`; shared master-data integration followed in `ca099a7`. Profile picker and landing refinements are in `4effc2e`. Customer and Vendor use MasterDataWorkspace with masterDataWorkspaceConfig.

Closeout evidence: user-local Vendor CSV export, user-local multi-sheet XLSX results, and preparation-browser mapping recovery, exact 007/008 exports and worksheet report context.

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
2. Specify expected mapping, normalized values, issues, classifications, and export rows before implementation.
3. Reuse suitable normalization helpers.
4. Treat identifiers as text.
5. Check duplicate IDs after trimming, case-insensitively.
6. Add required-field checks.
7. Add optional format warnings.
8. Connect shared mapping, review, reports, and export.
9. Add examples and explicit acceptance fixtures.
10. Review recovery, keyboard operation, visual consistency, and relevant regressions.

Acceptance:

- Leading zeros are preserved when present in the parsed source value.
- Missing ID or name blocks the row.
- All rows sharing a duplicate normalized ID are blocked.
- Invalid optional email/country format produces warnings.
- Warning-only rows remain exportable.
- CSV and reordered XLSX cases match expected results.
- Reports contain the same validation context as existing profiles.
- Mapping errors remain recoverable without unnecessary re-upload.
- Existing Invoice and Customer flows continue to work.

Out of scope:

IBAN, bank verification, VIES, payment terms, fiscal validation, and ERP-specific supplier structures.

### 6.3 Locally reusable mappings

Status: Implemented and user-accepted on 2026-10-25.

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

Status: Implemented and delivered on 2026-10-25; user confirmed completion.

Initial fields:

| Field | Required | Initial rule |
| --- | --- | --- |
| Product ID | Yes | Required; duplicate detection |
| Description | Yes | Required after trimming |
| Base unit | Yes | Required; optional reference check in 6.5 |

Build order:

1. Define fields, aliases, and version 1.0.0.
2. Specify expected fixture outcomes.
3. Preserve Product ID as text.
4. Normalize descriptions conservatively.
5. Trim units and compare case-insensitively where relevant.
6. Add required-field and duplicate-ID rules.
7. Connect shared mapping, saved mappings, review, reports, and export.
8. Add examples and acceptance fixtures.
9. Review recovery, keyboard operation, and visual consistency.

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

Status: Complete; user confirmed local reference-list acceptance with screenshots on 2026-10-25.

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
- Replacing or removing the list updates validation and report context.
- Identical source, worksheet, mapping, profile version, reference-check version, and effective reference values produce repeatable results.

Out of scope:

Multiple reference lists, cross-domain joins, database lookups, API checks, and automatic correction.

### 6.6 Cross-profile consistency and export clarity

Status: Complete; user confirmed local export summary and Vendor CSV contents with screenshots.

Delivered: shared export counts, included-warning and excluded-blocker guidance, explicit Ready boundary, and consistent Step 2 labels. Checked actual downloads and all-blocked CSV guards across all four profiles, plus keyboard focus and mobile overflow. No new profiles or broad redesign in this increment.

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
- New controls follow the existing visual language.

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

Deferred by the user during the current build phase. Revisit after the planned profile expansion; no new outreach round is required now.

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

After technical M6 completion and resolution of core usability blockers, run a small outreach round focused on:

- Real recurring tasks.
- Remaining manual work.
- Mapping reuse.
- Missing rules.
- Current alternatives.
- Intent to use the tool again.

Treat proposed pain points as hypotheses until supported by direct user evidence.

### 6.9 Verification and closeout

Status: Complete on 2026-10-25. Preparation and user-local evidence reviewed; the final user-local suite passes all 39 tests after restoring the missing Excel regression file. Local lint/build passed with two known lint warnings.

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

## Milestone 7 — Reliable six-profile workflow and commercial preparation

Status: in progress. Scope explicitly expanded by Rob on 29 October 2026. The former exclusions of one ERP template, bounded local references/custom rules, richer review/reporting and an independent usage test are superseded.

Authoritative remaining plan: [docs/M7_REMAINING_PLAN.md](docs/M7_REMAINING_PLAN.md), v3.1, including multi-file with tabs and joint ZIP export. Original domain contracts: [docs/M7_PLAN.md](docs/M7_PLAN.md). Current checkpoint: [docs/M7_PROGRESS.md](docs/M7_PROGRESS.md).

Remote main verified on 29 October as 3fe3b2d: full Stock Balances workflow pushed. Historical preparation evidence: 86 passing tests, lint with two known warnings, production build and focused browser checks. No new full live acceptance claimed.

Remaining sequence:

1. Baseline/docs; exact Invoice notation and financial comparisons; explicit checkbox-style notation choice.
2. Shared CSV/XLSX export, followed by six-profile integration (M7.4f).
3. Approved readability improvements, onboarding and searchable/filterable/sortable review.
4. Consistent CSV/XLSX/PDF review reporting and bounded report branding.
5. Specify and build one evidence-based ERP template with local reference checks and limited custom rules.
6. Traceable warning acceptance, source-based correction and honest commercial offer/upgrade preparation.
7. Multi-file with at most five isolated sessions, a controlled queue, file tabs and joint ZIP export, preserving individual exports.
8. Extensive tests profile by profile, independent real-file usage task, fixes and final release verification.

Keep six generic profiles, accepted styling/layout, exact Price 8/1/2 and Stock 7/0/3 fixtures. New ERP template is an overlay, not a promise of universal ERP acceptance. All source-bound choices/decisions/references must be isolated and invalidated correctly.

Commercial preparation does not silently include payment/account infrastructure. Live connectors, cloud collaboration, arbitrary rules/scripts, in-app cell editing and additional generic profiles remain outside scope. Open ERP/object and pricing/limit decisions are recorded before their implementation, not fabricated.

R01/R02 are built/tested in preparation on 31 October: Invoice v1.1.0 exact financial source contract and shared square notation choices; 101 tests pass, lint retains only two known warnings, build/browser checks pass. Local application/push/live of this package remain open. Next build goal after confirmation: R03 CSV/XLSX export. Final completion follows v3 criteria, not the old smaller M7 checklist. Local confirmation, push, deployment and live function checks remain separate evidence stages.
