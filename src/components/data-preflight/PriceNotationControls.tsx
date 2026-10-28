import { useId } from "react";
import type { DecimalNotation } from "@/lib/strictDecimal";

export function PriceNotationControls({ value, onChange }: {
  value: DecimalNotation | null;
  onChange: (value: DecimalNotation) => void;
}) {
  const descriptionId = useId();
  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      <label className="block text-sm font-semibold text-[var(--text-primary)]">
        Price notation <span className="font-normal text-[var(--text-secondary)]">· Required for this file</span>
        <select
          aria-label="Price notation"
          aria-required="true"
          aria-describedby={descriptionId}
          value={value ?? ""}
          onChange={(event) => {
            if (event.target.value === "point" || event.target.value === "comma") onChange(event.target.value);
          }}
          className="mt-2 block min-h-11 w-full max-w-sm rounded-xl border border-white/15 bg-[var(--surface-deep)] px-3 py-2.5 text-sm font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]"
        >
          <option value="" disabled>Choose decimal notation</option>
          <option value="point">Decimal point (12.50)</option>
          <option value="comma">Decimal comma (12,50)</option>
        </select>
      </label>
      <p id={descriptionId} className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
        Applies to text prices. Excel number cells use their stored value. No thousands separators, symbols or scientific text.
      </p>
      {!value && <p role="status" className="mt-2 text-sm font-medium text-[var(--brand-accent-soft)]">Choose price notation to validate prices and enable export.</p>}
    </div>
  );
}
