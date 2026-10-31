"use client";

import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { HelpPopover } from "@/components/data-preflight/WorkflowHelp";
import { buildReviewReport, type ReviewReportInput } from "@/lib/reviewReport";
import { downloadIssueReport, downloadReviewWorkbook } from "@/lib/reviewReportExport";
import { downloadExportFile } from "@/lib/exportData";

export type ReportExportHandle = { cancel: () => void };

export function ReportExportControls<TField extends string>({ input, issueFileName, controlsRef }: { input: ReviewReportInput<TField>; issueFileName: string; controlsRef?: Ref<ReportExportHandle> }) {
  const [issueFormat, setIssueFormat] = useState<"csv" | "xlsx">("csv");
  const [reviewFormat, setReviewFormat] = useState<"xlsx" | "pdf">("xlsx");
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState<{ input: typeof input; organization: string; message: string } | null>(null);
  const [pending, setPending] = useState<{ input: typeof input; organization: string } | null>(null);
  const generation = useRef(0);
  useImperativeHandle(controlsRef, () => ({ cancel: () => { generation.current += 1; setPending(null); } }), []);
  useEffect(() => { generation.current += 1; return () => { generation.current += 1; }; }, [input, organization]);
  const built = useMemo(() => {
    try { return { report: buildReviewReport(input, organization), error: null }; }
    catch (caught) { return { report: null, error: caught instanceof Error ? caught.message : "Validate this source again before creating a report." }; }
  }, [input, organization]);
  const busy = pending?.input === input && pending.organization === organization;
  const currentError = error?.input === input && error.organization === organization ? error.message : null;
  async function download(kind: "issues" | "review") {
    if (!built.report || busy) return;
    setError(null);
    const request = ++generation.current;
    try {
      if (kind === "issues") { downloadIssueReport(built.report, issueFileName, issueFormat); return; }
      if (reviewFormat === "xlsx") { downloadReviewWorkbook(built.report); return; }
      setPending({ input, organization });
      const { buildReviewReportPdf, loadReportFont } = await import("@/lib/reviewReportPdf");
      const font = await loadReportFont();
      const pdf = await buildReviewReportPdf(built.report, font);
      if (request !== generation.current) return;
      downloadExportFile(`${built.report.profile.id}-review-report.pdf`, new Uint8Array(pdf).buffer, "application/pdf");
    } catch (caught) {
      if (request === generation.current) setError({ input, organization, message: caught instanceof Error ? caught.message : "The report could not be created. Retry or choose Excel." });
    } finally { if (request === generation.current) setPending(null); }
  }
  const selectStyle = "mt-2 block min-h-11 w-full rounded-xl border border-white/15 bg-[var(--surface-deep)] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]";
  const buttonStyle = "min-h-11 rounded-xl border border-white/15 bg-[var(--surface-deep)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand-accent)] disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <section aria-label="Review report exports" className="mt-4">
      <div className="mb-3 flex items-center justify-between gap-2"><p className="text-sm leading-6 text-[var(--text-secondary)]">Share the findings, including blocked rows.</p><HelpPopover title="Reports and review">The issue report lists every problem with source values and a suggested fix. The complete review adds a summary, all row decisions and the checks that ran. Reports are for review; they are not import files.</HelpPopover></div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-white/10 bg-[var(--surface-deep)] p-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Issue report</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Every issue, its source value and the suggested fix.</p>
          <label className="mt-3 block text-sm font-medium text-[var(--text-primary)]">Issue report format
            <select disabled={busy} aria-label="Issue report format" value={issueFormat} onChange={(event) => { setIssueFormat(event.target.value as "csv" | "xlsx"); setError(null); }} className={selectStyle}>
              <option value="csv">CSV (.csv)</option><option value="xlsx">Excel (.xlsx)</option>
            </select>
          </label>
          <button type="button" disabled={!built.report?.issues.length || busy} onClick={() => void download("issues")} className={buttonStyle + " mt-3 w-full"}>Download issue report</button>
          {built.report && !built.report.issues.length && <p className="mt-2 text-sm text-[var(--text-secondary)]">No issues in this validation.</p>}
        </div>
        <div className="min-w-0 rounded-xl border border-white/10 bg-[var(--surface-deep)] p-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Complete review</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Summary, issues, row decisions and validation context.</p>
          <label className="mt-3 block text-sm font-medium text-[var(--text-primary)]">Review report format
            <select disabled={busy} aria-label="Review report format" value={reviewFormat} onChange={(event) => { setReviewFormat(event.target.value as "xlsx" | "pdf"); setError(null); }} className={selectStyle}>
              <option value="xlsx">Excel (.xlsx)</option><option value="pdf">PDF (.pdf)</option>
            </select>
          </label>
          <button type="button" disabled={!built.report || busy} onClick={() => void download("review")} className={buttonStyle + " mt-3 w-full"}>Download review report</button>
          <details className="mt-3 text-sm text-[var(--text-secondary)]"><summary className="cursor-pointer py-1">Personalize report (optional)</summary>
            <label className="mt-2 block">Organization on review report
              <input disabled={busy} aria-label="Report organization" maxLength={120} value={organization} onChange={(event) => setOrganization(event.target.value)} className={selectStyle} placeholder="Your organization" />
            </label>
          </details>
        </div>
      </div>
      {busy && <button type="button" onClick={() => { generation.current += 1; setPending(null); }} className={buttonStyle + " mt-3"}>Cancel report</button>}
      {busy && <p role="status" className="mt-2 text-sm text-[var(--text-secondary)]">Creating PDF locally...</p>}
      {(built.error || currentError) && <p role="alert" className="mt-3 text-sm leading-6 text-[var(--brand-accent-soft)]">{built.error || currentError}</p>}
    </section>
  );
}
