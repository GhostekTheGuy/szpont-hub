import crypto from 'crypto';

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

// --- Key Derivation ---

export async function deriveKEK(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

// --- AES-256-GCM Encryption/Decryption ---

export function encrypt(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:ciphertext (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decrypt(encryptedStr: string, key: Buffer): string {
  const parts = encryptedStr.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');
  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const encrypted = Buffer.from(parts[2], 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

// --- Key Generation ---

export function generateDEK(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

export function generateSalt(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

// --- DEK Encryption (with KEK) ---

export function encryptDEK(dek: Buffer, kek: Buffer): string {
  return encrypt(dek.toString('base64'), kek);
}

export function decryptDEK(encryptedDek: string, kek: Buffer): Buffer {
  const dekBase64 = decrypt(encryptedDek, kek);
  return Buffer.from(dekBase64, 'base64');
}

// --- Cookie Encryption (with COOKIE_SECRET) ---

function getCookieKey(): Buffer {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) throw new Error('COOKIE_SECRET environment variable is not set');
  return Buffer.from(secret, 'hex');
}

export function encryptForCookie(dek: Buffer): string {
  const cookieKey = getCookieKey();
  return encrypt(dek.toString('base64'), cookieKey);
}

export function decryptFromCookie(encryptedCookie: string): Buffer {
  const cookieKey = getCookieKey();
  const dekBase64 = decrypt(encryptedCookie, cookieKey);
  return Buffer.from(dekBase64, 'base64');
}

// --- Number Field Helpers ---

export function encryptNumber(value: number, dek: Buffer): string {
  return encrypt(value.toString(), dek);
}

export function decryptNumber(encryptedValue: string, dek: Buffer): number {
  // Guard for unencrypted data (migration compatibility)
  if (typeof encryptedValue === 'number') return encryptedValue;
  if (typeof encryptedValue === 'string' && !encryptedValue.includes(':')) {
    return parseFloat(encryptedValue);
  }
  const decrypted = decrypt(encryptedValue, dek);
  return parseFloat(decrypted);
}
