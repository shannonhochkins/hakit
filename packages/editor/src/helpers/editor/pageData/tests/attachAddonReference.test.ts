import { expect, test, describe } from 'bun:test';
import { attachAddonReference } from '../attachAddonReference';
import type { FieldConfiguration } from '@typings/fields';

describe('attachAddonReference', () => {
  test('should attach addon ID to simple field types', () => {
    const fields: FieldConfiguration = {
      title: {
        type: 'text',
        label: 'Title',
        default: 'Default Title',
      },
      count: {
        type: 'number',
        label: 'Count',
        default: 0,
        min: 0,
      },
      enabled: {
        type: 'switch',
        label: 'Enabled',
        default: true,
      },
    };

    const result = attachAddonReference(fields, 'test-addon');

    expect(result.title).toEqual({
      type: 'text',
      label: 'Title',
      default: 'Default Title',
      addonId: 'test-addon',
    });

    expect(result.count).toEqual({
      type: 'number',
      label: 'Count',
      default: 0,
      min: 0,
      addonId: 'test-addon',
    });

    expect(result.enabled).toEqual({
      type: 'switch',
      label: 'Enabled',
      default: true,
      addonId: 'test-addon',
    });
  });

  test('should attach addon ID to object fields and recurse into nested fields', () => {
    const fields: FieldConfiguration = {
      config: {
        type: 'object',
        label: 'Configuration',
        objectFields: {
          name: {
            type: 'text',
            label: 'Name',
            default: 'Default Name',
          },
          settings: {
            type: 'object',
            label: 'Settings',
            objectFields: {
              theme: {
                type: 'select',
                label: 'Theme',
                default: 'light',
                options: [
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                ],
              },
            },
          },
        },
      },
    };

    const result = attachAddonReference(fields, 'nested-repo');

    // Check top-level object field
    expect(result.config).toEqual({
      type: 'object',
      label: 'Configuration',
      addonId: 'nested-repo',
      objectFields: {
        name: {
          type: 'text',
          label: 'Name',
          default: 'Default Name',
          addonId: 'nested-repo',
        },
        settings: {
          type: 'object',
          label: 'Settings',
          addonId: 'nested-repo',
          objectFields: {
            theme: {
              type: 'select',
              label: 'Theme',
              default: 'light',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ],
              addonId: 'nested-repo',
            },
          },
        },
      },
    });
  });

  test('should attach addon ID to array fields and recurse into array item fields', () => {
    const fields: FieldConfiguration = {
      items: {
        type: 'array',
        label: 'Items',
        default: [],
        arrayFields: {
          name: {
            type: 'text',
            label: 'Item Name',
            default: 'New Item',
          },
          config: {
            type: 'object',
            label: 'Item Config',
            objectFields: {
              enabled: {
                type: 'switch',
                label: 'Enabled',
                default: true,
              },
              priority: {
                type: 'number',
                label: 'Priority',
                default: 1,
                min: 1,
                max: 10,
              },
            },
          },
        },
      },
    };

    const result = attachAddonReference(fields, 'array-repo');

    expect(result.items).toEqual({
      type: 'array',
      label: 'Items',
      default: [],
      addonId: 'array-repo',
      arrayFields: {
        name: {
          type: 'text',
          label: 'Item Name',
          default: 'New Item',
          addonId: 'array-repo',
        },
        config: {
          type: 'object',
          label: 'Item Config',
          addonId: 'array-repo',
          objectFields: {
            enabled: {
              type: 'switch',
              label: 'Enabled',
              default: true,
              addonId: 'array-repo',
            },
            priority: {
              type: 'number',
              label: 'Priority',
              default: 1,
              min: 1,
              max: 10,
              addonId: 'array-repo',
            },
          },
        },
      },
    });
  });

  test('should handle complex nested structures with mixed field types', () => {
    const fields: FieldConfiguration<{
      title: string;
      layout: {
        columns: number;
        items: Array<{
          type: string;
          content: {
            text: string;
            color: string;
          };
        }>;
      };
    }> = {
      title: {
        type: 'text',
        label: 'Title',
        default: 'Main Title',
      },
      layout: {
        type: 'object',
        label: 'Layout',
        objectFields: {
          columns: {
            type: 'number',
            label: 'Columns',
            default: 2,
            min: 1,
            max: 4,
          },
          items: {
            type: 'array',
            label: 'Layout Items',
            default: [],
            arrayFields: {
              type: {
                type: 'select',
                label: 'Item Type',
                default: 'text',
                options: [
                  { label: 'Text', value: 'text' },
                  { label: 'Image', value: 'image' },
                ],
              },
              content: {
                type: 'object',
                label: 'Content',
                objectFields: {
                  text: {
                    type: 'text',
                    label: 'Text Content',
                    default: '',
                  },
                  color: {
                    type: 'color',
                    label: 'Text Color',
                    default: '#000000',
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = attachAddonReference(fields, 'complex-repo');
    if (result.title.type !== 'text') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Title type is not text');
    }
    if (result.layout.type !== 'object') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Layout type is not object');
    }
    if (result.layout.objectFields.columns.type !== 'number') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Columns type is not number');
    }
    if (result.layout.objectFields.items.type !== 'array') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Items type is not array');
    }
    if (result.layout.objectFields.items.arrayFields.type.type !== 'select') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Type type is not select');
    }
    if (result.layout.objectFields.items.arrayFields.content.type !== 'object') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Content type is not object');
    }
    if (result.layout.objectFields.items.arrayFields.content.objectFields.text.type !== 'text') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Text type is not text');
    }
    if (result.layout.objectFields.items.arrayFields.content.objectFields.color.type !== 'color') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Color type is not color');
    }

    // Verify all fields have the addon ID attached
    expect(result.title.addonId).toBe('complex-repo');
    expect(result.layout.addonId).toBe('complex-repo');
    expect(result.layout.objectFields.columns.addonId).toBe('complex-repo');
    expect(result.layout.objectFields.items.addonId).toBe('complex-repo');
    expect(result.layout.objectFields.items.arrayFields.type.addonId).toBe('complex-repo');
    expect(result.layout.objectFields.items.arrayFields.content.addonId).toBe('complex-repo');
    expect(result.layout.objectFields.items.arrayFields.content.objectFields.text.addonId).toBe('complex-repo');
    expect(result.layout.objectFields.items.arrayFields.content.objectFields.color.addonId).toBe('complex-repo');
  });

  test('should handle empty fields configuration', () => {
    const fields: FieldConfiguration = {};
    const result = attachAddonReference(fields, 'empty-repo');
    expect(result).toEqual({});
  });

  test('should use empty string as default addon ID', () => {
    const fields: FieldConfiguration = {
      title: {
        type: 'text',
        label: 'Title',
        default: 'Default Title',
      },
    };

    const result = attachAddonReference(fields);

    expect(result.title).toEqual({
      type: 'text',
      label: 'Title',
      default: 'Default Title',
      addonId: '',
    });
  });

  test('should handle special field types (color, select, etc.)', () => {
    const fields: FieldConfiguration = {
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#ffffff',
      },
      theme: {
        type: 'select',
        label: 'Theme',
        default: 'light',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ],
      },
      size: {
        type: 'slider',
        label: 'Size',
        min: 10,
        max: 100,
        default: 50,
      },
      description: {
        type: 'textarea',
        label: 'Description',
        default: '',
      },
    };

    const result = attachAddonReference(fields, 'special-repo');

    expect(result.backgroundColor).toEqual({
      type: 'color',
      label: 'Background Color',
      default: '#ffffff',
      addonId: 'special-repo',
    });

    expect(result.theme).toEqual({
      type: 'select',
      label: 'Theme',
      default: 'light',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
      addonId: 'special-repo',
    });

    expect(result.size).toEqual({
      type: 'slider',
      label: 'Size',
      min: 10,
      max: 100,
      default: 50,
      addonId: 'special-repo',
    });

    expect(result.description).toEqual({
      type: 'textarea',
      label: 'Description',
      default: '',
      addonId: 'special-repo',
    });
  });

  test('should handle object fields without objectFields property', () => {
    const fields: FieldConfiguration = {
      // @ts-expect-error - intentionally omitting field properties
      config: {
        type: 'object',
        label: 'Configuration',
        // No objectFields property
      },
    };

    const result = attachAddonReference(fields, 'no-object-fields-repo');

    expect(result.config).toEqual({
      type: 'object',
      label: 'Configuration',
      addonId: 'no-object-fields-repo',
      objectFields: {},
    });
  });

  test('should handle array fields without arrayFields property', () => {
    const fields: FieldConfiguration = {
      // @ts-expect-error - intentionally omitting field properties
      items: {
        type: 'array',
        label: 'Items',
        default: [],
        // No arrayFields property
      },
    };

    const result = attachAddonReference(fields, 'no-array-fields-repo');

    expect(result.items).toEqual({
      type: 'array',
      label: 'Items',
      default: [],
      addonId: 'no-array-fields-repo',
      arrayFields: {},
    });
  });

  test('should preserve all original field properties while adding addonId', () => {
    const fields: FieldConfiguration = {
      complexField: {
        type: 'text',
        label: 'Complex Field',
        default: 'Default Value',
        placeholder: 'Enter text here',
        required: true,
        description: 'This is a help text',
      },
    };

    const result = attachAddonReference(fields, 'preserve-repo');

    expect(result.complexField).toEqual({
      type: 'text',
      label: 'Complex Field',
      default: 'Default Value',
      placeholder: 'Enter text here',
      required: true,
      description: 'This is a help text',
      addonId: 'preserve-repo',
    });
  });

  test('should handle deeply nested structures (3+ levels)', () => {
    const fields: FieldConfiguration<{
      level1: {
        level2: {
          level3: {
            deepField: string;
          };
        };
      };
    }> = {
      level1: {
        type: 'object',
        label: 'Level 1',
        objectFields: {
          level2: {
            type: 'object',
            label: 'Level 2',
            objectFields: {
              level3: {
                type: 'object',
                label: 'Level 3',
                objectFields: {
                  deepField: {
                    type: 'text',
                    label: 'Deep Field',
                    default: 'Deep Value',
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = attachAddonReference(fields, 'deep-repo');

    if (result.level1.type !== 'object') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Level 1 type is not object');
    }
    expect(result.level1.addonId).toBe('deep-repo');
    if (result.level1.objectFields.level2.type !== 'object') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Level 2 type is not object');
    }
    expect(result.level1.objectFields.level2.addonId).toBe('deep-repo');
    if (result.level1.objectFields.level2.objectFields.level3.type !== 'object') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Level 3 type is not object');
    }
    expect(result.level1.objectFields.level2.objectFields.level3.addonId).toBe('deep-repo');
    if (result.level1.objectFields.level2.objectFields.level3.objectFields.deepField.type !== 'text') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Deep field type is not text');
    }
    expect(result.level1.objectFields.level2.objectFields.level3.objectFields.deepField.addonId).toBe('deep-repo');
  });

  test('should handle arrays with nested objects and arrays', () => {
    const fields: FieldConfiguration<{
      sections: Array<{
        title: string;
        items: Array<{
          name: string;
          config: {
            enabled: boolean;
          };
        }>;
      }>;
    }> = {
      sections: {
        type: 'array',
        label: 'Sections',
        default: [],
        arrayFields: {
          title: {
            type: 'text',
            label: 'Section Title',
            default: 'New Section',
          },
          items: {
            type: 'array',
            label: 'Section Items',
            default: [],
            arrayFields: {
              name: {
                type: 'text',
                label: 'Item Name',
                default: 'New Item',
              },
              config: {
                type: 'object',
                label: 'Item Config',
                objectFields: {
                  enabled: {
                    type: 'switch',
                    label: 'Enabled',
                    default: true,
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = attachAddonReference(fields, 'nested-array-repo');

    if (result.sections.type !== 'array') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Sections type is not array');
    }
    // Verify all levels have the addon ID
    expect(result.sections.addonId).toBe('nested-array-repo');
    if (result.sections.arrayFields.title.type !== 'text') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Title type is not text');
    }
    expect(result.sections.arrayFields.title.addonId).toBe('nested-array-repo');
    if (result.sections.arrayFields.items.type !== 'array') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Items type is not array');
    }
    expect(result.sections.arrayFields.items.addonId).toBe('nested-array-repo');
    if (result.sections.arrayFields.items.arrayFields.name.type !== 'text') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Name type is not text');
    }
    expect(result.sections.arrayFields.items.arrayFields.name.addonId).toBe('nested-array-repo');
    if (result.sections.arrayFields.items.arrayFields.config.type !== 'object') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Config type is not object');
    }
    expect(result.sections.arrayFields.items.arrayFields.config.addonId).toBe('nested-array-repo');
    if (result.sections.arrayFields.items.arrayFields.config.objectFields.enabled.type !== 'switch') {
      // should fail the test
      expect(false).toBe(true);
      throw new Error('Enabled type is not switch');
    }
    expect(result.sections.arrayFields.items.arrayFields.config.objectFields.enabled.addonId).toBe('nested-array-repo');
  });
});
