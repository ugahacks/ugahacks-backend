#!/usr/bin/env node
const { parseArgs } = require("node:util");

// Keys must match util/blacklist.ts, which MyByte uses to look them up.
const COLLECTION = "blacklist";
// Registration collections searched for the emails and phone numbers of a --uid.
const REGISTRATION_COLLECTIONS = [
  "UH12-user-registration-details",
  "CADathon1-user-registration-details",
  "eSports-cadathon-user-registration-details",
  "UH11-user-registration-details",
  "UHX-user-registration-details",
  "UH9-user-registration-details",
];

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function normalizePhoneNumber(phoneNumber) {
  if (typeof phoneNumber !== "string") return "";
  const digits = phoneNumber.replace(/\D/g, "");
  if (!digits) return "";
  if (!phoneNumber.trim().startsWith("+") && digits.length === 10) return "+1" + digits;
  return "+" + digits;
}

function blacklistKeys({ emails = [], phoneNumbers = [] }) {
  return [...new Set([
    ...emails.map(normalizeEmail).filter(Boolean).map((email) => "email:" + email),
    ...phoneNumbers.map(normalizePhoneNumber).filter(Boolean).map((phone) => "phone:" + phone),
  ])];
}

/** Collects every email and phone number on record for the given accounts. */
async function identifiersForUids(db, uids) {
  const emails = [];
  const phoneNumbers = [];
  const missing = [];
  for (const uid of uids) {
    const refs = [db.collection("users").doc(uid), ...REGISTRATION_COLLECTIONS.map((name) => db.collection(name).doc(uid))];
    const snapshots = await db.getAll(...refs);
    if (!snapshots.some((snapshot) => snapshot.exists)) missing.push(uid);
    for (const snapshot of snapshots) {
      if (!snapshot.exists) continue;
      const data = snapshot.data();
      emails.push(data.email);
      phoneNumbers.push(data.phoneNumber);
    }
  }
  return { emails, phoneNumbers, missing };
}

const serverTimestamp = () => require("firebase-admin/firestore").FieldValue.serverTimestamp();

async function blacklistUsers(db, { emails = [], phoneNumbers = [], uids = [] }, apply = false, output = console, timestamp = serverTimestamp) {
  const found = await identifiersForUids(db, uids);
  if (found.missing.length) output.log(`No account or registration found for uid: ${found.missing.join(", ")}`);
  const keys = blacklistKeys({
    emails: [...emails, ...found.emails],
    phoneNumbers: [...phoneNumbers, ...found.phoneNumbers],
  });
  if (!keys.length) throw new Error("Nothing to blacklist. Supply --email, --phone, or a --uid with an email or phone on record.");

  const refs = keys.map((key) => db.collection(COLLECTION).doc(key));
  const existing = await db.getAll(...refs);
  output.table(keys.map((key, index) => ({
    key,
    action: existing[index].exists ? "Already blacklisted" : "Add",
  })));
  const toAdd = refs.filter((_, index) => !existing[index].exists);

  if (!apply) {
    output.log("Preview only. Review the identifiers, then rerun with --apply to add them.");
    return { added: 0, pending: toAdd.length };
  }

  const batch = db.batch();
  // Only the key and type: any signed-in user who knows an identifier can read its document.
  toAdd.forEach((ref) => batch.create(ref, { type: ref.id.split(":")[0], added_time: timestamp() }));
  if (toAdd.length) await batch.commit();
  output.log(`Added ${toAdd.length} identifiers to ${COLLECTION}.`);
  return { added: toAdd.length, pending: 0 };
}

async function main() {
  const { values } = parseArgs({
    options: {
      project: { type: "string" },
      email: { type: "string", multiple: true },
      phone: { type: "string", multiple: true },
      uid: { type: "string", multiple: true },
      apply: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help) {
    console.log("Usage: node blacklist-user.cjs --project PROJECT_ID [--uid UID] [--email EMAIL] [--phone +15555550123] [--apply]");
    console.log("--uid adds every email and phone number on that account's user and registration documents.");
    return;
  }
  if (!values.project?.trim()) {
    throw new Error("Provide --project PROJECT_ID. Use --help for usage.");
  }

  const { initializeApp, applicationDefault, deleteApp } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");
  const app = initializeApp({ projectId: values.project, credential: applicationDefault() });
  try {
    console.log(`Project: ${values.project}; collection: ${COLLECTION}; mode: ${values.apply ? "APPLY" : "PREVIEW"}`);
    await blacklistUsers(getFirestore(app), {
      emails: values.email,
      phoneNumbers: values.phone,
      uids: values.uid,
    }, values.apply);
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

module.exports = { COLLECTION, blacklistKeys, blacklistUsers, normalizeEmail, normalizePhoneNumber };
