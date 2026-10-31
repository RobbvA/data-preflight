"use client";

import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, CircleHelp, Route, X } from "lucide-react";

const GuideContext = createContext<() => void>(() => {});
const STEPS = [
  { key: "profile", title: "Choose the right profile", text: "Choose what your file contains: invoices, customers, vendors, products, prices or stock balances. Each profile checks a different set of fields." },
  { key: "source", title: "Start with a source file", text: "Try an example to explore safely, or upload CSV or Excel. Choose a worksheet when asked. Your file is processed in this browser; replacing it starts a fresh validation." },
  { key: "mapping", title: "Step 1 / Check your columns", text: "Confirm that each DataPreflight field uses the correct source column. Required fields must be mapped, and one column cannot serve two fields. Saved mappings reuse column choices, not previous results." },
  { key: "notation", title: "Confirm the decimal notation", text: "Choose whether text amounts use a point (12.50) or a comma (12,50). This is required for each new file. Thousands separators are not accepted. Excel number cells use stored values." },
  { key: "review", title: "Step 2 / Understand the results", text: "Blocked rows cannot enter the data export. Needs review rows can export with warnings. Ready means the current checks passed, not that your ERP will accept the import. Open Details for all issues, correct your source and upload it again." },
  { key: "export", title: "Step 3 / Choose your download", text: "Use Data export for rows without blockers. Use Reports to share issues or the complete review in Excel or PDF. The counts explain what is included; changing the review category never changes the data export." },
] as const;
type GuideStep = Omit<typeof STEPS[number], "text"> & { text: string; element: HTMLElement };

export function WorkflowHelpProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<GuideStep[] | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const originScroll = useRef({ left: 0, top: 0 });
  const start = useCallback(() => {
    originScroll.current = { left: window.scrollX, top: window.scrollY };
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const available = STEPS.flatMap((step) => {
      const element = document.querySelector<HTMLElement>(`[data-guide="${step.key}"]`);
      return element && element.getClientRects().length && !element.closest("[hidden]") ? [{ ...step, text: element.dataset.guideText || step.text, element }] : [];
    });
    if (available.length) setSteps(available);
  }, []);
  const close = useCallback(() => { setSteps(null); requestAnimationFrame(() => { if (opener.current?.isConnected) opener.current.focus({ preventScroll: true }); window.scrollTo({ ...originScroll.current, behavior: "instant" }); }); }, []);
  return <GuideContext.Provider value={start}>{children}{steps && <GuidedWalkthrough steps={steps} onClose={close} />}</GuideContext.Provider>;
}

export function WorkflowGuideButton() {
  const start = useContext(GuideContext);
  return <button type="button" onClick={start} className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.04] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]"><Route aria-hidden="true" size={16} />Quick guide</button>;
}

export function HelpPopover({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 12 });
  const button = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const startGuide = useContext(GuideContext);
  const close = useCallback(() => { setOpen(false); button.current?.focus({ preventScroll: true }); }, []);
  useLayoutEffect(() => {
    if (!open) return;
    const move = () => {
      const rect = button.current?.getBoundingClientRect();
      if (!rect) return;
      const h = panel.current?.offsetHeight ?? 230;
      setPosition({ left: Math.max(12, Math.min(rect.left, innerWidth - Math.min(320, innerWidth - 24) - 12)), top: rect.bottom + h + 12 < innerHeight ? rect.bottom + 8 : Math.max(12, rect.top - h - 8) });
    };
    move(); panel.current?.focus({ preventScroll: true });
    const outside = (event: PointerEvent) => { if (!panel.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setOpen(false); };
    const outsideFocus = (event: FocusEvent) => { if (!panel.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setOpen(false); };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); close(); } };
    window.addEventListener("resize", move); window.addEventListener("scroll", move, true);
    document.addEventListener("pointerdown", outside); document.addEventListener("focusin", outsideFocus); document.addEventListener("keydown", key);
    return () => { window.removeEventListener("resize", move); window.removeEventListener("scroll", move, true); document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outsideFocus); document.removeEventListener("keydown", key); };
  }, [open, close]);
  return <>
    <button ref={button} type="button" aria-label={`Help: ${title}`} aria-expanded={open} aria-controls={open ? id : undefined} aria-haspopup="dialog" onClick={() => setOpen((value) => !value)} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/[0.07] hover:text-[var(--brand-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]"><CircleHelp aria-hidden="true" size={18} /></button>
    {open && createPortal(<div ref={panel} id={id} role="dialog" aria-label={title} tabIndex={-1} style={position} className="fixed z-[80] max-h-[calc(100dvh-24px)] w-[320px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-2xl border border-white/15 bg-[#211f1b] p-4 text-[var(--text-primary)] shadow-2xl outline-none">
      <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold">{title}</p><button type="button" aria-label="Close help" onClick={close} className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"><X size={16} /></button></div>
      <div className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{children}</div>
      <button type="button" onClick={() => { setOpen(false); button.current?.focus(); startGuide(); }} className="mt-3 inline-flex min-h-9 items-center gap-2 text-sm font-medium text-[var(--brand-accent-soft)]">Walk me through it<ArrowRight size={14} /></button>
    </div>, document.body)}
  </>;
}

