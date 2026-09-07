import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hash a plain-text password using bcryptjs.
 *
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain-text password against an existing bcryptjs hash.
 *
 * @param plainText - Plain text password candidate
 * @param hashedPassword - Stored hashed password
 * @returns Promise resolving to boolean indicating match
 */
export async function verifyPassword(
  plainText: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashedPassword);
}
