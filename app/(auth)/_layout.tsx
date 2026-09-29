// app/(auth)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router'; // Make sure Text is not imported or used incorrectly here.

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}