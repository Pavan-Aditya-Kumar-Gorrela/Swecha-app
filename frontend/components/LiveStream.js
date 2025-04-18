import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Platform } from 'react-native';
import * as Camera from 'expo-camera'; // Ensure correct import
import io from 'socket.io-client';

export default function LiveVideoStream() {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    (async () => {
      console.log('Requesting camera permission...');
      if (Platform.OS === 'web') {
        console.log('Camera not supported on web. Skipping permission request.');
        setHasPermission(false); // Disable camera on web
        return;
      }

      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('Permission status:', status);
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant camera permission to use this feature.');
      } else {
        console.log('Camera permission granted');
      }

      socket.current = io('http://192.168.0.138:3000'); // Replace with your server URL
      socket.current.on('stream-ready', ({ playbackUrl }) => {
        setStreamUrl(playbackUrl);
        shareWithEmergencyContacts(playbackUrl);
      });

      socket.current.on('connect_error', (error) => {
        console.log('Socket connection error:', error.message); // Debug invalid credentials
      });
    })();

    return () => socket.current?.disconnect();
  }, []);

  const startStream = async () => {
    if (cameraRef.current && hasPermission) {
      socket.current.emit('create-room');
      const rtpParameters = { codecs: [{ mimeType: 'video/VP8', payloadType: 100, clockRate: 90000 }] };
      socket.current.emit('produce', { rtpParameters, kind: 'video' });
    } else {
      Alert.alert('Error', 'Camera permission not granted or camera unavailable');
    }
  };

  const shareWithEmergencyContacts = (url) => {
    const emergencyContacts = ['+1234567890', '+0987654321']; // Hardcoded for demo
    emergencyContacts.forEach(contact => {
      Linking.openURL(`sms:${contact}?body=Emergency Live Stream: ${url}`);
    });
    Alert.alert('Shared', 'Stream link sent to emergency contacts');
  };

  return (
    <View style={styles.container}>
      {hasPermission && Platform.OS !== 'web' ? (
        <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants.Type.front} />
      ) : (
        <Text>{Platform.OS === 'web' ? 'Camera not supported on web' : 'Waiting for camera permission...'}</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={startStream}>
        <Text>Start Live Stream</Text>
      </TouchableOpacity>
      {streamUrl && <Text style={styles.text}>Stream Link: {streamUrl}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { width: '80%', height: 300 },
  button: { backgroundColor: 'white', padding: 10, borderRadius: 5, marginTop: 10 },
  text: { marginTop: 10, color: 'blue' },
});