# DataPreflight Roadmap

Last reviewed: 2026-10-03

## Milestones 1–4 — MVP foundation

Status: ✅ Completed

- Browser-based CSV upload and parsing with a shared `ParsedDataSet` model.
- Invoice field mapping, normalization, deterministic rules, explainable review, and CSV export.
- XLSX and XLS input adapters.
- Initial design system, public MVP, example datasets, and professional feedback round.

Later milestones may refine these parts; “completed” describes the original MVP scope.

## Milestone 5 — Validated Product Direction

Status: 🟡 In progress

Goal: turn the invoice MVP into a reliable, repeatable ERP data quality gate. Choose work that strengthens field mapping, validation profiles, local processing, repeatability, explainable review, or trustworthy output.

**Working product flow:** Choose validation profile → Upload → Parse → Map → Normalize → Validate → Review → Export.

Invoice and Customer are the two current test cases. Do not expand into more domains before their shared behavior and domain differences are understood.

### 5.1 Product positioning and first use

Status: 🟡 Implemented in the app; new-user validation pending

Built:

- ERP-import message and illustrative review preview on the landing page.
- Profile choice before upload, with Invoice selected by default.
- Direct example loading through the same processing path as a selected file.
- Browser-processing explanation near file selection.
- Clearer emphasis on trying the actual workflow.

Remaining:

- Check desktop and mobile comprehension with new visitors.
- Keep privacy wording aligned with the complete deployed data flow.
- Refine text hierarchy only where user testing exposes confusion.

### 5.2 Shared validation architecture

Status: 🟡 In progress

Built:

- `DataProfile` field definitions and a shared `ValidationProfile` contract.
- Shared mapping-to-profile and normalization/validation execution functions.
- Versioned Invoice and Customer definitions in code.
- Parsing separated from profile-specific validation.

Next:

- Make profile ID/version and applied mapping traceable for a validation run and its output.
- Verify deterministic results for repeated input, mapping, and profile version.
- Extract common workspace behavior only after it is demonstrably the same in Invoice and Customer.

Keep domain-specific business rules independent. A single generic workspace is a direction, not a required immediate rewrite.

### 5.3 Customer master data foundation

Status: 🟡 Initial domain working; broader master data pending

Built:

- Customer profile, field mapping, normalization, required-field and duplicate-ID checks, email and country-code warnings.
- Mapping guard before validation and export.
- Customer review categories, explanations, and export.

Next: validate Customer with representative real-world exports and use findings to improve the shared profile contract. Vendor, Product, Inventory, and other domains remain out of scope for now.

### 5.4 Workflow and reliability

Status: 🟡 In progress

Built:

- Visible field mapping tool and mapped-field count.
- One prominent next action in each workspace.
- Blocked, Needs review, and Ready tabs in both domains.
- Mapping → Review → Export steps in both domains.
- CSV structural parse errors stop processing before validation.

Next:

- Show concise feedback after a mapping or review action: what changed and what still needs attention.
- Reduce repeated instructions; move deeper explanations behind Details where useful.
- Test malformed files, larger files, Excel edge cases, and browser behavior.

### 5.5 Explainability

Status: 🟡 Available, refinement pending

Both domains show what failed, why it matters, and a suggested fix. Invoice has a richer issue model than Customer. Improve consistency where it helps users act, without erasing real domain differences. AI explanations may come later; hard results remain rule-based.

### 5.6 Configurable validation profiles

Status: ⏳ Future

The user can currently **select between two code-defined profiles**. User-authored rules, saved profile configurations, target-ERP rule sets, and reusable saved mappings do not exist yet. Build them when the Invoice and Customer workflows show which configuration users actually need.

## Milestone 5 exit criteria

- A new user can choose a profile and understand the next action without guidance.
- Invoice and Customer produce explainable, repeatable classifications for representative files.
- Exports exclude critical rows, describe warning handling, and identify the applied validation context.
- Privacy claims match measured data flows.
- Feedback from new users confirms the workflow is understandable and worth using.

## Milestone 6 — Data migration platform

Status: Future. Potential scope: more master data domains, migration checks, larger datasets, batch workflows, XML/SQL inputs, and ERP integration. Prioritize only after Milestone 5's reliability and adoption questions are answered.

## Milestone 7 — AI assistance

Status: Future. Possible uses: mapping proposals, explanations, and suggested fixes. AI output must remain distinguishable from deterministic rule results and must respect the data-handling model.

## Next build session

Strengthen repeatability with a small, reviewable validation-context step: make the selected profile ID/version and applied mapping visible or exportable alongside the result. Then exercise it with Invoice and Customer before designing persistent projects or adding profiles.