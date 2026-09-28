# DataPreflight Project Status

Last reviewed: 2026-09-28

## Product

DataPreflight is an invoice-review MVP evolving toward a repeatable ERP data quality gate.

Core promise: **Trusted business data before ERP import.**

[Live MVP](https://data-preflight.vercel.app/) · [Product vision](PRODUCT_VISION.md) · [Roadmap](ROADMAP.md)

## Current milestone

**Milestone 5 — Validated Product Direction**

**Sprint 5.1 — Product Positioning: in progress**

Milestones 1–4, the public MVP, CSV and Excel support, and the initial industry-feedback phase are complete.

## Available now

- CSV, XLSX, and XLS invoice input through browser-based adapters
- `ParsedDataSet` representation and suggested, adjustable invoice field mapping
- Invoice normalization and deterministic invoice validation rules
- Explainable issues with severity, business risk, and suggested fix
- Review Workspace with blocked, needs-review, and ready categories
- Clean invoice CSV and issue-report CSV exports
- Public static demo files that users can download and upload

The homepage now has sharper ERP-import copy, an **illustrative** invoice review preview, a privacy note beside the upload, aligned cards, and a subtle green Ready state. These changes are the first part of Sprint 5.1.

## Next action in Sprint 5.1

Make it clear within seconds that DataPreflight provides a **Review Workspace**. Add a primary **Try live demo** action that loads the existing messy demo directly into the same processing flow as a user-selected file. Keep **Upload your file** as the second action and keep the privacy claim next to it.

After this, review the first viewport on desktop and mobile, update copy where needed, and validate the positioning with new visitors. Do not mark Sprint 5.1 complete before this experience is checked.

## Product decision

The differentiating direction is **file mapping + reusable validation profiles + controlled processing + repeatable results**. AI may assist with suggestions and explanations; hard validation should remain deterministic where possible. The same logical input and versioned configuration should produce the same classification.

Privacy claims must be checked against the actual data flow of each feature. The current file-processing flow runs in the browser. Future storage, server processing, integrations, and AI providers need separate review.

See [PRODUCT_VISION.md](PRODUCT_VISION.md) for the full decision. This direction is a product hypothesis informed by feedback; it is not a claim that every pillar was independently validated by interviewees.

## Not yet available

- One-click demo loading
- User-selectable or configurable validation profiles
- Master Data validation domains
- Saved mappings, profile versions, or persisted projects
- In-app record editing
- XML or SQL inputs and ERP connectors
- AI-assisted processing

An invoice profile exists in code, but invoice-specific imports remain in the validation path. Source adapters are separate from domain rules only at the input layer.

## Known technical debt

- `CsvUploader.tsx` combines homepage UI and workflow orchestration.
- Validation and review still contain invoice-specific logic.
- Profile and mapping versions are not stored, so strict cross-version repeatability is not yet guaranteed.
- File-size behavior, Excel edge cases, and cross-browser behavior need explicit verification.
- The meaning of “ready” must stay tied to checks actually applied; no universal ERP acceptance guarantee.

## Documentation

- `README.md`: current MVP, setup, and architecture
- `PRODUCT_VISION.md`: product thesis and four pillars
- `ROADMAP.md`: delivery sequence
- `FEEDBACK.md`: historical professional feedback plus clearly labeled product interpretation
- `SESSION_LOG.md`: dated progress and next steps