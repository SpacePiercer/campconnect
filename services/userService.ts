// services/userService.ts
import { getAuth }       from 'firebase/auth';
import { doc, getDoc }   from 'firebase/firestore';
import { db }            from '../firebase';

export async function getUserById(userId: string) {
  // 1. Try to load from your users collection
  const snap = await getDoc(doc(db, 'users', userId));
  if (snap.exists()) {
    return snap.data() as { email: string; username?: string };
  }

  // 2. Fallback: only the signed-in user is available client-side
  const auth       = getAuth();
  const current    = auth.currentUser;
  if (current?.uid === userId) {
    return {
      email:    current.email    ?? '',
      username: current.displayName ?? undefined,
    };
  }

  // 3. Nobody to return
  throw new Error(`User ${userId} not found in Firestore or Auth`);
}
