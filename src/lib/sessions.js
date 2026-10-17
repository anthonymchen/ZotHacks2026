import {
  collection, addDoc, getDocs, doc, updateDoc,
  arrayUnion, Timestamp, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db, ensureSignedIn } from "../firebase";

const sessionsRef = collection(db, "sessions");

// data: { course, location, start, end, style, professor, hostName,
//         capacity?, waitlist?, tags? }
// start and end can be Date objects or ISO strings from datetime-local.
export async function createSession(data) {
  const user = await ensureSignedIn();
  const docRef = await addDoc(sessionsRef, {
    course: data.course.trim().toUpperCase(),
    location: data.location,
    start: Timestamp.fromDate(new Date(data.start)),
    end: Timestamp.fromDate(new Date(data.end)),
    style: data.style,
    professor: data.professor || "",
    hostName: data.hostName,
    hostId: user.uid,
    attendees: data.attendees || [],
    capacity: data.capacity || 8,
    waitlist: data.waitlist || [],
    tags: data.tags?.length ? data.tags : [data.style],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// filters: { course, location, style }. All optional.
// Returns an array of session objects with start/end as Date objects.
export async function listSessions({ course, location, style } = {}) {
  await ensureSignedIn();
  const snap = await getDocs(query(sessionsRef, orderBy("start")));
  let sessions = snap.docs.map((d) => {
    const s = d.data();
    return { id: d.id, ...s, start: s.start.toDate(), end: s.end.toDate() };
  });

  // Filtering happens in JS to avoid creating Firestore indexes.
  if (course) {
    const c = course.trim().toLowerCase();
    sessions = sessions.filter((s) => s.course.toLowerCase().includes(c));
  }
  if (location) sessions = sessions.filter((s) => s.location === location);
  if (style) sessions = sessions.filter((s) => s.style === style);
  return sessions;
}

// user: { name } (the display name that gets added to attendees)
export async function joinSession(id, user) {
  await ensureSignedIn();
  await updateDoc(doc(db, "sessions", id), {
    attendees: arrayUnion(user.name),
  });
}