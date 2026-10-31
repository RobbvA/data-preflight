import { decodeDecimalText, type DecimalNotation, type DecimalResult } from "@/lib/strictDecimal";

/** Explicit notation only; no grouping/symbol stripping or full-value Number conversion. */
export function normalizeNumber(value: string | undefined, notation: DecimalNotation | null): DecimalResult {
  return decodeDecimalText(value ?? "", notation);
}
