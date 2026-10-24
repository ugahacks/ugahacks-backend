const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");
const { fullNameOf, promoteOrganizers } = require("../scripts/promote-organizers.cjs");

const output = { table() {}, log() {} };
function database(users, currentUsers = users) {
  const writes = [];
  const docs = users.map((user, index) => ({ id: String(index), ref: index, data: () => user }));
  return {
    writes,
    collection(name) {
      assert.equal(name, "users");
      return { select: () => ({ get: async () => ({ docs, size: docs.length }) }) };
    },
    runTransaction: async (callback) => callback({
      get: async (ref) => ({ exists: Boolean(currentUsers[ref]), data: () => currentUsers[ref] }),
      update: (ref, data) => writes.push({ ref, data }),
    }),
  };
}

test("requires explicit first and last fields and supports compound names and legacy fields", () => {
  assert.equal(fullNameOf({ firstName: " Ariya ", lastName: " Kasi  Viswanathan " }), "ariya kasi viswanathan");
  assert.equal(fullNameOf({ first_name: "JACOB", last_name: "HARRIS" }), "jacob harris");
  assert.equal(fullNameOf({ lastName: "Harris" }), "");
  assert.equal(fullNameOf({ firstName: "Jacob" }), "");
  assert.equal(fullNameOf({ name: "Jacob Harris" }), "");
});

test("preview matches normalized full names and never writes", async () => {
  const db = database([
    { firstName: "Jacob", lastName: "Harris" },
    { first_name: "MAYA", last_name: "CASTILLO" },
    { firstName: "Someone", lastName: "Harris" },
    { firstName: "Jacob", lastName: "Castillo" },
  ]);
  assert.deepEqual(await promoteOrganizers(db, [" jacob  harris ", "Maya Castillo"], false, output), { matched: 2, updated: 0 });
  assert.deepEqual(db.writes, []);
});

test("apply preserves protected roles and never promotes someone solely for sharing a surname", async () => {
  const db = database([
    { firstName: "Jacob", lastName: "Harris", user_type: "ADMIN" },
    { firstName: "Jacob", lastName: "Harris", user_type: "ORGANIZER" },
    { firstName: "Jacob", lastName: "Harris", user_type: "HACKER" },
    { first_name: "Maya", last_name: "Castillo", user_type: null },
    { firstName: "Someone", lastName: "Harris", user_type: "HACKER" },
    { firstName: "Jacob", lastName: "Harris", user_type: " admin " },
    { firstName: "Jacob", lastName: "Harris", user_type: "organizer" },
  ]);
  assert.deepEqual(await promoteOrganizers(db, ["Jacob Harris", "Maya Castillo"], true, output), { matched: 6, updated: 2 });
  assert.deepEqual(db.writes, [
    { ref: 2, data: { user_type: "ORGANIZER" } },
    { ref: 3, data: { user_type: "ORGANIZER" } },
  ]);
});

test("rechecks deletion, first and last name edits, and protected roles before writing", async () => {
  const original = { firstName: "Jacob", lastName: "Harris", user_type: "HACKER" };
  const db = database(
    Array(5).fill(original),
    [null,
      { ...original, firstName: "Someone" },
      { ...original, lastName: "Other" },
      { ...original, user_type: "ADMIN" },
      { ...original, user_type: "ORGANIZER" }],
  );
  assert.deepEqual(await promoteOrganizers(db, ["Jacob Harris"], true, output), { matched: 5, updated: 0 });
  assert.deepEqual(db.writes, []);
});

test("reports unmatched names without guessing nicknames", async () => {
  const messages = [];
  const db = database([{ firstName: "Jennifer", lastName: "Ngo" }]);
  await promoteOrganizers(db, ["Jenny Ngo"], false, { ...output, log: (message) => messages.push(message) });
  assert.ok(messages.some((message) => message.includes("No matching account for: jenny ngo")));
  assert.deepEqual(db.writes, []);
});

test("rejects blank, surname-only, and partially invalid target lists", async () => {
  for (const names of [[], [" "], ["Harris"], ["Jacob Harris", ""]]) {
    await assert.rejects(promoteOrganizers(database([]), names, true, output), /first and last name/);
  }
});

test("the old surname-only CLI is rejected before connecting to Firebase", () => {
  const script = path.resolve(__dirname, "../scripts/promote-organizers.cjs");
  const result = spawnSync(process.execPath, [script, "--project", "test", "--last-name", "Harris", "--apply"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown option.*last-name/);
});
