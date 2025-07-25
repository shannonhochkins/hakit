import { expect, test, describe } from 'bun:test';
import { getResolvedBreakpointValue } from './getResolvedBreakpointValue';
import type { BreakPoint } from '@hakit/components';

describe('getResolvedBreakpointValue', () => {
  describe('non-breakpoint object values', () => {
    test('should return primitive values as-is', () => {
      expect(getResolvedBreakpointValue('string', 'lg')).toBe('string');
      expect(getResolvedBreakpointValue(42, 'lg')).toBe(42);
      expect(getResolvedBreakpointValue(true, 'lg')).toBe(true);
      expect(getResolvedBreakpointValue(false, 'lg')).toBe(false);
      expect(getResolvedBreakpointValue(null, 'lg')).toBe(null);
      expect(getResolvedBreakpointValue(undefined, 'lg')).toBe(undefined);
    });

    test('should return arrays and objects without breakpoint keys as-is', () => {
      const array = [1, 2, 3];
      const obj = { width: 100, height: 200 };

      expect(getResolvedBreakpointValue(array, 'lg')).toBe(array);
      expect(getResolvedBreakpointValue(obj, 'lg')).toBe(obj);
    });

    test('should return objects with unprefixed breakpoint keys as-is', () => {
      const obj = { lg: 'large', sm: 'small' };
      expect(getResolvedBreakpointValue(obj, 'lg')).toBe(obj);
    });
  });

  describe('breakpoint object resolution', () => {
    test('should return exact match for active breakpoint', () => {
      const breakpointObj = {
        $xxs: 'extra-small',
        $xs: 'small',
        $sm: 'small-medium',
        $md: 'medium',
        $lg: 'large',
        $xlg: 'extra-large',
      };

      expect(getResolvedBreakpointValue(breakpointObj, 'xxs')).toBe('extra-small');
      expect(getResolvedBreakpointValue(breakpointObj, 'xs')).toBe('small');
      expect(getResolvedBreakpointValue(breakpointObj, 'sm')).toBe('small-medium');
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe('medium');
      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toBe('large');
      expect(getResolvedBreakpointValue(breakpointObj, 'xlg')).toBe('extra-large');
    });

    test('should cascade to larger breakpoints when active breakpoint is not available', () => {
      const breakpointObj = {
        $sm: 'small',
        $lg: 'large',
        $xlg: 'extra-large',
      };

      // xs should cascade to sm
      expect(getResolvedBreakpointValue(breakpointObj, 'xs')).toBe('small');

      // md should cascade to lg
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe('large');

      // xxs should cascade to sm (first available)
      expect(getResolvedBreakpointValue(breakpointObj, 'xxs')).toBe('small');
    });

    test('should fall back to xlg as ultimate fallback', () => {
      const breakpointObj = {
        $xlg: 'fallback-value',
      };

      expect(getResolvedBreakpointValue(breakpointObj, 'xxs')).toBe('fallback-value');
      expect(getResolvedBreakpointValue(breakpointObj, 'xs')).toBe('fallback-value');
      expect(getResolvedBreakpointValue(breakpointObj, 'sm')).toBe('fallback-value');
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe('fallback-value');
      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toBe('fallback-value');
    });

    test('should handle null and undefined values in breakpoint objects', () => {
      const breakpointObj = {
        $sm: null,
        $md: undefined,
        $lg: 'large',
        $xlg: 'extra-large',
      };

      // null is a valid value and should be returned
      expect(getResolvedBreakpointValue(breakpointObj, 'sm')).toBe(null);

      // undefined should cascade to next available (lg)
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe('large');

      // xs should cascade to sm (null)
      expect(getResolvedBreakpointValue(breakpointObj, 'xs')).toBe(null);
    });

    test('should handle zero and false values correctly', () => {
      const breakpointObj = {
        $sm: 0,
        $md: false,
        $lg: '',
        $xlg: 'fallback',
      };

      expect(getResolvedBreakpointValue(breakpointObj, 'sm')).toBe(0);
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe(false);
      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toBe('');

      // xs should cascade to sm (0)
      expect(getResolvedBreakpointValue(breakpointObj, 'xs')).toBe(0);
    });
  });

  describe('complex value types', () => {
    test('should handle object values in breakpoint objects', () => {
      const nestedObj = { width: 100, height: 200 };
      const breakpointObj = {
        $sm: { width: 50, height: 100 },
        $lg: nestedObj,
        $xlg: { width: 200, height: 400 },
      };

      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toBe(nestedObj);
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe(nestedObj);
    });

    test('should handle array values in breakpoint objects', () => {
      const array = [1, 2, 3];
      const breakpointObj = {
        $sm: ['a', 'b'],
        $lg: array,
        $xlg: ['x', 'y', 'z'],
      };

      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toBe(array);
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe(array);
    });

    test('should handle function values in breakpoint objects', () => {
      const fn = () => 'test';
      const breakpointObj = {
        $lg: fn,
        $xlg: () => 'fallback',
      };

      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toBe(fn);
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe(fn);
    });
  });

  describe('edge cases', () => {
    test('should handle breakpoint objects with mixed valid and invalid keys', () => {
      const breakpointObj = {
        $lg: 'valid',
        lg: 'invalid-unprefixed',
        '$lg-special': 'invalid-special',
        $xlg: 'fallback',
      };

      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toBe('valid');
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe('valid');
    });

    test('should handle empty breakpoint objects', () => {
      const breakpointObj = {};

      // Empty objects are not breakpoint objects, so should return as-is
      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toEqual({});
    });

    test('should handle breakpoint objects with only invalid keys', () => {
      const breakpointObj = {
        lg: 'unprefixed',
        '#lg': 'wrong-prefix',
        $$lg: 'double-prefix',
      };

      // This should be treated as non-breakpoint object and returned as-is
      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toBe(breakpointObj);
    });

    test('should handle breakpoint cascade when only xlg is missing', () => {
      const breakpointObj = {
        $xxs: 'xxs-value',
        $xs: 'xs-value',
        $sm: 'sm-value',
        $md: 'md-value',
        $lg: 'lg-value',
        // No $xlg
      };

      // Should cascade to lg when xlg is requested but not available
      expect(getResolvedBreakpointValue(breakpointObj, 'xlg')).toBe(undefined);
    });

    test('should handle very large breakpoint objects', () => {
      const largeObj: Record<string, string> = {};

      // Add many non-breakpoint keys
      for (let i = 0; i < 1000; i++) {
        largeObj[`prop${i}`] = `value${i}`;
      }

      // Add some breakpoint keys
      largeObj['$sm'] = 'small';
      largeObj['$lg'] = 'large';
      largeObj['$xlg'] = 'extra-large';

      expect(getResolvedBreakpointValue(largeObj, 'lg')).toBe('large');
      expect(getResolvedBreakpointValue(largeObj, 'md')).toBe('large');
    });
  });

  describe('type safety', () => {
    test('should handle union types correctly', () => {
      const mixedBreakpoints = {
        $sm: 'string',
        $lg: 42,
        $xlg: true,
      };

      expect(getResolvedBreakpointValue(mixedBreakpoints, 'sm')).toBe('string');
      expect(getResolvedBreakpointValue(mixedBreakpoints, 'lg')).toBe(42);
      expect(getResolvedBreakpointValue(mixedBreakpoints, 'xlg')).toBe(true);
    });
  });

  describe('all breakpoint combinations', () => {
    const allBreakpoints: BreakPoint[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xlg'];

    test('should handle every possible breakpoint as active', () => {
      const breakpointObj = {
        $xxs: 'xxs-value',
        $xs: 'xs-value',
        $sm: 'sm-value',
        $md: 'md-value',
        $lg: 'lg-value',
        $xlg: 'xlg-value',
      };

      allBreakpoints.forEach(bp => {
        const result = getResolvedBreakpointValue(breakpointObj, bp);
        expect(result).toBe(`${bp}-value`);
      });
    });

    test('should cascade correctly from any breakpoint to any larger breakpoint', () => {
      const breakpointObj = {
        $sm: 'small',
        $xlg: 'extra-large',
      };

      // xxs and xs should cascade to sm
      expect(getResolvedBreakpointValue(breakpointObj, 'xxs')).toBe('small');
      expect(getResolvedBreakpointValue(breakpointObj, 'xs')).toBe('small');

      // md and lg should cascade to xlg
      expect(getResolvedBreakpointValue(breakpointObj, 'md')).toBe('extra-large');
      expect(getResolvedBreakpointValue(breakpointObj, 'lg')).toBe('extra-large');
    });
  });
});
