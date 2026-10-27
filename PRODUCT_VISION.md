# DataPreflight Product Vision

Last reviewed: 2026-10-26

## Purpose

DataPreflight is a repeatable quality gate before ERP import.

It helps people map source data, apply known validation rules, understand problems, review records, and prepare controlled output.

**Product promise:** Validate data before ERP import.

Long-term decision principle:

“DataPreflight should be the tool you run before ERP data is allowed to go anywhere important.”

This is a product ambition, not a claim that the current profiles guarantee safety or acceptance by a particular ERP.

## Intended users

- ERP and data migration consultants.
- Business analysts.
- Master data specialists.
- Finance teams.
- Operations teams preparing structured business data.

The problem is not simply whether a spreadsheet opens. Inconsistent columns, missing identifiers, duplicates, invalid values, and business-rule conflicts can create failed imports and rework.

## Current product

Invoice, Customer, Vendor and Product / Material are working, selectable profiles defined and versioned in code. M7 targets six profiles by adding Price List / Item Prices and limited Stock Balances; neither new profile is implemented yet.

A user explicitly chooses a profile before uploading a CSV, XLSX, or XLS file.

The browser suggests mappings. Correct automatic mappings do not require an extra confirmation step. Missing or duplicate mappings block validation until resolved.

All four profiles use one mapping panel with consistent field feedback and keyboard behavior.

Mapped values are normalized and checked by deterministic rules. Results appear as Blocked, Needs review, and Ready.

Users can export rows without critical issues, download issue reports, and download a Validation Report.

Source corrections happen in the original file, followed by another upload.

Saved mappings are available locally in browser localStorage, with names, profile/version, source column names and assignments, never source rows. Product has one optional in-memory allowed-unit reference CSV; it is cleared on source replacement, reset, profile switch or reload. Custom rules, projects and ERP connectors are not available.

## Quality standard

DataPreflight should feel simple while handling complex validation reliably.

Each increment follows:

Problem → Design → Implementation → Edge cases → UX → Testing → Polish → Done.

Every implemented increment should provide:

- A clear next action.
- Useful feedback after actions.
- Explainable and recoverable errors.
- Predictable state transitions.
- Consistent interaction and visual design.
- Readable typography and spacing.
- Essential keyboard and focus accessibility.
- Focused checks with relevant invalid and incomplete input.

Visual quality is part of implementation, not a final cosmetic phase.

A professional product requires trustworthy behavior as well as a polished appearance.

## Core pillars

### Field mapping

Source columns such as Factuurnr and Invoice No. can represent the same internal field.

Suggestions must remain visible and adjustable. Ambiguous required mappings need a human choice.

The selected mapping is part of validation context because changing a mapping can change the result.

Invoice retains a richer header/sample-based suggestion algorithm. Customer, Vendor and Product use header-based suggestions.

The four profiles share readiness checks and the mapping interface. Ambiguous suggestions cannot establish semantic correctness.

### Versioned validation profiles

A profile defines its fields, normalization, rules, labels, and version.

A change to normalization or validation behavior must advance the relevant profile version.

Keep domain logic independent while extracting proven common workflow behavior.

Customer, Vendor and Product share a configured workspace. Invoice may retain its own. Extend only what concrete Price/Stock or UX behavior requires; avoid a broad generic-workspace rebuild.

### Local processing

Selected files are parsed, mapped, normalized, validated, and exported in the browser in the current workflow.

The Invoice example is fetched from a public static asset.

Privacy wording must match actual deployed behavior. Analytics, logging, storage, integrations, server processing, and AI require renewed review.

Browser-side processing is valuable, but not unique by itself.

Saved mappings store configuration only, with explicit browser/device/site scope. Clearing site data removes them; localhost and production have separate storage. Decimal notation and reference lists are not silently persisted in saved mappings.

### Determinism and traceability

Current repeatability target:

same input + same worksheet where applicable + same mapping + same profile version = same result.

Product reference runs additionally account for effective reference values and check version. The planned Price/Stock profiles add explicit numeric notation to their run context.

