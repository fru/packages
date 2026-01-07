import { describe, it, expect } from 'vitest';
import { cloneAsDeepFrozen } from './clone';

describe('cloneAsDeepFrozen', () => {
  
  // 1. The "Golden Standard" Test
  it('should produce identical output to JSON.parse(JSON.stringify(val)) for complex objects', () => {
    const complexInput = {
      str: 'hello',
      num: 123,
      bool: true,
      arr: [1, 'two', { nested: 'obj' }],
      obj: {
        a: 1,
        b: { deep: 'value' }
      },
      date: new Date('2024-01-01T00:00:00.000Z'),
      nullVal: null,
      undefinedVal: undefined, 
      funcVal: () => console.log('I should disappear'),
      symVal: Symbol('I should disappear'),
    };

    const expected = JSON.parse(JSON.stringify(complexInput));
    const result = cloneAsDeepFrozen(complexInput);

    // Deep equality check
    console.log(result);
    expect(result).toEqual(expected);
    
    // Specific checks for JSON-specific transformations
    expect(result.date).toBeTypeOf('string'); // Dates become ISO strings
    expect(result).not.toHaveProperty('undefinedVal');
    expect(result).not.toHaveProperty('funcVal');
    expect(result).not.toHaveProperty('symVal');
  });

  // 2. Immutability Tests
  it('should recursively freeze the result', () => {
    const input = {
      level1: {
        level2: {
          level3: 'value'
        }
      },
      arr: [{ inArray: true }]
    };

    const result = cloneAsDeepFrozen(input);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.level1)).toBe(true);
    expect(Object.isFrozen(result.level1.level2)).toBe(true);
    expect(Object.isFrozen(result.arr)).toBe(true);
    expect(Object.isFrozen(result.arr[0])).toBe(true);
  });

  // 3. Special Number Handling (NaN, Infinity)
  it('should convert non-finite numbers to null (Standard JSON behavior)', () => {
    const input = {
      nan: NaN,
      infinity: Infinity,
      negInfinity: -Infinity,
      valid: 42
    };

    const expected = JSON.parse(JSON.stringify(input));
    const result = cloneAsDeepFrozen(input);

    expect(result).toEqual(expected);
    expect(result.nan).toBeNull();
    expect(result.infinity).toBeNull();
    expect(result.negInfinity).toBeNull();
  });

  // 4. Array Handling (Sparse Arrays & Undefined)
  it('should handle arrays with undefined or holes correctly', () => {
    // JSON.stringify converts array holes and undefined items to null
    const input = [1, , 3, undefined]; 
    
    const expected = JSON.parse(JSON.stringify(input));
    const result = cloneAsDeepFrozen(input);

    expect(result).toEqual(expected);
    expect(result).toEqual([1, null, 3, null]);
    expect(Object.isFrozen(result)).toBe(true);
  });

  // 5. Wrapper Objects
  it('should unwrap primitive wrapper objects', () => {
    // eslint-disable-next-line no-new-wrappers
    const input = {
      str: new String('hello'),
      num: new Number(123),
      bool: new Boolean(true)
    };

    const expected = JSON.parse(JSON.stringify(input));
    const result = cloneAsDeepFrozen(input);

    expect(result).toEqual(expected);
    expect(typeof result.str).toBe('string');
    expect(typeof result.num).toBe('number');
  });

  // 6. Circular References & Depth Limit
  it('should throw an error on circular references (Depth limit reached)', () => {
    const circular: any = { name: 'loop' };
    circular.self = circular;

    // Default depth is 7000, so this will run for a moment then crash
    expect(() => cloneAsDeepFrozen(circular, 100)).toThrow(/Depth limit reached/);
  });

  // 7. Optimization Check
  it('should return immediately if object is already marked as deep frozen', () => {
    const alreadyFrozen = { foo: 'bar' };
    const result = cloneAsDeepFrozen(alreadyFrozen);
    const rerun = cloneAsDeepFrozen(result);

    // It should return the exact same reference
    expect(rerun).toBe(result); 
  });
  
  // 8. Top Level Primitive Returns
  it('should handle top-level non-complex types', () => {
      expect(cloneAsDeepFrozen(5)).toBe(5);
      expect(cloneAsDeepFrozen('str')).toBe('str');
      expect(cloneAsDeepFrozen(null)).toBe(null);
      // JSON.parse(JSON.stringify(undefined)) throws syntax error, but returning undefined is better.
      expect(cloneAsDeepFrozen(undefined)).toBe(undefined);
      expect(cloneAsDeepFrozen(function(){})).toBe(undefined);
  });
});