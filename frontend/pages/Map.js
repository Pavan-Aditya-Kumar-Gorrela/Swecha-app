import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import { Linking } from 'react-native';

function Map() {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState(null);
  const [safeZones, setSafeZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      const fetchSafeZones = async () => {
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"~"police|hospital|public_services"](around:5000,${location.coords.latitude},${location.coords.longitude}););out body;`;
        try {
          const response = await fetch(overpassUrl);
          const text = await response.text();
          if (!response.ok) {
            console.error('Overpass API Error:', response.status, text);
            return;
          }
          const data = JSON.parse(text);
          const zones = data.elements.map(element => ({
            id: element.id,
            name: element.tags.name || `${element.tags.amenity} ${element.id}`,
            coordinate: { latitude: element.lat, longitude: element.lon },
            type: element.tags.amenity,
            phone: element.tags['contact:phone'] || element.tags.phone || null,
            email: element.tags['contact:email'] || null,
          }));
          setSafeZones(zones);
        } catch (error) {
          console.error('Error fetching safe zones:', error.message, error.stack);
          if (error instanceof SyntaxError) {
            console.log('Received text:', text);
          }
        }
      };
      fetchSafeZones();
      const interval = setInterval(fetchSafeZones, 10000);
      return () => clearInterval(interval);
    })();
  }, []);

  const NavIcon = ({ iconName, iconType, color, onPress }) => {
    const IconComponent = iconType === 'Ionicons' ? Ionicons : iconType === 'Entypo' ? Entypo : MaterialIcons;
    return (
      <TouchableOpacity onPress={onPress}>
        <IconComponent name={iconName} size={24} color={color} />
      </TouchableOpacity>
    );
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 6371;
    const dLat = deg2rad(coord2.latitude - coord1.latitude);
    const dLon = deg2rad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(coord1.latitude)) * Math.cos(deg2rad(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const getWalkingTime = (distance) => {
    const speed = 5;
    const timeInMinutes = Math.round((distance / speed) * 60);
    return timeInMinutes;
  };

  const handleMarkerPress = async (zone) => {
    if (userLocation) {
      const distance = calculateDistance(userLocation, zone.coordinate);
      const time = getWalkingTime(distance);
      setSelectedZone({ ...zone, distance, time });

      const orsUrl = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=5b3ce3597851110001cf624899c05f97d51944bea907b84b5e5bb671&start=${userLocation.longitude},${userLocation.latitude}&end=${zone.coordinate.longitude},${zone.coordinate.latitude}`;
      try {
        const response = await fetch(orsUrl);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
          setRouteCoordinates(coords);
        } else {
          console.error('No route found:', data);
        }
      } catch (error) {
        console.error('Error fetching directions:', error);
      }
    }
  };

  const handleMessage = async () => {
    if (!selectedZone) return;

    const email = selectedZone.email;
    const phone = selectedZone.phone;

    if (email) {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        MailComposer.composeAsync({
          recipients: [email],
          subject: `Help from ${userLocation.latitude}, ${userLocation.longitude}`,
          body: 'I need assistance at my current location.',
        });
      } else {
        Alert.alert('Error', 'Email is not available on this device.');
      }
    } else if (phone) {
      Linking.openURL(`sms:${phone}?body=I need assistance at ${userLocation.latitude}, ${userLocation.longitude}`);
    } else {
      Alert.alert('No Contact', 'No email or phone number available. Please contact manually.');
    }
  };

  const handleCall = () => {
    if (!selectedZone) return;

    const phone = selectedZone.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No Contact', 'No phone number available for this location.');
    }
  };

  const navItems = [
    { icon: 'home', type: 'Ionicons', color: 'white', route: 'Home' },
    { icon: 'location-pin', type: 'Entypo', color: '#ff3399', route: 'Map' },
    { icon: 'sos', type: 'MaterialIcons', color: 'white', route: 'SOS' },
    { icon: 'settings', type: 'Ionicons', color: 'white', route: 'Settings' },
  ];

  const handleNavPress = (route) => {
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      {userLocation ? (
        <MapView
          style={styles.map}
          initialRegion={userLocation}
          showsUserLocation={true}
        >
          {safeZones.map((zone) => (
            <Marker
              key={zone.id}
              coordinate={zone.coordinate}
              onPress={() => handleMarkerPress(zone)}
              pinColor="green"
              title={zone.name}
            />
          ))}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              pinColor="red"
              title="Your Location"
            />
          )}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#0000FF"
              strokeWidth={2}
            />
          )}
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
      {selectedZone && (
        <View style={styles.popup}>
          <Text style={styles.name}>{selectedZone.name}</Text>
          <Text>{`${selectedZone.time} min (${selectedZone.distance.toFixed(2)} km)`}</Text>
          <Text style={styles.name}>Fastest walking route available</Text>
          <ScrollView style={styles.directions}>
            {routeCoordinates.map((coord, index) => (
              <Text key={index} style={styles.popupName}>{`Step ${index + 1}: Lat ${coord.latitude.toFixed(6)}, Lon ${coord.longitude.toFixed(6)}`}</Text>
            ))}
          </ScrollView>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={handleMessage}>
              <Text>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleCall}>
              <Text>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.bottomNav}>
        {navItems.map((item, index) => (
          <NavIcon
            key={index}
            iconName={item.icon}
            iconType={item.type}
            color={item.color}
            onPress={() => handleNavPress(item.route)}
          />
        ))}
      </View>
    </View>
  );
}

export default Map;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  popup: {
    position: 'absolute',
    color: 'white',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  popupName: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  name: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  buttons: { flexDirection: 'row', marginTop: 10 },
  button: { backgroundColor: 'white', padding: 10, marginHorizontal: 5, borderRadius: 5 },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    backgroundColor: '#2a002a',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
  },
  directions: { maxHeight: 150, width: '100%' },
});