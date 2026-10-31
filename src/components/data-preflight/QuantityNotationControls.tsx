import type { DecimalNotation } from "@/lib/strictDecimal";
import { DecimalNotationControls } from "@/components/data-preflight/DecimalNotationControls";

export function QuantityNotationControls({ value, onChange }: {
  value: DecimalNotation | null;
  onChange: (value: DecimalNotation) => void;
}) {
  return <DecimalNotationControls label="Quantity notation" appliesTo="quantities" value={value} onChange={onChange} />;
}
