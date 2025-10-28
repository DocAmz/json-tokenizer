import { describe, it, expect } from "vitest";
import { generateDictionary, tokenize, detokenize } from "../src";

describe("Tokenizer", () => {
  it("should tokenize and detokenize symmetrically", () => {
    const keys = ["name", "age", "city"];
    const dict = generateDictionary(keys);

    const original = { name: "Alice", age: 30, city: "Paris" };
    const encoded = tokenize(original, dict.forward);
    const decoded = detokenize(encoded, dict.reverse);

    expect(decoded).toEqual(original);
  });
});
