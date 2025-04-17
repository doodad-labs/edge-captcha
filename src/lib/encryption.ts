import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Encryption key management with rolling history:
 * - Maintains current and previous 256-bit (32-byte) AES keys (2-key system)
 * - Generates initial set of 2 cryptographically secure keys
 * - Automatically rotates keys every 5 minutes (300,000 ms):
 *   * Adds new key to beginning of array
 *   * Removes oldest key (position 2) to maintain size
 * - Provides seamless decryption during key transitions
 */
const keyHistory: Buffer[] = Array(2).fill(0).map(() => randomBytes(32));

// Key rotation - runs every 5 minutes (300,000 milliseconds)
setInterval(() => {
    // Add new key to front of array
    keyHistory.unshift(randomBytes(32));
    
    // Maintain fixed size of 2 keys by removing oldest
    if (keyHistory.length > 2) {
        keyHistory.pop();
    }
}, 5 * 60 * 1000);

// Current key is always the first in the array
const getCurrentKey = (): Buffer => keyHistory[0];

/** 
 * Encrypts text using AES-256-CBC with a random IV.
 * @param text Plain text to encrypt
 * @returns Encrypted string (IV + ciphertext) in hex format
 */
export function encrypt(text: string): string {
    const iv = randomBytes(16); // New IV for each encryption
    const cipher = createCipheriv('aes-256-cbc', getCurrentKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Prepend IV to ciphertext (IV is not secret)
    return iv.toString('hex') + encrypted;
}

/**
 * Decrypts text using AES-256-CBC with key fallback mechanism:
 * - First attempts decryption with current key
 * - If that fails, tries with previous key
 * - Throws an error if both keys fail (invalid ciphertext or corrupted data)
 * 
 * @param encryptedText Encrypted string in format: IV (32 hex chars) + ciphertext
 * @returns Decrypted plaintext
 * @throws Error if decryption fails with both available keys
 */
export function decrypt(encryptedText: string): string {
    // Extract IV (first 32 hex chars = 16 bytes)
    const iv = Buffer.from(encryptedText.substring(0, 32), 'hex');
    // Extract ciphertext (remaining after IV)
    const ciphertext = encryptedText.substring(32);
    
    let lastError: Error | null = null;
    
    // Try both keys in sequence (current first, then previous)
    for (const key of keyHistory) {
        try {
            const decipher = createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (err) {
            lastError = err as Error;
            continue;
        }
    }
    
    // Both decryption attempts failed
    throw new Error(`Decryption failed with both current and previous keys. Last error: ${lastError?.message}`);
}