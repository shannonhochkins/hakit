import { describe, test, expect, beforeEach } from 'bun:test';
import { getDefaultPropsFromFields } from '../getDefaultPropsFromFields';
import { FieldConfiguration } from '@typings/fields';
import { DefaultPropsCallbackData } from '@typings/puck';

describe('getDefaultPropsFromFields', () => {
  let mockData: DefaultPropsCallbackData;

  beforeEach(() => {
    mockData = {
      // Mock the callback data structure used in the function
    } as DefaultPropsCallbackData;
  });

  describe('basic field types', () => {
    test('should handle simple text field with string default', async () => {
      const fields: FieldConfiguration = {
        title: {
          type: 'text',
          label: 'Title',
          default: 'Default Title',
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        title: 'Default Title',
      });
    });

    test('should handle number field with numeric default', async () => {
      const fields: FieldConfiguration = {
        count: {
          type: 'number',
          label: 'Count',
          default: 42,
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        count: 42,
      });
    });

    test('should handle field with undefined default', async () => {
      const fields: FieldConfiguration = {
        optional: {
          type: 'text',
          label: 'Optional',
          default: undefined,
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        optional: undefined,
      });
    });
  });

  describe('object fields', () => {
    test('should handle object field like defaultRoot background config', async () => {
      // This mimics the exact structure from defaultRoot.tsx
      const fields: FieldConfiguration = {
        background: {
          type: 'object',
          label: 'Background options',
          objectFields: {
            useBackgroundImage: {
              type: 'switch',
              label: 'Use Background Image',
              default: true,
            },
            backgroundImage: {
              type: 'imageUpload',
              label: 'Background Image',
              default: undefined, // THIS IS THE CRITICAL CASE!
            },
            backgroundColor: {
              type: 'color',
              label: 'Background Color',
              default: '#4254c5',
            },
            blur: {
              type: 'number',
              label: 'Blur',
              default: 25,
            },
          },
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      // Check the overall structure
      expect(result).toHaveProperty('background');
      expect(result.background).toHaveProperty('useBackgroundImage', true);
      expect(result.background).toHaveProperty('backgroundColor', '#4254c5');
      expect(result.background).toHaveProperty('blur', 25);

      // CRITICAL CHECK: What does backgroundImage become?
      expect(result.background).toHaveProperty('backgroundImage');

      // This is the key assertion - is it creating an empty object when it should be undefined?
      expect(result.background.backgroundImage).toBe(undefined);
      expect(result.background.backgroundImage).not.toEqual({});

      // If this fails, we found our bug!
    });

    test('should handle object field with mixed undefined and defined defaults', async () => {
      const fields: FieldConfiguration = {
        config: {
          type: 'object',
          label: 'Configuration',
          objectFields: {
            definedField: {
              type: 'text',
              label: 'Defined Field',
              default: 'has value',
            },
            undefinedField: {
              type: 'text',
              label: 'Undefined Field',
              default: undefined,
            },
            anotherUndefinedField: {
              type: 'imageUpload',
              label: 'Another Undefined Field',
              default: undefined,
            },
          },
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result.config.definedField).toBe('has value');
      expect(result.config.undefinedField).toBe(undefined);
      expect(result.config.anotherUndefinedField).toBe(undefined);

      // Make sure undefined fields don't become empty objects
      expect(result.config.undefinedField).not.toEqual({});
      expect(result.config.anotherUndefinedField).not.toEqual({});
    });

    test('should handle nested object fields', async () => {
      const fields: FieldConfiguration = {
        settings: {
          type: 'object',
          label: 'Settings',
          objectFields: {
            appearance: {
              type: 'object',
              label: 'Appearance',
              objectFields: {
                theme: {
                  type: 'text',
                  label: 'Theme',
                  default: 'dark',
                },
                fontSize: {
                  type: 'number',
                  label: 'Font Size',
                  default: 14,
                },
                undefinedSetting: {
                  type: 'text',
                  label: 'Undefined Setting',
                  default: undefined,
                },
              },
            },
          },
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        settings: {
          appearance: {
            theme: 'dark',
            fontSize: 14,
            undefinedSetting: undefined,
          },
        },
      });

      // Make sure nested undefined doesn't become empty object
      expect(result.settings.appearance.undefinedSetting).not.toEqual({});
    });

    test('should handle empty object fields', async () => {
      const fields: FieldConfiguration = {
        emptyObject: {
          type: 'object',
          label: 'Empty Object',
          objectFields: {},
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        emptyObject: {},
      });
    });
  });

  describe('special field types', () => {
    test('should skip hidden fields', async () => {
      const fields: FieldConfiguration = {
        visible: {
          type: 'text',
          label: 'Visible',
          default: 'visible value',
        },
        hidden: {
          type: 'hidden',
          default: 'hidden value',
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        visible: 'visible value',
      });
      expect(result).not.toHaveProperty('hidden');
    });

    test('should skip slot fields', async () => {
      const fields: FieldConfiguration = {
        content: {
          type: 'text',
          label: 'Content',
          default: 'content value',
        },
        slot: {
          type: 'slot',
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        content: 'content value',
      });
      expect(result).not.toHaveProperty('slot');
    });

    test('should skip nested slot fields in objects', async () => {
      const fields: FieldConfiguration = {
        container: {
          type: 'object',
          label: 'Container',
          objectFields: {
            title: {
              type: 'text',
              label: 'Title',
              default: 'title value',
            },
            content: {
              type: 'slot',
            },
          },
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        container: {
          title: 'title value',
        },
      });
      expect(result.container).not.toHaveProperty('content');
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle empty fields configuration', async () => {
      const fields: FieldConfiguration = {};

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({});
    });

    test('should handle null and undefined values gracefully', async () => {
      const fields: FieldConfiguration = {
        nullField: {
          type: 'text',
          label: 'Null Field',
          default: null,
        },
        undefinedField: {
          type: 'text',
          label: 'Undefined Field',
          default: undefined,
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        nullField: null,
        undefinedField: undefined,
      });
    });

    test('should handle complex nested structure with mixed types', async () => {
      const fields: FieldConfiguration<{
        complexConfig: {
          simpleField: string;
          nestedObject: {
            deepField: number;
            undefinedDeepField?: undefined; // This should not become an empty object
          };
        };
      }> = {
        complexConfig: {
          type: 'object',
          label: 'Complex Config',
          objectFields: {
            simpleField: {
              type: 'text',
              label: 'Simple',
              default: 'simple value',
            },
            nestedObject: {
              type: 'object',
              label: 'Nested Object',
              objectFields: {
                deepField: {
                  type: 'number',
                  label: 'Deep Field',
                  default: 100,
                },
                undefinedDeepField: {
                  type: 'imageUpload',
                  label: 'Undefined Deep Field',
                  default: undefined,
                },
              },
            },
          },
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      expect(result).toEqual({
        complexConfig: {
          simpleField: 'simple value',
          nestedObject: {
            deepField: 100,
            undefinedDeepField: undefined,
          },
        },
      });

      // Critical checks for undefined values not becoming empty objects
      expect(result.complexConfig.nestedObject.undefinedDeepField).not.toEqual({});
    });
  });

  describe('defaultRoot.tsx background config reproduction', () => {
    test('should set background image to undefined when useBackgroundImage is false', async () => {
      // This is the mock configuration of defaultRoot.tsx
      const fields: FieldConfiguration = {
        background: {
          type: 'object',
          label: 'Background options',
          description: 'General options for the main background',
          objectFields: {
            useBackgroundImage: {
              type: 'switch',
              label: 'Use Background Image',
              description: 'Whether to use a background image or not',
              default: true,
            },
            backgroundImage: {
              type: 'imageUpload',
              label: 'Background Image',
              description: 'The entity to display in the button card',
              default: undefined, // THIS IS THE SUSPECT!
            },
            backgroundColor: {
              type: 'color',
              label: 'Background Color',
              description: 'The background color of the button card',
              default: '#4254c5',
            },
            blendMode: {
              type: 'select',
              label: 'Blend Mode',
              description: 'The blend mode to apply to the background overlay color',
              default: 'multiply',
              options: [
                { label: 'Color', value: 'color' },
                { label: 'Multiply', value: 'multiply' },
                { label: 'Normal', value: 'normal' },
              ],
            },
            blur: {
              type: 'number',
              label: 'Blur',
              min: 0,
              description: 'The blur amount to apply to the background image of the dashboard',
              default: 25,
            },
            opacity: {
              type: 'number',
              label: 'Opacity',
              description: 'The opacity of the background overlay color',
              default: 0.9,
              min: 0,
              max: 1,
              step: 0.1,
            },
          },
        },
      };

      const result = await getDefaultPropsFromFields(fields, mockData);

      // Verify the structure matches expectations
      expect(result.background.useBackgroundImage).toBe(true);
      expect(result.background.backgroundColor).toBe('#4254c5');
      expect(result.background.blendMode).toBe('multiply');
      expect(result.background.blur).toBe(25);
      expect(result.background.opacity).toBe(0.9);

      // THE CRITICAL ASSERTION: Is backgroundImage becoming an empty object?
      expect(result.background.backgroundImage).toBe(undefined);

      expect(result.background.backgroundImage).not.toEqual({});
    });
  });
});
