import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import { paymentService } from '../services/api';
import Toast from 'react-native-toast-message';

const colors = {
  primary: '#2F6FE4',
  secondary: '#FDF7F2',
  accent: '#22C55E',
  text: '#0F172A',
  textLight: '#64748B',
  background: '#FFFFFF',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444'
};

export default function PaymentScreen({ route, navigation }) {
  const { booking, host } = route.params;
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await paymentService.createPaymentIntent(booking.id);
      setPaymentIntent(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Payment Setup Failed',
        text2: 'Unable to initialize payment'
      });
      navigation.goBack();
    }
  };

  const handlePayment = async () => {
    if (!paymentIntent || !cardComplete) {
      Toast.show({
        type: 'error',
        text1: 'Payment Error',
        text2: 'Please complete your card information'
      });
      return;
    }

    setLoading(true);
    try {
      const { error, paymentIntent: confirmedPayment } = await confirmPayment(
        paymentIntent.clientSecret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: error.message
        });
      } else if (confirmedPayment.status === 'Succeeded') {
        // Confirm payment with backend
        await paymentService.confirmPayment(
          confirmedPayment.id,
          booking.id
        );

        Toast.show({
          type: 'success',
          text1: 'Payment Successful',
          text2: 'Your booking is confirmed!'
        });

        navigation.reset({
          index: 0,
          routes: [
            { name: 'Main' },
            { 
              name: 'BookingConfirmation', 
              params: { booking, host, paymentIntent: confirmedPayment }
            }
          ],
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Payment Error',
        text2: 'Something went wrong with your payment'
      });
    } finally {
      setLoading(false);
    }
  };

  const sessionDate = new Date(booking.session_date);
  const platformFee = (booking.total_amount * 0.20).toFixed(2);
  const hostAmount = (booking.total_amount * 0.80).toFixed(2);

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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Host:</Text>
            <Text style={styles.summaryValue}>{host.name}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time:</Text>
            <Text style={styles.summaryValue}>
              {format(sessionDate, 'MMM d, yyyy')} at {format(sessionDate, 'h:mm a')}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>{booking.duration} minutes</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Session Cost:</Text>
            <Text style={styles.summaryValue}>${hostAmount}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee:</Text>
            <Text style={styles.summaryValue}>${platformFee}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${booking.total_amount}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Method</Text>
          
          <View style={styles.cardFieldContainer}>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={styles.cardField}
              style={styles.cardFieldWrapper}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
          </View>
          
          <View style={styles.securityNote}>
            <Icon name="shield" size={16} color={colors.accent} />
            <Text style={styles.securityText}>
              Your payment is secured by Stripe
            </Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By completing this payment, you agree to OnPurpose's{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Cancellation Policy</Text>.
          </Text>
        </View>
      </View>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!cardComplete || loading) && styles.payButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={!cardComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ${booking.total_amount}
            </Text>
          )}
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
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
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
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  cardFieldContainer: {
    marginBottom: 16,
  },
  cardFieldWrapper: {
    height: 50,
  },
  cardField: {
    backgroundColor: colors.secondary,
    textColor: colors.text,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  termsContainer: {
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});
