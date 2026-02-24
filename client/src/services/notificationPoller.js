/**
 * Notification Poller Service
 * Polls the server for new unread notifications and shows them as native push notifications
 * on mobile (notification tray) - like other apps do.
 * 
 * This bridges the gap between server-stored notifications and native device notifications.
 */

import { Capacitor } from '@capacitor/core';
import notificationService from './notificationService';

const API_BASE = process.env.REACT_APP_API_URL || '';

class NotificationPoller {
  constructor() {
    this.pollInterval = null;
    this.isRunning = false;
    this.lastCheckedAt = null;
    this.shownNotificationIds = new Set();
    this.pollFrequency = 15000; // 15 seconds
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Start polling for notifications
   * Called after user logs in
   */
  start() {
    if (this.isRunning) return;
    
    // Load previously shown notification IDs from storage
    this._loadShownIds();
    
    // Set lastCheckedAt to now so we don't spam old notifications on first load
    if (!this.lastCheckedAt) {
      this.lastCheckedAt = new Date().toISOString();
    }

    this.isRunning = true;
    console.log('🔔 Notification poller started');

    // Initial poll after short delay (give app time to settle)
    setTimeout(() => this._poll(), 3000);

    // Set up periodic polling
    this.pollInterval = setInterval(() => this._poll(), this.pollFrequency);
  }

  /**
   * Stop polling (on logout or app close)
   */
  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    console.log('🔔 Notification poller stopped');
  }

  /**
   * Internal: Poll the server for new notifications
   */
  async _poll() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.stop();
        return;
      }

      // Determine if user is admin
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const isAdmin = userData.role === 'admin';

      const endpoint = isAdmin 
        ? `${API_BASE}/api/admin/notifications?limit=10` 
        : `${API_BASE}/api/user/notifications?limit=10`;

      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, stop polling
          this.stop();
        }
        return;
      }

      const data = await response.json();
      const notifications = data.data || [];

      // Filter to only unread notifications we haven't shown yet
      const newNotifications = notifications.filter(n => 
        !n.isRead && 
        !this.shownNotificationIds.has(n._id) &&
        this._isRecent(n.createdAt)
      );

      if (newNotifications.length > 0) {
        console.log(`🔔 ${newNotifications.length} new notification(s) to show`);
        
        // Show each as a native notification (limit to 3 at a time to avoid spam)
        const toShow = newNotifications.slice(0, 3);
        for (const notif of toShow) {
          await this._showNativeNotification(notif);
          this.shownNotificationIds.add(notif._id);
        }

        // If more than 3, show a summary
        if (newNotifications.length > 3) {
          await notificationService.sendNotification(
            `📬 ${newNotifications.length - 3} more notifications`,
            'Open the app to view all notifications.',
            { type: 'summary' }
          );
        }

        // Save shown IDs to storage
        this._saveShownIds();
      }
    } catch (error) {
      // Silently fail - don't break the app for notification errors
      console.debug('Notification poll error:', error.message);
    }
  }

  /**
   * Show a server notification as a native push notification
   */
  async _showNativeNotification(notification) {
    const { title, message, type } = notification;
    
    // Map notification type to channel and icon
    const channelMap = {
      'deposit_approved': 'hexanova-transactions',
      'deposit_rejected': 'hexanova-transactions',
      'withdrawal_approved': 'hexanova-transactions',
      'withdrawal_rejected': 'hexanova-transactions',
      'withdrawal_submitted': 'hexanova-transactions',
      'deposit_submitted': 'hexanova-transactions',
      'earning': 'hexanova-earnings',
      'daily_return': 'hexanova-earnings',
      'investment_activated': 'hexanova-earnings',
      'welcome_bonus': 'hexanova-earnings',
      'referral_bonus': 'hexanova-earnings',
      'referral_joined': 'hexanova-default',
      'welcome': 'hexanova-default',
      'new_registration': 'hexanova-default',
      'referral_registration': 'hexanova-default',
      'system_alert': 'hexanova-default',
    };

    // Add emoji prefix based on type if title doesn't already have one
    const emojiMap = {
      'deposit_approved': '💰',
      'deposit_rejected': '❌',
      'withdrawal_approved': '✅',
      'withdrawal_rejected': '❌',
      'earning': '💰',
      'daily_return': '📈',
      'investment_activated': '🚀',
      'welcome_bonus': '🎁',
      'referral_bonus': '🤝',
      'referral_joined': '👥',
      'welcome': '👋',
      'new_registration': '🆕',
      'referral_registration': '🔗',
      'system_alert': '⚠️',
    };

    const emoji = emojiMap[type] || '🔔';
    const displayTitle = title && !title.match(/^[\p{Emoji}]/u) ? `${emoji} ${title}` : (title || 'Hexanova');

    await notificationService.sendNotification(
      displayTitle,
      message || '',
      { 
        type: type || 'general',
        notificationId: notification._id,
        channelId: channelMap[type] || 'hexanova-default'
      }
    );
  }

  /**
   * Check if a notification is recent enough to show (within last 5 minutes)
   */
  _isRecent(createdAt) {
    if (!createdAt) return false;
    const notifTime = new Date(createdAt).getTime();
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return notifTime > fiveMinutesAgo;
  }

  /**
   * Load shown notification IDs from localStorage
   */
  _loadShownIds() {
    try {
      const stored = localStorage.getItem('shownNotificationIds');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only keep IDs from the last 24 hours to prevent infinite growth
        this.shownNotificationIds = new Set(parsed.slice(-200));
      }
    } catch {
      this.shownNotificationIds = new Set();
    }
  }

  /**
   * Save shown notification IDs to localStorage
   */
  _saveShownIds() {
    try {
      const ids = Array.from(this.shownNotificationIds).slice(-200); // Keep last 200
      localStorage.setItem('shownNotificationIds', JSON.stringify(ids));
    } catch {
      // Storage full - clear old entries
      this.shownNotificationIds = new Set();
    }
  }

  /**
   * Reset shown IDs (useful for debugging or on user request)
   */
  reset() {
    this.shownNotificationIds.clear();
    localStorage.removeItem('shownNotificationIds');
    this.lastCheckedAt = new Date().toISOString();
  }
}

// Singleton instance
const notificationPoller = new NotificationPoller();
export default notificationPoller;
