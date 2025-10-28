import { Dictionary } from "./types";

/**
 * Tokenizes an object using the provided dictionary.
 * @param obj The object to tokenize.
 * @param dict The dictionary for tokenization.
 * @returns  The tokenized object.
 *
 * @example const encoded = tokenize(data, dict.forward);
 */

export const tokenize = (obj: any, dict: Record<string, string>): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => tokenize(v, dict));
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const token = dict[key] ?? key;
      result[token] = tokenize(value, dict);
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
  if (Array.isArray(obj)) {
    return obj.map((v) => detokenize(v, reverse));
  }
  if (obj && typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const original = reverse[key] ?? key;
      result[original] = detokenize(value, reverse);
    }
    return result;
  }
  return obj;
};
