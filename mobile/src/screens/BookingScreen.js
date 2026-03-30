import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Feather';
import { format, addDays, isAfter, startOfDay } from 'date-fns';
import { bookingService } from '../services/api';
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

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00'
];

const durations = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
];

export default function BookingScreen({ route, navigation }) {
  const { host } = route.params;
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const calculateTotal = () => {
    return ((host.hourly_rate * selectedDuration) / 60).toFixed(2);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please select a date and time'
      });
      return;
    }

    setLoading(true);
    try {
      const sessionDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const bookingData = {
        hostId: host.id,
        sessionDate: sessionDateTime.toISOString(),
        duration: selectedDuration,
        message: message.trim()
      };

      const response = await bookingService.create(bookingData);
      
      Toast.show({
        type: 'success',
        text1: 'Booking Created',
        text2: 'Proceeding to payment'
      });

      navigation.navigate('Payment', { 
        booking: response.data.booking,
        host 
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Booking Failed',
        text2: error.response?.data?.error || 'Something went wrong'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTimeSlot = (time) => (
    <TouchableOpacity
      key={time}
      style={[
        styles.timeSlot,
        selectedTime === time && styles.timeSlotSelected
      ]}
      onPress={() => setSelectedTime(time)}
    >
      <Text style={[
        styles.timeSlotText,
        selectedTime === time && styles.timeSlotTextSelected
      ]}>
        {time}
      </Text>
    </TouchableOpacity>
  );

  const renderDuration = (duration) => (
    <TouchableOpacity
      key={duration.value}
      style={[
        styles.durationOption,
        selectedDuration === duration.value && styles.durationOptionSelected
      ]}
      onPress={() => setSelectedDuration(duration.value)}
    >
      <Text style={[
        styles.durationText,
        selectedDuration === duration.value && styles.durationTextSelected
      ]}>
        {duration.label}
      </Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Book Session</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Host Info */}
        <View style={styles.hostInfo}>
          <Text style={styles.hostName}>{host.name}</Text>
          <Text style={styles.hostRate}>${host.hourly_rate}/hour</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: colors.primary,
              }
            }}
            minDate={today}
            maxDate={maxDate}
            theme={{
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: 'white',
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.textLight,
              monthTextColor: colors.text,
              arrowColor: colors.primary,
            }}
          />
        </View>

        {/* Time Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map(renderTimeSlot)}
            </View>
          </View>
        )}

        {/* Duration Selection */}
        {selectedTime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <View style={styles.durationsContainer}>
              {durations.map(renderDuration)}
            </View>
          </View>
        )}

        {/* Message */}
        {selectedDuration && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message (Optional)</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Tell the host what you'd like to do or discuss..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{message.length}/500</Text>
          </View>
        )}

        {/* Summary */}
        {selectedDuration && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date & Time:</Text>
              <Text style={styles.summaryValue}>
                {format(new Date(selectedDate), 'MMM d, yyyy')} at {selectedTime}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>
                {durations.find(d => d.value === selectedDuration)?.label}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rate:</Text>
              <Text style={styles.summaryValue}>${host.hourly_rate}/hour</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${calculateTotal()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      {selectedDuration && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.bookButton, loading && styles.bookButtonDisabled]}
            onPress={handleBooking}
            disabled={loading}
          >
            <Text style={styles.bookButtonText}>
              {loading ? 'Creating Booking...' : `Continue to Payment • $${calculateTotal()}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  hostInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: colors.secondary,
    borderRadius: 12,
  },
  hostName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  hostRate: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  timeSlotSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  timeSlotTextSelected: {
    color: 'white',
  },
  durationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  durationOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  durationTextSelected: {
    color: 'white',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  summary: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
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
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
