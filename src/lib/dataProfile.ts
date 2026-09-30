export type DataFieldDefinition<TKey extends string = string> = {
  key: TKey;
  label: string;
  required: boolean;
  synonyms: string[];
};

export type DataProfile<TKey extends string = string> = {
  id: string;
  name: string;
  description: string;
  fields: DataFieldDefinition<TKey>[];
};

export function getProfileFieldKeys<TKey extends string>(
  profile: DataProfile<TKey>,
): TKey[] {
  return profile.fields.map((field) => field.key);
}

export function getRequiredProfileFieldKeys<TKey extends string>(
  profile: DataProfile<TKey>,
): TKey[] {
  return profile.fields
    .filter((field) => field.required)
    .map((field) => field.key);
}

export function getProfileMappingCandidates<TKey extends string>(
  profile: DataProfile<TKey>,
  headers: string[],
): Record<TKey, string[]> {
  return Object.fromEntries(
    profile.fields.map((field) => {
      const acceptedNames = new Set(
        [field.key, ...field.synonyms].map(normalizeHeader),
      );

      return [
        field.key,
        headers.filter((header) => acceptedNames.has(normalizeHeader(header))),
      ];
    }),
  ) as Record<TKey, string[]>;
}

export function suggestProfileMapping<TKey extends string>(
  profile: DataProfile<TKey>,
  headers: string[],
): Record<TKey, string> {
  const candidates = getProfileMappingCandidates(profile, headers);
  const usedHeaders = new Set<string>();

  return Object.fromEntries(
    profile.fields.map(({ key }) => {
      const matches = candidates[key];
      const match =
        matches.length === 1 && !usedHeaders.has(matches[0])
          ? matches[0]
          : "";

      if (match) usedHeaders.add(match);
      return [key, match];
    }),
  ) as Record<TKey, string>;
}

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}