import { describe, expect, it } from 'bun:test';

/**
 * This test is designed to identify exactly where empty objects {} are being created
 * when processing form fields, particularly for backgroundImage fields with default: undefined
 */

describe('Empty Object Bug Detection', () => {
  it('should identify where empty objects come from in the field processing chain', () => {
    // Test scenarios where empty objects might be created:

    // 1. Test Puck AutoField behavior with object fields
    console.log('=== Testing potential sources of empty object creation ===');

    // 2. Test field value handling in CustomAutoField
    const mockFieldValue = undefined;
    const processedValue = typeof mockFieldValue === 'string' ? mockFieldValue : '';
    console.log('CustomAutoField imageUpload processing:', {
      original: mockFieldValue,
      processed: processedValue,
      isEmptyObject: typeof processedValue === 'object' && JSON.stringify(processedValue) === '{}',
    });

    // 3. Test object field default value creation
    const objectFieldDefault = {};
    console.log('Object field default creation:', {
      value: objectFieldDefault,
      isEmptyObject: typeof objectFieldDefault === 'object' && JSON.stringify(objectFieldDefault) === '{}',
    });

    // 4. Test breakpoint mode object creation
    const breakpointObject = {
      $xlg: {},
    };
    console.log('Breakpoint object creation:', {
      value: breakpointObject,
      xlgValue: breakpointObject.$xlg,
      isXlgEmptyObject: typeof breakpointObject.$xlg === 'object' && JSON.stringify(breakpointObject.$xlg) === '{}',
    });

    // This test is for investigation purposes
    expect(true).toBe(true);
  });

  it('should reproduce the exact scenario from the failing test', () => {
    // Reproduce the exact scenario that creates backgroundImage: {}
    const testData = {
      background: {
        useBackgroundImage: true,
        backgroundColor: '#4254c5',
        backgroundImage: {}, // This is the problematic empty object
      },
    };

    console.log('Reproduction test - background object:', testData.background);
    console.log('backgroundImage type:', typeof testData.background.backgroundImage);
    console.log('backgroundImage is empty object:', JSON.stringify(testData.background.backgroundImage) === '{}');

    // The question is: where does this {} come from?
    // Possible sources:
    // 1. Puck AutoField object initialization
    // 2. Form state management creating default values
    // 3. Breakpoint mode creating empty fallback objects
    // 4. React form library creating empty object defaults

    expect(typeof testData.background.backgroundImage).toBe('object');
    expect(JSON.stringify(testData.background.backgroundImage)).toBe('{}');
  });

  it('should test how Puck might initialize object field values', () => {
    // Simulate how Puck might handle field initialization
    // When Puck creates an object field, it might initialize all sub-fields
    // If backgroundImage has default: undefined, what value does it get?

    // Hypothesis: Puck's object field handling might be creating {} for undefined fields
    const mockPuckObjectInitialization = {}; // This could be where the problem starts

    console.log('Mock Puck object initialization:', mockPuckObjectInitialization);
    console.log('Is mock initialization empty object:', JSON.stringify(mockPuckObjectInitialization) === '{}');

    expect(true).toBe(true);
  });
});
