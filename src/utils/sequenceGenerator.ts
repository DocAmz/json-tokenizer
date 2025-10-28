import { TokenizationMethod } from "../types";

/**
 * Generates an alphabetic key sequence (a, b, c, ..., z, aa, ab, ...).
 * This is the original method for backwards compatibility.
 */
export const generateAlphabeticSequence = (index: number): string => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let key = "";
  let i = index;
  while (i >= 0) {
    key = alphabet[i % 26] + key;
    i = Math.floor(i / 26) - 1;
  }
  return key;
};

/**
 * Generates a simple numeric sequence (0, 1, 2, 3, ...).
 */
export const generateNumericSequence = (index: number): string => {
  return index.toString();
};

/**
 * Generates a padded numeric sequence (0001, 0002, 0003, ...).
 */
export const generatePaddedNumericSequence = (index: number, paddingLength: number = 4): string => {
  return index.toString().padStart(paddingLength, '0');
};

/**
 * Generates a base64-style sequence using alphanumeric characters and symbols.
 * Order: a-z, A-Z, 0-9, _, $
 */
export const generateBase64Sequence = (index: number): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$";
  const base = charset.length;

  if (index === 0) return charset[0];

  let key = "";
  let i = index;
  while (i > 0) {
    key = charset[i % base] + key;
    i = Math.floor(i / base);
  }
  return key;
};

/**
 * Generates short UUID-like sequences for distributed systems.
 * Uses a combination of timestamp and counter for uniqueness.
 */
export const generateUuidShortSequence = (index: number): string => {
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  const timestamp = Date.now().toString(36).slice(-4); // Last 4 chars of timestamp in base36
  const counter = index.toString(36).padStart(2, '0'); // Counter in base36, padded
  return `${timestamp}${counter}`;
};

/**
 * Main sequence generator that delegates to specific methods.
 */
export const generateKeySequence = (
  index: number,
  method: TokenizationMethod = TokenizationMethod.ALPHABETIC,
  options: { paddingLength?: number; customGenerator?: (index: number) => string } = {}
): string => {
  switch (method) {
    case TokenizationMethod.ALPHABETIC:
      return generateAlphabeticSequence(index);

    case TokenizationMethod.NUMERIC:
      return generateNumericSequence(index);

    case TokenizationMethod.PADDED_NUMERIC:
      return generatePaddedNumericSequence(index, options.paddingLength);

    case TokenizationMethod.BASE64:
      return generateBase64Sequence(index);

    case TokenizationMethod.UUID_SHORT:
      return generateUuidShortSequence(index);

    case TokenizationMethod.CUSTOM:
      if (!options.customGenerator) {
        throw new Error("Custom generator function is required for CUSTOM tokenization method");
      }
      return options.customGenerator(index);

    default:
      return generateAlphabeticSequence(index);
  }
};

// Backwards compatibility alias
export const originalGenerateKeySequence = generateAlphabeticSequence;
