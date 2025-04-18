import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './pages/SplashScreen';
import Onboard1 from './pages/Onborad1';
import Onboard2 from './pages/Onboard2';
import Onboard3 from './pages/Onboard3';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPasswordScreen from './pages/ForgotPassword';
import VerifyCode from './pages/VerifyCode';
import ChangePassword from './pages/ChangePassword';
import Home from './pages/Home';
import EmergencyContacts from './pages/EmergencyContacts';
// import Map from './pages/Map';
import SOS from './pages/SOS';
import LiveVideoStream from './components/LiveStream'; // Correct path

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Screen1">
        <Stack.Screen name="Screen1" component={SplashScreen} />
        <Stack.Screen name="Screen2" component={Onboard1} />
        <Stack.Screen name="Screen3" component={Onboard2} />
        <Stack.Screen name="Screen4" component={Onboard3} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="forgot" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyCode" component={VerifyCode} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContacts} />
        {/* <Stack.Screen name="Map" component={Map} /> */}
        <Stack.Screen name="SOS" component={SOS} />
        <Stack.Screen name="LiveVideoStream" component={LiveVideoStream} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}