import test from "node:test";
import assert from "node:assert/strict";
import {
  readSavedMappings,
  writeSavedMapping,
  prepareSavedMapping,
  SAVED_MAPPINGS_KEY,
} from "../src/lib/savedMappings.ts";

const profile = {
  id: "vendor",
  version: "1",
  fields: [
    { key: "id", required: true },
    { key: "name", required: true },
    { key: "email", required: false },
  ],
};

const saved = {
  name: "Suppliers",
  profileId: "vendor",
  profileVersion: "1",
  headers: ["ID", "Name", "Email"],
  mapping: {
    id: "ID",
    name: "Name",
    email: "Email",
  },
};

function storage() {
  const data = new Map();

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}

test("saved mappings: persist, replace and delete without losing other profiles", () => {
  const store = storage();

  writeSavedMapping(store, saved, saved);

  const customer = { ...saved, profileId: "customer" };
  writeSavedMapping(store, customer, customer);

  const changed = {
    ...saved,
    mapping: { ...saved.mapping, email: "" },
  };

  writeSavedMapping(store, changed, changed);

  assert.equal(readSavedMappings(store).items.length, 2);

  assert.deepEqual(
    readSavedMappings(store).items.find(
      (item) => item.profileId === "vendor",
    ),
    changed,
  );

  writeSavedMapping(store, saved, null);

  assert.deepEqual(readSavedMappings(store).items, [customer]);
});

test("saved mappings: reordered and extra columns retain assignments", () => {
  const result = prepareSavedMapping(saved, profile, [
    "Extra",
    "Email",
    "Name",
    "ID",
  ]);

  assert.deepEqual(result.mapping, saved.mapping);
  assert.equal(result.status.mappingReady, true);
  assert.deepEqual(result.missingHeaders, []);
});

test("saved mappings: missing required columns cannot bypass validation", () => {
  const result = prepareSavedMapping(saved, profile, ["Name"]);

  assert.deepEqual(result.mapping, {
    id: "",
    name: "Name",
    email: "",
  });

  assert.equal(result.status.mappingReady, false);
  assert.deepEqual(result.missingHeaders, ["ID", "Email"]);

  assert.deepEqual(saved.mapping, {
    id: "ID",
    name: "Name",
    email: "Email",
  });
});

test("saved mappings: duplicate assignments stay blocked and profile/version changes are exposed", () => {
  const duplicate = {
    ...saved,
    mapping: {
      id: "ID",
      name: "ID",
      email: "",
    },
  };

  assert.equal(
    prepareSavedMapping(duplicate, profile, ["ID"]).status.mappingReady,
    false,
  );

  assert.equal(
    prepareSavedMapping(
      saved,
      { ...profile, version: "2" },
      saved.headers,
    ).versionChanged,
    true,
  );

  assert.equal(
    prepareSavedMapping(
      saved,
      { ...profile, id: "customer" },
      saved.headers,
    ).sameProfile,
    false,
  );
});

test("saved mappings: corrupt or future storage cannot be silently overwritten", () => {
  for (const raw of [
    "bad json",
    JSON.stringify({ schemaVersion: 2, items: [] }),
    JSON.stringify({ schemaVersion: 1, items: [{}] }),
  ]) {
    const store = storage();

    store.setItem(SAVED_MAPPINGS_KEY, raw);

    assert.ok(readSavedMappings(store).error);
    assert.ok(writeSavedMapping(store, saved, saved).error);
    assert.equal(store.getItem(SAVED_MAPPINGS_KEY), raw);
  }
});

test("saved mappings: storage access and quota failures are recoverable", () => {
  assert.ok(
    readSavedMappings({
      getItem() {
        throw Error("Denied");
      },
    }).error,
  );

  const store = storage();
  writeSavedMapping(store, saved, saved);

  const blocked = {
    ...store,
    setItem() {
      throw Error("Quota");
    },
  };

  const result = writeSavedMapping(blocked, saved, null);

  assert.ok(result.error);
  assert.deepEqual(result.items, [saved]);
});