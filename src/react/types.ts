import { Dictionary, TokenizationOptions } from "../types";

export interface UseJsonTokenizerOptions extends TokenizationOptions {
  /**
   * Keys to include in the dictionary generation
   */
  keys?: string[];
  /**
   * Pre-generated dictionary to use instead of generating one
   */
  dictionary?: Dictionary;
  /**
   * Auto-tokenize on input change (default: true)
   */
  autoTokenize?: boolean;
}

export interface UseJsonTokenizerResult {
  /**
   * The tokenized data
   */
  tokenized: any;
  /**
   * The detokenized data (original)
   */
  detokenized: any;
  /**
   * The dictionary used for tokenization
   */
  dictionary: Dictionary | null;
  /**
   * Whether tokenization is in progress
   */
  isLoading: boolean;
  /**
   * Any error that occurred during tokenization
   */
  error: Error | null;
  /**
   * Manually trigger tokenization
   */
  tokenize: () => void;
  /**
   * Manually trigger detokenization with provided tokenized data
   */
  detokenize: (data: any) => any;
  /**
   * Reset the state
   */
  reset: () => void;
}
