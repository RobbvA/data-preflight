# DataPreflight Roadmap

Last reviewed: 2026-10-10

## Milestones 1–4 — MVP foundation

Status: ✅ Completed

- Browser-based CSV upload and parsing with a shared `ParsedDataSet` model.
- Invoice field mapping, normalization, deterministic rules, explainable review, and CSV export.
- XLSX and XLS input adapters.
- Initial design system, public MVP, example datasets, and professional feedback round.

“Completed” describes the original MVP scope. Later milestones improve reliability and usability.

## Milestone 5 — Validated Product Direction

Status: 🟡 In progress

Goal: prove that DataPreflight is a useful, repeatable quality gate before ERP import.

**Current workflow:** Choose validation profile → Upload → Parse → Map → Normalize → Validate → Review → Export.

The user chooses a profile before loading a file. For workbooks with multiple populated worksheets, the user chooses the worksheet before its contents are used for mapping and validation.

Invoice data and Customer master data are the two working profiles. Do not add another domain during this milestone.

### 5.1 Product positioning and first use

Status: 🟡 Implemented; unguided new-user validation pending

Built:

- ERP-import positioning and an illustrative review preview on the landing page.
- Explicit profile choice before upload or example loading. No profile is selected by default.
- Visible upload and example actions that prompt for a profile when none is selected.
- Example loading through the same browser-side processing path as an uploaded file.
- Browser-processing explanation near file selection.
- A visible Mapping → Review → Export sequence in both workspaces.
- Compact mapping status when mapping is complete, with an Edit mapping tool when needed.
- Review results presented as the main workspace activity in both domains.

Next:

- Check whether profile choice and the first action are clear on desktop and mobile.
- Reduce repeated instructions or unclear hierarchy where an internal walkthrough reveals a specific problem.
- Observe whether a person new to the product can use the workflow without step-by-step guidance.
- Keep privacy wording aligned with the complete deployed data flow.

### 5.2 Shared validation architecture and traceability

Status: 🟡 Working foundation; broader real-world coverage pending

Built:

- Shared `DataProfile` field definitions and a `ValidationProfile` execution contract.
- Shared mapping-to-profile and normalization/validation execution functions.
- Versioned Invoice and Customer definitions in code.
- Visible Validation details with profile ID, profile version, source filename, result counts, and applied field mapping.
- The selected Excel worksheet appears in Validation details when applicable.
- Downloadable `validation-report.csv` with the validation summary and applied mapping. For a selected Excel worksheet, it also records the worksheet name. The report has no generated timestamp.
- Conservative header-based detection of clear profile mismatches.
- Separate domain rules for Invoice and Customer.

Evidence:

- Repeated runs of fixed Invoice and Customer CSV files with unchanged mappings produced byte-identical row exports, issue reports, and Validation Reports.
- Reordered Invoice and Customer XLSX fixtures produced the expected mappings and **3 blocked / 1 needs review / 2 ready** classifications in each domain.
- Repeated runs of the same Invoice workbook and selected worksheet produced byte-identical Validation Reports.
- Six-row Invoice and Customer CSV fixtures were checked against explicit expectations for mapping, normalized values, issues, classifications, and exported rows.
- The Invoice numeric-normalization behavior changed during the value-level test. The Invoice profile version was advanced to `1.0.2` so reports distinguish it from the earlier behavior.

**Repeatability target:** same input + same worksheet where applicable + same mapping + same profile version = same result.

Remaining:

- Exercise a few additional representative XLSX edge cases with explicit expected values and issues.
- Investigate any reproducible mismatch before expanding product scope.
- Keep version changes tied to changes in normalization or validation behavior.

A generic `ValidationWorkspace` remains a possible direction. Extract shared behavior only after the two existing workspaces show what truly belongs in the shared layer.

### 5.3 Customer master data foundation

Status: 🟡 Second domain working; new-user understanding pending

Built:

- Customer field mapping and normalization.
- Required-field and duplicate-ID checks, plus email and country-code warnings.
- Guard against incomplete or duplicate mapping before validation and export.
- Blocked, Needs review, and Ready tabs.
- Problem, why, and fix explanations.
- Export of rows without critical issues, an issue report, and a Validation Report.
- Excel worksheet selection.
- A layout aligned more closely with Invoice: compact completed mapping, a single review area, status tabs, and expandable row details.

Checked:

- A reordered Customer XLSX mapped all five fields and produced **3 blocked / 1 needs review / 2 ready**.
- The existing Customer XLSX still worked after worksheet selection was introduced.
- A recognizable Invoice worksheet selected under Customer was rejected as a profile mismatch.
- A six-row Customer CSV mapped all five fields automatically. A missing name and case-variant duplicate IDs were blocked; one row with email and country-code warnings remained exportable.
- Its exported rows and normalized name, email, country, and VAT values matched the expected results.

Next:

