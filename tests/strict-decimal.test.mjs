import assert from "node:assert/strict";
import test from "node:test";
import { decodeDecimalText, decodeDecimalCell } from "../src/lib/strictDecimal.ts";
import { createCompositeKey } from "../src/lib/compositeKey.ts";

test("strict decimals: explicit point/comma, exact scale, long values and no inferred grouping", () => {
  for (const [input, notation, expected] of [
    ["12.50", "point", "12.50"], [" 12,50 ", "comma", "12.50"],
    ["1.234", "point", "1.234"], ["1,234", "comma", "1.234"],
    ["0012.000", "point", "0012.000"], ["42", "comma", "42"],
    ["90071992547409931234567890.123456789012345678900", "point", "90071992547409931234567890.123456789012345678900"],
  ]) {
    assert.deepEqual(decodeDecimalText(input, notation), { ok: true, value: expected, isZero: false, isNegative: false });
  }
  assert.deepEqual(decodeDecimalText("1.234", "comma"), { ok: false, error: "invalid-format" });
  assert.deepEqual(decodeDecimalText("1,234", "point"), { ok: false, error: "invalid-format" });
});

test("strict decimals: no silent repair of signs, separators, internal whitespace or scientific text", () => {
  for (const input of ["+1", ".5", "12.", "1e3", "1E-3", "1.234,56", "1,234.56", "1 234", "1\u00a0234", "1\t2", "1\n2", "€12", "$12", "12%", "NaN", "Infinity", "--1", "１２", "-", "1.2.3"]) {
    assert.equal(decodeDecimalText(input, "point").ok, false, input);
    assert.equal(decodeDecimalText(input, "comma").ok, false, input);
  }
  assert.deepEqual(decodeDecimalText("  ", "point"), { ok: false, error: "empty" });
  assert.deepEqual(decodeDecimalText("12.50", null), { ok: false, error: "notation-required" });
  assert.deepEqual(decodeDecimalText("12.50", "unknown"), { ok: false, error: "notation-required" });
});

test("strict decimals: all negative zero representations lose only the sign, retain fractional scale", () => {
  for (const [input, notation, value] of [["-0", "point", "0"], ["-0.00", "point", "0.00"], ["-000,000", "comma", "000.000"]]) {
    assert.deepEqual(decodeDecimalText(input, notation), { ok: true, value, isZero: true, isNegative: false });
  }
  assert.deepEqual(decodeDecimalText("-0.0010", "point"), { ok: true, value: "-0.0010", isZero: false, isNegative: true });
});

test("numeric source cells: stored value bypasses display notation, expands exponents without extra rounding", () => {
  for (const [value, expected] of [[12.3456, "12.3456"], [1e-7, "0.0000001"], [-1.23e-7, "-0.000000123"], [Number.MIN_VALUE, "0." + "0".repeat(323) + "5"], [-0, "0"], [Number.MAX_SAFE_INTEGER, "9007199254740991"]]) {
    for (const notation of ["point", "comma"]) {
      const result = decodeDecimalCell({ kind: "number", value }, notation);
      assert.equal(result.ok, true);assert.equal(result.value, expected);
    }
  }
  assert.deepEqual(decodeDecimalCell({ kind: "number", value: 12 }, null), { ok: false, error: "notation-required" });
});

test("numeric source cells: unsafe magnitude, non-finite and non-price cell types are rejected", () => {
  for (const value of [Number.MAX_SAFE_INTEGER + 1, -Number.MAX_SAFE_INTEGER - 1, NaN, Infinity, -Infinity]) {
    assert.deepEqual(decodeDecimalCell({ kind: "number", value }, "point"), { ok: false, error: "unsafe-number" });
  }
  for (const kind of ["formula", "date", "boolean", "error", "percentage"]) {
    assert.deepEqual(decodeDecimalCell({ kind, value: "12" }, "point"), { ok: false, error: "unsupported-cell" });
  }
  assert.equal(decodeDecimalCell({ kind: "text", value: "9007199254740993.00" }, "point").value, "9007199254740993.00");
});

test("composite keys: trim/case only, no delimiter collisions or internal-space mutation", () => {
  const input = [" 001 ", "RETAIL", "eur", " EA "];
  const before = structuredClone(input);
  assert.equal(createCompositeKey(input), createCompositeKey(["001", "retail", "EUR", "ea"]));
  assert.notEqual(createCompositeKey(["A|B", "C"]), createCompositeKey(["A", "B|C"]));
  assert.notEqual(createCompositeKey(['A","B', 'C']), createCompositeKey(['A', 'B","C']));
  assert.notEqual(createCompositeKey(["A  B", "C"]), createCompositeKey(["A B", "C"]));
  assert.notEqual(createCompositeKey(["001", "WH-A"]), createCompositeKey(["001", "WH-B"]));
  assert.deepEqual(input, before);
});
