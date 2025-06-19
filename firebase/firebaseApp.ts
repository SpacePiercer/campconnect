// firebaseApp.ts
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth'; // Import auth for its side effects (like enabling auth methods)
import '@react-native-firebase/firestore'; // If you're using firestore, import it here too

// For @react-native-firebase, you typically configure it natively in
// android/app/google-services.json and ios/YourApp/Info.plist
// So, you usually don't need a firebaseConfig object here for initialization
// if you've set up the native files correctly.

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDRQXsz1ALUszH8daam2b1Ku23w23GXybo', // Reminder: Be careful with API keys in client-side code.
  authDomain: 'camp-connect-2df6c.firebaseapp.com',
  projectId: 'camp-connect-2df6c',
  storageBucket: 'camp-connect-2df6c.appspot.com',
  messagingSenderId: '1032655604266',
  appId: '1:1032655604266:web:840e3546fa13e96943d153',
};

// Get the default Firebase app instance
const app = firebase;

// Get the auth instance
const auth = firebase.auth();

// Export the app and auth instances
export { app, auth };

// If you need to access other services, add them:
// export const firestore = firebase.firestore();
// export const storage = firebase.storage();
