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
  const [emailText, setEmailText] = useState('');
  const [lowerText, setLowerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Load existing values from storage
  const loadProfile = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedLower = await AsyncStorage.getItem('userLowerText');
      if (storedEmail !== null) setEmailText(storedEmail);
      if (storedLower !== null) setLowerText(storedLower);
    } catch (err) {
      console.error('Failed to load profile fields', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Save changes and exit edit mode
  const handleSave = async () => {
    try {
      await AsyncStorage.multiSet([
        ['userEmail', emailText],
        ['userLowerText', lowerText],
      ]);
      Alert.alert('Profile saved!');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile fields', err);
      Alert.alert('Error', 'Could not save profile');
    }
  };

  // Discard changes and reload original values
  const handleCancel = async () => {
    setLoading(true);
    await loadProfile();
    setIsEditing(false);
  };

  // Log out user
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userId']);
    router.replace('/login');
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  return (
    <View style={styles.container}>
      {!isEditing ? (
        <>
          <Text style={styles.label}>Email Display</Text>
          <Text style={styles.textValue}>{emailText}</Text>
          <Text style={styles.label}>Lower Text</Text>
          <Text style={styles.textValue}>{lowerText}</Text>
        </>
      ) : (
        <>
          <Text style={styles.label}>Email Display</Text>
          <TextInput
            style={styles.input}
            placeholder="Your email"
            placeholderTextColor="#888"
            value={emailText}
            onChangeText={setEmailText}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Lower Text</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Enter lower text"
            placeholderTextColor="#888"
            value={lowerText}
            onChangeText={setLowerText}
            multiline
          />
        </>
      )}

      {isEditing ? (
        <View style={styles.buttonRow}>
          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" color="#888" onPress={handleCancel} />
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
          <Button title="Log Out" color="#FF6B6B" onPress={handleLogout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A8E636',
    marginBottom: 6,
  },
  textValue: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#A8E636',
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
