const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const script = require("../scripts/blacklist-user.cjs");

const root = path.resolve(__dirname, "..");
const MESSAGE = "Unable to register blacklisted user";
// Values created inside the vm context have that context's prototypes.
const plain = (value) => JSON.parse(JSON.stringify(value));

function load(relativePath, mocks) {
  const filename = path.join(root, relativePath);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(code, {
    module: loaded,
    exports: loaded.exports,
    require: (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name === "react/jsx-runtime") return require(name);
      throw new Error(`Unexpected dependency: ${name}`);
    },
    console: mocks.console ?? console,
  }, { filename });
  return loaded.exports;
}

// Firestore stand-in: `blacklisted` holds document IDs in the blacklist collection.
function firestore(blacklisted = []) {
  const reads = [];
  return {
    reads,
    module: {
      collection: (_, name) => name,
      doc: (...parts) => parts.filter((part) => typeof part === "string").join("/"),
      getDoc: async (path) => {
        reads.push(path);
        return {
          exists: () => blacklisted.some((key) => path === `blacklist/${key}`),
          data: () => ({}),
        };
      },
    },
  };
}

function loadBlacklist(blacklisted, logs = []) {
  const store = firestore(blacklisted);
  const util = load("util/blacklist.ts", {
    "firebase/firestore": store.module,
    console: { error: (...args) => logs.push(args) },
  });
  return { util, store, logs };
}

test("normalizes emails and phone numbers into stable keys", () => {
  const { util } = loadBlacklist();
  assert.deepEqual(plain(util.blacklistKeys({
    emails: [" Byte@UGA.edu ", "byte@uga.edu", "", null, undefined],
    phoneNumbers: ["+1 (404) 555-0123", "404-555-0123", "+44 20 7946 0958", "", null],
  })), ["email:byte@uga.edu", "phone:+14045550123", "phone:+442079460958"]);
});

test("the admin script writes the same keys MyByte looks up", () => {
  const { util } = loadBlacklist();
  const cases = [
    { emails: [" Byte@UGA.edu "], phoneNumbers: ["(404) 555-0123"] },
    { emails: ["a@b.edu", "A@B.EDU"], phoneNumbers: ["+14045550123", "14045550123"] },
    { emails: [], phoneNumbers: ["+44 20 7946 0958", "abc"] },
  ];
  for (const identifiers of cases) {
    assert.deepEqual(script.blacklistKeys(identifiers), plain(util.blacklistKeys(identifiers)));
  }
});

for (const [label, identifiers] of [
  ["email", { emails: ["BYTE@uga.edu"], phoneNumbers: ["+17065550000"] }],
  ["phone", { emails: ["new@uga.edu"], phoneNumbers: ["(404) 555-0123"] }],
]) {
  test(`rejects a user whose ${label} alone is blacklisted, without logging it`, async () => {
    const { util, logs } = loadBlacklist(["email:byte@uga.edu", "phone:+14045550123"]);
    await assert.rejects(util.assertNotBlacklisted({}, identifiers), (error) => {
      assert.equal(error.message, MESSAGE);
      assert.equal(util.isBlacklistedUserError(error), true);
      return true;
    });
    assert.equal(logs.length, 1);
    assert.equal(logs[0][0], MESSAGE);
    assert.deepEqual(plain(logs[0][1]), { matchedOn: [label] });
    assert.doesNotMatch(JSON.stringify(logs), /uga\.edu|555/);
  });
}

test("allows users who match nothing and skips empty identifiers", async () => {
  const { util, store } = loadBlacklist(["email:byte@uga.edu"]);
  await util.assertNotBlacklisted({}, { emails: ["other@uga.edu", ""], phoneNumbers: [undefined] });
  assert.deepEqual(store.reads, ["blacklist/email:other@uga.edu"]);
  assert.equal(util.isBlacklistedUserError(new Error(MESSAGE)), false);
});

// AuthContext with Firebase stubbed out; `blacklisted` drives the real util.
function authHarness(blacklisted) {
  const writes = [];
  const deleted = [];
  const store = firestore(blacklisted);
  const blacklist = load("util/blacklist.ts", {
    "firebase/firestore": store.module,
    console: { error() {} },
  });
  const auth = { currentUser: null };
  const states = [];
  const effects = [];
  let cursor = 0;
  let authCallback;
  const newUser = { uid: "new", email: "BYTE@uga.edu" };
  const { AuthContextProvider } = load("context/AuthContext.tsx", {
    react: {
      createContext: () => ({ Provider: "provider" }),
      useContext: () => ({}),
      useEffect: (fn) => effects.push(fn),
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (next) => { states[index] = next; }];
      },
    },
    "firebase/auth": {
      GoogleAuthProvider: class {},
      onAuthStateChanged: (_, callback) => { authCallback = callback; return () => {}; },
      createUserWithEmailAndPassword: async () => ({ user: newUser }),
      signInWithPopup: async () => ({ user: { ...newUser, displayName: "Byte Dawg" } }),
      deleteUser: async (user) => deleted.push(user.uid),
      sendEmailVerification: () => {},
      signOut: async () => {},
    },
    "firebase/firestore": {
      ...store.module,
      getDoc: async (path) => (path.startsWith("blacklist/")
        ? store.module.getDoc(path)
        : { exists: () => false, data: () => ({}) }),
      setDoc: async (path, data) => writes.push(path),
      updateDoc: async (path) => writes.push(path),
      serverTimestamp: () => "timestamp",
    },
    "firebase/storage": { getStorage: () => ({}) },
    "firebase/app": {},
    "next/router": {},
    "../config/firebase": { auth, db: {} },
    "../components/LoadingShell": "loading",
    "../enums/events": {},
    "../enums/userType": { Users: {} },
    "../interfaces/event": { getPoints: async () => 0 },
    "../util/blacklist": blacklist,
  });
  const render = () => { cursor = 0; return AuthContextProvider({ children: "app" }).props.value; };
  render();
  effects[0]();
  const signIn = async (user) => {
    auth.currentUser = user;
    await authCallback(user);
    return render();
  };
  return { value: render(), signIn, writes, deleted };
}

