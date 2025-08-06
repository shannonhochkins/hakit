import { describe, expect, test } from 'bun:test';
import { serializeWithUndefined, parseWithUndefined, deserializePageData, UNDEFINED_MARKER } from './index';

describe('JSON serialization with undefined preservation', () => {
  test('should preserve undefined values in breakpoint objects', () => {
    // Your exact problematic data structure
    const testData = {
      backgroundImage: { $xlg: undefined },
      backgroundColor: { $xlg: '#4254c5' },
      blur: { $xlg: 25 },
      useBackgroundImage: { $xlg: true },
    };

    // Test standard JSON.stringify (this is what fails)
    const standardJson = JSON.stringify(testData);
    const standardParsed = JSON.parse(standardJson);

    // Test our custom serialization
    const customJson = serializeWithUndefined(testData);
    const customParsed = parseWithUndefined<typeof testData>(customJson);

    // Check that the marker is in the serialized string
    expect(customJson).toContain('__HAKIT_UNDEFINED__');

    // Assertions
    expect(testData.backgroundImage.$xlg).toBe(undefined);
    expect(standardParsed.backgroundImage).toEqual({}); // Standard JSON loses undefined
    expect(customParsed.backgroundImage.$xlg).toBe(undefined); // Our method preserves undefined
    expect(customParsed.backgroundColor.$xlg).toBe('#4254c5');
    expect(customParsed.blur.$xlg).toBe(25);
    expect(customParsed.useBackgroundImage.$xlg).toBe(true);
  });

  test('should handle nested undefined values', () => {
    const complexData = {
      root: {
        props: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: { $xlg: true },
              backgroundImage: { $xlg: undefined }, // This gets lost in standard JSON
              backgroundColor: { $xlg: '#4254c5' },
              blendMode: { $xlg: 'multiply' },
              blur: { $xlg: 25 },
              opacity: { $xlg: 0.9 },
            },
          },
        },
      },
      content: [],
      zones: {},
    };

    const serialized = serializeWithUndefined(complexData);
    const deserialized = parseWithUndefined<typeof complexData>(serialized);

    // Check that the marker is in the serialized string
    expect(serialized).toContain(UNDEFINED_MARKER);

    expect(deserialized.root.props['@hakit/default-root'].background.backgroundImage.$xlg).toBe(undefined);
    expect(deserialized.root.props['@hakit/default-root'].background.backgroundColor.$xlg).toBe('#4254c5');
  });

  test('should preserve null values separately from undefined', () => {
    const testData = {
      undefinedValue: undefined,
      nullValue: null,
      stringValue: 'test',
      numberValue: 42,
    };

    const serialized = serializeWithUndefined(testData);
    const deserialized = parseWithUndefined<typeof testData>(serialized);

    // Check that the marker is in the serialized string for undefined but not null
    expect(serialized).toContain('__HAKIT_UNDEFINED__');
    expect(serialized).toContain('null'); // null should remain as null

    expect(deserialized.undefinedValue).toBe(undefined);
    expect(deserialized.nullValue).toBe(null);
    expect(deserialized.stringValue).toBe('test');
    expect(deserialized.numberValue).toBe(42);
  });

  test('should deserialize and revive', () => {
    const data = {
      zones: {},
      content: [],
      root: {
        props: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: {
                $xlg: true,
              },
              backgroundImage: {
                $xlg: UNDEFINED_MARKER,
              },
              backgroundColor: {
                $xlg: '#4254c5',
              },
              blendMode: {
                $xlg: 'multiply',
              },
              blur: {
                $xlg: 25,
              },
              opacity: {
                $xlg: 0.9,
              },
            },
          },
          content: [],
        },
      },
    };
    const serialized = deserializePageData(JSON.stringify(data), true);
    expect(serialized).toEqual({
      zones: {},
      content: [],
      root: {
        props: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: {
                $xlg: true,
              },
              backgroundImage: {
                $xlg: undefined, // This should be restored to undefined
              },
              backgroundColor: {
                $xlg: '#4254c5',
              },
              blendMode: {
                $xlg: 'multiply',
              },
              blur: {
                $xlg: 25,
              },
              opacity: {
                $xlg: 0.9,
              },
            },
          },
          content: [],
        },
      },
    });
  });

  test('should deserialize page data with Zod validation and undefined preservation', () => {
    // Valid PuckPageData structure with undefined values
    const validPageData = {
      root: {
        props: {
          '@hakit/default-root': {
            background: {
              useBackgroundImage: { $xlg: true },
              backgroundImage: { $xlg: undefined }, // This should be preserved
              backgroundColor: { $xlg: '#4254c5' },
              blendMode: { $xlg: 'multiply' },
              blur: { $xlg: 25 },
              opacity: { $xlg: 0.9 },
            },
          },
        },
      },
      content: [],
      zones: {},
    };

    // Serialize the data first
    const serialized = serializeWithUndefined(validPageData);

    // Use deserializePageData which should validate with Zod and preserve undefined
    const deserialized = deserializePageData(serialized, true);

    expect(deserialized.root?.props?.['@hakit/default-root']?.background?.backgroundImage?.$xlg).toBe(undefined);
    expect(deserialized.root?.props?.['@hakit/default-root']?.background?.backgroundColor?.$xlg).toBe('#4254c5');
    expect(deserialized.content).toEqual([]);
    expect(deserialized.zones).toEqual({});
  });

  test('should throw error when deserializing invalid page data with Zod validation', () => {
    // Invalid data structure
    const invalidData = {
      invalid: 'structure',
      missing: 'required fields',
    };

    const serialized = serializeWithUndefined(invalidData);

    // This should throw a Zod validation error
    expect(() => deserializePageData(serialized, true)).toThrow();
  });

  test('should handle edge cases for serialization methods', () => {
    // Test empty object
    const emptyObj = {};
    expect(parseWithUndefined<typeof emptyObj>(serializeWithUndefined(emptyObj))).toEqual({});

    // Test arrays with undefined values
    const arrayWithUndefined = [1, undefined, 'test', null] as const;
    const serializedArray = serializeWithUndefined(arrayWithUndefined);
    const deserializedArray = parseWithUndefined<typeof arrayWithUndefined>(serializedArray);

    expect(serializedArray).toContain(UNDEFINED_MARKER);
    expect(deserializedArray[0]).toBe(1);
    expect(deserializedArray[1]).toBe(undefined);
    expect(deserializedArray[2]).toBe('test');
    expect(deserializedArray[3]).toBe(null);

    // Test deeply nested structures
    const deepNested = {
      level1: {
        level2: {
          level3: {
            value: undefined,
            other: 'preserved',
          },
        },
      },
    };

    const serializedDeep = serializeWithUndefined(deepNested);
    const deserializedDeep = parseWithUndefined<typeof deepNested>(serializedDeep);

    expect(deserializedDeep.level1.level2.level3.value).toBe(undefined);
    expect(deserializedDeep.level1.level2.level3.other).toBe('preserved');
  });
});
