> 31 oktober 2026 — R07a/R05a bevestigd/gepusht als 3a40d60. R04: alle zes profielen gezamenlijk gecontroleerd; voorbeelden en eigen CSV/XLSX/XLS, mappingguards, echte exports en lifecycle geslaagd. Geen applicatiefix nodig. 134 tests, build en lint (twee bekende warnings) groen. Nieuw checkpoint/testpakket nog toepassen/push; geen nieuwe liveacceptatie. Volgende stap: resterende R05. Zie [integratiebewijs](docs/M7_R04_INTEGRATION.md).

> 31 oktober 2026 — R05a voorbereid: rustigere exporttabs, contextuele vraagtekenhulp en optionele spotlightgids. Cumulatief met R07a; lokaal toepassen/beoordelen/push/live nog open. Remote laatst geverifieerd efc917c. Hervatten R04 na bevestiging; R05 is niet volledig afgerond. Zie [checkpoint](docs/M7_PROGRESS.md).

> Update 31 oktober 2026 — R03 lokaal bevestigd en push gecontroleerd op efc917c. R07a rapportexports voorbereid/getest: issuerapport CSV/Excel, volledig reviewrapport Excel/PDF voor zes profielen; dezelfde actuele aantallen/waarden/context, lokale PDF en cancellationguards. 134 tests, lint/build/TS en browser-/PDFchecks geslaagd. Pakket nog toepassen, npm install, lokaal beoordelen en commit/push. Details: [docs/M7_R07A_REPORT_EXPORTS.md](docs/M7_R07A_REPORT_EXPORTS.md). Daarna R04/R05; volledige M7-scope blijft gelden.

# DataPreflight Project Status

Last reviewed: 2026-10-28

## Product and milestone

DataPreflight is a browser-based quality gate for business data before ERP import.

