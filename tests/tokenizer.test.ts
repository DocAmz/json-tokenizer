import { describe, it, expect } from "vitest";
import {
  generateDictionary,
  tokenize,
  detokenize,
  TokenizationMethod,
  generateAlphabeticSequence,
  generateNumericSequence,
  generatePaddedNumericSequence,
  generateBase64Sequence,
  generateUuidShortSequence
} from "../src";

describe("Tokenizer", () => {
  const testData = { name: "Alice", age: 30, city: "Paris" };
  const keys = ["name", "age", "city"];

  describe("Alphabetic Tokenization (Default)", () => {
    it("should tokenize and detokenize symmetrically", () => {
      const dict = generateDictionary(keys);
      const encoded = tokenize(testData, dict.forward);
      const decoded = detokenize(encoded, dict.reverse);

      expect(decoded).toEqual(testData);
      expect(dict.method).toBe(TokenizationMethod.ALPHABETIC);
    });

    it("should generate correct alphabetic sequences", () => {
      const dict = generateDictionary(keys, { method: TokenizationMethod.ALPHABETIC });

      expect(dict.forward.name).toBe("a");
      expect(dict.forward.age).toBe("b");
      expect(dict.forward.city).toBe("c");
    });
  });

  describe("Numeric Tokenization", () => {
    it("should tokenize with numeric tokens", () => {
      const dict = generateDictionary(keys, { method: TokenizationMethod.NUMERIC });
      const encoded = tokenize(testData, dict.forward);
      const decoded = detokenize(encoded, dict.reverse);

      expect(decoded).toEqual(testData);
      expect(dict.method).toBe(TokenizationMethod.NUMERIC);
    });

    it("should generate correct numeric sequences", () => {
      const dict = generateDictionary(keys, { method: TokenizationMethod.NUMERIC });

      expect(dict.forward.name).toBe("0");
      expect(dict.forward.age).toBe("1");
      expect(dict.forward.city).toBe("2");
    });
  });

  describe("Padded Numeric Tokenization", () => {
    it("should tokenize with padded numeric tokens", () => {
      const dict = generateDictionary(keys, {
        method: TokenizationMethod.PADDED_NUMERIC,
        paddingLength: 3
      });
      const encoded = tokenize(testData, dict.forward);
      const decoded = detokenize(encoded, dict.reverse);

      expect(decoded).toEqual(testData);
    });

    it("should generate correct padded numeric sequences", () => {
      const dict = generateDictionary(keys, {
        method: TokenizationMethod.PADDED_NUMERIC,
        paddingLength: 4
      });

      expect(dict.forward.name).toBe("0000");
      expect(dict.forward.age).toBe("0001");
      expect(dict.forward.city).toBe("0002");
    });
  });

  describe("Base64 Tokenization", () => {
    it("should tokenize with base64-style tokens", () => {
      const dict = generateDictionary(keys, { method: TokenizationMethod.BASE64 });
      const encoded = tokenize(testData, dict.forward);
      const decoded = detokenize(encoded, dict.reverse);

      expect(decoded).toEqual(testData);
    });

    it("should generate correct base64 sequences", () => {
      const dict = generateDictionary(keys, { method: TokenizationMethod.BASE64 });

      expect(dict.forward.name).toBe("a");
      expect(dict.forward.age).toBe("b");
      expect(dict.forward.city).toBe("c");
    });

    it("should handle large indexes with base64", () => {
      const manyKeys = Array.from({ length: 100 }, (_, i) => `key${i}`);
      const dict = generateDictionary(manyKeys, { method: TokenizationMethod.BASE64 });

      // Should use more characters from the charset
      expect(dict.forward.key0).toBe("a");
      expect(dict.forward.key63).toBe("$"); // Last char in charset
      expect(dict.forward.key64).toBe("ba"); // Should wrap to next position
    });
  });

  describe("UUID Short Tokenization", () => {
    it("should tokenize with UUID short tokens", () => {
      const dict = generateDictionary(keys, { method: TokenizationMethod.UUID_SHORT });
      const encoded = tokenize(testData, dict.forward);
      const decoded = detokenize(encoded, dict.reverse);

      expect(decoded).toEqual(testData);
    });

    it("should generate UUID-like sequences", () => {
      const dict = generateDictionary(keys, { method: TokenizationMethod.UUID_SHORT });

      // UUID short should be 6 characters (4 for timestamp + 2 for counter)
      expect(dict.forward.name).toHaveLength(6);
      expect(dict.forward.age).toHaveLength(6);
      expect(dict.forward.city).toHaveLength(6);

      // Should be different values
      expect(dict.forward.name).not.toBe(dict.forward.age);
    });
  });

  describe("Custom Tokenization", () => {
    it("should tokenize with custom generator", () => {
      const customGenerator = (index: number) => `custom_${index}`;
      const dict = generateDictionary(keys, {
        method: TokenizationMethod.CUSTOM,
        customGenerator
      });
      const encoded = tokenize(testData, dict.forward);
      const decoded = detokenize(encoded, dict.reverse);

      expect(decoded).toEqual(testData);
    });

    it("should use custom generator function", () => {
      const customGenerator = (index: number) => `token_${index}`;
      const dict = generateDictionary(keys, {
        method: TokenizationMethod.CUSTOM,
        customGenerator
      });

      expect(dict.forward.name).toBe("token_0");
      expect(dict.forward.age).toBe("token_1");
      expect(dict.forward.city).toBe("token_2");
    });

    it("should throw error when custom generator is missing", () => {
      expect(() => {
        generateDictionary(keys, { method: TokenizationMethod.CUSTOM });
      }).toThrow("Custom generator function is required");
    });
  });

  describe("Prefix Support", () => {
    it("should add prefix to all tokens", () => {
      const dict = generateDictionary(keys, {
        method: TokenizationMethod.ALPHABETIC,
        prefix: "pre_"
      });

      expect(dict.forward.name).toBe("pre_a");
      expect(dict.forward.age).toBe("pre_b");
      expect(dict.forward.city).toBe("pre_c");
    });

    it("should work with different methods and prefix", () => {
      const dict = generateDictionary(keys, {
        method: TokenizationMethod.NUMERIC,
        prefix: "num_"
      });

      expect(dict.forward.name).toBe("num_0");
      expect(dict.forward.age).toBe("num_1");
      expect(dict.forward.city).toBe("num_2");
    });
  });

  describe("Complex Data Structures", () => {
    it("should handle nested objects with different tokenization methods", () => {
      const complexData = {
        user: {
          profile: { firstName: "John", lastName: "Doe" },
          settings: { theme: "dark", notifications: true }
        },
        metadata: { version: "1.0", createdAt: new Date().toISOString() }
      };

      const complexKeys = [
        "user", "profile", "firstName", "lastName",
        "settings", "theme", "notifications",
        "metadata", "version", "createdAt"
      ];

      // Test with different methods
      const methods = [
        TokenizationMethod.ALPHABETIC,
        TokenizationMethod.NUMERIC,
        TokenizationMethod.BASE64
      ];

      methods.forEach(method => {
        const dict = generateDictionary(complexKeys, { method });
        const encoded = tokenize(complexData, dict.forward);
        const decoded = detokenize(encoded, dict.reverse);

        expect(decoded).toEqual(complexData);
      });
    });
  });

  describe("Sequence Generator Functions", () => {
    it("should generate correct alphabetic sequences", () => {
      expect(generateAlphabeticSequence(0)).toBe("a");
      expect(generateAlphabeticSequence(25)).toBe("z");
      expect(generateAlphabeticSequence(26)).toBe("aa");
      expect(generateAlphabeticSequence(27)).toBe("ab");
    });

    it("should generate correct numeric sequences", () => {
      expect(generateNumericSequence(0)).toBe("0");
      expect(generateNumericSequence(10)).toBe("10");
      expect(generateNumericSequence(999)).toBe("999");
    });

    it("should generate correct padded numeric sequences", () => {
      expect(generatePaddedNumericSequence(0, 3)).toBe("000");
      expect(generatePaddedNumericSequence(10, 3)).toBe("010");
      expect(generatePaddedNumericSequence(999, 4)).toBe("0999");
    });

    it("should generate base64 sequences", () => {
      expect(generateBase64Sequence(0)).toBe("a");
      expect(generateBase64Sequence(1)).toBe("b");
      expect(generateBase64Sequence(63)).toBe("$");
    });

    it("should generate UUID short sequences", () => {
      const seq1 = generateUuidShortSequence(0);
      const seq2 = generateUuidShortSequence(1);

      expect(seq1).toHaveLength(6);
      expect(seq2).toHaveLength(6);
      expect(seq1).not.toBe(seq2);
    });
  });

  describe("Backwards Compatibility", () => {
    it("should maintain backwards compatibility with old API", () => {
      // Old way should still work
      const dict = generateDictionary(keys);
      expect(dict.forward.name).toBe("a");
      expect(dict.method).toBe(TokenizationMethod.ALPHABETIC);
    });
  });
});
