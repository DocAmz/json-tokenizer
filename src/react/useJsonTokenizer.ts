import { useState, useEffect, useCallback, useMemo } from "react";
import { generateDictionary } from "../dictionary";
import { tokenize as tokenizeData, detokenize as detokenizeData } from "../tokenizer";
import { Dictionary, TokenizationMethod } from "../types";
import { UseJsonTokenizerOptions, UseJsonTokenizerResult } from "./types";

/**
 * React hook for JSON tokenization with multiple encoding strategies
 * 
 * @param input - The JSON data to tokenize
 * @param options - Tokenization options including keys, method, and dictionary
 * @returns Object containing tokenized data, state, and control functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const data = { name: "Alice", age: 30, city: "Paris" };
 *   const { tokenized, dictionary, isLoading, error } = useJsonTokenizer(data, {
 *     keys: ["name", "age", "city"],
 *     method: TokenizationMethod.ALPHABETIC
 *   });
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return <pre>{JSON.stringify(tokenized, null, 2)}</pre>;
 * }
 * ```
 * 
 * @example With manual control
 * ```tsx
 * function MyComponent() {
 *   const [data, setData] = useState({ name: "Alice", age: 30 });
 *   const { tokenized, tokenize, detokenize } = useJsonTokenizer(data, {
 *     keys: ["name", "age"],
 *     autoTokenize: false
 *   });
 * 
 *   return (
 *     <div>
 *       <button onClick={tokenize}>Tokenize</button>
 *       <pre>{JSON.stringify(tokenized, null, 2)}</pre>
 *     </div>
 *   );
 * }
 * ```
 */
export function useJsonTokenizer(
  input: any,
  options: UseJsonTokenizerOptions = {}
): UseJsonTokenizerResult {
  const {
    keys = [],
    dictionary: providedDictionary,
    autoTokenize = true,
    method = TokenizationMethod.ALPHABETIC,
    customGenerator,
    paddingLength,
    prefix
  } = options;

  const [tokenized, setTokenized] = useState<any>(null);
  const [detokenized, setDetokenized] = useState<any>(input);
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate or use provided dictionary
  const activeDictionary = useMemo(() => {
    if (providedDictionary) {
      return providedDictionary;
    }
    
    if (keys.length === 0) {
      return null;
    }

    try {
      return generateDictionary(keys, {
        method,
        customGenerator,
        paddingLength,
        prefix
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [keys, providedDictionary, method, customGenerator, paddingLength, prefix]);

  // Update dictionary state when it changes
  useEffect(() => {
    setDictionary(activeDictionary);
  }, [activeDictionary]);

  // Tokenize function
  const tokenize = useCallback(() => {
    if (!activeDictionary) {
      setError(new Error("No dictionary available. Provide keys or a dictionary."));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = tokenizeData(input, activeDictionary.forward);
      setTokenized(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setTokenized(null);
    } finally {
      setIsLoading(false);
    }
  }, [input, activeDictionary]);

  // Detokenize function
  const detokenize = useCallback((data: any) => {
    if (!activeDictionary) {
      setError(new Error("No dictionary available for detokenization."));
      return null;
    }

    try {
      const result = detokenizeData(data, activeDictionary.reverse);
      setDetokenized(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [activeDictionary]);

  // Reset function
  const reset = useCallback(() => {
    setTokenized(null);
    setDetokenized(input);
    setError(null);
    setIsLoading(false);
  }, [input]);

  // Auto-tokenize when input or dictionary changes
  useEffect(() => {
    if (autoTokenize && activeDictionary && input) {
      tokenize();
    }
  }, [input, activeDictionary, autoTokenize, tokenize]);

  return {
    tokenized,
    detokenized,
    dictionary,
    isLoading,
    error,
    tokenize,
    detokenize,
    reset
  };
}
