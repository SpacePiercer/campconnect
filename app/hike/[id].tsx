// app/hike/[id].tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { useHike } from '../(context)/HikeContext';
import HikeTabView from '../../components/HikeTabView';

export default function HikeDetailScreen() {
  const { hike, loadHike } = useHike();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (id) loadHike(id);
  }, [id]);

  if (!hike) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#888" />
        <Text style={styles.loadingText}>Loading hike details…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{hike.hikeName}</Text>
      <Text style={styles.date}>{hike.date}</Text>
      {hike.latitude && hike.longitude && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: hike.latitude,
            longitude: hike.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{
              latitude: hike.latitude,
              longitude: hike.longitude,
            }}
            title={hike.hikeName}
          />
        </MapView>
      )}
      <HikeTabView />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#aaa' },
  title: { fontSize: 28, fontWeight: 'bold', margin: 16, color: '#4ade80' },
  date: { fontSize: 16, marginHorizontal: 16, marginBottom: 8, color: '#ccc' },
  map: { width: '100%', height: 200, marginBottom: 16 },
});
