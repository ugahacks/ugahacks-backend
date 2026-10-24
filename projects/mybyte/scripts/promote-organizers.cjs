#!/usr/bin/env node
const { parseArgs } = require("node:util");

const normalize = (value) => typeof value === "string"
  ? value.trim().replace(/\s+/g, " ").toLowerCase()
  : "";

function fullNameOf(user) {
  const first = normalize(user.firstName) || normalize(user.first_name);
  const last = normalize(user.lastName) || normalize(user.last_name);
  return first && last ? `${first} ${last}` : "";
}

function matches(user, names) {
  return names.has(fullNameOf(user));
}

function hasProtectedRole(user) {
  return ["admin", "organizer"].includes(normalize(user.user_type));
}

function requestedNames(fullNames) {
  const names = new Set(fullNames.map(normalize));
  if (!names.size || [...names].some((name) => !name.includes(" "))) {
    throw new Error('Supply a first and last name together for each --name, e.g. --name "Jacob Harris".');
  }
  return names;
}

async function promoteOrganizers(db, fullNames, apply = false, output = console) {
  const names = requestedNames(fullNames);

  // Require both first and last name fields; never match on surname alone.
  const snapshot = await db.collection("users")
    .select("firstName", "first_name", "lastName", "last_name", "email", "user_type")
    .get();
  const matched = snapshot.docs.filter((doc) => matches(doc.data(), names));
  output.table(matched.map((doc) => {
    const user = doc.data();
    return {
      uid: doc.id,
      firstName: user.firstName ?? user.first_name ?? "",
      lastName: user.lastName || user.last_name || "",
      email: user.email ?? "",
      currentRole: user.user_type ?? "(unassigned)",
      action: hasProtectedRole(user) ? "Keep role" : "Set ORGANIZER",
    };
  }));
  output.log(`Read ${snapshot.size} users; matched ${matched.length}.`);
  const foundNames = new Set(matched.map((doc) => fullNameOf(doc.data())));
  const missing = [...names].filter((name) => !foundNames.has(name));
  if (missing.length) output.log(`No matching account for: ${missing.join(", ")}`);

  if (!apply) {
    output.log("Preview only. Review the names and emails, then rerun with --apply to update matches.");
    return { matched: matched.length, updated: 0 };
  }

  let updated = 0;
  for (const match of matched) {
    // Recheck inside a transaction so concurrent edits cannot demote an admin
    // or promote an account whose full name has changed since the preview.
    const changed = await db.runTransaction(async (transaction) => {
      const current = await transaction.get(match.ref);
      if (!current.exists) return false;
      const user = current.data();
      if (!matches(user, names) || hasProtectedRole(user)) return false;
      transaction.update(match.ref, { user_type: "ORGANIZER" });
      return true;
    });
    if (changed) {
      updated++;
      output.log(`Updated ${match.id} to ORGANIZER.`);
    }
  }
  output.log(`Updated ${updated} users. Have them refresh MyByte.`);
  return { matched: matched.length, updated };
}

async function main() {
  const { values } = parseArgs({
    options: {
      project: { type: "string" },
      name: { type: "string", multiple: true },
      apply: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help) {
    console.log('Usage: node promote-organizers.cjs --project PROJECT_ID --name "Jacob Harris" [--name "Maya Castillo"] [--apply]');
    return;
  }
  if (!values.project?.trim()) {
    throw new Error("Provide --project PROJECT_ID. Use --help for usage.");
  }
  requestedNames(values.name ?? []);

  const { initializeApp, applicationDefault, deleteApp } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");
  const app = initializeApp({ projectId: values.project, credential: applicationDefault() });
  try {
    console.log(`Project: ${values.project}; collection: users; mode: ${values.apply ? "APPLY" : "PREVIEW"}`);
    await promoteOrganizers(getFirestore(app), values.name, values.apply);
  } finally {
    await deleteApp(app);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { fullNameOf, promoteOrganizers };
