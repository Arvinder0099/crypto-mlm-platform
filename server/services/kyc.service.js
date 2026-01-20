/**
 * KYC (Know Your Customer) Service
 * 
 * Features:
 * - Document upload handling (passport, ID, selfie)
 * - Document verification workflow
 * - Status management
 * - Admin approval/rejection
 * - S3/Local file storage
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Multer configuration for file uploads
const multerConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5 // Max 5 files per request
  },
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf'
  ],
  storageDir: process.env.KYC_STORAGE_DIR || path.join(__dirname, '../../uploads/kyc')
};

/**
 * Local File Storage
 */
class LocalStorageService {
  constructor(baseDir = multerConfig.storageDir) {
    this.baseDir = baseDir;
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  generateFileName(userId, docType, originalName) {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(8).toString('hex');
    return `${userId}_${docType}_${Date.now()}_${hash}${ext}`;
  }

  async saveFile(userId, docType, buffer, originalName) {
    const fileName = this.generateFileName(userId, docType, originalName);
    const filePath = path.join(this.baseDir, fileName);
    
    await fs.promises.writeFile(filePath, buffer);
    
    return {
      fileName,
      filePath,
      url: `/uploads/kyc/${fileName}` // Relative URL for serving
    };
  }

  async deleteFile(fileName) {
    const filePath = path.join(this.baseDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async getFile(fileName) {
    const filePath = path.join(this.baseDir, fileName);
    if (fs.existsSync(filePath)) {
      return fs.promises.readFile(filePath);
    }
    throw new Error('File not found');
  }
}

/**
 * S3 File Storage (for production)
 */
class S3StorageService {
  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET || 'mlm-kyc-documents';
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.client = null;
  }

  isConfigured() {
    return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }

  getClient() {
    if (!this.client && this.isConfigured()) {
      const { S3Client } = require('@aws-sdk/client-s3');
      this.client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
    }
    return this.client;
  }

  generateKey(userId, docType, originalName) {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(8).toString('hex');
    return `kyc/${userId}/${docType}_${Date.now()}_${hash}${ext}`;
  }

  async saveFile(userId, docType, buffer, originalName, contentType) {
    if (!this.isConfigured()) {
      console.log('[KYC] S3 not configured, file not uploaded');
      return null;
    }

    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    const key = this.generateKey(userId, docType, originalName);

    await this.getClient().send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: 'AES256'
    }));

    return {
      key,
      url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
    };
  }

  async deleteFile(key) {
    if (!this.isConfigured()) return;

    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    await this.getClient().send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    }));
  }

  async getSignedUrl(key, expiresIn = 3600) {
    if (!this.isConfigured()) return null;

    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    return getSignedUrl(this.getClient(), command, { expiresIn });
  }
}

/**
 * KYC Document Types
 */
const KYCDocumentTypes = {
  PASSPORT: 'passport',
  NATIONAL_ID: 'national_id',
  DRIVERS_LICENSE: 'drivers_license',
  SELFIE: 'selfie',
  SELFIE_WITH_ID: 'selfie_with_id',
  PROOF_OF_ADDRESS: 'proof_of_address',
  UTILITY_BILL: 'utility_bill',
  BANK_STATEMENT: 'bank_statement'
};

/**
 * KYC Status Values
 */
