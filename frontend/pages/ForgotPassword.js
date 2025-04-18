import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from './api';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter an email address.');
        return;
      }
      if (!isValidEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
      }
      const response = await apiService.forgotPassword(email);
      console.log('Forgot password response:', response); // Debug: Log API response
      Alert.alert('Success', 'Password reset email sent! Please check your email.');
      navigation.navigate('ChangePassword', { email });
    } catch (error) {
      console.error('Forgot password error:', error); // Debug: Log detailed error
      if (error.message.includes('User not found') || error.status === 404) {
        Alert.alert('Error', 'No account found with this email. Please sign up.');
      } else {
        Alert.alert('Error', error.message || 'Failed to send reset email. Please try again.');
      }
    }
  };

  return (
    <LinearGradient colors={['#290011', '#000']} style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      <Text style={styles.infoText}>
        Enter your email to receive a password reset link.
      </Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Send Reset Email</Text>
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        Back to{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Sign In
        </Text>
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#fff', marginBottom: 30 },
  infoText: { color: '#ccc', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#333', color: '#fff', borderRadius: 10, padding: 15, marginBottom: 20 },
  button: { backgroundColor: '#ff0080', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  bottomText: { color: '#ccc', textAlign: 'center', marginTop: 15 },
  link: { color: '#ff0080', fontWeight: 'bold' },
});