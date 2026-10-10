# Session Log

---

# 2026-06-16

## Documentation Foundation

### Completed

Created project documentation:

- PROJECT_STATUS.md
- ROADMAP.md
- PRODUCT_VISION.md
- SESSION_LOG.md

### Design System

Completed major UX improvements:

- Improved Inspection Mode density
- Improved Review Workspace density
- Improved Control Center hierarchy
- Reduced KPI dominance
- Compacted Next Action card
- Improved spacing consistency

### Branding

Established the first visual identity:

- Orange / Black / Off-white palette
- Landing Page redesign
- Control Center redesign
- Inspection Mode redesign
- Review Workspace redesign

### Demo Strategy

Created reusable datasets:

- Clean
- Mixed
- High Risk
- Mapping Chaos
- Regional Compliance

### Key Insights

- Product identity is becoming as important as functionality.
- Workflow polish creates more value than adding random features.
- Documentation greatly reduces dependency on long AI conversations.

### Next Session

Complete Brand Exploration and prepare MVP deployment.

---

# 2026-06-18

## MVP Release

### Completed

- Public deployment to Vercel
- Production build completed
- Floating export actions
- Export workflow improvements
- Control Center polish
- Review Workspace polish
- Inspection Mode polish

### Milestone

DataPreflight MVP became publicly available.

### Live Demo

https://data-preflight.vercel.app/

### Next Phase

Milestone 5 — MVP Validation

---

# 2026-07

## Industry Validation Phase

### Objective

Validate whether DataPreflight solves a real business problem before continuing development.

Instead of adding more features, focus shifted toward learning from professionals working with ERP systems, accounting platforms, and data migration projects.

### Outreach Results

Feedback collected from:

- ERP professionals
- Business analysts
- Data migration consultants
- Developers

Key contributors:

- Patrick
- Huub van den Ende
- Adem
- Simon
- Archana Kumari

### Major Product Insights

#### Product Positioning

Repeated feedback showed that positioning was too broad.

DataPreflight should clearly communicate:

- who it is for;
- which problem it solves;
- why it is different.

#### Business Logic

The biggest opportunity is explainable business validation, beyond technical file checks.

Examples:

- VAT logic
- Financial consistency
- Master Data validation
- ERP-specific validation

#### Workflow

The existing workflow received positive validation:

Validate → Review → Fix → Export

This remains one of the strongest parts of the product.

#### Master Data

The direction expanded from Invoice Validation toward ERP Data Validation.

Potential future domains mentioned in feedback include customers, vendors, materials, GL accounts, cost centers, and invoice data. These are opportunities, not commitments to build them immediately.

#### Data Migration

Several conversations identified data migration as a promising long-term niche. Configurable validation before an ERP migration may become a future direction.

#### Explainability

Users need to understand:

- what failed;
- why it matters;
- how to fix it.

#### AI

AI may later help with explanations, summaries, mapping proposals, or suggested fixes. Deterministic business rules remain the source of validation outcomes.

### Significant Milestone

A one-hour strategy discussion with an experienced ERP and Data Migration specialist influenced the long-term direction.

Key outcomes:

- Validation of the underlying business problem.
- More attention to Master Data.
- Interest in configurable business rules.
- Potential introductions to other ERP specialists.

### Direction After Feedback

DataPreflight moved beyond a single Invoice Validation MVP toward a repeatable ERP data quality gate.

Milestone 5 became **Validated Product Direction**: strengthen the product based on feedback, then test the resulting workflow with new users.

---

# 2026-09-27 to 2026-09-28

## Milestone 5 / Sprint 5.1 — Homepage and Product Thesis

### Shipped on main

- Reframed the hero around ERP import and invoice validation.
- Added an illustrative Review Workspace preview with Blocked, Needs review, and subtly green Ready states.
- Moved the browser-processing privacy note beside file selection.
- Aligned the preview and upload cards and shortened the opening copy.
- Removed homepage cards advertising planned formats, profiles, and Master Data capabilities.

At this point, the preview was illustrative and example CSV files still required manual download and upload. Later sessions changed the example-loading flow.

### Product decision

The long-term differentiation is field mapping, validation profiles, controlled processing, and repeatable deterministic results. DataPreflight should become a quality gate before ERP import rather than a generic AI file checker.

### Documentation

Synchronized README, PRODUCT_VISION, PROJECT_STATUS, ROADMAP, FEEDBACK, and SESSION_LOG on 2026-09-28. Historical interview notes remained separate from the new product interpretation.

---

