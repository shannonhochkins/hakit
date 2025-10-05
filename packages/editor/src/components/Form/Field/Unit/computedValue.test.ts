import { expect, test, describe } from 'bun:test';
import { getComputedValue, createSingleValue, createAllCornersValue, updateCornerValue } from './computedValue';
import type { UnitFieldValue, Unit } from './index';

describe('getComputedValue', () => {
  describe('single values', () => {
    test('should parse simple integer values with px unit', () => {
      const result = getComputedValue('10px');
      expect(result).toEqual({ value: 10, unit: 'px' });
    });

    test('should parse decimal values with px unit', () => {
      const result = getComputedValue('10.5px');
      expect(result).toEqual({ value: 10.5, unit: 'px' });
    });

    test('should parse negative values', () => {
      const result = getComputedValue('-5px');
      expect(result).toEqual({ value: -5, unit: 'px' });
    });

    test('should parse zero values', () => {
      const result = getComputedValue('0px');
      expect(result).toEqual({ value: 0, unit: 'px' });
    });

    test('should parse all unit types', () => {
      const units: Array<{ unit: Unit; value: UnitFieldValue }> = [
        { unit: 'auto', value: 'auto' },
        { unit: 'px', value: '10px' },
        { unit: 'em', value: '1.5em' },
        { unit: 'rem', value: '2rem' },
        { unit: 'vh', value: '50vh' },
        { unit: 'vw', value: '25vw' },
        { unit: '%', value: '100%' },
      ];

      units.forEach(({ unit, value }) => {
        const result = getComputedValue(value);
        if (unit === 'auto') {
          expect(result).toEqual({ value: 0, unit: 'auto' });
        } else {
          const expectedValue = parseFloat(value.replace(unit, ''));
          expect(result).toEqual({ value: expectedValue, unit });
        }
      });
    });

    test('should handle auto unit and value', () => {
      const result = getComputedValue('auto');
      expect(result).toEqual({ value: 0, unit: 'auto' });
    });

    test('should handle decimal places correctly', () => {
      const testCases: Array<{ input: UnitFieldValue; expected: { value: number; unit: Unit } }> = [
        { input: '1.00px', expected: { value: 1, unit: 'px' } },
        { input: '1.50px', expected: { value: 1.5, unit: 'px' } },
        { input: '0.25em', expected: { value: 0.25, unit: 'em' } },
        { input: '33.33%', expected: { value: 33.33, unit: '%' } },
        { input: '99.99vh', expected: { value: 99.99, unit: 'vh' } },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = getComputedValue(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('all corners values', () => {
    test('should parse all corners with same unit', () => {
      const result = getComputedValue('10px 20px 30px 40px');
      expect(result).toEqual({
        top: { value: 10, unit: 'px' },
        left: { value: 20, unit: 'px' },
        right: { value: 30, unit: 'px' },
        bottom: { value: 40, unit: 'px' },
      });
    });

    test('should parse all corners with different units', () => {
      const result = getComputedValue('1.00px 10px 33.33% 10px');
      expect(result).toEqual({
        top: { value: 1, unit: 'px' },
        left: { value: 10, unit: 'px' },
        right: { value: 33.33, unit: '%' },
        bottom: { value: 10, unit: 'px' },
      });
    });

    test('should parse all corners with decimal values', () => {
      const result = getComputedValue('1.5em 2.25rem 3.75vh 4.125vw');
      expect(result).toEqual({
        top: { value: 1.5, unit: 'em' },
        left: { value: 2.25, unit: 'rem' },
        right: { value: 3.75, unit: 'vh' },
        bottom: { value: 4.125, unit: 'vw' },
      });
    });

    test('should parse all corners with negative values', () => {
      const result = getComputedValue('-5px -10px -15px -20px');
      expect(result).toEqual({
        top: { value: -5, unit: 'px' },
        left: { value: -10, unit: 'px' },
        right: { value: -15, unit: 'px' },
        bottom: { value: -20, unit: 'px' },
      });
    });

    test('should parse all corners with zero values', () => {
      const result = getComputedValue('0px 0em 0% 0vh');
      expect(result).toEqual({
        top: { value: 0, unit: 'px' },
        left: { value: 0, unit: 'em' },
        right: { value: 0, unit: '%' },
        bottom: { value: 0, unit: 'vh' },
      });
    });

    test('should handle mixed positive and negative values', () => {
      const result = getComputedValue('10px -5em 0% 15.5vh');
      expect(result).toEqual({
        top: { value: 10, unit: 'px' },
        left: { value: -5, unit: 'em' },
        right: { value: 0, unit: '%' },
        bottom: { value: 15.5, unit: 'vh' },
      });
    });

    test('should handle complex decimal values', () => {
      const result = getComputedValue('1.234px 56.789em 90.123% 45.678vh');
      expect(result).toEqual({
        top: { value: 1.234, unit: 'px' },
        left: { value: 56.789, unit: 'em' },
        right: { value: 90.123, unit: '%' },
        bottom: { value: 45.678, unit: 'vh' },
      });
    });
  });

  describe('edge cases and invalid inputs', () => {
    test('should return null for empty string', () => {
      // @ts-expect-error: Testing empty string input
      const result = getComputedValue('');
      expect(result).toBeNull();
    });

    test('should return null for null input', () => {
      // @ts-expect-error: Testing null input
      const result = getComputedValue(null);
      expect(result).toBeNull();
    });

    test('should return null for undefined input', () => {
      const result = getComputedValue(undefined);
      expect(result).toBeNull();
    });

    test('should return null for non-string input', () => {
      // @ts-expect-error: Testing non-string input
      const result = getComputedValue(123);
      expect(result).toBeNull();
    });

    test('should return null for invalid single value format', () => {
      const invalidInputs = [
        '10', // missing unit
        'px', // missing value
        '10xyz', // invalid unit
        'abcpx', // invalid value
        '10 px', // space between value and unit
        '10.5.5px', // multiple decimal points
        '', // empty
        ' ', // whitespace only
      ];

      invalidInputs.forEach(input => {
        // @ts-expect-error: Testing invalid input
        const result = getComputedValue(input);
        expect(result).toBeNull();
      });
    });

    test('should return null for invalid all corners format', () => {
      const invalidInputs = [
        '10px 20px', // only 2 values
        '10px 20px 30px', // only 3 values
        '10px 20px 30px 40px 50px', // 5 values
        '10px 20px 30px invalid', // one invalid value
        '10px 20px 30px', // missing one value
        '10px 20px 30px 40px 50px 60px', // too many values
        '10px 20px 30px 40', // last value missing unit
        '10 20 30 40', // all values missing units
      ];

      invalidInputs.forEach(input => {
        // @ts-expect-error: Testing invalid input
        const result = getComputedValue(input);
        expect(result).toBeNull();
      });
    });

    test('should return null for whitespace-only input', () => {
      // @ts-expect-error: Testing whitespace-only input
      const result = getComputedValue('   ');
      expect(result).toBeNull();
    });

    test('should handle multiple spaces between values', () => {
      const result = getComputedValue('10px   20px   30px   40px');
      expect(result).toEqual({
        top: { value: 10, unit: 'px' },
        left: { value: 20, unit: 'px' },
        right: { value: 30, unit: 'px' },
        bottom: { value: 40, unit: 'px' },
      });
    });
  });

  describe('whitespace handling', () => {
    test('should handle leading and trailing whitespace in single values', () => {
      // @ts-expect-error: Testing whitespace-only input
      const result = getComputedValue('  10px  ');
      expect(result).toEqual({ value: 10, unit: 'px' });
    });

    test('should handle leading and trailing whitespace in all corners', () => {
      // @ts-expect-error: Testing whitespace-only input
      const result = getComputedValue('  10px 20px 30px 40px  ');
      expect(result).toEqual({
        top: { value: 10, unit: 'px' },
        left: { value: 20, unit: 'px' },
        right: { value: 30, unit: 'px' },
        bottom: { value: 40, unit: 'px' },
      });
    });

    test('should handle multiple spaces between values', () => {
      const result = getComputedValue('10px  20px  30px  40px');
      expect(result).toEqual({
        top: { value: 10, unit: 'px' },
        left: { value: 20, unit: 'px' },
        right: { value: 30, unit: 'px' },
        bottom: { value: 40, unit: 'px' },
      });
    });
  });
});

describe('createSingleValue', () => {
  test('should create single value with default unit', () => {
    const result = createSingleValue(10);
    expect(result).toBe('10px');
  });

  test('should create single value with specified unit', () => {
    const result = createSingleValue(10, 'em');
    expect(result).toBe('10em');
  });

  test('should handle decimal values', () => {
    const result = createSingleValue(10.5, 'rem');
    expect(result).toBe('10.5rem');
  });

  test('should handle negative values', () => {
    const result = createSingleValue(-5, 'vh');
    expect(result).toBe('-5vh');
  });

  test('should handle zero values', () => {
    const result = createSingleValue(0, '%');
    expect(result).toBe('0%');
  });
});

describe('createAllCornersValue', () => {
  test('should create all corners value with same unit', () => {
    const result = createAllCornersValue(
      { value: 10, unit: 'px' },
      { value: 20, unit: 'px' },
      { value: 30, unit: 'px' },
      { value: 40, unit: 'px' }
    );
    expect(result).toBe('10px 20px 30px 40px');
  });

  test('should create all corners value with different units', () => {
    const result = createAllCornersValue(
      { value: 1, unit: 'px' },
      { value: 10, unit: 'em' },
      { value: 33.33, unit: '%' },
      { value: 10, unit: 'vh' }
    );
    expect(result).toBe('1px 10em 33.33% 10vh');
  });

  test('should handle decimal values', () => {
    const result = createAllCornersValue(
      { value: 1.5, unit: 'px' },
      { value: 2.25, unit: 'em' },
      { value: 3.75, unit: 'rem' },
      { value: 4.125, unit: 'vh' }
    );
    expect(result).toBe('1.5px 2.25em 3.75rem 4.125vh');
  });

  test('should handle negative values', () => {
    const result = createAllCornersValue(
      { value: -5, unit: 'px' },
      { value: -10, unit: 'em' },
      { value: -15, unit: 'rem' },
      { value: -20, unit: 'vh' }
    );
    expect(result).toBe('-5px -10em -15rem -20vh');
  });
});

describe('updateCornerValue', () => {
  test('should update top corner value', () => {
    const currentValue = {
      top: { value: 10, unit: 'px' },
      left: { value: 20, unit: 'px' },
      right: { value: 30, unit: 'px' },
      bottom: { value: 40, unit: 'px' },
    } as const;
    const result = updateCornerValue(currentValue, { top: { value: 15, unit: 'em' } });
    expect(result).toBe('15em 20px 30px 40px');
  });

  test('should update left corner value', () => {
    const currentValue = {
      top: { value: 10, unit: 'px' },
      left: { value: 20, unit: 'px' },
      right: { value: 30, unit: 'px' },
      bottom: { value: 40, unit: 'px' },
    } as const;
    const result = updateCornerValue(currentValue, { left: { value: 25, unit: 'rem' } });
    expect(result).toBe('10px 25rem 30px 40px');
  });

  test('should update right corner value', () => {
    const currentValue = {
      top: { value: 10, unit: 'px' },
      left: { value: 20, unit: 'px' },
      right: { value: 30, unit: 'px' },
      bottom: { value: 40, unit: 'px' },
    } as const;
    const result = updateCornerValue(currentValue, { right: { value: 35, unit: 'vh' } });
    expect(result).toBe('10px 20px 35vh 40px');
  });

  test('should update bottom corner value', () => {
    const currentValue = {
      top: { value: 10, unit: 'px' },
      left: { value: 20, unit: 'px' },
      right: { value: 30, unit: 'px' },
      bottom: { value: 40, unit: 'px' },
    } as const;
    const result = updateCornerValue(currentValue, { bottom: { value: 45, unit: 'vw' } });
    expect(result).toBe('10px 20px 30px 45vw');
  });

  test('should handle decimal values', () => {
    const currentValue = {
      top: { value: 10.5, unit: 'px' },
      left: { value: 20.25, unit: 'em' },
      right: { value: 30.75, unit: 'rem' },
      bottom: { value: 40.125, unit: 'vh' },
    } as const;
    const result = updateCornerValue(currentValue, { top: { value: 15.5, unit: 'px' } });
    expect(result).toBe('15.5px 20.25em 30.75rem 40.125vh');
  });

  test('should handle negative values', () => {
    const currentValue = {
      top: { value: 10, unit: 'px' },
      left: { value: 20, unit: 'px' },
      right: { value: 30, unit: 'px' },
      bottom: { value: 40, unit: 'px' },
    } as const;
    const result = updateCornerValue(currentValue, { left: { value: -25, unit: 'px' } });
    expect(result).toBe('10px -25px 30px 40px');
  });

  test('should update multiple corners at once', () => {
    const currentValue = {
      top: { value: 10, unit: 'px' },
      left: { value: 20, unit: 'px' },
      right: { value: 30, unit: 'px' },
      bottom: { value: 40, unit: 'px' },
    } as const;
    const result = updateCornerValue(currentValue, {
      top: { value: 15, unit: 'em' },
      bottom: { value: 45, unit: 'vh' },
    });
    expect(result).toBe('15em 20px 30px 45vh');
  });
});

describe('round-trip tests', () => {
  test('should maintain consistency for single values', () => {
    const original = '10.5px';
    const computed = getComputedValue(original);
    expect(computed).toEqual({ value: 10.5, unit: 'px' });
    // @ts-expect-error: Testing computed value, value could be auto
    const recreated = createSingleValue(computed!.value, computed!.unit);
    expect(recreated).toBe(original);
  });

  test('should maintain consistency for all corners values', () => {
    const original = '1.00px 10px 33.33% 10px';
    const computed = getComputedValue(original);
    expect(computed).toEqual({
      top: { value: 1, unit: 'px' },
      left: { value: 10, unit: 'px' },
      right: { value: 33.33, unit: '%' },
      bottom: { value: 10, unit: 'px' },
    });
    // @ts-expect-error: Testing computed value, value could be auto
    const recreated = createAllCornersValue(computed!.top, computed!.left, computed!.right, computed!.bottom);
    // Note: 1.00 becomes 1 when parsed, which is correct behavior
    expect(recreated).toBe('1px 10px 33.33% 10px');
  });

  test('should handle complex decimal round-trip', () => {
    const original = '1.234px 56.789em 90.123% 45.678vh';
    const computed = getComputedValue(original);
    expect(computed).toEqual({
      top: { value: 1.234, unit: 'px' },
      left: { value: 56.789, unit: 'em' },
      right: { value: 90.123, unit: '%' },
      bottom: { value: 45.678, unit: 'vh' },
    });

    // @ts-expect-error: Testing computed value, value could be auto
    const recreated = createAllCornersValue(computed!.top, computed!.left, computed!.right, computed!.bottom);
    expect(recreated).toBe(original);
  });
});
