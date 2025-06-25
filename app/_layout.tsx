// app/_layout.tsx (UPDATED TO INCLUDE FIREBASE INITIALIZATION)
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import app from '@react-native-firebase/app'; // <--- Import the Firebase 'app' module
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../firebase/firebaseConfig'; // <--- Import your Firebase config

// Initialize Firebase only once
if (!app.apps.length) { // Check if no Firebase apps have been initialized
  app.initializeApp(firebaseConfig); // Initialize the default Firebase app
}

// Create an AuthContext
const AuthContext = createContext<FirebaseAuthTypes.User | null | undefined>(undefined);

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// AuthProvider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async firebaseUser => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await AsyncStorage.setItem('userToken', await firebaseUser.getIdToken());
      } else {
        await AsyncStorage.removeItem('userToken');
      }
      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber;
  }, []); // Run only once

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading user...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}

// RootLayout (this is your _layout.tsx)
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

// Nested component to handle redirect logic with router and segments
function RootLayoutNav() {
  const user = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (user === undefined) {
      return;
    }

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, segments]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Assuming index.tsx is part of the (tabs) group, you might not need this explicitly here.
          If index.tsx is a top-level route (e.g., app/index.tsx), keep this.
          If it's app/(tabs)/index.tsx, then it's covered by (tabs). */}
      {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
});