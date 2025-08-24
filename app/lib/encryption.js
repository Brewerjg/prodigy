import crypto from 'crypto';
import { KeyManagementServiceClient } from '@google-cloud/kms';

const ALGORITHM = 'aes-256-gcm';

class EncryptionService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.kmsClient = this.isProduction ? new KeyManagementServiceClient() : null;
    this.masterKey = this.isProduction ? null : process.env.ENCRYPTION_MASTER_KEY;
  }

  /**
   * Generate a new data encryption key (DEK) for a tenant
   */
  async generateDataEncryptionKey() {
    if (this.isProduction) {
      return this.generateDEKWithKMS();
    } else {
      return this.generateDEKLocally();
    }
  }

  /**
   * Production: Generate DEK using Google Cloud KMS
   */
  async generateDEKWithKMS() {
    const keyName = this.kmsClient.cryptoKeyPath(
      process.env.GOOGLE_CLOUD_PROJECT_ID,
      process.env.GOOGLE_CLOUD_KMS_LOCATION,
      process.env.GOOGLE_CLOUD_KMS_KEY_RING,
      process.env.GOOGLE_CLOUD_KMS_KEY
    );

    // Generate a new data encryption key
    const plainDEK = crypto.randomBytes(32); // 256-bit key
    
    // Encrypt the DEK with KMS
    const [encryptResponse] = await this.kmsClient.encrypt({
      name: keyName,
      plaintext: plainDEK,
    });

    return {
      plainDEK: plainDEK.toString('base64'),
      encryptedDEK: Buffer.from(encryptResponse.ciphertext).toString('base64')
    };
  }

  /**
   * Development: Generate DEK using local master key
   */
  generateDEKLocally() {
    if (!this.masterKey) {
      throw new Error('ENCRYPTION_MASTER_KEY not set for development environment');
    }

    const plainDEK = crypto.randomBytes(32); // 256-bit key
    
    // For development, use a simple base64 encoding with master key
    // In production, this would use proper KMS encryption
    const combined = this.masterKey + ':' + plainDEK.toString('base64');
    const encryptedDEK = Buffer.from(combined).toString('base64');

    return {
      plainDEK: plainDEK.toString('base64'),
      encryptedDEK
    };
  }

  /**
   * Decrypt a tenant's data encryption key
   */
  async decryptDataEncryptionKey(encryptedDEK) {
    if (this.isProduction) {
      return this.decryptDEKWithKMS(encryptedDEK);
    } else {
      return this.decryptDEKLocally(encryptedDEK);
    }
  }

  /**
   * Production: Decrypt DEK using Google Cloud KMS
   */
  async decryptDEKWithKMS(encryptedDEK) {
    const keyName = this.kmsClient.cryptoKeyPath(
      process.env.GOOGLE_CLOUD_PROJECT_ID,
      process.env.GOOGLE_CLOUD_KMS_LOCATION,
      process.env.GOOGLE_CLOUD_KMS_KEY_RING,
      process.env.GOOGLE_CLOUD_KMS_KEY
    );

    const [decryptResponse] = await this.kmsClient.decrypt({
      name: keyName,
      ciphertext: Buffer.from(encryptedDEK, 'base64'),
    });

    return Buffer.from(decryptResponse.plaintext).toString('base64');
  }

  /**
   * Development: Decrypt DEK using local master key
   */
  decryptDEKLocally(encryptedDEK) {
    if (!this.masterKey) {
      throw new Error('ENCRYPTION_MASTER_KEY not set for development environment');
    }

    // For development, decode the simple base64 encoding
    const combined = Buffer.from(encryptedDEK, 'base64').toString();
    const parts = combined.split(':');
    
    if (parts.length !== 2 || parts[0] !== this.masterKey) {
      throw new Error('Invalid encrypted DEK format or wrong master key');
    }
    
    return parts[1]; // Return the plain DEK in base64 format
  }

  /**
   * Encrypt data using a tenant's DEK
   */
  encryptData(plaintext, dekBase64) {
    if (!this.isProduction) {
      // Simple development encryption - just base64 encode with DEK prefix
      const combined = dekBase64 + ':' + plaintext;
      return Buffer.from(combined).toString('base64');
    }
    
    const dek = Buffer.from(dekBase64, 'base64');
    const iv = crypto.randomBytes(16); // 128-bit IV for AES
    const cipher = crypto.createCipher('aes-256-cbc', dek);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data using a tenant's DEK
   */
  decryptData(encryptedData, dekBase64) {
    if (!this.isProduction) {
      // Simple development decryption
      const combined = Buffer.from(encryptedData, 'base64').toString();
      const parts = combined.split(':');
      
      if (parts.length !== 2 || parts[0] !== dekBase64) {
        throw new Error('Invalid encrypted data format or wrong DEK');
      }
      
      return parts[1]; // Return the original plaintext
    }
    
    const dek = Buffer.from(dekBase64, 'base64');
    const parts = encryptedData.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher('aes-256-cbc', dek);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash password for user authentication
   */
  async hashPassword(password) {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, 12);
  }

  /**
   * Verify password
   */
  async verifyPassword(password, hash) {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  }
}

export default new EncryptionService();