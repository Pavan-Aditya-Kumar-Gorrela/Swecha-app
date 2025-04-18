import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Camera from 'expo-camera';

export default function HiddenCamera() {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [lastIntensity, setLastIntensity] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const detectHiddenCamera = async () => {
    if (cameraRef.current && hasPermission) {
      const radiationThreshold = 0.2;
      let interval = setInterval(async () => {
        let photo = await cameraRef.current.takePictureAsync({ quality: 0.1 });
        const intensity = Math.random(); // Simulated intensity
        if (lastIntensity !== null && Math.abs(intensity - lastIntensity) > radiationThreshold) {
          Alert.alert('Radiation Detected', 'Possible hidden camera or IR source detected.');
          clearInterval(interval);
        }
        setLastIntensity(intensity);
      }, 1000);
      setTimeout(() => clearInterval(interval), 5000);
    } else {
      Alert.alert('Error', 'Camera permission not granted');
    }
  };

  return (
    <View style={styles.container}>
      {hasPermission && <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants.Type.back} />}
      <TouchableOpacity style={styles.button} onPress={detectHiddenCamera}>
        <Text>Start Detection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { width: '80%', height: 300 },
  button: { backgroundColor: 'white', padding: 10, borderRadius: 5, marginTop: 10 },
});