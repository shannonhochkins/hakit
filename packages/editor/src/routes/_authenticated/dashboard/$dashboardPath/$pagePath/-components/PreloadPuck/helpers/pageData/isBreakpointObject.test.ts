import { expect, test, describe } from 'bun:test';
import { isBreakpointObject } from './isBreakpointObject';

describe('isBreakpointObject', () => {
  describe('valid breakpoint objects', () => {
    test('should return true for object with single valid prefixed breakpoint key', () => {
      expect(isBreakpointObject({ $xxs: 'value' })).toBe(true);
      expect(isBreakpointObject({ $xs: 'value' })).toBe(true);
      expect(isBreakpointObject({ $sm: 'value' })).toBe(true);
      expect(isBreakpointObject({ $md: 'value' })).toBe(true);
      expect(isBreakpointObject({ $lg: 'value' })).toBe(true);
      expect(isBreakpointObject({ $xlg: 'value' })).toBe(true);
    });

    test('should return true for object with multiple valid prefixed breakpoint keys', () => {
      expect(isBreakpointObject({ $xs: 'small', $lg: 'large' })).toBe(true);
      expect(isBreakpointObject({ $xxs: 1, $xs: 2, $sm: 3, $md: 4, $lg: 5, $xlg: 6 })).toBe(true);
    });

    test('should return true for object with valid prefixed breakpoint key and other non-breakpoint keys', () => {
      expect(isBreakpointObject({ $lg: 'value', width: 100, height: 200 })).toBe(true);
      expect(isBreakpointObject({ $xs: 'small', otherProp: 'test', anotherProp: 42 })).toBe(true);
    });

    test('should return true for object with prefixed breakpoint keys containing various value types', () => {
      expect(isBreakpointObject({ $lg: null })).toBe(true);
      expect(isBreakpointObject({ $xs: undefined })).toBe(true);
      expect(isBreakpointObject({ $md: 0 })).toBe(true);
      expect(isBreakpointObject({ $sm: false })).toBe(true);
      expect(isBreakpointObject({ $xlg: [] })).toBe(true);
      expect(isBreakpointObject({ $lg: {} })).toBe(true);
      expect(isBreakpointObject({ $xs: { nested: 'object' } })).toBe(true);
    });

    test('should return true for empty object with prefixed breakpoint key', () => {
      expect(isBreakpointObject({ $lg: {} })).toBe(true);
    });
  });

  describe('invalid breakpoint objects', () => {
    test('should return false for object with unprefixed breakpoint keys', () => {
      expect(isBreakpointObject({ xxs: 'value' })).toBe(false);
      expect(isBreakpointObject({ xs: 'value' })).toBe(false);
      expect(isBreakpointObject({ sm: 'value' })).toBe(false);
      expect(isBreakpointObject({ md: 'value' })).toBe(false);
      expect(isBreakpointObject({ lg: 'value' })).toBe(false);
      expect(isBreakpointObject({ xlg: 'value' })).toBe(false);
    });

    test('should return false for object with no valid breakpoint keys', () => {
      expect(isBreakpointObject({ width: 100, height: 200 })).toBe(false);
      expect(isBreakpointObject({ prop1: 'value1', prop2: 'value2' })).toBe(false);
      expect(isBreakpointObject({ large: 'value', medium: 'value' })).toBe(false);
    });

    test('should return false for object with similar but invalid breakpoint keys', () => {
      expect(isBreakpointObject({ $xxl: 'value' })).toBe(false); // $xxl instead of $xlg
      expect(isBreakpointObject({ $xl: 'value' })).toBe(false); // $xl instead of $xlg
      expect(isBreakpointObject({ $x: 'value' })).toBe(false); // $x instead of $xs
      expect(isBreakpointObject({ $small: 'value' })).toBe(false); // $small instead of $sm
      expect(isBreakpointObject({ $medium: 'value' })).toBe(false); // $medium instead of $md
      expect(isBreakpointObject({ $large: 'value' })).toBe(false); // $large instead of $lg
    });

    test('should return false for object with double prefixed keys', () => {
      expect(isBreakpointObject({ $$lg: 'value' })).toBe(false);
      expect(isBreakpointObject({ $$xs: 'value' })).toBe(false);
    });

    test('should return false for object with other prefix characters', () => {
      expect(isBreakpointObject({ '#lg': 'value' })).toBe(false);
      expect(isBreakpointObject({ '@xs': 'value' })).toBe(false);
      expect(isBreakpointObject({ '&md': 'value' })).toBe(false);
    });

    test('should return false for empty object', () => {
      expect(isBreakpointObject({})).toBe(false);
    });

    test('should return false for object with empty string keys', () => {
      expect(isBreakpointObject({ '': 'value' })).toBe(false);
      expect(isBreakpointObject({ $: 'value' })).toBe(false);
    });

    test('should return false for object with numeric keys', () => {
      expect(isBreakpointObject({ 0: 'value', 1: 'value' })).toBe(false);
    });
  });

  describe('non-object values', () => {
    test('should return false for null and undefined', () => {
      expect(isBreakpointObject(null)).toBe(false);
      expect(isBreakpointObject(undefined)).toBe(false);
    });

    test('should return false for primitive values', () => {
      expect(isBreakpointObject('string')).toBe(false);
      expect(isBreakpointObject('')).toBe(false);
      expect(isBreakpointObject('$lg')).toBe(false); // Even if string matches breakpoint name
      expect(isBreakpointObject(42)).toBe(false);
      expect(isBreakpointObject(0)).toBe(false);
      expect(isBreakpointObject(-1)).toBe(false);
      expect(isBreakpointObject(true)).toBe(false);
      expect(isBreakpointObject(false)).toBe(false);
      expect(isBreakpointObject(Symbol('test'))).toBe(false);
      expect(isBreakpointObject(BigInt(123))).toBe(false);
    });

    test('should return false for arrays', () => {
      expect(isBreakpointObject([])).toBe(false);
      expect(isBreakpointObject(['$lg', '$xs'])).toBe(false);
      expect(isBreakpointObject([{ $lg: 'value' }])).toBe(false);
    });

    test('should return false for functions', () => {
      expect(isBreakpointObject(() => {})).toBe(false);
      expect(isBreakpointObject(function () {})).toBe(false);
      expect(isBreakpointObject(class TestClass {})).toBe(false);
    });

    test('should return false for built-in objects without breakpoint keys', () => {
      expect(isBreakpointObject(new Date())).toBe(false);
      expect(isBreakpointObject(new RegExp('test'))).toBe(false);
      expect(isBreakpointObject(new Error('test'))).toBe(false);
      expect(isBreakpointObject(new Map())).toBe(false);
      expect(isBreakpointObject(new Set())).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle objects with prototype pollution attempts', () => {
      const maliciousObj = JSON.parse('{"__proto__": {"$lg": "malicious"}}');
      expect(isBreakpointObject(maliciousObj)).toBe(false);
    });

    test('should handle objects with non-enumerable properties', () => {
      const obj = {};
      Object.defineProperty(obj, '$lg', {
        value: 'test',
        enumerable: false,
      });
      expect(isBreakpointObject(obj)).toBe(false);
    });

    test('should handle objects with getters that throw', () => {
      const obj = {
        get $lg() {
          throw new Error('Getter error');
        },
      };
      expect(isBreakpointObject(obj)).toBe(true); // Should still detect the key
    });

    test('should handle very large objects', () => {
      const largeObj: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`prop${i}`] = `value${i}`;
      }
      expect(isBreakpointObject(largeObj)).toBe(false);

      largeObj['$lg'] = 'breakpoint value';
      expect(isBreakpointObject(largeObj)).toBe(true);
    });

    test('should handle objects with special characters in keys', () => {
      expect(isBreakpointObject({ '$lg-special': 'value' })).toBe(false);
      expect(isBreakpointObject({ $lg_underscore: 'value' })).toBe(false);
      expect(isBreakpointObject({ '$lg.dot': 'value' })).toBe(false);
      expect(isBreakpointObject({ '$lg space': 'value' })).toBe(false);
      expect(isBreakpointObject({ $lg: 'value', '$lg-special': 'value' })).toBe(true);
    });

    test('should handle case sensitivity', () => {
      expect(isBreakpointObject({ $LG: 'value' })).toBe(false);
      expect(isBreakpointObject({ $Lg: 'value' })).toBe(false);
      expect(isBreakpointObject({ $XS: 'value' })).toBe(false);
      expect(isBreakpointObject({ $XLG: 'value' })).toBe(false);
    });

    test('should handle mixed valid and invalid prefixed keys', () => {
      expect(isBreakpointObject({ $lg: 'valid', lg: 'invalid' })).toBe(true);
      expect(isBreakpointObject({ xs: 'invalid', $xs: 'valid' })).toBe(true);
      expect(isBreakpointObject({ xlg: 'invalid', width: 100 })).toBe(false);
    });

    test('should handle $ prefix with whitespace', () => {
      expect(isBreakpointObject({ '$ lg': 'value' })).toBe(false);
      expect(isBreakpointObject({ '$\tlg': 'value' })).toBe(false);
      expect(isBreakpointObject({ '$\nlg': 'value' })).toBe(false);
    });
  });

  describe('type narrowing behavior', () => {
    test('should correctly narrow type when used as type guard', () => {
      const value: unknown = { $lg: 'test', width: 100 };

      if (isBreakpointObject(value)) {
        // TypeScript should now know that value is Record<string, unknown>
        expect(typeof value).toBe('object');
        expect(value.$lg).toBe('test');
        expect(value.width).toBe(100);

        // Should be able to access properties without type errors
        const keys = Object.keys(value);
        expect(keys).toContain('$lg');
        expect(keys).toContain('width');
      } else {
        throw new Error('Type guard should have returned true');
      }
    });

    test('should handle type narrowing with false result', () => {
      const value: unknown = 'not an object';

      if (isBreakpointObject(value)) {
        throw new Error('Type guard should have returned false');
      } else {
        // value is still unknown type here, which is correct
        expect(typeof value).toBe('string');
      }
    });

    test('should handle type narrowing with unprefixed breakpoint keys', () => {
      const value: unknown = { lg: 'test', xs: 'small' };

      if (isBreakpointObject(value)) {
        throw new Error('Type guard should have returned false for unprefixed keys');
      } else {
        // Should correctly identify this as not a breakpoint object
        expect(typeof value).toBe('object');
      }
    });
  });
});
