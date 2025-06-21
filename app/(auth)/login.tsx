// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Pressable } from 'react-native'; // Import Pressable
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const goToSignUp = () => {
    router.push('/(auth)/signup'); // Navigate to the signup screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonSpacing}>
        <Button title="Sign In" onPress={handleLogin} color="#4ade80" />
      </View>
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <Pressable onPress={goToSignUp}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonSpacing: {
    marginBottom: 20,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#ccc',
    fontSize: 16,
  },
  signUpLink: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: 'bold',
  },
});