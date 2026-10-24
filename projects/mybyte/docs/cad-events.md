# CAD attendance events

The scanner reads active documents in `CAD-events`. The October 24–25, 2026
schedule is defined in `../scripts/seed-cad-events.cjs`: 9 events on October 24
and 8 on October 25. Both days have their own Brunch document. The second day
includes one Design Your Own Dorm Room Workshop (NSBE) and one Career Prep Workshop.

Each event document has `title`, `date` (YYYY-MM-DD), `sortOrder`, `description`,
`points`, and `active`. Dates are calendar dates in Athens, Georgia; start times
have not been supplied. All imported events are active with zero points, so scans
track attendance without awarding points. The scanner displays the date alongside
each title and keeps events in the supplied schedule order.

## Import into Firebase

Upload `seed-cad-events.cjs` into a dedicated folder in Google Cloud Shell,
using an account with Firestore write access to the Firebase project. In that folder:

```bash
npm init -y
npm install firebase-admin
node seed-cad-events.cjs
node seed-cad-events.cjs --project ugahacks-core-infra --apply
```

The first invocation previews the event list without connecting to Firebase.
The `--apply` invocation creates missing documents in one transaction. Stable IDs
make repeat imports safe: existing event documents and attendance records are
preserved. Edit existing event fields directly in Firestore if the schedule changes.
The script uses Application Default Credentials; see the
[Firebase Admin setup documentation](https://firebase.google.com/docs/admin/setup).

Deploy the MyByte changes and refresh the scanner after importing. The client
needs permission to read `CAD-events` and to read/write the event attendance
subcollections under the project's existing organizer permissions. Firestore rules
are not managed in this repository; if the deployed rules name an older event
collection explicitly, update the corresponding path to `CAD-events` while
retaining its role checks.

## Attendance records

Selecting an event and scanning a participant's QR code stores:

```text
CAD-events/{eventId}/attendance/{participantUid}
  uid: participantUid
  timestamp: scan time
  times: 1
```

Ordinary events reject repeat scans with “Already attended.” A participant can
attend both Brunch events because each has a different event ID. The scanner's
Check-In event records event attendance; it does not update a separate registration
record's `checkedIn` field.

Point totals now use `CAD-events` too. Historical records in `CADATHON-events`
are not migrated or included in these totals.

Run the focused regression checks from the repository root:

```bash
node --test projects/mybyte/tests/cad-events.test.cjs
```
