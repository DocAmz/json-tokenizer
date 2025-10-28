/**
 * Security utilities for protecting against prototype pollution and other security vulnerabilities
 */

// Dangerous keys that can lead to prototype pollution
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'] as const;

// Additional dangerous property names that should be avoided
const DANGEROUS_PROPERTY_NAMES = [
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toString',
  'valueOf',
  'toLocaleString'
] as const;

/**
 * Checks if a key is safe to use in object operations
 * @param key The key to validate
 * @returns true if the key is safe, false otherwise
 */
export function isSafeKey(key: string): boolean {
  if (typeof key !== 'string') {
    return false;
  }

  // Check against dangerous keys
  if (DANGEROUS_KEYS.includes(key as any)) {
    return false;
  }

  // Check against dangerous property names
  if (DANGEROUS_PROPERTY_NAMES.includes(key as any)) {
    return false;
  }

  // Check for null bytes and other control characters
  if (key.includes('\0') || /[\x00-\x1f\x7f-\x9f]/.test(key)) {
    return false;
  }

  return true;
}

/**
 * Validates that all keys in a dictionary are safe
 * @param dict The dictionary to validate
 * @throws Error if any dangerous key is detected
 */
export function validateDictionaryKeys(dict: Record<string, any>): void {
  for (const key of Object.keys(dict)) {
    if (!isSafeKey(key)) {
      throw new Error(`Dangerous key detected in dictionary: "${key}". This key could lead to prototype pollution.`);
    }
  }
}

/**
 * Validates input object to ensure it doesn't contain dangerous keys
 * @param obj The object to validate
 * @param path Current path for error reporting
 * @throws Error if any dangerous key is detected
 */
export function validateObjectKeys(obj: any, path: string = 'root'): void {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      validateObjectKeys(item, `${path}[${index}]`);
    });
    return;
  }

  for (const key of Object.keys(obj)) {
    if (!isSafeKey(key)) {
      throw new Error(`Dangerous key detected at ${path}.${key}: "${key}". This key could lead to prototype pollution.`);
    }

    // Recursively validate nested objects
    validateObjectKeys(obj[key], `${path}.${key}`);
  }
}

/**
 * Safely creates an object without prototype pollution risks
 * @returns A safe object with null prototype
 */
export function createSafeObject(): Record<string, any> {
  return Object.create(null);
}

/**
 * Safely assigns properties to an object, validating keys first
 * @param target The target object
 * @param key The key to assign
 * @param value The value to assign
 */
export function safeAssign(target: Record<string, any>, key: string, value: any): void {
  if (!isSafeKey(key)) {
    throw new Error(`Cannot assign dangerous key: "${key}"`);
  }

  target[key] = value;
}

/**
 * Sanitizes an object by removing dangerous keys
 * @param obj The object to sanitize
 * @param options Sanitization options
 * @returns A sanitized copy of the object
 */
export function sanitizeObject(
  obj: any,
  options: {
    removeUnsafeKeys?: boolean;
    throwOnUnsafeKeys?: boolean;
    deep?: boolean;
  } = {}
): any {
  const {
    removeUnsafeKeys = true,
    throwOnUnsafeKeys = false,
    deep = true
  } = options;

  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deep ? sanitizeObject(item, options) : item);
  }

  const result = createSafeObject();

  for (const [key, value] of Object.entries(obj)) {
    if (!isSafeKey(key)) {
      if (throwOnUnsafeKeys) {
        throw new Error(`Unsafe key detected: "${key}"`);
      }
      if (!removeUnsafeKeys) {
        continue; // Skip this key
      }
      // If removeUnsafeKeys is true, we simply don't add it to result
      continue;
    }

    result[key] = deep ? sanitizeObject(value, options) : value;
  }

  return result;
}

/**
 * Validates input parameters for tokenization functions
 * @param obj The object to tokenize
 * @param dict The dictionary to use
 */
export function validateTokenizationInput(obj: any, dict: Record<string, string>): void {
  // Validate dictionary keys
  validateDictionaryKeys(dict);

  // Validate object keys
  validateObjectKeys(obj);

  // Additional validation for dictionary values
  for (const [key, value] of Object.entries(dict)) {
    if (typeof value !== 'string') {
      throw new Error(`Dictionary value for key "${key}" must be a string, got ${typeof value}`);
    }

    // Validate that dictionary values are also safe (they become keys in the result)
    if (!isSafeKey(value)) {
      throw new Error(`Dictionary value "${value}" for key "${key}" is not safe and could lead to prototype pollution`);
    }
  }
}

/**
 * Type guard to check if a value is a safe object
 * @param value The value to check
 * @returns true if the value is a safe object
 */
export function isSafeObject(value: any): value is Record<string, any> {
  if (value === null || value === undefined || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  try {
    validateObjectKeys(value);
    return true;
  } catch {
    return false;
  }
}