# 2026-09-29 to 2026-09-30

## Milestone 5 — Two-domain foundation

### Built

- Refined landing-page hierarchy and changed the primary copy to “Validate data before ERP import.”
- Let users choose Invoice data or Customer master data before uploading. Invoice was still the default selection at this stage; a later session removed that default.
- Added direct example loading through the same browser-side path as an uploaded file.
- Introduced a shared profile contract for field definitions, normalization, validation, and versioning.
- Added Customer as a second working domain with mapping, deterministic checks, review, and export.
- Required users to resolve missing or ambiguous required Customer mapping before validation and export.
- Kept Invoice and Customer business rules separate while sharing parsing, a workspace shell, and the profile execution contract.

### Verified in the browser

- Invoice and Customer example/test files produced blocked, warning-only, and ready results.
- Leaving an ambiguous Customer ID unmapped prevented validation and export. Choosing the correct source column restored the expected results.
- The user confirmed the local app was working.

### Product decision

Do not add more profiles yet. Use Invoice and Customer to discover which parts should become generic.

---

# 2026-10-03

## Milestone 5 — Workflow clarity and reliable input

### Built and manually checked

- Made field mapping a visible workspace tool with a mapped-field count instead of relying on a small side control.
- Gave the current workflow a prominent next action.
- Added Blocked, Needs review, and Ready tabs to Customer review, matching Invoice.
- Made Invoice show mapping, review, and export as three visible steps, matching Customer.
- Moved Invoice export below review and removed duplicate floating export controls.
- The user placed the files locally and reported that the flow worked.

### CSV parsing safeguard

The CSV parser previously ignored structural errors returned by Papa Parse. It now rejects parsing errors, including inconsistent field counts, before mapping and validation.

A correction removed an unsafe exception for `TooFewFields`: a short row can mean a missing delimiter in the middle, which could shift values into the wrong fields. Empty values must retain their CSV separators. The final correction was verified in `src/lib/parseCsv.ts` and committed in `2745fae`.

### Architecture and privacy review

A source review found browser-side parsing, mapping, normalization, validation, and export in the current file flow. The Invoice example is fetched from a public static path.

This was a targeted source review, not a blanket audit of every future or deployed integration. Keep privacy claims scoped to the actual flow.

### Documentation

Updated PROJECT_STATUS.md, README.md, PRODUCT_VISION.md, ROADMAP.md, and SESSION_LOG.md to reflect two working profiles and the current workflow. FEEDBACK.md remained unchanged as a historical feedback log.

---

# 2026-10-04

## Milestone 5 — Profile-first flow, traceability, and inline review

### Built

- Removed the implicit Invoice selection. Users now explicitly choose Invoice data or Customer master data before uploading or loading an example.
- Kept the upload and example actions visible before profile choice. Clicking one without a profile prompts the user to choose a profile.
- Added conservative header-based profile mismatch detection. Clearly recognizable Customer files are rejected under Invoice, and clearly recognizable Invoice files are rejected under Customer.
- Added **Validation details** to both workspaces. It shows profile ID/version, source filename, result counts, and applied field mapping.
- Kept the customer-facing output focused on CSV; no technical JSON download was added.
- Found and fixed a double-normalization error in Invoice numbers. Validation now reads the same normalized amount that is exported.
- Advanced the Invoice validation profile from `1.0.0` to `1.0.1` because validation behavior changed.
- Removed the separate Invoice Inspection mode panel. Invoice review cards now reveal issues, explanations, fixes, and optional row fields inline.

### Verified

- The user placed the changes locally and confirmed the profile flow, mismatch handling, Validation details, and inline review worked in the browser.
- A focused numeric check confirmed that values such as `1,234` are no longer interpreted differently by the validation step and exported data.
- A full repeatability test across fixed Invoice and Customer files had not yet been completed at this point.

### Commit

Changes were committed and pushed to `main` as `894542f` — `feat: improve profile review and fix invoice validation`.

### Remaining limitation

Profile mismatch detection deliberately catches clear header signatures only. It cannot prove that every unfamiliar file or manual mapping is semantically correct.

At this point, the validation context was visible but could not yet be downloaded as a standalone report.

---

# 2026-10-05

## Milestone 5 — Downloadable Validation Report

### Product decision

Finish Milestone 5 before adding another validation profile or starting a broad feature sprint.

The Validation Report should let a user identify which file, profile version, and mapping produced a result without requiring JSON or another technical format.

### Built

