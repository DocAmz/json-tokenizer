import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJsonTokenizer } from "../src/react/useJsonTokenizer";
import { TokenizationMethod } from "../src/types";

describe("useJsonTokenizer", () => {
  const testData = { name: "Alice", age: 30, city: "Paris" };
  const keys = ["name", "age", "city"];

  describe("Basic Functionality", () => {
    it("should tokenize data automatically by default", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { keys, method: TokenizationMethod.ALPHABETIC })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({ a: "Alice", b: 30, c: "Paris" });
      expect(result.current.error).toBeNull();
      expect(result.current.dictionary).not.toBeNull();
      expect(result.current.dictionary?.method).toBe(TokenizationMethod.ALPHABETIC);
    });

    it("should not auto-tokenize when autoTokenize is false", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { 
          keys, 
          method: TokenizationMethod.ALPHABETIC,
          autoTokenize: false 
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toBeNull();
      expect(result.current.dictionary).not.toBeNull();
    });

    it("should tokenize manually when tokenize is called", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { 
          keys, 
          method: TokenizationMethod.ALPHABETIC,
          autoTokenize: false 
        })
      );

      await waitFor(() => {
        expect(result.current.dictionary).not.toBeNull();
      });

      act(() => {
        result.current.tokenize();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({ a: "Alice", b: 30, c: "Paris" });
    });
  });

  describe("Tokenization Methods", () => {
    it("should use numeric tokenization", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { keys, method: TokenizationMethod.NUMERIC })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({ "0": "Alice", "1": 30, "2": "Paris" });
    });

    it("should use base64 tokenization", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { keys, method: TokenizationMethod.BASE64 })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({ a: "Alice", b: 30, c: "Paris" });
    });

    it("should use padded numeric tokenization", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { 
          keys, 
          method: TokenizationMethod.PADDED_NUMERIC,
          paddingLength: 3 
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({ "000": "Alice", "001": 30, "002": "Paris" });
    });

    it("should use custom tokenization", async () => {
      const customGenerator = (index: number) => `custom_${index}`;
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { 
          keys, 
          method: TokenizationMethod.CUSTOM,
          customGenerator 
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({ 
        custom_0: "Alice", 
        custom_1: 30, 
        custom_2: "Paris" 
      });
    });

    it("should use prefixed tokens", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { 
          keys, 
          method: TokenizationMethod.NUMERIC,
          prefix: "api_"
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({ 
        "api_0": "Alice", 
        "api_1": 30, 
        "api_2": "Paris" 
      });
    });
  });

  describe("Detokenization", () => {
    it("should detokenize data correctly", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { keys, method: TokenizationMethod.ALPHABETIC })
      );

      await waitFor(() => {
        expect(result.current.tokenized).not.toBeNull();
      });

      const tokenizedData = result.current.tokenized;
      
      act(() => {
        const detokenized = result.current.detokenize(tokenizedData);
        expect(detokenized).toEqual(testData);
      });
    });

    it("should handle detokenization without tokenizing first", async () => {
      const tokenizedData = { a: "Alice", b: 30, c: "Paris" };
      
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { 
          keys, 
          method: TokenizationMethod.ALPHABETIC,
          autoTokenize: false 
        })
      );

      await waitFor(() => {
        expect(result.current.dictionary).not.toBeNull();
      });

      let detokenized: any;
      act(() => {
        detokenized = result.current.detokenize(tokenizedData);
      });

      expect(detokenized).toEqual(testData);
    });
  });

  describe("Error Handling", () => {
    it("should set error when no keys provided", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { autoTokenize: false })
      );

      await waitFor(() => {
        expect(result.current.dictionary).toBeNull();
      });

      act(() => {
        result.current.tokenize();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(result.current.error?.message).toContain("No dictionary available");
    });

    it("should handle detokenization error without dictionary", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { autoTokenize: false })
      );

      await waitFor(() => {
        expect(result.current.dictionary).toBeNull();
      });

      act(() => {
        result.current.detokenize({ a: "test" });
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(result.current.error?.message).toContain("No dictionary available");
    });
  });

  describe("State Management", () => {
    it("should reset state correctly", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { keys, method: TokenizationMethod.ALPHABETIC })
      );

      await waitFor(() => {
        expect(result.current.tokenized).not.toBeNull();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.tokenized).toBeNull();
      expect(result.current.detokenized).toEqual(testData);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("should update when input changes", async () => {
      const { result, rerender } = renderHook(
        ({ data }) => useJsonTokenizer(data, { keys, method: TokenizationMethod.ALPHABETIC }),
        { initialProps: { data: testData } }
      );

      await waitFor(() => {
        expect(result.current.tokenized).toEqual({ a: "Alice", b: 30, c: "Paris" });
      });

      const newData = { name: "Bob", age: 25, city: "London" };
      rerender({ data: newData });

      await waitFor(() => {
        expect(result.current.tokenized).toEqual({ a: "Bob", b: 25, c: "London" });
      });
    });
  });

  describe("Complex Data Structures", () => {
    it("should handle nested objects", async () => {
      const nestedData = {
        user: {
          name: "Alice",
          age: 30
        },
        city: "Paris"
      };
      const nestedKeys = ["user", "name", "age", "city"];

      const { result } = renderHook(() =>
        useJsonTokenizer(nestedData, { keys: nestedKeys, method: TokenizationMethod.ALPHABETIC })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({
        a: {
          b: "Alice",
          c: 30
        },
        d: "Paris"
      });
    });

    it("should handle arrays", async () => {
      const arrayData = {
        users: [
          { name: "Alice", age: 30 },
          { name: "Bob", age: 25 }
        ]
      };
      const arrayKeys = ["users", "name", "age"];

      const { result } = renderHook(() =>
        useJsonTokenizer(arrayData, { keys: arrayKeys, method: TokenizationMethod.ALPHABETIC })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({
        a: [
          { b: "Alice", c: 30 },
          { b: "Bob", c: 25 }
        ]
      });
    });
  });

  describe("Dictionary Management", () => {
    it("should use provided dictionary", async () => {
      const customDictionary = {
        forward: { name: "x", age: "y", city: "z" },
        reverse: { x: "name", y: "age", z: "city" },
        method: TokenizationMethod.CUSTOM
      };

      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { dictionary: customDictionary })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({ x: "Alice", y: 30, z: "Paris" });
      expect(result.current.dictionary).toEqual(customDictionary);
    });

    it("should prioritize provided dictionary over keys", async () => {
      const customDictionary = {
        forward: { name: "x", age: "y", city: "z" },
        reverse: { x: "name", y: "age", z: "city" },
        method: TokenizationMethod.CUSTOM
      };

      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { 
          keys, 
          dictionary: customDictionary,
          method: TokenizationMethod.ALPHABETIC 
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tokenized).toEqual({ x: "Alice", y: 30, z: "Paris" });
    });
  });

  describe("Loading State", () => {
    it("should track loading state during tokenization", async () => {
      const { result } = renderHook(() =>
        useJsonTokenizer(testData, { 
          keys, 
          method: TokenizationMethod.ALPHABETIC,
          autoTokenize: false 
        })
      );

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.tokenize();
      });

      // Loading state should eventually be false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
