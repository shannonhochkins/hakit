import { expect, test, describe } from 'bun:test';
import { transformProps, transformFields, getDefaultPropsFromFields, multipleBreakpointsEnabled, wrapDefaults } from '.';
import { type CustomComponentConfig } from '../createComponent';
import { DefaultComponentProps } from '@measured/puck';

describe('breakpoints', () => {
  describe('transformProps', () => {
    test(`should ignore internal props, even if they're the shape we're expecting`, () => {
      const input = {
        id: {
          xlg: 'id-sm',
        },
      };
      expect(transformProps(input, 'xlg')).toEqual(input);
    });

    test(`should flatten breakpoint object when active breakpoint value exists`, () => {
      const input = {
        options: {
          direction: {
            sm: 'row',
            xlg: 'column',
          },
        },
      };
      expect(transformProps(input, 'xlg')).toEqual({
        options: {
          direction: 'column',
        },
      });
    });

    test(`should revert to xlg if no breakpoint definitions found between the active breakpoint`, () => {
      const input = {
        options: {
          direction: {
            xlg: 'column',
          },
        },
      };
      expect(transformProps(input, 'xxs')).toEqual({
        options: {
          direction: 'column',
        },
      });
    });

    test('should revert to next breakpoint if active breakpoint value does not exist', () => {
      const input = {
        options: {
          direction: {
            sm: 'row',
            md: 'column-reverse',
            xlg: 'column',
          },
          gap: {
            md: 20,
            xlg: 100,
          },
        },
      };
      expect(transformProps(input, 'xxs')).toEqual({
        options: {
          direction: 'row',
          gap: 20,
        },
      });
    });

    test('should process recursively nested breakpoint objects', () => {
      const input = {
        options: {
          sm: {
            direction: {
              sm: 'row',
              xlg: 'column',
            },
          },
          xlg: {
            direction: {
              sm: 'row',
              xlg: 'column',
            },
          },
        },
      };
      expect(transformProps(input, 'xlg')).toEqual({
        options: {
          direction: 'column',
        },
      });
      expect(transformProps(input, 'sm')).toEqual({
        options: {
          direction: 'row',
        },
      });
    });

    test('it should handle array with object breakpoint definitions', () => {
      const input = {
        options: [
          {
            direction: {
              sm: 'row',
              xlg: 'column',
            },
          },
          {
            direction: {
              sm: 'row',
              xlg: 'column',
            },
          },
        ],
      };
      expect(transformProps(input, 'xlg')).toEqual({
        options: [
          {
            direction: 'column',
          },
          {
            direction: 'column',
          },
        ],
      });
    });

    test('it should handle array without breakpoint definitions', () => {
      const input = {
        options: [
          {
            direction: 'row',
          },
          {
            direction: 'column',
          },
        ],
      };
      expect(transformProps(input, 'xlg')).toEqual({
        options: [
          {
            direction: 'row',
          },
          {
            direction: 'column',
          },
        ],
      });
    });
  });

  describe('multipleBreakpointsEnabled', () => {
    test('should return false if multiple breakpoints are enabled, even if there is a definition nested', () => {
      const input = {
        options: {
          direction: {
            sm: 'row',
            xlg: 'column',
          },
        },
      };
      expect(multipleBreakpointsEnabled(input)).toBe(false);
    });
    test('should return true if multiple breakpoints are enabled', () => {
      const input = {
        sm: 100,
        xlg: 100,
      };
      expect(multipleBreakpointsEnabled(input)).toBe(true);
    });

    test('should return false if only one breakpoint is defined', () => {
      const input = {
        xlg: 100,
      };
      expect(multipleBreakpointsEnabled(input)).toBe(false);
    });
  });

  describe('wrapDefaults', () => {
    test('it should not return an empty object when default value is undefined or empty', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          entity: {
            type: 'entity',
            options(data) {
              return [data.entities['sun.sun']];
            },
            default() {
              return undefined;
            },
            label: 'Entity',
          },
        },
        render() {
          return <></>;
        },
      };
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {},
        services: {},
      });
      expect(defaultProps).toEqual({
        entity: undefined,
      });
      expect(wrapDefaults(transformFields(config.fields), defaultProps)).toEqual({
        entity: undefined,
      });
    });

    test('it should process default function for type entity', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          entity: {
            type: 'entity',
            options(data) {
              return [data.entities['sun.sun']];
            },
            disableBreakpoints: true,
            default(_options, { entities }) {
              return entities['sun.sun'].entity_id;
            },
            label: 'Entity',
          },
        },
        render() {
          return <></>;
        },
      };
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {
          'sun.sun': {
            entity_id: 'sun.sun',
            state: 'above_horizon',
            attributes: {},
            last_changed: '2021-09-25T10:00:00+00:00',
            last_updated: '2021-09-25T10:00:00+00:00',
            context: {
              id: 'string',
              user_id: null,
              parent_id: null,
            },
          }
        },
        services: {},
      });
      expect(defaultProps).toEqual({
        entity: 'sun.sun',
      });
      expect(wrapDefaults(transformFields(config.fields), defaultProps)).toEqual({
        entity: 'sun.sun',
      });
    });

    test('it should process default function for type entity with breakpoints', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          entity: {
            type: 'entity',
            disableBreakpoints: false,
            options(data) {
              return [data.entities['sun.sun']];
            },
            default(_options, { entities }) {
              return entities['sun.sun'].entity_id;
            },
            label: 'Entity',
          },
        },
        render() {
          return <></>;
        },
      };
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {
          'sun.sun': {
            entity_id: 'sun.sun',
            state: 'above_horizon',
            attributes: {},
            last_changed: '2021-09-25T10:00:00+00:00',
            last_updated: '2021-09-25T10:00:00+00:00',
            context: {
              id: 'string',
              user_id: null,
              parent_id: null,
            },
          }
        },
        services: {},
      });
      expect(defaultProps).toEqual({
        entity: 'sun.sun',
      });
      expect(wrapDefaults(transformFields(config.fields), defaultProps)).toEqual({
        entity: {
          xlg: 'sun.sun'
        },
      });
    });

    test('it should transform default function back to translated value', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          entity: {
            type: 'entity',
            disableBreakpoints: false,
            options(data) {
              return [data.entities['sun.sun']];
            },
            default(_options, { entities }) {
              return entities['sun.sun'].entity_id;
            },
            label: 'Entity',
          },
        },
        render() {
          return <></>;
        },
      };
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {
          'sun.sun': {
            entity_id: 'sun.sun',
            state: 'above_horizon',
            attributes: {},
            last_changed: '2021-09-25T10:00:00+00:00',
            last_updated: '2021-09-25T10:00:00+00:00',
            context: {
              id: 'string',
              user_id: null,
              parent_id: null,
            },
          }
        },
        services: {},
      });
      expect(defaultProps).toEqual({
        entity: 'sun.sun',
      });
      expect(config.fields.entity.default).toEqual('sun.sun');
    });

    test('should not wrap objects at all, breakpoints not supported for objects', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          sizeOptions: {
            type: 'object',
            default: {},
            label: 'Size Options',
            collapsible: {
              open: true,
            },
            description: 'Controls the layout of the container',
            objectFields: {
              widthUnit: {
                type: 'radio',
                default: 'grid',
                label: 'Width Unit',
                description: 'Controls the unit of measurement for the width',
                options: ['px', '%', 'grid', 'auto'].map(value => ({ label: value, value })),
              },
              widthGrid: {
                label: 'Grid Width',
                type: 'number',
                default: 12,
                min: 1,
                max: 12,
                description: 'Controls the width as a grid size',
              },
              widthPx: {
                label: 'Width',
                type: 'number',
                default: 250,
                min: 1,
                description: 'Controls the width in pixels',
              },
              widthPercentage: {
                label: 'Width',
                type: 'number',
                default: 100,
                min: 1,
                max: 100,
                description: 'Controls the width as a percentage',
              },
              heightUnit: {
                type: 'radio',
                default: 'auto',
                label: 'Height Unit',
                description: 'Controls the unit of measurement for the height',
                options: ['auto', 'px', '%'].map(value => ({ label: value, value })),
              },
              heightPx: {
                label: 'Height',
                type: 'number',
                default: 250,
                min: 1,
                description: 'Controls the height in pixels',
              },
              heightPercentage: {
                label: 'Height',
                type: 'number',
                default: 25,
                min: 1,
                max: 100,
                description: 'Controls the height as a percentage',
              },
            },
          },
        },
        render() {
          return <></>;
        },
      };
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {},
        services: {},
      });
      expect(defaultProps).toEqual({
        sizeOptions: {
          heightPercentage: 25,
          heightPx: 250,
          heightUnit: 'auto',
          widthGrid: 12,
          widthPercentage: 100,
          widthPx: 250,
          widthUnit: 'grid',
        },
      });
      expect(wrapDefaults(transformFields(config.fields), defaultProps)).toEqual({
        sizeOptions: {
          heightPercentage: {
            xlg: 25,
          },
          heightPx: {
            xlg: 250,
          },
          heightUnit: {
            xlg: 'auto',
          },
          widthGrid: {
            xlg: 12,
          },
          widthPercentage: {
            xlg: 100,
          },
          widthPx: {
            xlg: 250,
          },
          widthUnit: {
            xlg: 'grid',
          },
        },
      });
    });
    test('it should wrap the default values from the configuration when breakpoint mode is enabled even when parent is disabled', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          options: {
            type: 'object',
            default: {},
            label: 'Options',
            disableBreakpoints: true,
            objectFields: {
              direction: {
                type: 'radio',
                label: 'Direction',
                default: 'row',
                options: [
                  {
                    label: 'Row',
                    value: 'row',
                  },
                  {
                    label: 'Column',
                    value: 'column',
                  },
                ],
              },
              gap: {
                type: 'number',
                label: 'Gap',
                default: 16,
              },
            },
          },
        },
        render() {
          return <></>;
        },
      };
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {},
        services: {},
      });
      expect(defaultProps).toEqual({
        options: {
          direction: 'row',
          gap: 16,
        },
      });
      expect(wrapDefaults(transformFields(config.fields), defaultProps)).toEqual({
        options: {
          direction: {
            xlg: 'row',
          },
          gap: {
            xlg: 16,
          },
        },
      });
    });

    test('should handle top level breakpoint object values and individually disable breakpoint functionality', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          direction: {
            type: 'radio',
            default: 'row',
            label: 'Direction',
            options: [
              {
                label: 'Row',
                value: 'row',
              },
              {
                label: 'Column',
                value: 'column',
              },
            ],
          },
          gap: {
            type: 'number',
            label: 'Gap',
            default: 32,
            min: 0,
          },
          title: {
            label: 'Title',
            type: 'text',
            default: '',
          },
          description: {
            label: 'Description',
            type: 'text',
            disableBreakpoints: true,
            default: 'Yeah Nah',
          },
        },
        render() {
          return <></>;
        },
      };
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {},
        services: {},
      });
      expect(defaultProps).toEqual({
        direction: 'row',
        gap: 32,
        title: '',
        description: 'Yeah Nah',
      });
      expect(wrapDefaults(transformFields(config.fields), defaultProps)).toEqual({
        direction: {
          xlg: 'row',
        },
        gap: {
          xlg: 32,
        },
        title: {
          xlg: '',
        },
        // should not have breakpoint object
        description: 'Yeah Nah',
      });
    });


    test('should populate default empty array from children defaults', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          direction: {
            type: 'array',
            default: [],
            label: 'Direction',
            // this does nothing for array types true or false
            disableBreakpoints: true,
            arrayFields: {
              gap: {
                label: 'Gap',
                type: 'number',
                min: 0,
                default: 16,
              },
              title: {
                label: 'Title',
                default: '',
                type: 'text',
              },
            },
          },
        },
        render() {
          return <></>;
        },
      };
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {},
        services: {},
      });
      expect(defaultProps).toEqual({
        direction: [{
          gap: 16,
          title: '',
        }],
      });
      expect(wrapDefaults(transformFields(config.fields), defaultProps)).toEqual({
        direction: [{
          gap: {
            xlg: 16,
          },
          title: {
            xlg: '',
          }
        }]
      });
    });

    test('should handle array with prefilled data without wrapping breakpoint', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          direction: {
            type: 'array',
            label: 'Direction',
            disableBreakpoints: true,
            default: [ ],
            arrayFields: {
              gap: {
                type: 'number',
                min: 0,
                label: '',
                default: 3,
              },
              title: {
                label: '',
                default: '',
                type: 'text',
              },
            },
          },
        },
        render() {
          return <></>;
        },
      };
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {},
        services: {},
      });
      expect(defaultProps).toEqual({
        direction: [
          {
            gap: 3,
            title: ''
          },
        ],
      });
      expect(wrapDefaults(transformFields(config.fields), defaultProps)).toEqual({
        direction: [
          {
            gap: {
              xlg: 3
            },
            title: {
              xlg: ''
            },
          },
        ]
      });
    });

    test('should handle deeply nested values with parent array disabled', async () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
        fields: {
          direction: {
            type: 'array',
            label: 'Direction',
            // default values provided here are ignored, they're retrieved from the child fields
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
                default: 22,
                min: 0,
              },
              title: {
                type: 'object',
                label: '',
                default: {},
                objectFields: {
                  description: {
                    label: '',
                    default: '',
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
      const defaultProps = await getDefaultPropsFromFields(config.fields, {
        entities: {},
        services: {},
      });
      expect(defaultProps).toEqual({
        direction: [
          {
            gap: 22,
            title: {
              description: '',
            },
          },
        ],
      });
      expect(wrapDefaults(transformFields(config.fields), defaultProps)).toEqual({
        direction: [
          {
            gap: {
              xlg: 22,
            },
            title: {
              description: {
                xlg: '',
              },
            },
          },
        ],
      });
    });
  });

  describe('transformFields', () => {
    test('Should transform fields to puck fields and include a reference to the original field configuration under _field', () => {
      const config: CustomComponentConfig<DefaultComponentProps> = {
        label: 'test',
        category: 'Misc',
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
                default: {},
                objectFields: {
                  description: {
                    label: '',
                    default: '',
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
                  default: {},
                  label: '',
                  objectFields: {
                    description: {
                      type: 'custom',
                      render: expect.any(Function),
                      _field: {
                        default: '',
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
  });
});
