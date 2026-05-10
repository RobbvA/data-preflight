import type { CsvRow } from "@/lib/parseCsv";

export type FieldMapping = {
  invoice_number: string;
  company: string;
  email: string;
  amount: string;
  vat: string;
  status: string;
};

export type InvoiceField = keyof FieldMapping;

export type MappingConfidence = "high" | "medium" | "low" | "none";

export type MappingSuggestion = {
  targetField: InvoiceField;
  suggestedHeader: string;
  confidence: MappingConfidence;
  score: number;
  reason: string;
  alternatives: Array<{
    header: string;
    score: number;
    reason: string;
  }>;
};

const invoiceFieldSynonyms: Record<InvoiceField, string[]> = {
  invoice_number: [
    "invoice",
    "invoice number",
    "invoice no",
    "invoice id",
    "factuur",
    "factuurnummer",
    "factuur nummer",
    "nummer",
    "number",
    "document number",
    "reference",
    "ref",
  ],
  company: [
    "company",
    "client",
    "customer",
    "customer name",
    "client name",
    "bedrijf",
    "klant",
    "klantnaam",
    "debtor",
    "debiteur",
    "organization",
    "organisation",
  ],
  email: [
    "email",
    "e-mail",
    "mail",
    "email address",
    "e-mailadres",
    "contact email",
    "billing email",
    "invoice email",
  ],
  amount: [
    "amount",
    "total",
    "total amount",
    "invoice total",
    "price",
    "bedrag",
    "totaal",
    "totaalbedrag",
    "subtotal",
    "net amount",
    "gross amount",
  ],
  vat: [
    "vat",
    "btw",
    "tax",
    "vat amount",
    "btw bedrag",
    "tax amount",
    "sales tax",
    "vat total",
  ],
  status: [
    "status",
    "state",
    "fase",
    "payment status",
    "invoice status",
    "paid status",
    "betaalstatus",
  ],
};

const allowedStatuses = ["ready", "paid", "draft", "pending", "sent"];

export function createEmptyMapping(): FieldMapping {
  return {
    invoice_number: "",
    company: "",
    email: "",
    amount: "",
    vat: "",
    status: "",
  };
}

export function createSuggestedMapping(
  headers: string[],
  rows: CsvRow[] = [],
): FieldMapping {
  const suggestions = createMappingSuggestions(headers, rows);

  return suggestions.reduce<FieldMapping>((mapping, suggestion) => {
    return {
      ...mapping,
      [suggestion.targetField]:
        suggestion.confidence === "none" ? "" : suggestion.suggestedHeader,
    };
  }, createEmptyMapping());
}

export function createMappingSuggestions(
  headers: string[],
  rows: CsvRow[] = [],
): MappingSuggestion[] {
  const fields = Object.keys(invoiceFieldSynonyms) as InvoiceField[];

  return fields.map((targetField) => {
    const rankedMatches = headers
      .map((header) => scoreHeaderAndValuesForField(header, targetField, rows))
      .sort((a, b) => b.score - a.score);

    const bestMatch = rankedMatches[0];

    if (!bestMatch || bestMatch.score === 0) {
      return {
        targetField,
        suggestedHeader: "",
        confidence: "none",
        score: 0,
        reason: "No matching header or sample value pattern found.",
        alternatives: [],
      };
    }

    return {
      targetField,
      suggestedHeader: bestMatch.header,
      confidence: getConfidence(bestMatch.score),
      score: bestMatch.score,
      reason: bestMatch.reason,
      alternatives: rankedMatches
        .filter((match) => match.header !== bestMatch.header && match.score > 0)
        .slice(0, 3),
    };
  });
}

function scoreHeaderAndValuesForField(
  header: string,
  field: InvoiceField,
  rows: CsvRow[],
) {
  const headerMatch = scoreHeaderForField(header, field);
  const sampleValues = getSampleValues(rows, header);
  const valueMatch = scoreValuesForField(sampleValues, field);

  if (valueMatch.score > headerMatch.score) {
    return {
      header,
      score: valueMatch.score,
      reason: valueMatch.reason,
    };
  }

  return headerMatch;
}

