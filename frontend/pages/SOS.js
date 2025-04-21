import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Entypo, MaterialIcons } from '@expo/vector-icons';
import VoiceMessage from '../components/EmergencyVoiceRecorder'; // Adjust the import path as necessary

function SOS() {
  const navigation = useNavigation();

  const features = [
    { title: 'Voice Message', component: 'VoiceMessage' },
  ];

  const NavIcon = ({ iconName, iconType, color, onPress }) => {
    const IconComponent = iconType === 'Ionicons' ? Ionicons : iconType === 'Entypo' ? Entypo : MaterialIcons;
    return (
      <TouchableOpacity onPress={onPress}>
        <IconComponent name={iconName} size={24} color={color} />
      </TouchableOpacity>
    );
  };

  const handleNavPress = (route) => {
    navigation.navigate(route);
  };

  const navigateToFeature = (screen) => {
    navigation.navigate(screen); // Ensure the screen name matches the registered navigator
  };

  const navItems = [
    { icon: 'home', type: 'Ionicons', color: 'white', route: 'Home' },
    { icon: 'location-pin', type: 'Entypo', color: 'white', route: 'Map' },
    { icon: 'sos', type: 'MaterialIcons', color: '#ff3399', route: 'SOS' },
    { icon: 'settings', type: 'Ionicons', color: 'white', route: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>SOS Features</Text>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigateToFeature(feature.component)} // Correctly pass the component name
          >
            <Text style={styles.cardText}>{feature.title}</Text>
          </TouchableOpacity>
        ))}
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

export default SOS;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: { fontSize: 18, color: '#333' },
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