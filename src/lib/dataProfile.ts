export type DataFieldDefinition = {
  key: string;
  label: string;
  required: boolean;
  synonyms: string[];
};

export type DataProfile = {
  id: string;
  name: string;
  description: string;
  fields: DataFieldDefinition[];
};