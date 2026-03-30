import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function App() {
  const [isWeb, setIsWeb] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Detect if running on web
    setIsWeb(Platform.OS === 'web');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OnPurpose</Text>
      <Text style={styles.subtitle}>Book People, Not Places</Text>
      
      <View style={styles.platformInfo}>
        <Text style={styles.platformText}>
          Platform: {isWeb ? '🌐 Web Browser' : '📱 Mobile Device'}
        </Text>
        <Text style={styles.description}>
          {isWeb 
            ? 'Running in web browser - no QR code needed!' 
            : 'Running on mobile device - native experience'}
        </Text>
      </View>

      <View style={styles.features}>
        <Text style={styles.featureTitle}>✨ Features Ready:</Text>
        <Text style={styles.feature}>• User Authentication</Text>
        <Text style={styles.feature}>• Service Browsing</Text>
        <Text style={styles.feature}>• Booking Management</Text>
        <Text style={styles.feature}>• Provider Dashboard</Text>
        <Text style={styles.feature}>• Real-time API Integration</Text>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusText}>🚀 Ready to test registration!</Text>
        <Text style={styles.statusSub}>Tap below to get started</Text>
      </View>

      <View style={styles.actions}>
        <button 
          style={styles.button}
          onClick={() => router.push('/auth')}
        >
          Get Started →
        </button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a2744',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#2563d4',
    marginBottom: 20,
  },
  platformInfo: {
    backgroundColor: '#f7f8fc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  platformText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2744',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7a99',
    textAlign: 'center',
  },
  features: {
    backgroundColor: '#eef1f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2744',
    marginBottom: 8,
  },
  feature: {
    fontSize: 14,
    color: '#6b7a99',
    marginBottom: 4,
  },
  status: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 4,
  },
  statusSub: {
    fontSize: 14,
    color: '#6b7a99',
  },
  actions: {
    width: '100%',
  },
  button: {
    backgroundColor: '#2563d4',
    color: 'white',
    padding: 16,
    borderRadius: 25,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
});
