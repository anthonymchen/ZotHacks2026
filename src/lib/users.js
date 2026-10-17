import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, ensureSignedIn } from "../firebase";

// data: { preferredName, email, major, year }
export async function saveProfile(data) {
  const user = await ensureSignedIn();
  await setDoc(
    doc(db, "users", user.uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getProfile() {
  const user = await ensureSignedIn();
  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() ? snap.data() : null;
}