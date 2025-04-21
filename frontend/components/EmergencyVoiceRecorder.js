import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as SMS from 'expo-sms';
import Svg, { Path } from 'react-native-svg';

// Emergency contact numbers (replace with real numbers)
const EMERGENCY_CONTACTS = ['6304228639', '9963029521'];
const MAX_RECORDING_DURATION = 30000; // 30 seconds
const MIN_RECORDING_DURATION = 1000; // 1 second

const EmergencyVoiceRecorder = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [waveformData, setWaveformData] = useState([]);
  const recordingRef = useRef(null);
  const waveformAnimationFrame = useRef(null);
  const waveformDataRef = useRef([]);
  const updateWaveform = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert(
            'Permission Needed',
            'Microphone access is required for recording.'
          );
        }
      } catch (error) {
        console.error('Permission error:', error);
        setHasPermission(false);
        Alert.alert('Error', 'Failed to get microphone permission.');
      }
    };

    getPermissions();

    updateWaveform.current = () => {
      waveformDataRef.current.push(Math.random() * 100 - 50);
      waveformDataRef.current = waveformDataRef.current.slice(-50);

      if (waveformAnimationFrame.current % 8 === 0) {
        setWaveformData([...waveformDataRef.current]);
      }

      if (isRecording) {
        waveformAnimationFrame.current = requestAnimationFrame(updateWaveform.current);
      }
    };

    return () => {
      // Cleanup waveform animation
      if (waveformAnimationFrame.current) {
        cancelAnimationFrame(waveformAnimationFrame.current);
        waveformAnimationFrame.current = null;
      }

      // Cleanup recording only if it exists and is active
      if (recordingRef.current && isRecording) {
        recordingRef.current
          .stopAndUnloadAsync()
          .catch((err) => console.warn('Cleanup error:', err.message));
        recordingRef.current = null;
      }
    };
  }, [isRecording]);

  const requestPermissionsAgain = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Microphone access is required for recording.'
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      setHasPermission(false);
      Alert.alert('Error', 'Failed to get microphone permission.');
    }
  };

  const startRecording = async () => {
    if (hasPermission !== true) {
      Alert.alert('Error', 'Microphone permission is required.');
      await requestPermissionsAgain();
      return;
    }

    try {
      console.log('Starting recording...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = newRecording;
      setRecording(newRecording);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      console.log('Recording started:', newRecording);

      waveformDataRef.current = [];
      waveformAnimationFrame.current = requestAnimationFrame(updateWaveform.current);

      setTimeout(() => {
        if (isRecording) {
          console.log('Auto-stopping recording after 30 seconds');
          stopRecording();
          Alert.alert('Recording Stopped', 'Maximum duration (30 seconds) reached.');
        }
      }, MAX_RECORDING_DURATION);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      setRecording(null);
      recordingRef.current = null;
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current || !isRecording) {
      console.warn('No active recording found.');
      Alert.alert('Error', 'No active recording found.');
      setIsRecording(false);
      setRecording(null);
      return;
    }

    try {
      const recordingDuration = Date.now() - startTimeRef.current;
      if (recordingDuration < MIN_RECORDING_DURATION) {
        console.warn('Recording too short:', recordingDuration);
        await recordingRef.current.stopAndUnloadAsync();
        Alert.alert('Error', 'Recording is too short. Please record for at least 1 second.');
        cleanupRecording();
        return;
      }

      if (waveformAnimationFrame.current) {
        cancelAnimationFrame(waveformAnimationFrame.current);
        waveformAnimationFrame.current = null;
      }

      console.log('Stopping recording...');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      console.log('Recording stopped. URI:', uri);

      if (uri) {
        await sendToEmergencyContacts(uri);
      } else {
        console.warn('No valid audio URI received.');
        Alert.alert('Error', 'Failed to record audio. No data available.');
      }

      cleanupRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      cleanupRecording();
    }
  };

  const cleanupRecording = () => {
    setIsRecording(false);
    setRecording(null);
    setWaveformData([]);
    waveformDataRef.current = [];
    recordingRef.current = null;
    startTimeRef.current = null;
  };

  const sendToEmergencyContacts = async (uri) => {
    try {
      const isSmsAvailable = await SMS.isAvailableAsync();
      if (!isSmsAvailable) {
        console.warn('SMS not available on this device.');
        Alert.alert('Error', 'SMS is not available on this device.');
        return;
      }

      const timestamp = new Date().toLocaleString();
      const message = `EMERGENCY ALERT - Audio Recording\n\nTimestamp: ${timestamp}\n\nAudio file: ${uri}\n\nThis is an automated emergency message.`;

      console.log('Sending SMS to:', EMERGENCY_CONTACTS, 'Message:', message);

      const { result } = await SMS.sendSMSAsync(EMERGENCY_CONTACTS, message);

      if (result === 'sent') {
        Alert.alert('Success', 'Emergency SMS sent to contacts!');
      } else {
        console.warn('SMS delivery might have failed:', result);
        Alert.alert('Warning', 'SMS might not have been delivered to all contacts.');
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
      Alert.alert('Error', 'Failed to send emergency SMS.');
    }
  };

  const getWaveformPath = () => {
    const width = 300;
    const height = 100;

    const validData = waveformData.filter((val) => !isNaN(val) && typeof val === 'number');

    if (validData.length === 0) {
      return `M 0 ${height / 2} L ${width} ${height / 2}`;
    }

    let path = '';
    validData.forEach((val, idx) => {
      const x = validData.length > 1 ? (idx / (validData.length - 1)) * width : width / 2;
      const y = height / 2 + (val / 50) * (height / 4);
      path += `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    });

    return path;
  };

  const memoizedWaveform = React.useMemo(
    () => (
      <Svg height="100" width="300" style={styles.waveform}>
        <Path d={getWaveformPath()} stroke="#ff4081" strokeWidth={2} fill="none" />
      </Svg>
    ),
    [waveformData]
  );

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Emergency Voice Recorder</Text>
        <Text style={styles.errorMessage}>This feature only works on mobile devices.</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Emergency Voice Recorder</Text>
        <Text style={styles.errorMessage}>
          Permission denied. Please enable microphone access in settings.
        </Text>
        <TouchableOpacity style={styles.recordButton} onPress={requestPermissionsAgain}>
          <Text style={styles.buttonText}>Retry Permissions</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Emergency Voice Recorder</Text>

      {memoizedWaveform}

      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={hasPermission === null}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.status}>
        {isRecording
          ? 'Recording in progress...'
          : hasPermission === null
          ? 'Checking permissions...'
          : 'Press the button to record'}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a0f2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 20,
    backgroundColor: '#ffffff',
  },
  recordingButton: {
    backgroundColor: '#ff4081',
  },
  buttonText: {
    color: '#2a0f2e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  status: {
    marginTop: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#ff6b6b',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  waveform: {
    marginVertical: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
});

export default EmergencyVoiceRecorder;