/**
 * OTP Service - Multi-provider SMS & Email OTP
 * Supports: Twilio Verify (best for international), Twilio SMS, MSG91
 * 
 * Priority order:
 * 1. Twilio Verify API (works globally, no FROM number needed, handles UAE/international)
 * 2. Twilio Programmable SMS (needs a FROM number)
 * 3. MSG91 (India-focused)
 * 4. Console (dev/fallback)
 */

const crypto = require('crypto');

// In-memory OTP storage (use Redis in production for multi-server)
const otpStore = new Map();

/**
 * Normalize phone number to E.164 format
 * Handles UAE numbers, removes leading zeros, ensures + prefix
 */
function normalizePhone(phone, countryCode) {
  let cleaned = String(phone || '').replace(/[\s\-\(\)]/g, '');
  
  // If countryCode provided, build full number
  if (countryCode) {
    let cc = String(countryCode).trim();
    if (!cc.startsWith('+')) cc = '+' + cc;
    // Remove leading zeros from local number
    cleaned = cleaned.replace(/^0+/, '');
    // Remove country code if already present in phone
    if (cleaned.startsWith(cc)) return cleaned;
    if (cleaned.startsWith(cc.replace('+', ''))) return '+' + cleaned;
    return cc + cleaned;
  }
  
  // If already has + prefix, return as-is
  if (cleaned.startsWith('+')) return cleaned;
  
  // Add + if missing
  return '+' + cleaned;
}

class OTPService {
  constructor() {
    this.otpLength = parseInt(process.env.OTP_LENGTH) || 6;
    this.otpExpiry = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    this.maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS) || 3;
    this.cooldownMinutes = parseInt(process.env.OTP_COOLDOWN_MINUTES) || 1;
  }

  generateOTP() {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < this.otpLength; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  createOTP(target, type = 'sms') {
    const key = `${type}:${target}`;
    const existing = otpStore.get(key);

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

    setTimeout(() => { otpStore.delete(key); }, this.otpExpiry * 60 * 1000 + 1000);
    return otp;
  }

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
      return { valid: false, message: `Invalid OTP. ${this.maxAttempts - stored.attempts} attempts remaining.` };
    }

    otpStore.delete(key);
    return { valid: true, message: 'OTP verified successfully' };
  }

  hasValidOTP(target, type = 'sms') {
    const key = `${type}:${target}`;
    const stored = otpStore.get(key);
    return stored && Date.now() < stored.expiresAt;
  }

  storeOTP(target, otp, purpose = 'verification') {
    const key = `email:${target}`;
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    otpStore.set(key, {
      hash: hashedOTP,
      attempts: 0,
      createdAt: Date.now(),
      expiresAt: Date.now() + (this.otpExpiry * 60 * 1000),
      purpose
    });
    setTimeout(() => { otpStore.delete(key); }, this.otpExpiry * 60 * 1000 + 1000);
    return true;
  }
}

/**
 * Twilio Verify API - Best for international SMS (UAE, India, etc.)
 * Does NOT need a FROM phone number. Twilio handles carrier routing.
 */
class TwilioVerifyService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '';
    this.client = null;
  }

  isConfigured() {
    return !!(this.accountSid && this.authToken && this.verifyServiceSid);
  }

  getClient() {
    if (!this.client && this.accountSid && this.authToken) {
      const twilio = require('twilio');
      this.client = twilio(this.accountSid, this.authToken);
    }
    return this.client;
  }

  async sendOTP(phone, otp, appName = 'Hexanova') {
    if (!this.isConfigured()) {
      return { success: false, devMode: true, message: 'Twilio Verify not configured' };
    }
    try {
      const client = this.getClient();
      const verification = await client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({ to: phone, channel: 'sms' });
      console.log(`✅ Twilio Verify sent to ${phone}, status: ${verification.status}, sid: ${verification.sid}`);
      return { success: true, sid: verification.sid, status: verification.status, provider: 'twilio-verify' };
    } catch (error) {
      console.error('❌ Twilio Verify Error:', error.message, error.code);
      throw new Error(`Twilio Verify failed: ${error.message}`);
    }
  }

  async checkOTP(phone, code) {
    if (!this.isConfigured()) return { valid: false, message: 'Twilio Verify not configured' };
    try {
      const client = this.getClient();
      const check = await client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({ to: phone, code });
      return { valid: check.status === 'approved', status: check.status };
    } catch (error) {
      console.error('❌ Twilio Verify Check Error:', error.message);
      return { valid: false, message: error.message };
    }
  }
}

/**
 * Twilio Programmable SMS - Needs a FROM number
 */
