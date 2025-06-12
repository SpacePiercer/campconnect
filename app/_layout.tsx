// app/_layout.tsx
import 'react-native-get-random-values';
import 'react-native-reanimated';
import React from 'react'
import { Slot } from 'expo-router'
import HikeProvider from "./(context)/HikeContext"

export default function RootLayout() {
  return (
    <HikeProvider>
      <Slot />
    </HikeProvider>
  );
}
