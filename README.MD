# @docamz/json-tokenizer

🚀 **Advanced JSON tokenizer with multiple encoding strategies** for optimal compression and performance.

Lightweight and symmetric JSON tokenizer for compression and optimization. Generates consistent dictionaries and supports  **alphabetic**, **numeric**, **base64**, **UUID-based**, and **custom** tokenization methods with symmetric encoding/decoding. Perfect for data compression, API optimization, and storage efficiency. Can be used standalone or with MessagePack or Gzip for enhanced compression.

## Features

- **Multiple Tokenization Methods**: Alphabetic, numeric, base64, UUID-short, and custom
- **Symmetric Encoding**: Perfect reconstruction of original data
- **🔒 Security First**: Built-in prototype pollution protection
- **High Performance**: Optimized algorithms with minimal overhead
- **TypeScript Support**: Full type safety

---

## Installation

```bash
npm install @docamz/json-tokenizer
```

## Quick Start

```typescript
import { generateDictionary, tokenize, detokenize, TokenizationMethod } from "@docamz/json-tokenizer";

const data = { name: "Alice", age: 30, city: "Paris" };
const keys = ["name", "age", "city"];

// Generate dictionary and tokenize
const dict = generateDictionary(keys);
const encoded = tokenize(data, dict.forward);
const decoded = detokenize(encoded, dict.reverse);

console.log(encoded); // { a: "Alice", b: 30, c: "Paris" }
console.log(decoded); // { name: "Alice", age: 30, city: "Paris" }
```

## Tokenization Methods

### 1. Alphabetic (Default)

Perfect for maximum compression with readable tokens.

```typescript
const dict = generateDictionary(keys, { method: TokenizationMethod.ALPHABETIC });
// Result: { name: "a", age: "b", city: "c" }
```

### 2. Numeric

Simple numeric tokens for databases and APIs.

```typescript
const dict = generateDictionary(keys, { method: TokenizationMethod.NUMERIC });
// Result: { name: "0", age: "1", city: "2" }
```

### 3. Padded Numeric

Fixed-width numeric tokens for consistent formatting.

```typescript
const dict = generateDictionary(keys, {
  method: TokenizationMethod.PADDED_NUMERIC,
  paddingLength: 3
});
// Result: { name: "000", age: "001", city: "002" }
```

### 4. Base64 Style

High-density encoding using alphanumeric + symbols.

```typescript
const dict = generateDictionary(keys, { method: TokenizationMethod.BASE64 });
// Supports 64 characters: a-z, A-Z, 0-9, _, $
// Result: { name: "a", age: "b", city: "c", ... key63: "$", key64: "ba" }
```

### 5. UUID Short

Distributed-system friendly with timestamp + counter.

```typescript
const dict = generateDictionary(keys, { method: TokenizationMethod.UUID_SHORT });
// Result: { name: "1a2b00", age: "1a2b01", city: "1a2b02" }
// Format: 4-char timestamp + 2-char counter (6 chars total)
```

### 6. Custom Generator

Define your own tokenization logic.

```typescript
const dict = generateDictionary(keys, {
  method: TokenizationMethod.CUSTOM,
  customGenerator: (index) => `custom_${index}`
});
// Result: { name: "custom_0", age: "custom_1", city: "custom_2" }
```

### 7. Prefixed Tokens

Add prefixes to any tokenization method.

```typescript
const dict = generateDictionary(keys, {
  method: TokenizationMethod.NUMERIC,
  prefix: "api_"
});
// Result: { name: "api_0", age: "api_1", city: "api_2" }
```

## Advanced Usage

### Complex Nested Objects

```typescript
const complexData = {
  user: {
    profile: { firstName: "John", lastName: "Doe", email: "john@example.com" },
    settings: { theme: "dark", language: "en", notifications: true }
  },
  metadata: { version: "2.0", createdAt: "2023-01-01T00:00:00Z" }
};

const keys = [
  "user", "profile", "firstName", "lastName", "email",
  "settings", "theme", "language", "notifications",
  "metadata", "version", "createdAt"
];

const dict = generateDictionary(keys, { method: TokenizationMethod.ALPHABETIC });
const encoded = tokenize(complexData, dict.forward);
const decoded = detokenize(encoded, dict.reverse);

// Perfect reconstruction guaranteed
console.log(decoded === complexData); // true
```

### Arrays of Objects

```typescript
const arrayData = {
  users: [
    { name: "Alice", age: 30, role: "admin" },
    { name: "Bob", age: 25, role: "user" },
    { name: "Charlie", age: 35, role: "moderator" }
  ]
};

const keys = ["users", "name", "age", "role"];
const dict = generateDictionary(keys, { method: TokenizationMethod.BASE64 });
const encoded = tokenize(arrayData, dict.forward);
// Result: { a: [{ b: "Alice", c: 30, d: "admin" }, ...] }
```

### Dictionary Serialization

