/** JSON tuple boundaries prevent identifiers containing delimiters from colliding. */
export function createCompositeKey(parts: readonly string[]): string {
  return JSON.stringify(parts.map((part) => part.trim().toLowerCase()));
}
