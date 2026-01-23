/**
 * Client-side password hashing utilities using Web Crypto API
 * 
 * SECURITY NOTE: This is a demo/prototype implementation.
 * For production use, implement server-side authentication with:
 * - Backend password hashing (bcrypt/argon2)
 * - JWT tokens with server validation
 * - Secure HTTP-only cookies for sessions
 */

// Generate a random salt
export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(salt)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Hash password using PBKDF2 with the Web Crypto API
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltData = encoder.encode(salt);

  // Import the password as a key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password against stored hash
export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
}
