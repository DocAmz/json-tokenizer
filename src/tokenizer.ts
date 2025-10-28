import { Dictionary } from "./types";
import {
  validateTokenizationInput,
  createSafeObject,
  safeAssign,
  isSafeKey
} from "./security";

/**
 * Tokenizes an object using the provided dictionary.
 * @param obj The object to tokenize.
 * @param dict The dictionary for tokenization.
 * @returns  The tokenized object.
 *
 * @example const encoded = tokenize(data, dict.forward);
 */

export const tokenize = (obj: any, dict: Record<string, string>): any => {
  // Validate inputs for security
  validateTokenizationInput(obj, dict);

  if (Array.isArray(obj)) {
    return obj.map((v) => tokenize(v, dict));
  }
  if (obj && typeof obj === "object") {
    const result = createSafeObject();
    for (const [key, value] of Object.entries(obj)) {
      // Additional safety check for keys during processing
      if (!isSafeKey(key)) {
        throw new Error(`Unsafe key encountered during tokenization: "${key}"`);
      }

      const token = dict[key] ?? key;

      // Validate the token is safe before using it as a key
      if (!isSafeKey(token)) {
        throw new Error(`Unsafe token generated for key "${key}": "${token}"`);
      }

      safeAssign(result, token, tokenize(value, dict));
    }
    return result;
  }
  return obj;
};

/**
 * Detokenizes an object using the provided reverse dictionary.
 * @param obj The object to detokenize.
 * @param reverse The reverse dictionary for detokenization.
 * @returns The detokenized object.
 *
 * @example const decoded = detokenize(encoded, dict.reverse);
 */

export const detokenize = (obj: any, reverse: Record<string, string>): any => {
  // Validate inputs for security
  validateTokenizationInput(obj, reverse);

  if (Array.isArray(obj)) {
    return obj.map((v) => detokenize(v, reverse));
  }
  if (obj && typeof obj === "object") {
    const result = createSafeObject();
    for (const [key, value] of Object.entries(obj)) {
      // Additional safety check for keys during processing
      if (!isSafeKey(key)) {
        throw new Error(`Unsafe key encountered during detokenization: "${key}"`);
      }

      const original = reverse[key] ?? key;

      // Validate the original key is safe before using it
      if (!isSafeKey(original)) {
        throw new Error(`Unsafe original key for token "${key}": "${original}"`);
      }

      safeAssign(result, original, detokenize(value, reverse));
    }
    return result;
  }
  return obj;
};
