# Blacklist

The blacklist stops people who have been banned from UGAHacks events from signing
up or registering again.

## In short

- A person is blocked if **either** their email **or** their phone number is on
  the blacklist. Both don't have to match.
- So someone who makes a new account with a new email is still caught by the
  phone number they enter on the registration form.
- A blocked person sees **"Unable to register blacklisted user"**, and the same
  message is logged to the browser console.
- Blacklisting doesn't delete anyone's account or cancel a registration they
  already have. It stops new sign-ups and new registrations.

## Quick guides

### I need to ban someone

You need access to Google Cloud Shell for the `ugahacks-core-infra` project. Ask
the tech team if you don't have it.

1. Find the person's **UID**: in the Firebase Console, open Firestore → `users`
   and search for their email. The document ID is the UID.
2. Upload `scripts/blacklist-user.cjs` to a folder in Cloud Shell. If this is
   your first time in that folder, run:

   ```bash
   npm init -y
   npm install firebase-admin
   ```

3. Preview what will be blocked:

   ```bash
   node blacklist-user.cjs --project ugahacks-core-infra --uid <UID>
   ```

   This prints every email and phone number found for that person. Nothing is
   saved yet.
4. If the list looks right, run the same command with `--apply` on the end.
5. Record why they were banned somewhere private, such as the organizer drive.
   Don't put the reason in Firestore.

If you only have an email or phone number (no account), use
`--email` / `--phone` instead of `--uid`. See [Blacklisting someone](#blacklisting-someone).

### I need to un-ban someone

1. Firebase Console → Firestore → `blacklist`.
2. Delete the documents for their email(s) and phone number(s), e.g.
   `email:byte@uga.edu` and `phone:+14045550123`.

They can sign up and register again immediately.

### A hacker says they're getting "Unable to register blacklisted user"

1. Don't confirm or explain the ban over open channels. Send them to
   [hello@ugahacks.com](mailto:hello@ugahacks.com).
2. Check the `blacklist` collection for their email and phone number to see
   which one matched.
3. If it's a mistake (for example, a recycled phone number), un-ban that
   identifier as above.

### I'm registering a walk-in on event day

Everyone registered by an organizer must be checked against the blacklist
first, the same way online registrations are. The day-of registration tool
(not built yet) must do this automatically; if it shows "Unable to register blacklisted user", don't register or admit
the person, and escalate to an organizer lead. Developers building that tool, see
[Day-of registration](#day-of-registration).

## Data model

Each banned identifier is its own document in the `blacklist` collection:

```text
blacklist/email:byte@uga.edu      { type: "email", added_time }
blacklist/phone:+14045550123      { type: "phone", added_time }
```

Document IDs are normalized so lookups are a single `getDoc` and Firestore rules
can check them with `exists()`:

- **Email**: trimmed and lowercased.
- **Phone**: E.164 (`+` and digits). The registration form's phone input already
  produces E.164; bare 10-digit numbers are treated as US (`+1`).

Normalization lives in `util/blacklist.ts` (MyByte) and is mirrored in
`scripts/blacklist-user.cjs` (admin). `tests/blacklist.test.cjs` fails if the two
disagree.

Documents deliberately hold nothing beyond the key and type. Any signed-in user who
already knows an identifier can read its document, so keep reasons, names, and
incident notes elsewhere.

## Where it is checked

| Flow | Identifiers checked | On a match |
|------|---------------------|------------|
| Email/password sign-up (`signUp`) | Sign-up email | New auth account is deleted; no `users` document is written |
| First Google sign-in (`logInWithGoogle`) | Google email | New auth account is deleted; no `users` document is written |
| Event registration (`storeUserRegistrationInformation`, UGAHacks 12 and Cadathon) | Form email, form phone, account email | Rejected before the resume upload or any Firestore write |
| Day-of registration by organizers (upcoming) | Whatever the organizer enters | Call `checkNotBlacklisted` from `useAuth()` before writing anything |

Existing accounts can still log in; they just cannot register for events.

The check fails closed. If the blacklist lookup errors (for example, the Firestore
rule below is missing), registration and sign-up fail too, rather than skipping
the check.

### Day-of registration

The organizer walk-in flow must run the same check before creating anything:

```typescript
const { checkNotBlacklisted } = useAuth();

await checkNotBlacklisted({
  emails: [form.email],
  phoneNumbers: [form.phoneNumber],
}); // throws Error("Unable to register blacklisted user")
```

Use `isBlacklistedUserError(error)` from `util/blacklist.ts` to tell this apart
from other failures.

The QR scanner does not consult the blacklist. Someone who registered before being
blacklisted keeps their registration until an organizer handles it.

## Blacklisting someone

`scripts/blacklist-user.cjs` adds entries with the Firebase Admin SDK. Run it the
same way as the other scripts (see [CAD events](./cad-events.md)): in Google Cloud
Shell with `firebase-admin` installed and an account that can write to Firestore.

```bash
# Preview: prints the keys it would add and which already exist
node blacklist-user.cjs --project ugahacks-core-infra --uid <UID>

# Add every email and phone number on that account's user and registration docs
node blacklist-user.cjs --project ugahacks-core-infra --uid <UID> --apply

# Or name identifiers directly (each flag may repeat)
node blacklist-user.cjs --project ugahacks-core-infra \
  --email byte@uga.edu --phone "+1 404 555 0123" --apply
```

`--uid` reads `users/{uid}` and the UGAHacks 12, Cadathon, Cadathon eSports,
UGAHacks 11, X, and 9 registration documents. Review the preview before applying;
it shows each normalized key. Existing entries are left untouched.

To lift a ban, delete the matching documents in the Firebase Console.

## Firestore rules

Rules are not managed in this repository. **Deploy the `blacklist` rule before
deploying this MyByte change**, or every sign-up and registration will fail.

```javascript
match /blacklist/{key} {
  // Single-document lookups only: no listing, no client writes.
  allow get: if request.auth != null;
  allow list, write: if false;
}
```

The client check can be bypassed by someone calling Firestore directly. To enforce
it server-side, add the same test to the registration `create` rules:

```javascript
function notBlacklisted(email, phone) {
  return !exists(/databases/$(database)/documents/blacklist/$('email:' + email.trim().lower()))
      && !exists(/databases/$(database)/documents/blacklist/$('phone:' + phone))
      && !exists(/databases/$(database)/documents/blacklist/$('email:' + request.auth.token.email.lower()));
}

match /UH12-user-registration-details/{userId} {
  allow create: if request.auth != null && request.auth.uid == userId
                && notBlacklisted(request.resource.data.email, request.resource.data.phoneNumber);
}
```

Apply the same condition to `CADathon1-user-registration-details` and to whatever
collection the day-of flow writes.

## Tests

```bash
node --test projects/mybyte/tests/blacklist.test.cjs
```
