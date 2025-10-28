import { Dictionary } from "./types";
import { generateKeySequence } from "./utils/sequenceGenerator";

/**
 * Generates a symmetric dictionary for tokenization and detokenization.
 * @param keys The list of keys to include in the dictionary.
 * @returns The generated dictionary with forward and reverse mappings.
 *
 * @example
 * const keys = ["name", "age", "address"];
 * const dict = generateDictionary(keys);
 * dict.forward => { name: "a", age: "b", address: "c" }
 * dict.reverse => { a: "name", b: "age", c: "address" }
 */

export const generateDictionary = (keys: string[]): Dictionary => {
  const forward: Record<string, string> = {};
  const reverse: Record<string, string> = {};

  keys.forEach((key, index) => {
    const token = generateKeySequence(index);
    forward[key] = token;
    reverse[token] = key;
  });

  return { forward, reverse };
};
