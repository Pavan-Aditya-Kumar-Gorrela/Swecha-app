import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function SafeRoute() {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }
    })();
  }, []);

  const getRoute = async () => {
    if (userLocation) {
      const orsUrl = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=5b3ce3597851110001cf624899c05f97d51944bea907b84b5e5bb671&start=${userLocation.longitude},${userLocation.latitude}&end=${userLocation.longitude + 0.01},${userLocation.latitude + 0.01}`;
      try {
        const response = await fetch(orsUrl);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          Alert.alert('Safe Route', 'Route fetched successfully. Follow the suggested path.');
        } else {
          Alert.alert('Error', 'Could not fetch safe route.');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    } else {
      Alert.alert('Error', 'Location not available.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Get your safe walking route here.</Text>
      <TouchableOpacity style={styles.button} onPress={getRoute}>
        <Text>Get Route</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: 'white', padding: 10, borderRadius: 5 },
});