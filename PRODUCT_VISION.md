# DataPreflight Product Vision

Last reviewed: 2026-10-18

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

Invoice and Customer are working, selectable profiles defined and versioned in code.

A user explicitly chooses a profile before uploading a CSV, XLSX, or XLS file.

The browser suggests mappings. Correct automatic mappings do not require an extra confirmation step. Missing or duplicate mappings block validation until resolved.

Both profiles use one mapping panel with consistent field feedback and keyboard behavior.

Mapped values are normalized and checked by deterministic rules. Results appear as Blocked, Needs review, and Ready.

Users can export rows without critical issues, download issue reports, and download a Validation Report.

Source corrections happen in the original file, followed by another upload.

Vendor, Product, saved mappings, reference checks, custom rules, projects, and ERP connectors are not available yet.

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

Invoice retains a richer header/sample-based suggestion algorithm. Customer uses header-based suggestions.

Both share the same readiness checks and mapping interface.

### Versioned validation profiles

A profile defines its fields, normalization, rules, labels, and version.

A change to normalization or validation behavior must advance the relevant profile version.

Keep domain logic independent while extracting proven common workflow behavior.

The current separate workspaces are being improved incrementally. Avoid a large speculative framework or four copied mini-apps.

### Local processing

Selected files are parsed, mapped, normalized, validated, and exported in the browser in the current workflow.

The Invoice example is fetched from a public static asset.

Privacy wording must match actual deployed behavior. Analytics, logging, storage, integrations, server processing, and AI require renewed review.

Browser-side processing is valuable, but not unique by itself.

Future saved mappings should store configuration only, with clear browser/device scope.

### Determinism and traceability

Current repeatability target:

same input + same worksheet where applicable + same mapping + same profile version = same result.

A reference-data feature must additionally account for its effective reference values and check version.

Hard validation must remain inspectable and independent of changing AI responses.

Validation Reports record:

- Profile ID and version.
- Source filename.
- Selected worksheet where applicable.
- Applied mapping.
- Result counts.

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

## M6 direction

1. Strengthen shared behavior and interaction.
2. Add a limited Vendor profile.
3. Add local reusable mappings.
4. Test independent usage.
5. Add a deliberately limited Product profile.
6. Add one local unit-code reference check.
7. Complete consistency and outreach-readiness checks.

Keep DataPreflight as the working name. Renaming is not a development prerequisite.

## Validation status

M5 is internally complete.

An independent unguided new-user test remains outstanding and must not be treated as a proven result.

M6 started locally on 2026-10-18 with upload lifecycle safety, shared mapping readiness, and the shared mapping panel.

This local implementation and internal verification do not establish deployed M6 availability, market adoption, or willingness to pay.

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