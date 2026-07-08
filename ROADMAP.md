# DataPreflight Roadmap

---

# Milestone 1 — Upload & Parsing

Status: ✅ Completed

## Scope

- CSV Upload
- CSV Parsing
- ParsedDataSet Architecture
- Upload Workflow

---

# Milestone 2 — Mapping Platform

Status: ✅ Completed

## Scope

- Invoice Profile
- Synonym Engine
- Mapping Engine
- Missing Mapping Detection
- Duplicate Mapping Detection

---

# Milestone 3 — Validation Platform

Status: ✅ Completed

## Scope

- Normalization Engine
- Validation Engine
- Explainability Engine
- Review Workspace
- Control Center
- Export Workflow

---

# Milestone 3.7 — Excel Support

Status: ✅ Completed

## Completed

- Excel Upload
- Excel Parsing
- Excel Adapter
- Excel Integration
- Public Release

Future improvements

- Excel edge cases
- Sheet metadata
- Import metadata
- Workflow polish

---

# Milestone 4 — Design System & MVP

Status: ✅ Completed

## Completed

### Documentation Foundation

- PROJECT_STATUS.md
- PRODUCT_VISION.md
- ROADMAP.md
- SESSION_LOG.md

### Design System

- Typography hierarchy
- Density improvements
- Card hierarchy
- Spacing system
- Status hierarchy
- Brand exploration

### Branding

- Orange / Black / Off-white identity
- Landing Page redesign
- Review Workspace redesign
- Inspection Mode redesign
- Configuration Layer redesign

### Demo Strategy

Created reusable datasets for:

- Clean imports
- Mixed imports
- High-risk imports
- Mapping failures
- Regional compliance

---

# Milestone 5 — Validated Product Direction

Status: 🟡 In Progress

Purpose

Build the next generation of DataPreflight based entirely on validated industry feedback.

The objective is no longer to prove the MVP works.

The objective is to transform the MVP into a scalable ERP Data Validation Platform.

---

## Sprint 5.1 — Product Positioning

Status: Planned

Goals

- Clarify target audience
- Clarify product positioning
- Rewrite landing page messaging
- Show Review Workspace on homepage
- Promote browser privacy
- Explain why DataPreflight exists
- Clearly communicate business value

Success Criteria

A new visitor understands within seconds:

- What the product does
- Who it is for
- Why it is valuable

---

## Sprint 5.2 — Validation Architecture

Status: Planned

Goals

Separate validation into multiple layers.

Layer 1

Generic validation

Examples

- Missing values
- Invalid email
- Invalid date
- Duplicate values

Layer 2

Business validation

Examples

- Financial consistency
- VAT logic
- Payment terms
- Country rules

Layer 3

ERP Profiles

Examples

- Exact Globe
- SAP ECC
- SAP S/4HANA
- Microsoft Dynamics

Success Criteria

Validation becomes configurable rather than hardcoded.

---

## Sprint 5.3 — Master Data Foundation

Status: Planned

Goals

Prepare DataPreflight for datasets beyond invoices.

First validation domains:

- Customer
- Vendor
- Material

Objectives

- Shared validation model
- Domain profiles
- Business rule preparation

Invoices remain fully supported.

---

## Sprint 5.4 — Workflow Improvements

Status: Planned

Focus

Improve the operational workflow.

Validate

↓

Review

↓

Fix

↓

Export

Ideas

- Better prioritization
- Review improvements
- Explainability improvements
- Better inspection workflow
- Improved navigation

---

## Sprint 5.5 — Explainability

Status: Planned

Goals

Improve trust.

Every issue should explain:

- What failed
- Why it failed
- Business impact
- Suggested resolution

Long-term

AI-assisted explanations may complement the explainability engine.

---

## Sprint 5.6 — Validation Profiles

Status: Planned

Goals

Introduce configurable validation profiles.

Examples

Generic

- CSV Validation

Finance

- Invoice Validation

ERP

- Exact Globe

Future

- SAP ECC
- SAP S/4HANA
- Dynamics
- Oracle

---

# Milestone 6 — Data Migration Platform

Status: Future

Possible scope

- XML Support
- SQL Import
- ERP Extracts
- Multi-format datasets
- Migration validation
- Data profiling
- Rule templates

---

# Milestone 7 — AI Assisted Validation

Status: Future

Focus

AI should strengthen—not replace—the validation process.

Ideas

- AI explanations
- AI recommendations
- AI Readiness Score
- AI workflow summaries
- AI import risk analysis

Explainability always remains the primary source of truth.

---

# Future Vision

Possible future capabilities

## Additional Inputs

- XML
- SQL
- APIs
- PDF
- OCR

## Workspace

- Multi Dataset Workspace
- Batch Processing
- Saved Projects

## Validation

- ERP Profiles
- Master Data Profiles
- Custom Business Rules
- Validation Templates

## Integrations

- ERP Connectors
- Accounting Platforms
- Cloud Storage

---

# Current Focus

Do not expand into additional integrations until:

- Product positioning is clear.
- Validation architecture is configurable.
- Business rules are mature.
- Workflow is trusted by real users.

The priority is building a product that professionals trust before building a product that supports every possible data source.
