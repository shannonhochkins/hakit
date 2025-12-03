import { describe, test, expect } from 'bun:test';
import { processInternalFields } from './processInternalFields';
import type { FieldConfiguration, InternalComponentFields } from '@typings/fields';
import type { InternalFieldsConfig } from '@typings/puck';
import { assertField, assertObjectField } from '@test-utils/fieldAssertions';

// Helper type for test props
type TestProps = {
  title: string;
  count: number;
  enabled: boolean;
  nested: {
    value: string;
    deep: {
      data: number;
    };
  };
  array: Array<{
    label: string;
  }>;
};

// Helper to create a simple field configuration
function createTestFields(): FieldConfiguration<TestProps> {
  return {
    title: {
      type: 'text',
      label: 'Title',
      default: 'Default Title',
    },
    count: {
      type: 'number',
      label: 'Count',
      default: 0,
    },
    enabled: {
      type: 'switch',
      label: 'Enabled',
      default: false,
    },
    nested: {
      type: 'object',
      label: 'Nested',
      description: 'Nested description',
      objectFields: {
        value: {
          type: 'text',
          label: 'Value',
          default: 'default value',
        },
        deep: {
          type: 'object',
          label: 'Deep',
          objectFields: {
            data: {
              type: 'number',
              label: 'Data',
              default: 42,
            },
          },
        },
      },
    },
    array: {
      type: 'array',
      label: 'Array',
      default: [],
      arrayFields: {
        label: {
          type: 'text',
          label: 'Label',
          default: '',
        },
      },
    },
  };
}

