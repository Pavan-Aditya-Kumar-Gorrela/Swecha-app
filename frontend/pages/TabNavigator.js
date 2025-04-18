import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from './Home';


const Maps = () => <Text style={styles.placeholder}>Maps Screen</Text>;
const Features = () => <Text style={styles.placeholder}>Features Screen</Text>;
const News = () => <Text style={styles.placeholder}>News Screen</Text>;

function TabNavigator() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Maps') iconName = 'map';
            else if (route.name === 'Features') iconName = 'apps';
            else if (route.name === 'News') iconName = 'newspaper';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: '#333',
            borderTopWidth: 0,
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            borderRadius: 20,
            height: 60,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
          },
          tabBarActiveTintColor: '#ff0080',
          tabBarInactiveTintColor: '#ccc',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Maps" component={Maps} />
        <Tab.Screen name="Features" component={Features} />
        <Tab.Screen name="News" component={News} />
      </Tab.Navigator>
    );
  }

  export default TabNavigator;