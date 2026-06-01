import type { ParsedRow } from "@/lib/parseCsv";
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

type ColumnAnalysis = {
  header: string;
  sampleSize: number;
  nonEmptyRatio: number;
  uniqueRatio: number;
  emailRatio: number;
  invoiceNumberRatio: number;
  numericRatio: number;
  dateRatio: number;
  statusRatio: number;
  countryRatio: number;
  currencyRatio: number;
  companyNameRatio: number;
  averageAbsoluteNumber: number | null;
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
  rows: ParsedRow[] = [],
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
  rows: ParsedRow[] = [],
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
          "No safe automatic mapping found. Header, sample values, or column behavior were not reliable enough.",
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
  if (field === "company") return 66;
  if (field === "amount" || field === "vat") return 70;
  if (field === "invoice_date" || field === "due_date") return 70;
  if (field === "currency" || field === "country") return 64;

  return 60;
}

function scoreHeaderAndValuesForField(
  header: string,
  field: InvoiceField,
  rows: ParsedRow[],
): ScoredMatch {
  const sampleValues = getSampleValues(rows, header);
  const columnAnalysis = analyzeColumn(header, sampleValues);

  const headerMatch = scoreHeaderForField(header, field);
  const valueMatch = scoreValuesForField(columnAnalysis, field);
  const behaviorMatch = scoreColumnBehavior(columnAnalysis, field);
  const conflictPenalty = getConflictPenalty(header, field);
  const ambiguityPenalty = getAmbiguityPenalty(header, field, columnAnalysis);

  const combinedScore = combineScores({
    headerScore: headerMatch.score,
    valueScore: valueMatch.score,
    behaviorScore: behaviorMatch.score,
  });

  const finalScore = Math.max(
    0,
    combinedScore - conflictPenalty - ambiguityPenalty,
  );

  const reasons = [
    headerMatch.score > 0 ? headerMatch.reason : null,
    valueMatch.score > 0 ? valueMatch.reason : null,
    behaviorMatch.score > 0 ? behaviorMatch.reason : null,
    conflictPenalty > 0
      ? "Confidence reduced because the header strongly suggests another field."
      : null,
    ambiguityPenalty > 0
      ? "Confidence reduced because this column is ambiguous and needs safer review."
      : null,
  ].filter(Boolean);

  return {
    header,
    score: finalScore,
    reason:
      reasons.length > 0
        ? reasons.join(" ")
        : "No semantic header, sample value, or behavior match found.",
  };
}

function combineScores({
  headerScore,
  valueScore,
  behaviorScore,
}: {
  headerScore: number;
  valueScore: number;
  behaviorScore: number;
}) {
  const supportingSignalBoost =
    headerScore > 0 && (valueScore > 0 || behaviorScore > 0) ? 8 : 0;

  if (headerScore >= 90) {
    return Math.min(
      100,
      headerScore +
        Math.round(valueScore * 0.04) +
        Math.round(behaviorScore * 0.04),
    );
  }

  if (headerScore >= 70) {
    return Math.min(
      96,
      headerScore +
        Math.round(valueScore * 0.12) +
        Math.round(behaviorScore * 0.12) +
        supportingSignalBoost,
    );
  }

  if (headerScore >= 50) {
    return Math.min(
      88,
      headerScore +
        Math.round(valueScore * 0.18) +
        Math.round(behaviorScore * 0.18) +
        supportingSignalBoost,
    );
  }

  return Math.max(valueScore, behaviorScore);
}

