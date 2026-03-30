import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../lib/constants';

export default function TabLayout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user data to determine if provider tab should be shown
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('op_user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.navy,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border2,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          display: 'none', // Hide labels, icons only
        },
        tabBarIconStyle: {
          fontSize: 24,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Text style={focused ? styles.iconActive : styles.icon}>🔍</Text>
              {focused && <View style={styles.dot} />}
            </View>
          ),
          headerShown: false,
        }}
      />
      
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Text style={focused ? styles.iconActive : styles.icon}>📅</Text>
              {focused && <View style={styles.dot} />}
            </View>
          ),
          headerShown: false,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Text style={focused ? styles.iconActive : styles.icon}>👤</Text>
              {focused && <View style={styles.dot} />}
            </View>
          ),
          headerShown: false,
        }}
      />
      
      {user?.role === 'provider' && (
        <Tabs.Screen
          name="provider"
          options={{
            title: 'Provider',
            tabBarIcon: ({ focused }) => (
              <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
                <Text style={focused ? styles.iconActive : styles.icon}>⚡</Text>
                {focused && <View style={styles.dot} />}
              </View>
            ),
            headerShown: false,
          }}
        />
      )}
    </Tabs>
  );
}

const styles = {
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainerActive: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 24,
  },
  iconActive: {
    fontSize: 24,
    color: COLORS.navy,
  },
  dot: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.blue,
  },
};
