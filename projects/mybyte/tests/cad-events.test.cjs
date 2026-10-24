const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const { COLLECTION, events, seedEvents } = require("../scripts/seed-cad-events.cjs");

function seedDatabase(initial = []) {
  const documents = new Map(initial);
  return {
    documents,
    collection: (name) => ({ doc: (id) => `${name}/${id}` }),
    runTransaction: async (callback) => callback({
      getAll: async (...refs) => refs.map((ref) => ({ exists: documents.has(ref) })),
      create: (ref, data) => {
        assert.equal(documents.has(ref), false);
        documents.set(ref, data);
      },
    }),
  };
}

test("schedule contains 17 attendance-only events on the confirmed dates", () => {
  assert.equal(COLLECTION, "CAD-events");
  assert.equal(events.length, 17);
  assert.equal(new Set(events.map((event) => event.id)).size, 17);
  assert.equal(events.filter((event) => event.date === "2026-10-24").length, 9);
  assert.equal(events.filter((event) => event.date === "2026-10-25").length, 8);
  assert.equal(events.filter((event) => event.title === "Career Prep Workshop").length, 1);
  assert.equal(events.filter((event) => event.title === "Brunch").length, 2);
  assert.ok(events.every((event) => event.active && event.points === 0));
});

test("import can run twice without duplicating events or changing attendance", async () => {
  const attendancePath = `CAD-events/${events[0].id}/attendance/participant`;
  const db = seedDatabase([[attendancePath, { uid: "participant", times: 1 }]]);
  assert.deepEqual(await seedEvents(db), { created: 17, skipped: 0 });
  assert.deepEqual(await seedEvents(db), { created: 0, skipped: 17 });
  assert.equal(db.documents.size, 18);
  assert.equal(db.documents.get(attendancePath).times, 1);
});

test("import preserves existing event edits", async () => {
  const eventPath = `CAD-events/${events[0].id}`;
  const existing = { title: "Edited check-in", active: false, points: 10 };
  const db = seedDatabase([[eventPath, existing]]);
  assert.deepEqual(await seedEvents(db), { created: 16, skipped: 1 });
  assert.deepEqual(db.documents.get(eventPath), existing);
});

function eventApi() {
  const docs = new Map(events.map(({ id, ...data }) => [`CAD-events/${id}`, data]));
  const queries = [];
  const ref = (...parts) => parts.filter((part) => typeof part === "string").join("/");
  const snapshot = (key) => ({
    id: key.split("/").at(-1),
    exists: () => docs.has(key),
    data: () => docs.get(key),
  });
  const firestore = {
    collection: ref,
    doc: ref,
    where: (field, op, value) => ({ field, value }),
    query: (path, ...conditions) => ({ path, conditions }),
    getDoc: async (key) => snapshot(key),
    getDocs: async ({ path, conditions }) => {
      queries.push(path);
      const keys = [...docs.keys()].filter((key) =>
        key.startsWith(`${path}/`) && key.split("/").length === path.split("/").length + 1 &&
        conditions.every(({ field, value }) => docs.get(key)[field] === value),
      );
      return { docs: keys.reverse().map(snapshot) };
    },
    setDoc: async (key, data) => { docs.set(key, data); },
  };
  const filename = path.resolve(__dirname, "../interfaces/event.ts");
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(code, {
    exports: loaded.exports,
    require: (name) => {
      if (name === "firebase/firestore") return firestore;
      if (name === "../config/firebase") return { db: {} };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return { api: loaded.exports, docs, queries };
}

test("scanner loads active CAD events in schedule order and labels duplicate titles by date", async () => {
  const { api, docs } = eventApi();
  docs.set("CAD-events/inactive", { title: "Inactive", active: false, points: 0 });
  const loaded = await api.getEvents();
  assert.equal(loaded.length, 17);
  assert.equal(loaded[0].title, "Check-In");
  assert.equal(loaded[16].title, "Closing Ceremony");
  const brunches = loaded.filter((event) => event.title === "Brunch");
  assert.equal(api.getEventLabel(brunches[0]), "10/24 — Brunch");
  assert.equal(api.getEventLabel(brunches[1]), "10/25 — Brunch");
  assert.equal(api.getEventLabel({ title: "Undated event" }), "Undated event");
});

test("scans and point totals share CAD-events and repeat scans do not duplicate attendance", async () => {
  const { api, docs, queries } = eventApi();
  const eventId = events[0].id;
  docs.get(`CAD-events/${eventId}`).points = 5;
  await api.addAttendance(eventId, "participant");
  assert.equal(docs.get(`CAD-events/${eventId}/attendance/participant`).times, 1);
  assert.equal(await api.getPoints("participant"), 5);
  await assert.rejects(api.addAttendance(eventId, "participant"), /Already attended/);
  assert.equal(docs.get(`CAD-events/${eventId}/attendance/participant`).times, 1);
  assert.ok(queries.every((query) => query.startsWith("CAD-events")));
});

test("attendance cannot be added for a nonexistent event", async () => {
  const { api } = eventApi();
  await assert.rejects(api.addAttendance("missing", "participant"), /Event not found/);
});
