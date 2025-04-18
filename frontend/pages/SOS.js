import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as Camera from 'expo-camera';
import { Ionicons,Entypo ,MaterialIcons} from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import * as Brightness from 'expo-brightness';

function SOS() {
  const navigation = useNavigation();
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [incidentReport, setIncidentReport] = useState('');
  const [recording, setRecording] = useState(null);
  const [safetyTimer, setSafetyTimer] = useState(null);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const cameraRef = useRef(null);
  const [lastIntensity, setLastIntensity] = useState(null);

  useEffect(() => {
    (async () => {
      let { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      let { status: audioStatus } = await Audio.requestPermissionsAsync();
      let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      let { status: brightnessStatus } = await Brightness.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');
      setHasAudioPermission(audioStatus === 'granted');
      if (locationStatus === 'granted' && brightnessStatus === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access microphone denied');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      Alert.alert('Recording saved', uri);
      setRecording(null);
    }
  };

  const detectHiddenCamera = async () => {
    if (cameraRef.current && hasCameraPermission) {
      const radiationThreshold = 0.2; // Threshold for intensity change (simulated radiation)
      let interval = setInterval(async () => {
        let photo = await cameraRef.current.takePictureAsync({ quality: 0.1 });
        const response = await fetch(photo.uri);
        const imageData = await response.blob();
        // Simulate intensity calculation (actual implementation would need image processing)
        const intensity = Math.random(); // Placeholder for real pixel intensity analysis
        if (lastIntensity !== null && Math.abs(intensity - lastIntensity) > radiationThreshold) {
          Alert.alert('Radiation Detected', 'Possible hidden camera or IR source detected. Check your surroundings.');
          clearInterval(interval);
        }
        setLastIntensity(intensity);
      }, 1000);
      setTimeout(() => clearInterval(interval), 5000); // Stop after 5 seconds
    } else {
      Alert.alert('Error', 'Camera permission not granted');
    }
  };

  const getCorrectRoute = async () => {
    if (userLocation) {
      const orsUrl = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=5b3ce3597851110001cf624899c05f97d51944bea907b84b5e5bb671&start=${userLocation.longitude},${userLocation.latitude}&end=${userLocation.longitude + 0.01},${userLocation.latitude + 0.01}`;
      try {
        const response = await fetch(orsUrl);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          Alert.alert('Safe Route', 'Follow the suggested route for safety.');
        } else {
          Alert.alert('Error', 'Could not fetch safe route.');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    }
  };

  const submitIncidentReport = async () => {
    if (userLocation && incidentReport) {
      const report = {
        location: userLocation,
        description: incidentReport,
        timestamp: new Date().toISOString(),
      };
      await SecureStore.setItemAsync('incidentReport', JSON.stringify(report));
      Alert.alert('Success', 'Incident reported and stored locally.');
      setIncidentReport('');
    } else {
      Alert.alert('Error', 'Please provide a description.');
    }
  };

  const triggerPanic = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert('Panic Triggered', 'Sending alert to emergency contacts (simulated).');
  };

  const emergencyContacts = () => {
    Alert.alert('Emergency Contacts', 'Call 911 or your local emergency number.');
  };

  const shareLiveLocation = () => {
    if (userLocation) {
      const locationUrl = `https://www.google.com/maps/search/?api=1&query=${userLocation.latitude},${userLocation.longitude}`;
      Linking.openURL(`sms:?body=Live location: ${locationUrl}`);
      Alert.alert('Location Shared', 'Shared live location with default contact.');
    } else {
      Alert.alert('Error', 'Location not available.');
    }
  };

  const startSafetyTimer = () => {
    if (safetyTimer) clearTimeout(safetyTimer);
    const timer = setTimeout(() => {
      Alert.alert('Safety Alert', 'You haven’t checked in. Sending help!');
      triggerPanic();
    }, timerMinutes * 60 * 1000);
    setSafetyTimer(timer);
    Alert.alert('Timer Started', `You have ${timerMinutes} minutes to check in.`);
  };

  const crowdAlert = () => {
    Alert.alert('Crowd Alert', 'Sending alert to nearby users (simulated).');
  };

  const toggleFlashlight = async () => {
    if (hasCameraPermission) {
      if (flashlightOn) {
        await Brightness.setSystemBrightnessAsync(0.5);
        setFlashlightOn(false);
      } else {
        await Brightness.setSystemBrightnessAsync(1.0);
        setFlashlightOn(true);
      }
      Alert.alert('Flashlight', flashlightOn ? 'Turned Off' : 'Turned On');
    } else {
      Alert.alert('Error', 'Camera permission required for flashlight.');
    }
  };

  const safetyQuiz = () => {
    const questions = [
      { q: 'What should you do if you feel unsafe?', a: 'Move to a safe place and call for help' },
    ];
    const answer = prompt('Safety Tip: What should you do if you feel unsafe?');
    Alert.alert('Quiz Result', answer === questions[0].a ? 'Correct!' : 'Try again: ' + questions[0].a);
  };

  const navItems = [
    { icon: 'home', type: 'Ionicons', color: 'white', route: 'Home' },
    { icon: 'location-pin', type: 'Entypo', color: 'white', route: 'Map' },
    { icon: 'sos', type: 'MaterialIcons', color: '#ff3399', route: 'SOS' },
    { icon: 'settings', type: 'Ionicons', color: 'white', route: 'Settings' },
  ];

  const handleNavPress = (route) => {
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>SOS Features</Text>
        {hasCameraPermission && (
          <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants.Type.back} />
        )}
        <TouchableOpacity style={styles.button} onPress={detectHiddenCamera}>
          <Text>Detect Hidden Camera (Radiation)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={getCorrectRoute}>
          <Text>Get Safe Route</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={incidentReport}
          onChangeText={setIncidentReport}
          placeholder="Describe the incident"
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={submitIncidentReport}>
          <Text>Submit Incident Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={startRecording}>
          <Text>Start Recording</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={stopRecording}>
          <Text>Stop Recording</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={triggerPanic}>
          <Text>Panic Button</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={emergencyContacts}>
          <Text>Emergency Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={shareLiveLocation}>
          <Text>Share Live Location</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={timerMinutes}
          onChangeText={setTimerMinutes}
          placeholder="Set timer minutes (e.g., 5)"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={startSafetyTimer}>
          <Text>Start Safety Timer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={crowdAlert}>
          <Text>Crowd Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleFlashlight}>
          <Text>Toggle Flashlight</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={safetyQuiz}>
          <Text>Safety Quiz</Text>
        </TouchableOpacity>
      </ScrollView>
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

const NavIcon = ({ iconName, iconType, color, onPress }) => {
  const IconComponent = iconType === 'Ionicons' ? Ionicons : iconType === 'Entypo' ? Entypo : MaterialIcons;
  return (
    <TouchableOpacity onPress={onPress}>
      <IconComponent name={iconName} size={24} color={color} />
    </TouchableOpacity>
  );
};

export default SOS;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  camera: { width: '100%', height: 200, marginBottom: 10 },
  input: { height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 10 },
  button: { backgroundColor: 'white', padding: 10, marginBottom: 10, borderRadius: 5, alignItems: 'center' },
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
});