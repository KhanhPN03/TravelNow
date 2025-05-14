// pushNotification.js
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, onMessage } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { URL_ANDROID } from '@env';

const PushNotificationService = {
  unsubscribeFromMessages: null,
  configureCount: 0,
  processedMessageIds: new Set(), // Khởi tạo ngay trong object

  async configure() {
    this.configureCount += 1;
    console.log(`PushNotificationService.configure called ${this.configureCount} times`);

    // Reset processedMessageIds khi configure lại
    this.processedMessageIds.clear();

    const notificationEnabled = await AsyncStorage.getItem('notificationEnabled');
    const isNotificationEnabled = notificationEnabled !== null ? JSON.parse(notificationEnabled) : true;

    if (Platform.OS === 'android') {
      const channelId = 'app_tour_notification_channel';
      PushNotification.channelExists(channelId, (exists) => {
        if (!exists) {
          PushNotification.createChannel(
            {
              channelId: channelId,
              channelName: 'Tour Notification Channel',
              soundName: 'default',
              importance: 4,
              vibrate: true,
            },
            (created, error) => {
              if (error) console.error('Failed to create channel:', error);
              else console.log(`Channel created: ${created}`);
            }
          );
        } else {
          console.log(`Channel with ID ${channelId} already exists`);
        }
      });
    }

    const app = getApp();
    const messaging = getMessaging(app);

    const authStatus = await messaging.requestPermission();
    if (authStatus !== 1 && authStatus !== 2) {
      console.log('Quyền thông báo bị từ chối');
      return;
    }

    if (isNotificationEnabled) {
      const token = await getToken(messaging);
      console.log('FCM Token:', token);

      try {
        const response = await fetch(`${URL_ANDROID}/notification/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        console.log('Token sent to server:', data);
      } catch (error) {
        console.error('Failed to send token:', error);
      }

      // Cleanup listener cũ
      if (this.unsubscribeFromMessages) {
        console.log('Cleaning up old listener');
        this.unsubscribeFromMessages();
      }

      // Đăng ký listener mới
      this.unsubscribeFromMessages = onMessage(messaging, async (remoteMessage) => {
        const messageId = remoteMessage.messageId;
        if (this.processedMessageIds.has(messageId)) {
          console.log(`Duplicate notification ignored: ${messageId}`);
          return;
        }
        this.processedMessageIds.add(messageId);

        console.log('Foreground notification:', remoteMessage);
        PushNotification.localNotification({
          channelId: 'app_tour_notification_channel',
          title: remoteMessage.notification?.title,
          message: remoteMessage.notification?.body,
        });
      });

      messaging.setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background notification:', remoteMessage);
      });
    } else {
      console.log('Notifications are disabled, skipping token and message handling');
    }
  },

  async toggleNotifications(enabled) {
    try {
      await AsyncStorage.setItem('notificationEnabled', JSON.stringify(enabled));
      console.log('Notification setting updated:', enabled);

      const messaging = getMessaging(getApp());
      const token = await getToken(messaging);

      if (enabled) {
        await fetch(`${URL_ANDROID}/notification/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        console.log('Token re-sent to server:', token);
        if (!this.unsubscribeFromMessages) {
          this.configure();
        }
      } else {
        await fetch(`${URL_ANDROID}/notification/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        console.log('Token removed from server:', token);
        if (this.unsubscribeFromMessages) {
          console.log('Cleaning up listener on disable');
          this.unsubscribeFromMessages();
          this.unsubscribeFromMessages = null;
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  },

  cleanup() {
    if (this.unsubscribeFromMessages) {
      console.log('Cleaning up listener on cleanup');
      this.unsubscribeFromMessages();
      this.unsubscribeFromMessages = null;
    }
    if (this.processedMessageIds) { // Kiểm tra trước khi clear
      this.processedMessageIds.clear();
    }
  },
};

export default PushNotificationService;