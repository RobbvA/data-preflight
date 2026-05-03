````md
# DataPreflight

DataPreflight is an invoice data preflight tool that validates CSV invoice data before it is imported into another system.

It helps users detect bad invoice data early, understand exactly what is wrong, and export only clean rows.

## Problem

Business data is often imported into accounting systems, CRMs, dashboards, or internal tools without enough validation.

A small mistake such as a missing invoice number, invalid email, broken amount, or suspicious VAT value can cause failed imports, manual repair work, or unreliable reporting.

DataPreflight acts as a trust layer before the import happens.

## Core idea

```text
CSV invoice data
→ select fields
→ validate rows
→ explain issues
→ split clean and blocked invoices
→ export clean data or issue report
```
````

## Features

- Upload invoice CSV files
- Detect CSV headers automatically
- Select which fields should continue through the pipeline
- Validate invoice data using deterministic rules
- Detect:
  - missing required values
  - invalid email formats
  - invalid number fields
  - empty rows
  - suspicious VAT values

- Classify issues by severity:
  - critical
  - warning

- Split invoices into:
  - ready for import
  - blocked invoices

- Click blocked invoices to inspect detailed issues
- Explain every issue with:
  - what is wrong
  - why it matters
  - how to fix it

- Export:
  - clean invoice CSV
  - invoice error report CSV
  - clean invoice JSON

## Why this project matters

This project is not just a CSV parser.

The focus is on data trust, explainability, and workflow safety.

Instead of blindly moving data from one system to another, DataPreflight checks whether the data is safe before it continues.

## Example use case

A company has invoice data that needs to be imported into an accounting system.

Before importing, the user uploads the CSV file into DataPreflight.

The app checks the data and shows:

- which invoices are ready
- which invoices are blocked
- why each blocked invoice failed
- how each issue can be fixed

The user can then export only the clean invoice data.

## Example CSV

```csv
invoice_number,company,email,amount,vat,status
INV-2026-001,Acme BV,finance@acme.nl,1200,252,ready
INV-2026-002,Beta BV,wrong-email,850,178.50,ready
,Delta BV,billing@delta.nl,500,105,ready
INV-2026-004,Gamma BV,admin@gamma.nl,abc,84,ready
INV-2026-005,Omega BV,finance@omega.nl,1000,1200,ready
```

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- PapaParse

## Architecture

```text
File upload
→ CSV parser
→ field selector
→ validation engine
→ explainability layer
→ clean/error split
→ export module
```

## Main modules

```text
src/lib/parseCsv.ts
src/lib/validateRows.ts
src/lib/exportData.ts
src/components/CsvUploader.tsx
```

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

## Future improvements

- Excel upload support
- Field mapping templates
- Auto-fix suggestions
- Custom validation rules
- Saved import history
- Webhook/API export
- Direct integrations with accounting or CRM systems
- Multiple modes:
  - invoice preflight
  - CRM lead import
  - customer data cleanup

## Long-term vision

DataPreflight can grow into a multi-data preflight platform.

The goal is to let users connect different business data sources, select the information they need, validate it, understand every issue, and export or sync trusted data into another system.

```text
messy input
→ transparent validation
→ trusted output
```

```

```
