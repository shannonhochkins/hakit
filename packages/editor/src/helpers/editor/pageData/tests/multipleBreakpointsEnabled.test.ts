import { expect, test, describe } from 'bun:test';
import { multipleBreakpointsEnabled } from '../multipleBreakpointsEnabled';

describe('multipleBreakpointsEnabled', () => {
  describe('valid breakpoint objects with multiple keys', () => {
    test('should return true for object with multiple valid prefixed breakpoint keys', () => {
      expect(multipleBreakpointsEnabled({ $xs: 'small', $lg: 'large' })).toBe(true);
      expect(multipleBreakpointsEnabled({ $xxs: 1, $xs: 2, $sm: 3 })).toBe(true);
      expect(multipleBreakpointsEnabled({ $md: 4, $lg: 5, $xlg: 6 })).toBe(true);
    });

    test('should return true for object with valid prefixed breakpoint keys and other properties', () => {
      expect(multipleBreakpointsEnabled({ $lg: 'value', width: 100 })).toBe(true);
      expect(multipleBreakpointsEnabled({ $xs: 'small', $md: 'medium', otherProp: 'test' })).toBe(true);
      expect(multipleBreakpointsEnabled({ $sm: 'small', height: 200, className: 'test' })).toBe(true);
    });

    test('should return true for object with all valid breakpoint keys', () => {
      expect(
        multipleBreakpointsEnabled({
          $xxs: 'xxs-value',
          $xs: 'xs-value',
          $sm: 'sm-value',
          $md: 'md-value',
          $lg: 'lg-value',
          $xlg: 'xlg-value',
        })
      ).toBe(true);
    });

    test('should return true for mixed valid breakpoint keys with various value types', () => {
      expect(multipleBreakpointsEnabled({ $lg: null, $xs: undefined })).toBe(true);
      expect(multipleBreakpointsEnabled({ $md: 0, $sm: false })).toBe(true);
      expect(multipleBreakpointsEnabled({ $xlg: [], $lg: {} })).toBe(true);
      expect(multipleBreakpointsEnabled({ $xs: { nested: 'object' }, $lg: 'string' })).toBe(true);
    });
  });

  describe('single key breakpoint objects', () => {
    test('should return false for object with single valid prefixed breakpoint key', () => {
      expect(multipleBreakpointsEnabled({ $xxs: 'value' })).toBe(false);
      expect(multipleBreakpointsEnabled({ $xs: 'value' })).toBe(false);
      expect(multipleBreakpointsEnabled({ $sm: 'value' })).toBe(false);
      expect(multipleBreakpointsEnabled({ $md: 'value' })).toBe(false);
      expect(multipleBreakpointsEnabled({ $lg: 'value' })).toBe(false);
      expect(multipleBreakpointsEnabled({ $xlg: 'value' })).toBe(false);
    });

    test('should return false for object with single breakpoint key containing various value types', () => {
      expect(multipleBreakpointsEnabled({ $lg: null })).toBe(false);
      expect(multipleBreakpointsEnabled({ $xs: undefined })).toBe(false);
      expect(multipleBreakpointsEnabled({ $md: 0 })).toBe(false);
      expect(multipleBreakpointsEnabled({ $sm: false })).toBe(false);
      expect(multipleBreakpointsEnabled({ $xlg: [] })).toBe(false);
      expect(multipleBreakpointsEnabled({ $lg: {} })).toBe(false);
      expect(multipleBreakpointsEnabled({ $xs: { nested: 'object' } })).toBe(false);
    });
  });

  describe('invalid breakpoint objects', () => {
    test('should return false for object with unprefixed breakpoint keys', () => {
      expect(multipleBreakpointsEnabled({ xs: 'small', lg: 'large' })).toBe(false);
      expect(multipleBreakpointsEnabled({ xxs: 1, xs: 2, sm: 3 })).toBe(false);
      expect(multipleBreakpointsEnabled({ md: 4, lg: 5, xlg: 6 })).toBe(false);
    });

    test('should return false for object with no valid breakpoint keys', () => {
      expect(multipleBreakpointsEnabled({ width: 100, height: 200 })).toBe(false);
      expect(multipleBreakpointsEnabled({ prop1: 'value1', prop2: 'value2', prop3: 'value3' })).toBe(false);
      expect(multipleBreakpointsEnabled({ large: 'value', medium: 'value', small: 'value' })).toBe(false);
    });

    test('should return false for object with similar but invalid breakpoint keys', () => {
      expect(multipleBreakpointsEnabled({ $xxl: 'value1', $xl: 'value2' })).toBe(false);
      expect(multipleBreakpointsEnabled({ $x: 'value1', $small: 'value2' })).toBe(false);
      expect(multipleBreakpointsEnabled({ $medium: 'value1', $large: 'value2' })).toBe(false);
    });

    test('should return false for object with mixed valid and invalid keys but no valid breakpoint', () => {
      expect(multipleBreakpointsEnabled({ lg: 'invalid', width: 100, height: 200 })).toBe(false);
      expect(multipleBreakpointsEnabled({ xs: 'invalid', md: 'invalid', prop: 'test' })).toBe(false);
    });

    test('should return false for empty object', () => {
      expect(multipleBreakpointsEnabled({})).toBe(false);
    });
  });

  describe('non-object values', () => {
    test('should return false for null and undefined', () => {
      expect(multipleBreakpointsEnabled(null)).toBe(false);
      expect(multipleBreakpointsEnabled(undefined)).toBe(false);
    });

    test('should return false for primitive values', () => {
      expect(multipleBreakpointsEnabled('string')).toBe(false);
      expect(multipleBreakpointsEnabled('')).toBe(false);
      expect(multipleBreakpointsEnabled('$lg')).toBe(false);
      expect(multipleBreakpointsEnabled(42)).toBe(false);
      expect(multipleBreakpointsEnabled(0)).toBe(false);
      expect(multipleBreakpointsEnabled(-1)).toBe(false);
      expect(multipleBreakpointsEnabled(true)).toBe(false);
      expect(multipleBreakpointsEnabled(false)).toBe(false);
      expect(multipleBreakpointsEnabled(Symbol('test'))).toBe(false);
      expect(multipleBreakpointsEnabled(BigInt(123))).toBe(false);
    });

    test('should return false for arrays', () => {
      expect(multipleBreakpointsEnabled([])).toBe(false);
      expect(multipleBreakpointsEnabled(['$lg', '$xs'])).toBe(false);
      expect(multipleBreakpointsEnabled([{ $lg: 'value' }, { $xs: 'value' }])).toBe(false);
    });

    test('should return false for functions', () => {
      expect(multipleBreakpointsEnabled(() => {})).toBe(false);
      expect(multipleBreakpointsEnabled(function () {})).toBe(false);
      expect(multipleBreakpointsEnabled(class TestClass {})).toBe(false);
    });

    test('should return false for built-in objects', () => {
      expect(multipleBreakpointsEnabled(new Date())).toBe(false);
      expect(multipleBreakpointsEnabled(new RegExp('test'))).toBe(false);
      expect(multipleBreakpointsEnabled(new Error('test'))).toBe(false);
      expect(multipleBreakpointsEnabled(new Map())).toBe(false);
      expect(multipleBreakpointsEnabled(new Set())).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should return false for objects with only non-enumerable properties', () => {
      const obj = {};
      Object.defineProperty(obj, '$lg', {
        value: 'test1',
        enumerable: false,
      });
      Object.defineProperty(obj, '$xs', {
        value: 'test2',
        enumerable: false,
      });
      expect(multipleBreakpointsEnabled(obj)).toBe(false);
    });

    test('should return true for objects with getters that throw but have multiple keys', () => {
      const obj = {
        get $lg() {
          throw new Error('Getter error');
        },
        get $xs() {
          throw new Error('Another getter error');
        },
      };
      expect(multipleBreakpointsEnabled(obj)).toBe(true);
    });

    test('should return false for objects with single getter that throws', () => {
      const obj = {
        get $lg() {
          throw new Error('Getter error');
        },
      };
      expect(multipleBreakpointsEnabled(obj)).toBe(false);
    });

    test('should handle very large objects with multiple breakpoint keys', () => {
      const largeObj: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`prop${i}`] = `value${i}`;
      }
      largeObj['$lg'] = 'breakpoint value 1';
      largeObj['$xs'] = 'breakpoint value 2';
      expect(multipleBreakpointsEnabled(largeObj)).toBe(true);
    });

    test('should handle very large objects with single breakpoint key', () => {
      const largeObj: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`prop${i}`] = `value${i}`;
      }
      largeObj['$lg'] = 'breakpoint value';
      expect(multipleBreakpointsEnabled(largeObj)).toBe(true); // Because it has $lg + 1000 other props
    });

    test('should handle objects with special characters in keys alongside breakpoint keys', () => {
      expect(multipleBreakpointsEnabled({ $lg: 'value', '$lg-special': 'value' })).toBe(true);
      expect(multipleBreakpointsEnabled({ $xs: 'value', $lg_underscore: 'value' })).toBe(true);
      expect(multipleBreakpointsEnabled({ $md: 'value', '$lg.dot': 'value' })).toBe(true);
      expect(multipleBreakpointsEnabled({ $sm: 'value', '$lg space': 'value' })).toBe(true);
    });

    test('should handle case sensitivity correctly', () => {
      expect(multipleBreakpointsEnabled({ $lg: 'value', $LG: 'value' })).toBe(true); // $LG is not a valid breakpoint but still counts as a key
      expect(multipleBreakpointsEnabled({ $xs: 'value', $XS: 'value' })).toBe(true);
    });

    test('should handle mixed valid breakpoint keys with invalid prefixed keys', () => {
      expect(multipleBreakpointsEnabled({ $lg: 'valid', $$lg: 'invalid-double' })).toBe(true);
      expect(multipleBreakpointsEnabled({ $xs: 'valid', '#lg': 'invalid-hash' })).toBe(true);
      expect(multipleBreakpointsEnabled({ $md: 'valid', '@xs': 'invalid-at' })).toBe(true);
    });

    test('should handle objects with only invalid prefixed keys', () => {
      expect(multipleBreakpointsEnabled({ $$lg: 'invalid1', $$xs: 'invalid2' })).toBe(false);
      expect(multipleBreakpointsEnabled({ '#lg': 'invalid1', '@xs': 'invalid2' })).toBe(false);
    });

    test('should handle objects with $ prefix but whitespace', () => {
      expect(multipleBreakpointsEnabled({ '$ lg': 'value1', '$ xs': 'value2' })).toBe(false);
      expect(multipleBreakpointsEnabled({ '$\tlg': 'value1', '$\txs': 'value2' })).toBe(false);
    });
  });

  describe('boundary cases', () => {
    test('should handle exactly two properties with one valid breakpoint', () => {
      expect(multipleBreakpointsEnabled({ $lg: 'breakpoint', width: 100 })).toBe(true);
      expect(multipleBreakpointsEnabled({ $xs: 'breakpoint', 'non-breakpoint': 'value' })).toBe(true);
    });

    test('should handle exactly two valid breakpoint properties', () => {
      expect(multipleBreakpointsEnabled({ $lg: 'large', $xs: 'small' })).toBe(true);
      expect(multipleBreakpointsEnabled({ $md: 'medium', $xlg: 'extra-large' })).toBe(true);
    });

    test('should correctly count keys regardless of value content', () => {
      expect(multipleBreakpointsEnabled({ $lg: '', $xs: null })).toBe(true);
      expect(multipleBreakpointsEnabled({ $md: 0, $sm: false })).toBe(true);
      expect(multipleBreakpointsEnabled({ $xlg: undefined, $xxs: NaN })).toBe(true);
    });
  });
});
