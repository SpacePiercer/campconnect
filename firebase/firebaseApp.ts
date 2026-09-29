// firebaseApp.ts
// Import directly from @react-native-firebase modules
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth'; // Import for side effects (initializing auth methods)
import '@react-native-firebase/firestore'; // Import if you're using Firestore

// IMPORTANT: For @react-native-firebase, you generally do NOT need firebaseConfig here
// if you have correctly placed google-services.json (Android) and GoogleService-Info.plist (iOS)
// and configured native files as per the rnfirebase.io documentation.
// The native modules will initialize Firebase using those native files.

// Get the default Firebase app instance that was initialized natively
const app = firebase.app(); // Use firebase.app() to get the default app

// Get the auth instance associated with the default app
const auth = firebase.auth();

// Export the app and auth instances for use in other parts of your application
export { app, auth };

// If you need firestore, export it as well:
export const firestore = firebase.firestore();

// Remove ReactNativeAsyncStorage and related persistence code as @react-native-firebase handles it natively.