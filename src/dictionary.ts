import { Dictionary, TokenizationMethod, TokenizationOptions } from "./types";
import { generateKeySequence } from "./utils/sequenceGenerator";

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
  const forward: Record<string, string> = {};
  const reverse: Record<string, string> = {};

  keys.forEach((key, index) => {
    const baseToken = generateKeySequence(index, method, options);
    const token = prefix + baseToken;
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
