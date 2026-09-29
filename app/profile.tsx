// app/profile.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [emailText, setEmail] = useState('');
  const [lowerText, setLowerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Load existing values from storage
  const loadProfile = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedLower = await AsyncStorage.getItem('userLowerText');
      if (storedEmail !== null) setEmail(storedEmail);
      if (storedLower !== null) setLowerText(storedLower);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userEmail', emailText);
      await AsyncStorage.setItem('userLowerText', lowerText);
      Alert.alert('Success', 'Profile saved.');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#888" />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={emailText}
        onChangeText={setEmail}
        editable={isEditing}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Lower Text:</Text>
      <TextInput
        style={styles.input}
        value={lowerText}
        onChangeText={setLowerText}
        editable={isEditing}
      />
      {isEditing ? (
        <Button title="Save" onPress={saveProfile} />
      ) : (
        <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  },
  label: {
    color: '#fff',
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
});
