import type { DecimalResult } from "@/lib/strictDecimal";

type ExactDecimal = Extract<DecimalResult, { ok: true }>;

function parts(value: string, factor: number) {
  const negative = value.startsWith("-");
  const [integer, fraction = ""] = value.replace(/^-/, "").split(".");
  const digits = integer + fraction;
  let carry = 0;
  const product: number[] = [];
  for (let index = digits.length - 1; index >= 0; index--) {
    const digit = Number(digits[index]) * factor + carry;
    product.push(digit % 10);
    carry = Math.floor(digit / 10);
  }
  if (carry) product.push(carry);
  return { negative, digits: product.reverse().join(""), scale: fraction.length };
}

// Only individual digits are numbers: full monetary values never pass through Number.
function compareProducts(left: ExactDecimal, leftFactor: number, right: ExactDecimal, rightFactor: number): number {
  if (left.isZero && right.isZero) return 0;
  if (left.isNegative !== right.isNegative) return left.isNegative ? -1 : 1;
  const first = parts(left.value, leftFactor);
  const second = parts(right.value, rightFactor);
  const scale = Math.max(first.scale, second.scale);
  const a = (first.digits + "0".repeat(scale - first.scale)).replace(/^0+/, "") || "0";
  const b = (second.digits + "0".repeat(scale - second.scale)).replace(/^0+/, "") || "0";
  const magnitude = a.length === b.length ? (a === b ? 0 : a > b ? 1 : -1) : a.length > b.length ? 1 : -1;
  return left.isNegative ? -magnitude : magnitude;
}

export function compareDecimals(left: ExactDecimal, right: ExactDecimal): number {
  return compareProducts(left, 1, right, 1);
}

export function isAboveThirtyPercent(part: ExactDecimal, total: ExactDecimal): boolean {
  return compareProducts(part, 10, total, 3) > 0;
}
