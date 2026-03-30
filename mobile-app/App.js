import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store/store';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import HostListScreen from './src/screens/HostListScreen';
import HostProfileScreen from './src/screens/HostProfileScreen';
import BookingScreen from './src/screens/BookingScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import MessagesScreen from './src/screens/MessagesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2F6FE4',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'OnPurpose NYC' }}
          />
          <Stack.Screen 
            name="HostList" 
            component={HostListScreen} 
            options={{ title: 'Find Hosts' }}
          />
          <Stack.Screen 
            name="HostProfile" 
            component={HostProfileScreen} 
            options={{ title: 'Host Profile' }}
          />
          <Stack.Screen 
            name="Booking" 
            component={BookingScreen} 
            options={{ title: 'Book Experience' }}
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen} 
            options={{ title: 'Payment' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'My Profile' }}
          />
          <Stack.Screen 
            name="Bookings" 
            component={BookingsScreen} 
            options={{ title: 'My Bookings' }}
          />
          <Stack.Screen 
            name="Messages" 
            component={MessagesScreen} 
            options={{ title: 'Messages' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
