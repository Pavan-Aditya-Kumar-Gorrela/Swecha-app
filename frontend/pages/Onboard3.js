import React from 'react';
import { View, Image,Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Onboard3({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/download.png')} style={styles.image} />
      <Text style={styles.title}>Join Our Community</Text>
            <Text style={styles.subtitle}>Our Goal is to protect and  support you no matter where you are.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  image: { width: '60%', height: '60%', resizeMode: 'contain' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  subtitle: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#ff007f', padding: 15, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
 
});