function scoreHeaderForField(header: string, field: InvoiceField) {
  const normalizedHeader = normalizeText(header);
  const synonyms = invoiceFieldSynonyms[field];

  let bestScore = 0;
  let reason = "No semantic header match found.";

  for (const synonym of synonyms) {
    const normalizedSynonym = normalizeText(synonym);

    if (normalizedHeader === normalizedSynonym) {
      return {
        header,
        score: 100,
        reason: `Exact header match with "${synonym}".`,
      };
    }

    if (normalizedHeader.includes(normalizedSynonym)) {
      if (bestScore < 85) {
        bestScore = 85;
        reason = `Header contains "${synonym}".`;
      }
    }

    if (normalizedSynonym.includes(normalizedHeader)) {
      if (bestScore < 70) {
        bestScore = 70;
        reason = `Header partially matches "${synonym}".`;
      }
    }

    if (hasTokenOverlap(normalizedHeader, normalizedSynonym)) {
      if (bestScore < 55) {
        bestScore = 55;
        reason = `Header shares meaning with "${synonym}".`;
      }
    }
  }

  return {
    header,
    score: bestScore,
    reason,
  };
}

function scoreValuesForField(values: string[], field: InvoiceField) {
  if (values.length === 0) {
    return {
      score: 0,
      reason: "No sample values available.",
    };
  }

  const matchingValues = values.filter((value) =>
    valueMatchesFieldPattern(value, field),
  );

  const matchRatio = matchingValues.length / values.length;

  if (field === "company") {
    if (matchRatio >= 0.8) {
      return {
        score: 55,
        reason:
          "Sample values look like text values, but company names are hard to verify safely.",
      };
    }

    return {
      score: 0,
      reason: "Sample values are not reliable enough to infer company.",
    };
  }

  if (matchRatio >= 0.8) {
    return {
      score: 80,
      reason: `Sample values strongly look like ${field}.`,
    };
  }

  if (matchRatio >= 0.5) {
    return {
      score: 60,
      reason: `Sample values partially look like ${field}.`,
    };
  }

  if (matchRatio >= 0.3) {
    return {
      score: 40,
      reason: `Some sample values may match ${field}.`,
    };
  }

  return {
    score: 0,
    reason: "Sample values do not match this field pattern.",
  };
}

function valueMatchesFieldPattern(value: string, field: InvoiceField) {
  const normalizedValue = value.trim().toLowerCase();

  if (!normalizedValue) return false;

  switch (field) {
    case "invoice_number":
      return looksLikeInvoiceNumber(normalizedValue);

    case "email":
      return isValidEmail(normalizedValue);

    case "amount":
      return parseBusinessNumber(normalizedValue) !== null;

    case "vat":
      return parseBusinessNumber(normalizedValue) !== null;

    case "status":
      return allowedStatuses.includes(normalizedValue);

    case "company":
      return looksLikeCompanyName(normalizedValue);

    default:
      return false;
  }
}

function getSampleValues(rows: CsvRow[], header: string) {
  return rows
    .map((row) => row[header]?.trim())
    .filter((value): value is string => Boolean(value))
    .slice(0, 20);
}

function looksLikeInvoiceNumber(value: string) {
  return (
    /inv[-_ ]?\d+/i.test(value) ||
    /fact[-_ ]?\d+/i.test(value) ||
    /\d{4}[-_]\d+/.test(value) ||
    /^[a-z]{2,}[-_]\d+$/i.test(value)
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseBusinessNumber(value: string) {
  const cleanedValue = value
    .trim()
    .replaceAll("€", "")
    .replaceAll(" ", "")
    .replaceAll(".", "")
    .replaceAll(",", ".");

  if (!cleanedValue) return null;

  const parsedValue = Number(cleanedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function looksLikeCompanyName(value: string) {
  if (isValidEmail(value)) return false;
  if (parseBusinessNumber(value) !== null) return false;
  if (allowedStatuses.includes(value)) return false;

  return /[a-z]/i.test(value) && value.length >= 2;
}

function getConfidence(score: number): MappingConfidence {
  if (score >= 90) return "high";
  if (score >= 65) return "medium";
  if (score > 0) return "low";
  return "none";
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/[_-]/g, " ")
    .replaceAll(/[^a-z0-9 ]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function hasTokenOverlap(valueA: string, valueB: string) {
  const tokensA = valueA.split(" ").filter(Boolean);
  const tokensB = valueB.split(" ").filter(Boolean);

  return tokensA.some((token) => tokensB.includes(token));
}