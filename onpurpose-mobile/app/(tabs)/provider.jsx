import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { bookingsAPI, servicesAPI } from '../../lib/api';
import { COLORS, FONTS } from '../../lib/constants';
import Button from '../../../components/Button';

export default function ProviderScreen() {
  const [stats, setStats] = useState({
    totalServices: 0,
    pendingBookings: 0,
    completedSessions: 0,
    estimatedEarnings: 0,
  });
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      setLoading(true);
      
      // Load bookings
      const bookingsResponse = await bookingsAPI.getProvider();
      const allBookings = bookingsResponse.data.data || [];
      const pending = allBookings.filter(b => b.status === 'pending');
      const completed = allBookings.filter(b => b.status === 'completed');
      
      // Load services
      const servicesResponse = await servicesAPI.getMine();
      const services = servicesResponse.data.data || [];
      
      // Calculate stats
      const earnings = completed.reduce((total, booking) => {
        return total + (booking.service?.price || 0);
      }, 0);
      
      setStats({
        totalServices: services.length,
        pendingBookings: pending.length,
        completedSessions: completed.length,
        estimatedEarnings: earnings,
      });
      
      setIncomingBookings(pending);
      setMyServices(services);
    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await bookingsAPI.updateStatus(bookingId, action);
      await loadProviderData();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleServiceToggle = async (serviceId, isActive) => {
    try {
      await servicesAPI.update(serviceId, { isActive });
      await loadProviderData();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProviderData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
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
        <Text style={styles.title}>Provider Dashboard</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalServices}</Text>
          <Text style={styles.statLabel}>Services listed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pendingBookings}</Text>
          <Text style={styles.statLabel}>Pending bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completedSessions}</Text>
          <Text style={styles.statLabel}>Completed sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${stats.estimatedEarnings}</Text>
          <Text style={styles.statLabel}>Total earnings</Text>
        </View>
      </View>

      {/* Incoming Bookings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Incoming Bookings</Text>
        {incomingBookings.length > 0 ? (
          incomingBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View>
                  <Text style={styles.customerName}>{booking.customer?.name}</Text>
                  <Text style={styles.serviceTitle}>{booking.service?.title}</Text>
                </View>
                <Text style={styles.bookingPrice}>${booking.service?.price}</Text>
              </View>
              <View style={styles.bookingDetails}>
                <Text style={styles.bookingDate}>
                  {new Date(booking.date + ' ' + booking.time).toLocaleString()}
                </Text>
              </View>
              <View style={styles.bookingActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={() => handleBookingAction(booking.id, 'confirmed')}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => handleBookingAction(booking.id, 'cancelled')}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No pending bookings</Text>
          </View>
        )}
      </View>

      {/* My Services */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Services</Text>
          <Button size="sm" onPress={() => console.log('Add new service')}>
            Add new
          </Button>
        </View>
        {myServices.length > 0 ? (
          myServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    service.isActive ? styles.toggleActive : styles.toggleInactive
                  ]}
                  onPress={() => handleServiceToggle(service.id, !service.isActive)}
                >
                  <Text style={[
                    styles.toggleText,
                    service.isActive ? styles.toggleTextActive : styles.toggleTextInactive
                  ]}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.servicePrice}>${service.price}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No services listed yet</Text>
            <Button onPress={() => console.log('Add new service')}>
              Create your first service
            </Button>
          </View>
        )}
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
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.off,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.blue,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.text,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerName: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceTitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted,
  },
  bookingPrice: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.blue,
  },
  bookingDetails: {
    marginBottom: 12,
  },
  bookingDate: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.success,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
  },
  declineButton: {
    backgroundColor: COLORS.danger,
  },
  declineButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceCategory: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleActive: {
    backgroundColor: COLORS.success,
  },
  toggleInactive: {
    backgroundColor: COLORS.off2,
  },
  toggleText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  toggleTextInactive: {
    color: COLORS.muted,
  },
  servicePrice: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.blue,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 16,
  },
});
