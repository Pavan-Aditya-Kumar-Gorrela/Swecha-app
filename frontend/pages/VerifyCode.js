import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from './api';

export default function VerifyCode({ navigation, route }) {
  const [code, setCode] = useState('');
  const email = route.params?.email || ''; // Get email from Signup

  const handleVerifyCode = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'No email provided. Please sign up again.');
        navigation.navigate('Signup');
        return;
      }
      if (!code) {
        Alert.alert('Error', 'Please enter the verification code.');
        return;
      }
      const response = await apiService.verifyVerificationCode(email, code);
      console.log('Verify code response:', response); // Debug: Log API response
      Alert.alert('Success', 'Email verified successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Verify code error:', error); // Debug: Log detailed error
      if (error.message.includes('Invalid code') || error.status === 400) {
        Alert.alert('Error', 'Invalid verification code. Please try again or resend the code.');
      } else {
        Alert.alert('Error', error.message || 'Verification failed. Please try again.');
      }
    }
  };

  const handleResendCode = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'No email provided. Please sign up again.');
        navigation.navigate('Signup');
        return;
      }
      const response = await apiService.sendVerificationCode(email);
      console.log('Resend verification code response:', response); // Debug: Log API response
      Alert.alert('Success', 'Verification code resent! Please check your email.');
    } catch (error) {
      console.error('Resend verification code error:', error); // Debug: Log detailed error
      Alert.alert('Error', error.message || 'Failed to resend verification code. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#290011', '#000']} style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>

      <Text style={styles.infoText}>
        A verification code has been sent to {email || 'your email'}.
      </Text>

      <TextInput
        placeholder="Enter verification code"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
        <Text style={styles.buttonText}>Verify Code</Text>
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        Didn't receive the code?{' '}
        <Text style={styles.link} onPress={handleResendCode}>
          Resend Code
        </Text>
      </Text>

      <Text style={styles.bottomText}>
        Back to{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Sign Up
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