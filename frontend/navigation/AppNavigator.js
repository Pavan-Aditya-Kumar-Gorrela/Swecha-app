import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from './pages/Home';
import EditProfile from './pages/EditProfile';
import SideProfile from './pages/SideProfile';

const Drawer = createDrawerNavigator();

const AppNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideProfile {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="EditProfile" component={EditProfile} />
    </Drawer.Navigator>
  );
};

export default AppNavigator;