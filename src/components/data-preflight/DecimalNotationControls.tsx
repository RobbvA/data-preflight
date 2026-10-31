import { HelpPopover } from "@/components/data-preflight/WorkflowHelp";
import { useId } from "react";
import { Check } from "lucide-react";
import type { DecimalNotation } from "@/lib/strictDecimal";

export function DecimalNotationControls({ label, appliesTo, value, onChange, collapsible = true }: {
  collapsible?: boolean;
  label: string;
  appliesTo: string;
  value: DecimalNotation | null;
  onChange: (value: DecimalNotation) => void;
}) {
  const id = useId();
  const controls = (<>
      <div className="clear-both flex flex-wrap gap-x-6 gap-y-2 pt-2">
        {([['point', 'Decimal point (12.50)'], ['comma', 'Decimal comma (12,50)']] as const).map(([notation, text]) => (
          <label key={notation} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-[var(--text-primary)]">
            <span className="relative flex items-center justify-center">
              <input type="radio" name={id} value={notation} checked={value === notation} required
                onChange={() => onChange(notation)}
                className="h-5 w-5 appearance-none rounded border border-white/40 bg-[var(--surface-deep)] checked:border-[var(--brand-accent)] checked:bg-[var(--brand-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]" />
              {value === notation && <Check aria-hidden="true" className="pointer-events-none absolute h-4 w-4 text-black" strokeWidth={3} />}
            </span>
            {text}
          </label>
        ))}
      </div>
      <p id={`${id}-help`} className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
        Applies to text {appliesTo}. Excel number cells use their stored value. No thousands separators, symbols or scientific text.
      </p>
      {!value && <p role="status" className="mt-2 text-sm font-medium text-[var(--brand-accent-soft)]">Next: select Decimal point or Decimal comma above. Results appear automatically once required columns and notation are set.</p>}
  </>);
  return (
    <fieldset data-guide="notation" data-guide-text={`${label}: ${value ? `decimal ${value} is selected` : "no notation selected yet"}. Choose how text ${appliesTo} are written: 12.50 or 12,50. Required columns and this choice must be complete before review and export appear. Thousands separators are not accepted; Excel number cells use stored values.`} aria-label={label} aria-describedby={`${id}-help`} className="mt-4 border-t border-white/10 pt-3">
      <legend className="float-left w-full text-sm font-semibold text-[var(--text-primary)]">
        {label} <span className="font-normal text-[var(--text-secondary)]">· Required for this file</span><HelpPopover title="Decimal notation">Choose how text {appliesTo} are written in this file: 12.50 or 12,50. Do not use thousands separators. The choice applies to text values; Excel number cells use their stored value. A new file needs a new choice.</HelpPopover>
      </legend>
      {collapsible ? <details className="clear-both pt-2 text-sm">
        <summary className="min-h-11 cursor-pointer rounded-lg py-2 text-[var(--text-primary)] marker:text-[var(--brand-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]">
          {value === "point" ? "Decimal point (12.50)" : value === "comma" ? "Decimal comma (12,50)" : "Choose decimal notation"}
        </summary>
        {controls}
      </details> : controls}
    </fieldset>
  );
}
