import type { CsvRow } from "@/lib/parseCsv";

export type ValidationError = {
  rowIndex: number;
  field: string;
  type: "required" | "email" | "number" | "empty-row";
  message: string;
};

export function validateRows(rows: CsvRow[]): ValidationError[] {
  const errors: ValidationError[] = [];

  rows.forEach((row, index) => {
    const values = Object.values(row);
    const isEmptyRow = values.every((value) => value.trim() === "");

    if (isEmptyRow) {
      errors.push({
        rowIndex: index + 1,
        field: "row",
        type: "empty-row",
        message: "This row is empty.",
      });

      return;
    }

    Object.entries(row).forEach(([field, value]) => {
      const trimmedValue = value.trim();

      if (trimmedValue === "") {
        errors.push({
          rowIndex: index + 1,
          field,
          type: "required",
          message: "This field is required.",
        });

        return;
      }

      if (
        field.toLowerCase().includes("email") &&
        !isValidEmail(trimmedValue)
      ) {
        errors.push({
          rowIndex: index + 1,
          field,
          type: "email",
          message: "This is not a valid email address.",
        });
      }

      if (isLikelyNumberField(field) && Number.isNaN(Number(trimmedValue))) {
        errors.push({
          rowIndex: index + 1,
          field,
          type: "number",
          message: "This field should contain a number.",
        });
      }
    });
  });

  return errors;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLikelyNumberField(field: string) {
  const normalizedField = field.toLowerCase();

  return (
    normalizedField.includes("amount") ||
    normalizedField.includes("price") ||
    normalizedField.includes("total") ||
    normalizedField.includes("vat") ||
    normalizedField.includes("quantity")
  );
}
