import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Button,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Hike } from '@/app/(context)/HikeContext';

export default function ExploreScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [selectedHike, setSelectedHike] = useState<Hike | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load all hikes
  const loadHikes = async () => {
    try {
      const data = await AsyncStorage.getItem('hikes');
      setHikes(data ? JSON.parse(data) : []);
    } catch (err) {
      console.error('Error loading hikes:', err);
    }
  };

  // Fetch userId and hikes when screen focuses
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('userToken')
        .then(token => setUserId(token))
        .catch(console.error)
        .finally(loadHikes);
    }, [])
  );

  // Join/Leave handlers use userId
  const handleJoin = async (hike: Hike) => {
    if (!userId) {
      Alert.alert('Not signed in', 'Please log in to join a hike.');
      return;
    }
    try {
      const stored = await AsyncStorage.getItem('hikes');
      if (!stored) return;
      const all = JSON.parse(stored) as Hike[];
      const idx = all.findIndex(h => h.id === hike.id);
      if (idx === -1) return;
      const target = all[idx];
      const capacity = parseInt(target.participants, 10) || 0;
      if (target.joinedUsers.includes(userId)) return;
      if (target.joinedUsers.length >= capacity) {
        Alert.alert('Full', 'This hike is already full.');
        return;
      }
      target.joinedUsers.push(userId);
      await AsyncStorage.setItem('hikes', JSON.stringify(all));
      loadHikes();
    } catch (err) {
      console.error('Error joining hike:', err);
    }
  };

  const handleLeave = async (hike: Hike) => {
    if (!userId) return;
    try {
      const stored = await AsyncStorage.getItem('hikes');
      if (!stored) return;
      const all = JSON.parse(stored) as Hike[];
      const idx = all.findIndex(h => h.id === hike.id);
      if (idx === -1) return;
      const target = all[idx];
      target.joinedUsers = target.joinedUsers.filter(u => u !== userId);
      await AsyncStorage.setItem('hikes', JSON.stringify(all));
      loadHikes();
    } catch (err) {
      console.error('Error leaving hike:', err);
    }
  };

  // Filter out completed hikes for this user
  const displayHikes = hikes.filter(
    h => !h.completedBy.includes(userId || '')
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explore Hikes</Text>

      {displayHikes.length > 0 ? (
        displayHikes.map(hike => {
          const joined = userId != null && hike.joinedUsers.includes(userId);
          const capacity = parseInt(hike.participants, 10) || 0;
          const full = hike.joinedUsers.length >= capacity;
          return (
            <View key={hike.id} style={styles.card}>
              <Pressable
                style={styles.info}
                onPress={() => router.push(`/hike/${hike.id}`)}
              >
                <Text style={styles.name}>{hike.hikeName}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {hike.locationName} • {hike.date}
                </Text>
                <Text style={styles.meta}>
                  👥 {hike.joinedUsers.length}/{capacity}
                </Text>
              </Pressable>

              {joined ? (
                <Button
                  title="Leave"
                  onPress={() => handleLeave(hike)}
                  color="orange"
                />
              ) : (
                <Button
                  title={full ? 'Full' : 'Join'}
                  onPress={() => handleJoin(hike)}
                  disabled={full}
                />
              )}
            </View>
          );
        })
      ) : (
        <Text style={styles.noHikes}>No hikes available</Text>
      )}

      {/* Details Modal (optional) */}
      <Modal visible={modalVisible} transparent animationType="slide">
        {/* Placeholder if needed */}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  scrollContent: { 
    padding: 16 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ade80',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  info: {
    marginBottom: 12,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    color: '#aaa',
    fontSize: 14,
  },
  noHikes: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});
