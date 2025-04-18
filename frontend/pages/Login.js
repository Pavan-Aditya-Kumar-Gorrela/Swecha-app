import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from './api';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await apiService.login(email, password);
      Alert.alert('Success', 'Login successful!');
      console.log('Login response:', response);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <LinearGradient colors={['#290011', '#000']} style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        placeholderTextColor="#aaa"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity>
        <Text style={styles.forgot} onPress={() => navigation.navigate('forgot')}>
          Forget Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <Text style={styles.or}>or</Text>

      <Text style={styles.bottomText}>
        Don't have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Sign up
        </Text>
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  input: { backgroundColor: '#333', color: '#fff', borderRadius: 10, padding: 15, marginBottom: 20 },
  forgot: { color: '#ff0080', textAlign: 'right', marginBottom: 20 },
  button: { backgroundColor: '#ff0080', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  or: { color: '#999', textAlign: 'center', marginVertical: 10 },
  bottomText: { color: '#ccc', textAlign: 'center', marginTop: 30 },
  link: { color: '#ff0080', fontWeight: 'bold' },
});