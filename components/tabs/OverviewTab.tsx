// components/tabs/OverviewTab.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHike } from '../../app/(context)/HikeContext';

export default function OverviewTab() {
  const { hike, updateHike } = useHike();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userToken')
      .then(token => setUserId(token))
      .catch(console.error);
  }, []);

  if (!hike) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading overview…</Text>
      </View>
    );
  }

  const joinHike = async () => {
    if (!userId) {
      Alert.alert('Not signed in', 'Please log in to join this hike.');
      return;
    }
    if (hike.joinedUsers.includes(userId)) {
      // leave
      const updated = hike.joinedUsers.filter(u => u !== userId);
      updateHike({ joinedUsers: updated });
    } else {
      // join, check capacity
      const cap = parseInt(hike.participants, 10) || 0;
      if (hike.joinedUsers.length >= cap) {
        Alert.alert('Full', 'No spots left in this hike.');
        return;
      }
      const email = await AsyncStorage.getItem('userEmail');
    if (!email) {
      return Alert.alert('Error', 'Could not read your email.');
    }
    updateHike({ joinedUsers: [...hike.joinedUsers, email] });
    }
  };

  const joined = userId != null && hike.joinedUsers.includes(userId);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{hike.hikeName}</Text>

      {hike.latitude != null && hike.longitude != null && (
        <MapView
          style={styles.miniMap}
          initialRegion={{
            latitude: hike.latitude,
            longitude: hike.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker coordinate={{ latitude: hike.latitude, longitude: hike.longitude }} />
        </MapView>
      )}

      <View style={styles.metricsRow}>
        {hike.distanceKm != null && (
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{hike.distanceKm.toFixed(1)} km</Text>
            <Text style={styles.metricLabel}>Distance</Text>
          </View>
        )}
        {hike.durationHours != null && (
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {Math.floor(hike.durationHours)}h {Math.round((hike.durationHours % 1) * 60)}m
            </Text>
            <Text style={styles.metricLabel}>Est. Time</Text>
          </View>
        )}
        {hike.elevationGainM != null && (
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{hike.elevationGainM} m</Text>
            <Text style={styles.metricLabel}>Elevation↑</Text>
          </View>
        )}
        {hike.difficulty && (
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{hike.difficulty}</Text>
            <Text style={styles.metricLabel}>Difficulty</Text>
          </View>
        )}
      </View>

      {/* Join/Leave Button */}
      <View style={styles.joinButtonContainer}>
        <Button
          title={joined ? 'Leave Hike' : 'Join Hike'}
          onPress={joinHike}
          color={joined ? 'orange' : '#4ade80'}
        />
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Date:</Text>
        <Text style={styles.infoValue}>{hike.date}</Text>
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Time:</Text>
        <Text style={styles.infoValue}>{hike.time || '—'}</Text>
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Participants:</Text>
        <Text style={styles.infoValue}>{hike.joinedUsers.length} / {hike.participants}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  miniMap: { width: '100%', height: 150, borderRadius: 8, marginBottom: 16 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: '#111', borderRadius: 8, padding: 12, marginHorizontal: 4, alignItems: 'center' },
  metricValue: { fontSize: 18, fontWeight: '600', color: '#fff' },
  metricLabel: { fontSize: 12, color: '#aaa', marginTop: 4 },
  joinButtonContainer: { marginVertical: 20 },
  infoBlock: { flexDirection: 'row', marginBottom: 12 },
  infoLabel: { color: '#aaa', width: 100 },
  infoValue: { color: '#fff', flex: 1 },
});
