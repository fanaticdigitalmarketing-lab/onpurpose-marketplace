import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, RefreshControl, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { servicesAPI } from '../../lib/api';
import { COLORS, FONTS, CATEGORIES } from '../../lib/constants';
import Logo from '../../../components/Logo';
import ServiceCard from '../../../components/ServiceCard';

export default function HomeScreen() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadUserData();
    setGreetingTime();
    loadServices();
  }, []);

  const setGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('op_user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadServices = useCallback(async (category = 'All', search = '') => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      
      const response = await servicesAPI.getAll(params);
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadServices(selectedCategory, searchQuery);
    setRefreshing(false);
  }, [loadServices, selectedCategory, searchQuery]);

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    loadServices(category, searchQuery);
  };

  const handleServicePress = (service) => {
    // TODO: Navigate to service detail bottom sheet
    console.log('Service pressed:', service);
  };

  const renderSkeletonCards = () => (
    <View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonLineShort} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.blue}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Logo size="sm" />
          <View style={styles.userSection}>
            <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')[0]}</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services or people..."
            placeholderTextColor={COLORS.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => loadServices(selectedCategory, searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              loadServices(selectedCategory, '');
            }}>
              <Text style={styles.clearIcon}>❌</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.label}
              style={[
                styles.categoryPill,
                selectedCategory === category.label && styles.categoryPillActive
              ]}
              onPress={() => handleCategoryPress(category.label)}
            >
              <Text style={[
                styles.categoryEmoji,
                selectedCategory === category.label && styles.categoryEmojiActive
              ]}>
                {category.emoji}
              </Text>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === category.label && styles.categoryLabelActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services */}
        <View style={styles.servicesContainer}>
          {loading ? (
            renderSkeletonCards()
          ) : services.length > 0 ? (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={handleServicePress}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  userSection: {
    alignItems: 'flex-end',
  },
  greeting: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.navy,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  clearIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryEmojiActive: {
    // Emoji stays the same
  },
  categoryLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.text,
  },
  categoryLabelActive: {
    color: COLORS.white,
  },
  servicesContainer: {
    paddingHorizontal: 8,
  },
  skeletonCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    margin: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  skeletonHeader: {
    height: 100,
    backgroundColor: COLORS.off2,
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonContent: {
    gap: 8,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: COLORS.off2,
    borderRadius: 8,
    width: '80%',
  },
  skeletonLineShort: {
    height: 12,
    backgroundColor: COLORS.off2,
    borderRadius: 6,
    width: '60%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
