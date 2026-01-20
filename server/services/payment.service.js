/**
 * Payment Service - CoinPayments Integration for Real Crypto Payments
 * Supports: USDT, BTC, ETH, LTC, and more
 * 
 * Setup Instructions:
 * 1. Create account at https://www.coinpayments.net
 * 2. Go to Account -> API Keys
 * 3. Generate new API keys
 * 4. Add keys to .env file
 */

const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

class CoinPaymentsService {
  constructor() {
    this.apiKey = process.env.COINPAYMENTS_API_KEY || '';
    this.apiSecret = process.env.COINPAYMENTS_API_SECRET || '';
    this.ipnSecret = process.env.COINPAYMENTS_IPN_SECRET || '';
    this.merchantId = process.env.COINPAYMENTS_MERCHANT_ID || '';
    this.apiUrl = 'https://www.coinpayments.net/api.php';
  }

  /**
   * Check if CoinPayments is configured
   */
  isConfigured() {
    return !!(this.apiKey && this.apiSecret);
  }

  /**
   * Make API request to CoinPayments
   */
  async makeRequest(cmd, params = {}) {
    if (!this.isConfigured()) {
      throw new Error('CoinPayments not configured. Add API keys to .env file.');
    }

    const payload = {
      version: 1,
      key: this.apiKey,
      cmd,
      format: 'json',
      ...params
    };

    const payloadString = querystring.stringify(payload);
    const hmac = crypto.createHmac('sha512', this.apiSecret);
    hmac.update(payloadString);
    const signature = hmac.digest('hex');

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.coinpayments.net',
        path: '/api.php',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'HMAC': signature,
          'Content-Length': Buffer.byteLength(payloadString)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.error !== 'ok') {
              reject(new Error(result.error || 'API request failed'));
            } else {
              resolve(result.result);
            }
          } catch (e) {
            reject(new Error('Invalid API response'));
          }
        });
      });

      req.on('error', reject);
      req.write(payloadString);
      req.end();
    });
  }

  /**
   * Get account info and supported currencies
   */
  async getAccountInfo() {
    return this.makeRequest('get_basic_info');
  }

  /**
   * Get list of supported currencies and their rates
   */
  async getRates(accepted = 1) {
    return this.makeRequest('rates', { accepted });
  }

  /**
   * Create a deposit address for a user
   * @param {string} currency - Currency code (USDT, BTC, ETH, etc.)
   * @param {string} ipnUrl - IPN callback URL for payment notifications
   * @param {string} label - User identifier label
   */
  async createDepositAddress(currency, ipnUrl, label = '') {
    return this.makeRequest('get_callback_address', {
      currency,
      ipn_url: ipnUrl,
      label
    });
  }

  /**
   * Create a payment/invoice for deposit
   * @param {number} amount - Amount to pay
   * @param {string} currency1 - Currency user pays in (USDT, BTC, etc.)
   * @param {string} currency2 - Currency you receive (usually same as currency1)
   * @param {string} buyerEmail - User's email
   * @param {string} itemName - Description of the payment
   * @param {string} ipnUrl - IPN callback URL
   * @param {string} custom - Custom data (user ID, etc.)
   */
  async createPayment(amount, currency1, currency2, buyerEmail, itemName, ipnUrl, custom = '') {
    return this.makeRequest('create_transaction', {
      amount,
      currency1,
      currency2: currency2 || currency1,
      buyer_email: buyerEmail,
      item_name: itemName,
      ipn_url: ipnUrl,
      custom
    });
  }

  /**
   * Get payment/transaction info
   * @param {string} txnId - Transaction ID from CoinPayments
   */
  async getPaymentInfo(txnId) {
    return this.makeRequest('get_tx_info', { txid: txnId });
  }

  /**
   * Create withdrawal to external address
   * @param {number} amount - Amount to send
   * @param {string} currency - Currency code
   * @param {string} address - Destination wallet address
   * @param {boolean} autoConfirm - Auto confirm withdrawal
   * @param {string} ipnUrl - IPN callback URL
   * @param {string} note - Optional note
   */
  async createWithdrawal(amount, currency, address, autoConfirm = false, ipnUrl = '', note = '') {
    return this.makeRequest('create_withdrawal', {
      amount,
      currency,
      address,
      auto_confirm: autoConfirm ? 1 : 0,
      ipn_url: ipnUrl,
      note
    });
  }

  /**
   * Get withdrawal info
   * @param {string} withdrawalId - Withdrawal ID
   */
  async getWithdrawalInfo(withdrawalId) {
    return this.makeRequest('get_withdrawal_info', { id: withdrawalId });
  }

  /**
   * Verify IPN (Instant Payment Notification) signature
   * @param {object} ipnData - IPN data from request body
   * @param {string} hmacHeader - HMAC header from request
   */
  verifyIPN(ipnData, hmacHeader) {
    if (!this.ipnSecret) {
      console.warn('IPN Secret not configured');
      return false;
    }

    const hmac = crypto.createHmac('sha512', this.ipnSecret);
    hmac.update(querystring.stringify(ipnData));
    const calculatedHmac = hmac.digest('hex');

    return calculatedHmac === hmacHeader;
  }

  /**
   * Get wallet balances
   */
  async getBalances(all = 0) {
    return this.makeRequest('balances', { all });
  }
}

