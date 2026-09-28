# DataPreflight

**An explainable review workflow for invoice data before ERP import.**

DataPreflight maps CSV and Excel invoice exports into a consistent model, applies deterministic business rules, and shows which records are blocked, need review, or are ready under the current rules. Users can inspect the reason and suggested fix for each issue before exporting clean records.

[Live MVP](https://data-preflight.vercel.app/)

## Current MVP

- Import CSV, XLSX, and XLS invoice exports.
- Suggest field mappings for differing source headers and let users adjust them.
- Normalize invoice fields before validation.
- Apply invoice rules for required data, duplicates, amounts, VAT, status, country, currency, and dates.
- Review blocked, warning-only, and ready invoices with explainable issues.
- Download a clean invoice CSV and an issue-report CSV.
- Process uploaded files in the browser in the current flow.

The homepage contains an **illustrative** review preview. The actual Review Workspace appears after a file is loaded. The included demo CSV files can currently be downloaded and uploaded; a one-click **Try demo** flow is the next UX task.

## Why this exists

ERP and finance teams repeatedly receive exports with different headers and business-data problems. A syntactically valid spreadsheet can still fail an import or create rework downstream.

DataPreflight is intended to become a **repeatable quality gate before ERP import**. Its long-term differentiation rests on:

1. **File mapping:** varied source headers map into a consistent internal model.
2. **Validation profiles:** reusable, versioned rules for an import type or ERP context. The current MVP has invoice-specific rules in code; configurable profiles are future work.
3. **Controlled processing:** data-flow and privacy claims must match the architecture of each feature.
4. **Repeatability:** the same logical input and versioned configuration should produce the same result. AI can assist with suggestions and explanations, while hard validation remains deterministic where possible.

## Workflow

```text
Upload → Parse → Map → Normalize → Invoice rules → Explain → Review
       → Fix the source → Recheck → Export clean CSV
```

Today, fixes are made in the source file and reviewed again. There is no in-app record editor or ERP connector. “Ready” means a row passed the **currently implemented invoice checks**, not that every target ERP will accept it.

The target architecture adds a selected validation profile between normalization and validation:

```text
Source → Input adapter → ParsedDataSet → Mapping → Normalization
       → Validation profile → Explainability → Review → Trusted export
```

Input format and validation profile are separate concerns. Supporting Excel does not, by itself, imply support for a new data domain.

## Try it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), choose a CSV or Excel invoice export, or download one of the included demo CSV files from the upload card and load it.

For a production check:

```bash
npm run lint
npm run build
```

## Architecture

| Layer | Current implementation |
| --- | --- |
| Input adapters and `ParsedDataSet` | `src/lib/parseCsv.ts` |
| Mapping suggestions and selection | `src/lib/fieldMapping.ts` |
| Invoice normalization | `src/lib/normalizeInvoice.ts` |
| Invoice profile definition | `src/lib/profiles/invoiceProfile.ts` |
| Deterministic invoice validation | `src/lib/validateRows.ts` |
| CSV exports | `src/lib/exportData.ts` |
| Workflow orchestration | `src/components/CsvUploader.tsx` |
| Upload and review UI | `src/components/data-preflight/` |

`CsvUploader.tsx` still combines workflow state and homepage rendering. The validation path still imports invoice-specific rules directly. Separating these concerns belongs to Milestone 5's architecture work.

## Privacy scope

The current CSV and Excel file parsing, mapping, normalization, and validation run in the browser. The app does not send the selected file to a DataPreflight upload endpoint in this flow. Demo files are served as public static assets.

Any future server-side processing, storage, analytics, integrations, or AI provider must receive a fresh data-flow review before a broader privacy claim is made.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, PapaParse, SheetJS (`xlsx`), and Lucide.

## Status and direction

Milestones 1–4 and industry feedback collection are complete. **Milestone 5 / Sprint 5.1 (Product Positioning) is in progress.** The next homepage work is to make **Review** unmistakable and let visitors **Try the live demo** in one click. Configurable profiles, Master Data validation, XML/SQL sources, and ERP integrations are not current capabilities.

See [PRODUCT_VISION.md](PRODUCT_VISION.md), [ROADMAP.md](ROADMAP.md), [PROJECT_STATUS.md](PROJECT_STATUS.md), [FEEDBACK.md](FEEDBACK.md), and [SESSION_LOG.md](SESSION_LOG.md) for the product direction and progress.