# DataPreflight Product Vision

## What Is DataPreflight?

DataPreflight is a Business Data Quality Control Platform.

It helps organizations understand, validate, review, and trust business data before it enters critical downstream systems.

It helps organizations validate business data before importing it into accounting systems, ERP systems, bookkeeping platforms, or operational workflows.

DataPreflight is not a spreadsheet viewer.

DataPreflight is not a CSV tool.

DataPreflight acts as a trusted intelligence layer between business data and downstream systems.

---

## Core Promise

Trusted business data before import.

---

## Who Is It For?

### Primary Users

- Finance teams
- Accounting teams
- ERP migration teams
- Operations teams
- Bookkeepers
- Data migration specialists

### Typical Data Sources

- CSV exports
- Excel exports
- ERP exports
- Accounting exports
- Invoice datasets

---

## The Problem

Imported datasets often contain:

- Missing invoice numbers
- Missing company names
- Invalid email addresses
- Duplicate invoices
- Incorrect VAT values
- Invalid dates
- Workflow inconsistencies
- Country and currency mismatches

Most tools only display data.

DataPreflight helps users understand whether the data is safe.

---

## Core Pipeline

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

Trusted Export

---

## Product Principles

### Trust First

Data should be trustworthy before import.

### Explain Everything

Every issue should explain:

- What is wrong
- Why it matters
- What risk it creates
- How to fix it

### Operational Workflow

Users should be able to:

- Detect issues
- Prioritize issues
- Fix issues
- Export trusted data

### Source Agnostic Architecture

All inputs are transformed into:

ParsedDataSet

allowing the rest of the platform to remain independent from file format.

---

## Current Architecture

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

Review Workspace

↓

Export Layer

---

## Current Supported Inputs

### CSV

Supported

### Excel

Supported

Formats:

- .csv
- .xlsx
- .xls

---

## Future Vision

DataPreflight should evolve into a business data intelligence platform capable of validating operational datasets before they enter critical systems.

Future opportunities may include:

- Batch Processing
- Multi Dataset Workspace
- PDF Support
- OCR Support

These remain intentionally out of scope until the review workflow feels mature and trustworthy.

---

## Success Criteria

A user should be able to upload a dataset and determine within minutes:

- Whether the dataset is safe
- Which issues must be fixed
- Which rows can be exported
- Why each issue matters
- How to resolve each issue

without needing technical knowledge.

Current Product Stage

Live MVP
Public validation phase
