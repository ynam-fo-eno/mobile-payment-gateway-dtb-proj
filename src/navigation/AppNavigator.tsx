import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { LayoutDashboard, WalletCards, History as HistoryIcon, User } from 'lucide-react-native';

import { useAuth } from '../hooks/useAuth';

import Splash from '../screens/onboarding/Splash';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';

import Dashboard from '../screens/main-tabs/Dashboard'; 
import Payments from '../screens/main-tabs/Payments';
import History from '../screens/main-tabs/History';
import Profile from '../screens/main-tabs/Profile';

// Import the new transaction screens
import TopUpScreen from '../screens/transactions/TopUpScreen';
import PayScreen from '../screens/transactions/PayScreen';
import Confirmation from '../screens/transactions/Confirmation';
import PaymentStatus from '../screens/transactions/PaymentStatus';

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
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            
            {/* Transaction Flow - Stacked over the main tabs as modals */}
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen name="TopUp" component={TopUpScreen} />
              <Stack.Screen name="Pay" component={PayScreen} />
              <Stack.Screen name="Confirmation" component={Confirmation} />
              <Stack.Screen name="PaymentStatus" component={PaymentStatus} />
            </Stack.Group>
          </>
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