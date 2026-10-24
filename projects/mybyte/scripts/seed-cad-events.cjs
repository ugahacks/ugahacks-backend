#!/usr/bin/env node
const { parseArgs } = require("node:util");

const COLLECTION = "CAD-events";
const events = [
  ["2026-10-24", "check-in", "Check-In"],
  ["2026-10-24", "first-time-caders-workshop", "First Time CADers Workshop"],
  ["2026-10-24", "brunch", "Brunch"],
  ["2026-10-24", "club-expo", "Club Expo"],
  ["2026-10-24", "guest-speaker-adam-wineland", "Guest Speaker Event - Adam Wineland"],
  ["2026-10-24", "paper-airplane-race", "Paper Airplane Race"],
  ["2026-10-24", "gdt-workshop", "GD&T Workshop (UGA Motorsports)"],
  ["2026-10-24", "guest-speaker-kyle-johnsen", "Guest Speaker Event - Kyle Johnsen"],
  ["2026-10-24", "lego-wacky-racers", "LEGO Wacky Racers (ASME)"],
  ["2026-10-25", "design-your-own-dorm-room", "Design Your Own Dorm Room Workshop (NSBE)"],
  ["2026-10-25", "career-prep-workshop", "Career Prep Workshop"],
  ["2026-10-25", "brunch", "Brunch"],
  ["2026-10-25", "memory-car-challenge", "Memory Car Challenge (ASME)"],
  ["2026-10-25", "reverse-engineering-workshop", "Reverse Engineering Workshop"],
  ["2026-10-25", "ugahacks-info-session", "UGAHacks Info Session"],
  ["2026-10-25", "bottle-rocket-launchers", "Bottle Rocket Launchers"],
  ["2026-10-25", "closing-ceremony", "Closing Ceremony"],
].map(([date, slug, title], index) => ({
  id: `${date}-${slug}`,
  title,
  date,
  sortOrder: index + 1,
  description: "",
  points: 0,
  active: true,
}));

async function seedEvents(db) {
  const refs = events.map((event) => db.collection(COLLECTION).doc(event.id));
  return db.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(...refs);
    let created = 0;
    snapshots.forEach((snapshot, index) => {
      if (snapshot.exists) return;
      const { id, ...data } = events[index];
      transaction.create(refs[index], data);
      created++;
    });
    return { created, skipped: events.length - created };
  });
}

async function main() {
  const { values } = parseArgs({
    options: {
      project: { type: "string" },
      apply: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help) {
    console.log("Usage: node seed-cad-events.cjs [--project PROJECT_ID --apply]");
    console.log("Without --apply, prints the proposed events without connecting to Firebase.");
    return;
  }
  if (values.apply && !values.project?.trim()) {
    throw new Error("--project PROJECT_ID is required with --apply.");
  }
  console.log(`Collection: ${COLLECTION}; mode: ${values.apply ? "APPLY" : "PREVIEW"}`);
  console.table(events.map(({ date, title, points, active }) => ({ date, title, points, active })));
  if (!values.apply) {
    console.log("Preview only. Use --project PROJECT_ID --apply to create missing events.");
    return;
  }

  const { initializeApp, applicationDefault, deleteApp } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");
  const app = initializeApp({ projectId: values.project, credential: applicationDefault() });
  try {
    console.log(`Project: ${values.project}`);
    const result = await seedEvents(getFirestore(app));
    console.log(`Created ${result.created} events; kept ${result.skipped} existing events. Refresh the scanner.`);
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

module.exports = { COLLECTION, events, seedEvents };
