# DataPreflight Product Vision

## What Is DataPreflight?

DataPreflight is an ERP Data Validation Platform.

It helps organizations validate, understand, review, and trust business data before it enters ERP systems, accounting platforms, CRM systems, and other business-critical applications.

Rather than simply displaying spreadsheets, DataPreflight applies explainable business validation to determine whether data is safe to import.

DataPreflight acts as a trusted validation layer between raw business data and downstream systems.

---

# Core Promise

Trusted business data before import.

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

Mapping

↓

Normalization

↓

Validation

↓

Explainability

↓

Review

↓

Fix

↓

Trusted Export

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

A user should be able to upload a dataset and determine within minutes:

- Whether the dataset is safe
- Which issues require immediate attention
- Which records are ready
- Why each issue exists
- How to resolve it

without requiring technical knowledge.

---

# Current Product Stage

Live MVP

Validation Phase Completed

Entering Milestone 5:

Validated Product Direction

Focus:

Build based on validated industry feedback rather than assumptions.
