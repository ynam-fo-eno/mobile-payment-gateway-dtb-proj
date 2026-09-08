import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { LayoutDashboard, WalletCards, History as HistoryIcon, User } from 'lucide-react-native';

import { useAuth } from '../hooks/useAuth';

import Splash from '../screens/onboarding/Splash';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';

import Dashboard from '../screens/tabs/Dashboard'; 
import Payments from '../screens/tabs/Payments';
import History from '../screens/tabs/History';
import Profile from '../screens/tabs/Profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#f05d22', 
      tabBarInactiveTintColor: '#000052', 
      tabBarStyle: {
        backgroundColor: '#ffffff', 
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9', 
      },
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Dashboard') {
          return <LayoutDashboard color={color} size={size} />;
        } else if (route.name === 'Payments') {
          return <WalletCards color={color} size={size} />;
        } else if (route.name === 'History') {
          return <HistoryIcon color={color} size={size} />;
        } else if (route.name === 'Profile') {
          return <User color={color} size={size} />;
        }
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Payments" component={Payments} />
    <Tab.Screen name="History" component={History} />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { userToken } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          /* Main App Flow - Rendered automatically when logged in */
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        ) : (
          /* Auth Flow - Rendered when logged out or fresh app boot */
          <>
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}