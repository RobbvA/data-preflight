import { Upload, Columns3, ListChecks, Download, Check } from "lucide-react";

export type WorkflowStage = "upload" | "mapping" | "review" | "export";
const steps = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "mapping", label: "Mapping", icon: Columns3 },
  { key: "review", label: "Review", icon: ListChecks },
  { key: "export", label: "Export", icon: Download },
] as const;

export function WorkflowProgress({ stage }: { stage: WorkflowStage }) {
  const current = steps.findIndex(step => step.key === stage);
  return <ol aria-label="Validation workflow" className="mx-auto grid w-full max-w-3xl grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-[var(--surface-base)] px-2 py-2 sm:px-4">
    {steps.map((step, index) => {
      const active = index === current;
      const complete = index < current;
      const Icon = complete ? Check : step.icon;
      return <li key={step.key} aria-current={active ? "step" : undefined} className="flex min-w-0 flex-col items-center gap-1">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${active ? "border-[var(--brand-accent-soft)] bg-[rgba(182,111,58,0.12)] text-[var(--brand-accent-soft)]" : "border-white/10 bg-white/[0.035] text-[var(--text-secondary)]"}`}><Icon size={16} aria-hidden="true" /></span>
        <span className={`text-sm ${active ? "font-semibold text-[var(--brand-accent-soft)]" : "text-[var(--text-secondary)]"}`}>{step.label}</span>
        {complete && <span className="sr-only">Completed</span>}
      </li>;
    })}
  </ol>;
}
