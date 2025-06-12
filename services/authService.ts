// services/authService.ts
import { auth, db } from '@/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SignUpResult {
  uid: string;
  email: string;
  username: string;
  token: string;
}

export interface SignInResult {
  uid: string;
  email: string;
  token: string;
}

// Initialize auth state listener
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const token = await user.getIdToken();
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userUid', user.uid);
    await AsyncStorage.setItem('userEmail', user.email || '');
  } else {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userUid');
    await AsyncStorage.removeItem('userEmail');
  }
});

/**
 * Signs up a new user in both Firebase Auth and Firestore.
 */
export async function signUp(
  email: string,
  password: string,
  username?: string
): Promise<SignUpResult> {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  const uid = cred.user.uid;
  const profile = {
    email,
    username: username?.trim() || email.split('@')[0],
  };
  await db.doc(`users/${uid}`).set(profile);
  const token = await cred.user.getIdToken();
  return { uid, email, username: profile.username!, token };
}

/**
 * Signs in an existing user via Firebase Auth.
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  const token = await cred.user.getIdToken();
  return { uid: cred.user.uid, email: cred.user.email || email, token };
}

/**
 * Signs out the user and clears persistence
 */
export async function signOut() {
  await auth.signOut();
  await AsyncStorage.multiRemove(['userToken', 'userUid', 'userEmail']);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await AsyncStorage.getItem('userToken');
  return !!token;
}

/**
 * Get current user info
 */
export async function getCurrentUser() {
  const token = await AsyncStorage.getItem('userToken');
  const uid = await AsyncStorage.getItem('userUid');
  const email = await AsyncStorage.getItem('userEmail');
  
  return token ? { uid, email, token } : null;
}
