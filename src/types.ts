export interface Dictionary {
  forward: Record<string, string>;
  reverse: Record<string, string>;
}

export interface TokenizationResult {
  encoded: any;
  dictionary: Dictionary;
}
