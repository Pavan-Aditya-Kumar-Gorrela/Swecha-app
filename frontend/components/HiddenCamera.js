import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Svg, { Circle, Line } from 'react-native-svg';
import { throttle } from 'lodash'; // Import lodash for throttling

// Constants for better maintainability
const MAGNETOMETER_THRESHOLD = 50; // µT threshold for detecting devices
const MAX_GAUGE_VALUE = 100; // Max value for gauge display
const GAUGE_ANGLE_MULTIPLIER = 1.8; // Multiplier to map field strength to gauge angle
const COLORS = {
  primary: '#fff',
  heading: '#000',
  safe: '#28a745',
  alert: '#dc3545',
  gaugeStroke: '#000',
  needle: '#ff0000',
};

// Main component for the Spy Camera Detector
const SpyCameraDetector = () => {
  // State for magnetometer data, total field strength, status, and loading/error
  const [magnetometer, setMagnetometer] = useState({ x: 0, y: 0, z: 0 });
  const [totalField, setTotalField] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    'No potential electronic device detected',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if magnetometer is available
  useEffect(() => {
    let isMounted = true;

    const checkMagnetometer = async () => {
      try {
        const available = await Magnetometer.isAvailableAsync();
        if (!available) {
          if (isMounted) {
            setError('Magnetometer is not available on this device.');
            setIsLoading(false);
          }
          return false;
        }
        return true;
      } catch (err) {
        if (isMounted) {
          setError('Failed to initialize magnetometer.');
          setIsLoading(false);
        }
        return false;
      }
    };

    checkMagnetometer().then((isAvailable) => {
      if (isAvailable && isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Throttled function to handle magnetometer updates
  const handleMagnetometerUpdate = useCallback(
    throttle(({ x, y, z }) => {
      const total = Math.sqrt(x * x + y * y + z * z).toFixed(1);
      setMagnetometer({ x: x.toFixed(1), y: y.toFixed(1), z: z.toFixed(1) });
      setTotalField(total);
      setStatusMessage(
        total > MAGNETOMETER_THRESHOLD
          ? 'Potential electronic device detected!'
          : 'No potential electronic device detected',
      );
    }, 100), // Throttle to 100ms intervals
    [],
  );

  // Set up magnetometer listener
  useEffect(() => {
    let subscription = null;

    if (!error && !isLoading) {
      Magnetometer.setUpdateInterval(100); // Set update interval to 100ms
      subscription = Magnetometer.addListener(handleMagnetometerUpdate);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [error, isLoading, handleMagnetometerUpdate]);

  // Calculate gauge needle rotation (0 to 180 degrees)
  const getGaugeRotation = () => {
    return Math.min(totalField, MAX_GAUGE_VALUE) * GAUGE_ANGLE_MULTIPLIER;
  };

  // Render for web platform
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Spy Camera Detector</Text>
        <Text style={styles.errorMessage}>
          Magnetometer is not supported on the web. Please use a mobile device.
        </Text>
      </SafeAreaView>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.heading} />
        <Text style={styles.statusMessage}>Initializing magnetometer...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Spy Camera Detector</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </SafeAreaView>
    );
  }

  // Main render for mobile devices
  return (
    <SafeAreaView style={styles.container}>
      {/* Heading */}
      <Text style={styles.heading}>Spy Camera Detector</Text>

      {/* Gauge displaying magnetic field strength */}
      <View style={styles.gaugeContainer}>
        <Svg height="200" width="200" viewBox="0 0 100 50">
          <Circle
            cx="50"
            cy="50"
            r="45"
            stroke={COLORS.gaugeStroke}
            strokeWidth="2.5"
            fill="transparent"
          />
          <Line
            x1="50"
            y1="50"
            x2={50 + 40 * Math.cos((180 - getGaugeRotation()) * (Math.PI / 180))}
            y2={50 - 40 * Math.sin((180 - getGaugeRotation()) * (Math.PI / 180))}
            stroke={COLORS.needle}
            strokeWidth="2"
          />
        </Svg>
        <Text style={styles.magneticField}>{totalField} µT</Text>
      </View>

      {/* Status message with dynamic color */}
      <Text
        style={[
          styles.statusMessage,
          { color: totalField > MAGNETOMETER_THRESHOLD ? COLORS.alert : COLORS.safe },
        ]}
      >
        {statusMessage}
      </Text>

      {/* X, Y, Z axis values */}
      <View style={styles.xyzContainer}>
        <View style={styles.axisBox}>
          <Text style={styles.axisText}>X</Text>
          <Text style={styles.axisValue}>{magnetometer.x}</Text>
        </View>
        <View style={styles.axisBox}>
          <Text style={styles.axisText}>Y</Text>
          <Text style={styles.axisValue}>{magnetometer.y}</Text>
        </View>
        <View style={styles.axisBox}>
          <Text style={styles.axisText}>Z</Text>
          <Text style={styles.axisValue}>{magnetometer.z}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.heading,
    marginBottom: 20,
  },
  gaugeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  magneticField: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.heading,
    marginTop: 10,
  },
  statusMessage: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.alert,
    textAlign: 'center',
  },
  xyzContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  axisBox: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  axisText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.heading,
  },
  axisValue: {
    fontSize: 18,
    color: COLORS.safe,
  },
});

export default SpyCameraDetector;