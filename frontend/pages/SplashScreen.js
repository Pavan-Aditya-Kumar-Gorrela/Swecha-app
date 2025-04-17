import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  setTimeout(() => navigation.replace('Screen2'), 2000);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Swecha</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' },
  logo: { width: 100, height: 100 },
  title: { color: 'black', fontSize: 30, marginTop: 20 },
});
