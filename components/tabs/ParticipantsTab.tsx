// components/tabs/ParticipantsTab.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHike } from '../../app/(context)/HikeContext';
import { getUserById } from '../../services/userService';

export default function ParticipantsTab() {
  const { hike, updateHike } = useHike();

  // Cache of initials for each userId
  const [initialsMap, setInitialsMap] = useState<Record<string, string>>({});

  if (!hike) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading participants…</Text>
      </View>
    );
  }

  // Determine display blocks (drivers or group)
  const blocks =
    hike.drivers && hike.drivers.length > 0
      ? hike.drivers
      : [
          {
            id: 'group',
            capacity: parseInt(hike.participants, 10),
            riders: hike.joinedUsers
          }
        ];

  // Fetch and cache initials for each rider when hike changes
  useEffect(() => {
    blocks.forEach(block => {
      block.riders.forEach(async uid => {
        if (!initialsMap[uid]) {
          try {
            const { username, email } = await getUserById(uid);
            const name = username ?? email ?? uid;
            setInitialsMap(prev => ({
              ...prev,
              [uid]: name.charAt(0).toUpperCase()
            }));
          } catch {
            setInitialsMap(prev => ({
              ...prev,
              [uid]: uid.charAt(0).toUpperCase()
            }));
          }
        }
      });
    });
  }, [hike]);

  // Join handler remains unchanged
  const handleJoin = async (blockId: string) => {
  const userId = await AsyncStorage.getItem('userId'); // ✅ use UID
  if (!userId) {
    return Alert.alert('Not signed in', 'Please log in to join this hike.');
  }

  if (hike.drivers && hike.drivers.length > 0) {
    const alreadyIn = hike.drivers.some(d => d.riders.includes(userId));
    if (alreadyIn) return; // prevent double joining

    const updatedDrivers = hike.drivers.map(d =>
      d.id === blockId
        ? { ...d, riders: [...d.riders, userId] }
        : d
    );
    await updateHike({ drivers: updatedDrivers });
  } else {
    if (hike.joinedUsers.includes(userId)) return;
    await updateHike({ joinedUsers: [...hike.joinedUsers, userId] });
  }
};


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {blocks.map((block, idx) => {
        const emptySeats = block.capacity - block.riders.length;
        return (
          <View key={block.id} style={styles.block}>
            <Text style={styles.headerText}>
              {block.id === 'group'
                ? 'Group'
                : `Car ${idx + 1}`} • {block.riders.length}/{block.capacity}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarsContainer}
            >
              {block.riders.map(uid => (
                <Pressable
                  key={uid}
                  onPress={() => {
                    /* TODO: show user profile */
                  }}
                  style={({ pressed }) => [
                    styles.avatar,
                    pressed && styles.avatarPressed
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {initialsMap[uid] ?? uid.charAt(0).toUpperCase()}
                  </Text>
                  {hike.drivers.some(d => d.id === uid) && (
                    <View style={styles.driverIcon}>
                      <Ionicons name="car" size={12} color="#4ade80" />
                    </View>
                  )}
                </Pressable>
              ))}
              {emptySeats > 0 &&
                Array.from({ length: emptySeats }).map((_, i) => (
                  <Pressable
                    key={`empty-${i}`}
                    onPress={() => handleJoin(block.id)}
                    style={({ pressed }) => [
                      styles.emptyAvatar,
                      pressed && styles.avatarPressed
                    ]}
                  >
                    <Ionicons name="add" size={20} color="#4ade80" />
                  </Pressable>
                ))}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  contentContainer: {
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#aaa',
    marginTop: 8
  },
  block: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  headerText: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8
  },
  avatarsContainer: {
    alignItems: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  avatarPressed: {
    opacity: 0.6
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  emptyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  driverIcon: {
    position: 'absolute',
    top: 2,
    left: 2
  }
});
