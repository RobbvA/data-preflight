
---

# 2026-10-18

## Milestone 6 — Upload safety and shared mapping foundation

### Starting point

The user confirmed a clean working tree on main, up to date with origin/main.

No implementation had been completed during the earlier proposed build evenings.

M6 implementation started in this session.

### Quality agreement

Each increment follows:

Problem → Design → Implementation → Edge cases → UX → Testing → Polish → Done.

Reliability, explainable results, recoverable errors, visual quality, consistency, and essential accessibility are implementation criteria.

Run lint/build at coherent checkpoints or when a change warrants it, rather than after every minor edit.

Keep DataPreflight as the working name. Naming is not a blocker for development.

### M6.1a — Upload lifecycle safety

Updated CsvUploader.tsx and CustomerWorkspace.tsx:

- Added request IDs for asynchronous loading.
- Ignored stale file and worksheet results.
- Ignored stale errors.
- Prevented stale finally handlers from changing a newer loading state.
- Invalidated pending actions on reset.
- Invalidated pending actions on profile changes.
- Added invalidation during workspace cleanup.
- Made Customer reset clear loading.

This guards state updates; it does not cancel parser work.

Sixteen focused development-time checks passed with mocked parsing and state setters. These were not a committed application test suite or browser end-to-end tests.

The user confirmed local Invoice/Customer example loading, reset, and profile switching.

### M6.1b — Shared mapping status

Added src/lib/mappingStatus.ts.

Both workspaces now share:

- Required-field mapping checks.
- Duplicate source-column checks.
- Mapped-field count.
- Validation readiness.

Invoice and Customer retain their existing suggestion algorithms.

Generated combinations for the current profiles were compared with the previous mapping-guard behavior in the assistant's development environment.

The user confirmed that missing and duplicate mappings block review/export and that restoring valid mappings restores results.

### M6.1c — Shared mapping panel

Added src/components/data-preflight/ProfileMappingPanel.tsx.

Replaced the separate Invoice overlay and Customer inline fields with the shared panel.

Included:

- Required and optional labels.
- Field-level missing/duplicate feedback.
- Mapping-status summary.
- Invoice suggestion explanations.
- Customer ambiguous-column hints.
- Associated field labels and feedback.
- Native modal interaction.
- Escape handling.
- Focus restoration after manual opening.
- Background scroll locking.
- Automatic opening when a newly loaded file needs mapping correction.

Customer mapping changes also clear the selected row details.

### Positioning correction

Screenshots showed the dialog opening on the left despite the intended right-side layout.

A utility-class correction did not resolve it.

Explicit inline positioning on the dialog was then applied. The user confirmed that the corrected version worked.

This was a positioning correction, not a validation-rule change.

### Browser checks

The user confirmed the requested local checks.

Screenshots directly showed:

- Customer results before editing.
- The shared mapping panel.
- Duplicate source-column feedback on both affected fields.
- Review/export hidden while mapping was invalid.
- Complete mapping available after closing an invalid mapping.

Escape was explicitly confirmed. The user reported the other requested checks complete, including restoration and keyboard behavior.

The new panel still needs a separate mobile visual walkthrough; no assistive-technology audit was performed.

### Project checks

Final local checkpoint:

- npm run lint: 0 errors, 2 existing warnings.
- TypeScript: passed during build.
- npm run build: passed.

Existing warnings:

- Unused Metadata import in src/app/layout.tsx.
- Unused _tone parameter in src/components/data-preflight/DataSetPreview.tsx.

These warnings were not addressed in this increment.

### Changed code files

Modified:

- src/components/CsvUploader.tsx
- src/components/data-preflight/CustomerWorkspace.tsx

Added:

- src/components/data-preflight/ProfileMappingPanel.tsx
- src/lib/mappingStatus.ts

Domain normalization and validation rules were not intentionally changed.

Invoice remains version 1.0.2; Customer remains version 1.0.0.

### Scope and evidence limits

- M6.1a, M6.1b, and M6.1c are complete locally.
- M6.1 as a whole remains in progress.
- No Vendor, Product, saved-mapping, or reference-data feature was added.
- No independent unguided ERP/data user test was completed.
- The previous deployed privacy evidence remains historical; no new deployed M6 Network check was performed.
- No new performance maximum was measured.
- Commit, push, and deployment were not yet confirmed when this entry was prepared.

### Documentation

Prepared updated README.md, PROJECT_STATUS.md, ROADMAP.md, and PRODUCT_VISION.md.

Recorded the agreed M6 sequence, current implementation, quality criteria, evidence boundaries, and next work.

FEEDBACK.md remains unchanged as historical feedback.

### Next build step

Continue M6.1 with shared review controls and consistent status behavior.

Preserve domain-specific row presentation, normalization, and rules.

Address overly strong import-safety wording when editing the relevant review components.

Finish the necessary shared foundation before adding Vendor.

### Session closeout

After applying documentation updates:

1. Review the diff and staged files.
2. Commit the upload-safety and shared-mapping increment.
3. Push to main.
4. Confirm push/deployment separately; do not infer success from local checks.

---

# 2026-10-18 — M6.1d: Shared review controls

## Implemented

- Added ReviewStatusControls.tsx with shared category buttons and a shared status summary.
- Invoice and Customer now use consistent labels, counts, selected states, and visible keyboard focus.
- Ready is described as "Passed current checks".
- Changed the Invoice category title from "Import-ready" to "Ready invoices".
- Preserved domain-specific row presentation, filtering, validation rules, mapping, and upload lifecycle guards.

## Verified locally

- User confirmed category counts, displayed rows, and requested keyboard checks for both profiles.
- npm run lint: 0 errors; the same 2 existing unused-variable warnings.
- TypeScript and production build passed.

## Remaining scope

- M6.1 remains in progress; this completes the shared review-controls increment.
- Detailed row presentation and remaining import-safety wording still need review.
- No new validation profile was added.
- Independent new-user testing and deployed verification remain outstanding.

## Delivery status

Prepared for commit after local verification. Commit and push were not yet confirmed when this entry was written.