import { waitFor } from '@testing-library/react';
import { localStorageMock } from '../__test__/__mockData__/localStorage';

describe('Local Storage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('should set and get an item from local storage', () => {
    const key = 'testKey';
    const value = 'testValue';

    localStorageMock.setItem(key, value);

    expect(localStorageMock.getItem(key)).toEqual(value);
  });

  it('should remove an item from local storage', () => {
    const key = 'testKey';
    const value = 'testValue';

    localStorageMock.setItem(key, value);
    localStorageMock.removeItem(key);

    expect(localStorageMock.getItem(key)).toBeUndefined();
  });

  it('should clear all items from local storage', () => {
    const key1 = 'testKey1';
    const value1 = 'testValue1';
    const key2 = 'testKey2';
    const value2 = 'testValue2';

    localStorageMock.setItem(key1, value1);
    localStorageMock.setItem(key2, value2);
    localStorageMock.clear();

    expect(localStorageMock.getItem(key1)).toBeUndefined();
    expect(localStorageMock.getItem(key2)).toBeUndefined();
  });

  it('should handle string key and simple value', () => {
    localStorageMock.setItem('normalKey', 'simple value');
    expect(localStorageMock.getItem('normalKey')).toBe('simple value');
  });

  describe('setItem', () => {
    it('should handle number key and simple value', () => {
      localStorageMock.setItem(123, 'number key value');
      expect(localStorageMock.getItem(123)).toBe('number key value');
    });

    it('should handle string key with complex object value', () => {
      const complexObject = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
      localStorageMock.setItem('complexKey', complexObject);
      expect(localStorageMock.getItem('complexKey')).toEqual(complexObject);
    });

    it('should handle number key with array value', () => {
      const arrayValue = [1, 'two', { three: 3 }];
      localStorageMock.setItem(456, arrayValue);
      expect(localStorageMock.getItem(456)).toEqual(arrayValue);
    });

    it('should handle empty string key', () => {
      localStorageMock.setItem('', 'empty key value');
      expect(localStorageMock.getItem('')).toBe('empty key value');
    });

    it('should handle zero as key', () => {
      localStorageMock.setItem(0, 'zero key value');
      expect(localStorageMock.getItem(0)).toBe('zero key value');
    });

    it('should handle negative number key', () => {
      localStorageMock.setItem(-123, 'negative key value');
      expect(localStorageMock.getItem(-123)).toBe('negative key value');
    });

    it('should handle large number key', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      localStorageMock.setItem(largeNumber, 'large number key value');
      expect(localStorageMock.getItem(largeNumber)).toBe('large number key value');
    });

    it('should handle null key', () => {
      localStorageMock.setItem(null as any, 'null key value');
      expect(localStorageMock.getItem(null as any)).toBe('null key value');
    });

    it('should handle undefined key', () => {
      localStorageMock.setItem(undefined as any, 'undefined key value');
      expect(localStorageMock.getItem(undefined as any)).toBe('undefined key value');
    });

    it('should convert object key to string', () => {
      const objKey = { toString: () => 'objectKey' };
      localStorageMock.setItem(objKey as any, 'object key value');
      expect(localStorageMock.getItem('objectKey')).toBe('object key value');
    });

    it('should convert function key to string', () => {
      const funcKey = function test() {
        ('');
      };
      localStorageMock.setItem(funcKey as any, 'function key value');
      expect(localStorageMock.getItem(funcKey.toString())).toBe('function key value');
    });

    it('should handle large object value', () => {
      const largeObject = Array(1000)
        .fill(0)
        .reduce((acc: any, _: unknown, i: any) => {
          acc[`key${i}`] = `value${i}`;
          return acc;
        }, {});
      localStorageMock.setItem('largeObject', largeObject);
      expect(localStorageMock.getItem('largeObject')).toEqual(largeObject);
    });

    it('should overwrite existing key', () => {
      localStorageMock.setItem('overwriteKey', 'initial value');
      localStorageMock.setItem('overwriteKey', 'new value');
      expect(localStorageMock.getItem('overwriteKey')).toBe('new value');
    });

    it('should handle reserved word as key', () => {
      localStorageMock.setItem('constructor', 'reserved word value');
      expect(localStorageMock.getItem('constructor')).toBe('reserved word value');
    });

    it('should handle boolean key', () => {
      localStorageMock.setItem(true as any, 'boolean key value');
      expect(localStorageMock.getItem('true')).toBe('boolean key value');
    });

    it('should handle symbol key', () => {
      const symbolKey = Symbol('test');
      localStorageMock.setItem(symbolKey as any, 'symbol key value');
      waitFor(() => {
        expect(localStorageMock.getItem(symbolKey.toString())).toBe('symbol key value');
      });
    });
  });

  describe('getItem', () => {
    it('should retrieve existing string key', () => {
      localStorageMock.setItem('testKey', 'test value');
      expect(localStorageMock.getItem('testKey')).toBe('test value');
    });

    it('should retrieve existing number key', () => {
      localStorageMock.setItem(123, 'number value');
      expect(localStorageMock.getItem(123)).toBe('number value');
    });

    it('should return undefined for non-existing string key', () => {
      expect(localStorageMock.getItem('nonExistentKey')).toBeUndefined();
    });

    it('should return undefined for non-existing number key', () => {
      expect(localStorageMock.getItem(999)).toBeUndefined();
    });

    it('should retrieve key with special characters', () => {
      const specialKey = '!@#$%^&*()_+';
      localStorageMock.setItem(specialKey, 'special value');
      expect(localStorageMock.getItem(specialKey)).toBe('special value');
    });

    it('should retrieve key with empty string', () => {
      localStorageMock.setItem('', 'empty string value');
      expect(localStorageMock.getItem('')).toBe('empty string value');
    });

    it('should handle null key', () => {
      localStorageMock.setItem(null as any, 'null value');
      expect(localStorageMock.getItem(null as any)).toBe('null value');
    });

    it('should handle undefined key', () => {
      localStorageMock.setItem(undefined as any, 'undefined value');
      expect(localStorageMock.getItem(undefined as any)).toBe('undefined value');
    });

    it('should handle object as key', () => {
      const objKey = { toString: () => 'objectKey' };
      localStorageMock.setItem(objKey as any, 'object value');
      expect(localStorageMock.getItem(objKey as any)).toBe('object value');
    });

    it('should handle array as key', () => {
      const arrayKey = ['test'];
      localStorageMock.setItem(arrayKey as any, 'array value');
      expect(localStorageMock.getItem(arrayKey as any)).toBe('array value');
    });

    it('should handle large number key', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      localStorageMock.setItem(largeNumber, 'large number value');
      expect(localStorageMock.getItem(largeNumber)).toBe('large number value');
    });

    it('should handle large string key', () => {
      const largeKey = 'a'.repeat(1000);
      localStorageMock.setItem(largeKey, 'large string key value');
      expect(localStorageMock.getItem(largeKey)).toBe('large string key value');
    });

    it('should handle boolean key', () => {
      localStorageMock.setItem(true as any, 'boolean value');
      expect(localStorageMock.getItem(true as any)).toBe('boolean value');
    });

    it('should handle symbol key', () => {
      const symbolKey = Symbol('test');
      localStorageMock.setItem(symbolKey as any, 'symbol value');
      expect(localStorageMock.getItem(symbolKey as any)).toBe('symbol value');
    });

    it('should handle function key', () => {
      const funcKey = function test() {
        ('');
      };
      localStorageMock.setItem(funcKey as any, 'function value');
      expect(localStorageMock.getItem(funcKey as any)).toBe('function value');
    });

    it('should handle numeric string key', () => {
      localStorageMock.setItem('123', 'numeric string value');
      expect(localStorageMock.getItem('123')).toBe('numeric string value');
    });

    it('should handle negative number key', () => {
      localStorageMock.setItem(-123, 'negative number value');
      expect(localStorageMock.getItem(-123)).toBe('negative number value');
    });
  });

  describe('removeItem', () => {
    it('should remove an item from local storage', () => {
      const key = 'testKey';
      const value = 'testValue';

      localStorageMock.setItem(key, value);
      localStorageMock.removeItem(key);

      expect(localStorageMock.getItem(key)).toBeUndefined();
    });

    it('should remove item with numeric key', () => {
      const key = 123;
      const value = 'numberValue';

      localStorageMock.setItem(key, value);
      localStorageMock.removeItem(key);

      expect(localStorageMock.getItem(key)).toBeUndefined();
    });

    it('should not remove item if key does not exist (string)', () => {
      localStorageMock.setItem('existingKey', 'value');
      localStorageMock.removeItem('nonExistingKey');

      expect(localStorageMock.getItem('existingKey')).toBe('value');
      expect(localStorageMock.getItem('nonExistingKey')).toBeUndefined();
    });

    it('should not remove item if key does not exist (numeric)', () => {
      localStorageMock.setItem(123, 'value');
      localStorageMock.removeItem(456);

      expect(localStorageMock.getItem(123)).toBe('value');
      expect(localStorageMock.getItem(456)).toBeUndefined();
    });

    it('should do nothing when removing from empty store', () => {
      localStorageMock.removeItem('anyKey');
      expect(Object.keys(localStorageMock.getAll()).length).toBe(0);
    });

    it('should handle null key', () => {
      localStorageMock.setItem('null', 'nullValue');
      localStorageMock.removeItem(null as any);
      expect(localStorageMock.getItem('null')).toBeUndefined();
    });

    it('should handle undefined key', () => {
      localStorageMock.setItem('undefined', 'undefinedValue');
      localStorageMock.removeItem(undefined as any);
      expect(localStorageMock.getItem('undefined')).toBeUndefined();
    });

    it('should handle object key by converting to string', () => {
      const objKey = { toString: () => 'objKey' };
      localStorageMock.setItem(objKey as any, 'objValue');
      localStorageMock.removeItem(objKey as any);
      expect(localStorageMock.getItem('objKey')).toBeUndefined();
    });

    it('should remove item from large store', () => {
      // Populate store with many items
      for (let i = 0; i < 10000; i++) {
        localStorageMock.setItem(`key${i}`, `value${i}`);
      }
      const keyToRemove = 'key5000';
      localStorageMock.removeItem(keyToRemove);
      expect(localStorageMock.getItem(keyToRemove)).toBeUndefined();
      // Check adjacent keys to ensure they remain
      expect(localStorageMock.getItem('key4999')).toBe('value4999');
      expect(localStorageMock.getItem('key5001')).toBe('value5001');
    });

    it('should handle special character keys', () => {
      const key = '!@#$%^&*()';
      localStorageMock.setItem(key, 'specialValue');
      localStorageMock.removeItem(key);
      expect(localStorageMock.getItem(key)).toBeUndefined();
    });

    it('should handle numeric string keys', () => {
      const key = '123';
      localStorageMock.setItem(key, 'numericStringValue');
      localStorageMock.removeItem(key);
      expect(localStorageMock.getItem(key)).toBeUndefined();
    });

    it('should handle boolean keys by converting to string', () => {
      localStorageMock.setItem('true', 'booleanValue');
      localStorageMock.removeItem(true as any);
      expect(localStorageMock.getItem('true')).toBeUndefined();
    });

    it('should handle symbol keys by converting to string', () => {
      const symbolKey = Symbol('test');
      localStorageMock.setItem(symbolKey as any, 'symbolValue');
      localStorageMock.removeItem(symbolKey as any);
      waitFor(() => {
        expect(localStorageMock.getItem(symbolKey.toString())).toBeUndefined();
      });
    });
  });
});