```typescript
// Save dictionary for later use
const dict = generateDictionary(keys, { method: TokenizationMethod.ALPHABETIC });
const serialized = JSON.stringify(dict);
fs.writeFileSync('dictionary.json', serialized);

// Load and use dictionary
const loaded = JSON.parse(fs.readFileSync('dictionary.json', 'utf-8'));
const decoded = detokenize(encodedData, loaded.reverse);
```

## 🔒 Security Features

**Built-in protection against prototype pollution and security vulnerabilities:**

```typescript
import { tokenize, sanitizeObject, isSafeKey } from "@docamz/json-tokenizer";

// Automatic protection against dangerous keys
const maliciousData = { name: "Alice", "__proto__": { isAdmin: true } };
tokenize(maliciousData, dict.forward); // Throws: "Dangerous key detected"

// Sanitize untrusted input
const cleanData = sanitizeObject(untrustedInput, { throwOnUnsafeKeys: true });

// Validate keys manually
if (isSafeKey(keyName)) {
  // Safe to use
}
```

**Protected against:**

- `__proto__` pollution
- `constructor` manipulation
- Dangerous property access
- Control character injection

> 📖 **See [SECURITY.md](./SECURITY.md) for complete security guide**

## API Reference

### Core Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `generateDictionary(keys, options?)` | `keys: string[]`, `options?: TokenizationOptions` | Generate tokenization dictionary |
| `tokenize(obj, dict)` | `obj: any`, `dict: Record<string, string>` | Replace keys with tokens |
| `detokenize(obj, reverse)` | `obj: any`, `reverse: Record<string, string>` | Restore original keys |

### Tokenization Methods reference

| Method | Description | Use Case |
|--------|-------------|----------|
| `ALPHABETIC` | a, b, c, ..., z, aa, ab | Maximum compression, readable |
| `NUMERIC` | 0, 1, 2, 3, ... | Simple, database-friendly |
| `PADDED_NUMERIC` | 000, 001, 002, ... | Fixed-width, sortable |
| `BASE64` | a-z, A-Z, 0-9, _, $ | High-density encoding |
| `UUID_SHORT` | timestamp + counter | Distributed systems |
| `CUSTOM` | User-defined function | Custom requirements |

### TokenizationOptions

```typescript
interface TokenizationOptions {
  method?: TokenizationMethod;           // Default: ALPHABETIC
  customGenerator?: (index: number) => string; // For CUSTOM method
  paddingLength?: number;                // Default: 4 (for PADDED_NUMERIC)
  prefix?: string;                       // Default: "" (empty)
}
```

### Sequence Generators

Access individual generators directly:

```typescript
import {
  generateAlphabeticSequence,
  generateNumericSequence,
  generatePaddedNumericSequence,
  generateBase64Sequence,
  generateUuidShortSequence
} from "@docamz/json-tokenizer";

// Use specific generators
const token1 = generateAlphabeticSequence(0); // "a"
const token2 = generateBase64Sequence(63);    // "$"
const token3 = generateUuidShortSequence(0);  // "1a2b00"
```

### Benchmarks

#### Benchmark Results

| Model | Raw Size | Raw→Tok | Tok+Gzip | MsgPack | Tok+Msg | Tok+Msg+Gzip | Tok Enc/Dec | Msg Enc/Dec | Tok+Msg Enc/Dec |
|-------|----------|---------|----------|---------|---------|--------------|-------------|-------------|------------------|
| model1.json | 83.8 KB | 64.6% | 55.5% | 60.3% | 76.3% | 55.5% | 0.4/0.5 ms | 1.3/0.8 ms | 0.2/0.2 ms |
| model2.json | 134.4 KB | 65.7% | 51.8% | 61.3% | 77.2% | 55.7% | 0.5/0.6 ms | 0.3/0.4 ms | 0.2/0.2 ms |
| model3.json | 148.7 KB | 66.9% | 56.5% | 62.7% | 78.0% | 57.4% | 0.3/0.3 ms | 0.3/0.3 ms | 0.2/0.2 ms |
| model4.json | 33.1 KB | 69.9% | 45.6% | 64.1% | 82.2% | 46.2% | 0.1/0.1 ms | 0.2/0.1 ms | 0.1/0.1 ms |
| **Average** | - | **66.8%** | **52.4%** | **62.1%** | **78.4%** | **53.7%** | **0.32/0.40 ms** | **0.53/0.40 ms** | **0.15/0.19 ms** |

**Key:**

- Raw→Tok: Tokenization compression ratio
- Tok+Gzip: Tokenized with Gzip compression
- MsgPack: MessagePack compression ratio
- Tok+Msg: Combined tokenization + MessagePack
- Tok+Msg+Gzip: Best compression (tokenization + MessagePack + Gzip)
- Enc/Dec: Encoding/Decoding performance in milliseconds

### License

MIT License © 2025 DocAmz
