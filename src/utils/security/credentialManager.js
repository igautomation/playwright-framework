/**
 * Credential Manager
 * 
 * Securely manages credentials for tests
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

class CredentialManager {
  constructor(options = {}) {
    this.options = options;
    this.envPrefix = options.envPrefix || '';
    this.secretsFile = options.secretsFile || path.join(os.homedir(), '.playwright-secrets');
    this.algorithm = 'aes-256-gcm';
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-replace-in-production';
    
    // Create secrets file if it doesn't exist
    if (!fs.existsSync(this.secretsFile)) {
      fs.writeFileSync(this.secretsFile, JSON.stringify({}), 'utf8');
      fs.chmodSync(this.secretsFile, 0o600); // Secure permissions
    }
  }

  /**
   * Get a credential from environment variables or secrets file
   * @param {string} key - Credential key
   * @param {string} defaultValue - Default value if not found
   * @returns {string} The credential value
   */
  getCredential(key, defaultValue = '') {
    // First check environment variables
    const envKey = `${this.envPrefix}${key}`.toUpperCase();
    if (process.env[envKey]) {
      return process.env[envKey];
    }
    
    // Then check secrets file
    try {
      const secrets = JSON.parse(fs.readFileSync(this.secretsFile, 'utf8'));
      if (secrets[key]) {
        return this.decrypt(secrets[key]);
      }
    } catch (error) {
      console.warn(`Error reading secrets file: ${error.message}`);
    }
    
    // Return default value if not found
    return defaultValue;
  }

  /**
   * Store a credential in the secrets file
   * @param {string} key - Credential key
   * @param {string} value - Credential value
   */
  storeCredential(key, value) {
    try {
      const secrets = JSON.parse(fs.readFileSync(this.secretsFile, 'utf8'));
      secrets[key] = this.encrypt(value);
      fs.writeFileSync(this.secretsFile, JSON.stringify(secrets, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error storing credential: ${error.message}`);
      throw error;
    }
  }

  /**
   * Encrypt a value
   * @param {string} text - Text to encrypt
   * @returns {string} Encrypted text
   */
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm, 
      crypto.createHash('sha256').update(this.encryptionKey).digest(), 
      iv
    );
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt a value
   * @param {string} encryptedText - Text to decrypt
   * @returns {string} Decrypted text
   */
  decrypt(encryptedText) {
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm, 
      crypto.createHash('sha256').update(this.encryptionKey).digest(), 
      iv
    );
    
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

module.exports = CredentialManager;