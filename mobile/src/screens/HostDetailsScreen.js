import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { hostService } from '../services/api';
import Toast from 'react-native-toast-message';

const colors = {
  primary: '#2F6FE4',
  secondary: '#FDF7F2',
  accent: '#22C55E',
  text: '#0F172A',
  textLight: '#64748B',
  background: '#FFFFFF',
  border: '#E2E8F0'
};

export default function HostDetailsScreen({ route, navigation }) {
  const { hostId } = route.params;
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHostDetails();
  }, []);

  const loadHostDetails = async () => {
    try {
      const response = await hostService.getHost(hostId);
      setHost(response.data.host);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load host details'
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    navigation.navigate('Booking', { host });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!host) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Host not found</Text>
      </View>
    );
  }

  const categories = JSON.parse(host.categories || '[]');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Host Profile */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: host.profile_photo || 'https://via.placeholder.com/120' }}
            style={styles.profilePhoto}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.hostName}>{host.name}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={colors.accent} />
              <Text style={styles.ratingText}>
                {host.avg_rating > 0 ? host.avg_rating.toFixed(1) : 'New'}
              </Text>
              <Text style={styles.reviewCount}>
                ({host.review_count} review{host.review_count !== 1 ? 's' : ''})
              </Text>
            </View>
            {host.verified && (
              <View style={styles.verifiedBadge}>
                <Icon name="check-circle" size={16} color={colors.accent} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <View key={index} style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{host.bio}</Text>
        </View>

        {/* Offerings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What I Offer</Text>
          <Text style={styles.offeringsText}>{host.offerings}</Text>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingContainer}>
            <Text style={styles.priceText}>${host.hourly_rate}</Text>
            <Text style={styles.priceUnit}>per hour</Text>
          </View>
          <Text style={styles.pricingNote}>
            Minimum 30 minutes • Platform fee included
          </Text>
        </View>

        {/* Reviews Preview */}
        {host.review_count > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.reviewsPreview}>
              <Text style={styles.reviewsText}>
                See all {host.review_count} review{host.review_count !== 1 ? 's' : ''}
              </Text>
              <Icon name="chevron-right" size={16} color={colors.textLight} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Session Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookSession}
        >
          <Text style={styles.bookButtonText}>Spend Time</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  hostName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.textLight,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  bioText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  offeringsText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  priceUnit: {
    fontSize: 18,
    color: colors.textLight,
    marginLeft: 4,
  },
  pricingNote: {
    fontSize: 14,
    color: colors.textLight,
  },
  reviewsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.secondary,
    borderRadius: 12,
  },
  reviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});
