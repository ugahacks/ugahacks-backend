import { doc, Firestore, getDoc } from "firebase/firestore";

/**
 * Banned identifiers live in `blacklist`, one document per email or phone
 * number, keyed `email:<address>` or `phone:<E.164>`. Keep this normalization
 * in sync with scripts/blacklist-user.cjs, which writes the documents.
 */
export const BLACKLIST_COLLECTION = "blacklist";
export const BLACKLISTED_USER_MESSAGE = "Unable to register blacklisted user";

type Identifier = string | null | undefined;

export interface BlacklistIdentifiers {
  emails?: Identifier[];
  phoneNumbers?: Identifier[];
}

export function normalizeEmail(email: Identifier): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/** Returns E.164 (+15555550123); bare 10-digit numbers are assumed to be US. */
export function normalizePhoneNumber(phoneNumber: Identifier): string {
  if (typeof phoneNumber !== "string") return "";
  const digits = phoneNumber.replace(/\D/g, "");
  if (!digits) return "";
  if (!phoneNumber.trim().startsWith("+") && digits.length === 10) {
    return "+1" + digits;
  }
  return "+" + digits;
}

export function blacklistKeys({ emails = [], phoneNumbers = [] }: BlacklistIdentifiers) {
  const keys = [
    ...emails.map(normalizeEmail).filter(Boolean).map((email) => "email:" + email),
    ...phoneNumbers
      .map(normalizePhoneNumber)
      .filter(Boolean)
      .map((phoneNumber) => "phone:" + phoneNumber),
  ];
  return Array.from(new Set(keys));
}

export function blacklistedUserError() {
  const error = new Error(BLACKLISTED_USER_MESSAGE);
  error.name = "BlacklistedUserError";
  return error;
}

export function isBlacklistedUserError(error: unknown) {
  return error instanceof Error && error.name === "BlacklistedUserError";
}

/**
 * Throws if any of the given emails or phone numbers is blacklisted. A failed
 * lookup also throws, so registration never proceeds unchecked.
 */
export async function assertNotBlacklisted(
  db: Firestore,
  identifiers: BlacklistIdentifiers,
) {
  const keys = blacklistKeys(identifiers);
  const snapshots = await Promise.all(
    keys.map((key) => getDoc(doc(db, BLACKLIST_COLLECTION, key))),
  );
  const matched = keys.filter((_, index) => snapshots[index].exists());
  if (matched.length) {
    // Log only which kind of identifier matched, not the identifier itself.
    console.error(BLACKLISTED_USER_MESSAGE, {
      matchedOn: matched.map((key) => key.split(":")[0]),
    });
    throw blacklistedUserError();
  }
}
