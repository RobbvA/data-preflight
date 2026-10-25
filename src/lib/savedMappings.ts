import type { DataProfile } from "@/lib/dataProfile";
import { getMappingStatus } from "@/lib/mappingStatus";

export const SAVED_MAPPINGS_KEY = "data-preflight.saved-mappings.v1";

export type SavedMapping = {
  name: string;
  profileId: string;
  profileVersion: string;
  headers: string[];
  mapping: Record<string, string>;
};

type StorageAccess = Pick<Storage, "getItem" | "setItem">;

export type MappingLibrary = {
  items: SavedMapping[];
  error: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSavedMapping(value: unknown): value is SavedMapping {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    !!value.name.trim() &&
    typeof value.profileId === "string" &&
    !!value.profileId &&
    typeof value.profileVersion === "string" &&
    !!value.profileVersion &&
    Array.isArray(value.headers) &&
    value.headers.every((header) => typeof header === "string") &&
    isRecord(value.mapping) &&
    Object.values(value.mapping).every((header) => typeof header === "string")
  );
}

export function readSavedMappings(storage: StorageAccess): MappingLibrary {
  try {
    const raw = storage.getItem(SAVED_MAPPINGS_KEY);

    if (raw === null) return { items: [], error: "" };

    const data: unknown = JSON.parse(raw);

    if (
      !isRecord(data) ||
      data.schemaVersion !== 1 ||
      !Array.isArray(data.items) ||
      !data.items.every(isSavedMapping)
    ) {
      throw new Error("Invalid mapping library");
    }

    return { items: data.items, error: "" };
  } catch {
    return {
      items: [],
      error:
        "Saved mappings could not be read. Your file and manual mapping still work. Stored mappings have not been changed.",
    };
  }
}

// Re-read before every write: preserve mappings saved by another open tab.
export function writeSavedMapping(
  storage: StorageAccess,
  target: { profileId: string; name: string },
  replacement: SavedMapping | null,
): MappingLibrary {
  const current = readSavedMappings(storage);

  if (current.error) return current;

  const items = current.items.filter(
    (item) =>
      item.profileId !== target.profileId || item.name !== target.name,
  );

  if (replacement) items.push(replacement);

  try {
    storage.setItem(
      SAVED_MAPPINGS_KEY,
      JSON.stringify({ schemaVersion: 1, items }),
    );

    return { items, error: "" };
  } catch {
    return {
      items: current.items,
      error:
        "Changes could not be saved in this browser. Your file and manual mapping still work.",
    };
  }
}

export function prepareSavedMapping<TField extends string>(
  saved: SavedMapping,
  profile: DataProfile<TField> & { version: string },
  headers: string[],
) {
  const mapping = Object.fromEntries(
    profile.fields.map(({ key }) => {
      const header = Object.hasOwn(saved.mapping, key)
        ? saved.mapping[key]
        : "";

      return [key, header && headers.includes(header) ? header : ""];
    }),
  ) as Record<TField, string>;

  const missingHeaders = [
    ...new Set(
      Object.values<string>(saved.mapping).filter(
        (header) => header && !headers.includes(header),
      ),
    ),
  ];

  const sameProfile = saved.profileId === profile.id;

  return {
    mapping,
    missingHeaders,
    sameProfile,
    versionChanged: saved.profileVersion !== profile.version,
    status: getMappingStatus(profile, mapping),
  };
}