Hard validation must remain inspectable and independent of changing AI responses.

Validation Reports record:

- Profile ID and version.
- Source filename.
- Selected worksheet where applicable.
- Applied mapping.
- Result counts.
- Product reference context when applicable.

Price/Stock notation will be added when those profiles are implemented; it is not present yet.

The current report is not a complete rule snapshot, cryptographic input fingerprint, or full audit record of every value and issue.

Fixed M5 runs demonstrated byte-identical downloads for tested cases. New scope requires new focused evidence.

## Workflow

Profile → Upload → Worksheet where applicable → Mapping → Normalize/Validate → Review → Export.

Mapping, review, and export remain visible workspace steps.

Outdated asynchronous file reads must not overwrite the current file, reset state, or newer error/loading state.

Warnings can remain exportable. Ready means the selected profile's implemented checks passed.

## Market learning

Historical professional feedback supports investigating ERP data quality, business rules, explainability, and master data workflows.

It does not prove demand for every proposed profile or price point.

Online research provided signals around:

- Repeated preparation and mapping work.
- Difficulty handling large or unclear error lists.
- Identifier quality.
- Inconsistent product units.

These are research signals, not interviews with DataPreflight customers or proof of an underserved market.

Mapping reuse and local processing are also available in competing tools.

The working opportunity is a clear, independently usable ERP validation tool with understandable domain checks and low setup effort. Its value must be tested with actual users.

Historical interviews remain in FEEDBACK.md. Do not present assistant interpretation or internet research as new interview evidence.

## M7 direction

[Detailed execution plan](docs/M7_PLAN.md) · [Current progress and resume point](docs/M7_PROGRESS.md)

1. Retain accepted step hierarchy, compact Product unit control, readable result/export text, warm off-white and subtle status tab accents.
2. Demonstrate a focused Product workspace direction for incomplete and complete mapping at desktop and 390px, then implement the accepted differences.
3. Apply the accepted hierarchy and recovery consistently across the existing four profiles.
4. Add strict decimal/Excel handling and a complete bounded Price List profile.
5. Add a complete bounded Stock Balances snapshot profile; no inventory transactions, valuation, batch/serial logic or automatic unit conversion.
6. Verify the entire six-profile app, exact downloads, context, mobile/keyboard behavior and deployed release.

Recognizable ERP tasks, low setup effort, understandable business rules, clear recovery and transparent exports form the product hypothesis. Local processing, mapping and saved mappings are valuable but not exclusive differentiators. Research signals do not establish demand, current competitor defects or willingness to pay.

Preserve one concrete subgoal per session and the exact resume point around requested side quests. New ideas remain a backlog unless explicitly brought into scope. Passing acceptance does not automatically trigger another polish cycle.

Keep DataPreflight as the working name. Renaming is not a development prerequisite.

## Validation status

M5 and M6 are internally technically complete. The M6 baseline is a91935f. The accepted initial M7 UX and narrow tab accents are pushed through 130ccaf; Vercel reports successful deployment. The four implemented profiles remain the actual current product.

The historical retained suite has 39 passing tests, two known lint warnings and a successful production build. These checks are not fresh results for the planning update. M7 final six-profile verification is still to be performed and documented.

An independent unguided user test and willingness to pay remain unproven. After M7, conduct focused outreach using one audience, a concrete profile and representative source file, building on earlier professional feedback. Learn whether users understand the workflow, repair source data, would return, and value it enough to pay. Outreach is not a blocking technical M7 exit requirement.

## Boundaries

Do not automatically add:

- AI.
- Accounts or cloud storage.
- A dashboard.
- ERP connectors.
- A full rule builder.
- Additional profiles beyond the agreed scope.
- In-app record correction.

Performance work follows concrete limits or friction rather than speculative maximum-size claims.

## Success criteria

A user should be able to identify:

- Which profile and version ran.
- Which mapping was applied.
- What failed.
- Why it matters.
- How to fix it.
- Which rows can export.
- What was not checked.

The same versioned inputs and configuration should produce the same result.

The interface should make this process clear, predictable, efficient, and visually polished.