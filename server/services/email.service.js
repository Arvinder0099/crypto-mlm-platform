/**
 * Email Service - Multi-provider Email Notifications
 * Supports: SendGrid, Nodemailer (SMTP), and custom providers
 * 
 * Setup Instructions:
 * SENDGRID:
 * 1. Create account at https://sendgrid.com
 * 2. Go to Settings -> API Keys -> Create API Key
 * 3. Verify sender email/domain
 * 4. Add API key to .env file
 * 
 * SMTP (Gmail, Outlook, etc.):
 * 1. Get SMTP credentials from your email provider
 * 2. Enable "Less secure apps" or create App Password
 * 3. Add credentials to .env file
 */

const nodemailer = require('nodemailer');

/**
 * SendGrid Email Service
 */
class SendGridService {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@yourmlm.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'MLM Platform';
    this.sgMail = null;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  getClient() {
    if (!this.sgMail && this.isConfigured()) {
      this.sgMail = require('@sendgrid/mail');
      this.sgMail.setApiKey(this.apiKey);
    }
    return this.sgMail;
  }

  async sendEmail(to, subject, html, text = '') {
    if (!this.isConfigured()) {
      console.log(`[DEV MODE] Email to ${to}: ${subject}`);
      return { success: true, devMode: true, message: 'Email logged (SendGrid not configured)' };
    }

    try {
      const client = this.getClient();
      await client.send({
        to,
        from: { email: this.fromEmail, name: this.fromName },
        subject,
        text: text || html.replace(/<[^>]*>/g, ''),
        html
      });

      return { success: true };
    } catch (error) {
      console.error('SendGrid Error:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

/**
 * SMTP Email Service (Nodemailer)
 */
class SMTPService {
  constructor() {
    this.host = process.env.SMTP_HOST || '';
    this.port = parseInt(process.env.SMTP_PORT) || 587;
    this.secure = process.env.SMTP_SECURE === 'true';
    this.user = process.env.SMTP_USER || '';
    this.pass = process.env.SMTP_PASS || '';
    this.fromEmail = process.env.EMAIL_FROM || this.user || 'noreply@yourmlm.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'MLM Platform';
    this.transporter = null;
  }

  isConfigured() {
    return !!(this.host && this.user && this.pass);
  }

  getTransporter() {
    if (!this.transporter && this.isConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: this.host,
        port: this.port,
        secure: this.secure,
        auth: {
          user: this.user,
          pass: this.pass
        }
      });
    }
    return this.transporter;
  }

  async sendEmail(to, subject, html, text = '') {
    if (!this.isConfigured()) {
      console.log(`[DEV MODE] Email to ${to}: ${subject}`);
      return { success: true, devMode: true, message: 'Email logged (SMTP not configured)' };
    }

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        text: text || html.replace(/<[^>]*>/g, ''),
        html
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('SMTP Error:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

/**
 * Console Email Service (for development/testing)
 */
class ConsoleEmailService {
  async sendEmail(to, subject, html, text = '') {
    console.log('\n========== EMAIL MESSAGE ==========');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html.substring(0, 200)}...`);
    console.log('===================================\n');
    return { success: true, devMode: true };
  }

  isConfigured() {
    return true;
  }
}

/**
 * Email Service Factory - Auto-selects available provider
 */
class EmailServiceFactory {
  static getService() {
    const sendgrid = new SendGridService();
    const smtp = new SMTPService();

    if (sendgrid.isConfigured()) {
      console.log('📧 Using SendGrid for Email');
      return sendgrid;
    }

    if (smtp.isConfigured()) {
      console.log('📧 Using SMTP for Email');
      return smtp;
    }

    console.log('📧 Using Console Email (Development Mode)');
    return new ConsoleEmailService();
  }
}

/**
 * Email Templates
 */
const EmailTemplates = {
  // Welcome Email
  welcome: (userName, loginUrl) => ({
    subject: 'Welcome to MLM Platform! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MLM Platform!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Thank you for joining our platform! Your account has been created successfully.</p>
            <p>You can now:</p>
            <ul>
              <li>💰 Make deposits and investments</li>
              <li>📈 Track your earnings in real-time</li>
              <li>👥 Build your network and earn referral bonuses</li>
              <li>💸 Withdraw your earnings anytime</li>
            </ul>
            <a href="${loginUrl}" class="button">Login to Your Account</a>
            <p>If you have any questions, our support team is here to help!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MLM Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // OTP Email
  otp: (otp, purpose = 'verification') => ({
    subject: `Your Verification Code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; text-align: center; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #667eea; }
          .warning { color: #e74c3c; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Verification Code</h2>
          </div>
          <div class="content">
            <p>Your ${purpose} code is:</p>
            <div class="otp-box">${otp}</div>
            <p>This code is valid for <strong>10 minutes</strong>.</p>
            <p class="warning">⚠️ Do not share this code with anyone. Our team will never ask for your OTP.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Deposit Confirmation
  depositConfirmed: (userName, amount, currency, newBalance) => ({
    subject: `Deposit Confirmed: ${amount} ${currency} 💰`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount { font-size: 36px; color: #27ae60; font-weight: bold; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Deposit Confirmed</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your deposit has been confirmed and credited to your account!</p>
            <div class="amount">+${amount} ${currency}</div>
            <div class="details">
              <p><strong>New Balance:</strong> ${newBalance} ${currency}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>You can now use these funds to make investments.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Withdrawal Request
  withdrawalRequested: (userName, amount, currency, walletAddress) => ({
    subject: `Withdrawal Request Submitted: ${amount} ${currency}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f39c12; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⏳ Withdrawal Pending</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your withdrawal request has been submitted and is pending approval.</p>
            <div class="details">
              <p><strong>Amount:</strong> ${amount} ${currency}</p>
              <p><strong>Wallet:</strong> ${walletAddress}</p>
              <p><strong>Status:</strong> Pending Review</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>We typically process withdrawals within 24-48 hours. You'll receive a confirmation email once it's completed.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Withdrawal Approved
  withdrawalApproved: (userName, amount, currency, txHash) => ({
    subject: `Withdrawal Completed: ${amount} ${currency} ✅`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount { font-size: 36px; color: #27ae60; font-weight: bold; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Withdrawal Completed</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Great news! Your withdrawal has been processed successfully.</p>
            <div class="amount">${amount} ${currency}</div>
            ${txHash ? `<p><strong>Transaction Hash:</strong> ${txHash}</p>` : ''}
            <p>The funds have been sent to your wallet address. Please allow some time for blockchain confirmation.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Investment Confirmed
  investmentConfirmed: (userName, planName, amount, dailyReturn, duration) => ({
    subject: `Investment Activated: ${planName} 📈`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .plan-card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 Investment Activated!</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your investment has been activated successfully!</p>
            <div class="plan-card">
              <h3>${planName}</h3>
              <p><strong>Investment:</strong> $${amount}</p>
              <p><strong>Daily Return:</strong> ${dailyReturn}%</p>
              <p><strong>Duration:</strong> ${duration} days</p>
            </div>
            <p>Your earnings will be credited daily to your account balance. Track your progress in the dashboard!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Daily Earning
  dailyEarning: (userName, amount, planName, totalEarned) => ({
    subject: `Daily Earning Credited: +$${amount} 💵`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .earning { font-size: 36px; color: #27ae60; font-weight: bold; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>💵 Daily Earning</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your daily earning from <strong>${planName}</strong> has been credited!</p>
            <div class="earning">+$${amount}</div>
            <p><strong>Total Earned:</strong> $${totalEarned}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Referral Commission
  referralCommission: (userName, amount, referredUserName, type) => ({
    subject: `Referral Commission Earned: +$${amount} 🎁`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #9b59b6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .commission { font-size: 36px; color: #9b59b6; font-weight: bold; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎁 Referral Bonus!</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Great news! You earned a ${type} commission!</p>
            <div class="commission">+$${amount}</div>
            <p>From: <strong>${referredUserName}</strong></p>
            <p>Keep growing your network to earn more!</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Password Reset
  passwordReset: (resetLink) => ({
    subject: 'Password Reset Request 🔐',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Password Reset</h2>
          </div>
          <div class="content">
            <p>You requested to reset your password.</p>
            <p>Click the button below to set a new password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>This link is valid for 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // KYC Approved
  kycApproved: (userName) => ({
    subject: 'KYC Verification Approved ✅',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ KYC Approved!</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Congratulations! Your KYC verification has been approved.</p>
            <p>You now have full access to all platform features including:</p>
            <ul>
              <li>Unlimited withdrawals</li>
              <li>Higher transaction limits</li>
              <li>Priority support</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Email Service Wrapper with all methods
class EmailServiceWrapper {
  constructor(provider) {
    this.provider = provider;
  }

  async sendEmail(to, subject, html, text = '') {
    return this.provider.sendEmail(to, subject, html, text);
  }

  async sendOTP(to, { otp, expiresIn = '10', purpose = 'verification' }) {
    const subject = `${purpose === 'email verification' ? 'Email' : 'One Time'} Verification Code`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${purpose === 'email verification' ? 'Verify Your Email' : 'Your One Time Password'}</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your verification code is:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This code will expire in <strong>${expiresIn} minutes</strong>.</p>
            <p>Please do not share this code with anyone. If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br/>MLM Platform Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 MLM Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendWelcome(to, { name, username, email, referrer, loginUrl }) {
    const subject = 'Welcome to MLM Platform! 🎉';
    const html = EmailTemplates.welcome(name || username, loginUrl);
    return this.sendEmail(to, subject, html);
  }

  async sendPasswordReset(to, { name, resetLink, expiresIn = '1 hour' }) {
    const subject = 'Password Reset Request';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>We received a request to reset your password. Click the link below to reset it:</p>
            <p><a href="${resetLink}" class="button">Reset Password</a></p>
            <p>This link will expire in <strong>${expiresIn}</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendPasswordChanged(to, { name }) {
    const subject = 'Password Changed Successfully';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Password Changed</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your password has been successfully changed. If you didn't make this change, please contact support immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendInvestmentConfirmed(to, { name, amount, currency = 'USD', plan, returns }) {
    const subject = `Investment Confirmed: ${amount} ${currency}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount { font-size: 28px; color: #27ae60; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Investment Confirmed</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your investment has been confirmed!</p>
            <div class="amount">${amount} ${currency}</div>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Expected Returns:</strong> ${returns}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendWithdrawalRequested(to, { name, amount, currency = 'USD', walletAddress }) {
    const subject = `Withdrawal Request: ${amount} ${currency}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f39c12; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⏳ Withdrawal Request Received</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your withdrawal request has been received and is being processed.</p>
            <p><strong>Amount:</strong> ${amount} ${currency}</p>
            <p>You will receive a confirmation email once the withdrawal is completed.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendWithdrawalApproved(to, { name, amount, currency = 'USD', walletAddress, expectedTime }) {
    const subject = `Withdrawal Approved: ${amount} ${currency}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Withdrawal Approved</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your withdrawal has been approved!</p>
            <p><strong>Amount:</strong> ${amount} ${currency}</p>
            <p><strong>Expected Time:</strong> ${expectedTime}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendWithdrawalRejected(to, { name, amount, currency = 'USD', reason }) {
    const subject = `Withdrawal Rejected: ${amount} ${currency}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>❌ Withdrawal Rejected</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your withdrawal request has been rejected.</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendKYCApproved(to, { name }) {
    const subject = '✅ KYC Approved!';
    const html = EmailTemplates.kycApproved(name);
    return this.sendEmail(to, subject, html);
  }

  async sendKYCRejected(to, { name, reason }) {
    const subject = '❌ KYC Rejected';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>KYC Verification Rejected</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Unfortunately, your KYC verification has been rejected.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>Please contact support for more information.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(to, subject, html);
  }

  async send(to, subject, html) {
    return this.sendEmail(to, subject, html);
  }
}

// Export instances
const provider = EmailServiceFactory.getService();
const emailService = new EmailServiceWrapper(provider);

module.exports = {
  SendGridService,
  SMTPService,
  ConsoleEmailService,
  EmailServiceFactory,
  EmailServiceWrapper,
  EmailTemplates,
  emailService
};