class TwilioService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.client = null;
  }

  isConfigured() {
    const isRealNumber = this.phoneNumber && this.phoneNumber.length > 5 && !this.phoneNumber.includes('XXXX');
    return !!(this.accountSid && this.authToken && isRealNumber);
  }

  getClient() {
    if (!this.client && this.accountSid && this.authToken) {
      const twilio = require('twilio');
      this.client = twilio(this.accountSid, this.authToken);
    }
    return this.client;
  }

  async sendSMS(to, message) {
    if (!this.isConfigured()) {
      return { success: false, devMode: true, message: 'Twilio SMS not configured (no FROM number)' };
    }
    try {
      const client = this.getClient();
      const result = await client.messages.create({ body: message, from: this.phoneNumber, to });
      console.log(`✅ Twilio SMS sent to ${to}, sid: ${result.sid}, status: ${result.status}`);
      return { success: true, sid: result.sid, status: result.status, provider: 'twilio-sms' };
    } catch (error) {
      console.error('❌ Twilio SMS Error:', error.message, error.code);
      throw new Error(`Twilio SMS failed: ${error.message}`);
    }
  }

  async sendOTP(phone, otp, appName = 'Hexanova') {
    const message = `Your ${appName} verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    return this.sendSMS(phone, message);
  }
}

/**
 * MSG91 SMS Service
 */
class MSG91Service {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY || '';
    this.senderId = process.env.MSG91_SENDER_ID || 'HEXNVA';
    this.templateId = process.env.MSG91_TEMPLATE_ID || '';
  }

  isConfigured() {
    return !!(this.apiKey && this.apiKey.length > 5);
  }

  async sendSMS(to, message) {
    if (!this.isConfigured()) {
      return { success: false, devMode: true, message: 'MSG91 not configured' };
    }
    try {
      const fetch = (await import('node-fetch')).default;
      let phone = to.replace(/^\+/, '').replace(/\s/g, '');

      // Try flow API with template first if available
      if (this.templateId) {
        const response = await fetch('https://api.msg91.com/api/v5/flow/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'authkey': this.apiKey },
          body: JSON.stringify({
            template_id: this.templateId,
            short_url: '0',
            recipients: [{ mobiles: phone, otp: message }]
          })
        });
        const data = await response.json();
        if (data.type === 'success') {
          console.log(`✅ MSG91 template SMS sent to ${phone}`);
          return { success: true, requestId: data.request_id, provider: 'msg91' };
        }
      }

      // Fallback to simple OTP API
      const url = new URL('https://api.msg91.com/api/v5/otp');
      url.searchParams.set('authkey', this.apiKey);
      url.searchParams.set('mobile', phone);
      url.searchParams.set('otp', message);
      url.searchParams.set('sender', this.senderId);

      const response = await fetch(url.toString(), { method: 'GET' });
      const data = await response.json();
      console.log('MSG91 Response:', data);

      if (data.type === 'success') {
        return { success: true, requestId: data.request_id, provider: 'msg91' };
      }
      throw new Error(data.message || 'MSG91 request failed');
    } catch (error) {
      console.error('❌ MSG91 Error:', error.message);
      throw new Error(`MSG91 failed: ${error.message}`);
    }
  }

  async sendOTP(phone, otp, appName = 'Hexanova') {
    return this.sendSMS(phone, otp);
  }
}

/**
 * Console SMS Service (development/fallback)
 */
class ConsoleSMSService {
  async sendSMS(to, message) {
    console.log('\n========== DEV SMS ==========');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('=============================\n');
    return { success: true, devMode: true, provider: 'console' };
  }

  async sendOTP(phone, otp, appName = 'Hexanova') {
    const message = `Your ${appName} verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSMS(phone, message);
  }

  isConfigured() { return true; }
}

/**
 * SMS Service Factory - Tries providers in order with automatic fallback
 * Priority: Twilio Verify → Twilio SMS → MSG91 → Console
 */
class SMSServiceFactory {
  static _instance = null;

  static getService() {
    // Singleton - don't create new instances every call
    if (SMSServiceFactory._instance) return SMSServiceFactory._instance;

    const providers = [];
    const twilioVerify = new TwilioVerifyService();
    const twilioSMS = new TwilioService();
    const msg91 = new MSG91Service();

    if (twilioVerify.isConfigured()) providers.push({ name: 'Twilio Verify', service: twilioVerify });
    if (twilioSMS.isConfigured()) providers.push({ name: 'Twilio SMS', service: twilioSMS });
    if (msg91.isConfigured()) providers.push({ name: 'MSG91', service: msg91 });
    providers.push({ name: 'Console (Dev)', service: new ConsoleSMSService() });

    console.log(`📱 SMS providers available: ${providers.map(p => p.name).join(' → ')}`);

    // Return a wrapper that tries each provider in order
    const wrapper = {
      providers,
      isConfigured() { return providers.length > 0; },
      async sendOTP(phone, otp, appName = 'Hexanova') {
        const errors = [];
        for (const p of providers) {
          try {
            console.log(`📱 Trying ${p.name} for ${phone}...`);
            const result = await p.service.sendOTP(phone, otp, appName);
            if (result.success && !result.devMode) {
              console.log(`✅ SMS delivered via ${p.name}`);
              return result;
            }
            if (result.devMode) {
              console.log(`⚠️ ${p.name} is in dev mode, trying next...`);
              continue;
            }
          } catch (err) {
            console.error(`❌ ${p.name} failed: ${err.message}`);
            errors.push(`${p.name}: ${err.message}`);
          }
        }
        // All real providers failed, return console result
        console.error(`❌ All SMS providers failed: ${errors.join('; ')}`);
        return { success: true, devMode: true, provider: 'console', errors };
      }
    };

    SMSServiceFactory._instance = wrapper;
    return wrapper;
  }
}

// Export instances
const otpService = new OTPService();
const smsService = SMSServiceFactory.getService();

module.exports = {
  OTPService,
  TwilioVerifyService,
  TwilioService,
  MSG91Service,
  ConsoleSMSService,
  SMSServiceFactory,
  otpService,
  smsService,
  normalizePhone
};
