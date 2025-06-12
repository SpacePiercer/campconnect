import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, Button, StyleSheet, ScrollView, Alert, Platform, Modal, Pressable, Animated, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';

const id = uuidv4();

type Hike = {
  id: string;
  hikeName: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  time: string;
  participants: string;
  carNeeded: boolean;
  joinedUsers: string[];
  completedBy: string[];
  provisions: {id: string; owner: string; name: string; type: 'consumable' | 'tool';}[];
  drivers: { id: string; capacity: number; riders: string[] }[];
  media: { id: string; uri: string; access: 'public' | 'members' }[];
  distanceKm?: number;
  durationHours?: number;
  elevationGainM?: number;
  difficulty?: 'Easy' | 'Moderate' | 'Hard';
};

export default function CreateHikeScreen() {

  const router = useRouter(); 
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [hikeName, setHikeName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [participants, setParticipants] = useState('');
  const [carNeeded, setCarNeeded] = useState(false);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [elevationGain, setElevationGain] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy'|'Moderate'|'Hard'>('Moderate');

  const [modalVisible, setModalVisible] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  

  useEffect(() => {
    const loadHikes = async () => {
      try {
        const data = await AsyncStorage.getItem('hikes');
        if (data) {
          setHikes(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading hikes:', error);
      }
    };
    loadHikes();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('userToken')
      .then(token => {
        if (!token) {
          Alert.alert(
            'Not signed in',
            'You need to log in before creating a hike.',
            [{ text: 'Go to Login', onPress: () => router.replace('/login') }]
          );
        }
      });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('userToken')
      .then(token => { setIsAuthed(!!token); })
      .finally(() => setLoadingAuth(false));
  }, []);

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date ? new Date(date + 'T00:00:00') : new Date(),
      mode: 'date',
      is24Hour: true,
      onChange: (_event, selectedDate) => {
        if (selectedDate) {
          const formatted = selectedDate.toISOString().split('T')[0];
          setDate(formatted);
        }
      },
    });
  };

  if (loadingAuth) {
    return <ActivityIndicator />;
  }
  if (!isAuthed) {
    return null; // or a placeholder; the Alert above will have navigated away
  }

  const handleSubmit = async () => {
    const existing = await AsyncStorage.getItem('hikes');
    const list: Hike[] = existing ? JSON.parse(existing) : [];

    const newHike = {
      id: uuidv4(),
      hikeName,
      locationName,
      latitude,
      longitude,
      date,
      time,
      participants,
      carNeeded,
      joinedUsers: [],
      completedBy: [],
      provisions: [],
      drivers: [],
      media: [],
      distanceKm: parseFloat(distance) || undefined,
      durationHours: parseFloat(duration) || undefined,
      elevationGainM: parseInt(elevationGain, 10) || undefined,
      difficulty,
    };  

    if (!hikeName || !date) {
      const msg = 'Please fill out Hike Name and Date.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }

    if (!locationName && (latitude === null || longitude === null)) {
      const msg = 'Please enter a location or pick one on the map.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Invalid Location', msg);
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      const msg = 'Date format must be YYYY-MM-DD.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Invalid Date Format', msg);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const enteredDate = new Date(date + 'T00:00:00');
    enteredDate.setHours(0, 0, 0, 0);

    if (enteredDate.getTime() < today.getTime()) {
      const msg = 'Please pick today or a future date.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Date Error', msg);
      return;
    }

    if (time) {
      const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(time)) {
        const msg = 'Time must be HH:MM (24-hour format).';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Invalid Time Format', msg);
        return;
      }
    }

    if (participants) {
      const participantsNum = parseInt(participants, 10);
      if (isNaN(participantsNum) || participantsNum <= 0) {
        const msg = 'Participants must be a positive number.';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Invalid Participants Number', msg);
        return;
      }
    }

    try {
      const existing = await AsyncStorage.getItem('hikes');
      const hikes = existing ? JSON.parse(existing) : [];
      const updatedHikes = [...hikes, newHike];
      await AsyncStorage.setItem('hikes', JSON.stringify(updatedHikes));
      setHikes(updatedHikes);
    } catch (error) {
      console.error('Error saving hike:', error);
    }

    setHikeName('');
    setLocationName('');
    setLatitude(null);
    setLongitude(null);
    setDate('');
    setTime('');
    setParticipants('');
    setCarNeeded(false);

    router.push('/explore');
  };

  const handleClearAllHikes = async () => {
    try {
      await AsyncStorage.removeItem('hikes');
      setHikes([]);
      Alert.alert('Success', 'All hikes have been cleared.');
    } catch (error) {
      console.error('Error clearing hikes:', error);
    }
  };

  const handleDateChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 5 && cleaned.length <= 6) {
      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    } else if (cleaned.length >= 7) {
      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 8);
    }
    setDate(cleaned);
  };

  const handleTimeChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
    }
    setTime(cleaned);
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
    setLocationName(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
    setModalVisible(false); // Close the popup after picking
  };

  return (
    <ScrollView 
  contentContainerStyle={styles.container}
  showsVerticalScrollIndicator={false}  // hide scrollbar for clean look
  bounces={false}                       // prevent bounce effect on iOS
>
      <Text style={styles.label}>🏔️ Hike Name</Text>
      <TextInput
        style={styles.input}
        value={hikeName}
        onChangeText={setHikeName}
        placeholder="Enter hike name"
        placeholderTextColor="#ccc"
      />

      <Text style={styles.label}>📍 Location</Text>
      <TextInput
        style={styles.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="Enter location or pick from map"
        placeholderTextColor="#ccc"
      />
      <Button title="Pick from Map" onPress={() => setModalVisible(true)} />

      <Text style={styles.label}>📅 Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={handleDateChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        onPressIn={showDatePicker}
      />

      <Text style={styles.label}>⏰ Time</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={handleTimeChange}
        placeholder="HH:MM"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
      />

      <Text style={styles.label}>👥 Participants</Text>
      <TextInput
        style={styles.input}
        value={participants}
        onChangeText={setParticipants}
        keyboardType="numeric"
        placeholder="e.g., 5"
        placeholderTextColor="#ccc"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>🚗 Need Carpool?</Text>
        <Switch
          value={carNeeded}
          onValueChange={setCarNeeded}
          thumbColor={carNeeded ? '#4ade80' : '#ccc'}
        />
      </View>

      <Text style={styles.label}>📏 Distance (km)</Text>
      <TextInput
        style={styles.input}
        value={distance}
        onChangeText={setDistance}
        keyboardType="numeric"
        placeholder="e.g. 12.3"
        placeholderTextColor="#ccc"
      />

      <Text style={styles.label}>⏱️ Est. Duration (h)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
        placeholder="e.g. 4.5"
        placeholderTextColor="#ccc"
      />

      <Text style={styles.label}>🏔️ Elevation Gain (m)</Text>
      <TextInput
        style={styles.input}
        value={elevationGain}
        onChangeText={setElevationGain}
        keyboardType="numeric"
        placeholder="e.g. 950"
        placeholderTextColor="#ccc"
      />

      <Text style={styles.label}>⚡ Difficulty</Text>
      {/* could be a Picker or segmented control */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={difficulty}
          onValueChange={val => setDifficulty(val)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor="#fff"
        >
          <Picker.Item label="Easy" value="Easy" />
          <Picker.Item label="Moderate" value="Moderate" />
          <Picker.Item label="Hard" value="Hard" />
        </Picker>
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="Create Hike" onPress={handleSubmit} />
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="Clear All Hikes" onPress={handleClearAllHikes} />
      </View>

      {/* MAP Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 49.2827,
            longitude: -123.1207,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
          onPress={handleMapPress}
        >
          {latitude && longitude && (
            <Marker coordinate={{ latitude, longitude }}>
              <Animated.View style={{ opacity: 0.8, transform: [{ scale: 1.2 }] }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#4ade80',
                    borderColor: '#fff',
                    borderWidth: 2,
                  }}
                />
              </Animated.View>
            </Marker>
          )}
        </MapView>


          <Pressable
            style={{
              backgroundColor: '#4ade80',
              padding: 10,
              margin: 20,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,        // <-- THIS makes it fill only what's needed
    justifyContent: 'flex-start', // start from top
    padding: 20,
    backgroundColor: '#000',
  },  
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    marginBottom: 12,
  },
  pickerContainer: {
  backgroundColor: '#222',  // dark grey shell behind the native picker
  borderRadius: 6,          // match your input corners
  marginBottom: 20,         // give it breathing room
},
picker: {
  height: 50,               // tall enough to tap easily
  color: '#fff',            // make the selected text white
},
pickerItem: {
  color: '#fff',            // ensure dropdown options render in white
},
});

