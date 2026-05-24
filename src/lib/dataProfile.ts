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
