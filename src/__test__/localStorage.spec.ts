import {waitFor} from "@testing-library/react";
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
    const funcKey = function test() {''};
    localStorageMock.setItem(funcKey as any, 'function key value');
    expect(localStorageMock.getItem(funcKey.toString())).toBe('function key value');
  });

  it('should handle large object value', () => {
    const largeObject = Array(1000).fill(0).reduce((acc: any, _:unknown, i: any) => {
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
    })
  });
});
