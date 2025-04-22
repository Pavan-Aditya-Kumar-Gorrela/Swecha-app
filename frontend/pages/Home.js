import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SMS from "expo-sms";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Accelerometer } from "expo-sensors";

// Reusable SOS Button Component
const SOSButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.sosContainer}>
    <LinearGradient colors={["#ff007f", "#ff0066"]} style={styles.outerCircle}>
      <LinearGradient colors={["#ff3399", "#cc0066"]} style={styles.innerCircle}>
        <Text style={styles.sosText}>SOS</Text>
      </LinearGradient>
    </LinearGradient>
  </TouchableOpacity>
);

// Reusable Navigation Icon Component
const NavIcon = ({ iconName, iconType, color, onPress }) => {
  const IconComponent = iconType === "Ionicons" ? Ionicons : iconType === "Entypo" ? Entypo : MaterialIcons;
  return (
    <TouchableOpacity onPress={onPress}>
      <IconComponent name={iconName} size={24} color={color} />
    </TouchableOpacity>
  );
};

function Home() {
  const navigation = useNavigation();
  const [isSOSActive, setIsSOSActive] = useState(false);

  // Handle SOS button press or shake
  const handleSOSPress = async () => {
    setIsSOSActive(true);

    // Check SMS availability
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "SMS is not available on this device.");
      setIsSOSActive(false);
      return;
    }

    // Request location permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Location permission denied.");
      setIsSOSActive(false);
      return;
    }

    // Get current location
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const locationMessage = `I'm in danger! My location: https://maps.google.com/?q=${latitude},${longitude}`;

    // Retrieve emergency contacts
    let contacts = [];
    try {
      const storedContacts = await AsyncStorage.getItem("emergencyContacts");
      if (storedContacts) {
        contacts = JSON.parse(storedContacts);
      }
    } catch (error) {
      console.error("Error retrieving contacts:", error);
    }

    if (contacts.length === 0) {
      Alert.alert("Error", "No emergency contacts set. Please add contacts.");
      setIsSOSActive(false);
      return;
    }

    // Extract phone numbers
    const phoneNumbers = contacts.map((contact) => contact.phone);

    Alert.alert(
      "SOS Alert",
      "This will send an SMS to your emergency contacts with your location.",
      [
        { text: "Cancel", onPress: () => setIsSOSActive(false) },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const result = await SMS.sendSMSAsync(phoneNumbers, locationMessage);
              console.log("SMS result:", result);
              Alert.alert("Success", "Emergency SMS sent!");
            } catch (error) {
              console.error("SMS error:", error);
              Alert.alert("Error", "Failed to send SMS.");
            }
            setIsSOSActive(false);
          },
        },
      ]
    );
  };

  // Set up shake detection using Accelerometer
  useEffect(() => {
    let lastUpdate = 0;
    const threshold = 1.5; // Adjust this value to control shake sensitivity

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const currentTime = Date.now();
      if (currentTime - lastUpdate > 100) {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        if (acceleration > threshold) {
          console.log("Shake detected!");
          handleSOSPress();
        }
        lastUpdate = currentTime;
      }
    });

    Accelerometer.setUpdateInterval(100);

    // Cleanup on unmount
    return () => subscription.remove();
  }, []);

  // Navigation handlers
  const navItems = [
    { icon: "home", type: "Ionicons", color: "#ff3399", route: "Home" },
    { icon: "location-pin", type: "Entypo", color: "white", route: "Map" },
    { icon: "sos", type: "MaterialIcons", color: "white", route: "SOS" },
    { icon: "settings", type: "Ionicons", color: "white", route: "Settings" },
  ];

  const handleNavPress = (route) => {
    navigation.navigate(route);
  };

  return (
    <LinearGradient colors={["#0f001a", "#3d003f"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        /* Header */
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('NewsDrawer')}>
              <Ionicons name="newspaper-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hello! User</Text>
          <Text style={styles.subText}>
            Your SOS button is ready if you need it
          </Text>
        </View>

        {/* SOS Button */}
        <SOSButton onPress={handleSOSPress} />

        {/* Description */}
        <View style={styles.description}>
          <Text style={styles.holdText}>
            {isSOSActive ? "Release to cancel SOS" : "Hold the SOS button to alert"}
          </Text>
          <Text style={styles.infoText}>
            This will notify your trusted contacts, nearby app users, and the
            closest hospitals and police stations.
          </Text>
        </View>
        {/*Quick Call*/}
                {/* Quick Call Button */}
                <View style={styles.quickCallContainer}>
          <TouchableOpacity
            style={styles.quickCallButton}
            onPress={async () => {
              try {
                const storedContacts = await AsyncStorage.getItem("emergencyContacts");
                if (storedContacts) {
                  const contacts = JSON.parse(storedContacts);
                  if (contacts.length > 0) {
                    const phoneNumber = contacts[0].phone;
                    const url = `tel:${phoneNumber}`;
                    await Linking.openURL(url);
                  } else {
                    Alert.alert("Error", "No emergency contacts available.");
                  }
                } else {
                  Alert.alert("Error", "No emergency contacts set.");
                }
              } catch (error) {
                console.error("Error initiating call:", error);
                Alert.alert("Error", "Failed to initiate call.");
              }
            }}
          >
            <LinearGradient
              colors={["#ff3399", "#cc0066"]}
              style={styles.quickCallGradient}
            >
              <Text style={styles.quickCallText}>Quick Call</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {/* Update Emergency Contacts Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.contactsButton}
            onPress={() => navigation.navigate("EmergencyContacts")}
          >
            <LinearGradient
              colors={["#ff3399", "#cc0066"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Update your Emergency Contacts</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
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
      </SafeAreaView>
    </LinearGradient>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 10,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  greetingContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  greetingText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    color: "#ccc",
    marginTop: 5,
  },
  sosContainer: {
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  outerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  description: {
    marginTop: 30,
    alignItems: "center",
    paddingHorizontal: 30,
  },
  holdText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  infoText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  quickCallContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  quickCallButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  quickCallGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  quickCallText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  contactsButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomNav: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    backgroundColor: "#2a002a",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
  },
});