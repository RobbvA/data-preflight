# DataPreflight Product Vision

## Purpose

DataPreflight is a repeatable quality gate before ERP import. It helps people map source data, apply known business rules, understand problems, review records, and prepare controlled output.

**Product promise:** Validate data before ERP import.

The intended users include ERP and data migration consultants, business analysts, master data specialists, finance teams, and operations teams. The problem is not merely whether a spreadsheet opens: inconsistent headers, missing identifiers, duplicates, invalid values, and business-rule conflicts create failed imports and rework.

## Current product

The app currently supports **Invoice data** and **Customer master data** as two selectable, code-defined validation profiles. A user chooses a profile before uploading a CSV, XLSX, or XLS file. The browser suggests field mapping. If the suggested mapping is complete and unambiguous, the user can continue without editing it; the mapping tool remains available.

DataPreflight normalizes mapped values, applies the selected profile's rules, and shows Blocked, Needs review, and Ready records. Users can export rows without critical issues, download an issue report, and download a Validation Report with the profile, version, source filename, selected worksheet when applicable, applied mapping, and result counts.

Customer is a second test of the product model. It does not mean Vendor, Product, Inventory, or ERP-specific profiles already exist. The app does not offer user-authored rules, saved mappings, projects, connectors, or in-app source editing.

## Four pillars

### 1. Field mapping

Source headers such as `Factuurnr` and `Invoice No.` can represent the same internal field. Suggestions must be visible and adjustable. A clear automatic suggestion should let the user proceed without opening the mapping tool. Missing or ambiguous required mappings should require a human decision rather than silently choosing a source column.

Mapping is part of the validation context: changing the mapping can change which records pass. The applied mapping is visible in Validation details and available in the downloadable Validation Report.

### 2. Validation profiles

A profile defines its data domain, fields, normalization, hard rules, labels, and version. Invoice and Customer currently use versioned definitions in code. Selecting between them is available; creating, editing, saving, or selecting a target ERP rule set is future work.

A behavior change in normalization or validation must advance the profile version so the version in a report identifies which rules produced its result.

Do not add many new profiles now. Use the existing two domains to learn what should be shared before building a generic `ValidationWorkspace`.

### 3. Local-first processing

In the current workflow, selected files are parsed, mapped, normalized, validated, and exported in the browser. The example Invoice file is fetched as a public static asset. Source files are not sent to a DataPreflight upload endpoint in this flow.

Privacy claims must match the complete deployed data flow. Future analytics, logging, server processing, persistence, integrations, and AI features require a new review. Do not promise that data “never leaves the browser” without verifying every relevant path.

### 4. Repeatability

The intended invariant is:

```text
same input + same worksheet where applicable + same mapping + same profile version = same result
```

Hard validation should be deterministic, inspectable, and independent of an AI model's changing responses.

Fixed Invoice and Customer CSV runs have produced byte-identical row exports, issue reports, and Validation Reports. Representative six-row fixtures have also been checked against explicit normalized values, issues, classifications, and exported rows. This is evidence for the tested paths, not proof that every possible file behaves correctly.

The downloadable Validation Report records the profile ID/version, source filename, selected worksheet where applicable, applied mapping, and result counts. It does not include a cryptographic fingerprint of the input, a complete rule snapshot, or every normalized value and issue. Reproducibility across releases requires version discipline and further verification for new file types and edge cases.

## Primary workflow

1. **Choose a validation profile** so the expected data model is known before reading the file.
2. **Upload** a supported file; detect CSV, XLSX, or XLS from the file itself.
3. **Choose a worksheet** when an Excel workbook contains multiple populated worksheets.
4. **Parse** headers and rows in the browser.
5. **Map** source columns to the selected profile. Accept a correct automatic suggestion or adjust missing or incorrect assignments.
6. **Normalize and validate** according to that profile's versioned rules.
7. **Explain and review** blocked, warning-only, and ready records.
8. **Fix in the source and recheck** when needed.
9. **Export** rows without critical issues, an issue report, and a Validation Report.

The current workspace makes mapping, review, and export visible as three steps. Completed mapping is compact so review can take priority. A row with a warning can remain in the export; users should inspect it before import. “Ready” means it passed the checks currently implemented for the selected profile, not that a particular ERP will certainly accept it.

## Architecture direction

Keep file parsing separate from domain logic. Convert each supported input into a `ParsedDataSet`, map it to the selected profile's fields, then run normalization and deterministic rules. The selected profile should determine fields, mapping requirements, rules, copy, review details, and export behavior.

Invoice and Customer currently share a profile contract, parsing, page shell, and parts of the mapping and export flow. They still have separate workspace components and domain-specific rules. Extract shared behavior when it is proven by both flows; preserve domain differences where they matter.

An AI assistant may later propose mappings, explain issues, or suggest fixes. It must not silently decide whether a hard validation rule passes. Suggestions and deterministic results must remain distinguishable.

## Product boundaries and next validation

The initial industry feedback supports the problem, explainability, business rules, and the potential of ERP and master data validation. It does not prove demand for every future profile, integration, privacy model, or price point. See [FEEDBACK.md](FEEDBACK.md) for the historical notes and the separately labeled product interpretation.

Next, finish a focused internal reliability and UI review of Invoice and Customer, check deployed privacy wording, and observe whether a person new to the product can use the workflow without guidance. The result of that attempt should determine which remaining UX changes are needed before closing Milestone 5.

Additional domains and ERP connectors should follow evidence from actual workflows. Possible later directions include vendor and product master data, ERP-specific profiles, data migration checks, batch processing, XML or SQL inputs, and AI-assisted explanations. None should be presented as available until built and tested.

## Success criteria

A user should quickly see which profile and mapping were applied, what needs attention, why it matters, what can be fixed, and which rows passed the current checks. The same input and versioned configuration should lead to a repeatable result that can be reviewed before ERP import.