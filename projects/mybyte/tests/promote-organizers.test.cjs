const assert = require("node:assert/strict");
const test = require("node:test");
const { lastNameOf, promoteOrganizers } = require("../scripts/promote-organizers.cjs");

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

test("recognizes explicit current and legacy last names without guessing from full names", () => {
  assert.equal(lastNameOf({ lastName: "  De La  Cruz " }), "de la cruz");
  assert.equal(lastNameOf({ last_name: "SMITH" }), "smith");
  assert.equal(lastNameOf({ name: "Someone Smith" }), "");
});

test("preview matches full surnames case-insensitively and never writes", async () => {
  const db = database([{ lastName: "Smith" }, { last_name: "SMITH" }, { lastName: "Smithson" }]);
  assert.deepEqual(await promoteOrganizers(db, [" smith "], false, output), { matched: 2, updated: 0 });
  assert.deepEqual(db.writes, []);
});

test("apply changes only the role and preserves admins and organizers", async () => {
  const db = database([
    { lastName: "Smith", user_type: "ADMIN" },
    { lastName: "Smith", user_type: "ORGANIZER" },
    { lastName: "Smith", user_type: "HACKER" },
    { last_name: "Jones", user_type: null },
    { lastName: "Other", user_type: "HACKER" },
  ]);
  assert.deepEqual(await promoteOrganizers(db, ["Smith", "Jones"], true, output), { matched: 4, updated: 2 });
  assert.deepEqual(db.writes, [
    { ref: 2, data: { user_type: "ORGANIZER" } },
    { ref: 3, data: { user_type: "ORGANIZER" } },
  ]);
});

test("rechecks deletions, name edits, and admin promotions before updating", async () => {
  const db = database(
    [{ lastName: "Smith" }, { lastName: "Smith" }, { lastName: "Smith" }],
    [null, { lastName: "Other" }, { lastName: "Smith", user_type: "ADMIN" }],
  );
  assert.deepEqual(await promoteOrganizers(db, ["Smith"], true, output), { matched: 3, updated: 0 });
  assert.deepEqual(db.writes, []);
});

test("rejects blank last names", async () => {
  await assert.rejects(promoteOrganizers(database([]), [" "], true, output), /nonempty last name/);
});
