import { initializeApp } from 'firebase/app';
// Import initializeAuth and Persistence from the main 'firebase/auth' module
import { initializeAuth, Persistence } from 'firebase/auth';
// Import getReactNativePersistence from the React Native specific entry point, trying with .js extension
import { getReactNativePersistence } from 'firebase/auth/react-native.js'; // Added .js extension
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDRQXsz1ALUszH8daam2b1Ku23w23GXybo', // Reminder: Be careful with API keys in client-side code.
  authDomain: 'camp-connect-2df6c.firebaseapp.com',
  projectId: 'camp-connect-2df6c',
  storageBucket: 'camp-connect-2df6c.appspot.com',
  messagingSenderId: '1032655604266',
  appId: '1:1032655604266:web:840e3546fa13e96943d153',
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence for React Native
// This uses ReactNativeAsyncStorage for storing authentication state.
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Export the app and auth instances for use in other parts of your application
export { app, auth };