- Added a readable `validation-report.csv` download to the Validation details for Invoice and Customer.
- The report contains validation profile, profile ID/version, source filename, total rows, Blocked, Needs review, Ready, and the applied field mapping.
- Kept the report deterministic by omitting a generated timestamp.
- Preserved browser-side report generation.

### Checked

- The report opened in Excel.
- A comparison initially returned different hashes because two reports came from different source files. Comparing reports from identical runs produced matching hashes.
- Two reports from repeated Customer runs with the same source and mapping were byte-identical.

### Commit

Changes were committed and pushed to `main` as `7a311a9` — `feat: add downloadable validation report`. The working tree was clean afterward.

### Next direction

Test repeatability further, then exercise more realistic CSV/XLSX files, malformed inputs, and performance before an unguided external user test.

---

# 2026-10-06

## Milestone 5 — Review clarity and reliability checks

### Invoice review UI

- Removed the duplicate separation between Invoice Step 2 and the review workspace so review appears as one coherent card.
- Removed the redundant **Show only blocked** control, which did not change the visible tab contents.
- Kept Blocked, Needs review, and Ready as the controls for switching between result categories.
- The user checked all three tabs after the change and confirmed they still worked.

### Repeatability baseline

Repeated the same Invoice CSV run with the same mapping and compared downloads:

- Invoice exports without blockers: byte-identical;
- Invoice issue reports: byte-identical.

Repeated the same Customer CSV run with the same mapping and compared downloads:

- Customer exports without blockers: byte-identical;
- Customer issue reports: byte-identical.

Validation Reports for repeated identical runs were also checked and matched. This is an initial baseline for fixed fixtures, not proof that all possible files and edge cases are repeatable.

### Reordered Excel fixtures

Tested two XLSX files with reordered columns and representative edge cases:

- Invoice: all 10 fields mapped; 6 rows produced **3 blocked / 1 needs review / 2 ready**.
- Customer: all 5 fields mapped; 6 rows produced **3 blocked / 1 needs review / 2 ready**.

The results matched the expectations for these fixtures. Broader Excel testing remains open.

### Malformed CSV

- Tested an Invoice CSV with an opening quote that was not closed.
- DataPreflight stopped the file before validation.
- The original error message referred to a misleading row number. The CSV error text was adjusted to avoid that incorrect location and guide the user to check quotes and column counts.
- Whitespace normalization in `normalizeCellValue` was retained after correcting an accidental omission while transferring the file.
- The user retested the malformed file and confirmed the guard worked under Invoice.

### Current assessment

Milestone 5 has a working Validation Report, an initial repeatability baseline, and successful targeted Excel and malformed-CSV checks. It remains in progress because representative file coverage, performance evidence, and an unguided new-user test are still missing.

### Next build step at the time

Continue a focused reliability matrix. Compare expected mapping, normalized values, individual issues, exports, and Validation Report. Keep Invoice and Customer as the only profiles.

---

# 2026-10-07

## Milestone 5 — Excel worksheet selection and performance checks

### Multi-sheet Excel issue

An Invoice workbook was created with a populated `Read me` worksheet followed by the actual `Invoice export` worksheet. Before the change, DataPreflight read the first sheet as though it were invoice data and suggested an incorrect field mapping.

### Built

- Added an explicit worksheet choice for Excel files with multiple populated worksheets before their contents are mapped and validated.
- Passed the chosen worksheet through the browser-side Excel parser for both Invoice and Customer.
- Recorded the selected worksheet in the parsed dataset, Validation details, and the downloadable Validation Report.
- Kept CSV report output unchanged when no worksheet applies.
- Corrected the Customer review component while transferring the worksheet-selection changes.

### Verified

- Choosing `Invoice export` in the multi-sheet workbook mapped all 10 Invoice fields and produced **3 blocked / 1 needs review / 2 ready** from six rows.
- The Validation Report identified the source workbook and selected worksheet.
- Repeating the same Invoice workbook and worksheet selection produced byte-identical Validation Reports.
- Selecting the Invoice worksheet under the Customer profile was rejected as a recognizable profile mismatch.
- The existing reordered Customer XLSX still worked in the updated Customer workspace.

### File-size observations

Manually uploaded Invoice CSV files containing 100, 1,000, and 5,000 rows. The results appeared without noticeable browser delay.

The first synthetic CSV fixtures contained values such as `Company 000001`. Those numeric-looking values lowered automatic mapping confidence for the `Company` column despite its exact header. After `Company` was chosen manually, the runs produced Ready results. A separate 100-row CSV with ordinary business names mapped `Company` automatically.

