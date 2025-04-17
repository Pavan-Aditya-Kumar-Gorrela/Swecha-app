import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Signup({ navigation }) {
  return (
    <LinearGradient colors={['#290011', '#000']} style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      <TextInput placeholder="Enter your email" placeholderTextColor="#aaa" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry placeholderTextColor="#aaa" style={styles.input} />

      <View style={styles.checkboxContainer}>
        <Text style={styles.checkbox}>☑</Text>
        <Text style={styles.terms}>
          I agree to the <Text style={styles.link}>Terms & Conditions</Text> and <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.or}>or</Text>

      <TouchableOpacity style={styles.providerBtn}>
        <Text style={styles.providerText}>🔍 Sign up with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.providerBtn}>
        <Text style={styles.providerText}> Sign up with Apple</Text>
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        Already have an account? <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Sign in</Text>
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
  providerBtn: { backgroundColor: '#111', borderColor: '#444', borderWidth: 1, borderRadius: 30, padding: 15, marginBottom: 10 },
  providerText: { color: '#fff', textAlign: 'center' },
  bottomText: { color: '#ccc', textAlign: 'center', marginTop: 30 }
});
