import { describe, test, expect } from 'bun:test';
import { trimPuckDataToConfig } from './trimPuckDataToConfig';
import { PuckPageData } from '@typings/puck';

describe('trimPuckDataToConfig', () => {
  describe('basic functionality', () => {
    test('should return null when data is null', () => {
      const userConfig = {
        components: {},
      };

      const result = trimPuckDataToConfig(null, userConfig);
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

      const userConfig = {
        components: {},
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result).toEqual({
        root: { props: {} },
        content: [],
        zones: { main: [] },
      });
    });
  });

  describe('component field trimming', () => {
    test('should only keep fields that are defined in component config', () => {
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'TestComponent',
            props: {
              validField: 'keep this',
              anotherValidField: 'keep this too',
              invalidField: 'remove this',
            },
          },
        ],
        zones: {},
      };

      const userConfig = {
        components: {
          TestComponent: {
            fields: {
              validField: {
                type: 'text',
                label: 'Valid Field',
                default: '',
              },
              anotherValidField: {
                type: 'text',
                label: 'Another Valid Field',
                default: '',
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result?.content[0].props).toEqual({
        validField: 'keep this',
        anotherValidField: 'keep this too',
      });
    });

    test('should remove entire component if no config exists for component type', () => {
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'ValidComponent',
            props: { text: 'Hello' },
          },
          {
            type: 'InvalidComponent',
            props: { text: 'World' },
          },
        ],
        zones: {},
      };

      const userConfig = {
        components: {
          ValidComponent: {
            fields: {
              text: {
                type: 'text',
                label: 'Text',
                default: '',
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result?.content).toHaveLength(1);
      expect(result?.content[0].type).toBe('ValidComponent');
    });

    test('should remove component if config exists but has no fields', () => {
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'NoFieldsComponent',
            props: { text: 'Hello' },
          },
        ],
        zones: {},
      };

      const userConfig = {
        components: {
          NoFieldsComponent: {},
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result?.content).toHaveLength(0);
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

      const userConfig = {
        components: {},
        root: {
          fields: {
            title: {
              type: 'text',
              label: 'Title',
              default: '',
            },
            subtitle: {
              type: 'text',
              label: 'Subtitle',
              default: '',
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

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

      const userConfig = {
        components: {},
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result?.root?.props).toEqual({});
    });
  });

  describe('nested object field trimming', () => {
    test('should recursively trim object fields', () => {
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'NestedComponent',
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

      const userConfig = {
        components: {
          NestedComponent: {
            fields: {
              settings: {
                type: 'object',
                label: 'Settings',
                default: {},
                objectFields: {
                  name: {
                    type: 'text',
                    label: 'Name',
                    default: '',
                  },
                  value: {
                    type: 'number',
                    label: 'Value',
                    default: 0,
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result?.content[0].props).toEqual({
        settings: {
          name: 'valid name',
          value: 42,
        },
      });
    });

    test('should handle deeply nested object fields', () => {
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'DeepNestedComponent',
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

      const userConfig = {
        components: {
          DeepNestedComponent: {
            fields: {
              config: {
                type: 'object',
                label: 'Config',
                default: {},
                objectFields: {
                  ui: {
                    type: 'object',
                    label: 'UI',
                    default: {},
                    objectFields: {
                      theme: {
                        type: 'text',
                        label: 'Theme',
                        default: '',
                      },
                      colors: {
                        type: 'object',
                        label: 'Colors',
                        default: {},
                        objectFields: {
                          primary: {
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
      };

      const result = trimPuckDataToConfig(data, userConfig);

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
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'TestComponent',
            props: {
              definedField: 'value',
              undefinedField: undefined,
            },
          },
        ],
        zones: {},
      };

      const userConfig = {
        components: {
          TestComponent: {
            fields: {
              definedField: {
                type: 'text',
                label: 'Defined Field',
                default: '',
              },
              undefinedField: {
                type: 'text',
                label: 'Undefined Field',
                default: '',
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result?.content[0].props).toEqual({
        definedField: 'value',
      });
    });

    test('should handle null object values', () => {
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'TestComponent',
            props: {
              settings: null,
            },
          },
        ],
        zones: {},
      };

      const userConfig = {
        components: {
          TestComponent: {
            fields: {
              settings: {
                type: 'object',
                label: 'Settings',
                default: {},
                objectFields: {
                  name: {
                    type: 'text',
                    label: 'Name',
                    default: '',
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result?.content[0].props).toEqual({});
    });

    test('should handle non-object values for object fields', () => {
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'TestComponent',
            props: {
              settings: 'not an object',
            },
          },
        ],
        zones: {},
      };

      const userConfig = {
        components: {
          TestComponent: {
            fields: {
              settings: {
                type: 'object',
                label: 'Settings',
                default: {},
                objectFields: {
                  name: {
                    type: 'text',
                    label: 'Name',
                    default: '',
                  },
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result?.content[0].props).toEqual({});
    });

    test('should preserve arrays and other non-object types', () => {
      const data: PuckPageData = {
        root: { props: {} },
        content: [
          {
            type: 'TestComponent',
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

      const userConfig = {
        components: {
          TestComponent: {
            fields: {
              textField: {
                type: 'text',
                label: 'Text',
                default: '',
              },
              numberField: {
                type: 'number',
                label: 'Number',
                default: 0,
              },
              booleanField: {
                type: 'text', // Using text type for simplicity
                label: 'Boolean',
                default: false,
              },
              arrayField: {
                type: 'text', // Using text type for simplicity
                label: 'Array',
                default: [],
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

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

      const userConfig = {
        components: {},
      };

      const result = trimPuckDataToConfig(data, userConfig);

      expect(result).toBeTruthy();
      if (result && data.zones) {
        expect(result.zones).toEqual(data.zones);
      }
    });
  });

  describe('complex real-world scenarios', () => {
    test('should handle a mix of valid and invalid data across components and root', () => {
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

      const userConfig = {
        components: {
          Header: {
            fields: {
              title: {
                type: 'text',
                label: 'Title',
                default: '',
              },
              subtitle: {
                type: 'text',
                label: 'Subtitle',
                default: '',
              },
            },
          },
          Footer: {
            fields: {
              copyright: {
                type: 'text',
                label: 'Copyright',
                default: '',
              },
              links: {
                type: 'object',
                label: 'Links',
                default: {},
                objectFields: {
                  home: {
                    type: 'text',
                    label: 'Home URL',
                    default: '',
                  },
                  about: {
                    type: 'text',
                    label: 'About URL',
                    default: '',
                  },
                },
              },
            },
          },
        },
        root: {
          fields: {
            pageTitle: {
              type: 'text',
              label: 'Page Title',
              default: '',
            },
            pageSettings: {
              type: 'object',
              label: 'Page Settings',
              default: {},
              objectFields: {
                theme: {
                  type: 'text',
                  label: 'Theme',
                  default: '',
                },
              },
            },
          },
        },
      };

      const result = trimPuckDataToConfig(data, userConfig);

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
});
