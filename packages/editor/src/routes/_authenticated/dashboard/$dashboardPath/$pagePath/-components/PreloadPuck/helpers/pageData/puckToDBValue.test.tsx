import { describe, test, expect, it } from 'bun:test';
import { puckToDBValue } from './puckToDBValue';
import { userConfig } from './__mocks__/userConfig';
import { databaseData } from './__mocks__/databaseData';
import { puckChangeData } from './__mocks__/puckChangeData';
import { fieldsWithBreakpointsEnabled } from './__mocks__/fieldsWithBreakpointsEnabled';
import { CustomConfig, PuckPageData } from '@typings/puck';
import { BreakPoint } from '@hakit/components';
import { ComponentBreakpointModeMap } from '@lib/hooks/useGlobalStore';
import type { CustomObjectField } from '@typings/fields';
import { DefaultComponentProps } from '@measured/puck';

describe('puckToDBValue', () => {
  it("should update $xlg when breakpoint modes aren't enabled", () => {
    const databaseData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: {
                $xlg: 16,
                $sm: 14, // this will be removed from the DB as this field isn't enabled for breakpoints
              },
              text: {
                $xlg: '',
              },
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const changeData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: 15,
              text: 'Test',
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const result = puckToDBValue(databaseData as PuckPageData, changeData, 'xs', userConfig, {
      // simulate no breakpoint modes for all fields
    });

    expect(result).toBeDefined();
    expect(result?.root).toBeDefined();
    expect(result?.content).toBeDefined();
    expect(result?.content?.length).toBe(1);
    expect(result?.content?.[0].type).toBe('Field Test');
    expect(result?.content?.[0].props).toBeDefined();
    expect(result?.content?.[0].props?.options).toBeDefined();
    expect(result?.content?.[0].props?.options?.number).toBeDefined();
    expect(result?.content?.[0].props?.options?.text).toBeDefined();
    expect(result?.content?.[0].props?.options?.number).toEqual({
      $xlg: 15,
    });
    expect(result?.content?.[0].props?.options?.text).toEqual({
      $xlg: 'Test',
    });
  });

  it('should update leave original values when updating on a breakpoint enabled field', () => {
    const databaseData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: {
                $xlg: 16,
                $sm: 14,
              },
              text: {
                $xlg: '',
              },
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const changeData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: 15,
              text: 'Test',
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const result = puckToDBValue(databaseData as PuckPageData, changeData, 'xs', userConfig, {
      ['Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00']: {
        'options.number': true,
        'options.text': false, // text field is not enabled for breakpoints
      },
    });

    expect(result).toBeDefined();
    expect(result?.root).toBeDefined();
    expect(result?.content).toBeDefined();
    expect(result?.content?.length).toBe(1);
    expect(result?.content?.[0].type).toBe('Field Test');
    expect(result?.content?.[0].props).toBeDefined();
    expect(result?.content?.[0].props?.options).toBeDefined();
    expect(result?.content?.[0].props?.options?.number).toBeDefined();
    expect(result?.content?.[0].props?.options?.text).toBeDefined();
    expect(result?.content?.[0].props?.options?.number).toEqual({
      $xlg: 16,
      $sm: 14, // original value preserved because breakpoints enabled,
      $xs: 15, // current breakpoint value
    });
    expect(result?.content?.[0].props?.options?.text).toEqual({
      $xlg: 'Test',
    });
  });

  it('should also handle root prop fields', () => {
    const userConfig: CustomConfig = {
      components: {},
      categories: {
        '@hakit/test': {
          title: '@hakit/test',
          defaultExpanded: true,
          components: ['Field Test'],
        },
      },
      root: {
        label: 'Root',
        fields: {
          options: {
            type: 'object',
            label: 'Options',
            objectFields: {
              number: {
                type: 'number',
                label: 'Number Field',
                default: 16,
                min: 0,
                description: 'Number Field',
              },
              text: {
                type: 'text',
                label: 'Text Field',
                default: '',
                description: 'Text Field',
              },
            },
          },
        },
      },
    };
    const databaseData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: {
                $xlg: 16,
                $sm: 14,
              },
              nonExistent: {
                $xlg: 'This should be removed',
              },
              text: {
                $xlg: '',
              },
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const changeData: PuckPageData = {
      root: {
        props: {
          options: {
            number: 15,
            nonExistent: 'I should be gone',
            text: 'Test',
          },
        },
      },
      content: [],
      zones: {},
    };

    const result = puckToDBValue(databaseData as PuckPageData, changeData, 'xs', userConfig, {
      ['Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00']: {
        'options.number': true,
        'options.text': false, // text field is not enabled for breakpoints
      },
    });

    expect(result).toBeDefined();
    expect(result?.root).toBeDefined();
    expect(result?.root?.props).toBeDefined();
    expect(result?.root?.props?.options).toBeDefined();
    expect(result?.root?.props?.options?.number).toBeDefined();
    expect(result?.root?.props?.options?.text).toBeDefined();
    expect(result?.root?.props?.options?.number).toEqual({
      $xlg: 15, // current breakpoint value
    });
    expect(result?.root?.props?.options?.text).toEqual({
      $xlg: 'Test',
    });
    expect(result?.root?.props?.options?.nonExistent).toBeUndefined(); // should be removed
  });

  it('should strip database values and change data values if they do not exist in userConfig', () => {
    const databaseData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: {
                $xlg: 16,
              },
              nonExistent: {
                $xlg: 'This should be removed',
              },
              text: {
                $xlg: '',
              },
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const changeData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: 15,
              nonExistent: {
                $xlg: 'This should be removed',
              },
              text: 'Test',
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const result = puckToDBValue(databaseData as PuckPageData, changeData, 'xs', userConfig, {});

    expect(result).toBeDefined();
    expect(result?.root).toBeDefined();
    expect(result?.content).toBeDefined();
    expect(result?.content?.length).toBe(1);
    expect(result?.content?.[0].type).toBe('Field Test');
    expect(result?.content?.[0].props).toBeDefined();
    expect(result?.content?.[0].props?.options).toBeDefined();
    expect(result?.content?.[0].props?.options?.number).toBeDefined();
    expect(result?.content?.[0].props?.options?.text).toBeDefined();
    expect(result?.content?.[0].props?.options?.number).toEqual({
      $xlg: 15,
    });
    expect(result?.content?.[0].props?.options?.text).toEqual({
      $xlg: 'Test',
    });
    expect(result?.content?.[0].props?.options?.nonExistent).toBeUndefined(); // should be removed
  });

  test('should return originalData when changedData or userConfig is null', () => {
    const result = puckToDBValue(databaseData as PuckPageData, null, 'md', userConfig);
    expect(result).toBe(databaseData);

    const result2 = puckToDBValue(databaseData as PuckPageData, puckChangeData, 'md', undefined);
    expect(result2).toBe(databaseData);
  });

  test('should convert flattened data to breakpoint format for enabled fields', () => {
    const result = puckToDBValue(databaseData as PuckPageData, puckChangeData, 'md', userConfig, fieldsWithBreakpointsEnabled);

    expect(result).toBeDefined();
    expect(result?.content).toBeDefined();
    expect(result?.content?.[0]).toBeDefined();

    const component = result?.content?.[0];
    expect(component?.props).toBeDefined();

    // Check that options.text has breakpoints enabled
    expect(component?.props?.options?.text).toEqual({
      $xlg: '',
      $md: '',
    });

    // Check that options.number does NOT have breakpoints (not in breakpointModeMap)
    expect(component?.props?.options?.number).toEqual({
      $xlg: 16,
    });
  });

  test('should handle fields with responsiveMode: true with the mode map as false', () => {
    // Create a modified config where number field has responsiveMode: true
    const modifiedUserConfig: CustomConfig<{
      'Field Test': {
        options: {
          number: number;
        };
      };
    }> = {
      components: {
        'Field Test': {
          render() {
            return <></>;
          },
          label: 'Field Test',
          fields: {
            options: {
              type: 'object',
              label: 'Field Examples',
              objectFields: {
                number: {
                  type: 'number',
                  label: 'Number',
                  default: 16,
                  min: 0,
                  description: 'Number Field',
                  responsiveMode: true, // this field should not have breakpoints
                },
              },
            },
          },
        },
      },
    };

    const puckChangeData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: 24,
              text: '',
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const fieldsWithBreakpointsEnabled: ComponentBreakpointModeMap = {
      ['Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00']: {
        'options.text': true,
        'options.number': false, // even though number has responsiveMode: true, we still want to test it
        'options.deep.deepText': true,
      },
    };

    const result = puckToDBValue(databaseData as PuckPageData, puckChangeData, 'md', modifiedUserConfig, fieldsWithBreakpointsEnabled);

    const component = result?.content?.[0];
    // Number field should still be wrapped in $xlg even with responsiveMode: true
    expect(component?.props?.options?.number).toEqual({
      $xlg: 24,
    });
  });

  test('should handle fields with responsiveMode: true with the mode map as true', () => {
    // Create a modified config where number field has responsiveMode: true
    const modifiedUserConfig = {
      ...userConfig,
      components: {
        ...userConfig.components,
        'Field Test': {
          ...userConfig.components['Field Test'],
          fields: {
            ...userConfig.components['Field Test'].fields,
            options: {
              ...userConfig.components['Field Test'].fields.options,
              objectFields: {
                ...(userConfig.components['Field Test'].fields.options as CustomObjectField).objectFields!,
                number: {
                  ...(userConfig.components['Field Test'].fields.options as CustomObjectField).objectFields!.number,
                  responsiveMode: true,
                },
              },
            },
          },
        },
      },
    };

    const databaseData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: {
                $xlg: 16,
                $sm: 14,
              },
              text: {
                $xlg: '',
              },
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const puckChangeData: PuckPageData = {
      root: {
        props: {},
      },
      content: [
        {
          type: 'Field Test',
          props: {
            options: {
              number: 16,
              text: '',
            },
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
          },
        },
      ],
      zones: {},
    };

    const fieldsWithBreakpointsEnabled: ComponentBreakpointModeMap = {
      ['Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00']: {
        'options.text': true,
        'options.number': true, // even though number has responsiveMode: true, we still want to test it
        'options.deep.deepText': true,
      },
    };

    const result = puckToDBValue(databaseData as PuckPageData, puckChangeData, 'md', modifiedUserConfig, fieldsWithBreakpointsEnabled);

    const component = result?.content?.[0];
    // Number field should still be wrapped in $xlg even with responsiveMode: true
    expect(component?.props?.options?.number).toEqual({
      $xlg: 16,
      $sm: 14,
      $md: 16, // should also have md value
    });
  });

  test('should handle object and array field types (auto-disable breakpoints)', () => {
    // Create test data with array values
    const testPuckData = {
      ...puckChangeData,
      content: [
        {
          ...puckChangeData.content[0],
          props: {
            ...puckChangeData.content[0].props,
            options: {
              ...puckChangeData.content[0].props.options,
              deep: {
                deepText: 'test deep text',
                deepNumber: 42,
                deepArray: [{ id: '1', label: 'test item' }],
              },
              array: [{ id: '2', label: 'root array item' }],
            },
          },
        },
      ],
    };

    const result = puckToDBValue(databaseData as PuckPageData, testPuckData, 'md', userConfig, fieldsWithBreakpointsEnabled);

    const component = result?.content?.[0];

    // Object field (deep) should be processed recursively, not wrapped in breakpoints
    expect(component?.props?.options?.deep).toBeDefined();
    expect(component?.props?.options?.deep?.deepText).toEqual({
      $xlg: 'test deep text',
      $md: 'test deep text',
    });

    // Array fields should be wrapped in $xlg only
    expect(component?.props?.options?.array).toEqual({
      $xlg: [{ id: '2', label: 'root array item' }],
    });
  });

  test('should preserve existing breakpoint values from originalData', () => {
    const originalWithExistingBreakpoints = {
      ...databaseData,
      content: [
        {
          ...databaseData.content[0],
          props: {
            ...databaseData.content[0].props,
            options: {
              ...databaseData.content[0].props.options,
              text: {
                $xlg: 'original xlg',
                $sm: 'original sm',
                $lg: 'original lg',
              },
            },
          },
        },
      ],
    };

    const result = puckToDBValue(
      originalWithExistingBreakpoints as PuckPageData,
      puckChangeData,
      'md',
      userConfig,
      fieldsWithBreakpointsEnabled
    );

    const component = result?.content?.[0];

    // Should preserve existing breakpoint values and add the new md value
    expect(component?.props?.options?.text).toEqual({
      $xlg: 'original xlg',
      $sm: 'original sm',
      $lg: 'original lg',
      $md: '', // new value from changedData
    });
  });

  test('should ensure $xlg fallback when enabling breakpoints for the first time', () => {
    // Test case where field doesn't exist in originalData but has breakpoints enabled
    const minimalOriginalData = {
      root: { props: {} },
      content: [
        {
          type: 'Field Test',
          props: {
            id: 'Field Test-d60b055e-d02a-4ff0-b6b5-74c4d6c26a00',
            options: {
              number: { $xlg: 16 },
              // text field doesn't exist in original
            },
          },
        },
      ],
      zones: {},
    };

    const result = puckToDBValue(minimalOriginalData as PuckPageData, puckChangeData, 'sm', userConfig, fieldsWithBreakpointsEnabled);

    const component = result?.content?.[0];

    // Should create breakpoint object with $xlg fallback and current breakpoint
    expect(component?.props?.options?.text).toEqual({
      $xlg: '', // fallback value
      $sm: '', // current breakpoint value
    });
  });

  test('should handle different breakpoint sizes', () => {
    const breakpoints: BreakPoint[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xlg'];

    breakpoints.forEach(breakpoint => {
      const result = puckToDBValue(databaseData as PuckPageData, puckChangeData, breakpoint, userConfig, fieldsWithBreakpointsEnabled);

      const component = result?.content?.[0];

      // Should have the current breakpoint value set
      expect(component?.props?.options?.text).toEqual({
        $xlg: '',
        [`$${breakpoint}`]: '',
      });
    });
  });

  test('should handle nested object fields correctly', () => {
    const testPuckData = {
      ...puckChangeData,
      content: [
        {
          ...puckChangeData.content[0],
          props: {
            ...puckChangeData.content[0].props,
            options: {
              ...puckChangeData.content[0].props.options,
              deep: {
                deepText: 'nested text value',
                deepNumber: 999,
              },
            },
          },
        },
      ],
    };

    const result = puckToDBValue(databaseData as PuckPageData, testPuckData, 'lg', userConfig, fieldsWithBreakpointsEnabled);

    const component = result?.content?.[0];

    // deepText has breakpoints enabled in fieldsWithBreakpointsEnabled
    expect(component?.props?.options?.deep?.deepText).toEqual({
      $xlg: 'nested text value',
      $lg: 'nested text value',
    });

    // deepNumber does NOT have breakpoints enabled
    expect(component?.props?.options?.deep?.deepNumber).toEqual({
      $xlg: 999,
    });
  });

  test('should handle missing component configuration gracefully', () => {
    const unknownComponentData = {
      ...puckChangeData,
      content: [
        {
          type: 'Unknown Component',
          props: {
            id: 'unknown-id',
            someField: 'some value',
          },
        },
      ],
    };

    const result = puckToDBValue(databaseData as PuckPageData, unknownComponentData, 'md', userConfig, fieldsWithBreakpointsEnabled);

    // Should return the item unchanged if no component config found
    expect(result?.content?.[0]).toEqual(unknownComponentData.content[0]);
  });

  test('should handle empty breakpointModeMap', () => {
    const result = puckToDBValue(
      databaseData as PuckPageData,
      puckChangeData,
      'md',
      userConfig,
      {} // empty breakpoint mode map
    );

    const component = result?.content?.[0];

    // All fields should be wrapped in $xlg only (no breakpoints enabled)
    expect(component?.props?.options?.text).toEqual({
      $xlg: '',
    });

    expect(component?.props?.options?.number).toEqual({
      $xlg: 16,
    });
  });

  test('should handle root fields if they exist in userConfig', () => {
    // This test would need a userConfig with root fields defined
    // For now, just verify it doesn't crash with empty root fields
    const result = puckToDBValue(databaseData as PuckPageData, puckChangeData, 'md', userConfig, fieldsWithBreakpointsEnabled);

    expect(result?.root).toBeDefined();
    expect(result?.root?.props).toBeDefined();
  });

  test('should properly merge with originalData using mergeArrays: false', () => {
    const originalWithCustomData = {
      ...databaseData,
      customField: 'should be preserved',
      content: [
        {
          ...databaseData.content[0],
          customProp: 'should be preserved',
        },
      ],
    };

    const result = puckToDBValue(originalWithCustomData as PuckPageData, puckChangeData, 'md', userConfig, fieldsWithBreakpointsEnabled);

    // Should preserve custom fields from original data
    expect(result).toHaveProperty('customField', 'should be preserved');
    expect(result?.content?.[0]).toHaveProperty('customProp', 'should be preserved');
  });

  describe('root field processing', () => {
    const rootUserConfig: CustomConfig<
      DefaultComponentProps,
      {
        title: string;
        settings: {
          theme: string;
          count: number;
        };
        items: { name: string }[];
      }
    > = {
      components: {},
      categories: {},
      root: {
        label: 'Root',
        render() {
          return <></>;
        },
        fields: {
          title: {
            type: 'text',
            label: 'Title',
            default: '',
          },
          settings: {
            type: 'object',
            label: 'Settings',
            objectFields: {
              theme: {
                type: 'text',
                label: 'Theme',
                default: 'light',
              },
              count: {
                type: 'number',
                label: 'Count',
                default: 0,
                responsiveMode: true,
              },
            },
          },
          items: {
            type: 'array',
            label: 'Items',
            default: [],
            arrayFields: {
              name: {
                type: 'text',
                default: '',
                label: 'Name',
              },
            },
          },
        },
      },
    };

    test('should handle root fields with breakpoints disabled', () => {
      const originalData: PuckPageData = {
        root: { props: {} },
        content: [],
        zones: {},
      };

      const changedData: PuckPageData = {
        root: {
          props: {
            title: 'Test Title',
            settings: {
              theme: 'dark',
              count: 5,
            },
            items: [{ name: 'Item 1' }],
          },
        },
        content: [],
        zones: {},
      };

      const result = puckToDBValue(originalData, changedData, 'md', rootUserConfig as CustomConfig, {});

      expect(result?.root?.props?.title).toEqual({ $xlg: 'Test Title' });
      expect(result?.root?.props?.settings?.theme).toEqual({ $xlg: 'dark' });
      expect(result?.root?.props?.settings?.count).toEqual({ $xlg: 5 }); // responsiveMode: true
      expect(result?.root?.props?.items).toEqual({ $xlg: [{ name: 'Item 1' }] }); // arrays use $xlg
    });

    test('should handle root fields with breakpoints enabled', () => {
      const originalData: PuckPageData = {
        root: {
          props: {
            title: { $xlg: 'Original Title', $sm: 'Mobile Title' },
            settings: {
              theme: { $xlg: 'light' },
            },
          },
        },
        content: [],
        zones: {},
      };

      const changedData: PuckPageData = {
        root: {
          props: {
            title: 'Updated Title',
            settings: {
              theme: 'dark',
              count: 10,
            },
          },
        },
        content: [],
        zones: {},
      };

      const rootBreakpointMap: ComponentBreakpointModeMap = {
        root: {
          title: true,
          'settings.theme': true,
          'settings.count': false, // breakpoints disabled for this field
        },
      };

      const result = puckToDBValue(originalData, changedData, 'lg', rootUserConfig as CustomConfig, rootBreakpointMap);

      expect(result?.root?.props?.title).toEqual({
        $xlg: 'Original Title',
        $sm: 'Mobile Title',
        $lg: 'Updated Title', // new breakpoint value
      });

      expect(result?.root?.props?.settings?.theme).toEqual({
        $xlg: 'light',
        $lg: 'dark', // new breakpoint value
      });

      expect(result?.root?.props?.settings?.count).toEqual({
        $xlg: 10, // only $xlg since breakpoints disabled
      });
    });

    test('should strip invalid root fields not in userConfig', () => {
      const originalData: PuckPageData = {
        root: {
          props: {
            title: { $xlg: 'Valid Title' },
            invalidField: { $xlg: 'Should be removed' },
          },
        },
        content: [],
        zones: {},
      };

      const changedData: PuckPageData = {
        root: {
          props: {
            title: 'Updated Title',
            invalidField: 'Still should be removed',
            anotherInvalid: 'Also should be removed',
          },
        },
        content: [],
        zones: {},
      };

      const result = puckToDBValue(originalData, changedData, 'md', rootUserConfig as CustomConfig, {});

      expect(result?.root?.props?.title).toEqual({ $xlg: 'Updated Title' });
      expect(result?.root?.props?.invalidField).toBeUndefined();
      expect(result?.root?.props?.anotherInvalid).toBeUndefined();
    });

    test('should handle nested root object fields correctly', () => {
      const nestedRootConfig: CustomConfig<
        DefaultComponentProps,
        {
          layout: {
            header: {
              title: string;
              visible: boolean;
            };
            footer: string;
          };
        }
      > = {
        components: {},
        categories: {},
        root: {
          label: 'Root',
          fields: {
            layout: {
              type: 'object',
              label: 'Layout',
              objectFields: {
                header: {
                  type: 'object',
                  label: 'Header',
                  objectFields: {
                    title: {
                      default: '',
                      type: 'text',
                      label: 'Header Title',
                    },
                    visible: {
                      default: true,
                      type: 'radio',
                      label: 'Visible',
                      options: [
                        {
                          label: 'Yes',
                          value: true,
                        },
                      ],
                    },
                  },
                },
                footer: {
                  default: '',
                  type: 'text',
                  label: 'Footer Text',
                },
              },
            },
          },
        },
      };

      const changedData: PuckPageData = {
        root: {
          props: {
            layout: {
              header: {
                title: 'My Site',
                visible: true,
              },
              footer: 'Copyright 2025',
            },
          },
        },
        content: [],
        zones: {},
      };

      const result = puckToDBValue(null, changedData, 'sm', nestedRootConfig as CustomConfig, {
        root: {
          'layout.header.title': true, // breakpoints enabled
          'layout.footer': false, // breakpoints disabled
        },
      });

      expect(result?.root?.props?.layout?.header?.title).toEqual({
        $xlg: 'My Site',
        $sm: 'My Site',
      });
      expect(result?.root?.props?.layout?.header?.visible).toEqual({
        $xlg: true,
      });
      expect(result?.root?.props?.layout?.footer).toEqual({
        $xlg: 'Copyright 2025',
      });
    });

    test('should preserve existing root breakpoint values', () => {
      const originalData: PuckPageData = {
        root: {
          props: {
            title: {
              $xlg: 'Desktop Title',
              $md: 'Tablet Title',
              $xs: 'Mobile Title',
            },
          },
        },
        content: [],
        zones: {},
      };

      const changedData: PuckPageData = {
        root: {
          props: {
            title: 'New Small Title',
          },
        },
        content: [],
        zones: {},
      };

      const result = puckToDBValue(originalData, changedData, 'sm', rootUserConfig as CustomConfig, {
        root: { title: true },
      });

      expect(result?.root?.props?.title).toEqual({
        $xlg: 'Desktop Title',
        $md: 'Tablet Title',
        $xs: 'Mobile Title',
        $sm: 'New Small Title', // new value added
      });
    });
  });
});
