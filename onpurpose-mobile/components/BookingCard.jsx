import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../lib/constants';

export default function BookingCard({ booking, onAction }) {
  const statusColors = {
    pending: { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
    confirmed: { bg: '#d1fae5', text: '#16a34a', border: '#22c55e' },
    completed: { bg: '#dbeafe', text: '#2563eb', border: '#3b82f6' },
    cancelled: { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
  };

  const status = statusColors[booking.status] || statusColors.pending;
  const date = new Date(booking.date + ' ' + booking.time);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  const formattedTime = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <View style={[styles.card, { borderLeftColor: status.border }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{booking.service?.title}</Text>
        <Text style={styles.provider}>{booking.service?.provider?.name}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.datetime}>{formattedDate} at {formattedTime}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>
            {booking.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.price}>${booking.service?.price}</Text>
        <View style={styles.actions}>
          {booking.status === 'pending' && booking.paymentStatus === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.payButton]}
              onPress={() => onAction('pay', booking)}
            >
              <Text style={styles.payButtonText}>Pay now</Text>
            </TouchableOpacity>
          )}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onAction('cancel', booking)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {booking.status === 'completed' && !booking.reviewLeft && (
            <TouchableOpacity
              style={[styles.actionButton, styles.reviewButton]}
              onPress={() => onAction('review', booking)}
            >
              <Text style={styles.reviewButtonText}>Leave review</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  provider: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  datetime: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.blue,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  payButton: {
    backgroundColor: COLORS.blue,
  },
  payButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  reviewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  reviewButtonText: {
    color: COLORS.blue,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
});
