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
    hostPhone: data.hostPhone || "",
    // The host's account (email or username). Unlike the display name or the
    // per-browser Firebase id, this stays the same on every device.
    hostAccount: data.hostAccount || "",
    // Accounts of everyone who joined, so membership survives name changes
    // and two people with the same first name don't get mixed up.
    memberIds: [],
    // Phone numbers shared by everyone in the session: [{ name, phone }]
    contacts: data.contacts || (data.hostPhone ? [{ name: data.hostName, phone: data.hostPhone }] : []),
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
// uid is this browser's Firebase id and accountId the student's account, so we
// can tell which sessions they host or joined on any device.
function toAppSession(snapshot, uid, accountId) {
  const s = snapshot.data();
  // Ended sessions stay in the database but disappear for everyone.
  if (s.ended) return null;
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
    contacts: s.contacts || [],
    capacity: s.capacity || 8,
    tags: s.tags?.length ? s.tags : [s.style],
    memberIds: Array.isArray(s.memberIds) ? s.memberIds : undefined,
    mine: Boolean((uid && s.hostId === uid) || (accountId && s.hostAccount === accountId)),
    joinedByMe: Boolean(accountId && Array.isArray(s.memberIds) && s.memberIds.includes(accountId)),
  };
}

// Live list of every session. Calls onChange with the full list now and
// again whenever anyone creates, joins, leaves or ends a session.
// Returns a function that stops listening.
export function subscribeSessions(onChange, onError, accountId = "") {
  let stop = () => {};
  let cancelled = false;
  ensureSignedIn()
    .then((user) => {
      if (cancelled) return;
      stop = onSnapshot(
        query(sessionsRef, orderBy("start")),
        (snap) => onChange(snap.docs.map((d) => toAppSession(d, user.uid, accountId)).filter(Boolean)),
        onError,
      );
    })
    .catch(onError);
  return () => {
    cancelled = true;
    stop();
  };
}

// user: { name, id?, phone? } (name is added to attendees, the account id to
// memberIds, phone to contacts)
export async function joinSession(id, user) {
  await ensureSignedIn();
  const changes = { attendees: arrayUnion(user.name) };
  if (user.id) changes.memberIds = arrayUnion(user.id);
  if (user.phone) changes.contacts = arrayUnion({ name: user.name, phone: user.phone });
  await updateDoc(doc(db, "sessions", id), changes);
}

// user: { name, id?, contacts? } (removes the name, account id and that
// person's phone entries)
export async function leaveSession(id, user) {
  await ensureSignedIn();
  const changes = { attendees: arrayRemove(user.name) };
  if (user.id) changes.memberIds = arrayRemove(user.id);
  if (user.contacts?.length) changes.contacts = arrayRemove(...user.contacts);
  await updateDoc(doc(db, "sessions", id), changes);
}

// Ends a session for everyone. The database's security rules don't allow
// deleting sessions, so it's marked as ended (which hides it) instead.
export async function endSession(id) {
  await ensureSignedIn();
  await updateDoc(doc(db, "sessions", id), { ended: true, endedAt: serverTimestamp() });
}

// After a name change, show the new name in a session's lists.
// attendees: the session's current list; hosting: whether they host it.
export async function renameInSession(id, { oldName, newName, attendees = [], hosting = false }) {
  await ensureSignedIn();
  const changes = { attendees: attendees.map((name) => (name === oldName ? newName : name)) };
  if (hosting) changes.hostName = newName;
  await updateDoc(doc(db, "sessions", id), changes);
}

// Removes the session document entirely. The current security rules refuse
// this, so the app uses endSession instead.
export async function deleteSession(id) {
  await ensureSignedIn();
  await deleteDoc(doc(db, "sessions", id));
}
