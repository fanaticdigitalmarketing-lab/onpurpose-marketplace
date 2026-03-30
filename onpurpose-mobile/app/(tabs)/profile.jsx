import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { usersAPI } from '../../lib/api';
import { COLORS, FONTS } from '../../lib/constants';
import Logo from '../../../components/Logo';
import Button from '../../../components/Button';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('op_user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditForm({
          name: parsedUser.name || '',
          bio: parsedUser.bio || '',
          location: parsedUser.location || '',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.updateProfile(editForm);
      const updatedUser = { ...user, ...response.data };
      
      // Update AsyncStorage
      await AsyncStorage.setItem('op_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['op_token', 'op_refresh', 'op_user']);
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const menuItems = [
    { title: 'Edit profile', onPress: () => setIsEditing(true) },
    { title: 'Notification preferences', onPress: () => console.log('Notifications') },
    { title: 'Privacy policy', onPress: () => console.log('Privacy') },
    { title: 'Contact support', onPress: () => console.log('Support') },
    { title: 'Follow us on Instagram', onPress: () => console.log('Instagram') },
    { title: 'Log out', onPress: handleLogout, danger: true },
  ];

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.name}>{user.name}</Text>
        
        <View style={styles.roleContainer}>
          <View style={[styles.roleBadge, { backgroundColor: user.role === 'provider' ? COLORS.blue : COLORS.off2 }]}>
            <Text style={[styles.roleText, { color: user.role === 'provider' ? COLORS.white : COLORS.text }]}>
              {user.role === 'provider' ? 'Provider' : 'Customer'}
            </Text>
          </View>
        </View>
        
        {user.location && (
          <Text style={styles.location}>📍 {user.location}</Text>
        )}
        
        {!isEditing && (
          <Button
            onPress={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            style={styles.editButton}
          >
            Edit profile
          </Button>
        )}
      </View>

      {/* Edit Profile Form */}
      {isEditing && (
        <View style={styles.editSection}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          
          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              placeholder="Your name"
            />
            
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editForm.bio}
              onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={editForm.location}
              onChangeText={(text) => setEditForm({ ...editForm, location: text })}
              placeholder="Your location"
            />
            
            <View style={styles.editActions}>
              <Button
                onPress={() => setIsEditing(false)}
                variant="outline"
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSaveProfile}
                loading={loading}
                style={styles.saveButton}
              >
                Save
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* Stats Row */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Member since</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, item.danger && styles.menuItemDanger]}
            onPress={item.onPress}
          >
            <Text style={[styles.menuItemText, item.danger && styles.menuItemTextDanger]}>
              {item.title}
            </Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
  },
  headerSection: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontFamily: FONTS.heading,
    fontSize: 28,
  },
  name: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.text,
    marginBottom: 8,
  },
  roleContainer: {
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  location: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 16,
  },
  editButton: {
    marginTop: 8,
  },
  editSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
  label: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.off,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemDanger: {
    borderBottomColor: COLORS.danger,
  },
  menuItemText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.text,
  },
  menuItemTextDanger: {
    color: COLORS.danger,
  },
  menuItemArrow: {
    fontSize: 20,
    color: COLORS.muted,
  },
});
