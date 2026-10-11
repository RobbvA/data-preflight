# DataPreflight Roadmap

Last reviewed: 2026-10-11

## Milestones 1–4 — MVP foundation

Status: ✅ Completed

- Browser-based CSV upload and parsing with a shared `ParsedDataSet` model.
- Invoice field mapping, normalization, deterministic rules, explainable review, and CSV export.
- XLSX and XLS input adapters.
- Initial design system, public MVP, example datasets, and professional feedback round.

“Completed” describes the original MVP scope. Later milestones improve reliability and usability.

## Milestone 5 — Validated Product Direction

Status: ✅ Internally complete on 2026-10-11; independent self-service understanding remains unverified

Goal: establish a repeatable, explainable quality gate before ERP import with Invoice and Customer. Closure is based on internal reliability and workflow checks, not an independent usability test.

**Current workflow:** Choose validation profile → Upload → Parse → Map → Normalize → Validate → Review → Export.

The user chooses a profile before loading a file. For workbooks with multiple populated worksheets, the user chooses the worksheet before its contents are used for mapping and validation.

Invoice data and Customer master data are the two working profiles. Do not add another domain during this milestone.

### 5.1 Product positioning and first use

Status: ✅ Implemented; independent first-use validation deferred to later outreach

Built:

- ERP-import positioning and an illustrative review preview on the landing page.
- Explicit profile choice before upload or example loading. No profile is selected by default.
- Visible upload and example actions that prompt for a profile when none is selected.
- Example loading through the same browser-side processing path as an uploaded file.
- Browser-processing explanation near file selection.
- A visible Mapping → Review → Export sequence in both workspaces.
- Compact mapping status when mapping is complete, with an Edit mapping tool when needed.
- Review results presented as the main workspace activity in both domains.

Follow-up: the user completed a mobile walkthrough and found the flow usable, with cramped spacing noted for polish. Desktop flows were exercised earlier. First-use comprehension by an unfamiliar ERP/data user remains unverified. Keep privacy wording aligned with future changes.

### 5.2 Shared validation architecture and traceability

Status: ✅ Working foundation for two domains; broader coverage is future work

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

Final targeted XLSX check: an empty first sheet was skipped and three records on the populated Invoice sheet produced **1 blocked / 1 needs review / 1 ready**; the sheet appeared in the Validation Report. Investigate future reproducible mismatches and advance profile versions when behavior changes.

A generic `ValidationWorkspace` remains a possible direction. Extract shared behavior only after the two existing workspaces show what truly belongs in the shared layer.

### 5.3 Customer master data foundation

Status: ✅ Second domain working; independent user understanding unverified

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

Internal workspace checks are sufficient for M5. Observe unfamiliar-user understanding of mapping and warnings in a later independent test.

Supplier, Product, Inventory, and other domains remain out of scope for Milestone 5.

### 5.4 Workflow and reliability

Status: ✅ Core workflow and focused internal checks complete

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
- An empty-first-sheet XLSX returned the expected three classifications from its populated Invoice worksheet; the report named the worksheet.
- A mobile walkthrough found the flow usable; tighter spacing is later polish.

These checks did not record parse time, validation time, memory use, or a maximum supported file size. The 5,000-row result is a useful responsiveness observation, not a performance guarantee.

Reliability work as scope expands:

- Investigate reproducible unexpected mapping, normalization, classification, or export results.
- Test new profiles and reference checks at value level before presenting them as reliable.
- Measure file size, row count, parse and validation times only if larger datasets or a proposed limit make that decision necessary.
- Add a pre-parse size or row guard only after establishing an evidence-based limit.

Do not repeat completed tests merely to collect more runs without a concrete remaining risk.

### 5.5 Explainability

Status: ✅ Available in both domains; unfamiliar-user comprehension unverified

Both domains show what failed, why it matters, and a suggested fix. Review cards show a concise issue summary and offer further details. Warning rows can remain in the export, and the UI explains that they should be checked before import.

