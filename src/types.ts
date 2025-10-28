export enum TokenizationMethod {
  ALPHABETIC = "alphabetic",
  NUMERIC = "numeric",
  PADDED_NUMERIC = "padded_numeric",
  BASE64 = "base64",
  UUID_SHORT = "uuid_short",
  CUSTOM = "custom"
}

export interface Dictionary {
  forward: Record<string, string>;
  reverse: Record<string, string>;
  method: TokenizationMethod;
}

export interface TokenizationResult {
  encoded: any;
  dictionary: Dictionary;
}

export interface TokenizationOptions {
  method?: TokenizationMethod;
  customGenerator?: (index: number) => string;
  paddingLength?: number; // For padded numeric
  prefix?: string; // Optional prefix for tokens
}
