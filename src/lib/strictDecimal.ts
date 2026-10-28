export type DecimalNotation = "point" | "comma";

export type DecimalResult =
  | { ok: true; value: string; isZero: boolean; isNegative: boolean }
  | { ok: false; error: "notation-required" | "empty" | "invalid-format" | "unsupported-cell" | "unsafe-number" };

export type DecimalSourceCell =
  | { kind: "text"; value: string }
  | { kind: "number"; value: number }
  | { kind: "formula" | "date" | "boolean" | "error" | "percentage"; value: string };

/** Exact text grammar: never infer separators, remove grouping, or round. */
export function decodeDecimalText(value: string, notation: DecimalNotation | null): DecimalResult {
  if (notation !== "point" && notation !== "comma") return { ok: false, error: "notation-required" };
  const text = value.trim();
  if (!text) return { ok: false, error: "empty" };
  const grammar = notation === "point" ? /^-?[0-9]+(?:\.[0-9]+)?$/ : /^-?[0-9]+(?:,[0-9]+)?$/;
  if (!grammar.test(text)) return { ok: false, error: "invalid-format" };
  const canonical = text.replace(",", ".");
  const isZero = !/[1-9]/.test(canonical);
  return {
    ok: true,
    value: isZero && canonical.startsWith("-") ? canonical.slice(1) : canonical,
    isZero,
    isNegative: !isZero && canonical.startsWith("-"),
  };
}

/** String(number) may use exponents; expand its digits without another conversion. */
function expandNumber(value: number): string {
  const text = String(value);
  if (!/[eE]/.test(text)) return text;
  const [mantissa, exponent] = text.toLowerCase().split("e");
  const negative = mantissa.startsWith("-");
  const unsigned = negative ? mantissa.slice(1) : mantissa;
  const [integer, fraction = ""] = unsigned.split(".");
  const digits = integer + fraction;
  const position = integer.length + Number(exponent);
  const decimal = position <= 0 ? "0." + "0".repeat(-position) + digits
    : position >= digits.length ? digits + "0".repeat(position - digits.length)
      : digits.slice(0, position) + "." + digits.slice(position);
  return (negative ? "-" : "") + decimal;
}

export function decodeDecimalCell(cell: DecimalSourceCell, notation: DecimalNotation | null): DecimalResult {
  if (notation !== "point" && notation !== "comma") return { ok: false, error: "notation-required" };
  if (cell.kind === "text") return decodeDecimalText(cell.value, notation);
  if (cell.kind !== "number") return { ok: false, error: "unsupported-cell" };
  if (!Number.isFinite(cell.value) || Math.abs(cell.value) > Number.MAX_SAFE_INTEGER) {
    return { ok: false, error: "unsafe-number" };
  }
  // Numeric Excel cells have no textual decimal notation. Their stored value wins.
  return decodeDecimalText(expandNumber(cell.value), "point");
}
