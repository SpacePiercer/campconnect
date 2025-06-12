import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Button,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { Hike } from '@/app/(context)/HikeContext';

function hasPassed(hike: Hike): boolean {
  // build an ISO-ish string. If time is empty, treat as midnight start.
  const when = `${hike.date}T${hike.time || '00:00'}:00`;
  const hikeMs = new Date(when).getTime();
  const nowMs   = Date.now();
  return nowMs >= hikeMs;
}

export default function HomeScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [upcomingHikes, setUpcomingHikes] = useState<Hike[]>([]);
  const [completedHikes, setCompletedHikes] = useState<Hike[]>([]);
  const [selectedHike, setSelectedHike] = useState<Hike | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load hikes for the current user
  const loadHikes = async (uid: string) => {
    try {
      const data = await AsyncStorage.getItem('hikes');
      if (!data) return;
      const all: Hike[] = JSON.parse(data);
      const joined = all.filter(h => h.joinedUsers.includes(uid));
      setUpcomingHikes(joined.filter(h => !h.completedBy.includes(uid)));
      setCompletedHikes(joined.filter(h => h.completedBy.includes(uid)));
    } catch (err) {
      console.error('Error loading hikes:', err);
    }
  };

  // On screen focus, fetch user token then hikes
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('userToken')
        .then(token => {
          if (token) {
            setUserId(token);
            loadHikes(token);
          } else {
            setUserId(null);
            setUpcomingHikes([]);
            setCompletedHikes([]);
          }
        })
        .catch(console.error);
    }, [])
  );

  // Handler to leave a hike
  const handleLeave = async (hike: Hike) => {
    if (!userId) return;
    const data = await AsyncStorage.getItem('hikes');
    if (!data) return;
    const all: Hike[] = JSON.parse(data);
    const idx = all.findIndex(h => h.id === hike.id);
    if (idx === -1) return;
    all[idx].joinedUsers = all[idx].joinedUsers.filter(u => u !== userId);
    await AsyncStorage.setItem('hikes', JSON.stringify(all));
    loadHikes(userId);
  };

  // Handler to mark a hike as completed
  const handleMarkCompleted = async (hike: Hike) => {
    if (!userId) return;
    const data = await AsyncStorage.getItem('hikes');
    if (!data) return;
    const all: Hike[] = JSON.parse(data);
    const idx = all.findIndex(h => h.id === hike.id);
    if (idx === -1) return;
    if (!all[idx].completedBy.includes(userId)) {
      all[idx].completedBy.push(userId);
      await AsyncStorage.setItem('hikes', JSON.stringify(all));
      loadHikes(userId);
    }
  };

  const handleJoin = async (hike: Hike) => {
    if (!userId) return Alert.alert('Not signed in', 'Please log in to join.');
    const data = await AsyncStorage.getItem('hikes');
    if (!data) return;
    const all: Hike[] = JSON.parse(data);
    const idx = all.findIndex(h => h.id === hike.id);
    if (idx === -1) return;
    const target = all[idx];
    const cap = parseInt(target.participants, 10) || 0;
    if (target.joinedUsers.includes(userId)) return;
    if (target.joinedUsers.length >= cap) {
      return Alert.alert('Full', 'No spots left.');
    }
    target.joinedUsers.push(userId);
    await AsyncStorage.setItem('hikes', JSON.stringify(all));
    loadHikes(userId);
  };

  return (
    <ScrollView style={styles.container}
  contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Upcoming Hikes</Text>
      {upcomingHikes.length === 0 ? (
        <Text style={styles.noHikesText}>No upcoming hikes. Join one in Explore!</Text>
      ) : (
        upcomingHikes.map(hike => (
          <View key={hike.id} style={styles.card}>
            <Pressable
              onPress={() => { setSelectedHike(hike); setModalVisible(true); }}
              style={styles.info}
            >
              <Text style={styles.name}>{hike.hikeName}</Text>
              <Text style={styles.meta}>{hike.locationName} • {hike.date}</Text>
              <Text style={styles.meta}>👥 {hike.joinedUsers.length}/{hike.participants}</Text>
            </Pressable>

            {/* Always show Mark Completed and Leave buttons */}
            <View style={styles.buttonRow}>
              {hasPassed(hike) && (
                <Button
                  title="Mark Completed"
                  onPress={() => handleMarkCompleted(hike)}
                  color="green"
                />
                )}
              <Button
                title="Leave"
                onPress={() => handleLeave(hike)}
                color="orange"
              />
            </View>
          </View>
        ))
      )}

      {completedHikes.length > 0 && (
        <Text style={[styles.title, { marginTop: 24 }]}>Completed Hikes</Text>
      )}
      {completedHikes.map(hike => (
        <View key={hike.id} style={styles.card}>
          <Pressable
            onPress={() => { setSelectedHike(hike); setModalVisible(true); }}
            style={styles.info}
          >
            <Text style={[styles.name, { color: '#4ade80' }]}>✅ {hike.hikeName}</Text>
            <Text style={styles.meta}>{hike.locationName} • {hike.date}</Text>
            <Text style={styles.meta}>👥 {hike.joinedUsers.length}/{hike.participants}</Text>
          </Pressable>
        </View>
      ))}

      {/* Details Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedHike && (
              <>
                <Text style={styles.modalTitle}>{selectedHike.hikeName}</Text>
                <Text style={styles.modalText}>📍 {selectedHike.locationName}</Text>
                <Text style={styles.modalText}>📅 {selectedHike.date}</Text>
                <Text style={styles.modalText}>⏰ {selectedHike.time}</Text>
                <Text style={styles.modalText}>👥 {selectedHike.joinedUsers.length}/{selectedHike.participants}</Text>
                <Text style={styles.modalText}>🚗 Carpool: {selectedHike.carNeeded ? 'Yes' : 'No'}</Text>
                {selectedHike.latitude != null && selectedHike.longitude != null && (
                  <MapView
                    style={styles.miniMap}
                    initialRegion={{
                      latitude: selectedHike.latitude,
                      longitude: selectedHike.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker coordinate={{ latitude: selectedHike.latitude, longitude: selectedHike.longitude }} />
                  </MapView>
                )}
                <Button title="Close" onPress={() => setModalVisible(false)} color="#888" />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4ade80', textAlign: 'center', marginBottom: 20 },
  noHikesText: { color: '#888', textAlign: 'center', marginVertical: 40 },
  card: { backgroundColor: '#111', borderRadius: 10, padding: 16, marginBottom: 16 },
  info: { marginBottom: 12 },
  name: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  meta: { color: '#aaa', fontSize: 14, marginBottom: 2 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 },
  modalContent: { backgroundColor: '#111', borderRadius: 12, padding: 20 },
  modalTitle: { color: '#4ade80', fontSize: 20, marginBottom: 10, fontWeight: '600' },
  modalText: { color: '#fff', fontSize: 16, marginBottom: 6 },
  miniMap: { width: '100%', height: 150, borderRadius: 8, marginBottom: 12 },
});
