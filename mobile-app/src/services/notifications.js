import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.token = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      if (Device.isDevice) {
        this.token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
        console.log('Push token:', this.token);
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2F6FE4',
        });
      }

      return this.token;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  setupListeners(navigation) {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Handle notification received while app is active
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const { data } = response.notification.request.content;
      
      // Navigate based on notification type
      if (data?.type === 'booking_confirmed') {
        navigation.navigate('Bookings');
      } else if (data?.type === 'new_message') {
        navigation.navigate('Messages', { conversationId: data.conversationId });
      } else if (data?.type === 'booking_request') {
        navigation.navigate('HostDashboard');
      } else if (data?.type === 'review_request') {
        navigation.navigate('Bookings', { reviewBookingId: data.bookingId });
      }
    });
  }

  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || null,
      });
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async scheduleBookingReminder(bookingData) {
    const { bookingDate, startTime, hostName, experienceTitle } = bookingData;
    
    // Schedule 24-hour reminder
    const oneDayBefore = new Date(bookingDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    
    await this.scheduleLocalNotification(
      '📅 Experience Tomorrow',
      `Your experience with ${hostName} is tomorrow at ${startTime}`,
      { type: 'booking_reminder', bookingId: bookingData.id },
      oneDayBefore
    );

    // Schedule 1-hour reminder
    const oneHourBefore = new Date(`${bookingDate} ${startTime}`);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);
    
    await this.scheduleLocalNotification(
      '⏰ Experience Starting Soon',
      `Your experience with ${hostName} starts in 1 hour`,
      { type: 'booking_reminder', bookingId: bookingData.id },
      oneHourBefore
    );
  }

  async cancelBookingReminders(bookingId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.bookingId === bookingId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling booking reminders:', error);
    }
  }

  getToken() {
    return this.token;
  }
}

export default new NotificationService();
