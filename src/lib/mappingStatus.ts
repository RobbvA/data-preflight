import type { DataProfile } from "@/lib/dataProfile";

export function getMappingStatus<TField extends string>(
  profile: DataProfile<TField>,
  mapping: Readonly<Record<TField, string>>,
) {
  const missingRequiredFields = profile.fields.filter(
    (field) => field.required && !mapping[field.key],
  );

  const selectedHeaders = profile.fields
    .map((field) => mapping[field.key])
    .filter(Boolean);

  const seenHeaders = new Set<string>();
  const duplicateHeaders = new Set<string>();

  for (const header of selectedHeaders) {
    if (seenHeaders.has(header)) duplicateHeaders.add(header);
    seenHeaders.add(header);
  }

  const hasIncompleteMapping = missingRequiredFields.length > 0;
  const hasDuplicateMappings = duplicateHeaders.size > 0;

  return {
    mappedCount: selectedHeaders.length,
    missingRequiredFields,
    duplicateMappedHeaders: [...duplicateHeaders],
    hasIncompleteMapping,
    hasDuplicateMappings,
    mappingReady: !hasIncompleteMapping && !hasDuplicateMappings,
  };
}