import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  Query,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Event {
  id: string;
  title: string;
  description: string;
  timestamp: Timestamp;
  points: number;
  active: boolean;
}

export const eventsRef = collection(db, "UH11-events");

export const getEvents = async (active: boolean = true): Promise<Event[]> => {
  let q: Query<DocumentData>;
  if (active) {
    q = query(eventsRef, where("active", "==", true));
  } else {
    q = query(eventsRef);
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const e = doc.data() as Event;
    e.id = doc.id;
    return e;
  });
};

export const addAttendance = async (eventId: string, userId: string) => {
  const docRef = doc(eventsRef, eventId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists() == false) throw new Error("Event not found");

  const attendanceRef = collection(eventsRef, eventId, "attendance");

  // Allows point store "events" to be "attended" multiple times
  if (
    !(snapshot.data() as Event).title.toLowerCase().includes("[point store]")
  ) {
    const alreadyAttended = await getDocs(
      query(attendanceRef, where("uid", "==", userId)),
    );
    if (alreadyAttended.docs.length > 0) throw new Error("Already attended");
  }

  await setDoc(doc(attendanceRef, userId), {
    uid: userId,
    timestamp: new Date(),
  });
};

export const getPoints = async (userId: string) => {
  const events = await getEvents(false);

  let points = 0;
  for (const event of events) {
    const q = query(
      collection(db, "UH11-events", event.id, "attendance"),
      where("uid", "==", userId),
    );
    const snapshot = await getDocs(q);
    if (snapshot.docs.length > 0) {
      points += event.points;
    }
  }
  return points;
};
