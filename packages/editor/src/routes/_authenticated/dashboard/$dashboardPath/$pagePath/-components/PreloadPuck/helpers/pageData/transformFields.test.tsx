import { describe, test, expect } from 'bun:test';
import { DefaultComponentProps } from '@measured/puck';
import { transformFields } from './transformFields';
import { EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES } from './constants';
import { CustomComponentConfig } from '@typings/puck';

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
          disableBreakpoints: true,
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
          disableBreakpoints: true,
          label: 'Direction',
          arrayFields: {
            gap: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                disableBreakpoints: false,
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
                disableBreakpoints: true,
                label: '',
                objectFields: {
                  description: {
                    type: 'custom',
                    render: expect.any(Function),
                    _field: {
                      default: '123',
                      label: '',
                      disableBreakpoints: false,
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
        disableBreakpoints: false,
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
        disableBreakpoints: false,
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
        disableBreakpoints: false,
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
        disableBreakpoints: false,
      },
    });
  });

  test('Should revert disableBreakpoints for fields that do not permit it', () => {
    const config: CustomComponentConfig<DefaultComponentProps> = {
      label: 'Excluded Fields Test',
      fields: {
        // Test object field with disableBreakpoints: false (should become true)
        objectField: {
          type: 'object',
          label: 'Object Field',
          disableBreakpoints: false, // Should be reverted to true
          objectFields: {
            nested: {
              type: 'text',
              label: 'Nested Text',
              default: '',
            },
          },
        },
        // Test array field with disableBreakpoints: false (should become true)
        arrayField: {
          type: 'array',
          label: 'Array Field',
          default: [],
          disableBreakpoints: false, // Should be reverted to true
          arrayFields: {
            item: {
              type: 'text',
              label: 'Array Item',
              default: '',
            },
          },
        },
        // Test divider field with disableBreakpoints: false (should become true)
        dividerField: {
          type: 'divider',
          label: 'Divider Field',
          default: undefined,
          disableBreakpoints: false, // Should be reverted to true
        },
        // Test hidden field with disableBreakpoints: false (should become true)
        hiddenField: {
          type: 'hidden',
          default: 'hidden-value',
          disableBreakpoints: false, // Should be reverted to true
        },
        // Control test: normal field that should respect disableBreakpoints: false
        normalText: {
          type: 'text',
          label: 'Normal Text',
          default: '',
          disableBreakpoints: false, // Should remain false
        },
      },
      render() {
        return <></>;
      },
    };

    const transformedFields = transformFields(config.fields);

    // Test that all excluded field types have disableBreakpoints: true regardless of input
    const excludedFieldTests = [
      { key: 'objectField', type: 'object' },
      { key: 'arrayField', type: 'array' },
      { key: 'dividerField', type: 'divider' },
      { key: 'hiddenField', type: 'hidden' },
    ];

    excludedFieldTests.forEach(({ key, type }) => {
      const transformedField = (transformedFields[key] as any)?._field;

      expect(transformedField).toBeDefined();
      expect(transformedField.disableBreakpoints).toBe(true);
      expect(transformedField.type).toBe(type);
    });

    // Test that normal field respects the original disableBreakpoints value
    expect((transformedFields.normalText as any)._field.disableBreakpoints).toBe(false);
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
        disableBreakpoints: true,
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
              disableBreakpoints: false,
            },
          },
          layout: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'object',
              label: 'Layout',
              disableBreakpoints: true,
              objectFields: {
                width: {
                  type: 'custom',
                  render: expect.any(Function),
                  _field: {
                    type: 'number',
                    label: 'Width',
                    default: 100,
                    disableBreakpoints: false,
                  },
                },
                color: {
                  type: 'custom',
                  render: expect.any(Function),
                  _field: {
                    type: 'text',
                    label: 'Color',
                    default: '#000000',
                    disableBreakpoints: false,
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
        disableBreakpoints: true,
        arrayFields: {
          name: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'text',
              label: 'Name',
              default: '',
              disableBreakpoints: false,
            },
          },
          metadata: {
            type: 'custom',
            render: expect.any(Function),
            _field: {
              type: 'object',
              label: 'Metadata',
              disableBreakpoints: true,
              objectFields: {
                priority: {
                  type: 'custom',
                  render: expect.any(Function),
                  _field: {
                    type: 'number',
                    label: 'Priority',
                    default: 1,
                    disableBreakpoints: false,
                  },
                },
                tags: {
                  type: 'custom',
                  render: expect.any(Function),
                  _field: {
                    type: 'array',
                    label: 'Tags',
                    default: [],
                    disableBreakpoints: true,
                    arrayFields: {
                      tag: {
                        type: 'custom',
                        render: expect.any(Function),
                        _field: {
                          type: 'text',
                          label: 'Tag',
                          default: '',
                          disableBreakpoints: false,
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

  test('Should handle automatic disableBreakpoints for object, array, and divider types', () => {
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
          disableBreakpoints: true,
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

    // Normal text field should have breakpoints enabled by default
    expect((transformedFields.normalText as unknown as any)._field.disableBreakpoints).toBe(false);

    // Manually disabled should respect the setting
    expect((transformedFields.manuallyDisabled as unknown as any)._field.disableBreakpoints).toBe(true);

    // Object, array, and divider should automatically have breakpoints disabled
    expect((transformedFields.objectField as unknown as any)._field.disableBreakpoints).toBe(true);
    expect((transformedFields.arrayField as unknown as any)._field.disableBreakpoints).toBe(true);
    expect((transformedFields.dividerField as unknown as any)._field.disableBreakpoints).toBe(true);

    // But nested fields inside objects/arrays should still follow normal rules
    expect((transformedFields.objectField as unknown as any)._field.objectFields.nested._field.disableBreakpoints).toBe(false);
    expect((transformedFields.arrayField as unknown as any)._field.arrayFields.item._field.disableBreakpoints).toBe(false);
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
        disableBreakpoints: false,
      },
    });

    expect(transformedFields.serviceField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'service',
        label: 'Service',
        default: 'switch.turn_on',
        disableBreakpoints: false,
      },
    });

    expect(transformedFields.colorField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'color',
        label: 'Color',
        default: '#ffffff',
        disableBreakpoints: false,
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
        disableBreakpoints: false,
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
        disableBreakpoints: false,
      },
    });

    expect(transformedFields.imageField).toEqual({
      type: 'custom',
      render: expect.any(Function),
      _field: {
        type: 'imageUpload',
        label: 'Image',
        default: '',
        disableBreakpoints: false,
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
          disableBreakpoints: false, // this will be automatically reverted to true
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
          disableBreakpoints: false,
        },
      },
      hiddenField: {
        type: 'custom',
        render: expect.any(Function),
        _field: {
          type: 'hidden',
          default: 'hidden-value',
          disableBreakpoints: true,
        },
      },
      complexObject: {
        type: 'custom',
        render: expect.any(Function),
        _field: {
          type: 'object',
          label: 'Complex Object',
          disableBreakpoints: true,
          objectFields: {
            simpleNumber: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                type: 'number',
                label: 'Simple Number',
                default: 0,
                disableBreakpoints: false,
              },
            },
            nestedArray: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                type: 'array',
                label: 'Nested Array',
                default: [],
                disableBreakpoints: true,
                arrayFields: {
                  arrayText: {
                    type: 'custom',
                    render: expect.any(Function),
                    _field: {
                      type: 'text',
                      label: 'Array Text',
                      default: '',
                      disableBreakpoints: false,
                    },
                  },
                  arrayObject: {
                    type: 'custom',
                    render: expect.any(Function),
                    _field: {
                      type: 'object',
                      label: 'Array Object',
                      disableBreakpoints: true,
                      objectFields: {
                        deepText: {
                          type: 'custom',
                          render: expect.any(Function),
                          _field: {
                            type: 'text',
                            label: 'Deep Text',
                            default: '',
                            disableBreakpoints: false,
                          },
                        },
                        hiddenInNested: {
                          type: 'custom',
                          render: expect.any(Function),
                          _field: {
                            type: 'hidden',
                            default: 'nested-hidden',
                            disableBreakpoints: true,
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
                disableBreakpoints: true,
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
          disableBreakpoints: true,
          arrayFields: {
            color: {
              type: 'custom',
              render: expect.any(Function),
              _field: {
                type: 'color',
                label: 'Color',
                default: '#000000',
                disableBreakpoints: false,
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
                disableBreakpoints: false,
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
        disableBreakpoints: true,
      },
    });
    expect((transformedFields.complexObject as unknown as any)._field.objectFields.anotherHidden).toBeDefined();
    expect(
      (transformedFields.complexObject as unknown as any)._field.objectFields.nestedArray._field.arrayFields.arrayObject._field.objectFields
        .hiddenInNested
    ).toBeDefined();
  });
});
