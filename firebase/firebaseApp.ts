// firebase/firebaseApp.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDRQXsz1ALUszH8daam2b1Ku23w23GXybo',
  authDomain: 'camp-connect-2df6c.firebaseapp.com',
  projectId: 'camp-connect-2df6c',
  storageBucket: 'camp-connect-2df6c.appspot.com',
  messagingSenderId: '1032655604266',
  appId: '1:1032655604266:web:840e3546fa13e96943d153',
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { app, auth }; // Export auth if you're using it elsewhere
