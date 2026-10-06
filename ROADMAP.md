# DataPreflight Roadmap

Last reviewed: 2026-10-06

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

- After internal reliability checks, observe whether a new visitor understands the profile choice and first action.
- Check the experience on desktop and mobile.
- Keep privacy wording aligned with the complete deployed data flow.

### 5.2 Shared validation architecture and traceability

Status: 🟡 Working foundation; broader repeatability testing pending

Built:

- Shared `DataProfile` field definitions and a `ValidationProfile` execution contract.
- Shared mapping-to-profile and normalization/validation execution functions.
- Versioned Invoice and Customer definitions in code.
- Visible Validation details with profile ID, profile version, source filename, result counts, and applied field mapping.
- Downloadable `validation-report.csv` with the validation summary and applied mapping. It has no generated timestamp.
- Conservative header-based detection of clear profile mismatches.
- Separate domain rules for Invoice and Customer.

Initial evidence:

- Repeated runs of fixed Invoice and Customer CSV files with unchanged mappings produced byte-identical clean exports, issue reports, and Validation Reports.
- Reordered Invoice and Customer XLSX fixtures produced the expected mappings and Blocked / Needs review / Ready counts.

Next:

1. Repeat representative CSV and XLSX runs with the same mapping and profile version.
2. Compare normalized values and individual issues against explicit expectations, in addition to the exported files and report.
3. Resolve any difference before broadening product scope.

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
- Export of rows without critical issues, an issue report, and a Validation Report.

Next:

- Test Customer with more representative source files and observe whether users understand the mapping and review results.

Supplier, Product, Inventory, and other domains remain out of scope for Milestone 5.

### 5.4 Workflow and reliability

Status: 🟡 Main workflow built; wider edge cases and performance pending

Built:

- A visible field mapping tool and mapped-field count.
- A prominent next action in each workspace.
- Mapping → Review → Export steps in both domains.
- Blocked, Needs review, and Ready tabs in both domains.
- Invoice details shown within review cards instead of a separate Inspection mode.
- Invoice Step 2 and its review workspace consolidated into one card.
- Redundant **Show only blocked** control removed; status tabs remain available and were manually checked.
- Structural CSV parse errors blocked before validation. A malformed-quotes fixture was manually checked.
- Clear profile mismatches rejected before mapping.
- Invoice amount validation corrected to use the same normalized value as the export; Invoice profile version advanced to `1.0.1`.

Reliability backlog:

- Exercise more malformed CSV files and Excel edge cases.
- Test unusual headers, reordered columns, missing values, and representative real-world files.
- Test small, normal, and large CSV/XLSX files in the browser.
- Measure file size, row count, parse and validation times, and responsiveness.
- Determine a safe maximum file size or row count from measurements.
- Add a pre-parse limit and clear error message only after those measurements.

### 5.5 Explainability

Status: 🟡 Available; validate with new users

Both domains show what failed, why it matters, and a suggested fix. Invoice review cards show their details inline.

Next: observe whether a new user understands which source value to correct and what to do after reviewing an issue. Improve wording where the test reveals confusion.

AI explanations may come later. Validation outcomes remain rule-based.

### 5.6 User-configurable profiles

Status: ⏳ Future

Users can select two code-defined profiles. User-authored rules, saved configurations, target-ERP rule sets, and reusable saved mappings do not exist yet.

Do not build them until feedback on Invoice and Customer shows which configuration users actually need.

## Milestone 5 execution order

1. ✅ Make the validation context downloadable as a readable CSV.
2. ✅ Establish an initial repeatability baseline with fixed Invoice and Customer CSV files.
3. 🟡 Expand reliability checks to more realistic CSV/XLSX files, malformed input, and Excel edge cases. Verify expected normalized values and issues, not only counts.
4. 🟡 Measure performance with small, normal, and large files before choosing limits.
5. ⏳ Let a new user complete the workflow without guidance after obvious technical issues are addressed.
6. ⏳ Reassess the exit criteria using the results of those tests.

Documentation is updated at the end of each build session to reflect what was actually built and tested.

## Milestone 5 exit criteria

- A new user can choose a profile and understand the next action without guidance.
- Invoice and Customer produce explainable, repeatable classifications for representative files.
- Exports exclude critical rows and clearly describe how warnings are handled.
- A downloadable report identifies the source filename, applied profile/version, mapping, and result counts.
- Privacy claims match the verified data flow.
- New-user feedback confirms that the workflow is understandable and useful.

Do not mark Milestone 5 complete solely because the features have been implemented.

## Milestone 6 — Data migration platform

Status: Future

Potential scope: more master data domains, migration checks, larger datasets, batch workflows, XML/SQL inputs, and ERP integration. Prioritize only after Milestone 5's reliability and user-value questions are answered.

## Milestone 7 — AI assistance

Status: Future

Possible uses: mapping proposals, explanations, and suggested fixes. AI output must remain distinguishable from deterministic rule results and must respect the data-handling model.

## Next build step

Continue the Milestone 5 reliability matrix with a focused Excel edge case, then compare the resulting mapping, normalized values, issues, exports, and Validation Report against explicit expectations. After that, measure performance across increasing file sizes before setting any limit.