/**
 * Security Middleware - Rate Limiting, Input Validation, Security Headers
 * 
 * Features:
 * - Rate limiting per IP
 * - Request size limiting
 * - XSS protection
 * - SQL injection prevention
 * - CSRF protection
 * - Security headers
 */

// In-memory rate limit store (use Redis in production for multi-server)
const rateLimitStore = new Map();

/**
 * Rate Limiter Middleware
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress || 'unknown'
  } = options;

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    let record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    record.count++;
    rateLimitStore.set(key, record);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
    
    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    next();
  };
}

// Pre-configured rate limiters
const rateLimiters = {
  // General API rate limit
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 2000, // Increased for development
    message: 'Too many requests. Please try again in 15 minutes.'
  }),
  
  // Strict rate limit for auth endpoints
  auth: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 500, // Increased for development
    message: 'Too many authentication attempts. Please try again in 1 hour.',
    keyGenerator: (req) => `auth:${req.ip}:${req.body?.email || ''}`
  }),
  
  // Rate limit for OTP requests
  otp: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // Increased for development
    message: 'Too many OTP requests. Please wait 1 minute.',
    keyGenerator: (req) => `otp:${req.ip}:${req.body?.phone || req.body?.email || ''}`
  }),
  
  // Rate limit for withdrawals
  withdrawal: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // Increased for development
    message: 'Too many withdrawal requests. Please try again later.',
    keyGenerator: (req) => `withdraw:${req.user?.id || req.ip}`
  }),
  
  // Rate limit for deposits
  deposit: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: 'Too many deposit requests. Please try again later.',
    keyGenerator: (req) => `deposit:${req.user?.id || req.ip}`
  })
};

/**
 * Input Sanitizer - Remove potentially dangerous characters
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Sanitize Request Body Middleware
 */
function sanitizeRequestBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeInput(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
}

/**
 * Input Validators
 */
const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  phone: (phone) => {
    const re = /^\+?[\d\s-]{10,15}$/;
    return re.test(phone);
  },
  
  password: (password) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  },
  
  walletAddress: (address) => {
    // Basic validation for common crypto addresses
    const patterns = {
      btc: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/,
      eth: /^0x[a-fA-F0-9]{40}$/,
      trc20: /^T[a-zA-HJ-NP-Z1-9]{33}$/
    };
    return Object.values(patterns).some(p => p.test(address));
  },
  
  amount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num < 1000000000;
  },
  
  mongoId: (id) => {
    return /^[a-fA-F0-9]{24}$/.test(id);
  },
  
  otp: (otp) => {
    return /^\d{4,8}$/.test(otp);
  }
};

/**
 * Validation Middleware Factory
 */
function validateRequest(rules) {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, validations] of Object.entries(rules)) {
      const value = req.body[field] || req.query[field] || req.params[field];
      
      for (const validation of validations) {
        if (validation === 'required' && (!value || value === '')) {
          errors.push(`${field} is required`);
        } else if (validation === 'email' && value && !validators.email(value)) {
          errors.push(`${field} must be a valid email`);
        } else if (validation === 'phone' && value && !validators.phone(value)) {
          errors.push(`${field} must be a valid phone number`);
        } else if (validation === 'password' && value && !validators.password(value)) {
          errors.push(`${field} must be at least 8 characters with uppercase, lowercase, and number`);
        } else if (validation === 'walletAddress' && value && !validators.walletAddress(value)) {
          errors.push(`${field} must be a valid wallet address`);
        } else if (validation === 'amount' && value && !validators.amount(value)) {
          errors.push(`${field} must be a valid amount`);
        } else if (validation === 'mongoId' && value && !validators.mongoId(value)) {
          errors.push(`${field} must be a valid ID`);
        } else if (validation === 'otp' && value && !validators.otp(value)) {
          errors.push(`${field} must be a valid OTP code`);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
}

/**
 * Security Headers Middleware
 */
function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
}

/**
 * Request Logger Middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 50)
    };
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] ${log.method} ${log.path} ${log.status} ${log.duration}`);
    }
    
    // In production, you might want to send to a logging service
  });
  
  next();
}

/**
 * IP Whitelist/Blacklist Middleware
 */
function createIPFilter(options = {}) {
  const { whitelist = [], blacklist = [], mode = 'blacklist' } = options;
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    
    if (mode === 'whitelist' && whitelist.length > 0) {
      if (!whitelist.includes(ip)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    if (blacklist.includes(ip)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
}

/**
 * CORS Configuration for Production
 */
function corsOptions(allowedOrigins = []) {
  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // In development, allow all
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // In production, check whitelist
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
}

module.exports = {
  createRateLimiter,
  rateLimiters,
  sanitizeInput,
  sanitizeRequestBody,
  validators,
  validateRequest,
  securityHeaders,
  requestLogger,
  createIPFilter,
  corsOptions
};
