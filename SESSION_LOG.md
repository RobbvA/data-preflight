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

Completed major UX improvements.

- Improved Inspection Mode density
- Improved Review Workspace density
- Improved Control Center hierarchy
- Reduced KPI dominance
- Compacted Next Action card
- Improved spacing consistency

### Branding

Established first visual identity.

- Orange / Black / Off-white palette
- Landing Page redesign
- Control Center redesign
- Inspection Mode redesign
- Review Workspace redesign

### Demo Strategy

Created reusable demo datasets.

Categories:

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
- Advanced the Invoice validation profile from `1.0.0` to `1.0.1` because the validation behavior changed.
- Removed the separate Invoice Inspection mode panel. Invoice review cards now reveal issues, explanations, fixes, and optional row fields inline.

### Verified

- The user placed the changes locally and confirmed the profile flow, mismatch handling, Validation details, and inline review worked in the browser.
- A focused numeric check confirmed that values such as `1,234` are no longer interpreted differently by the validation step and exported data.
- A full repeatability test across fixed Invoice and Customer files has **not** been completed.

### Commit

Changes were committed and pushed to `main` as `894542f` — `feat: improve profile review and fix invoice validation`.

### Remaining limitation

Profile mismatch detection deliberately catches clear header signatures only. It cannot prove that every unfamiliar file or manual mapping is semantically correct.

The validation context is visible but cannot yet be downloaded as a standalone report.

---

# 2026-10-05

## Milestone 5 — Documentation sync and next validation step

### Product decision

Finish Milestone 5 before adding another validation profile or starting a broad feature sprint.

The agreed order is:

1. Synchronize PROJECT_STATUS.md, ROADMAP.md, and SESSION_LOG.md with the current code.
2. Add a readable `validation-report.csv`.
3. Test repeatability with fixed Invoice and Customer files.
4. Observe a new user completing the workflow without guidance.
5. Reassess the Milestone 5 exit criteria.

### Validation Report scope

Use the validation context already available in the interface:

- validation profile;
- profile version;
- source filename;
- total rows;
- blocked rows;
- rows needing review;
- ready rows;
- applied field mapping from DataPreflight fields to source columns.

Keep the first version as an understandable CSV. Do not add JSON, a generated timestamp, or a larger reporting system. An XLSX workbook with separate Summary, Field Mapping, Issues, and Ready Data sheets is a possible later direction.

### Repeatability check

Run the same Invoice and Customer files more than once with the same mapping and profile version. Compare:

- applied mapping;
- normalized values;
- Blocked / Needs review / Ready counts;
- issues;
- clean export data;
- Validation Report contents.

The target is to demonstrate:

**same input + same mapping + same profile version = same result**

### Next build step

Implement the small CSV Validation Report, then run the repeatability checks. After that, prioritize an external new-user test over new features.