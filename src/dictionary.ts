import { Dictionary, TokenizationMethod, TokenizationOptions } from "./types";
import { generateKeySequence } from "./utils/sequenceGenerator";
import { isSafeKey } from "./security";

/**
 * Generates a symmetric dictionary for tokenization and detokenization.
 * @param keys The list of keys to include in the dictionary.
 * @param options Optional configuration for tokenization method and settings.
 * @returns The generated dictionary with forward and reverse mappings.
 *
 * @example
 * // Alphabetic (default)
 * const keys = ["name", "age", "address"];
 * const dict = generateDictionary(keys);
 * dict.forward => { name: "a", age: "b", address: "c" }
 *
 * // Numeric
 * const numDict = generateDictionary(keys, { method: TokenizationMethod.NUMERIC });
 * numDict.forward => { name: "0", age: "1", address: "2" }
 *
 * // Padded numeric
 * const padDict = generateDictionary(keys, {
 *   method: TokenizationMethod.PADDED_NUMERIC,
 *   paddingLength: 3
 * });
 * padDict.forward => { name: "000", age: "001", address: "002" }
 *
 * // Base64 style
 * const b64Dict = generateDictionary(keys, { method: TokenizationMethod.BASE64 });
 * b64Dict.forward => { name: "a", age: "b", address: "c" }
 *
 * // Custom generator
 * const customDict = generateDictionary(keys, {
 *   method: TokenizationMethod.CUSTOM,
 *   customGenerator: (index) => `token_${index}`
 * });
 * customDict.forward => { name: "token_0", age: "token_1", address: "token_2" }
 */

export const generateDictionary = (
  keys: string[],
  options: TokenizationOptions = {}
): Dictionary => {
  const { method = TokenizationMethod.ALPHABETIC, prefix = "" } = options;

  // Validate input keys for security
  if (!Array.isArray(keys)) {
    throw new Error('Keys must be provided as an array');
  }

  for (const key of keys) {
    if (typeof key !== 'string') {
      throw new Error(`All keys must be strings, got ${typeof key}: ${key}`);
    }
    if (!isSafeKey(key)) {
      throw new Error(`Unsafe key detected in input: "${key}". This key could lead to prototype pollution.`);
    }
  }

  // Validate prefix if provided
  if (prefix && typeof prefix !== 'string') {
    throw new Error(`Prefix must be a string, got ${typeof prefix}`);
  }

  const forward: Record<string, string> = {};
  const reverse: Record<string, string> = {};

  keys.forEach((key, index) => {
    const baseToken = generateKeySequence(index, method, options);
    const token = prefix + baseToken;

    // Validate that the generated token is safe
    if (!isSafeKey(token)) {
      throw new Error(`Generated token "${token}" for key "${key}" is not safe. Consider using a different tokenization method or prefix.`);
    }

    // Check for duplicate tokens
    if (forward[key] !== undefined) {
      throw new Error(`Duplicate key detected: "${key}"`);
    }
    if (reverse[token] !== undefined) {
      throw new Error(`Token collision detected: "${token}" would be assigned to multiple keys`);
    }

    forward[key] = token;
    reverse[token] = key;
  });

  return { forward, reverse, method };
};

/**
 * Backwards compatibility function - generates alphabetic dictionary.
 * @deprecated Use generateDictionary with TokenizationMethod.ALPHABETIC instead.
 */
export const generateAlphabeticDictionary = (keys: string[]): Dictionary => {
  return generateDictionary(keys, { method: TokenizationMethod.ALPHABETIC });
};