- Check the workspace hierarchy on desktop and mobile.
- Observe whether a new user understands the mapping tool, warning rows, and what to fix in the source file.

Supplier, Product, Inventory, and other domains remain out of scope for Milestone 5.

### 5.4 Workflow and reliability

Status: 🟡 Core workflow working; focused internal follow-up pending

Built:

- A visible field mapping tool and mapped-field count.
- Mapping → Review → Export steps in both domains.
- Blocked, Needs review, and Ready tabs in both domains.
- Inline review details instead of a separate Invoice Inspection mode.
- One coherent Invoice Step 2 review card.
- Customer review aligned with the Invoice layout without a separate dominant next-action card.
- Structural CSV parse errors blocked before validation.
- Clear profile mismatches rejected before mapping.
- Explicit worksheet selection for Excel files with multiple populated worksheets.
- The selected worksheet recorded in Validation details and the Validation Report.
- Invoice amount validation using the same normalized value as the export.
- European and US grouped decimal formats normalized consistently for the tested values.
- Invoice header suggestions corrected after an unrelated `Source note` column was initially suggested for `invoice_number`.
- The internal Invoice duplicate-detection key excluded from the downloaded row export.

Reliability checks:

- A populated cover sheet before an Invoice data sheet exposed incorrect automatic worksheet selection. Choosing the data sheet after the change produced the expected mapping and results.
- A malformed-quotes CSV was rejected before validation.
- Invoice CSV files with 100, 1,000, and 5,000 rows and XLSX files with 1,000 and 5,000 rows showed no noticeable browser delay in manual checks.
- The six-row Invoice value-level fixture produced **3 blocked / 1 needs review / 2 ready** after the mapping and number-normalization fixes. The export contained exactly the three expected rows without blockers, including the warning row.
- The six-row Customer value-level fixture produced **3 blocked / 1 needs review / 2 ready** with the expected three-row export.
- The UI review tabs and the exported CSV content were checked separately.

These checks did not record parse time, validation time, memory use, or a maximum supported file size. The 5,000-row result is a useful responsiveness observation, not a performance guarantee.

Focused reliability backlog:

- Try a few additional Excel edge cases with explicit expected mappings, values, issues, and exports.
- Investigate a reproducible unexpected mapping, normalization, classification, or export result if one appears.
- Measure file size, row count, parse and validation times only when larger datasets or a proposed limit make that decision necessary.
- Add a pre-parse size or row guard only after establishing an evidence-based limit.

Do not repeat completed tests merely to collect more runs without a concrete remaining risk.

### 5.5 Explainability

Status: 🟡 Available; validate with a new user

Both domains show what failed, why it matters, and a suggested fix. Review cards show a concise issue summary and offer further details. Warning rows can remain in the export, and the UI explains that they should be checked before import.

Next: observe whether a new user understands which source value to correct, why a row is blocked or needs review, and what to do after reviewing an issue. Improve wording where the test reveals confusion.

AI explanations may come later. Validation outcomes remain rule-based.

### 5.6 User-configurable profiles

Status: ⏳ Future

Users can select two code-defined profiles. User-authored rules, saved configurations, target-ERP rule sets, and reusable saved mappings do not exist yet.

Do not build them until feedback on Invoice and Customer shows which configuration users actually need.

## Milestone 5 execution order

1. ✅ Make the validation context downloadable as a readable CSV.
2. ✅ Establish an initial repeatability baseline with fixed Invoice and Customer CSV files.
3. ✅ Verify representative Invoice and Customer CSV values, issues, classifications, and row exports; fix the discovered mapping, number-normalization, and internal-export-column issues.
4. 🟡 Complete a small, targeted internal check of remaining Excel edge cases and desktop/mobile workflow clarity.
5. 🟡 Verify that the deployed privacy wording matches the actual data flow.
6. ⏳ Let one person new to the product attempt the workflow without step-by-step guidance. Record confusion and fix issues that materially affect understanding.
7. ⏳ Reassess the exit criteria and close the milestone only when the evidence supports it.

Measured performance and an explicit file-size guard are not required to close this milestone unless a concrete responsiveness problem appears. Do not communicate an untested maximum.

Documentation is updated at the end of each build session to reflect what was actually built and tested.

## Milestone 5 exit criteria

- A new user can choose a profile and understand the next action without guidance.
- Invoice and Customer produce explainable, repeatable classifications for representative files.
- Exports exclude critical rows and clearly describe how warnings are handled.
- A downloadable report identifies the source filename, selected worksheet where applicable, applied profile/version, mapping, and result counts.
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

Perform a short internal desktop/mobile walkthrough and one or two targeted Excel edge-case checks. Verify the deployed privacy wording. Use feedback from an unguided new-user attempt to identify actual UI friction. Keep Invoice and Customer as the only profiles and revisit the Milestone 5 exit criteria after these checks.