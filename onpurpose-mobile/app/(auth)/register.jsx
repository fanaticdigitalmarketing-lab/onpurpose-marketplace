import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../lib/api';
import { COLORS, FONTS } from '../../lib/constants';
import Logo from '../../../components/Logo';
import Button from '../../../components/Button';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({ 
        name, 
        email, 
        password, 
        role,
        location 
      });
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('op_token', accessToken);
      await AsyncStorage.setItem('op_refresh', refreshToken);
      await AsyncStorage.setItem('op_user', JSON.stringify(user));
      
      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Logo size="lg" />
        
        <Text style={styles.title}>Create account</Text>
        
        <View style={styles.roleToggle}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'customer' && styles.roleButtonActive
            ]}
            onPress={() => setRole('customer')}
          >
            <Text style={[
              styles.roleButtonText,
              role === 'customer' && styles.roleButtonTextActive
            ]}>
              Book services
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'provider' && styles.roleButtonActive
            ]}
            onPress={() => setRole('provider')}
          >
            <Text style={[
              styles.roleButtonText,
              role === 'provider' && styles.roleButtonTextActive
            ]}>
              Offer services
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={COLORS.muted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters)"
              placeholderTextColor={COLORS.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Location (optional)"
            placeholderTextColor={COLORS.muted}
            value={location}
            onChangeText={setLocation}
            autoCapitalize="words"
          />
          
          <Button
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          >
            Create account
          </Button>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.link}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.navy,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.off2,
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  roleButtonActive: {
    backgroundColor: COLORS.blue,
  },
  roleButtonText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.text,
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
  },
  eyeText: {
    fontSize: 20,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
  },
  link: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.blue,
    fontSize: 14,
  },
});
