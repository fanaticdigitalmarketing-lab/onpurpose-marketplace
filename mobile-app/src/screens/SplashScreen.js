import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loadStoredAuth } from '../store/slices/authSlice';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const dispatch = useDispatch();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Check for stored authentication
    const checkAuth = async () => {
      try {
        const result = await dispatch(loadStoredAuth()).unwrap();
        
        setTimeout(() => {
          if (result) {
            navigation.replace('Home');
          } else {
            navigation.replace('Auth');
          }
        }, 2000);
      } catch (error) {
        setTimeout(() => {
          navigation.replace('Auth');
        }, 2000);
      }
    };

    checkAuth();
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>🌟</Text>
        <Text style={styles.title}>OnPurpose</Text>
        <Text style={styles.subtitle}>Connection, not dating</Text>
        <Text style={styles.tagline}>Authentic NYC experiences with real locals</Text>
      </Animated.View>
      
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Discover • Connect • Experience</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F6FE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FDF7F2',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tagline: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#E3F2FD',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
