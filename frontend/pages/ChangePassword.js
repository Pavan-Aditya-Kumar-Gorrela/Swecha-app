import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from './api';

export default function ChangePassword({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email || '');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChangePassword = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter an email address.');
        return;
      }
      if (!isValidEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
      }
      if (!resetToken) {
        Alert.alert('Error', 'Please enter the reset token.');
        return;
      }
      if (!newPassword) {
        Alert.alert('Error', 'Please enter a new password.');
        return;
      }
      if (newPassword.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters long.');
        return;
      }
      const response = await apiService.changePassword(email, resetToken, newPassword);
      console.log('Change password response:', response); // Debug: Log API response
      Alert.alert('Success', 'Password changed successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Change password error:', error); // Debug: Log detailed error
      if (error.message.includes('Invalid token') || error.status === 400) {
        Alert.alert('Error', 'Invalid reset token. Please request a new one.');
      } else if (error.message.includes('User not found') || error.status === 404) {
        Alert.alert('Error', 'No account found with this email.');
      } else {
        Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
      }
    }
  };

  return (
    <LinearGradient colors={['#290011', '#000']} style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <Text style={styles.infoText}>
        Enter the reset token sent to your email and your new password.
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

      <TextInput
        placeholder="Enter reset token"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={resetToken}
        onChangeText={setResetToken}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Enter new password"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
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