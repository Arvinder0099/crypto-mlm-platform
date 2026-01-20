/**
 * OTP Service - Multi-provider SMS & Email OTP
 * Supports: Twilio, MSG91, and custom providers
 * 
 * Setup Instructions:
 * TWILIO:
 * 1. Create account at https://www.twilio.com
 * 2. Get Account SID and Auth Token from Console
 * 3. Get/buy a phone number
 * 4. Add credentials to .env file
 * 
 * MSG91:
 * 1. Create account at https://msg91.com
 * 2. Get API key from Settings
 * 3. Create SMS template
 * 4. Add credentials to .env file
 */

const crypto = require('crypto');

// In-memory OTP storage (use Redis in production for multi-server)
const otpStore = new Map();

class OTPService {
  constructor() {
    this.otpLength = parseInt(process.env.OTP_LENGTH) || 6;
    this.otpExpiry = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10; // minutes
    this.maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 3;
    this.cooldownMinutes = parseInt(process.env.OTP_COOLDOWN_MINUTES) || 1;
  }

  /**
   * Generate a random OTP
   */
  generateOTP() {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < this.otpLength; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  /**
   * Create and store OTP for a target (phone/email)
   */
  createOTP(target, type = 'sms') {
    const key = `${type}:${target}`;
    const existing = otpStore.get(key);

    // Check cooldown
    if (existing && (Date.now() - existing.createdAt) < this.cooldownMinutes * 60 * 1000) {
      const waitSeconds = Math.ceil((this.cooldownMinutes * 60 * 1000 - (Date.now() - existing.createdAt)) / 1000);
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP`);
    }

    const otp = this.generateOTP();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    otpStore.set(key, {
      hash: hashedOTP,
      attempts: 0,
      createdAt: Date.now(),
      expiresAt: Date.now() + (this.otpExpiry * 60 * 1000)
    });

    // Auto-cleanup after expiry
    setTimeout(() => {
      otpStore.delete(key);
    }, this.otpExpiry * 60 * 1000 + 1000);

    return otp;
  }

  /**
   * Verify OTP
   */
  verifyOTP(target, otp, type = 'sms') {
    const key = `${type}:${target}`;
    const stored = otpStore.get(key);

    if (!stored) {
      return { valid: false, message: 'OTP expired or not found. Please request a new one.' };
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(key);
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (stored.attempts >= this.maxAttempts) {
      otpStore.delete(key);
      return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    const hashedInput = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedInput !== stored.hash) {
      stored.attempts += 1;
      otpStore.set(key, stored);
      return { 
        valid: false, 
        message: `Invalid OTP. ${this.maxAttempts - stored.attempts} attempts remaining.` 
      };
    }

    // OTP is valid - remove it
    otpStore.delete(key);
    return { valid: true, message: 'OTP verified successfully' };
  }

  /**
   * Check if OTP exists and is valid
   */
  hasValidOTP(target, type = 'sms') {
    const key = `${type}:${target}`;
    const stored = otpStore.get(key);
    return stored && Date.now() < stored.expiresAt;
  }
}

/**
 * Twilio SMS Service
 */
class TwilioService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.client = null;
  }

  isConfigured() {
    return !!(this.accountSid && this.authToken && this.phoneNumber);
  }

  getClient() {
    if (!this.client && this.isConfigured()) {
      const twilio = require('twilio');
      this.client = twilio(this.accountSid, this.authToken);
    }
    return this.client;
  }

  /**
   * Send SMS via Twilio
   * @param {string} to - Phone number with country code (+1234567890)
   * @param {string} message - SMS message
   */
  async sendSMS(to, message) {
    if (!this.isConfigured()) {
      console.log(`[DEV MODE] SMS to ${to}: ${message}`);
      return { success: true, devMode: true, message: 'SMS logged (Twilio not configured)' };
    }

    try {
      const client = this.getClient();
      const result = await client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: to
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('Twilio SMS Error:', error.message);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Send OTP via SMS
   * @param {string} phone - Phone number with country code
   * @param {string} otp - OTP code
   * @param {string} appName - Application name for message
   */
  async sendOTP(phone, otp, appName = 'MLM Platform') {
    const message = `Your ${appName} verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
    return this.sendSMS(phone, message);
  }
}

/**
 * MSG91 SMS Service (Popular in India)
 */
class MSG91Service {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY || '';
    this.senderId = process.env.MSG91_SENDER_ID || 'MLMAPP';
    this.templateId = process.env.MSG91_TEMPLATE_ID || '';
    this.route = process.env.MSG91_ROUTE || '4'; // Transactional
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async sendSMS(to, message) {
    if (!this.isConfigured()) {
      console.log(`[DEV MODE] MSG91 SMS to ${to}: ${message}`);
      return { success: true, devMode: true, message: 'SMS logged (MSG91 not configured)' };
    }

    try {
      const fetch = (await import('node-fetch')).default;
      
      // Clean phone number - remove + prefix
      let phone = to.replace(/^\+/, '').replace(/\s/g, '');
      
      // Use MSG91 Send OTP API (simpler, no template needed)
      const otpUrl = `https://api.msg91.com/api/v5/otp?authkey=${this.apiKey}&mobile=${phone}&otp=${message}&sender=${this.senderId}`;
      
      const response = await fetch(otpUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('MSG91 Response:', data);
      
      if (data.type === 'success') {
        return { success: true, requestId: data.request_id };
      } else {
        // Fallback to POST method with template if available
        if (this.templateId) {
          return this.sendSMSWithTemplate(phone, message);
        }
        throw new Error(data.message || 'MSG91 request failed');
      }
    } catch (error) {
      console.error('MSG91 SMS Error:', error.message);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendSMSWithTemplate(phone, otp) {
    try {
      const fetch = (await import('node-fetch')).default;
      
      const response = await fetch('https://api.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.apiKey
        },
        body: JSON.stringify({
          template_id: this.templateId,
          short_url: '0',
          recipients: [{ mobiles: phone, otp: otp }]
        })
      });

      const data = await response.json();
      
      if (data.type === 'success') {
        return { success: true, requestId: data.request_id };
      } else {
        throw new Error(data.message || 'MSG91 template request failed');
      }
    } catch (error) {
      console.error('MSG91 Template Error:', error.message);
      throw new Error(`Failed to send SMS with template: ${error.message}`);
    }
  }

  async sendOTP(phone, otp, appName = 'MLM Platform') {
    return this.sendSMS(phone, otp);
  }
}

/**
 * Console/Dev SMS Service (for development/testing)
 */
class ConsoleSMSService {
  async sendSMS(to, message) {
    console.log('\n========== SMS MESSAGE ==========');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('=================================\n');
    return { success: true, devMode: true };
  }

  async sendOTP(phone, otp, appName = 'MLM Platform') {
    const message = `Your ${appName} verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSMS(phone, message);
  }

  isConfigured() {
    return true;
  }
}

/**
 * SMS Service Factory - Auto-selects available provider
 */
class SMSServiceFactory {
  static getService() {
    const twilio = new TwilioService();
    const msg91 = new MSG91Service();

    if (twilio.isConfigured()) {
      console.log('📱 Using Twilio for SMS');
      return twilio;
    }

    if (msg91.isConfigured()) {
      console.log('📱 Using MSG91 for SMS');
      return msg91;
    }

    console.log('📱 Using Console SMS (Development Mode)');
    return new ConsoleSMSService();
  }
}

// Export instances
const otpService = new OTPService();
const smsService = SMSServiceFactory.getService();

module.exports = {
  OTPService,
  TwilioService,
  MSG91Service,
  ConsoleSMSService,
  SMSServiceFactory,
  otpService,
  smsService
};
