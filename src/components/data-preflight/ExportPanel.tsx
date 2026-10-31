"use client";

import { useId, useRef, useState } from "react";
import { FileDown, Files } from "lucide-react";
import type { ParsedRow } from "@/lib/parseCsv";
import type { ReviewReportInput } from "@/lib/reviewReport";
import { DataExportControls } from "@/components/data-preflight/DataExportControls";
import { ReportExportControls, type ReportExportHandle } from "@/components/data-preflight/ReportExportControls";

export function ExportPanel<TField extends string>({ fileName, rows, disabled, input, issueFileName }: {
  fileName: string; rows: readonly ParsedRow[]; disabled: boolean; input: ReviewReportInput<TField>; issueFileName: string;
}) {
  const [active, setActive] = useState<"data" | "reports">("data");
  const report = useRef<ReportExportHandle>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const id = useId();
  function select(value: "data" | "reports") { if (value !== active) report.current?.cancel(); setActive(value); }
  return <div className="mt-5">
    <div ref={tabs} role="tablist" aria-label="Download type" className="inline-flex max-w-full gap-1 rounded-xl border border-white/10 bg-[var(--surface-deep)] p-1">
      {([['data','Data export',FileDown],['reports','Reports',Files]] as const).map(([value,label,Icon]) => <button key={value} id={`${id}-${value}`} role="tab" aria-selected={active === value} aria-controls={`${id}-${value}-panel`} tabIndex={active === value ? 0 : -1} onClick={() => select(value)} onKeyDown={(event) => {
        if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'data' : event.key === 'End' ? 'reports' : active === 'data' ? 'reports' : 'data'; select(next); tabs.current?.querySelector<HTMLButtonElement>(`[id="${id}-${next}"]`)?.focus(); }
      }} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)] ${active === value ? 'bg-white/[0.09] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}><Icon aria-hidden="true" size={16} />{label}</button>)}
    </div>
    <div role="tabpanel" id={`${id}-data-panel`} aria-labelledby={`${id}-data`} hidden={active !== "data"}><DataExportControls fileName={fileName} rows={rows} disabled={disabled} /></div>
    <div role="tabpanel" id={`${id}-reports-panel`} aria-labelledby={`${id}-reports`} hidden={active !== "reports"}><ReportExportControls input={input} issueFileName={issueFileName} controlsRef={report} /></div>
  </div>;
}
