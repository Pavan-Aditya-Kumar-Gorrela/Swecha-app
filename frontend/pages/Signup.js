import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from './api';

export default function Signup({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    try {
      // Validate inputs
      if (!email && !password) {
        Alert.alert('Error', 'Please enter both email and password.');
        return;
      }
      if (!email) {
        Alert.alert('Error', 'Please enter an email address.');
        return;
      }
      if (!password) {
        Alert.alert('Error', 'Please enter a password.');
        return;
      }
      if (!isValidEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
      }

      const response = await apiService.signup(email, password);
      console.log('Signup response:', response); // Debug: Log API response
      Alert.alert('Success', 'Signup successful! Please check your email for verification.');
      navigation.navigate('VerifyCode', { email });
    } catch (error) {
      console.error('Signup error:', error); // Debug: Log detailed error
      // Handle specific error cases
      if (error.message.includes('User already exists') || error.status === 409) {
        Alert.alert('Error', 'User already exists. Please try logging in or use a different email.');
      } else {
        Alert.alert('Error', error.message || 'Signup failed. Please try again.');
      }
    }
  };

  return (
    <LinearGradient colors={['#290011', '#000']} style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        placeholderTextColor="#aaa"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.checkboxContainer}>
        <Text style={styles.checkbox}>☑</Text>
        <Text style={styles.terms}>
          I agree to the <Text style={styles.link}>Terms & Conditions</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.or}>or</Text>

      <Text style={styles.bottomText}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Sign in
        </Text>
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  input: { backgroundColor: '#333', color: '#fff', borderRadius: 10, padding: 15, marginBottom: 20 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { color: '#ff0080', marginRight: 10 },
  terms: { color: '#ccc', flex: 1 },
  link: { color: '#ff0080', fontWeight: 'bold' },
  button: { backgroundColor: '#ff0080', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  or: { color: '#999', textAlign: 'center', marginVertical: 10 },
  bottomText: { color: '#ccc', textAlign: 'center', marginTop: 30 },
});