Manually uploaded Invoice XLSX files containing 1,000 and 5,000 rows with ordinary business names. Mapping completed automatically, and there was no noticeable browser delay.

This was a responsiveness check, not a benchmark. No parse time, validation time, memory use, or maximum supported size was measured. Do not infer or advertise a file-size limit from these results.

### Current assessment

The worksheet-selection defect is resolved for the tested Invoice workbook. The Customer workspace still handles the existing XLSX fixture. The tested CSV and XLSX sizes did not reveal an obvious responsiveness problem.

### Next build step at the time

Use representative Invoice and Customer files with explicit expected mappings, normalized values, and individual issues. Fix reproducible failures before moving to an unguided new-user test. Do not add another validation profile.

---

# 2026-10-10

## Milestone 5 — Workspace alignment and value-level reliability

### Customer workspace

- Aligned the Customer layout more closely with Invoice.
- A complete mapping now appears as a compact Step 1 summary with an **Edit mapping** tool.
- Removed the separate dominant Customer next-action card.
- Made Step 2 the main review area with Blocked, Needs review, and Ready tabs and expandable row details.
- Kept Step 3 focused on exporting reviewed rows.
- The user placed the changes locally and reviewed both domain layouts in the browser.

### Invoice value-level fixture

A six-row CSV was tested with European and US number formats, extra source columns, whitespace, mixed case, duplicate Invoice numbers, a date-order warning, and a missing amount.

The first run revealed two real issues:

1. `invoice_number` was automatically assigned to an unrelated `Source note` column. A short synonym, `no`, matched inside `note`, while numeric sample detection treated characters inside Invoice IDs as numeric values.
2. A valid US grouped number, `1,234.56`, was treated as invalid.

Header matching and numeric sample detection were corrected. Number normalization now recognizes the tested European and US formats. Because normalization behavior changed, the Invoice validation profile advanced from `1.0.1` to `1.0.2`.

After a fresh upload, all ten Invoice fields mapped automatically, including `invoice_number` → `Invoice No.`. The six rows produced **3 blocked / 1 needs review / 2 ready** without a manual mapping change.

The export contained the expected `INV-V101`, `INV-V102`, and `INV-V105` rows. The date-order warning row remained exportable; duplicate Invoice numbers and the missing-amount row were excluded. The exported dates and normalized number values were checked from the CSV.

An internal `normalized_invoice_key` column was discovered in the row export. It was removed from the downloaded CSV header while remaining available internally for duplicate detection. The user confirmed that a new export no longer contained this column.

### Customer value-level fixture

A separate six-row Customer CSV included whitespace and casing, a missing name, invalid email, three-letter country code, case-variant duplicate IDs, and an unrelated `Source note` column.

All five Customer profile fields mapped automatically. The result was **3 blocked / 1 needs review / 2 ready**:

- `C-402` was blocked for a missing name.
- `C-404` and `c-404` were blocked as duplicate IDs.
- `C-403` had two warnings and remained exportable.
- `C-401` and `C-405` passed the current checks.

The export contained exactly `C-401`, `C-403`, and `C-405`. Direct inspection of the downloaded CSV confirmed that `C-401` became `Acme BV`, `finance@acme.example`, `NL`, and `NL123456789B01`. The other exported rows also matched the expected values.

### Performance decision

Earlier manual uploads of 100, 1,000, and 5,000 Invoice CSV rows and 1,000 and 5,000 Invoice XLSX rows showed no noticeable delay. This is sufficient to continue the current Milestone 5 workflow. Timed measurements and a file-size guard remain conditional work if larger files or responsiveness become a concrete concern. No tested maximum is claimed.

### Current assessment

The targeted Invoice and Customer CSV value-level checks passed after fixing the issues they exposed. The UI still needs a short internal desktop/mobile hierarchy review, a few targeted Excel edge-case checks, and verification that deployed privacy wording matches the data flow.

An unguided attempt by a person new to DataPreflight remains a Milestone 5 exit criterion. Simon may be asked for a short test, but no feedback from this new attempt has been received or assessed in this session.

### Next build step

1. Review first action, mapping tool, review priority, and export wording on desktop and mobile.
2. Check one or two remaining representative Excel edge cases with explicit expected outcomes.
3. Verify deployed privacy wording against actual processing.
4. Record feedback from an unguided new-user attempt when available; fix concrete confusion.
5. Reassess the Milestone 5 exit criteria. Do not add a third profile.

Update the remaining project Markdown at the end of the build session, then review the staged changes before committing and pushing.