# DataPreflight

DataPreflight is an invoice data preflight tool that validates CSV invoice data before it is imported into another system.

It helps users detect bad invoice data early, understand exactly what is wrong, and export only clean rows.

---

## Problem

Business data is often imported into accounting systems, CRMs, dashboards, or internal tools without enough validation.

A small mistake such as a missing invoice number, invalid email, broken amount, or suspicious VAT value can cause failed imports, manual repair work, or unreliable reporting.

In reality, exported CSV files also rarely match the expected structure.

DataPreflight acts as a trust layer before the import happens.

---

## Core idea

```text
CSV invoice data
→ detect headers
→ map fields (user-defined)
→ validate rows
→ explain issues
→ split clean and blocked invoices
→ export clean data or issue report
```

---

## Features

### Input & Mapping

- Upload invoice CSV files
- Detect CSV headers automatically
- Map CSV fields to expected invoice fields (e.g. "Invoice No" → invoice_number)
- Handle inconsistent or messy CSV structures

### Validation

- Validate invoice data using deterministic rules
- Detect:
  - missing required values
  - invalid email formats
  - invalid number fields
  - empty rows
  - suspicious VAT values

### Issue classification

- Classify issues by severity:
  - critical (blocks import)
  - warning (review recommended)

### Data review

- Split invoices into:
  - ready for import
  - blocked invoices
- Filter blocked invoices
- Click blocked invoices to inspect detailed issues
- Show issue count per row

### Explainability

- Every issue includes:
  - what is wrong
  - why it matters
  - how to fix it

### Export

- Download clean invoice CSV
- Download invoice error report CSV
- Copy clean invoice JSON

---

## Why this project matters

This project is not just a CSV parser.

The focus is on:

- data trust
- explainability
- workflow safety

Instead of blindly moving data from one system to another, DataPreflight checks whether the data is safe before it continues.

---

## Example use case

A company has invoice data that needs to be imported into an accounting system.

The CSV export might look like this:

```csv
Invoice No,Client Name,Email Address,Total Price,VAT Amount
INV-2026-001,Acme BV,finance@acme.nl,1200,252
INV-2026-002,Beta BV,wrong-email,850,178.50
```

Before importing, the user uploads the CSV file into DataPreflight.

The user maps:

```text
Invoice No → invoice_number
Client Name → company
Email Address → email
Total Price → amount
VAT Amount → vat
```

The app then shows:

- which invoices are ready
- which invoices are blocked
- why each blocked invoice failed
- how each issue can be fixed

The user exports only the clean invoice data.

---

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- PapaParse

---

## Architecture

```text
File upload
→ CSV parser
→ field mapping layer
→ validation engine
→ explainability layer
→ clean/error split
→ export module
```

---

## Main modules

```text
src/lib/parseCsv.ts
src/lib/validateRows.ts
src/lib/exportData.ts
src/components/CsvUploader.tsx
```

---

## Validation engine

The validation engine is deterministic.

It does not rely on AI or hidden logic. Every issue is rule-based and explainable.

Each issue returns:

```ts
{
  rowIndex: number;
  field: string;
  problem: string;
  why: string;
  fix: string;
  severity: "critical" | "warning";
}
```

---

## Future improvements

- Excel upload support
- Field mapping templates (saved mappings)
- Auto-fix suggestions
- Custom validation rules
- Saved import history
- Webhook/API export
- Direct integrations with accounting or CRM systems
- Multiple modes:
  - invoice preflight
  - CRM lead import
  - customer data cleanup

---

## Long-term vision

DataPreflight can grow into a multi-data preflight platform.

The goal is to let users:

- connect different business data sources
- map and normalize data
- validate and understand issues
- export or sync trusted data into other systems

```text
messy input
→ mapping layer
→ transparent validation
→ trusted output
```