for (const eventType of ["ugahacks12", "cadathon"]) {
  test(`${eventType} registration stops before any write for a blacklisted phone number`, async () => {
    const h = authHarness(["phone:+14045550123"]);
    const value = await h.signIn({ uid: "returning", email: "fresh@gmail.com" });
    await assert.rejects(
      value.storeUserRegistrationInformation({ eventType, email: "fresh@uga.edu", phoneNumber: "+14045550123" }),
      new RegExp(MESSAGE),
    );
    assert.deepEqual(h.writes, []);
  });

  test(`${eventType} registration is checked against the account email too`, async () => {
    const h = authHarness(["email:old@gmail.com"]);
    const value = await h.signIn({ uid: "returning", email: "Old@gmail.com" });
    await assert.rejects(
      value.storeUserRegistrationInformation({ eventType, email: "fresh@uga.edu", phoneNumber: "+17065550000" }),
      new RegExp(MESSAGE),
    );
    assert.deepEqual(h.writes, []);
  });

  test(`${eventType} registration proceeds when nothing matches`, async () => {
    const h = authHarness(["phone:+14045550123"]);
    const value = await h.signIn({ uid: "returning", email: "fresh@gmail.com" });
    await value.storeUserRegistrationInformation({ eventType, email: "fresh@uga.edu", phoneNumber: "+17065550000" });
    assert.ok(h.writes.length > 0);
  });
}

test("email sign-up deletes the new auth account and never writes a user document", async () => {
  const h = authHarness(["email:byte@uga.edu"]);
  await assert.rejects(h.value.signUp("Byte", "Dawg", "BYTE@uga.edu", "password"), new RegExp(MESSAGE));
  assert.deepEqual(h.deleted, ["new"]);
  assert.deepEqual(h.writes, []);
});

test("first Google sign-in with a blacklisted email is undone and reported", async () => {
  const h = authHarness(["email:byte@uga.edu"]);
  await assert.rejects(h.value.logInWithGoogle(), new RegExp(MESSAGE));
  assert.deepEqual(h.deleted, ["new"]);
  assert.deepEqual(h.writes, []);
});

test("sign-up proceeds normally for an email that is not blacklisted", async () => {
  const h = authHarness(["phone:+14045550123"]);
  await h.value.signUp("Byte", "Dawg", "BYTE@uga.edu", "password");
  assert.deepEqual(h.deleted, []);
  assert.deepEqual(h.writes, ["users/new"]);
});

test("organizers can check day-of walk-ins through the context", async () => {
  const h = authHarness(["phone:+14045550123"]);
  await assert.rejects(h.value.checkNotBlacklisted({ phoneNumbers: ["404-555-0123"] }), new RegExp(MESSAGE));
  await h.value.checkNotBlacklisted({ emails: ["walkin@uga.edu"], phoneNumbers: ["+17065550000"] });
});

// Admin SDK stand-in for the script.
function adminDb(docs) {
  const created = [];
  const ref = (collection, id) => ({ id, path: `${collection}/${id}` });
  return {
    created,
    collection: (name) => ({ doc: (id) => ref(name, id) }),
    getAll: async (...refs) => refs.map((r) => ({
      exists: Object.hasOwn(docs, r.path),
      data: () => docs[r.path],
    })),
    batch: () => ({
      create: (r, data) => created.push({ id: r.id, data }),
      commit: async () => {},
    }),
  };
}
const quiet = { table() {}, log() {} };

test("script preview reports pending identifiers without writing", async () => {
  const db = adminDb({ "blacklist/email:byte@uga.edu": {} });
  const result = await script.blacklistUsers(db, { emails: ["byte@uga.edu"], phoneNumbers: ["4045550123"] }, false, quiet);
  assert.deepEqual(result, { added: 0, pending: 1 });
  assert.deepEqual(db.created, []);
});

test("script --uid collects every email and phone on record and adds only new keys", async () => {
  const db = adminDb({
    "users/abc": { email: "Personal@gmail.com" },
    "UH12-user-registration-details/abc": { email: "byte@uga.edu", phoneNumber: "+14045550123" },
    "CADathon1-user-registration-details/abc": { email: "byte@uga.edu", phoneNumber: "+17065550000" },
    "blacklist/phone:+17065550000": {},
  });
  const result = await script.blacklistUsers(db, { uids: ["abc"] }, true, quiet, () => "now");
  assert.deepEqual(result, { added: 3, pending: 0 });
  assert.deepEqual(db.created, [
    { id: "email:personal@gmail.com", data: { type: "email", added_time: "now" } },
    { id: "email:byte@uga.edu", data: { type: "email", added_time: "now" } },
    { id: "phone:+14045550123", data: { type: "phone", added_time: "now" } },
  ]);
});

test("script rejects requests that resolve to no identifiers", async () => {
  const messages = [];
  await assert.rejects(
    script.blacklistUsers(adminDb({}), { uids: ["ghost"] }, true, { ...quiet, log: (m) => messages.push(m) }),
    /Nothing to blacklist/,
  );
  assert.ok(messages.some((m) => m.includes("ghost")));
});
