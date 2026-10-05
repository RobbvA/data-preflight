# DataPreflight Roadmap

Last reviewed: 2026-10-05

## Milestones 1–4 — MVP foundation

Status: ✅ Completed

- Browser-based CSV upload and parsing with a shared `ParsedDataSet` model.
- Invoice field mapping, normalization, deterministic rules, explainable review, and CSV export.
- XLSX and XLS input adapters.
- Initial design system, public MVP, example datasets, and professional feedback round.

“Completed” describes the original MVP scope. Later milestones may improve reliability and usability.

## Milestone 5 — Validated Product Direction

Status: 🟡 In progress

Goal: prove that DataPreflight is a useful, repeatable quality gate before ERP import.

**Current workflow:** Choose validation profile → Upload → Parse → Map → Normalize → Validate → Review → Export.

Invoice data and Customer master data are the two working profiles. Do not add another domain during this milestone.

### 5.1 Product positioning and first use

Status: 🟡 Implemented; new-user validation pending

Built:

- ERP-import positioning and an illustrative review preview on the landing page.
- Explicit profile choice before upload or example loading. No profile is selected by default.
- Visible upload and example actions that prompt for a profile when none is selected.
- Example loading through the same browser-side processing path as an uploaded file.
- Browser-processing explanation near file selection.

Next:

- Observe whether a new visitor understands the profile choice and first action.
- Check the experience on desktop and mobile.
- Keep privacy wording aligned with the complete deployed data flow.

### 5.2 Shared validation architecture and traceability

Status: 🟡 Working foundation; downloadable report and repeatability test pending

Built:

- Shared `DataProfile` field definitions and a `ValidationProfile` execution contract.
- Shared mapping-to-profile and normalization/validation execution functions.
- Versioned Invoice and Customer definitions in code.
- Visible Validation details with profile ID, profile version, source filename, result counts, and applied field mapping.
- Conservative header-based detection of clear profile mismatches.
- Separate domain rules for Invoice and Customer.

Next:

1. Download the current validation context as a readable `validation-report.csv`.
2. Run fixed Invoice and Customer files repeatedly with the same mapping and profile version.
3. Compare normalization, categories, issues, exports, and report contents.

**Repeatability target:** same input + same mapping + same profile version = same result.

A generic `ValidationWorkspace` remains a possible direction. Extract shared behavior only after the two existing workspaces show what truly belongs in the shared layer.

### 5.3 Customer master data foundation

Status: 🟡 Initial second domain working; representative user testing pending

Built:

- Customer field mapping and normalization.
- Required-field and duplicate-ID checks, plus email and country-code warnings.
- Guard against incomplete or duplicate mapping before validation and export.
- Blocked, Needs review, and Ready tabs.
- Problem, why, and fix explanations.
- Export of rows without critical issues and an issue report.

Next:

- Test Customer with representative source files and observe whether users understand the mapping and review results.

Supplier, Product, Inventory, and other domains remain out of scope for Milestone 5.

### 5.4 Workflow and reliability

Status: 🟡 Main workflow built; limits and edge cases pending

Built:

- A visible field mapping tool and mapped-field count.
- A prominent next action in each workspace.
- Mapping → Review → Export steps in both domains.
- Blocked, Needs review, and Ready tabs in both domains.
- Invoice details shown within review cards instead of a separate Inspection mode.
- Structural CSV parse errors blocked before validation.
- Clear profile mismatches rejected before mapping.
- Invoice amount validation corrected to use the same normalized value as the export; Invoice profile version advanced to `1.0.1`.

Reliability backlog:

- Exercise malformed files and Excel edge cases.
- Test small, normal, and large CSV/XLSX files in the browser.
- Determine a safe maximum file size or row count from measurements.
- Add a pre-parse limit and clear error message only after those measurements.

### 5.5 Explainability

Status: 🟡 Available; validate with new users

Both domains show what failed, why it matters, and a suggested fix. Invoice review cards now show their details inline.

Next: observe whether a new user understands which source value to correct and what to do after reviewing an issue. Improve wording only where the test reveals confusion.

AI explanations may come later. Validation outcomes remain rule-based.

### 5.6 User-configurable profiles

Status: ⏳ Future

Users can select two code-defined profiles. User-authored rules, saved configurations, target-ERP rule sets, and reusable saved mappings do not exist yet.

Do not build them until feedback on Invoice and Customer shows which configuration users actually need.

## Milestone 5 execution order

1. Synchronize project documentation with the current implementation.
2. Add a readable `validation-report.csv` containing the validation summary and applied field mapping. Keep the format deterministic and avoid a generated timestamp.
3. Repeat identical Invoice and Customer runs and compare mapping, normalized values, counts, issues, exports, and reports.
4. Let a new user complete the current workflow without guidance.
5. Reassess the exit criteria using the results of those tests.

## Milestone 5 exit criteria

- A new user can choose a profile and understand the next action without guidance.
- Invoice and Customer produce explainable, repeatable classifications for representative files.
- Exports exclude critical rows and clearly describe how warnings are handled.
- A downloadable report identifies the source filename, applied profile/version, mapping, and result counts.
- Privacy claims match the measured data flow.
- New-user feedback confirms that the workflow is understandable and useful.

Do not mark Milestone 5 complete solely because the features have been implemented.

## Milestone 6 — Data migration platform

Status: Future

Potential scope: more master data domains, migration checks, larger datasets, batch workflows, XML/SQL inputs, and ERP integration. Prioritize only after Milestone 5's reliability and user-value questions are answered.

## Milestone 7 — AI assistance

Status: Future

Possible uses: mapping proposals, explanations, and suggested fixes. AI output must remain distinguishable from deterministic rule results and must respect the data-handling model.

## Next build step

Finish the documentation sync, then add the small CSV Validation Report using the context already shown under Validation details. Follow it immediately with repeatability checks for Invoice and Customer.