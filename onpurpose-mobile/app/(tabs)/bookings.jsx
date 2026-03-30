import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { bookingsAPI } from '../../lib/api';
import { COLORS, FONTS } from '../../lib/constants';
import BookingCard from '../../../components/BookingCard';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getMine();
      const allBookings = response.data.data || [];
      
      // Filter by status based on active tab
      const filteredBookings = allBookings.filter(booking => {
        if (activeTab === 'upcoming') {
          return booking.status === 'pending' || booking.status === 'confirmed';
        } else if (activeTab === 'completed') {
          return booking.status === 'completed';
        } else {
          return booking.status === 'cancelled';
        }
      });
      
      setBookings(filteredBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, [loadBookings]);

  const handleAction = async (action, booking) => {
    try {
      if (action === 'cancel') {
        await bookingsAPI.updateStatus(booking.id, 'cancelled');
      } else if (action === 'pay') {
        // TODO: Handle payment
        console.log('Pay for booking:', booking);
      } else if (action === 'review') {
        // TODO: Handle review
        console.log('Review booking:', booking);
      }
      await loadBookings();
    } catch (error) {
      console.error('Error handling action:', error);
    }
  };

  const tabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

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
          <Text style={styles.title}>My Bookings</Text>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.segmentButton,
                activeTab === tab.key && styles.segmentButtonActive
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.segmentButtonText,
                activeTab === tab.key && styles.segmentButtonTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bookings */}
        <View style={styles.bookingsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading bookings...</Text>
            </View>
          ) : bookings.length > 0 ? (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAction={handleAction}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'upcoming' 
                  ? 'Browse services to make your first booking'
                  : `No ${activeTab} bookings`
                }
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity 
                  style={styles.browseButton}
                  onPress={() => {
                    // TODO: Navigate to home tab
                    console.log('Navigate to home');
                  }}
                >
                  <Text style={styles.browseButtonText}>Browse services</Text>
                </TouchableOpacity>
              )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.navy,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.off2,
    borderRadius: 25,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.blue,
  },
  segmentButtonText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.text,
  },
  segmentButtonTextActive: {
    color: COLORS.white,
  },
  bookingsContainer: {
    paddingHorizontal: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
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
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
  },
});
