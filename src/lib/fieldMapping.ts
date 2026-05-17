import type { CsvRow } from "@/lib/parseCsv";
import { invoiceProfile } from "@/lib/profiles/invoiceProfile";

export type FieldMapping = {
  invoice_number: string;
  company: string;
  email: string;
  amount: string;
  vat: string;
  status: string;
  country: string;
  invoice_date: string;
  due_date: string;
  currency: string;
};

export type InvoiceField = keyof FieldMapping;

export type MappingConfidence = "high" | "medium" | "low" | "none";

export type MappingSuggestion = {
  targetField: InvoiceField;
  targetLabel: string;
  required: boolean;
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

type ScoredMatch = {
  header: string;
  score: number;
  reason: string;
};

const allowedStatuses = [
  "ready",
  "paid",
  "draft",
  "pending",
  "sent",
  "open",
  "concept",
  "voldaan",
  "betaald",
  "verzonden",
  "openstaand",
];

const activeProfile = invoiceProfile;

const profileFields = activeProfile.fields.map(
  (field) => field.key,
) as InvoiceField[];

function getProfileField(field: InvoiceField) {
  return activeProfile.fields.find(
    (profileField) => profileField.key === field,
  );
}

function getFieldSynonyms(field: InvoiceField) {
  return getProfileField(field)?.synonyms ?? [];
}

export function createEmptyMapping(): FieldMapping {
  return profileFields.reduce<FieldMapping>((mapping, field) => {
    return {
      ...mapping,
      [field]: "",
    };
  }, {} as FieldMapping);
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
  const usedHeaders = new Set<string>();

  return profileFields.map((targetField) => {
    const profileField = getProfileField(targetField);

    const rankedMatches = headers
      .map((header) => scoreHeaderAndValuesForField(header, targetField, rows))
      .sort((a, b) => b.score - a.score);

    const bestAvailableMatch = rankedMatches.find(
      (match) =>
        match.score >= getMinimumAutoMapScore(targetField) &&
        !usedHeaders.has(match.header),
    );

    if (!bestAvailableMatch) {
      return {
        targetField,
        targetLabel: profileField?.label ?? targetField,
        required: profileField?.required ?? false,
        suggestedHeader: "",
        confidence: "none",
        score: 0,
        reason:
          "No safe mapping found. Header or sample values were not reliable enough for automatic mapping.",
        alternatives: rankedMatches
          .filter((match) => match.score > 0)
          .slice(0, 3),
      };
    }

    usedHeaders.add(bestAvailableMatch.header);

    return {
      targetField,
      targetLabel: profileField?.label ?? targetField,
      required: profileField?.required ?? false,
      suggestedHeader: bestAvailableMatch.header,
      confidence: getConfidence(bestAvailableMatch.score),
      score: bestAvailableMatch.score,
      reason: bestAvailableMatch.reason,
      alternatives: rankedMatches
        .filter(
          (match) =>
            match.header !== bestAvailableMatch.header && match.score > 0,
        )
        .slice(0, 3),
    };
  });
}

function getMinimumAutoMapScore(field: InvoiceField) {
  if (field === "company") return 60;
  if (field === "amount" || field === "vat") return 65;
  if (field === "invoice_date" || field === "due_date") return 65;

  return 55;
}

function scoreHeaderAndValuesForField(
  header: string,
  field: InvoiceField,
  rows: CsvRow[],
): ScoredMatch {
  const headerMatch = scoreHeaderForField(header, field);
  const sampleValues = getSampleValues(rows, header);
  const valueMatch = scoreValuesForField(sampleValues, field);
  const conflictPenalty = getConflictPenalty(header, field);
  const ambiguityPenalty = getAmbiguityPenalty(header, field, sampleValues);

  const combinedScore = combineScores(headerMatch.score, valueMatch.score);
  const finalScore = Math.max(
    0,
    combinedScore - conflictPenalty - ambiguityPenalty,
  );

  const reasons = [
    headerMatch.score > 0 ? headerMatch.reason : null,
    valueMatch.score > 0 ? valueMatch.reason : null,
    conflictPenalty > 0
      ? "Score reduced because the header strongly suggests another field."
      : null,
    ambiguityPenalty > 0
      ? "Score reduced because this header/value pattern is ambiguous."
      : null,
  ].filter(Boolean);

  return {
    header,
    score: finalScore,
    reason:
      reasons.length > 0
        ? reasons.join(" ")
        : "No semantic header or sample value match found.",
  };
}

function combineScores(headerScore: number, valueScore: number) {
  if (headerScore >= 90)
    return Math.min(100, headerScore + Math.round(valueScore * 0.05));
  if (headerScore >= 70)
    return Math.min(95, headerScore + Math.round(valueScore * 0.15));
  if (headerScore >= 50)
    return Math.min(85, headerScore + Math.round(valueScore * 0.2));

  return valueScore;
}

function scoreHeaderForField(header: string, field: InvoiceField): ScoredMatch {
  const normalizedHeader = normalizeText(header);
  const synonyms = getFieldSynonyms(field);

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

    if (hasExactTokenMatch(normalizedHeader, normalizedSynonym)) {
      if (bestScore < 82) {
        bestScore = 82;
        reason = `Header token matches "${synonym}".`;
      }
    }

    if (normalizedHeader.includes(normalizedSynonym)) {
      if (bestScore < 78) {
        bestScore = 78;
        reason = `Header contains "${synonym}".`;
      }
    }

    if (
      normalizedSynonym.includes(normalizedHeader) &&
      normalizedHeader.length >= 4
    ) {
      if (bestScore < 68) {
        bestScore = 68;
        reason = `Header partially matches "${synonym}".`;
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

  if (field === "amount" || field === "vat") {
    return scoreNumericFinancialValues(values, field);
  }

  const matchingValues = values.filter((value) =>
    valueMatchesFieldPattern(value, field),
  );

  const matchRatio = matchingValues.length / values.length;

  if (field === "company") {
    if (matchRatio >= 0.85) {
      return {
        score: 50,
        reason:
          "Sample values look like organization names, but company inference remains cautious.",
      };
    }

    return {
      score: 0,
      reason: "Sample values are not reliable enough to infer company.",
    };
  }

  if (matchRatio >= 0.9) {
    return {
      score: 82,
      reason: `Sample values strongly look like ${formatFieldName(field)}.`,
    };
  }

  if (matchRatio >= 0.65) {
    return {
      score: 62,
      reason: `Sample values partially look like ${formatFieldName(field)}.`,
    };
  }

  if (matchRatio >= 0.4) {
    return {
      score: 38,
      reason: `Some sample values may match ${formatFieldName(field)}.`,
    };
  }

  return {
    score: 0,
    reason: "Sample values do not match this field pattern.",
  };
}

function scoreNumericFinancialValues(values: string[], field: InvoiceField) {
  const parsedValues = values
    .map((value) => parseBusinessNumber(value))
    .filter((value): value is number => value !== null);

  if (parsedValues.length === 0) {
    return {
      score: 0,
      reason: "Sample values are not numeric.",
    };
  }

  const matchRatio = parsedValues.length / values.length;
  const averageAbsoluteValue =
    parsedValues.reduce((total, value) => total + Math.abs(value), 0) /
    parsedValues.length;

  if (matchRatio < 0.65) {
    return {
      score: 35,
      reason:
        "Some sample values are numeric, but not enough for safe mapping.",
    };
  }

  if (field === "amount") {
    return {
      score: averageAbsoluteValue >= 100 ? 76 : 52,
      reason:
        averageAbsoluteValue >= 100
          ? "Sample values look like invoice totals or amounts."
          : "Sample values are numeric but small for invoice amount inference.",
    };
  }

  return {
    score: averageAbsoluteValue <= 500 ? 72 : 48,
    reason:
      averageAbsoluteValue <= 500
        ? "Sample values look like VAT or tax amounts."
        : "Sample values are numeric but large for VAT inference.",
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
    case "vat":
      return parseBusinessNumber(normalizedValue) !== null;

    case "status":
      return allowedStatuses.includes(normalizedValue);

    case "company":
      return looksLikeCompanyName(normalizedValue);

    case "country":
      return (
        looksLikeCountryCode(normalizedValue) ||
        looksLikeKnownCountryName(normalizedValue)
      );

    case "invoice_date":
    case "due_date":
      return looksLikeDate(normalizedValue);

    case "currency":
      return (
        looksLikeCurrencyCode(normalizedValue) ||
        looksLikeKnownCurrency(normalizedValue)
      );

    default:
      return false;
  }
}

function getConflictPenalty(header: string, field: InvoiceField) {
  const normalizedHeader = normalizeText(header);

  const conflictingFields = profileFields.filter(
    (profileField) => profileField !== field,
  );

  const hasStrongConflict = conflictingFields.some((conflictingField) =>
    getFieldSynonyms(conflictingField).some(
      (synonym) => normalizeText(synonym) === normalizedHeader,
    ),
  );

  return hasStrongConflict ? 45 : 0;
}

function getAmbiguityPenalty(
  header: string,
  field: InvoiceField,
  values: string[],
) {
  const normalizedHeader = normalizeText(header);

  if (field === "invoice_date" && normalizedHeader === "date") return 20;
  if (field === "due_date" && normalizedHeader === "date") return 25;

  if (field === "company" && normalizedHeader.includes("contact")) return 30;
  if (field === "email" && normalizedHeader === "contact") {
    const emailRatio =
      values.length === 0
        ? 0
        : values.filter((value) => isValidEmail(value)).length / values.length;

    return emailRatio >= 0.6 ? 0 : 35;
  }

  if (field === "amount" && normalizedHeader.includes("tax")) return 45;
  if (field === "vat" && normalizedHeader.includes("total")) return 35;

  return 0;
}

function getSampleValues(rows: CsvRow[], header: string) {
  return rows
    .map((row) => row[header]?.trim())
    .filter((value): value is string => Boolean(value))
    .slice(0, 25);
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
    .replaceAll("EUR", "")
    .replaceAll("eur", "")
    .replaceAll("$", "")
    .replaceAll("USD", "")
    .replaceAll("usd", "")
    .replaceAll("£", "")
    .replaceAll("GBP", "")
    .replaceAll("gbp", "")
    .replaceAll(/\s/g, "");

  if (!cleanedValue) return null;

  const hasComma = cleanedValue.includes(",");
  const hasDot = cleanedValue.includes(".");

  let normalizedNumber = cleanedValue;

  if (hasComma && hasDot) {
    const lastCommaIndex = cleanedValue.lastIndexOf(",");
    const lastDotIndex = cleanedValue.lastIndexOf(".");

    normalizedNumber =
      lastCommaIndex > lastDotIndex
        ? cleanedValue.replaceAll(".", "").replaceAll(",", ".")
        : cleanedValue.replaceAll(",", "");
  } else if (hasComma) {
    normalizedNumber = cleanedValue.replaceAll(",", ".");
  }

  const parsedValue = Number(normalizedNumber);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function looksLikeCompanyName(value: string) {
  if (isValidEmail(value)) return false;
  if (parseBusinessNumber(value) !== null) return false;
  if (allowedStatuses.includes(value)) return false;
  if (looksLikeCountryCode(value)) return false;
  if (looksLikeCurrencyCode(value)) return false;
  if (looksLikeDate(value)) return false;

  return /[a-z]/i.test(value) && value.length >= 2;
}

function looksLikeCountryCode(value: string) {
  return /^[a-z]{2}$/i.test(value);
}

function looksLikeKnownCountryName(value: string) {
  return [
    "nederland",
    "netherlands",
    "holland",
    "duitsland",
    "germany",
    "belgie",
    "belgië",
    "belgium",
    "france",
    "frankrijk",
  ].includes(value);
}

function looksLikeCurrencyCode(value: string) {
  return /^[a-z]{3}$/i.test(value);
}

function looksLikeKnownCurrency(value: string) {
  return [
    "eur",
    "euro",
    "euros",
    "usd",
    "dollar",
    "gbp",
    "pound",
    "€",
    "$",
    "£",
  ].includes(value);
}

function looksLikeDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) ||
    /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(value) ||
    /^\d{8}$/.test(value)
  );
}

function getConfidence(score: number): MappingConfidence {
  if (score >= 90) return "high";
  if (score >= 70) return "medium";
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

function hasExactTokenMatch(valueA: string, valueB: string) {
  const tokensA = valueA.split(" ").filter(Boolean);
  const tokensB = valueB.split(" ").filter(Boolean);

  return tokensA.some((token) => tokensB.includes(token));
}

function formatFieldName(field: string) {
  return field.replaceAll("_", " ");
}
