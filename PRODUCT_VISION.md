# DataPreflight Product Vision

## What Is DataPreflight?

DataPreflight is evolving into a configurable ERP Data Validation Platform: a repeatable quality gate before ERP import.

It helps organizations validate, understand, review, and trust business data before it enters ERP systems, accounting platforms, CRM systems, and other business-critical applications.

Rather than simply displaying spreadsheets, DataPreflight applies explainable business validation to determine whether data is safe to import.

The current MVP reviews invoice data from CSV and Excel files. Reusable, user-selectable validation profiles and Master Data domains are product direction, not current user-facing capabilities.

---

# Core Promise

Trusted business data before ERP import.

---

# Product Thesis — Four Pillars

DataPreflight should not compete as a general-purpose AI file checker. Its differentiation should come from the following capabilities working together.

## 1. File Mapping

Different source headers can represent the same business field. For example, `Factuurnr`, `Invoice No.`, and `Inv ID` can map to `invoice_number`.

Mapping suggestions must remain inspectable and adjustable. The current MVP already has invoice field mapping; reusable mapping configurations are future work.

## 2. Validation Profiles

A profile defines the fields and rules for a data domain, import type, ERP context, or workflow. Profiles should be reusable and versioned so recurring imports can be checked against agreed rules.

The current invoice profile and validation rules are defined in code. Selecting or configuring profiles in the UI has not been built.

## 3. Privacy and Controlled Processing

Each feature must make clear where source data is read, processed, stored, and sent. Current CSV and Excel parsing and validation happen in the browser. Future server processing, persistence, integrations, or AI assistance require a fresh data-flow review.

Privacy is a product advantage only where the implementation supports the exact claim.

## 4. Repeatability

The same logical input, mapping, normalization rules, and versioned profile should produce the same result. Hard validation rules should be deterministic wherever possible.

AI may assist with mapping suggestions, explanations, and recommendations, but must not silently determine whether a record passes a hard rule. Unsupported file sizes should produce an explicit error rather than an incomplete result.

## Feature Filter

A new feature should strengthen mapping, reusable profiles, controlled handling of data, repeatable results, explainable review, or reliable ERP-oriented output.

---

# Product Mission

Reduce costly import errors by validating business data before it reaches critical systems.

DataPreflight aims to shorten review cycles, reduce manual validation work, and increase confidence during ERP implementations, data migration projects, and operational imports.

---

# Who Is It For?

## Primary Users

- ERP Consultants
- Data Migration Consultants
- Business Analysts
- Data Quality Specialists
- Master Data Specialists
- Finance Teams
- Operations Teams

---

## Secondary Users

- Accounting Teams
- Bookkeepers
- ERP Administrators
- Implementation Partners

---

# Typical Data Sources

Current

- CSV exports
- Excel exports

Future

- XML
- SQL query results
- ERP exports
- API payloads
- Additional structured business datasets

---

# Core Problem

Organizations regularly import business data into ERP and accounting systems.

Small mistakes often cause:

- Failed imports
- Manual rework
- Incorrect financial data
- Duplicate records
- Invalid master data
- Broken workflows

Most existing tools either:

- only display spreadsheets,
- or validate technical formats.

Very few explain whether business data is actually safe to import.

---

# Product Direction

DataPreflight is evolving from an Invoice Validation MVP into a configurable ERP Data Validation Platform.

Invoices remain an important use case, but they are no longer the only focus.

Long-term validation domains include:

- Customers
- Vendors
- Materials
- Products
- GL Accounts
- Cost Centers
- Price Lists
- Invoice Data

The platform should validate both:

- Generic data quality
- ERP-specific business rules

---

# Core Workflow

Upload

↓

Parse

↓

Mapping

↓

Normalization

↓

Validation Profile + Rules (target architecture)

↓

Explainability

↓

Review

↓

Fix

↓

Trusted Export

In the current MVP, invoice rules are applied in code. Users fix the source file and review it again; there is no in-app record editor. A clean export contains rows that passed the implemented checks, not a guarantee that every ERP will accept them.

---

# Product Principles

## Trust First

Business data should be trustworthy before import.

---

## Explain Everything

Every issue should clearly explain:

- What is wrong
- Why it matters
- Which business risk it creates
- How it can be resolved

Users should never have to guess why data is blocked.

---

## Business Logic Over Technical Validation

Technical validation is only the foundation.

The real value comes from validating business rules such as:

- Duplicate business entities
- Mandatory ERP fields
- Country-specific rules
- Financial consistency
- Master data completeness
- ERP-specific validation profiles

---

## Workflow First

DataPreflight is not simply a validation engine.

It is an operational review workflow.

Users should be able to:

- Detect issues
- Understand issues
- Prioritize issues
- Review issues
- Fix issues
- Export trusted data

---

## Configurable Validation

Validation should become configurable.

Future versions should support reusable validation profiles that combine:

- Generic validation rules
- Business rules
- ERP-specific validation rules

without requiring code changes.

Profiles and rule sets should be versioned. The current invoice profile is a code definition, not a selectable product feature.

---

## Explainable AI

Artificial Intelligence should strengthen DataPreflight.

It should never replace explainability.

AI should assist with:

- explanations
- recommendations
- summaries
- future AI Readiness scoring

while every validation remains transparent and explainable.

AI-generated suggestions must remain distinguishable from deterministic validation results.

---

## Source Agnostic Architecture

Every input is transformed into:

ParsedDataSet

allowing validation to remain independent from file format.

---

# Current Architecture

Input Layer

↓

Adapter Layer

↓

ParsedDataSet

↓

Mapping Engine

↓

Normalization Engine

↓

Validation Engine

↓

Explainability Engine

↓

Review Workspace

↓

Trusted Export

---

# Current Supported Inputs

Supported

- CSV
- Excel (.xlsx)
- Excel (.xls)

Current processing uses browser-based adapters for these file types. The present validation and review flow is invoice-specific.

---

# Long-Term Vision

DataPreflight should become a configurable validation platform capable of validating business-critical datasets before they enter ERP systems.

Rather than replacing ERP systems, DataPreflight complements them by acting as a trusted validation layer.

Future opportunities include:

- Master Data Validation
- ERP Validation Profiles
- Data Migration Validation
- Batch Processing
- Multi Dataset Workspace
- SQL Inputs
- XML Inputs
- AI Readiness Scoring
- AI-assisted Validation
- PDF Support
- OCR Support

These remain intentionally out of scope until the validation workflow feels mature, explainable, and trusted.

---

# Success Criteria

A user should be able to upload a supported dataset and determine within minutes:

- Which mapping and rules were applied
- Whether the dataset is safe
- Which issues require immediate attention
- Which records are ready
- Why each issue exists
- How to resolve it

without requiring technical knowledge.

The same supported input and configuration should produce a repeatable result. “Safe” and “ready” refer to the applied rule set (and, later, the selected profile), not to an unconditional guarantee of downstream import success.

---

# Current Product Stage

Live MVP

Validation Phase Completed

Entering Milestone 5:

Validated Product Direction

Focus:

Build from industry feedback and test the remaining product hypotheses with real users.