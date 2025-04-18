import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [username, setUsernameState] = useState('User');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    (async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedDarkMode = await AsyncStorage.getItem('darkMode');
      const storedNotifications = await AsyncStorage.getItem('notifications');

      if (storedUsername) setUsernameState(storedUsername);
      if (storedDarkMode) setDarkMode(JSON.parse(storedDarkMode));
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    })();
  }, []);

  const setUsername = async (name) => {
    setUsernameState(name);
    await AsyncStorage.setItem('username', name);
  };

  const toggleDarkMode = async () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    await AsyncStorage.setItem('darkMode', JSON.stringify(newVal));
  };

  const toggleNotifications = async () => {
    const newVal = !notifications;
    setNotifications(newVal);
    await AsyncStorage.setItem('notifications', JSON.stringify(newVal));
  };

  return (
    <ProfileContext.Provider
      value={{ username, setUsername, darkMode, toggleDarkMode, notifications, toggleNotifications }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