function GuidedWalkthrough({ steps, onClose }: { steps: GuideStep[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [frame, setFrame] = useState({ top: 20, left: 20, width: 100, height: 100 });
  const card = useRef<HTMLDivElement>(null), title = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const step = steps[index];
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-workspace-root]");
    const previous = root?.inert ?? false;
    const overflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = "hidden";
    return () => { if (root) root.inert = previous; document.body.style.overflow = overflow; };
  }, []);
  useEffect(() => {
    const target = step.element;
    if (!target.isConnected) { onClose(); return; }
    target.scrollIntoView({ block: "start", behavior: "instant" });
    window.scrollBy({ top: -24, behavior: "instant" });
    title.current?.focus({ preventScroll: true });
    const move = () => {
      if (!target.isConnected) { onClose(); return; }
      const rect = target.getBoundingClientRect();
      const available = innerHeight - (card.current?.offsetHeight ?? 290) - 62;
      setFrame({ top: Math.max(8, rect.top - 6), left: Math.max(8, rect.left - 6), width: Math.min(rect.width + 12, innerWidth - 16), height: Math.max(50, Math.min(rect.height + 12, available)) });
    };
    move();
    const observer = new MutationObserver(() => { if (!target.isConnected) onClose(); });
    const root = document.querySelector("[data-workspace-root]");
    if (root) observer.observe(root, { childList: true, subtree: true });
    window.addEventListener("resize", move); window.addEventListener("scroll", move, true);
    return () => { observer.disconnect(); window.removeEventListener("resize", move); window.removeEventListener("scroll", move, true); };
  }, [step, onClose]);
  function key(event: React.KeyboardEvent) {
    if (event.key === "Escape") { event.preventDefault(); onClose(); }
    if (event.key === "Tab") {
      const focusable = [...(card.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === title.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }
  return createPortal(<div className="fixed inset-0 z-[100]" onKeyDown={key}>
    <button type="button" tabIndex={-1} aria-label="Close walkthrough backdrop" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default" />
    <div aria-hidden="true" style={{ ...frame, boxShadow: "0 0 0 9999px rgba(0,0,0,.72)" }} className="pointer-events-none fixed rounded-2xl border-2 border-[var(--brand-accent-soft)]" />
    <div ref={card} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} className="fixed bottom-3 left-3 right-3 max-h-[65vh] overflow-auto rounded-2xl border border-white/15 bg-[#211f1b] p-5 text-[var(--text-primary)] shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-[380px]">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold uppercase tracking-[.16em] text-[var(--brand-accent-soft)]">Quick guide · {index + 1} of {steps.length}</p><button type="button" aria-label="Close walkthrough" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"><X size={18} /></button></div>
      <h2 ref={title} tabIndex={-1} id={`${id}-title`} className="mt-2 text-lg font-semibold outline-none">{step.title}</h2>
      <p id={`${id}-description`} className="mt-3 break-words text-sm leading-6 text-[var(--text-secondary)]">{step.text}</p>
      <div className="mt-5 flex items-center justify-between gap-3"><button type="button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm disabled:opacity-30"><ArrowLeft size={16} />Back</button><button type="button" onClick={() => index === steps.length - 1 ? onClose() : setIndex((value) => value + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand-accent)] px-4 text-sm font-semibold text-black">{index === steps.length - 1 ? "Done" : "Next"}<ArrowRight size={16} /></button></div>
    </div>
  </div>, document.body);
}