const KYCStatus = {
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

/**
 * KYC Level Requirements
 */
const KYCLevels = {
  0: {
    name: 'Unverified',
    requiredDocs: [],
    dailyWithdrawalLimit: 0,
    features: []
  },
  1: {
    name: 'Basic',
    requiredDocs: [KYCDocumentTypes.SELFIE],
    dailyWithdrawalLimit: 100,
    features: ['small_withdrawals']
  },
  2: {
    name: 'Intermediate',
    requiredDocs: [KYCDocumentTypes.NATIONAL_ID, KYCDocumentTypes.SELFIE],
    dailyWithdrawalLimit: 1000,
    features: ['medium_withdrawals', 'referral_bonus']
  },
  3: {
    name: 'Advanced',
    requiredDocs: [KYCDocumentTypes.NATIONAL_ID, KYCDocumentTypes.SELFIE_WITH_ID, KYCDocumentTypes.PROOF_OF_ADDRESS],
    dailyWithdrawalLimit: 10000,
    features: ['large_withdrawals', 'priority_support', 'premium_plans']
  }
};

/**
 * Main KYC Service
 */
class KYCService {
  constructor(dbModels) {
    this.User = dbModels?.User;
    
    // Choose storage based on environment
    if (process.env.KYC_STORAGE === 's3') {
      this.storage = new S3StorageService();
    } else {
      this.storage = new LocalStorageService();
    }
  }

  /**
   * Get KYC status for a user
   */
  async getKYCStatus(userId) {
    const user = await this.User.findById(userId);
    if (!user) throw new Error('User not found');

    return {
      level: user.kycLevel || 0,
      status: user.kycStatus || KYCStatus.NOT_SUBMITTED,
      submittedAt: user.kycSubmittedAt,
      reviewedAt: user.kycReviewedAt,
      documents: user.kycDocuments || [],
      rejectionReason: user.kycRejectionReason,
      nextLevel: this.getNextLevelRequirements(user.kycLevel || 0)
    };
  }

  /**
   * Get requirements for next KYC level
   */
  getNextLevelRequirements(currentLevel) {
    const nextLevel = currentLevel + 1;
    if (nextLevel > 3) return null;

    return {
      level: nextLevel,
      ...KYCLevels[nextLevel]
    };
  }

  /**
   * Submit KYC documents
   */
  async submitDocuments(userId, documents) {
    const user = await this.User.findById(userId);
    if (!user) throw new Error('User not found');

    // Validate documents
    const validatedDocs = [];
    for (const doc of documents) {
      if (!multerConfig.allowedMimeTypes.includes(doc.mimetype)) {
        throw new Error(`Invalid file type for ${doc.docType}: ${doc.mimetype}`);
      }

      if (doc.size > multerConfig.limits.fileSize) {
        throw new Error(`File too large: ${doc.originalname}`);
      }

      // Save file
      const savedFile = await this.storage.saveFile(
        userId,
        doc.docType,
        doc.buffer,
        doc.originalname,
        doc.mimetype
      );

      validatedDocs.push({
        docType: doc.docType,
        fileName: savedFile.fileName || savedFile.key,
        url: savedFile.url,
        uploadedAt: new Date(),
        status: 'pending'
      });
    }

    // Update user KYC documents
    user.kycDocuments = [...(user.kycDocuments || []), ...validatedDocs];
    user.kycStatus = KYCStatus.PENDING;
    user.kycSubmittedAt = new Date();
    await user.save();

    return {
      success: true,
      status: KYCStatus.PENDING,
      documents: validatedDocs,
      message: 'Documents submitted successfully. Verification typically takes 24-48 hours.'
    };
  }

  /**
   * Admin: Get all pending KYC submissions
   */
  async getPendingSubmissions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const submissions = await this.User.find({
      kycStatus: { $in: [KYCStatus.PENDING, KYCStatus.UNDER_REVIEW] }
    })
      .select('name email phone kycLevel kycStatus kycDocuments kycSubmittedAt')
      .sort({ kycSubmittedAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await this.User.countDocuments({
      kycStatus: { $in: [KYCStatus.PENDING, KYCStatus.UNDER_REVIEW] }
    });

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Admin: Approve KYC submission
   */
  async approveKYC(userId, adminId, level = null) {
    const user = await this.User.findById(userId);
    if (!user) throw new Error('User not found');

    const newLevel = level || Math.min((user.kycLevel || 0) + 1, 3);

    user.kycStatus = KYCStatus.APPROVED;
    user.kycLevel = newLevel;
    user.kycReviewedAt = new Date();
    user.kycReviewedBy = adminId;
    user.kycRejectionReason = null;

    // Mark all pending documents as approved
    if (user.kycDocuments) {
      user.kycDocuments = user.kycDocuments.map(doc => ({
        ...doc,
        status: doc.status === 'pending' ? 'approved' : doc.status
      }));
    }

    await user.save();

    return {
      success: true,
      userId,
      newLevel,
      status: KYCStatus.APPROVED,
      limits: KYCLevels[newLevel]
    };
  }

  /**
   * Admin: Reject KYC submission
   */
  async rejectKYC(userId, adminId, reason) {
    const user = await this.User.findById(userId);
    if (!user) throw new Error('User not found');

    user.kycStatus = KYCStatus.REJECTED;
    user.kycReviewedAt = new Date();
    user.kycReviewedBy = adminId;
    user.kycRejectionReason = reason;

    // Mark all pending documents as rejected
    if (user.kycDocuments) {
      user.kycDocuments = user.kycDocuments.map(doc => ({
        ...doc,
        status: doc.status === 'pending' ? 'rejected' : doc.status
      }));
    }

    await user.save();

    return {
      success: true,
      userId,
      status: KYCStatus.REJECTED,
      reason
    };
  }

  /**
   * Check if user can perform action based on KYC level
   */
  canPerformAction(kycLevel, action) {
    const level = KYCLevels[kycLevel] || KYCLevels[0];
    return level.features.includes(action);
  }

  /**
   * Get withdrawal limit based on KYC level
   */
  getWithdrawalLimit(kycLevel) {
    const level = KYCLevels[kycLevel] || KYCLevels[0];
    return level.dailyWithdrawalLimit;
  }

  /**
   * Delete old rejected documents (cleanup)
   */
  async cleanupRejectedDocuments(olderThanDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const users = await this.User.find({
      kycStatus: KYCStatus.REJECTED,
      kycReviewedAt: { $lt: cutoffDate }
    });

    let deletedCount = 0;

    for (const user of users) {
      if (user.kycDocuments) {
        for (const doc of user.kycDocuments) {
          if (doc.status === 'rejected') {
            try {
              await this.storage.deleteFile(doc.fileName);
              deletedCount++;
            } catch (e) {
              console.error(`Failed to delete ${doc.fileName}:`, e.message);
            }
          }
        }

        // Remove rejected docs from user
        user.kycDocuments = user.kycDocuments.filter(d => d.status !== 'rejected');
        await user.save();
      }
    }

    return { deletedCount };
  }
}

/**
 * Multer configuration helper
 */
function createMulterConfig() {
  const multer = require('multer');

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (multerConfig.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  };

  return multer({
    storage,
    limits: multerConfig.limits,
    fileFilter
  });
}

module.exports = {
  KYCService,
  KYCDocumentTypes,
  KYCStatus,
  KYCLevels,
  LocalStorageService,
  S3StorageService,
  createMulterConfig,
  multerConfig
};
