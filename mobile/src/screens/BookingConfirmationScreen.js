import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';

const colors = {
  primary: '#2F6FE4',
  secondary: '#FDF7F2',
  accent: '#22C55E',
  text: '#0F172A',
  textLight: '#64748B',
  background: '#FFFFFF',
  border: '#E2E8F0',
};

export default function BookingConfirmationScreen({ route, navigation }) {
  const { booking, host } = route.params;
  const sessionDate = new Date(booking.session_date);

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleViewBookings = () => {
    navigation.reset({
      index: 1,
      routes: [
        { name: 'Main' },
        { name: 'Bookings' }
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Icon name="check-circle" size={64} color={colors.accent} />
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your session with {host.name} has been successfully booked and paid for.
        </Text>

        {/* Booking Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.hostSection}>
            <Image
              source={{ uri: host.profile_photo || 'https://via.placeholder.com/60' }}
              style={styles.hostPhoto}
            />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>{host.name}</Text>
              <Text style={styles.hostTitle}>{host.title}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {format(sessionDate, 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="clock" size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {format(sessionDate, 'h:mm a')} ({booking.duration} minutes)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="dollar-sign" size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              ${booking.total_amount} (paid)
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What's Next?</Text>
          <View style={styles.stepItem}>
            <Icon name="mail" size={16} color={colors.accent} />
            <Text style={styles.stepText}>
              You'll receive a confirmation email shortly
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Icon name="message-circle" size={16} color={colors.accent} />
            <Text style={styles.stepText}>
              {host.name} will reach out to confirm details
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Icon name="calendar" size={16} color={colors.accent} />
            <Text style={styles.stepText}>
              Add this session to your calendar
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleViewBookings}
        >
          <Text style={styles.secondaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGoHome}
        >
          <Text style={styles.primaryButtonText}>Continue Browsing</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  hostTitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '600',
  },
  nextStepsCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
});
