# Security Guide for JSON Tokenizer

This document outlines the comprehensive security safeguards implemented in the JSON Tokenizer library to protect against prototype pollution and other security vulnerabilities.

## Overview

The JSON Tokenizer library includes robust protection against:

- Prototype pollution attacks
- Constructor manipulation
- Dangerous property access
- Input validation vulnerabilities

## Security Features

### 1. Dangerous Key Detection

The library identifies and blocks dangerous keys that could lead to prototype pollution:

```typescript
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];
const DANGEROUS_PROPERTY_NAMES = [
  '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__',
  'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  'toString', 'valueOf', 'toLocaleString'
];
```

### 2. Input Validation

All tokenization functions validate inputs before processing:

```typescript
import { tokenize, generateDictionary } from '@docamz/json-tokenizer';

try {
  const keys = ['name', 'age', 'city'];
  const dict = generateDictionary(keys);
  const result = tokenize(data, dict.forward);
} catch (error) {
  // Handles dangerous key detection and input validation errors
  console.error('Security error:', error.message);
}
```

### 3. Safe Object Creation

Objects are created with null prototypes to prevent pollution:

```typescript
import { createSafeObject, safeAssign } from '@docamz/json-tokenizer';

const safeObj = createSafeObject();
safeAssign(safeObj, 'name', 'Alice'); // Validates key safety
```

### 4. Object Sanitization

Remove or detect dangerous keys in existing objects:

```typescript
import { sanitizeObject } from '@docamz/json-tokenizer';

// Remove unsafe keys (default behavior)
const cleaned = sanitizeObject(userInput);

// Throw error on unsafe keys
try {
  const validated = sanitizeObject(userInput, { throwOnUnsafeKeys: true });
} catch (error) {
  console.error('Unsafe object detected:', error.message);
}

// Deep sanitization for nested objects
const deepCleaned = sanitizeObject(nestedObj, { deep: true });
```

### 5. Dictionary Validation

All dictionaries are validated before use:

```typescript
import { generateDictionary, validateDictionaryKeys } from '@docamz/json-tokenizer';

// Safe dictionary generation with validation
const keys = ['name', 'age', 'email'];
const dict = generateDictionary(keys); // Automatically validates keys

// Manual dictionary validation
try {
  validateDictionaryKeys(customDict);
} catch (error) {
  console.error('Dangerous dictionary key:', error.message);
}
```

## Protected Against Attack Scenarios

### 1. JSON.parse Prototype Pollution

```typescript
// Malicious JSON payload
const maliciousJSON = '{"name": "Alice", "__proto__": {"isAdmin": true}}';
const parsed = JSON.parse(maliciousJSON);

// Our library prevents this attack
try {
  tokenize(parsed, dict.forward); // Throws error
} catch (error) {
  console.log('Attack prevented:', error.message);
  // "Dangerous key detected at root.__proto__"
}
```

### 2. Constructor Pollution

```typescript
const maliciousObj = {
  name: "Alice",
  constructor: {
    prototype: {
      isAdmin: true
    }
  }
};

// Protected against constructor manipulation
try {
  tokenize(maliciousObj, dict.forward); // Throws error
} catch (error) {
  console.log('Constructor pollution prevented:', error.message);
}
```

### 3. Nested Object Pollution

```typescript
const deepPollution = {
  user: {
    profile: {
      data: {
        "__proto__": { polluted: true }
      }
    }
  }
};

// Detects pollution at any nesting level
try {
  tokenize(deepPollution, dict.forward); // Throws error
} catch (error) {
  console.log('Nested pollution detected:', error.message);
  // "Dangerous key detected at root.user.profile.data.__proto__"
}
```

## Security Best Practices

### 1. Always Use Generated Dictionaries

```typescript
// ✅ Safe - uses validated generation
const dict = generateDictionary(['name', 'age', 'email']);

// ❌ Risky - manual dictionary without validation
const unsafeDict = {
  'name': 'a',
  '__proto__': 'b'  // This would be caught and blocked
};
```

### 2. Validate External Input

```typescript
// When receiving data from external sources
function processUserData(userData: any) {
  try {
    // Validate the object structure first
    validateObjectKeys(userData);

    // Generate safe dictionary
    const keys = Object.keys(userData).filter(isSafeKey);
    const dict = generateDictionary(keys);

    // Safe tokenization
    return tokenize(userData, dict.forward);
  } catch (error) {
    throw new Error(`Security validation failed: ${error.message}`);
  }
}
```

### 3. Use Type Guards

```typescript
import { isSafeObject, isSafeKey } from '@docamz/json-tokenizer';

function processObject(obj: unknown) {
  if (!isSafeObject(obj)) {
    throw new Error('Object contains unsafe keys');
  }

  // Safe to process
  return tokenize(obj, dict.forward);
}
```

### 4. Sanitize Untrusted Data

```typescript
// For data from untrusted sources
function handleUntrustedData(data: any) {
  // Option 1: Remove unsafe keys
  const cleaned = sanitizeObject(data, { deep: true });

  // Option 2: Strict validation (throws on unsafe keys)
  try {
    const validated = sanitizeObject(data, {
      throwOnUnsafeKeys: true,
      deep: true
    });
    return tokenize(validated, dict.forward);
  } catch (error) {
    console.warn('Rejected unsafe data:', error.message);
    return null;
  }
}
```

## Error Messages

The library provides clear, actionable error messages:

- `"Dangerous key detected: '__proto__'. This key could lead to prototype pollution."`
- `"Unsafe key encountered during tokenization: 'constructor'"`
- `"Dictionary value '__proto__' for key 'name' is not safe"`
- `"Dangerous key detected at root.user.profile.__proto__"`

## Security Testing

The library includes comprehensive security tests covering:

- All dangerous key patterns
- Nested object validation
- Array validation
- Dictionary validation
- Real-world attack scenarios
- Edge cases and error conditions

## Migration Guide

If you're upgrading from a previous version:

1. **No Breaking Changes**: All existing functionality continues to work
2. **Enhanced Security**: Your existing code now has built-in protection
3. **Optional Utilities**: New security utilities are available but optional
4. **Error Handling**: Add try-catch blocks for enhanced error handling

## Performance Impact

The security validations have minimal performance impact:

- Input validation: O(n) where n is the number of keys
- Dictionary validation: O(k) where k is the dictionary size
- Object creation: Minimal overhead with null prototype objects

## Reporting Security Issues

If you discover a security vulnerability, please:

1. Do not open a public issue
2. Email security concerns privately
3. Include detailed reproduction steps
4. Allow time for patches before public disclosure

## Conclusion

The JSON Tokenizer library provides comprehensive protection against prototype pollution and related security vulnerabilities while maintaining full backward compatibility and minimal performance impact. The security features are designed to be developer-friendly with clear error messages and flexible configuration options.