Independent follow-up: observe whether an unfamiliar user understands source corrections and warning rows in the export. Improve wording where a concrete test reveals confusion.

AI explanations may come later. Validation outcomes remain rule-based.

### 5.6 User-configurable profiles

Status: ⏳ Future

Users can select two code-defined profiles. User-authored rules, saved configurations, target-ERP rule sets, and reusable saved mappings do not exist yet.

Do not build them until feedback on Invoice and Customer shows which configuration users actually need.

## Milestone 5 closeout — 2026-10-11

1. ✅ The Validation Report and repeated Invoice/Customer CSV runs produced traceable, byte-identical outputs for fixed input and mapping.
2. ✅ Representative CSV and XLSX fixtures confirmed mapping, values, issues, classification, warning export, and worksheet selection. Malformed CSV was blocked.
3. ✅ An empty-first-sheet XLSX produced **1 blocked / 1 needs review / 1 ready** from its populated Invoice sheet; the report identified the sheet.
4. ✅ Chrome Network showed no outgoing request during the tested deployed upload and downloads. Current source uses browser-side parsing, validation, and downloads.
5. ✅ The user completed a mobile walkthrough without a blocking issue; desktop flows were exercised earlier.
6. ⏳ No independent unguided new-user test was completed. This earlier hard exit criterion was consciously moved out of M5 closeout. It remains necessary before claiming independently proven self-service usability.

M5 is **internally complete**, not proof for every workbook, large dataset, ERP target, or new-user journey. Manual 5,000-row checks do not establish a performance ceiling. Simon's informal interaction did not provide reliable UX evidence and prompted no change.

## Milestone 5 internal exit assessment

| Criterion | Evidence and limit |
| --- | --- |
| Profile choice and workflow | Implemented and exercised internally on desktop and mobile; independent first-use comprehension unverified. |
| Explainable, repeatable Invoice/Customer results | Fixed runs, value-level fixtures, issue details, and matching reports/exports checked. |
| Controlled export | Critical rows excluded; tested warning rows remain exportable with explanatory copy. |
| Traceability | Report includes source filename, profile ID/version, mapping, counts, and selected worksheet when applicable. |
| Privacy in current flow | Source review plus deployed Network observation during the tested file and download actions; recheck after changes. |

Documentation is updated at the end of each build session.

## Milestone 6 — Outreach-ready ERP validation platform

Status: ⏳ Planning; no M6 implementation started

Plan scope before building. Intended direction: a consistent platform across Invoice, Customer, Vendor/Supplier, and Product/Material, with one shared profile → upload/worksheet → mapping → review → export flow. Vendor is the first candidate, then a deliberately limited Product profile. Define minimal fields, rules, and acceptance fixtures before implementation.

Horizontal candidates: locally saved reusable mappings, a narrow local reference-data validation prototype, clearer export inclusion/exclusion, and stronger validation evidence where useful. Keep verdicts deterministic and processing browser-side. Research a distinctive name and verify candidates before broader positioning.

Preserve status tabs, problem/why/fix explanations, profile versions, Validation Reports, and local exports in every domain. Avoid separate mini-apps per profile. Independent self-service and domain feedback must inform later outreach; closing internal M5 does not erase that open question.

Do not automatically add AI, accounts, a dashboard, ERP connectors, a full rule builder, or extra profiles. M6 planning should turn candidates into a realistic sequence and stop conditions.

## Milestone 7 — AI assistance

Status: Future

Possible uses: mapping proposals, explanations, and suggested fixes. AI output must remain distinguishable from deterministic rule results and must respect the data-handling model.

## Next build step

Plan M6 before new profile code: minimum Vendor and Product fields/rules, shared workspace behavior and layout, acceptance fixtures, locally saved mapping flow, bounded reference-data experiment, naming research, and timing for independent usage feedback.