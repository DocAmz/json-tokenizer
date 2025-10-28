import { describe, it, expect } from "vitest";
import {
  tokenize,
  detokenize,
  generateDictionary,
  isSafeKey,
  validateDictionaryKeys,
  validateObjectKeys,
  createSafeObject,
  safeAssign,
  sanitizeObject,
  validateTokenizationInput,
  isSafeObject,
  TokenizationMethod
} from "../src";

// Helper function to create objects with dangerous keys (for testing purposes only)
function createDangerousObject(baseObj: any, dangerousKey: string, value: any): any {
  Object.defineProperty(baseObj, dangerousKey, {
    value: value,
    enumerable: true,
    writable: true,
    configurable: true
  });
  return baseObj;
}

describe("Security Safeguards", () => {
  describe("isSafeKey", () => {
    it("should identify dangerous keys", () => {
      expect(isSafeKey("__proto__")).toBe(false);
      expect(isSafeKey("constructor")).toBe(false);
      expect(isSafeKey("prototype")).toBe(false);
    });

    it("should identify dangerous property names", () => {
      expect(isSafeKey("__defineGetter__")).toBe(false);
      expect(isSafeKey("__defineSetter__")).toBe(false);
      expect(isSafeKey("hasOwnProperty")).toBe(false);
      expect(isSafeKey("toString")).toBe(false);
      expect(isSafeKey("valueOf")).toBe(false);
    });

    it("should reject non-string keys", () => {
      expect(isSafeKey(null as any)).toBe(false);
      expect(isSafeKey(undefined as any)).toBe(false);
      expect(isSafeKey(123 as any)).toBe(false);
      expect(isSafeKey({} as any)).toBe(false);
    });

    it("should reject keys with control characters", () => {
      expect(isSafeKey("key\x00")).toBe(false);
      expect(isSafeKey("key\x1f")).toBe(false);
      expect(isSafeKey("key\x7f")).toBe(false);
    });

    it("should accept safe keys", () => {
      expect(isSafeKey("name")).toBe(true);
      expect(isSafeKey("age")).toBe(true);
      expect(isSafeKey("user_id")).toBe(true);
      expect(isSafeKey("data-attribute")).toBe(true);
      expect(isSafeKey("validKey123")).toBe(true);
    });
  });

  describe("validateDictionaryKeys", () => {
    it("should throw on dangerous dictionary keys", () => {
      const dangerousDict = createDangerousObject({ "name": "b" }, "__proto__", "a");
      expect(() => validateDictionaryKeys(dangerousDict))
        .toThrow('Dangerous key detected in dictionary: "__proto__"');
    });

    it("should pass validation for safe dictionary", () => {
      const safeDict = { "name": "a", "age": "b", "city": "c" };
      expect(() => validateDictionaryKeys(safeDict)).not.toThrow();
    });

    it("should detect multiple dangerous keys", () => {
      const dangerousDict = createDangerousObject({}, "constructor", "a");
      createDangerousObject(dangerousDict, "prototype", "b");
      expect(() => validateDictionaryKeys(dangerousDict))
        .toThrow('Dangerous key detected in dictionary: "constructor"');
    });
  });

  describe("validateObjectKeys", () => {
    it("should validate nested objects", () => {
      const dangerousObj = {
        user: createDangerousObject({}, "__proto__", "hacked")
      };

      expect(() => validateObjectKeys(dangerousObj))
        .toThrow('Dangerous key detected at root.user.__proto__');
    });

    it("should validate arrays", () => {
      const maliciousItem = createDangerousObject({ "name": "Bob" }, "__proto__", "hacked");

      const objWithArray = {
        users: [
          { "name": "Alice" },
          maliciousItem
        ]
      };

      expect(() => validateObjectKeys(objWithArray))
        .toThrow('Dangerous key detected at root.users[1].__proto__');
    });

    it("should pass validation for safe objects", () => {
      const safeObj = {
        user: {
          profile: { name: "Alice", age: 30 },
          settings: { theme: "dark" }
        },
        data: [1, 2, 3, { value: "test" }]
      };

      expect(() => validateObjectKeys(safeObj)).not.toThrow();
    });
  });

  describe("Prototype Pollution Prevention", () => {
    it("should prevent prototype pollution via __proto__", () => {
      const maliciousDict = createDangerousObject({}, "__proto__", "polluted");
      const testObj = { name: "Alice" };

      expect(() => tokenize(testObj, maliciousDict))
        .toThrow('Dangerous key detected in dictionary: "__proto__"');
    });

    it("should prevent prototype pollution via constructor", () => {
      const maliciousDict = createDangerousObject({}, "constructor", "polluted");
      const testObj = { name: "Alice" };

      expect(() => tokenize(testObj, maliciousDict))
        .toThrow('Dangerous key detected in dictionary: "constructor"');
    });

    it("should prevent prototype pollution in input object", () => {
      const safeDict = { "name": "a" };
      const maliciousObj = createDangerousObject(
        { "name": "Alice" },
        "__proto__",
        { "isAdmin": true }
      );

      expect(() => tokenize(maliciousObj, safeDict))
        .toThrow('Dangerous key detected at root.__proto__');
    });

    it("should prevent prototype pollution in detokenization", () => {
      const maliciousReverseDict = createDangerousObject({}, "__proto__", "originalKey");
      const testObj = { "a": "Alice" };

      expect(() => detokenize(testObj, maliciousReverseDict))
        .toThrow('Dangerous key detected in dictionary: "__proto__"');
    });

    it("should prevent dangerous tokens in dictionary values", () => {
      const dangerousDict = { "name": "__proto__" };
      const testObj = { name: "Alice" };

      expect(() => tokenize(testObj, dangerousDict))
        .toThrow('Dictionary value "__proto__" for key "name" is not safe');
    });
  });

  describe("createSafeObject", () => {
    it("should create object with null prototype", () => {
      const safeObj = createSafeObject();
      expect(Object.getPrototypeOf(safeObj)).toBe(null);
      expect(safeObj.toString).toBeUndefined();
      expect(safeObj.hasOwnProperty).toBeUndefined();
    });
  });

  describe("safeAssign", () => {
    it("should safely assign properties", () => {
      const obj = createSafeObject();
      safeAssign(obj, "name", "Alice");
      expect(obj.name).toBe("Alice");
    });

    it("should reject dangerous keys", () => {
      const obj = createSafeObject();
      expect(() => safeAssign(obj, "__proto__", "hacked"))
        .toThrow('Cannot assign dangerous key: "__proto__"');
    });
  });

  describe("sanitizeObject", () => {
    it("should remove unsafe keys by default", () => {
      let unsafeObj = createDangerousObject({
        name: "Alice",
        age: 30
      }, "__proto__", "hacked");
      unsafeObj = createDangerousObject(unsafeObj, "constructor", "polluted");

      const sanitized = sanitizeObject(unsafeObj);
      expect(sanitized.name).toBe("Alice");
      expect(sanitized.age).toBe(30);
      expect(sanitized.__proto__).toBeUndefined();
      expect(sanitized.constructor).toBeUndefined();
    });

    it("should throw on unsafe keys when configured", () => {
      const unsafeObj = createDangerousObject({ name: "Alice" }, "__proto__", "hacked");
      expect(() => sanitizeObject(unsafeObj, { throwOnUnsafeKeys: true }))
        .toThrow('Unsafe key detected: "__proto__"');
    });

    it("should handle nested objects when deep=true", () => {
      const nestedUnsafeObj = {
        user: createDangerousObject({ name: "Alice" }, "__proto__", "hacked")
      };

      const sanitized = sanitizeObject(nestedUnsafeObj, { deep: true });
      expect(sanitized.user.name).toBe("Alice");
      expect(sanitized.user.__proto__).toBeUndefined();
    });

    it("should handle arrays", () => {
      const objWithArray = {
        users: [
          { name: "Alice", "__proto__": "hacked" } as any,
          { name: "Bob", "constructor": "polluted" } as any
        ]
      };

      const sanitized = sanitizeObject(objWithArray);
      expect(sanitized.users[0].name).toBe("Alice");
      expect(sanitized.users[0].__proto__).toBeUndefined();
      expect(sanitized.users[1].name).toBe("Bob");
      expect(sanitized.users[1].constructor).toBeUndefined();
    });
  });

  describe("Integration Security Tests", () => {
    it("should handle complex tokenization safely", () => {
      const complexData = {
        user: {
          profile: { firstName: "John", lastName: "Doe" },
          settings: { theme: "dark", notifications: true }
        },
        metadata: { version: "1.0" }
      };

      const keys = [
        "user", "profile", "firstName", "lastName",
        "settings", "theme", "notifications",
        "metadata", "version"
      ];

      const dict = generateDictionary(keys, { method: TokenizationMethod.ALPHABETIC });
      const encoded = tokenize(complexData, dict.forward);
      const decoded = detokenize(encoded, dict.reverse);

      expect(decoded).toEqual(complexData);
    });

    it("should prevent pollution in complex nested structures", () => {
      const maliciousData = {
        user: {
          profile: createDangerousObject(
            { firstName: "John" },
            "__proto__",
            { isAdmin: true }
          )
        }
      };

      const keys = ["user", "profile", "firstName"];
      const dict = generateDictionary(keys);

      expect(() => tokenize(maliciousData, dict.forward))
        .toThrow('Dangerous key detected at root.user.profile.__proto__');
    });

    it("should maintain object integrity after tokenization", () => {
      const testData = { name: "Alice", age: 30 };
      const keys = ["name", "age"];
      const dict = generateDictionary(keys);

      const encoded = tokenize(testData, dict.forward);

      // Verify the result object is safe
      expect(Object.getPrototypeOf(encoded)).toBe(null);
      expect(encoded.toString).toBeUndefined();

      const decoded = detokenize(encoded, dict.reverse);
      expect(Object.getPrototypeOf(decoded)).toBe(null);
      expect(decoded).toEqual(testData);
    });

    it("should handle edge cases safely", () => {
      // Test with null and undefined values
      const dataWithNulls = {
        name: "Alice",
        value: null,
        optional: undefined
      };

      const keys = ["name", "value", "optional"];
      const dict = generateDictionary(keys);

      const encoded = tokenize(dataWithNulls, dict.forward);
      const decoded = detokenize(encoded, dict.reverse);

      expect(decoded).toEqual(dataWithNulls);
    });

    it("should validate dictionary consistency", () => {
      const keys = ["name", "age"];
      const dict = generateDictionary(keys);

      // Verify forward and reverse dictionaries are consistent
      for (const [key, token] of Object.entries(dict.forward)) {
        expect(dict.reverse[token]).toBe(key);
      }

      // Verify all keys and tokens are safe
      expect(() => validateDictionaryKeys(dict.forward)).not.toThrow();
      expect(() => validateDictionaryKeys(dict.reverse)).not.toThrow();
    });
  });

  describe("isSafeObject type guard", () => {
    it("should identify safe objects", () => {
      const safeObj = { name: "Alice", age: 30 };
      expect(isSafeObject(safeObj)).toBe(true);
    });

    it("should reject unsafe objects", () => {
      const unsafeObj = createDangerousObject({ name: "Alice" }, "__proto__", "hacked");
      expect(isSafeObject(unsafeObj)).toBe(false);
    });

    it("should reject non-objects", () => {
      expect(isSafeObject(null)).toBe(false);
      expect(isSafeObject(undefined)).toBe(false);
      expect(isSafeObject("string")).toBe(false);
      expect(isSafeObject(123)).toBe(false);
      expect(isSafeObject([])).toBe(false);
    });
  });

  describe("Real-world attack scenarios", () => {
    it("should prevent JSON.parse prototype pollution", () => {
      // Create an object that actually has __proto__ as a key
      const parsed = createDangerousObject({ name: "Alice" }, "__proto__", { isAdmin: true });

      const keys = ["name"];
      const dict = generateDictionary(keys);

      // Our security measures should prevent this from succeeding
      expect(() => tokenize(parsed, dict.forward))
        .toThrow('Dangerous key detected at root.__proto__');
    });

    it("should prevent constructor pollution", () => {
      const maliciousObj = createDangerousObject(
        { name: "Alice" },
        "constructor",
        {
          prototype: {
            isAdmin: true
          }
        }
      );

      const keys = ["name"];
      const dict = generateDictionary(keys);

      expect(() => tokenize(maliciousObj, dict.forward))
        .toThrow('Dangerous key detected at root.constructor');
    });

    it("should handle deeply nested pollution attempts", () => {
      const deeplyNested = {
        level1: {
          level2: {
            level3: {
              level4: createDangerousObject({}, "__proto__", { polluted: true })
            }
          }
        }
      };

      const keys = ["level1", "level2", "level3", "level4"];
      const dict = generateDictionary(keys);

      expect(() => tokenize(deeplyNested, dict.forward))
        .toThrow('Dangerous key detected at root.level1.level2.level3.level4.__proto__');
    });
  });
});