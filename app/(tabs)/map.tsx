import React from 'react';
import { View, Text, Button, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function MapScreen() {
  const router = useRouter();

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webText}>Map is not supported on web yet 🗺️</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  // Only require react-native-maps on native
  const MapView = require('react-native-maps').default;
  const Marker = require('react-native-maps').Marker;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 49.2827,
          longitude: -123.1207,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        onPress={(event: any) => {
          const { latitude, longitude } = event.nativeEvent.coordinate;
          router.push({
            pathname: '/create-hike',
            params: {
              lat: latitude.toFixed(5),
              lon: longitude.toFixed(5),
            },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  webText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
});
