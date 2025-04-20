import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SMS from 'expo-sms';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Progress from 'react-native-progress';

export default function CheckInTimer({ userId }) {
  const [timerDuration, setTimerDuration] = useState(10); // Default 10 seconds
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [location, setLocation] = useState(null);
  const [sound, setSound] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  // Request permissions
  useEffect(() => {
    (async () => {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
      }

      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      if (notifStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Notification permission is required.');
      }

      // Load emergency contacts
      await loadEmergencyContacts();
      // Check for existing timer
      await checkExistingTimer();
    })();
  }, []);

  // Load alarm sound
  async function loadSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/mixkit-alert-alarm-1005.wav')
      );
      setSound(sound);
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  }

  // Load emergency contacts from AsyncStorage
  async function loadEmergencyContacts() {
    try {
      const contacts = await AsyncStorage.getItem(`emergency_contacts_${userId}`);
      if (contacts) {
        setEmergencyContacts(JSON.parse(contacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }

  // Check for existing timer on app resume
  async function checkExistingTimer() {
    try {
      const timerData = await AsyncStorage.getItem(`timer_${userId}`);
      if (timerData) {
        const { startTime, duration, latitude, longitude } = JSON.parse(timerData);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = duration - elapsed;

        if (remaining > 0) {
          setSecondsLeft(remaining);
          setIsTimerRunning(true);
          setLocation({ coords: { latitude, longitude } });
          await loadSound();
        } else {
          // Timer expired while app was closed
          setLocation({ coords: { latitude, longitude } });
          await triggerAlert();
          await AsyncStorage.removeItem(`timer_${userId}`);
        }
      }
    } catch (error) {
      console.error('Error checking timer:', error);
    }
  }

  // Update countdown
  useEffect(() => {
    let interval;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            triggerAlert();
            AsyncStorage.removeItem(`timer_${userId}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  // Start timer
  async function startTimer() {
    try {
      if (emergencyContacts.length === 0) {
        Alert.alert('No Contacts', 'Please add at least one emergency contact.');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);

      // Save timer data
      const timerData = {
        startTime: Date.now(),
        duration: timerDuration,
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      };
      await AsyncStorage.setItem(`timer_${userId}`, JSON.stringify(timerData));

      setSecondsLeft(timerDuration);
      setIsTimerRunning(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Check-In Reminder',
          body: 'Please check in before the timer expires!',
        },
        trigger: { seconds: Math.max(timerDuration - 5, 1) }, // Adjust for short timers
      });

      if (!sound) await loadSound();
      await sound?.playAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to start timer.');
      console.error(error);
    }
  }

  // Check in
  async function checkIn() {
    try {
      setIsTimerRunning(false);
      setSecondsLeft(0);
      await sound?.stopAsync();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await AsyncStorage.removeItem(`timer_${userId}`);
      Alert.alert('Checked In', 'You have safely checked in.');
    } catch (error) {
      Alert.alert('Error', 'Failed to check in.');
      console.error(error);
    }
  }

  // Trigger alert (play alarm first, then send SMS)
  async function triggerAlert() {
    try {
      setIsTimerRunning(false);
      if (!sound) await loadSound();
      await sound?.playAsync();

      // Wait for 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (emergencyContacts.length === 0) {
        Alert.alert('No Contacts', 'Please add emergency contacts.');
        return;
      }

      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable && location) {
        const message = `Emergency! User failed to check in. Last known location: ${location.coords.latitude}, ${location.coords.longitude}.`;
        await SMS.sendSMSAsync(
          emergencyContacts.map((c) => c.phoneNumber),
          message
        );
        Alert.alert('Alert Sent', 'Emergency contacts notified.');
      } else {
        Alert.alert('Error', 'SMS or location unavailable.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send alert.');
      console.error(error);
    }
  }

  // Clean up sound
  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  // Format time to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <LinearGradient
      colors={['#4B79A1', '#283E51']}
      style={styles.container}
    >
      <Text style={styles.title}>Safety Check-In Timer</Text>
      <View style={styles.timerContainer}>
        <Progress.Circle
          size={200}
          progress={isTimerRunning ? secondsLeft / timerDuration : 1}
          thickness={10}
          color="#FF4C4C"
          unfilledColor="#FFFFFF"
          borderWidth={0}
          showsText
          formatText={() => (isTimerRunning ? formatTime(secondsLeft) : 'Set Timer')}
          textStyle={styles.timerText}
        />
      </View>
      {!isTimerRunning && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.durationButton, timerDuration === 10 && styles.selectedButton]}
            onPress={() => setTimerDuration(10)}
            disabled={isTimerRunning}
          >
            <Text style={styles.buttonText}>10 sec</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.durationButton, timerDuration === 300 && styles.selectedButton]}
            onPress={() => setTimerDuration(300)}
            disabled={isTimerRunning}
          >
            <Text style={styles.buttonText}>5 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.durationButton, timerDuration === 600 && styles.selectedButton]}
            onPress={() => setTimerDuration(600)}
            disabled={isTimerRunning}
          >
            <Text style={styles.buttonText}>10 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.durationButton, timerDuration === 900 && styles.selectedButton]}
            onPress={() => setTimerDuration(900)}
            disabled={isTimerRunning}
          >
            <Text style={styles.buttonText}>15 min</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: isTimerRunning ? '#888' : '#28A745' }]}
        onPress={startTimer}
        disabled={isTimerRunning}
      >
        <Text style={styles.actionButtonText}>
          {isTimerRunning ? 'Timer Running' : 'Start Timer'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: isTimerRunning ? '#007BFF' : '#888' }]}
        onPress={checkIn}
        disabled={!isTimerRunning}
      >
        <Text style={styles.actionButtonText}>Check In</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  timerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  durationButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedButton: {
    backgroundColor: '#FF4C4C',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  actionButton: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});