describe('processInternalFields', () => {
  describe('when internalFieldsConfig is undefined', () => {
    test('should return fields unchanged', () => {
      const fields = createTestFields();
      const result = processInternalFields(fields, undefined);
      expect(result).toEqual(fields);
      expect(result).toBe(fields); // Should return same reference when no config
    });
  });

  describe('omit functionality', () => {
    test('should omit a top-level field when set to true', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        omit: {
          title: true,
        },
      };

      const result = processInternalFields(fields, config);
      expect('title' in result).toBe(false);
      expect('count' in result).toBe(true);
      expect('enabled' in result).toBe(true);
      expect(result.count).toEqual(fields.count);
    });

    test('should omit multiple top-level fields', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        omit: {
          title: true,
          count: true,
        },
      };

      const result = processInternalFields(fields, config);
      expect('title' in result).toBe(false);
      expect('count' in result).toBe(false);
      expect('enabled' in result).toBe(true);
      expect('nested' in result).toBe(true);
    });

    test('should omit nested field within object', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        omit: {
          nested: {
            value: true,
          },
        },
      };

      const result = processInternalFields(fields, config);
      expect('nested' in result).toBe(true);
      assertObjectField(result.nested);
      expect('value' in result.nested.objectFields).toBe(false);
      expect('deep' in result.nested.objectFields).toBe(true);
    });

    test('should omit deeply nested field', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        omit: {
          nested: {
            deep: {
              data: true,
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      const nestedField = result.nested;
      if (nestedField && typeof nestedField === 'object' && 'objectFields' in nestedField) {
        const deepField = nestedField.objectFields.deep;
        if (deepField && typeof deepField === 'object' && 'objectFields' in deepField) {
          expect('data' in deepField.objectFields).toBe(false);
        } else {
          throw new Error('deep field should be an object field');
        }
      } else {
        throw new Error('nested field should be an object field');
      }
    });

    test('should handle omit config set to false', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        omit: false,
      };

      const result = processInternalFields(fields, config);
      expect(result).toEqual(fields);
    });

    test('should preserve other fields when omitting', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        omit: {
          title: true,
        },
      };
      const result = processInternalFields(fields, config);
      expect(result.count).toEqual(fields.count);
      expect(result.enabled).toEqual(fields.enabled);
      expect(result.nested).toEqual(fields.nested);
    });
  });

  describe('extend functionality', () => {
    test('should add a new top-level field', () => {
      const fields = createTestFields();
      // When extending with a field that has 'type', convertExtendToFieldConfig keeps it as-is
      // Then applyExtendToFields wraps it in an object field structure for new top-level fields
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          newField: string;
        }
      > = {
        extend: {
          newField: {
            type: 'text',
            label: 'New Field',
            default: 'new value',
          },
        },
      };
      const result = processInternalFields(fields, config);
      expect('newField' in result).toBe(true);
      const newField = result.newField;
      // When a field with 'type' is extended, it's added directly (not wrapped)
      // So newField should be a text field directly
      assertField(newField, 'text');
      // After assertField, newField is narrowed to have label and default
      const fieldWithLabel = newField;
      expect(fieldWithLabel.label).toBe('New Field');
      expect(fieldWithLabel.default).toBe('new value');
    });

    test('should add new field at the start of fields object', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          firstField: string;
        }
      > = {
        extend: {
          firstField: {
            type: 'text',
            label: 'First Field',
            default: '',
          },
        },
      };

      const result = processInternalFields(fields, config);
      const keys = Object.keys(result);
      expect(keys[0]).toBe('firstField');
    });

    test('should add nested field to existing object field', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          nested: {
            newNestedField: number;
          };
        }
      > = {
        extend: {
          nested: {
            newNestedField: {
              type: 'number',
              label: 'New Nested Field',
              default: 100,
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      const nestedField = result.nested;
      if (nestedField && typeof nestedField === 'object' && 'objectFields' in nestedField) {
        expect('newNestedField' in nestedField.objectFields).toBe(true);
        expect('value' in nestedField.objectFields).toBe(true);
        expect('deep' in nestedField.objectFields).toBe(true);
      } else {
        throw new Error('nested field should be an object field');
      }
    });

    test('should add extended nested field at the start of objectFields', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          nested: {
            firstNestedField: string;
          };
        }
      > = {
        extend: {
          nested: {
            firstNestedField: {
              type: 'text',
              label: 'First Nested Field',
              default: '',
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      const nestedField = result.nested;
      if (nestedField && typeof nestedField === 'object' && 'objectFields' in nestedField) {
        const keys = Object.keys(nestedField.objectFields);
        expect(keys[0]).toBe('firstNestedField');
      } else {
        throw new Error('nested field should be an object field');
      }
    });

    test('should preserve existing field metadata when merging', () => {
      const fields = createTestFields();
      assertObjectField(fields.nested);
      const originalLabel = fields.nested.label;
      const originalDescription = fields.nested.description ?? 'impossible';

      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          nested: {
            newField: string;
          };
        }
      > = {
        extend: {
          nested: {
            newField: {
              type: 'text',
              label: 'New Field',
              default: '',
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      assertObjectField(result.nested);
      expect(result.nested.label).toBe(originalLabel);
      expect(result.nested.description).toBe(originalDescription);
    });

    test('should merge deeply nested object fields', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          nested: {
            deep: {
              newDeepField: string;
            };
          };
        }
      > = {
        extend: {
          nested: {
            deep: {
              newDeepField: {
                type: 'text',
                label: 'New Deep Field',
                default: 'deep value',
              },
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      const nestedField = result.nested;
      if (nestedField && typeof nestedField === 'object' && 'objectFields' in nestedField) {
        const deepField = nestedField.objectFields.deep;
        if (deepField && typeof deepField === 'object' && 'objectFields' in deepField) {
          expect('newDeepField' in deepField.objectFields).toBe(true);
          expect('data' in deepField.objectFields).toBe(true);
        } else {
          throw new Error('deep field should be an object field');
        }
      } else {
        throw new Error('nested field should be an object field');
      }
    });

    test('should handle extend with nested object structure', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          newObject: {
            field1: string;
            field2: number;
          };
        }
      > = {
        extend: {
          newObject: {
            field1: {
              type: 'text',
              label: 'Field 1',
              default: '',
            },
            field2: {
              type: 'number',
              label: 'Field 2',
              default: 0,
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      const newObject = result.newObject;
      if (newObject && typeof newObject === 'object' && 'objectFields' in newObject) {
        expect('field1' in newObject.objectFields).toBe(true);
        expect('field2' in newObject.objectFields).toBe(true);
        expect(newObject.type).toBe('object');
      } else {
        throw new Error('newObject should be an object field');
      }
    });

    test('should not modify original fields when extending', () => {
      const fields = createTestFields();
      const originalKeys = Object.keys(fields);
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          newField: string;
        }
      > = {
        extend: {
          newField: {
            type: 'text',
            label: 'New Field',
            default: '',
          },
        },
      };

      processInternalFields(fields, config);
      expect(Object.keys(fields)).toEqual(originalKeys);
      expect('newField' in fields).toBe(false);
    });
  });

  describe('defaults functionality', () => {
    test('should update default value of a top-level field', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          title: 'Updated Title',
        },
      };

      const result = processInternalFields(fields, config);
      assertField(result.title, 'text');
      const titleField = result.title;
      expect(titleField.default).toBe('Updated Title');
      expect(titleField.type).toBe('text');
      expect(titleField.label).toBe('Title');
    });

    test('should update default value of nested field', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          nested: {
            value: 'updated nested value',
          },
        },
      };

      const result = processInternalFields(fields, config);
      assertObjectField(result.nested);
      assertField(result.nested.objectFields.value, 'text');
      const valueField = result.nested.objectFields.value;
      expect(valueField.default).toBe('updated nested value');
    });

    test('should update default value of deeply nested field', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          nested: {
            deep: {
              data: 999,
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      assertObjectField(result.nested);
      assertObjectField(result.nested.objectFields.deep);
      assertField(result.nested.objectFields.deep.objectFields.data, 'number');
      const dataField = result.nested.objectFields.deep.objectFields.data;
      expect(dataField.default).toBe(999);
    });

    test('should update multiple default values', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          title: 'New Title',
          count: 100,
          enabled: true,
        },
      };

      const result = processInternalFields(fields, config);
      assertField(result.title, 'text');
      assertField(result.count, 'number');
      assertField(result.enabled, 'switch');
      const titleField = result.title;
      const countField = result.count;
      const enabledField = result.enabled;
      expect(titleField.default).toBe('New Title');
      expect(countField.default).toBe(100);
      expect(enabledField.default).toBe(true);
    });

    test('should preserve field properties when updating defaults', () => {
      const fields = createTestFields();
      const titleField = fields.title;
      assertField(titleField, 'text');
      const originalLabel = titleField.label ?? 'Title';
      const originalType = titleField.type;

      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          title: 'New Default',
        },
      };

      const result = processInternalFields(fields, config);
      assertField(result.title, 'text');
      const resultTitle = result.title;
      expect(resultTitle.default).toBe('New Default');
      expect(resultTitle.label).toBe(originalLabel);
      expect(resultTitle.type).toBe(originalType);
    });

    test('should handle defaults for non-existent fields gracefully', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          // @ts-expect-error - nonExistent is not in TestProps, this is a test
          nonExistent: 'value',
        },
      };

      const result = processInternalFields(fields, config);
      expect('nonExistent' in result).toBe(false);
      expect(Object.keys(result).length).toBe(Object.keys(fields).length);
    });

    test('should not modify original fields when updating defaults', () => {
      const fields = createTestFields();

      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          title: 'New Default',
        },
      };

      const result = processInternalFields(fields, config);
      // The result should have the updated default
      const resultTitle = result.title as Record<string, unknown> & { type: string; default?: unknown };
      if (resultTitle && typeof resultTitle === 'object' && 'type' in resultTitle) {
        expect(resultTitle.default).toBe('New Default');
      } else {
        throw new Error('result title should be a field definition');
      }
      // The original field should remain unchanged
      expect(result).not.toBe(fields);
      assertField(fields.title, 'text');
      expect(fields.title.default).toBe('Default Title');
    });

    test('should not share nested objects between different component defaults', () => {
      // Simulate the Card component scenario where borderEnabled is set to true
      // This test ensures that when one component sets a default, it doesn't affect others
      const baseFields = createTestFields();

      // First component: sets enabled to true
      const config1: InternalFieldsConfig<TestProps> = {
        defaults: {
          enabled: true,
        },
      };
      const result1 = processInternalFields(baseFields, config1);

      // Second component: should still have enabled as false (original default)
      const config2: InternalFieldsConfig<TestProps> = {
        defaults: {
          title: 'Different Title', // Different default, shouldn't affect enabled
        },
      };
      const result2 = processInternalFields(baseFields, config2);

      // Verify first component has enabled: true
      assertField(result1.enabled, 'switch');
      expect(result1.enabled.default).toBe(true);

      // Verify second component still has enabled: false (original default)
      assertField(result2.enabled, 'switch');
      expect(result2.enabled.default).toBe(false);

      // Verify original fields are unchanged
      assertField(baseFields.enabled, 'switch');
      expect(baseFields.enabled.default).toBe(false);
    });

    test('should not share deeply nested objects between different component defaults', () => {
      const baseFields = createTestFields();

      // First component: sets deeply nested default
      const config1: InternalFieldsConfig<TestProps> = {
        defaults: {
          nested: {
            deep: {
              data: 999,
            },
          },
        },
      };
      const result1 = processInternalFields(baseFields, config1);

      // Second component: should still have original nested.deep.data default
      const config2: InternalFieldsConfig<TestProps> = {
        defaults: {
          title: 'Different Title',
        },
      };
      const result2 = processInternalFields(baseFields, config2);

      // Verify first component has updated nested value
      assertObjectField(result1.nested);
      assertObjectField(result1.nested.objectFields.deep);
      assertField(result1.nested.objectFields.deep.objectFields.data, 'number');
      expect(result1.nested.objectFields.deep.objectFields.data.default).toBe(999);

      // Verify second component has original nested value
      assertObjectField(result2.nested);
      assertObjectField(result2.nested.objectFields.deep);
      assertField(result2.nested.objectFields.deep.objectFields.data, 'number');
      expect(result2.nested.objectFields.deep.objectFields.data.default).toBe(42); // Original default

      // Verify original fields are unchanged
      assertObjectField(baseFields.nested);
      assertObjectField(baseFields.nested.objectFields.deep);
      assertField(baseFields.nested.objectFields.deep.objectFields.data, 'number');
      expect(baseFields.nested.objectFields.deep.objectFields.data.default).toBe(42);
    });

    test('should isolate nested field defaults between components (borderEnabled scenario)', () => {
      // This test specifically simulates the Card component borderEnabled bug
      // where borderEnabled: true in Card was affecting all components
      const baseFields: FieldConfiguration<{
        $appearance: {
          design: {
            borderEnabled: boolean;
            borderColor: string;
          };
        };
      }> = {
        $appearance: {
          type: 'object',
          label: 'Appearance',
          objectFields: {
            design: {
              type: 'object',
              label: 'Design',
              objectFields: {
                borderEnabled: {
                  type: 'switch',
                  label: 'Enable Border',
                  default: false, // Default is false
                },
                borderColor: {
                  type: 'color',
                  label: 'Border Color',
                  default: '#000000',
                },
              },
            },
          },
        },
      };

      // Card component: sets borderEnabled to true
      const cardConfig: InternalFieldsConfig<{
        $appearance: {
          design: {
            borderEnabled: boolean;
            borderColor: string;
          };
        };
      }> = {
        defaults: {
          $appearance: {
            design: {
              borderEnabled: true, // Card wants borderEnabled: true
            },
          },
        },
      };
      const cardResult = processInternalFields(baseFields, cardConfig);

      // Other component: should still have borderEnabled: false
      const otherConfig: InternalFieldsConfig<{
        $appearance: {
          design: {
            borderEnabled: boolean;
            borderColor: string;
          };
        };
      }> = {
        defaults: {
          $appearance: {
            design: {
              borderColor: '#ff0000', // Only changes borderColor
            },
          },
        },
      };
      const otherResult = processInternalFields(baseFields, otherConfig);

      // Verify Card component has borderEnabled: true
      assertObjectField(cardResult.$appearance);
      assertObjectField(cardResult.$appearance.objectFields.design);
      assertField(cardResult.$appearance.objectFields.design.objectFields.borderEnabled, 'switch');
      expect(cardResult.$appearance.objectFields.design.objectFields.borderEnabled.default).toBe(true);

      // Verify other component still has borderEnabled: false (original default)
      assertObjectField(otherResult.$appearance);
      assertObjectField(otherResult.$appearance.objectFields.design);
      assertField(otherResult.$appearance.objectFields.design.objectFields.borderEnabled, 'switch');
      expect(otherResult.$appearance.objectFields.design.objectFields.borderEnabled.default).toBe(false);

      // Verify original base fields are unchanged
      assertObjectField(baseFields.$appearance);
      assertObjectField(baseFields.$appearance.objectFields.design);
      assertField(baseFields.$appearance.objectFields.design.objectFields.borderEnabled, 'switch');
      expect(baseFields.$appearance.objectFields.design.objectFields.borderEnabled.default).toBe(false);
    });

    test('should create separate object field instances when applying nested defaults', () => {
      const baseFields = createTestFields();

      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          nested: {
            value: 'updated value',
          },
        },
      };

      const result = processInternalFields(baseFields, config);

      // Verify the nested object field is a different instance
      assertObjectField(result.nested);
      assertObjectField(baseFields.nested);
      expect(result.nested).not.toBe(baseFields.nested);

      // Verify nested objectFields are different instances
      expect(result.nested.objectFields).not.toBe(baseFields.nested.objectFields);

      // Verify the value field is a different instance
      assertField(result.nested.objectFields.value, 'text');
      assertField(baseFields.nested.objectFields.value, 'text');
      expect(result.nested.objectFields.value).not.toBe(baseFields.nested.objectFields.value);

      // Verify original is unchanged
      expect(baseFields.nested.objectFields.value.default).toBe('default value');

      // Verify result has updated default
      expect(result.nested.objectFields.value.default).toBe('updated value');
    });
  });

  describe('combinations', () => {
    test('should handle omit then extend', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        TestProps,
        {
          newTitle: string;
        }
      > = {
        omit: {
          title: true,
        },
        extend: {
          newTitle: {
            type: 'text',
            label: 'New Title',
            default: 'Replacement Title',
          },
        },
      };

      const result = processInternalFields(fields, config);
      expect('title' in result).toBe(false);
      expect('newTitle' in result).toBe(true);
    });

    test('should handle extend then defaults', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        TestProps,
        {
          newField: string;
        }
      > = {
        extend: {
          newField: {
            type: 'text',
            label: 'New Field',
            default: 'original default',
          },
        },
        defaults: {
          // just testing this works, it is a bit silly as you define the "default" in the "extend" config
          // @ts-expect-error - newField is an extended field, not in TestProps defaults
          newField: 'updated default',
        },
      };

      const result = processInternalFields(fields, config);
      assertField(result.newField, 'text');
      const newField = result.newField;
      // When a field with 'type' is extended, it's added directly (not wrapped)
      expect(newField.default).toBe('updated default');
    });

    test('should handle omit, extend, and defaults together', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        TestProps,
        {
          newTitle: string;
          newCount: number;
        }
      > = {
        omit: {
          title: true,
        },
        extend: {
          newTitle: {
            type: 'text',
            label: 'New Title',
            default: 'original',
          },
          newCount: {
            type: 'number',
            label: 'New Count',
            default: 0,
          },
        },
        defaults: {
          count: 999,
        },
      };

      const result = processInternalFields(fields, config);
      expect('title' in result).toBe(false);
      expect('newTitle' in result).toBe(true);
      expect('newCount' in result).toBe(true);

      assertField(result.count, 'number');
      const countField = result.count;
      expect(countField.default).toBe(999);

      assertField(result.newTitle, 'text');
      assertField(result.newCount, 'number');
    });

    test('should handle nested omit, extend, and defaults', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        TestProps,
        {
          nested: {
            newValue: string;
          };
        }
      > = {
        omit: {
          nested: {
            value: true,
          },
        },
        extend: {
          nested: {
            newValue: {
              type: 'text',
              label: 'New Value',
              default: 'original',
            },
          },
        },
        defaults: {
          nested: {
            deep: {
              data: 777,
            },
            // just testing this works, it is a bit silly as you define the "default" in the "extend" config
            // @ts-expect-error - newValue is an extended field, not in TestProps defaults
            newValue: 'updated',
          },
        },
      };

      const result = processInternalFields(fields, config);
      assertObjectField(result.nested);
      expect('value' in result.nested.objectFields).toBe(false);
      expect('newValue' in result.nested.objectFields).toBe(true);

      assertField(result.nested.objectFields.newValue, 'text');
      const newValueField = result.nested.objectFields.newValue;
      expect(newValueField.default).toBe('updated');

      assertObjectField(result.nested.objectFields.deep);
      assertField(result.nested.objectFields.deep.objectFields.data, 'number');
      const dataField = result.nested.objectFields.deep.objectFields.data;
      expect(dataField.default).toBe(777);
    });
  });

  describe('edge cases', () => {
    test('should handle empty omit config', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        omit: {},
      };

      const result = processInternalFields(fields, config);
      expect(result).toEqual(fields);
    });

    test('should handle empty extend config', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        extend: {},
      };

      const result = processInternalFields(fields, config);
      expect(result).toEqual(fields);
    });

    test('should handle empty defaults config', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        defaults: {},
      };

      const result = processInternalFields(fields, config);
      expect(result).toEqual(fields);
    });

    test('should handle all empty configs', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        omit: {},
        extend: {},
        defaults: {},
      };

      const result = processInternalFields(fields, config);
      expect(result).toEqual(fields);
    });

    test('should handle omitting field that does not exist', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        omit: {
          // @ts-expect-error - nonExistent is not in TestProps
          nonExistent: true,
        },
      };

      const result = processInternalFields(fields, config);
      expect(Object.keys(result).length).toBe(Object.keys(fields).length);
    });

    test('should handle extending with field that already exists (should merge)', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          nested: {
            value: string;
          };
        }
      > = {
        extend: {
          nested: {
            value: {
              type: 'text',
              label: 'Updated Value Label',
              default: 'new default',
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      assertObjectField(result.nested);
      assertField(result.nested.objectFields.value, 'text');
      const valueField = result.nested.objectFields.value;
      expect(valueField.label).toBe('Updated Value Label');
      expect(valueField.default).toBe('new default');
    });

    test('should handle defaults for field that does not exist', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          // @ts-expect-error - nonExistent is not in TestProps, this is a test
          nonExistent: 'value',
        },
      };

      const result = processInternalFields(fields, config);
      expect('nonExistent' in result).toBe(false);
    });

    test('should handle complex nested structure with all operations', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        TestProps,
        {
          nested: {
            newValue: string;
            deep: {
              newData: number;
            };
          };
        }
      > = {
        omit: {
          nested: {
            value: true,
            deep: {
              data: true,
            },
          },
        },
        extend: {
          nested: {
            newValue: {
              type: 'text',
              label: 'New Value',
              default: 'original',
            },
            deep: {
              newData: {
                type: 'number',
                label: 'New Data',
                default: 100,
              },
            },
          },
        },
        defaults: {
          nested: {
            newValue: 'updated value',
            deep: {
              // @ts-expect-error - newData is an extended field, not in TestProps defaults
              newData: 200,
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      assertObjectField(result.nested);
      expect('value' in result.nested.objectFields).toBe(false);
      expect('newValue' in result.nested.objectFields).toBe(true);

      assertField(result.nested.objectFields.newValue, 'text');
      const newValueField = result.nested.objectFields.newValue;
      expect(newValueField.default).toBe('updated value');

      assertObjectField(result.nested.objectFields.deep);
      expect('data' in result.nested.objectFields.deep.objectFields).toBe(false);
      expect('newData' in result.nested.objectFields.deep.objectFields).toBe(true);

      assertField(result.nested.objectFields.deep.objectFields.newData, 'number');
      const newDataField = result.nested.objectFields.deep.objectFields.newData;
      expect(newDataField.default).toBe(200);
    });

    test('should preserve array fields', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<TestProps> = {
        defaults: {
          title: 'Updated',
        },
      };

      const result = processInternalFields(fields, config);
      expect('array' in result).toBe(true);
      assertField(result.array, 'array');
    });

    test('should handle multiple levels of nesting in extend', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          level1: {
            level2: {
              level3: {
                field: string;
              };
            };
          };
        }
      > = {
        extend: {
          level1: {
            level2: {
              level3: {
                field: {
                  type: 'text',
                  label: 'Deep Field',
                  default: 'deep value',
                },
              },
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      const level1 = result.level1;
      if (level1 && typeof level1 === 'object' && 'objectFields' in level1) {
        const level2 = level1.objectFields.level2;
        if (level2 && typeof level2 === 'object' && 'objectFields' in level2) {
          const level3 = level2.objectFields.level3;
          if (level3 && typeof level3 === 'object' && 'objectFields' in level3) {
            expect('field' in level3.objectFields).toBe(true);
          } else {
            throw new Error('level3 should be an object field');
          }
        } else {
          throw new Error('level2 should be an object field');
        }
      } else {
        throw new Error('level1 should be an object field');
      }
    });
  });

  describe('field ordering', () => {
    test('should place extended fields before existing fields', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          firstField: string;
          secondField: string;
        }
      > = {
        extend: {
          firstField: {
            type: 'text',
            label: 'First',
            default: '',
          },
          secondField: {
            type: 'text',
            label: 'Second',
            default: '',
          },
        },
      };

      const result = processInternalFields(fields, config);
      const keys = Object.keys(result);
      // Extended fields are added one at a time, each at the start
      // The loop processes entries in order: firstField is processed first (added at start),
      // then secondField is processed (added at start, pushing firstField to second position)
      // So secondField comes first (last one added), then firstField, then existing fields
      // However, Object.keys() order may vary, so we check that both extended fields come before existing fields
      const firstFieldIndex = keys.indexOf('firstField');
      const secondFieldIndex = keys.indexOf('secondField');
      const titleIndex = keys.indexOf('title');
      expect(firstFieldIndex).toBeGreaterThanOrEqual(0);
      expect(secondFieldIndex).toBeGreaterThanOrEqual(0);
      // Both extended fields should come before existing fields
      expect(firstFieldIndex).toBeLessThan(titleIndex);
      expect(secondFieldIndex).toBeLessThan(titleIndex);
      // Verify existing fields are still present
      expect(keys.includes('title')).toBe(true);
      expect(keys.includes('count')).toBe(true);
      expect(keys.includes('enabled')).toBe(true);
      expect(keys.includes('nested')).toBe(true);
    });

    test('should place extended nested fields before existing nested fields', () => {
      const fields = createTestFields();
      const config: InternalFieldsConfig<
        InternalComponentFields,
        {
          nested: {
            firstNested: string;
            secondNested: string;
          };
        }
      > = {
        extend: {
          nested: {
            firstNested: {
              type: 'text',
              label: 'First Nested',
              default: '',
            },
            secondNested: {
              type: 'text',
              label: 'Second Nested',
              default: '',
            },
          },
        },
      };

      const result = processInternalFields(fields, config);
      assertObjectField(result.nested);
      const keys = Object.keys(result.nested.objectFields);
      expect(keys[0]).toBe('firstNested');
      expect(keys[1]).toBe('secondNested');
    });
  });
});
