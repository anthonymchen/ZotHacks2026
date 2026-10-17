import {
  collection, addDoc, getDocs, doc, updateDoc,
  arrayUnion, arrayRemove, deleteDoc, onSnapshot, Timestamp, query, orderBy,
  serverTimestamp,
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

// Turn a Firestore document into the shape the app uses.
// uid is the signed-in user's id, so we can tell which sessions they host.
function toAppSession(snapshot, uid) {
  const s = snapshot.data();
  const iso = (value) => {
    const date = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };
  const start = iso(s.start);
  const end = iso(s.end);
  if (!start || !end) return null;
  return {
    ...s,
    id: snapshot.id,
    firebaseId: snapshot.id,
    start,
    end,
    attendees: s.attendees || [],
    capacity: s.capacity || 8,
    tags: s.tags?.length ? s.tags : [s.style],
    mine: Boolean(uid && s.hostId === uid),
  };
}

// Live list of every session. Calls onChange with the full list now and
// again whenever anyone creates, joins, leaves or ends a session.
// Returns a function that stops listening.
export function subscribeSessions(onChange, onError) {
  let stop = () => {};
  let cancelled = false;
  ensureSignedIn()
    .then((user) => {
      if (cancelled) return;
      stop = onSnapshot(
        query(sessionsRef, orderBy("start")),
        (snap) => onChange(snap.docs.map((d) => toAppSession(d, user.uid)).filter(Boolean)),
        onError,
      );
    })
    .catch(onError);
  return () => {
    cancelled = true;
    stop();
  };
}

// user: { name } (the display name that gets added to attendees)
export async function joinSession(id, user) {
  await ensureSignedIn();
  await updateDoc(doc(db, "sessions", id), {
    attendees: arrayUnion(user.name),
  });
}

// user: { name } (the display name removed from attendees)
export async function leaveSession(id, user) {
  await ensureSignedIn();
  await updateDoc(doc(db, "sessions", id), {
    attendees: arrayRemove(user.name),
  });
}

// Removes the session for everyone (host only).
export async function deleteSession(id) {
  await ensureSignedIn();
  await deleteDoc(doc(db, "sessions", id));
}
