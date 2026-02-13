import mongoose from 'mongoose';

/**
 * Returns true if str is a valid MongoDB ObjectId.
 */
export function isValidObjectId(str: string): boolean {
  if (typeof str !== 'string' || !str.trim()) return false;
  return mongoose.Types.ObjectId.isValid(str) && String(new mongoose.Types.ObjectId(str)) === str;
}

/**
 * Validate and return 24-char hex string or null.
 */
export function toObjectIdOrNull(str: string): string | null {
  return isValidObjectId(str) ? str : null;
}
