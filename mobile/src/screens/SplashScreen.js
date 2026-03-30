import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const colors = {
  primary: '#2F6FE4',
  secondary: '#FDF7F2',
  text: '#0F172A',
  background: '#FFFFFF'
};

export default function SplashScreen() {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
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
  }, []);

  return (
    <LinearGradient
      colors={[colors.primary, '#4F80F0']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo placeholder - would use actual OnPurpose logo */}
        <View style={styles.logo}>
          <View style={styles.hourglass}>
            <View style={styles.hourglassTop} />
            <View style={styles.hourglassBottom} />
            <View style={styles.chatTail} />
          </View>
        </View>
        
        <Text style={styles.title}>OnPurpose</Text>
        <Text style={styles.tagline}>Connection, not dating</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourglass: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  hourglassTop: {
    width: 40,
    height: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    top: 0,
    left: 10,
  },
  hourglassBottom: {
    width: 40,
    height: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 10,
  },
  chatTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter',
  },
});