[Live app](https://data-preflight.vercel.app/) · [Roadmap](ROADMAP.md) · [Product vision](PRODUCT_VISION.md)

M5 and M6 are internally complete. M6 technical signoff: 2026-10-25. M7 — Professional UX, Price List & Stock Balances is in progress. On 2026-10-26 Rob explicitly expanded the target from five to six profiles. Price List is implemented/tested end-to-end, locally accepted and pushed as 2984448. Stock Balances domain is accepted/pushed as faed293. Its full sixth-profile workflow is implemented/tested in M7.4e preparation; local acceptance/push/live remain open. The accepted first UX increment and later tab accents are committed/pushed through 130ccaf; Vercel reports successful deployment. The planning package was applied and pushed as 66ab1b5. M7.2b compact Product record cards were locally applied and accepted by Rob. M7.3a extends only that presentation to Customer, Vendor and Invoice and was locally accepted/pushed as 971b8f9 on 2026-10-28. M7.3b upload cancellation/recovery is locally accepted/pushed as f8e185b. M7.4a exact numeric primitives are locally confirmed/pushed as e09cb8e. M7.4b Price List domain is locally confirmed/pushed as b7e495b. M7.4c supplies the fifth selectable profile, explicit notation lifecycle, exact CSV/XLS/XLSX, compact records and real downloads, locally accepted/pushed as 2984448. M7.4d Stock rules are locally accepted/pushed as faed293. M7.4e supplies the sixth visible profile, quantity notation, exact source-cell handling, snapshot report context and real downloads in preparation; local acceptance/push/live remain open. Existing Invoice interpretation of ambiguous 1.234 remains an explicit pre-release issue. Header/source card, mapping, review controls and export retain their accepted layout. The broader workspace hierarchy remains withdrawn.

- M6.1: shared workflow foundation complete.
- M6.2: Vendor complete; CSV export and reordered multi-sheet XLSX accepted through preparation checks and user-local walkthrough/screenshots.
- M6.3: local reusable mappings implemented and accepted by the user.
- M6.4: Product/Material implemented and delivered; user confirmed completion.
- M6.5: limited Product unit reference check complete; user confirmed acceptance with screenshots showing 6 blocked / 1 ready using the KG-only list.
- M6.6: shared export summary and Step 2 consistency accepted by the user; screenshots confirm counts and the Vendor export.
- M6.9: technical verification complete; the user-local suite passes all 39 tests, lint has zero errors/two known warnings, and the production build passed.
- Independent usage testing and outreach are deferred during the current build phase.

Latest confirmed domain checkpoint: `faed293` (2026-10-28); Price workflow: `2984448`; Price domain: `b7e495b`; numeric primitives: `e09cb8e`; feedback/recovery: `f8e185b`; compact records: `971b8f9`; planning checkpoint: `66ab1b5`; earlier UX baseline: `130ccaf` (2026-10-26), following the accepted UX checkpoint `790f648`. Completed M6 baseline: `a91935f`. The earlier `4effc2e` profile-picker checkpoint is historical. Vendor rules were delivered in `641ad84`; shared master-data integration in `ca099a7`. Earlier statements that Vendor was unimplemented or M6.1 still awaited a commit are superseded.

## Implemented workflow

Profile → Upload → Worksheet where applicable → Mapping → Normalize/Validate → Review → Export.

Available profiles:

| Profile | Version | Scope |
| --- | --- | --- |
| Invoice | 1.0.2 | Invoice references, amounts, dates, and related rules |
| Customer | 1.0.0 | Required ID/name, duplicates, optional email/country warnings |
| Vendor | 1.0.0 | Required ID/name, case-insensitive duplicate IDs, optional email/country warnings |
| Product / Material | 1.0.0 | Required ID/description/base unit, case-insensitive duplicate IDs; optional allowed-unit list |
| Price List / Item Prices | 1.0.0 | Five required fields, exact notation, nonnegative prices/zero warning, complete tuple duplicates; locally accepted/pushed as 2984448 |
| Stock Balances / On-hand Inventory | 1.0.0 | M7.4e preparation: absolute nonnegative product/warehouse snapshot; quantity notation, zero Ready, duplicate/unit-conflict blockers; local acceptance/deployment open |

Identifiers remain text when supplied as text by the source. VAT is not fiscally validated in master-data profiles.

Implemented capabilities include CSV/XLSX/XLS input, explicit populated-worksheet selection, mapping suggestions and correction, required/duplicate mapping guards, deterministic validation, issue explanations, row/issue exports, and Validation Reports with profile/version, source, worksheet, mapping, and counts.

Outdated asynchronous upload results are ignored after replacement, reset, profile switching, or unmounting. Profile switching during an active workflow requires confirmation.

## Architecture

| Responsibility | Location |
| --- | --- |
| Input adapters and Excel headers | `src/lib/parseCsv.ts` |
| Profile selection and Invoice flow | `src/components/CsvUploader.tsx` |
| Shared Customer/Vendor/Product workspace | `src/components/data-preflight/MasterDataWorkspace.tsx` |
| Master-data configuration | `src/lib/profiles/masterDataWorkspaceConfig.ts` |
| Reusable profile picker | `src/components/data-preflight/ProfilePicker.tsx` |
| Picker choices | `src/lib/profiles/profilePickerConfig.ts` |
| Shared mapping readiness | `src/lib/mappingStatus.ts` |
| Mapping interface | `src/components/data-preflight/ProfileMappingPanel.tsx` |
| Review controls | `src/components/data-preflight/ReviewStatusControls.tsx` |
| Profile execution | `src/lib/validation/validationProfile.ts` |
| Reports and exports | `src/lib/validationReport.ts`, `src/lib/exportData.ts` |

Invoice retains its own workspace. No broad generic-workspace rewrite is required.

## Parser and picker increment

Prepared in a separate checkout and subsequently applied by the user. The user confirmed that the overlay works. Commit, push, and deployment remain separate steps.

### Excel header collisions

The old parser reproduced silent cell overwrites for headers such as `ID`, `ID`, `ID 2`.

The fix reserves all normalized source names before assigning suffixes to duplicates. That case becomes `ID`, `ID 3`, `ID 2`, preserving all cells and the existing named column. Normalized unique headers retain their previous behavior.

Five real in-memory XLSX regression cases cover source suffix collisions, repeated names, normalization collisions, blank-header fallbacks, and unique headers. Four fail against the original parser; all five pass after the fix.

### Profile picker overlay

The expanded picker is positioned over the remaining content instead of increasing the card height. Search, bounded scrolling, selection, Escape/outside dismissal, and the active-workflow confirmation are retained.

## Verification evidence and limits

The independent review supplied on 2026-10-24 reported 18 passing tests, lint with two warnings, and a successful production build for `4effc2e`.

That review exercised all three example flows, Invoice explanations, Vendor duplicate handling and mapping recovery, empty Customer review selection, and guarded profile switching. It did not fully inspect all downloaded exports or perform a security, mobile, or large-file audit.

The historical M6 checkpoint had 39 passing automated tests: the previous 18, five Excel header regressions, six saved-mapping tests, six Product tests and four unit-reference tests. Existing tests include mapping guards, export boundaries/serialization, Vendor normalization/classification/repeatability, and report context.

The current checkout also passes the production build including TypeScript. Lint reports zero errors and the two existing warnings. Focused production-browser checks at 1440px and 390px confirm unchanged Step 2 position when the picker opens, no horizontal overflow, Vendor selection/example loading, switch cancellation, and Escape dismissal. These checks are not full end-to-end coverage of all profiles or downloads.

Known lint warnings concern unused `Metadata` in `src/app/layout.tsx` and `_tone` in `DataSetPreview.tsx`.

Historical M5 evidence includes repeatable downloads for fixed Invoice/Customer fixtures, worksheet selection, value-level validation, and a deployed Invoice Network check finding no upload/download requests. These are targeted historical observations, not a fresh privacy audit or universal guarantee.

## Product boundaries

- Ready means implemented checks passed; it does not guarantee target-ERP acceptance.
- Warning-only rows remain exportable and require review; blocked rows are excluded.
- Mapping suggestions cannot prove semantic correctness.
- Corrections happen in the source file followed by re-upload.
- Selected files are processed in the browser; future integrations must be assessed separately.
- User-authored rules and ERP connectors are not implemented.
- Saved mappings retain column names/assignments and profile context in localStorage, never source rows.
- Unit references stay in memory; replacing the source, resetting, switching profile or reloading clears them.
- Reports do not contain a complete rule snapshot or cryptographic input fingerprint.
- No measured maximum file size or row count is established.
- Independent self-service usability and willingness to pay remain unproven.

## Current M7 checkpoint — 2026-10-26

Accepted and pushed:
- Larger consistent copper Step 1/2/3 headings, warmer off-white text, clearer existing record identifiers/problems and export counts.
- Optional Product allowed-unit controls collapsed inside mapping with visible status/errors.
- Subtle red/yellow/green review-tab accents; this later narrow change was accepted separately from the rejected broad review-card redesign.

Commit 790f648 contains the accepted first UX increment. Commit 130ccaf contains the four tab-color string changes. Current main was checked on 2026-10-26; Vercel reports success for 130ccaf. This is deployment evidence, not a fresh complete live workflow/mobile test. The old rollback and commit/push requests are complete for that accepted checkpoint.

The broad header and shared review-card redesigns remain rejected/reverted. Their temporary 42-test result is not the retained suite. The retained historical checkpoint is 39 passing tests, zero lint errors/two known warnings, and a successful TypeScript/production build. No new app tests were run for this planning-only change.

M7 now targets six profiles: the existing four, Price List and limited Stock Balances. [M7_PLAN.md](docs/M7_PLAN.md) defines contracts, work packages, the whole-app final test and completion criteria. [M7_PROGRESS.md](docs/M7_PROGRESS.md) is the session and side-quest resume record. The plan was locally applied/pushed as 66ab1b5. Current implementation-package acceptance and deployment are tracked separately in the progress register.

## Next work

1. Locally apply/confirm M7.4e full Stock workflow; evidence: docs/M7_4E_STOCK_BALANCES_WORKFLOW.md.
2. M7.4f six-profile integration, then M7.5 whole-app verification; 86 tests currently pass in preparation, with zero lint errors/two known warnings and successful production build.
3. Resolve the confirmed legacy Invoice 1.234 ambiguity with an explicit contract before M7 acceptance; the new route does not silently change Invoice.
4. Comprehensive six-profile final verification, documentation, commit/push and deployment/live checks.

Do not repeat the completed rollback or reapply rejected designs. Do not automatically add research-backlog features. The M6 sections below retain historical evidence and pending-at-the-time statements; this checkpoint supersedes those as current status.

## M6.3–M6.5 implementation checkpoint

Saved mappings are available inside the shared mapping panel for all four profiles. They can be saved, explicitly applied, replaced and deleted. Missing columns clear the affected assignments; required/duplicate guards remain in force. Corrupt or unavailable storage cannot block manual mapping. No source rows are persisted.

Product uses the shared master-data workspace. Its example has 7 rows: 5 blocked, 0 needs review, 2 ready; exports contain exactly IDs 001 and 005. Product identifiers retain leading zeros. Base units are trimmed without conversion.

The optional reference CSV requires exactly one unit_code column and usable values. Codes are normalized for membership comparison only. Unknown populated units block; missing units retain the existing required-field issue. No list means the reference check is explicitly not run. Reference checks have independent version 1.0.0 recorded alongside profile 1.0.0.

Reference uploads have request-ID guards. Replacement clears the old list before reading; invalid uploads cannot silently leave it active. Results and exports are withheld during reference reading. Reports include active/absent status, check version, filename, unique count and every effective code. Mapping reuse does not persist reference lists.

Production-browser checks cover Product example/export contents, own reordered multi-sheet XLSX, saved mappings and mapping recovery, plus existing Invoice/Customer/Vendor examples. Reference checks cover active/absent reports, exact export changes, invalid replacement, removal, cancellation and outdated upload completion, reset and mobile overflow. No outgoing HTTP requests or browser errors occurred during the tested local reference actions. The user subsequently confirmed the reference increment using local screenshots. This documentation does not claim deployment or independent usability validation.

## M6.6 consistency checkpoint

A shared ExportSummary shows the exact number of rows to export, the number of warning-only rows included, and the number of blocked rows excluded. Ready is explicitly limited to implemented checks, without promising target-ERP acceptance. Step 2 labels now use the same typography as Steps 1 and 3 in both workspace implementations.

The production build including TypeScript passes; lint has only the two previously known warnings. Production-browser checks across all four profiles compare the visible export counts with actual downloaded row counts, verify that category filtering does not change the export scope, and verify disabled export for all-blocked CSVs. Mapping-dialog Escape/focus restoration and 390px mobile overflow checks pass for each profile. These are targeted checks, not a full accessibility audit. No domain validation or export serialization rules changed in this increment.

The complete 39-test suite was run again at the final closeout checkpoint.

Additional profiles remain possible after M6; the current agreed four-profile scope is retained. Outreach remains deferred.

## M6.9 closeout checkpoint

On 2026-10-25 the complete automated suite passes: 39 tests, zero failures. The latest production build and TypeScript check pass; lint retains only the two known warnings. No production source change followed the successful build except whitespace cleanup.

A separate reordered Vendor XLSX fixture contains Notes and Suppliers worksheets. The preparation-browser check selects Suppliers, verifies 1 blocked / 1 needs review / 1 ready, verifies missing-ID mapping blocks downstream export, restores mapping, exports exactly IDs 007 and 008, excludes 009, and confirms Suppliers plus vendor/version context in the report.

The user has accepted M6.3–M6.6 locally and supplied Vendor XLSX screenshots showing 1 blocked / 1 needs review / 1 ready and 2 rows for export. Their first final suite ran only 34 tests because the five Excel-header regressions were missing. The parser and regression file were delivered again; the subsequent user-local output explicitly confirms all 39 tests passing, including the five Excel-header cases. Lint and build passed in the preceding local bundled run; no further local lint/build repetition was requested. The identical final parser had also passed the preparation checkout build.

M6 is now technically signed off internally. Commit, push and deployment confirmation remain outstanding at this documentation checkpoint. No independent-user test is reclassified as completed. Naming and outreach remain deferred by explicit decision. The Node MODULE_TYPELESS_PACKAGE_JSON warning and the two existing lint warnings are nonblocking follow-up work; module-system configuration was not changed merely to suppress warnings.
