/**
 * Notification Service for Hexanova Mobile App
 * Uses Capacitor Local Notifications for in-app notifications
 * Works on both Android (native) and Web (browser Notification API)
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.permissionGranted = false;
    this.notificationId = 1;
  }

  /**
   * Check if notifications are supported
   */
  isSupported() {
    if (this.isNative) return true;
    return 'Notification' in window;
  }

  /**
   * Request notification permission from the user
   * @returns {boolean} true if permission granted
   */
  async requestPermission() {
    try {
      if (this.isNative) {
        // Capacitor native - request permission
        const result = await LocalNotifications.requestPermissions();
        this.permissionGranted = result.display === 'granted';
        console.log('📱 Native notification permission:', result.display);
        return this.permissionGranted;
      } else {
        // Web browser - use browser Notification API
        if (!('Notification' in window)) {
          console.log('🌐 Browser notifications not supported');
          return false;
        }
        const result = await Notification.requestPermission();
        this.permissionGranted = result === 'granted';
        console.log('🌐 Browser notification permission:', result);
        return this.permissionGranted;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }

  /**
   * Check current notification permission status
   * @returns {string} 'granted', 'denied', or 'prompt'
   */
  async checkPermission() {
    try {
      if (this.isNative) {
        const result = await LocalNotifications.checkPermissions();
        this.permissionGranted = result.display === 'granted';
        return result.display;
      } else {
        if (!('Notification' in window)) return 'denied';
        this.permissionGranted = Notification.permission === 'granted';
        return Notification.permission;
      }
    } catch (error) {
      console.error('Check permission error:', error);
      return 'denied';
    }
  }

  /**
   * Send a local notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   * @param {object} data - Extra data to attach
   */
  async sendNotification(title, body, data = {}) {
    try {
      if (!this.permissionGranted) {
        await this.requestPermission();
      }

      if (this.isNative) {
        const id = this.notificationId++;
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id,
              extra: data,
              smallIcon: 'ic_launcher',
              largeIcon: 'ic_launcher',
              iconColor: '#d4af37',
              sound: 'default',
              channelId: 'hexanova-default',
            }
          ]
        });
        console.log(`📱 Native notification sent: ${title}`);
      } else {
        // Web fallback
        if (this.permissionGranted) {
          new Notification(title, {
            body,
            icon: '/manifest.json',
            badge: '/manifest.json',
            data,
          });
          console.log(`🌐 Browser notification sent: ${title}`);
        }
      }
    } catch (error) {
      console.error('Send notification error:', error);
    }
  }

  /**
   * Set up notification channel for Android (required for Android 8+)
   */
  async setupChannels() {
    if (!this.isNative) return;
    
    try {
      await LocalNotifications.createChannel({
        id: 'hexanova-default',
        name: 'Hexanova Notifications',
        description: 'General notifications from Hexanova',
        importance: 4, // HIGH
        visibility: 1, // PUBLIC
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#d4af37',
      });

      await LocalNotifications.createChannel({
        id: 'hexanova-earnings',
        name: 'Earnings & ROI',
        description: 'Daily earnings and ROI notifications',
        importance: 4,
        visibility: 1,
        sound: 'default',
        vibration: true,
      });

      await LocalNotifications.createChannel({
        id: 'hexanova-transactions',
        name: 'Transactions',
        description: 'Deposit, withdrawal and transfer notifications',
        importance: 3, // DEFAULT
        visibility: 1,
        sound: 'default',
      });

      console.log('📱 Notification channels created');
    } catch (error) {
      console.error('Channel setup error:', error);
    }
  }

  /**
   * Initialize the notification service
   * Call this on app startup
   */
  async initialize() {
    if (!this.isSupported()) return;

    if (this.isNative) {
      await this.setupChannels();
      
      // Listen for notification actions
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('📱 Notification received:', notification);
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        console.log('📱 Notification action:', action);
      });
    }

    // Check existing permission
    await this.checkPermission();
  }

  // ==================== Convenience Methods ====================

  /** Notify user of daily earning */
  async notifyEarning(amount) {
    await this.sendNotification(
      '💰 Daily Earning Credited!',
      `$${amount.toFixed(2)} USDT has been credited to your My Wallet.`,
      { type: 'earning', amount }
    );
  }

  /** Notify user of successful deposit */
  async notifyDeposit(amount) {
    await this.sendNotification(
      '✅ Deposit Confirmed',
      `$${amount.toFixed(2)} USDT has been added to your Fund Wallet.`,
      { type: 'deposit', amount }
    );
  }

  /** Notify user of withdrawal status */
  async notifyWithdrawal(amount, status) {
    const statusText = status === 'approved' ? 'Approved ✅' : 'Rejected ❌';
    await this.sendNotification(
      `Withdrawal ${statusText}`,
      `Your withdrawal of $${amount.toFixed(2)} USDT has been ${status}.`,
      { type: 'withdrawal', amount, status }
    );
  }

  /** Notify user of new referral */
  async notifyReferral(referralName) {
    await this.sendNotification(
      '🎉 New Referral!',
      `${referralName} has joined using your referral code.`,
      { type: 'referral' }
    );
  }

  /** Notify user of plan activation */
  async notifyActivation(planName, amount) {
    await this.sendNotification(
      '🚀 Plan Activated!',
      `${planName} plan activated for $${amount.toFixed(2)} USDT.`,
      { type: 'activation', planName, amount }
    );
  }

  /** Welcome notification on login */
  async notifyWelcome(firstName) {
    await this.sendNotification(
      `Welcome back, ${firstName}! 👋`,
      'Check your dashboard for the latest updates.',
      { type: 'welcome' }
    );
  }

  /** Notify about announcement */
  async notifyAnnouncement(title, message) {
    await this.sendNotification(
      `📢 ${title}`,
      message,
      { type: 'announcement' }
    );
  }
}

// Singleton instance
const notificationService = new NotificationService();
export default notificationService;
