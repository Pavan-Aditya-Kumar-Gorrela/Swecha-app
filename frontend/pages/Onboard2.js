import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function Onboard2({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/empower.png')} style={styles.image} />
      <Text style={styles.title}>Why Swecha?</Text>
      <Text style={styles.subtitle}>Stay empowered with instant alerts, community support, and a simple SOS feature.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Screen4')}> {/* Replace with Home */}
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
