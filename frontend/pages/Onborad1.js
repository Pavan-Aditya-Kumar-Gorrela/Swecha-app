import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function Onboard1({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/welcome.png')} style={styles.image} />
      <Text style={styles.title}>Welcome to Swecha</Text>
      <Text style={styles.subtitle}>Your trusted safety companion for a secure and confident journey</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Screen3')}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  image: { width: 250, height: 250, resizeMode: 'contain' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  subtitle: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#ff007f', padding: 15, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});