import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { StripeProvider } from '@stripe/stripe-react-native';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import HostDetailsScreen from './src/screens/HostDetailsScreen';
import BookingScreen from './src/screens/BookingScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import BookingConfirmationScreen from './src/screens/BookingConfirmationScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import HostOnboardingScreen from './src/screens/HostOnboardingScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Colors
const colors = {
  primary: '#2F6FE4',
  secondary: '#FDF7F2',
  accent: '#22C55E',
  text: '#0F172A',
  textLight: '#64748B',
  background: '#FFFFFF',
  border: '#E2E8F0'
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Bookings') {
            iconName = 'calendar';
          } else if (route.name === 'Messages') {
            iconName = 'message-circle';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        },
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="HostDetails" component={HostDetailsScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="HostOnboarding" component={HostOnboardingScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_your_stripe_publishable_key">
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </StripeProvider>
  );
}

// // // // // // // // // // // // // // // // // // const styles = StyleSheet.create({ // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
