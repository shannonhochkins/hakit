import { describe, test, expect } from 'bun:test';
import { DefaultComponentProps } from '@measured/puck';
import { CustomComponentConfig } from '@typings/puck';
import { transformFields } from '../transformFields';
import { EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES } from '../constants';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('transformFields', () => {
  test('Should transform fields to puck fields and include a reference to the original field configuration under _field', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'test',
      fields: {
        direction: {
          type: 'array',
          label: 'Direction',
          default: [
            {
              gap: 32,
              title: {
                description: 'Yeah Nah',
              },
            },
          ],
          responsiveMode: false,
          arrayFields: {
            gap: {
              type: 'number',
              label: '',
              min: 0,
              default: 4,
            },
            title: {
              type: 'object',
              label: '',
              objectFields: {
                description: {
                  label: '',
                  default: '123',
                  type: 'text',
                },
              },
            },
          },
        },
      },
      render() {
        return <></>;
      },
    };
    const transformedFields = transformFields(config.fields);
    expect(transformedFields).toEqual({
      direction: {
        type: 'custom',
        render: expect.any(Function),
        _field: {
          type: 'array',
          default: [
            {
              gap: 32,
              title: {
                description: 'Yeah Nah',
              },
            },
          ],
          responsiveMode: false,
          label: 'Direction',
          arrayFields: {
            gap: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                responsiveMode: true,
                default: 4,
                type: 'number',
                label: '',
                min: 0,
              },
            },
            title: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                type: 'object',
                responsiveMode: false,
                label: '',
                objectFields: {
                  description: {
                    type: 'custom',
                    render: expect.any(Function),
                    _field: {
                      default: '123',
                      label: '',
                      responsiveMode: true,
                      type: 'text',
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  test('Should handle simple field types (text, number, select, etc.)', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Simple Fields Test',
      fields: {
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
          max: 100,
        },
        category: {
          type: 'select',
          label: 'Category',
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
          ],
          default: 'opt1',
        },
        isEnabled: {
          type: 'radio',
          label: 'Enabled',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
          default: true,
        },
      },
      render() {
        return <></>;
      },
    };

    const transformedFields = transformFields(config.fields);

    expect(transformedFields.title).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'text',
        label: 'Title',
        default: 'Default Title',
        responsiveMode: true,
      },
    });

    expect(transformedFields.count).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'number',
        label: 'Count',
        default: 0,
        min: 0,
        max: 100,
        responsiveMode: true,
      },
    });

    expect(transformedFields.category).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'select',
        label: 'Category',
        options: [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' },
        ],
        default: 'opt1',
        responsiveMode: true,
      },
    });

    expect(transformedFields.isEnabled).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'radio',
        label: 'Enabled',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        default: true,
        responsiveMode: true,
      },
    });
  });

  test('Should revert responsiveMode for fields that do not permit it', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Excluded Fields Test',
      fields: {
        // Test object field with responsiveMode: true (should become false)
        objectField: {
          type: 'object',
          label: 'Object Field',
          responsiveMode: true, // Should be reverted to false
          objectFields: {
            nested: {
              type: 'text',
              label: 'Nested Text',
              default: '',
            },
          },
        },
        // Test array field with responsiveMode: true (should become false)
        arrayField: {
          type: 'array',
          label: 'Array Field',
          default: [],
          responsiveMode: true, // Should be reverted to false
          arrayFields: {
            item: {
              type: 'text',
              label: 'Array Item',
              default: '',
            },
          },
        },
        // Test divider field with responsiveMode: true (should become false)
        dividerField: {
          type: 'divider',
          label: 'Divider Field',
          default: undefined,
          responsiveMode: true, // Should be reverted to false
        },
        // Test hidden field with responsiveMode: true (should become false)
        hiddenField: {
          type: 'hidden',
          default: 'hidden-value',
          // @ts-expect-error - even though typescript doesn't allow this, we're just testing it
          responsiveMode: true, // Should be reverted to false
        },
        // Control test: normal field that should respect responsiveMode: true
        normalText: {
          type: 'text',
          label: 'Normal Text',
          default: '',
          responsiveMode: true, // Should remain true
        },
      },
      render() {
        return <></>;
      },
    };

    const transformedFields = transformFields(config.fields);

    // Test that all excluded field types have responsiveMode: false regardless of input
    const excludedFieldTests = [
      { key: 'objectField', type: 'object' },
      { key: 'arrayField', type: 'array' },
      { key: 'dividerField', type: 'divider' },
      { key: 'hiddenField', type: 'hidden' },
    ];

    excludedFieldTests.forEach(({ key, type }) => {
      const transformedField = (transformedFields[key] as any)?._field;

      expect(transformedField).toBeDefined();
      expect(transformedField.responsiveMode).toBe(false);
      expect(transformedField.type).toBe(type);
    });

    // Test that normal field respects the original responsiveMode value
    expect((transformedFields.normalText as any)._field.responsiveMode).toBe(true);
    expect((transformedFields.normalText as any)._field.type).toBe('text');

    // Verify that the complete EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES list is covered
    const testedTypes = excludedFieldTests.map(test => test.type);
    EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES.forEach(excludedType => {
      expect(testedTypes).toContain(excludedType);
    });
  });

  test('Should handle object fields with nested recursion', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Object Fields Test',
      fields: {
        settings: {
          type: 'object',
          label: 'Settings',
          objectFields: {
            theme: {
              type: 'select',
              label: 'Theme',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ],
              default: 'light',
            },
            layout: {
              type: 'object',
              label: 'Layout',
              objectFields: {
                width: {
                  type: 'number',
                  label: 'Width',
                  default: 100,
                },
                color: {
                  type: 'text',
                  label: 'Color',
                  default: '#000000',
                },
              },
            },
          },
        },
      },
      render() {
        return <></>;
      },
    };

    const transformedFields = transformFields(config.fields);

    expect(transformedFields.settings).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'object',
        label: 'Settings',
        responsiveMode: false,
        objectFields: {
          theme: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'select',
              label: 'Theme',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ],
              default: 'light',
              responsiveMode: true,
            },
          },
          layout: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'object',
              label: 'Layout',
              responsiveMode: false,
              objectFields: {
                width: {
                  type: 'custom',
                  render: expect.any(Function),
                  _field: {
                    type: 'number',
                    label: 'Width',
                    default: 100,
                    responsiveMode: true,
                  },
                },
                color: {
                  type: 'custom',
                  render: expect.any(Function),
                  _field: {
                    type: 'text',
                    label: 'Color',
                    default: '#000000',
                    responsiveMode: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  test('Should handle array fields with nested recursion', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Array Fields Test',
      fields: {
        items: {
          type: 'array',
          label: 'Items',
          default: [],
          arrayFields: {
            name: {
              type: 'text',
              label: 'Name',
              default: '',
            },
            metadata: {
              type: 'object',
              label: 'Metadata',
              objectFields: {
                priority: {
                  type: 'number',
                  label: 'Priority',
                  default: 1,
                },
                tags: {
                  type: 'array',
                  label: 'Tags',
                  default: [],
                  arrayFields: {
                    tag: {
                      type: 'text',
                      label: 'Tag',
                      default: '',
                    },
                  },
                },
              },
            },
          },
        },
      },
      render() {
        return <></>;
      },
    };

    const transformedFields = transformFields(config.fields);

    expect(transformedFields.items).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'array',
        label: 'Items',
        default: [],
        responsiveMode: false,
        arrayFields: {
          name: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'text',
              label: 'Name',
              default: '',
              responsiveMode: true,
            },
          },
          metadata: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'object',
              label: 'Metadata',
              responsiveMode: false,
              objectFields: {
                priority: {
                  type: 'custom',
                  render: expect.any(Function),
                  _field: {
                    type: 'number',
                    label: 'Priority',
                    default: 1,
                    responsiveMode: true,
                  },
                },
                tags: {
                  type: 'custom',
                  render: expect.any(Function),
                  _field: {
                    type: 'array',
                    label: 'Tags',
                    default: [],
                    responsiveMode: false,
                    arrayFields: {
                      tag: {
                        type: 'custom',
                        render: expect.any(Function),
                        _field: {
                          type: 'text',
                          label: 'Tag',
                          default: '',
                          responsiveMode: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  test('Should handle automatic responsiveMode for object, array, and divider types', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Breakpoints Test',
      fields: {
        normalText: {
          type: 'text',
          label: 'Normal Text',
          default: '',
        },
        manuallyDisabled: {
          type: 'text',
          label: 'Manually Disabled',
          default: '',
          responsiveMode: false,
        },
        objectField: {
          type: 'object',
          label: 'Object',
          objectFields: {
            nested: {
              type: 'text',
              label: 'Nested',
              default: '',
            },
          },
        },
        arrayField: {
          type: 'array',
          label: 'Array',
          default: [],
          arrayFields: {
            item: {
              type: 'text',
              label: 'Item',
              default: '',
            },
          },
        },
        dividerField: {
          type: 'divider',
          label: 'Divider',
          default: undefined,
        },
      },
      render() {
        return <></>;
      },
    };

    const transformedFields = transformFields(config.fields);

    // Normal text field should have responsive mode enabled by default
    expect((transformedFields.normalText as unknown as any)._field.responsiveMode).toBe(true);

    // Manually disabled should respect the setting
    expect((transformedFields.manuallyDisabled as unknown as any)._field.responsiveMode).toBe(false);

    // Object, array, and divider should automatically have responsive mode disabled
    expect((transformedFields.objectField as unknown as any)._field.responsiveMode).toBe(false);
    expect((transformedFields.arrayField as unknown as any)._field.responsiveMode).toBe(false);
    expect((transformedFields.dividerField as unknown as any)._field.responsiveMode).toBe(false);

    // But nested fields inside objects/arrays should still follow normal rules
    expect((transformedFields.objectField as unknown as any)._field.objectFields.nested._field.responsiveMode).toBe(true);
    expect((transformedFields.arrayField as unknown as any)._field.arrayFields.item._field.responsiveMode).toBe(true);
  });

  test('Should handle special field types (entity, service, color, etc.)', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Special Fields Test',
      fields: {
        entityField: {
          type: 'entity',
          label: 'Entity',
          options: [],
          default: () => 'sensor.test',
        },
        serviceField: {
          type: 'service',
          label: 'Service',
          default: 'switch.turn_on',
        },
        colorField: {
          type: 'color',
          label: 'Color',
          default: '#ffffff',
        },
        sliderField: {
          type: 'slider',
          label: 'Slider',
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        codeField: {
          type: 'code',
          label: 'Code',
          language: 'yaml',
          default: '',
        },
        imageField: {
          type: 'imageUpload',
          label: 'Image',
          default: '',
        },
      },
      render() {
        return <></>;
      },
    };

    const transformedFields = transformFields(config.fields);

    expect(transformedFields.entityField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'entity',
        label: 'Entity',
        options: [],
        default: expect.any(Function),
        responsiveMode: true,
      },
    });

    expect(transformedFields.serviceField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'service',
        label: 'Service',
        default: 'switch.turn_on',
        responsiveMode: true,
      },
    });

    expect(transformedFields.colorField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'color',
        label: 'Color',
        default: '#ffffff',
        responsiveMode: true,
      },
    });

    expect(transformedFields.sliderField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'slider',
        label: 'Slider',
        min: 0,
        max: 100,
        step: 1,
        default: 50,
        responsiveMode: true,
      },
    });

    expect(transformedFields.codeField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'code',
        label: 'Code',
        language: 'yaml',
        default: '',
        responsiveMode: true,
      },
    });

    expect(transformedFields.imageField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'imageUpload',
        label: 'Image',
        default: '',
        responsiveMode: true,
      },
    });
  });

  test('Should handle empty field configuration', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Empty Test',
      fields: {},
      render() {
        return <></>;
      },
    };

    const transformedFields = transformFields(config.fields);

    expect(transformedFields).toEqual({});
  });

  test('Should handle mixed field types with complex nesting', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Complex Mixed Test',
      fields: {
        basicText: {
          type: 'text',
          label: 'Basic Text',
          default: '',
        },
        hiddenField: {
          type: 'hidden',
          default: 'hidden-value',
          // @ts-expect-error - even though typescript doesn't allow this, we're just testing it
          responsiveMode: true, // this will be automatically reverted to false
        },
        complexObject: {
          type: 'object',
          label: 'Complex Object',
          objectFields: {
            simpleNumber: {
              type: 'number',
              label: 'Simple Number',
              default: 0,
            },
            nestedArray: {
              type: 'array',
              label: 'Nested Array',
              default: [],
              arrayFields: {
                arrayText: {
                  type: 'text',
                  label: 'Array Text',
                  default: '',
                },
                arrayObject: {
                  type: 'object',
                  label: 'Array Object',
                  objectFields: {
                    deepText: {
                      type: 'text',
                      label: 'Deep Text',
                      default: '',
                    },
                    hiddenInNested: {
                      type: 'hidden',
                      default: 'nested-hidden',
                    },
                  },
                },
              },
            },
            anotherHidden: {
              type: 'hidden',
              default: 'another-hidden',
            },
          },
        },
        topLevelArray: {
          type: 'array',
          label: 'Top Level Array',
          default: [],
          arrayFields: {
            color: {
              type: 'color',
              label: 'Color',
              default: '#000000',
            },
            slider: {
              type: 'slider',
              label: 'Slider',
              min: 0,
              max: 10,
              default: 5,
            },
          },
        },
      },
      render() {
        return <></>;
      },
    };

    const transformedFields = transformFields(config.fields);

    expect(transformedFields).toEqual({
      basicText: {
        type: 'custom',
        render: expect.any(Function),
        _field: {
          type: 'text',
          label: 'Basic Text',
          default: '',
          responsiveMode: true,
        },
      },
      hiddenField: {
        type: 'custom',
        render: expect.any(Function),
        _field: {
          type: 'hidden',
          default: 'hidden-value',
          responsiveMode: false,
        },
      },
      complexObject: {
        type: 'custom',
        render: expect.any(Function),
        _field: {
          type: 'object',
          label: 'Complex Object',
          responsiveMode: false,
          objectFields: {
            simpleNumber: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                type: 'number',
                label: 'Simple Number',
                default: 0,
                responsiveMode: true,
              },
            },
            nestedArray: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                type: 'array',
                label: 'Nested Array',
                default: [],
                responsiveMode: false,
                arrayFields: {
                  arrayText: {
                    type: 'custom',
                    render: expect.any(Function),
                    _field: {
                      type: 'text',
                      label: 'Array Text',
                      default: '',
                      responsiveMode: true,
                    },
                  },
                  arrayObject: {
                    type: 'custom',
                    render: expect.any(Function),
                    _field: {
                      type: 'object',
                      label: 'Array Object',
                      responsiveMode: false,
                      objectFields: {
                        deepText: {
                          type: 'custom',
                          render: expect.any(Function),
                          _field: {
                            type: 'text',
                            label: 'Deep Text',
                            default: '',
                            responsiveMode: true,
                          },
                        },
                        hiddenInNested: {
                          type: 'custom',
                          render: expect.any(Function),
                          _field: {
                            type: 'hidden',
                            default: 'nested-hidden',
                            responsiveMode: false,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            anotherHidden: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                type: 'hidden',
                default: 'another-hidden',
                responsiveMode: false,
              },
            },
          },
        },
      },
      topLevelArray: {
        type: 'custom',
        render: expect.any(Function),
        _field: {
          type: 'array',
          label: 'Top Level Array',
          default: [],
          responsiveMode: false,
          arrayFields: {
            color: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                type: 'color',
                label: 'Color',
                default: '#000000',
                responsiveMode: true,
              },
            },
            slider: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                type: 'slider',
                label: 'Slider',
                min: 0,
                max: 10,
                default: 5,
                responsiveMode: true,
              },
            },
          },
        },
      },
    });

    // Hidden fields should now be present as they are processed by transformFields
    expect(transformedFields.hiddenField).toBeDefined();
    expect(transformedFields.hiddenField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'hidden',
        default: 'hidden-value',
        responsiveMode: false,
      },
    });
    expect((transformedFields.complexObject as unknown as any)._field.objectFields.anotherHidden).toBeDefined();
    expect(
      (transformedFields.complexObject as unknown as any)._field.objectFields.nestedArray._field.arrayFields.arrayObject._field.objectFields
        .hiddenInNested
    ).toBeDefined();
  });

  test('should skip id fields only at top level but process nested id fields', () => {
    const fields = {
      id: {
        type: 'text',
        label: 'ID',
        default: '',
      },
      title: {
        type: 'text',
        label: 'Title',
        default: '',
      },
      settings: {
        type: 'object',
        label: 'Settings',
        objectFields: {
          id: {
            type: 'text',
            label: 'Settings ID',
            default: '',
          },
          name: {
            type: 'text',
            label: 'Name',
            default: '',
          },
        },
      },
      items: {
        type: 'array',
        label: 'Items',
        default: [],
        arrayFields: {
          id: {
            type: 'text',
            label: 'Item ID',
            default: '',
          },
          name: {
            type: 'text',
            label: 'Item Name',
            default: '',
          },
        },
      },
    } as const;

    const transformedFields = transformFields(fields);

    // The top-level id field should be completely skipped
    expect(transformedFields).not.toHaveProperty('id');

    // Other fields should be processed normally
    expect(transformedFields.title).toBeDefined();
    expect(transformedFields.title).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'text',
        label: 'Title',
        default: '',
        responsiveMode: true,
      },
    });

    // Nested object fields should be processed normally, including nested id fields
    expect(transformedFields.settings).toBeDefined();
    expect(transformedFields.settings).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'object',
        label: 'Settings',
        responsiveMode: false,
        objectFields: {
          id: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'text',
              label: 'Settings ID',
              default: '',
              responsiveMode: true,
            },
          },
          name: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'text',
              label: 'Name',
              default: '',
              responsiveMode: true,
            },
          },
        },
      },
    });

    // Nested array fields should be processed normally, including nested id fields
    expect(transformedFields.items).toBeDefined();
    expect(transformedFields.items).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'array',
        label: 'Items',
        default: [],
        responsiveMode: false,
        arrayFields: {
          id: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'text',
              label: 'Item ID',
              default: '',
              responsiveMode: true,
            },
          },
          name: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'text',
              label: 'Item Name',
              default: '',
              responsiveMode: true,
            },
          },
        },
      },
    });
  });
});
