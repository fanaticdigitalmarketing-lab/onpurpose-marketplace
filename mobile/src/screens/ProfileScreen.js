import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import Toast from 'react-native-toast-message';

const colors = {
  primary: '#2F6FE4',
  secondary: '#FDF7F2',
  accent: '#22C55E',
  text: '#0F172A',
  textLight: '#64748B',
  background: '#FFFFFF',
  border: '#E2E8F0',
  error: '#EF4444'
};

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profile });
  };

  const handleBecomeHost = () => {
    navigation.navigate('HostOnboarding');
  };

  const menuItems = [
    {
      icon: 'user',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: handleEditProfile
    },
    {
      icon: 'calendar',
      title: 'My Bookings',
      subtitle: 'View your upcoming and past sessions',
      onPress: () => navigation.navigate('Bookings')
    },
    {
      icon: 'credit-card',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      onPress: () => navigation.navigate('PaymentMethods')
    },
    {
      icon: 'bell',
      title: 'Notifications',
      subtitle: 'Control your notification preferences',
      rightComponent: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={notificationsEnabled ? 'white' : colors.textLight}
        />
      )
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get help or contact us',
      onPress: () => navigation.navigate('Support')
    },
    {
      icon: 'shield',
      title: 'Privacy & Safety',
      subtitle: 'Manage your privacy settings',
      onPress: () => navigation.navigate('Privacy')
    },
    {
      icon: 'info',
      title: 'About OnPurpose',
      subtitle: 'Learn more about our mission',
      onPress: () => navigation.navigate('About')
    }
  ];

  if (user?.userType !== 'host') {
    menuItems.splice(2, 0, {
      icon: 'home',
      title: 'Become a Host',
      subtitle: 'Share your time and expertise',
      onPress: handleBecomeHost,
      highlight: true
    });
  }

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.menuItem, item.highlight && styles.menuItemHighlight]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, item.highlight && styles.menuIconHighlight]}>
          <Icon 
            name={item.icon} 
            size={20} 
            color={item.highlight ? colors.primary : colors.textLight} 
          />
        </View>
        <View style={styles.menuItemText}>
          <Text style={[styles.menuTitle, item.highlight && styles.menuTitleHighlight]}>
            {item.title}
          </Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      {item.rightComponent || (
        <Icon name="chevron-right" size={16} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ 
              uri: profile?.profile_photo || user?.profilePhoto || 'https://via.placeholder.com/100' 
            }}
            style={styles.profilePhoto}
          />
          <Text style={styles.profileName}>{profile?.name || user?.name}</Text>
          <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
          
          {user?.userType === 'host' && (
            <View style={styles.hostBadge}>
              <Icon name="star" size={16} color={colors.accent} />
              <Text style={styles.hostBadgeText}>Host</Text>
            </View>
          )}
          
          {profile?.verified && (
            <View style={styles.verifiedBadge}>
              <Icon name="check-circle" size={16} color={colors.accent} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>OnPurpose v1.0.0</Text>
          <Text style={styles.taglineText}>Connection, not dating</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 12,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  hostBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 4,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemHighlight: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconHighlight: {
    backgroundColor: 'white',
  },
  menuItemText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuTitleHighlight: {
    color: colors.primary,
  },
  menuSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: 'white',
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  taglineText: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
