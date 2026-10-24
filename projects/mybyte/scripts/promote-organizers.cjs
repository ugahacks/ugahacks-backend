#!/usr/bin/env node
const { parseArgs } = require("node:util");

const normalize = (value) => typeof value === "string"
  ? value.trim().replace(/\s+/g, " ").toLowerCase()
  : "";

function lastNameOf(user) {
  return normalize(user.lastName) || normalize(user.last_name);
}

function matches(user, lastNames) {
  return lastNames.has(lastNameOf(user));
}

async function promoteOrganizers(db, lastNames, apply = false, output = console) {
  const names = new Set(lastNames.map(normalize).filter(Boolean));
  if (!names.size) throw new Error("Supply at least one nonempty last name.");

  // Read both current and legacy name fields. Matching is case-insensitive.
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
      action: ["ADMIN", "ORGANIZER"].includes(user.user_type) ? "Keep role" : "Set ORGANIZER",
    };
  }));
  output.log(`Read ${snapshot.size} users; matched ${matched.length}.`);

  if (!apply) {
    output.log("Preview only. Review the names and emails, then rerun with --apply to update matches.");
    return { matched: matched.length, updated: 0 };
  }

  let updated = 0;
  for (const match of matched) {
    // Recheck inside a transaction so concurrent edits cannot demote an admin
    // or promote an account whose last name has changed since the preview.
    const changed = await db.runTransaction(async (transaction) => {
      const current = await transaction.get(match.ref);
      if (!current.exists) return false;
      const user = current.data();
      if (!matches(user, names) || ["ADMIN", "ORGANIZER"].includes(user.user_type)) return false;
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
      "last-name": { type: "string", multiple: true },
      apply: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help) {
    console.log('Usage: node promote-organizers.cjs --project PROJECT_ID --last-name "Smith" [--last-name "Jones"] [--apply]');
    return;
  }
  if (!values.project?.trim() || !values["last-name"]?.some((name) => normalize(name))) {
    throw new Error("Provide --project PROJECT_ID and at least one --last-name. Use --help for usage.");
  }

  const { initializeApp, applicationDefault, deleteApp } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");
  const app = initializeApp({ projectId: values.project, credential: applicationDefault() });
  try {
    console.log(`Project: ${values.project}; collection: users; mode: ${values.apply ? "APPLY" : "PREVIEW"}`);
    await promoteOrganizers(getFirestore(app), values["last-name"], values.apply);
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

module.exports = { lastNameOf, promoteOrganizers };