function scoreHeaderForField(header: string, field: InvoiceField): ScoredMatch {
  const normalizedHeader = normalizeText(header);
  const synonyms = getFieldSynonyms(field);

  let bestScore = 0;
  let reason = "No semantic header match found.";

  for (const synonym of synonyms) {
    const normalizedSynonym = normalizeText(synonym);

    if (!normalizedHeader || !normalizedSynonym) continue;

    if (normalizedHeader === normalizedSynonym) {
      return {
        header,
        score: 100,
        reason: `Exact header match with "${synonym}".`,
      };
    }

    if (hasExactTokenMatch(normalizedHeader, normalizedSynonym)) {
      if (bestScore < 84) {
        bestScore = 84;
        reason = `Header shares an exact token with "${synonym}".`;
      }
    }

    if (normalizedHeader.includes(normalizedSynonym)) {
      if (bestScore < 80) {
        bestScore = 80;
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

function scoreValuesForField(analysis: ColumnAnalysis, field: InvoiceField) {
  if (analysis.sampleSize === 0) {
    return {
      score: 0,
      reason: "No sample values available.",
    };
  }

  switch (field) {
    case "invoice_number":
      if (analysis.invoiceNumberRatio >= 0.75) {
        return {
          score: 82,
          reason: "Sample values strongly look like invoice references.",
        };
      }

      if (analysis.invoiceNumberRatio >= 0.45) {
        return {
          score: 58,
          reason: "Some sample values look like invoice references.",
        };
      }

      return {
        score: 0,
        reason: "Sample values do not look like invoice references.",
      };

    case "email":
      if (analysis.emailRatio >= 0.85) {
        return {
          score: 86,
          reason: "Most sample values are valid email addresses.",
        };
      }

      if (analysis.emailRatio >= 0.55) {
        return {
          score: 62,
          reason: "Some sample values are valid email addresses.",
        };
      }

      return {
        score: 0,
        reason: "Sample values do not look like email addresses.",
      };

    case "amount":
      return scoreAmountValues(analysis);

    case "vat":
      return scoreVatValues(analysis);

    case "status":
      if (analysis.statusRatio >= 0.8) {
        return {
          score: 82,
          reason: "Sample values look like known invoice statuses.",
        };
      }

      if (analysis.statusRatio >= 0.5) {
        return {
          score: 58,
          reason: "Some sample values look like invoice statuses.",
        };
      }

      return {
        score: 0,
        reason: "Sample values do not look like invoice statuses.",
      };

    case "company":
      if (analysis.companyNameRatio >= 0.85) {
        return {
          score: 54,
          reason:
            "Sample values look like organization names, but company inference remains cautious.",
        };
      }

      return {
        score: 0,
        reason: "Sample values are not reliable enough to infer company.",
      };

    case "country":
      if (analysis.countryRatio >= 0.8) {
        return {
          score: 82,
          reason: "Sample values look like country codes or country names.",
        };
      }

      return {
        score: 0,
        reason: "Sample values do not look like countries.",
      };

    case "invoice_date":
    case "due_date":
      if (analysis.dateRatio >= 0.85) {
        return {
          score: 78,
          reason: `Sample values strongly look like ${formatFieldName(field)}.`,
        };
      }

      if (analysis.dateRatio >= 0.55) {
        return {
          score: 58,
          reason: `Some sample values look like ${formatFieldName(field)}.`,
        };
      }

      return {
        score: 0,
        reason: "Sample values do not look like dates.",
      };

    case "currency":
      if (analysis.currencyRatio >= 0.8) {
        return {
          score: 84,
          reason: "Sample values look like currency codes or symbols.",
        };
      }

      return {
        score: 0,
        reason: "Sample values do not look like currencies.",
      };

    default:
      return {
        score: 0,
        reason: "No value pattern available for this field.",
      };
  }
}

function scoreAmountValues(analysis: ColumnAnalysis) {
  if (analysis.numericRatio < 0.65 || analysis.averageAbsoluteNumber === null) {
    return {
      score: 0,
      reason: "Sample values are not reliably numeric enough for amount.",
    };
  }

  if (analysis.averageAbsoluteNumber >= 100) {
    return {
      score: 78,
      reason: "Sample values look like invoice totals or financial amounts.",
    };
  }

  return {
    score: 52,
    reason:
      "Sample values are numeric, but relatively small for invoice amount inference.",
  };
}

function scoreVatValues(analysis: ColumnAnalysis) {
  if (analysis.numericRatio < 0.65 || analysis.averageAbsoluteNumber === null) {
    return {
      score: 0,
      reason: "Sample values are not reliably numeric enough for VAT.",
    };
  }

  if (analysis.averageAbsoluteNumber <= 500) {
    return {
      score: 74,
      reason: "Sample values look like VAT or tax amounts.",
    };
  }

  return {
    score: 48,
    reason:
      "Sample values are numeric, but relatively large for VAT inference.",
  };
}

function scoreColumnBehavior(analysis: ColumnAnalysis, field: InvoiceField) {
  if (analysis.sampleSize === 0) {
    return {
      score: 0,
      reason: "No column behavior available.",
    };
  }

  if (
    field === "invoice_number" &&
    analysis.uniqueRatio >= 0.9 &&
    analysis.nonEmptyRatio >= 0.9
  ) {
    return {
      score: 35,
      reason: "Column values are mostly unique and populated.",
    };
  }

  if (
    field === "company" &&
    analysis.companyNameRatio >= 0.8 &&
    analysis.uniqueRatio >= 0.4
  ) {
    return {
      score: 28,
      reason: "Column behaves like a customer or organization column.",
    };
  }

  if (
    field === "status" &&
    analysis.statusRatio >= 0.75 &&
    analysis.uniqueRatio <= 0.4
  ) {
    return {
      score: 30,
      reason: "Column contains repeated workflow-like values.",
    };
  }

  if (
    (field === "country" || field === "currency") &&
    analysis.uniqueRatio <= 0.4
  ) {
    return {
      score: 22,
      reason: "Column has repeated standardized values.",
    };
  }

  return {
    score: 0,
    reason: "No useful column behavior signal found.",
  };
}

function analyzeColumn(header: string, values: string[]): ColumnAnalysis {
  const normalizedValues = values.map((value) => value.trim()).filter(Boolean);

  const sampleSize = normalizedValues.length;
  const uniqueValueCount = new Set(
    normalizedValues.map((value) => normalizeText(value)),
  ).size;

  const parsedNumbers = normalizedValues
    .map((value) => parseBusinessNumber(value))
    .filter((value): value is number => value !== null);

  const averageAbsoluteNumber =
    parsedNumbers.length > 0
      ? parsedNumbers.reduce((total, value) => total + Math.abs(value), 0) /
        parsedNumbers.length
      : null;

  return {
    header,
    sampleSize,
    nonEmptyRatio: values.length === 0 ? 0 : sampleSize / values.length,
    uniqueRatio: sampleSize === 0 ? 0 : uniqueValueCount / sampleSize,
    emailRatio: getMatchRatio(normalizedValues, isValidEmail),
    invoiceNumberRatio: getMatchRatio(normalizedValues, looksLikeInvoiceNumber),
    numericRatio:
      sampleSize === 0 ? 0 : parsedNumbers.length / normalizedValues.length,
    dateRatio: getMatchRatio(normalizedValues, looksLikeDate),
    statusRatio: getMatchRatio(normalizedValues, (value) =>
      allowedStatuses.includes(value.trim().toLowerCase()),
    ),
    countryRatio: getMatchRatio(
      normalizedValues,
      (value) =>
        looksLikeCountryCode(value) ||
        looksLikeKnownCountryName(value.trim().toLowerCase()),
    ),
    currencyRatio: getMatchRatio(
      normalizedValues,
      (value) =>
        looksLikeCurrencyCode(value) ||
        looksLikeKnownCurrency(value.trim().toLowerCase()),
    ),
    companyNameRatio: getMatchRatio(normalizedValues, looksLikeCompanyName),
    averageAbsoluteNumber,
  };
}

function getMatchRatio(values: string[], matcher: (value: string) => boolean) {
  if (values.length === 0) return 0;

  return values.filter((value) => matcher(value)).length / values.length;
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

  return hasStrongConflict ? 48 : 0;
}

function getAmbiguityPenalty(
  header: string,
  field: InvoiceField,
  analysis: ColumnAnalysis,
) {
  const normalizedHeader = normalizeText(header);

  if (field === "invoice_date" && normalizedHeader === "date") return 24;
  if (field === "due_date" && normalizedHeader === "date") return 28;

  if (field === "company" && normalizedHeader.includes("contact")) return 35;

  if (field === "email" && normalizedHeader === "contact") {
    return analysis.emailRatio >= 0.65 ? 0 : 40;
  }

  if (field === "amount" && normalizedHeader.includes("tax")) return 48;
  if (field === "vat" && normalizedHeader.includes("total")) return 38;

  if (
    field === "vat" &&
    analysis.averageAbsoluteNumber !== null &&
    analysis.averageAbsoluteNumber > 1000
  ) {
    return 18;
  }

  if (
    field === "amount" &&
    analysis.averageAbsoluteNumber !== null &&
    analysis.averageAbsoluteNumber < 50
  ) {
    return 18;
  }

  if (
    field === "invoice_number" &&
    (analysis.emailRatio > 0.2 || analysis.numericRatio > 0.95)
  ) {
    return 24;
  }

  if (
    field === "company" &&
    (analysis.emailRatio > 0.2 || analysis.numericRatio > 0.5)
  ) {
    return 32;
  }

  return 0;
}

function getSampleValues(rows: ParsedRow[], header: string) {
  return rows
    .map((row) => row[header]?.trim())
    .filter((value): value is string => Boolean(value))
    .slice(0, 30);
}

function looksLikeInvoiceNumber(value: string) {
  const normalizedValue = value.trim();

  return (
    /inv[-_ ]?\d+/i.test(normalizedValue) ||
    /invoice[-_ ]?\d+/i.test(normalizedValue) ||
    /fact[-_ ]?\d+/i.test(normalizedValue) ||
    /fac[-_ ]?\d+/i.test(normalizedValue) ||
    /\d{4}[-_]\d+/.test(normalizedValue) ||
    /^[a-z]{2,}[-_]\d+$/i.test(normalizedValue)
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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

  const withoutAccountingParentheses = cleanedValue.match(/^\((.+)\)$/)
    ? `-${cleanedValue.replaceAll(/[()]/g, "")}`
    : cleanedValue;

  const sanitizedValue = withoutAccountingParentheses.replaceAll(
    /[^0-9,.-]/g,
    "",
  );

  if (!sanitizedValue || sanitizedValue === "-") return null;

  const hasComma = sanitizedValue.includes(",");
  const hasDot = sanitizedValue.includes(".");

  let normalizedNumber = sanitizedValue;

  if (hasComma && hasDot) {
    const lastCommaIndex = sanitizedValue.lastIndexOf(",");
    const lastDotIndex = sanitizedValue.lastIndexOf(".");

    normalizedNumber =
      lastCommaIndex > lastDotIndex
        ? sanitizedValue.replaceAll(".", "").replaceAll(",", ".")
        : sanitizedValue.replaceAll(",", "");
  } else if (hasComma) {
    normalizedNumber = sanitizedValue.replaceAll(",", ".");
  }

  const parsedValue = Number(normalizedNumber);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function looksLikeCompanyName(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (isValidEmail(normalizedValue)) return false;
  if (parseBusinessNumber(normalizedValue) !== null) return false;
  if (allowedStatuses.includes(normalizedValue)) return false;
  if (looksLikeCountryCode(normalizedValue)) return false;
  if (looksLikeCurrencyCode(normalizedValue)) return false;
  if (looksLikeDate(normalizedValue)) return false;

  return /[a-z]/i.test(normalizedValue) && normalizedValue.length >= 2;
}

function looksLikeCountryCode(value: string) {
  return /^[a-z]{2}$/i.test(value.trim());
}

function looksLikeKnownCountryName(value: string) {
  return [
    "nederland",
    "netherlands",
    "holland",
    "duitsland",
    "germany",
    "deutschland",
    "belgie",
    "belgië",
    "belgium",
    "france",
    "frankrijk",
    "spain",
    "spanje",
    "italy",
    "italie",
    "italië",
  ].includes(value.trim().toLowerCase());
}

function looksLikeCurrencyCode(value: string) {
  return /^[a-z]{3}$/i.test(value.trim());
}

function looksLikeKnownCurrency(value: string) {
  return [
    "eur",
    "euro",
    "euros",
    "usd",
    "dollar",
    "dollars",
    "gbp",
    "pound",
    "pounds",
    "€",
    "$",
    "£",
  ].includes(value.trim().toLowerCase());
}

function looksLikeDate(value: string) {
  const normalizedValue = value.trim();

  return (
    /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue) ||
    /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(normalizedValue) ||
    /^\d{8}$/.test(normalizedValue)
  );
}

function getConfidence(score: number): MappingConfidence {
  if (score >= 90) return "high";
  if (score >= 72) return "medium";
  if (score > 0) return "low";
  return "none";
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[_-]/g, " ")
    .replaceAll(/[^a-z0-9 ]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function hasExactTokenMatch(valueA: string, valueB: string) {
  const tokensA = valueA.split(" ").filter((token) => token.length > 2);
  const tokensB = valueB.split(" ").filter((token) => token.length > 2);

  return tokensA.some((token) => tokensB.includes(token));
}

function formatFieldName(field: string) {
  return field.replaceAll("_", " ");
}
