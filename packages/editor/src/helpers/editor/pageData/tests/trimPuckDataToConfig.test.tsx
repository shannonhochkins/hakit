import { describe, test, expect } from 'bun:test';
import { trimPuckDataToConfig } from '../trimPuckDataToConfig';
import { CustomConfigWithDefinition, PuckPageData } from '@typings/puck';
import { DefaultComponentProps } from '@measured/puck';

describe('trimPuckDataToConfig', () => {
  describe('basic functionality', () => {
    test('should return null when data is null', () => {
      const userConfig = {
        components: {},
      };

      const result = trimPuckDataToConfig(null, userConfig as CustomConfigWithDefinition);
      expect(result).toBeNull();
    });

    test('should return data unchanged when userConfig is undefined', () => {
      const data: PuckPageData = {
        root: { props: { title: 'Test' } },
        content: [],
        zones: {},
      };

      const result = trimPuckDataToConfig(data, undefined);
      expect(result).toEqual(data);
    });

    test('should return empty structure when userConfig has no components or root fields', () => {
      const data: PuckPageData = {
        root: { props: { title: 'Test', invalid: 'field' } },
        content: [
          {
            type: 'TestComponent',
            props: { text: 'Hello', number: 42 },
          },
        ],
        zones: { main: [] },
      };

      const userConfig: CustomConfigWithDefinition = {
        components: {},
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result).toEqual({
        root: { props: {} },
        content: [],
        zones: { main: [] },
      });
    });
  });

  describe('component field trimming', () => {
    test('should strip _activeBreakpoint which is an internal field from the trimmed data even if defined as a field', () => {
      const componentName = 'TestComponent' as const;
      const data: PuckPageData = {
        root: {
          props: {
            _activeBreakpoint: {
              $xlg: 'xlg',
            },
          },
        },
        content: [
          {
            type: componentName,
            props: {
              options: {
                $xlg: {
                  pages: [],
                  hideClock: false,
                },
              },
              validField: {
                $xlg: 'valid value',
              },
              clockOptions: {
                xlg: {
                  hideTime: false,
                  useTimeEntity: true,
                  timeEntity: 'sensor.time',
                  timeFormat: 'hh:mm a',
                  throttleTime: 1000,
                  hideDate: true,
                  useDateEntity: true,
                  dateEntity: 'sensor.date',
                  dateFormat: 'dddd, MMMM DD YYYY',
                  hideIcon: true,
                  icon: 'mdi:calendar',
                },
              },
              id: `${componentName}-61ed4f08-37ce-41d2-90b8-fecd4583bd5a`,
              _activeBreakpoint: {
                $xlg: 'xlg',
              },
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          validField: string;
          _activeBreakpoint: string;
          anotherValidField: string;
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              _activeBreakpoint: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: '_activeBreakpoint',
                  default: '',
                },
              },
              validField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Valid Field',
                  default: '',
                },
              },
              anotherValidField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Another Valid Field',
                  default: '',
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);
      expect(result?.content[0].props).toEqual({
        id: `${componentName}-61ed4f08-37ce-41d2-90b8-fecd4583bd5a`,
        validField: {
          $xlg: 'valid value',
        },
      });
    });
    test('should only keep fields that are defined in component config', () => {
      const componentName = 'TestComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              validField: 'keep this',
              anotherValidField: 'keep this too',
              invalidField: 'remove this',
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          validField: string;
          anotherValidField: string;
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              validField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Valid Field',
                  default: '',
                },
              },
              anotherValidField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Another Valid Field',
                  default: '',
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content[0].props).toEqual({
        validField: 'keep this',
        anotherValidField: 'keep this too',
      });
    });

    test('should remove entire component if no config exists for component type', () => {
      const validComponent = 'ValidComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: validComponent,
            props: { text: 'Hello' },
          },
          {
            type: 'InvalidComponent',
            props: { text: 'World' },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [validComponent]: {
          text: string;
        };
      }> = {
        components: {
          [validComponent]: {
            render() {
              return <></>;
            },
            label: validComponent,
            fields: {
              text: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Text',
                  default: '',
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content).toHaveLength(1);
      expect(result?.content[0].type).toBe('ValidComponent');
    });

    test('should not remove component if config exists but has no fields, instead field values should be removed', () => {
      const noFieldsComponent = 'NoFieldsComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: noFieldsComponent,
            props: { text: 'Hello' },
          },
        ],
        zones: {},
      };
      const userConfig: CustomConfigWithDefinition<{
        [noFieldsComponent]: Record<string, never>;
      }> = {
        components: {
          [noFieldsComponent]: {
            render() {
              return <></>;
            },
            label: noFieldsComponent,
            fields: {},
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content).toHaveLength(1);
      expect(result?.content[0].type).toBe('NoFieldsComponent');
      expect(result?.content[0].props).toEqual({});
    });

    test('should always preserve id field even if not defined in component config', () => {
      const componentName = 'TestComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              id: 'test-component-123',
              validField: 'keep this',
              invalidField: 'remove this',
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          validField: string;
          // Note: id is NOT defined in the config
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              validField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Valid Field',
                  default: '',
                },
              },
              // Note: id field is NOT defined here
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content[0].props).toEqual({
        id: 'test-component-123', // Should be preserved even though not in config
        validField: 'keep this',
      });
    });

    test('should preserve top-level id but trim nested id fields when not in config', () => {
      const componentName = 'TestComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              id: 'test-component-123',
              settings: {
                id: 'nested-id-should-be-removed',
                theme: 'dark',
                validSetting: 'keep this',
              },
              items: [
                {
                  id: 'item-id-should-be-removed',
                  name: 'Item 1',
                  validField: 'keep this',
                },
              ],
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          settings: {
            theme: string;
            validSetting: string;
            // Note: no id field defined in settings
          };
          items: Array<{
            name: string;
            validField: string;
            // Note: no id field defined in items
          }>;
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              settings: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'object',
                  label: 'Settings',
                  objectFields: {
                    theme: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Theme',
                        default: '',
                      },
                    },
                    validSetting: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Valid Setting',
                        default: '',
                      },
                    },
                  },
                },
              },
              items: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'array',
                  label: 'Items',
                  default: [],
                  arrayFields: {
                    name: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Name',
                        default: '',
                      },
                    },
                    validField: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Valid Field',
                        default: '',
                      },
                    },
                    // Note: no id field defined here
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content[0].props).toEqual({
        id: 'test-component-123', // Top-level id should be preserved
        settings: {
          theme: 'dark',
          validSetting: 'keep this',
          // nested id should be removed
        },
        items: [
          {
            name: 'Item 1',
            validField: 'keep this',
            // nested id should be removed
          },
        ],
      });
    });
  });

  describe('root field trimming', () => {
    test('should only keep root fields that are defined in root config', () => {
      const data: PuckPageData = {
        root: {
          props: {
            title: 'Keep this title',
            subtitle: 'Keep this subtitle',
            invalidRootField: 'Remove this',
          },
        },
        content: [],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition = {
        components: {},
        root: {
          render() {
            return <></>;
          },
          label: 'Root',
          fields: {
            title: {
              _field: {
                type: 'text',
                label: 'Title',
                default: '',
              },
              type: 'custom',
              render: () => <></>,
            },
            subtitle: {
              _field: {
                type: 'text',
                label: 'Subtitle',
                default: '',
              },
              type: 'custom',
              render: () => <></>,
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.root?.props).toEqual({
        title: 'Keep this title',
        subtitle: 'Keep this subtitle',
      });
    });

    test('should handle empty root props when no root fields configured', () => {
      const data: PuckPageData = {
        root: {
          props: {
            someField: 'value',
          },
        },
        content: [],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition = {
        components: {},
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.root?.props).toEqual({});
    });
  });

  describe('nested object field trimming', () => {
    test('should recursively trim object fields', () => {
      const nestedComponent = 'NestedComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: nestedComponent,
            props: {
              settings: {
                name: 'valid name',
                value: 42,
                invalid: 'should be removed',
              },
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [nestedComponent]: {
          settings: {
            name: string;
            value: number;
          };
        };
      }> = {
        components: {
          [nestedComponent]: {
            render() {
              return <></>;
            },
            label: nestedComponent,
            fields: {
              settings: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'object',
                  label: 'Settings',
                  objectFields: {
                    name: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Name',
                        default: '',
                      },
                    },
                    value: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'number',
                        label: 'Value',
                        default: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content[0].props).toEqual({
        settings: {
          name: 'valid name',
          value: 42,
        },
      });
    });

    test('should handle deeply nested object fields', () => {
      const componentName = 'DeepNestedComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              config: {
                ui: {
                  theme: 'dark',
                  colors: {
                    primary: '#ff0000',
                    invalid: 'remove this',
                  },
                },
              },
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          config: {
            ui: {
              theme: string;
              colors: {
                primary: string;
              };
            };
          };
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              config: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'object',
                  label: 'Config',
                  objectFields: {
                    ui: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'object',
                        label: 'UI',
                        objectFields: {
                          theme: {
                            type: 'custom',
                            render: () => <></>,
                            _field: {
                              type: 'text',
                              label: 'Theme',
                              default: '',
                            },
                          },
                          colors: {
                            type: 'custom',
                            render: () => <></>,
                            _field: {
                              type: 'object',
                              label: 'Colors',
                              objectFields: {
                                primary: {
                                  type: 'custom',
                                  render: () => <></>,
                                  _field: {
                                    type: 'text',
                                    label: 'Primary Color',
                                    default: '',
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
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content[0].props).toEqual({
        config: {
          ui: {
            theme: 'dark',
            colors: {
              primary: '#ff0000',
            },
          },
        },
      });
    });
  });

  describe('edge cases', () => {
    test('should handle undefined values gracefully', () => {
      const componentName = 'TestComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              definedField: 'value',
              undefinedField: undefined,
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          definedField: string;
          undefinedField?: string; // Optional to allow undefined
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              definedField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Defined Field',
                  default: '',
                },
              },
              undefinedField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Undefined Field',
                  default: '',
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content[0].props).toEqual({
        definedField: 'value',
      });
    });

    test('should handle null object values', () => {
      const componentName = 'TestComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              settings: null,
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          settings: {
            name: string;
          };
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              settings: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'object',
                  label: 'Settings',
                  objectFields: {
                    name: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Name',
                        default: '',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content[0].props).toEqual({});
    });

    test('should handle non-object values for object fields', () => {
      const componentName = 'TestComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              settings: 'not an object',
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          settings: {
            name: string;
          };
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: 'TestComponent',
            fields: {
              settings: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'object',
                  label: 'Settings',
                  objectFields: {
                    name: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Name',
                        default: '',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content[0].props).toEqual({});
    });

    test('should preserve arrays and other non-object types', () => {
      const componentName = 'TestComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              textField: 'text value',
              numberField: 42,
              booleanField: true,
              arrayField: [1, 2, 3],
              invalidField: 'remove this',
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          textField: string;
          numberField: number;
          booleanField: boolean;
          arrayField: {
            number: number;
          }[];
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              textField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Text',
                  default: '',
                },
              },
              numberField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'number',
                  label: 'Number',
                  default: 0,
                },
              },
              booleanField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text', // Using text type for simplicity
                  label: 'Boolean',
                  default: false,
                },
              },
              arrayField: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'array',
                  label: 'Array Field',
                  default: [],
                  arrayFields: {
                    number: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'number',
                        label: 'Number',
                        default: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result?.content[0].props).toEqual({
        textField: 'text value',
        numberField: 42,
        booleanField: true,
        arrayField: [1, 2, 3],
      });
    });

    test('should preserve zones unchanged', () => {
      const data: PuckPageData = {
        root: { props: {} },
        content: [],
        zones: {
          main: [
            {
              type: 'SomeComponent',
              props: { field: 'value' },
            },
          ],
          sidebar: [
            {
              type: 'AnotherComponent',
              props: { anotherField: 'another value' },
            },
          ],
        },
      };

      const userConfig: CustomConfigWithDefinition = {
        components: {},
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result).toBeTruthy();
      if (result && data.zones) {
        expect(result.zones).toEqual(data.zones);
      }
    });

    test('should recursively trim array fields when arrayFields are defined', () => {
      const componentName = 'ArrayFieldComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              items: [
                {
                  id: 'item1',
                  name: 'Item 1',
                  invalidField: 'should be removed', // This should be stripped
                },
                {
                  id: 'item2',
                  name: 'Item 2',
                  anotherInvalidField: 'should be removed too',
                },
              ],
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          items: Array<{
            id: string;
            name: string;
            // Note: no invalidField or anotherInvalidField defined
          }>;
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              items: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'array',
                  label: 'Items',
                  default: [],
                  arrayFields: {
                    id: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'ID',
                        default: '',
                      },
                    },
                    name: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Name',
                        default: '',
                      },
                    },
                    // Note: invalidField and anotherInvalidField are NOT defined here
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      // Array fields should be recursively trimmed when arrayFields are defined
      // Invalid fields inside array items should be stripped
      expect(result?.content[0].props).toEqual({
        items: [
          {
            id: 'item1',
            name: 'Item 1',
            // invalidField should be stripped
          },
          {
            id: 'item2',
            name: 'Item 2',
            // anotherInvalidField should be stripped
          },
        ],
      });
    });

    test('should treat arrays without arrayFields as atomic values', () => {
      const componentName = 'AtomicArrayComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              rawData: [
                {
                  id: 'item1',
                  name: 'Item 1',
                  invalidField: 'should remain', // This should NOT be stripped
                },
                {
                  id: 'item2',
                  name: 'Item 2',
                  anotherInvalidField: 'should also remain',
                },
              ],
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          rawData: Array<{
            id: string;
            name: string;
            // Note: no invalidField or anotherInvalidField defined
          }>;
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              rawData: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'array',
                  label: 'Raw Data',
                  default: [],
                  arrayFields: {
                    id: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'ID',
                        default: '',
                      },
                    },
                    name: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Name',
                        default: '',
                      },
                    },
                    // Note: invalidField and anotherInvalidField are NOT defined here
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      // Array fields without arrayFields should be preserved as-is
      expect(result?.content[0].props).toEqual({
        rawData: [
          {
            id: 'item1',
            name: 'Item 1',
          },
          {
            id: 'item2',
            name: 'Item 2',
          },
        ],
      });
    });
  });

  describe('complex real-world scenarios', () => {
    test('should handle a mix of valid and invalid data across components and root', () => {
      const Header = 'Header' as const;
      const Footer = 'Footer' as const;

      const data: PuckPageData = {
        root: {
          props: {
            pageTitle: 'Valid Page Title',
            pageSettings: {
              theme: 'dark',
              invalidSetting: 'remove this',
            },
            invalidRootField: 'remove this too',
          },
        },
        content: [
          {
            type: 'Header',
            props: {
              title: 'Valid Header',
              subtitle: 'Valid Subtitle',
              invalidHeaderField: 'remove this',
            },
          },
          {
            type: 'InvalidComponent',
            props: {
              someField: 'this whole component should be removed',
            },
          },
          {
            type: 'Footer',
            props: {
              copyright: 'Valid Copyright',
              links: {
                home: '/home',
                about: '/about',
                invalidLink: '/invalid',
              },
            },
          },
        ],
        zones: {
          main: [
            {
              type: 'Content',
              props: { text: 'Zone content should be preserved' },
            },
          ],
        },
      };

      const userConfig: CustomConfigWithDefinition<{
        [Header]: {
          title: string;
          subtitle: string;
        };
        [Footer]: {
          copyright: string;
          links: {
            home: string;
            about: string;
          };
        };
      }> = {
        components: {
          [Header]: {
            render() {
              return <></>;
            },
            label: Header,
            fields: {
              title: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Title',
                  default: '',
                },
              },
              subtitle: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Subtitle',
                  default: '',
                },
              },
            },
          },
          [Footer]: {
            render() {
              return <></>;
            },
            label: Footer,
            fields: {
              copyright: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'text',
                  label: 'Copyright',
                  default: '',
                },
              },
              links: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'object',
                  label: 'Links',
                  objectFields: {
                    home: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Home URL',
                        default: '',
                      },
                    },
                    about: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'About URL',
                        default: '',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        root: {
          render() {
            return <></>;
          },
          label: 'Root',
          fields: {
            pageTitle: {
              type: 'custom',
              render: () => <></>,
              _field: {
                type: 'text',
                label: 'Page Title',
                default: '',
              },
            },
            pageSettings: {
              type: 'custom',
              render: () => <></>,
              _field: {
                type: 'object',
                label: 'Page Settings',
                objectFields: {
                  theme: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'text',
                      label: 'Theme',
                      default: '',
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      expect(result).toEqual({
        root: {
          props: {
            pageTitle: 'Valid Page Title',
            pageSettings: {
              theme: 'dark',
            },
          },
        },
        content: [
          {
            type: 'Header',
            props: {
              title: 'Valid Header',
              subtitle: 'Valid Subtitle',
            },
          },
          {
            type: 'Footer',
            props: {
              copyright: 'Valid Copyright',
              links: {
                home: '/home',
                about: '/about',
              },
            },
          },
        ],
        zones: {
          main: [
            {
              type: 'Content',
              props: { text: 'Zone content should be preserved' },
            },
          ],
        },
      });
    });
  });

  describe('advanced nesting scenarios', () => {
    test('should handle nested objects within arrays', () => {
      const componentName = 'NestedArrayComponent' as const;
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: componentName,
            props: {
              sections: [
                {
                  title: 'Section 1',
                  config: {
                    enabled: true,
                    settings: {
                      theme: 'dark',
                      invalidSetting: 'should be removed',
                    },
                  },
                  invalidField: 'should be removed',
                },
                {
                  title: 'Section 2',
                  config: {
                    enabled: false,
                    settings: {
                      theme: 'light',
                      anotherInvalidSetting: 'should be removed too',
                    },
                  },
                },
              ],
            },
          },
        ],
        zones: {},
      };

      const userConfig: CustomConfigWithDefinition<{
        [componentName]: {
          sections: Array<{
            title: string;
            config: {
              enabled: boolean;
              settings: {
                theme: string;
              };
            };
          }>;
        };
      }> = {
        components: {
          [componentName]: {
            render() {
              return <></>;
            },
            label: componentName,
            fields: {
              sections: {
                type: 'custom',
                render: () => <></>,
                _field: {
                  type: 'array',
                  label: 'Sections',
                  default: [],
                  arrayFields: {
                    title: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'text',
                        label: 'Title',
                        default: '',
                      },
                    },
                    config: {
                      type: 'custom',
                      render: () => <></>,
                      _field: {
                        type: 'object',
                        label: 'Config',
                        objectFields: {
                          enabled: {
                            type: 'custom',
                            render: () => <></>,
                            _field: {
                              type: 'select',
                              label: 'Enabled',
                              default: false,
                              options: [
                                { value: true, label: 'Yes' },
                                { value: false, label: 'No' },
                              ],
                            },
                          },
                          settings: {
                            type: 'custom',
                            render: () => <></>,
                            _field: {
                              type: 'object',
                              label: 'Settings',
                              objectFields: {
                                theme: {
                                  type: 'custom',
                                  render: () => <></>,
                                  _field: {
                                    type: 'text',
                                    label: 'Theme',
                                    default: 'light',
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
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig as CustomConfigWithDefinition);

      // Nested objects within arrays should be recursively trimmed
      expect(result?.content[0].props).toEqual({
        sections: [
          {
            title: 'Section 1',
            config: {
              enabled: true,
              settings: {
                theme: 'dark',
                // invalidSetting should be stripped
              },
            },
            // invalidField should be stripped
          },
          {
            title: 'Section 2',
            config: {
              enabled: false,
              settings: {
                theme: 'light',
                // anotherInvalidSetting should be stripped
              },
            },
          },
        ],
      });
    });
  });

  test('should not remove properties when everything exists in userConfig', () => {
    const originalData: PuckPageData = {
      root: {
        props: {
          test: {
            background: {
              backgroundImage: {
                $xlg: undefined,
              },
            },
          },
        },
      },
      content: [],
      zones: {},
    };

    const rootUserConfig: CustomConfigWithDefinition<
      DefaultComponentProps,
      {
        test: {
          background: {
            backgroundImage: string;
          };
        };
      }
    > = {
      components: {},
      categories: {},
      root: {
        label: 'Root',
        fields: {
          test: {
            type: 'custom',
            render: () => <></>,
            _field: {
              type: 'object',
              label: 'Test Object',
              objectFields: {
                background: {
                  type: 'custom',
                  render: () => <></>,
                  _field: {
                    type: 'object',
                    label: 'Background',
                    objectFields: {
                      backgroundImage: {
                        type: 'custom',
                        render: () => <></>,
                        _field: { type: 'text', label: 'Background Image', default: '' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const puckValue = trimPuckDataToConfig(originalData as PuckPageData, rootUserConfig as CustomConfigWithDefinition);
    expect(puckValue).toEqual(originalData);
  });
});
