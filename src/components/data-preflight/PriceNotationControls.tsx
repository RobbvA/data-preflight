import type { DecimalNotation } from "@/lib/strictDecimal";
import { DecimalNotationControls } from "@/components/data-preflight/DecimalNotationControls";

export function PriceNotationControls({ value, onChange }: {
  value: DecimalNotation | null;
  onChange: (value: DecimalNotation) => void;
}) {
  return <DecimalNotationControls collapsible label="Price notation" appliesTo="prices" value={value} onChange={onChange} />;
}
