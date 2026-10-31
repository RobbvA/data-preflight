/** Describe existing mapping guards; never determines validation/export readiness. */
export function describeMappingReadiness(missingFields: readonly string[], duplicateColumns: readonly string[]): string {
  if (!missingFields.length && !duplicateColumns.length) return "Required fields ready. Change a column if needed.";
  const actions = [
    missingFields.length ? `Choose a column for: ${missingFields.join(", ")}.` : "",
    duplicateColumns.length ? `Use each source column once. Reassign: ${duplicateColumns.join(", ")}.` : "",
  ].filter(Boolean).join(" ");
  return `Validation and export are paused. ${actions} Choose Complete mapping to continue.`;
}
