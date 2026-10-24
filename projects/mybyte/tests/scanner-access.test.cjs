const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const Users = {
  organizer: "ORGANIZER",
  admin: "ADMIN",
  hacker: "HACKER",
};

// Exercise the actual TSX with isolated React/Firebase boundaries.
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
      if (name === "../enums/userType") return { Users };
      if (name === "react/jsx-runtime") return require(name);
      throw new Error(`Unexpected dependency: ${name}`);
    },
    console,
  }, { filename });
  return loaded.exports;
}

function hooks() {
  const states = [];
  const effects = [];
  let cursor = 0;
  return {
    effects,
    reset: () => { cursor = 0; },
    react: {
      createContext: () => ({ Provider: "provider" }),
      useContext: () => ({}),
      useEffect: (fn) => effects.push(fn),
      useLayoutEffect: () => {},
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value) => { states[index] = value; }];
      },
    },
  };
}

function authHarness(role) {
  const h = hooks();
  let authCallback;
  let resolveRead;
  let delayRead = false;
  const auth = { currentUser: { uid: "staff", email: "staff@example.com" } };
  const userData = { uid: "staff", user_type: role, registered: {} };
  const updates = [];
  const snapshot = () => ({ exists: () => true, data: () => userData });
  const { AuthContextProvider } = load("context/AuthContext.tsx", {
    react: h.react,
    "firebase/auth": {
      GoogleAuthProvider: class {},
      onAuthStateChanged: (_, callback) => { authCallback = callback; return () => {}; },
    },
    "firebase/firestore": {
      collection: (_, name) => name,
      doc: (collection, uid) => `${collection}/${uid}`,
      getDoc: async () => {
        if (delayRead) await new Promise((resolve) => { resolveRead = resolve; });
        return snapshot();
      },
      setDoc: async () => {},
      serverTimestamp: () => "timestamp",
      runTransaction: async (_, callback) => callback({
        get: async () => snapshot(),
        update: (_, data) => updates.push(data),
      }),
    },
    "firebase/storage": { getStorage: () => ({}) },
    "firebase/app": {},
    "next/router": {},
    "../config/firebase": { auth, db: {} },
    "../enums/events": {},
    "../interfaces/event": { getPoints: async () => 0 },
  });
  const render = () => { h.reset(); return AuthContextProvider({ children: "app" }); };
  render();
  h.effects[0]();
  return {
    render, auth, updates,
    login: () => authCallback(auth.currentUser),
    deferRead: () => { delayRead = true; },
    finishRead: () => resolveRead(),
  };
}

for (const role of [Users.organizer, Users.admin, Users.hacker, "MENTOR", null, undefined]) {
  test(`registration preserves existing role ${role ?? "(unassigned)"}`, async () => {
    const h = authHarness(role);
    await h.login();
    await h.render().props.value.storeUserRegistrationInformation({});
    assert.equal(h.updates.length, 1);
    assert.equal(h.updates[0]["registered.HACKS12"], true);
    if (role == null) assert.equal(h.updates[0].user_type, Users.hacker);
    else assert.equal(Object.hasOwn(h.updates[0], "user_type"), false);
  });
}

test("protected pages wait for the organizer profile to finish loading", async () => {
  const h = authHarness(Users.organizer);
  assert.equal(h.render().props.children, null);
  h.deferRead();
  const login = h.login();
  assert.equal(h.render().props.children, null);
  h.finishRead();
  await login;
  assert.equal(h.render().props.children, "app");
  assert.equal(h.render().props.value.user_type, Users.organizer);
});

test("a late organizer lookup cannot restore access after logout", async () => {
  const h = authHarness(Users.organizer);
  h.deferRead();
  const login = h.login();
  h.auth.currentUser = null;
  await h.login();
  h.finishRead();
  await login;
  assert.equal(h.render().props.value.user_type, null);
  assert.equal(h.render().props.value.user.uid, null);
});

function hasScannerLink(element) {
  if (!element || typeof element !== "object") return false;
  if (Array.isArray(element)) return element.some(hasScannerLink);
  return element.props?.href === "/qrRead" || hasScannerLink(element.props?.children);
}

for (const role of [Users.organizer, Users.admin, Users.hacker, null]) {
  test(`scanner navigation and route access for ${role ?? "unassigned"} without a name`, () => {
    const h = hooks();
    const redirects = [];
    const context = { user: { uid: "staff" }, userInfo: { first_name: null }, user_type: role };
    const mocks = {
      react: h.react,
      "next/router": { useRouter: () => ({ asPath: "/qrRead", replace: (url) => redirects.push(url) }) },
      "next/link": "a",
      "../context/AuthContext": { useAuth: () => context },
    };
    const Navbar = load("components/navbar.tsx", mocks).default;
    const OrganizerRoute = load("components/OrganizerRoute.tsx", mocks).default;
    const allowed = role === Users.organizer || role === Users.admin;
    assert.equal(hasScannerLink(Navbar({ children: "page" })), allowed);
    assert.equal(OrganizerRoute({ children: "scanner" }).props.children, allowed ? "scanner" : null);
    h.effects[0]();
    assert.deepEqual(redirects, allowed ? [] : ["/dashboard"]);
  });
}

test("signed-out visitors go only to login and cannot render the scanner", () => {
  const h = hooks();
  const redirects = [];
  const OrganizerRoute = load("components/OrganizerRoute.tsx", {
    react: h.react,
    "next/router": { useRouter: () => ({ replace: (url) => redirects.push(url) }) },
    "../context/AuthContext": { useAuth: () => ({ user: { uid: null }, user_type: null }) },
  }).default;
  assert.equal(OrganizerRoute({ children: "scanner" }).props.children, null);
  h.effects[0]();
  assert.deepEqual(redirects, ["/login"]);
});