// Alternative: NowPayments Integration (simpler setup)
class NowPaymentsService {
  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY || '';
    this.apiUrl = 'https://api.nowpayments.io/v1';
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    if (!this.isConfigured()) {
      throw new Error('NowPayments not configured. Add API key to .env file.');
    }

    const fetch = (await import('node-fetch')).default;
    
    const options = {
      method,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.apiUrl}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  async getStatus() {
    return this.makeRequest('/status');
  }

  async getCurrencies() {
    return this.makeRequest('/currencies');
  }

  async getMinimumAmount(currencyFrom, currencyTo = 'usd') {
    return this.makeRequest(`/min-amount?currency_from=${currencyFrom}&currency_to=${currencyTo}`);
  }

  async createPayment(priceAmount, priceCurrency, payCurrency, ipnCallbackUrl, orderId, orderDescription) {
    return this.makeRequest('/payment', 'POST', {
      price_amount: priceAmount,
      price_currency: priceCurrency,
      pay_currency: payCurrency,
      ipn_callback_url: ipnCallbackUrl,
      order_id: orderId,
      order_description: orderDescription
    });
  }

  async getPaymentStatus(paymentId) {
    return this.makeRequest(`/payment/${paymentId}`);
  }

  async createPayout(address, amount, currency, ipnCallbackUrl) {
    return this.makeRequest('/payout', 'POST', {
      address,
      amount,
      currency,
      ipn_callback_url: ipnCallbackUrl
    });
  }
}

// Manual/Simple Crypto Deposit Tracking (No API required)
class ManualCryptoService {
  constructor() {
    this.depositAddresses = {
      USDT_TRC20: process.env.DEPOSIT_WALLET_USDT_TRC20 || '',
      USDT_ERC20: process.env.DEPOSIT_WALLET_USDT_ERC20 || '',
      USDT_BEP20: process.env.DEPOSIT_WALLET_USDT_BEP20 || '',
      BTC: process.env.DEPOSIT_WALLET_BTC || '',
      ETH: process.env.DEPOSIT_WALLET_ETH || '',
      LTC: process.env.DEPOSIT_WALLET_LTC || '',
    };
  }

  getDepositAddress(currency) {
    return this.depositAddresses[currency] || this.depositAddresses.USDT_TRC20;
  }

  getAllDepositAddresses() {
    return Object.entries(this.depositAddresses)
      .filter(([_, address]) => address)
      .map(([currency, address]) => ({ currency, address }));
  }

  /**
   * For manual deposits, admin verifies and credits balance
   * This generates deposit instructions for the user
   */
  generateDepositInstructions(amount, currency = 'USDT_TRC20') {
    const address = this.getDepositAddress(currency);
    if (!address) {
      throw new Error(`No deposit address configured for ${currency}`);
    }

    return {
      address,
      currency,
      amount,
      network: currency.includes('TRC20') ? 'Tron (TRC20)' : 
               currency.includes('ERC20') ? 'Ethereum (ERC20)' :
               currency.includes('BEP20') ? 'BNB Smart Chain (BEP20)' : currency,
      instructions: [
        `Send exactly ${amount} ${currency.split('_')[0]} to the address below`,
        'Make sure to use the correct network',
        'Save your transaction hash for verification',
        'Submit the transaction hash in the deposit form',
        'Your balance will be credited after admin verification (usually within 24 hours)'
      ],
      warning: 'Sending to wrong network may result in permanent loss of funds!'
    };
  }
}

module.exports = {
  CoinPaymentsService,
  NowPaymentsService,
  ManualCryptoService,
  // Export singleton instances
  coinPayments: new CoinPaymentsService(),
  nowPayments: new NowPaymentsService(),
  manualCrypto: new ManualCryptoService()
};
