import { describe, expect, it } from 'bun:test';
import { puckToDBValue } from '../puckToDBValue';
import { CustomConfigWithDefinition } from '@typings/puck';
import { DefaultComponentProps } from '@measured/puck';

describe('puckToDBValue', () => {
  it('should not include xlg for object field root objects', () => {
    const o = {
      root: {
        props: {
          content: {
            $xlg: [],
          },
          _styleOverrides: {
            style: {
              $xlg: 'background-color: green;',
            },
          },
          '@hakit/default-root': {
            $xlg: {
              background: {
                blur: 25,
                opacity: 0.9,
                blendMode: 'multiply',
                backgroundColor: '#4254c5',
                useBackgroundImage: false,
              },
            },
          },
          'a35029ce-0d24-46cd-b8f1-68a9c5e851e0': {
            $xlg: {
              something: 'This is a text field',
              somethinigElse: 'This is another text field',
            },
          },
        },
      },
      zones: {},
      content: [],
    };
    const c = {
      root: {
        props: {
          content: [],
          '@hakit/default-root': {
            background: {
              blur: 25,
              opacity: 0.9,
              blendMode: 'multiply',
              backgroundColor: '#4254c5',
              useBackgroundImage: false,
            },
          },
          'a35029ce-0d24-46cd-b8f1-68a9c5e851e0': {
            something: 'This is a text field',
            somethinigElse: 'This is another text field',
          },
          _styleOverrides: {
            style: 'background-color: red;',
          },
        },
      },
      content: [],
      zones: {},
    };
    const bp = 'lg' as const;
    const config: CustomConfigWithDefinition<DefaultComponentProps> = {
      components: {
        Navigation: {
          label: 'Navigation',
          render: () => <></>,
          fields: {
            content: {
              type: 'slot',
            },
            options: {
              type: 'custom',
              _field: {
                type: 'object',
                label: 'Options',
                description: 'General options for the navigation bar',
                collapseOptions: {
                  startExpanded: true,
                },
                objectFields: {
                  pages: {
                    type: 'custom',
                    _field: {
                      type: 'pages',
                      label: 'Pages',
                      default: [],
                      description: 'Select pages to appear in the navigation bar',
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  hideClock: {
                    type: 'custom',
                    _field: {
                      type: 'radio',
                      label: 'Hide Clock',
                      description: 'Hide the clock in the navigation bar',
                      options: [
                        {
                          label: 'Yes',
                          value: true,
                        },
                        {
                          label: 'No',
                          value: false,
                        },
                      ],
                      default: false,
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                },
                responsiveMode: false,
              },
              render: () => <></>,
            },
            clockOptions: {
              type: 'custom',
              _field: {
                type: 'object',
                label: 'Clock Options',
                description: 'Options for the clock within the navigation bar',
                collapseOptions: {
                  startExpanded: true,
                },
                objectFields: {
                  hideTime: {
                    type: 'custom',
                    _field: {
                      type: 'radio',
                      label: 'Hide Time',
                      description: 'Hide the time in the clock',
                      options: [
                        {
                          label: 'Yes',
                          value: true,
                        },
                        {
                          label: 'No',
                          value: false,
                        },
                      ],
                      default: false,
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  useTimeEntity: {
                    type: 'custom',
                    _field: {
                      type: 'radio',
                      label: 'Use Time Entity',
                      description: 'Use a time entity from your home assistant instance',
                      options: [
                        {
                          label: 'Yes',
                          value: true,
                        },
                        {
                          label: 'No',
                          value: false,
                        },
                      ],
                      default: true,
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  timeEntity: {
                    type: 'custom',
                    _field: {
                      type: 'entity',
                      description: 'The entity to use for the time, entity ID must contain the word "time"',
                      label: 'Time Entity',
                      options: [
                        {
                          entity_id: 'sensor.time',
                          state: '09:57',
                          attributes: {
                            icon: 'mdi:clock',
                            friendly_name: 'Time',
                          },
                          context: {
                            id: '01K1VR8Q71PV7VEZK2TW8Q6GCT',
                            parent_id: null,
                            user_id: null,
                          },
                          last_changed: '2025-08-04T23:57:00.001Z',
                          last_updated: '2025-08-04T23:57:00.001Z',
                        },
                        {
                          entity_id: 'sensor.sleep_time_in_bed',
                          state: '0',
                          attributes: {
                            state_class: 'total_increasing',
                            unit_of_measurement: 'min',
                            attribution: 'Data provided by Fitbit.com',
                            device_class: 'duration',
                            icon: 'mdi:hotel',
                            friendly_name: 'Shannon HOchkins Sleep time in bed',
                          },
                          context: {
                            id: '01K0TP9QB16QC9PM4TZJKKV8TD',
                            parent_id: null,
                            user_id: null,
                          },
                          last_changed: '2025-07-23T03:47:39.489Z',
                          last_updated: '2025-07-23T03:47:39.489Z',
                        },
                        {
                          entity_id: 'sensor.sleep_start_time',
                          state: '',
                          attributes: {
                            attribution: 'Data provided by Fitbit.com',
                            icon: 'mdi:clock',
                            friendly_name: 'Shannon HOchkins Sleep start time',
                          },
                          context: {
                            id: '01K0TP9QEXGQYY0MBWAC7WBAG1',
                            parent_id: null,
                            user_id: null,
                          },
                          last_changed: '2025-07-23T03:47:39.613Z',
                          last_updated: '2025-07-23T03:47:39.613Z',
                        },
                        {
                          entity_id: 'sensor.zigbee2mqtt_bridge_permit_join_timeout',
                          state: 'unavailable',
                          attributes: {
                            unit_of_measurement: 's',
                            device_class: 'duration',
                            friendly_name: 'Zigbee2MQTT Bridge Permit join timeout',
                          },
                          context: {
                            id: '01K01H6P778MZG69JJBJH368QS',
                            parent_id: null,
                            user_id: null,
                          },
                          last_changed: '2025-07-13T09:17:36.359Z',
                          last_updated: '2025-07-13T09:17:36.359Z',
                        },
                        {
                          entity_id: 'sensor.solis_timestamp_measurements_received',
                          state: '1754351505.0',
                          attributes: {
                            state_class: 'measurement',
                            'Last updated': '2025-08-05T09:56:36.826902',
                            'Inverter serial': '0308D2201160027',
                            'API Name': 'SolisCloud',
                            icon: 'mdi:calendar-clock',
                            friendly_name: 'Solis Timestamp Measurements Received',
                          },
                          context: {
                            id: '01K1VR80JV27GKPZHHR3K46EXR',
                            parent_id: null,
                            user_id: null,
                          },
                          last_changed: '2025-08-04T23:56:36.827Z',
                          last_updated: '2025-08-04T23:56:36.827Z',
                        },
                      ],
                      default: () => 'sensor.time',
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  timeFormat: {
                    type: 'custom',
                    _field: {
                      type: 'text',
                      label: 'Time Format',
                      description: 'The format to use for the time',
                      default: 'hh:mm a',
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  throttleTime: {
                    type: 'custom',
                    _field: {
                      type: 'number',
                      description: 'The time in milliseconds to throttle the time updates when no entity is provided',
                      label: 'Throttle Time',
                      default: 1000,
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  hideDate: {
                    type: 'custom',
                    _field: {
                      type: 'radio',
                      label: 'Hide Date',
                      description: 'Hide the date in the clock',
                      options: [
                        {
                          label: 'Yes',
                          value: true,
                        },
                        {
                          label: 'No',
                          value: false,
                        },
                      ],
                      default: true,
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  useDateEntity: {
                    type: 'custom',
                    _field: {
                      type: 'radio',
                      label: 'Use Date Entity',
                      description: 'Use a date entity from your home assistant instance',
                      options: [
                        {
                          label: 'Yes',
                          value: true,
                        },
                        {
                          label: 'No',
                          value: false,
                        },
                      ],
                      default: true,
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  dateEntity: {
                    type: 'custom',
                    _field: {
                      type: 'entity',
                      label: 'Date Entity',
                      description: 'The entity to use for the date, entity ID must contain the word "date"',
                      options: [
                        {
                          entity_id: 'sensor.date',
                          state: '2025-08-05',
                          attributes: {
                            icon: 'mdi:calendar',
                            friendly_name: 'Date',
                          },
                          context: {
                            id: '01K1TP3JYA79JXNS69RHK5PZ64',
                            parent_id: null,
                            user_id: null,
                          },
                          last_changed: '2025-08-04T14:00:00.202Z',
                          last_updated: '2025-08-04T14:00:00.202Z',
                        },
                        {
                          entity_id: 'sensor.natashas_iphone_last_update_trigger',
                          state: 'Background Fetch',
                          attributes: {
                            icon: 'mdi:cellphone-wireless',
                            friendly_name: 'Natasha’s iPhone Last Update Trigger',
                          },
                          context: {
                            id: '01K01H62BW28967Q7RR364RQ1K',
                            parent_id: null,
                            user_id: null,
                          },
                          last_changed: '2025-07-13T09:17:16.028Z',
                          last_updated: '2025-07-13T09:17:16.028Z',
                        },
                        {
                          entity_id: 'sensor.iphone_last_update_trigger',
                          state: 'Periodic',
                          attributes: {
                            icon: 'mdi:cellphone-wireless',
                            friendly_name: 'iPhone Last Update Trigger',
                          },
                          context: {
                            id: '01K1VNKDXC7KK5T4YGKT4VVE60',
                            parent_id: null,
                            user_id: null,
                          },
                          last_changed: '2025-08-04T23:10:25.196Z',
                          last_updated: '2025-08-04T23:10:25.196Z',
                        },
                      ],
                      default: () => 'sensor.date',
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  dateFormat: {
                    type: 'custom',
                    _field: {
                      type: 'text',
                      label: 'Date Format',
                      description: 'The format to use for the date',
                      default: 'dddd, MMMM DD YYYY',
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  hideIcon: {
                    type: 'custom',
                    _field: {
                      type: 'radio',
                      label: 'Hide Icon',
                      description: 'Hide the icon in the clock',
                      options: [
                        {
                          label: 'Yes',
                          value: true,
                        },
                        {
                          label: 'No',
                          value: false,
                        },
                      ],
                      default: true,
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                  icon: {
                    type: 'custom',
                    _field: {
                      type: 'text',
                      label: 'Icon',
                      description: 'The icon to use for the clock',
                      default: 'mdi:calendar',
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                },
                responsiveMode: false,
              },
              render: () => <></>,
            },
            _styleOverrides: {
              type: 'custom',
              render: () => <></>,
              _field: {
                type: 'object',
                label: 'Style Overrides',
                collapseOptions: {
                  startExpanded: false,
                },
                description: 'Provide css updates to override the default styles of this component',
                objectFields: {
                  style: {
                    type: 'custom',
                    _field: {
                      type: 'code',
                      language: 'css',
                      label: 'CSS Styles',
                      description: 'Provide css updates to override the default styles of this component',
                      default: '',
                      responsiveMode: true,
                    },
                    render: () => <></>,
                  },
                },
                responsiveMode: false,
              },
            },
            _activeBreakpoint: {
              type: 'custom',
              _field: {
                type: 'text',
                default: 'xlg',
                responsiveMode: false,
                label: 'Active Breakpoint',
                description: 'The current active breakpoint for this component',
              },
              render: () => <></>,
            },
          },
          permissions: {
            delete: true,
            drag: true,
            duplicate: false,
          },
        },
        Layout: {
          label: 'Layout',
          render: () => <></>,
          fields: {
            options: {
              type: 'custom',
              render: () => <></>,
              _field: {
                type: 'object',
                label: 'Layout Options',
                collapseOptions: {
                  startExpanded: false,
                },
                description: 'Controls the layout of the container',
                objectFields: {
                  direction: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'radio',
                      default: 'row',
                      label: 'Direction',
                      description: 'Controls if the children should be laid out horizontally or vertically',
                      options: [
                        {
                          label: 'Row',
                          value: 'row',
                        },
                        {
                          label: 'Row Reverse',
                          value: 'row-reverse',
                        },
                        {
                          label: 'Column',
                          value: 'column',
                        },
                        {
                          label: 'Column Reverse',
                          value: 'column-reverse',
                        },
                      ],
                      responsiveMode: true,
                    },
                  },
                  alignItems: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'select',
                      default: 'flex-start',
                      label: 'Align Items',
                      description: 'Controls how children are distributed along the horizontal axis',
                      options: [
                        {
                          label: 'Center',
                          value: 'center',
                        },
                        {
                          label: 'Flex End',
                          value: 'flex-end',
                        },
                        {
                          label: 'Flex Start',
                          value: 'flex-start',
                        },
                        {
                          label: 'Stretch',
                          value: 'stretch',
                        },
                      ],
                      responsiveMode: true,
                    },
                  },
                  justifyContent: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'select',
                      default: 'flex-start',
                      label: 'Justify Content',
                      description: 'Controls how items are aligned along the vertical axis',
                      options: [
                        {
                          label: 'Center',
                          value: 'center',
                        },
                        {
                          label: 'End',
                          value: 'end',
                        },
                        {
                          label: 'Flex End',
                          value: 'flex-end',
                        },
                        {
                          label: 'Flex Start',
                          value: 'flex-start',
                        },
                        {
                          label: 'Start',
                          value: 'start',
                        },
                        {
                          label: 'Space Around',
                          value: 'space-around',
                        },
                        {
                          label: 'Space Between',
                          value: 'space-between',
                        },
                        {
                          label: 'Space Evenly',
                          value: 'space-evenly',
                        },
                        {
                          label: 'Stretch',
                          value: 'stretch',
                        },
                      ],
                      responsiveMode: true,
                    },
                  },
                  wrap: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'select',
                      label: 'Wrap',
                      default: 'wrap',
                      description: 'Controls whether the container allows its items to move onto multiple lines.',
                      options: [
                        {
                          label: 'No Wrap',
                          value: 'nowrap',
                        },
                        {
                          label: 'Wrap',
                          value: 'wrap',
                        },
                        {
                          label: 'Wrap Reverse',
                          value: 'wrap-reverse',
                        },
                      ],
                      responsiveMode: true,
                    },
                  },
                  gap: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'number',
                      label: 'Gap',
                      default: 16,
                      min: 0,
                      description: 'Controls the space between items in pixels',
                      responsiveMode: true,
                    },
                  },
                  padding: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'number',
                      label: 'Padding',
                      default: 0,
                      description: 'Controls the padding of the container in pixels',
                      responsiveMode: true,
                    },
                  },
                  margin: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'number',
                      label: 'Margin',
                      default: 0,
                      description: 'Controls the margin of the container in pixels',
                      responsiveMode: true,
                    },
                  },
                },
                responsiveMode: false,
              },
            },
            _styleOverrides: {
              type: 'custom',
              render: () => <></>,
              _field: {
                type: 'object',
                label: 'Style Overrides',
                collapseOptions: {
                  startExpanded: false,
                },
                description: 'Provide css updates to override the default styles of this component',
                objectFields: {
                  style: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'code',
                      language: 'css',
                      label: 'CSS Styles',
                      description: 'Provide css updates to override the default styles of this component',
                      default: '',
                      responsiveMode: true,
                    },
                  },
                },
                responsiveMode: false,
              },
            },
          },
        },
        'Field Test': {
          label: 'Field Test',
          render: () => <></>,
          fields: {
            text: {
              type: 'custom',
              render: () => <></>,
              _field: {
                type: 'text',
                label: 'Text Field',
                default: 'This is a text field',
                collapseOptions: {},
                description: 'A simple text field for testing purposes',
                responsiveMode: true,
              },
            },
            accordion: {
              type: 'custom',
              render: () => <></>,
              _field: {
                type: 'object',
                label: 'Accordion Field',
                objectFields: {
                  open: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'switch',
                      label: 'Open',
                      default: true,
                      description: 'Whether the accordion is open or closed',
                      responsiveMode: true,
                    },
                  },
                  title: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'text',
                      label: 'Title',
                      default: 'Accordion Title',
                      description: 'The title of the accordion',
                      responsiveMode: true,
                    },
                  },
                  description: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'text',
                      label: 'Description',
                      default: 'This is a description for the accordion field.',
                      description: 'A description for the accordion field',
                      responsiveMode: true,
                    },
                  },
                },
                responsiveMode: false,
              },
            },
            options: {
              type: 'custom',
              render: () => <></>,
              _field: {
                type: 'object',
                label: 'Field Examples',
                collapseOptions: {
                  startExpanded: true,
                },
                description: 'Variations of different field types',
                objectFields: {
                  radio: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'radio',
                      default: 'row',
                      label: 'Radio',
                      description: 'Radio Field',
                      options: [
                        {
                          label: 'Row',
                          value: 'row',
                        },
                        {
                          label: 'Row Reverse',
                          value: 'row-reverse',
                        },
                        {
                          label: 'Column',
                          value: 'column',
                        },
                        {
                          label: 'Column Reverse',
                          value: 'column-reverse',
                        },
                      ],
                      responsiveMode: true,
                    },
                  },
                  select: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'select',
                      default: 'flex-start',
                      label: 'Select',
                      description: 'Select Field',
                      options: [
                        {
                          label: 'Center',
                          value: 'center',
                        },
                        {
                          label: 'Flex End',
                          value: 'flex-end',
                        },
                        {
                          label: 'Flex Start',
                          value: 'flex-start',
                        },
                        {
                          label: 'Stretch',
                          value: 'stretch',
                        },
                      ],
                      responsiveMode: true,
                    },
                  },
                  number: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'number',
                      label: 'Number',
                      default: 16,
                      min: 0,
                      description: 'Number Field',
                      responsiveMode: true,
                    },
                  },
                  text: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'text',
                      label: 'Text',
                      default: '',
                      description: 'Text field',
                      responsiveMode: true,
                    },
                  },
                  array: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'array',
                      label: 'Array',
                      default: [
                        {
                          label: 'Test',
                          id: '123',
                        },
                      ],
                      min: 5,
                      max: 5,
                      collapseOptions: {
                        startExpanded: true,
                      },
                      defaultItemProps: {
                        id: '',
                        label: 'Item Name',
                      },
                      arrayFields: {
                        label: {
                          type: 'custom',
                          render: () => <></>,
                          _field: {
                            label: 'Label',
                            type: 'text',
                            default: 'Item Name',
                            responsiveMode: true,
                          },
                        },
                        id: {
                          type: 'custom',
                          render: () => <></>,
                          _field: {
                            type: 'hidden',
                            default: '',
                            responsiveMode: false,
                          },
                        },
                      },
                      responsiveMode: false,
                    },
                  },
                },
                responsiveMode: false,
              },
            },
            _styleOverrides: {
              type: 'custom',
              render: () => <></>,
              _field: {
                type: 'object',
                label: 'Style Overrides',
                collapseOptions: {
                  startExpanded: false,
                },
                description: 'Provide css updates to override the default styles of this component',
                objectFields: {
                  style: {
                    type: 'custom',
                    render: () => <></>,
                    _field: {
                      type: 'code',
                      language: 'css',
                      label: 'CSS Styles',
                      description: 'Provide css updates to override the default styles of this component',
                      default: '',
                      responsiveMode: true,
                    },
                  },
                },
                responsiveMode: false,
              },
            },
          },
        },
      },
      categories: {
        '@hakit/test': {
          title: '@hakit/test',
          defaultExpanded: true,
          components: ['Navigation', 'Layout', 'Field Test'],
        },
      },
      root: {
        label: 'Root',
        fields: {
          '@hakit/default-root': {
            type: 'custom',
            render: () => <></>,
            _field: {
              type: 'object',
              label: '@hakit/editor',
              collapseOptions: {
                startExpanded: true,
              },
              objectFields: {
                background: {
                  type: 'custom',
                  render: () => <></>,
                  _field: {
                    type: 'object',
                    label: 'Background options',
                    description: 'General options for the main background',
                    objectFields: {
                      useBackgroundImage: {
                        type: 'custom',
                        render: () => <></>,
                        _field: {
                          type: 'switch',
                          label: 'Use Background Image',
                          description: 'Whether to use a background image or not',
                          default: true,
                          repositoryId: '@hakit/default-root',
                          responsiveMode: true,
                        },
                      },
                      backgroundImage: {
                        type: 'custom',
                        render: () => <></>,
                        _field: {
                          type: 'imageUpload',
                          label: 'Background Image',
                          default: '',
                          description: 'The entity to display in the button card',
                          repositoryId: '@hakit/default-root',
                          responsiveMode: true,
                        },
                      },
                      backgroundColor: {
                        type: 'custom',
                        render: () => <></>,
                        _field: {
                          type: 'color',
                          label: 'Background Color',
                          description: 'The background color of the button card',
                          default: '#4254c5',
                          repositoryId: '@hakit/default-root',
                          responsiveMode: true,
                        },
                      },
                      blendMode: {
                        type: 'custom',
                        render: () => <></>,
                        _field: {
                          type: 'select',
                          label: 'Blend Mode',
                          description: 'The blend mode to apply to the background overlay color',
                          default: 'multiply',
                          options: [
                            {
                              label: 'Color',
                              value: 'color',
                            },
                            {
                              label: 'Color Burn',
                              value: 'color-burn',
                            },
                            {
                              label: 'Color Dodge',
                              value: 'color-dodge',
                            },
                            {
                              label: 'Darken',
                              value: 'darken',
                            },
                            {
                              label: 'Difference',
                              value: 'difference',
                            },
                            {
                              label: 'Exclusion',
                              value: 'exclusion',
                            },
                            {
                              label: 'Hard Light',
                              value: 'hard-light',
                            },
                            {
                              label: 'Hue',
                              value: 'hue',
                            },
                            {
                              label: 'Lighten',
                              value: 'lighten',
                            },
                            {
                              label: 'Luminosity',
                              value: 'luminosity',
                            },
                            {
                              label: 'Multiply',
                              value: 'multiply',
                            },
                            {
                              label: 'Normal',
                              value: 'normal',
                            },
                            {
                              label: 'Overlay',
                              value: 'overlay',
                            },
                            {
                              label: 'Saturation',
                              value: 'saturation',
                            },
                            {
                              label: 'Screen',
                              value: 'screen',
                            },
                            {
                              label: 'Soft Light',
                              value: 'soft-light',
                            },
                          ],
                          repositoryId: '@hakit/default-root',
                          responsiveMode: true,
                        },
                      },
                      blur: {
                        type: 'custom',
                        render: () => <></>,
                        _field: {
                          type: 'number',
                          label: 'Blur',
                          min: 0,
                          description: 'The blur amount to apply to the background image of the dashboard',
                          default: 25,
                          repositoryId: '@hakit/default-root',
                          responsiveMode: true,
                        },
                      },
                      opacity: {
                        type: 'custom',
                        render: () => <></>,
                        _field: {
                          type: 'number',
                          label: 'Opacity',
                          description: 'The opacity of the background overlay color',
                          default: 0.9,
                          min: 0,
                          max: 1,
                          step: 0.1,
                          repositoryId: '@hakit/default-root',
                          responsiveMode: true,
                        },
                      },
                    },
                    repositoryId: '@hakit/default-root',
                    responsiveMode: false,
                  },
                },
              },
              repositoryId: '@hakit/default-root',
              responsiveMode: false,
            },
          },
          'a35029ce-0d24-46cd-b8f1-68a9c5e851e0': {
            type: 'custom',
            render: () => <></>,
            _field: {
              type: 'object',
              label: '@hakit/test',
              collapseOptions: {
                startExpanded: true,
              },
              objectFields: {
                something: {
                  type: 'custom',
                  render: () => <></>,
                  _field: {
                    type: 'text',
                    label: 'Something',
                    default: 'This is a text field',
                    repositoryId: 'a35029ce-0d24-46cd-b8f1-68a9c5e851e0',
                    responsiveMode: true,
                  },
                },
                somethinigElse: {
                  type: 'custom',
                  render: () => <></>,
                  _field: {
                    type: 'text',
                    label: 'Something Else',
                    default: 'This is another text field',
                    repositoryId: 'a35029ce-0d24-46cd-b8f1-68a9c5e851e0',
                    responsiveMode: true,
                  },
                },
                anotherSlot: {
                  type: 'slot',
                },
              },
              repositoryId: 'a35029ce-0d24-46cd-b8f1-68a9c5e851e0',
              responsiveMode: false,
            },
          },
          _styleOverrides: {
            type: 'custom',
            render: () => <></>,
            _field: {
              type: 'object',
              label: 'Global styles',
              collapseOptions: {
                startExpanded: false,
              },
              description: 'Provide global CSS styles for the entire dashboard',
              objectFields: {
                style: {
                  type: 'custom',
                  render: () => <></>,
                  _field: {
                    type: 'code',
                    language: 'css',
                    label: 'CSS Styles',
                    description: 'Provide global CSS styles for the entire dashboard',
                    default: '',
                    responsiveMode: true,
                  },
                },
              },
              responsiveMode: false,
            },
          },
          content: {
            type: 'slot',
          },
        },
      },
    };
    const breakpointModeMap = {
      root: {
        // these need to match responsiveMode: true, on the input
        '_styleOverrides.style': true,
        '@hakit/default-root.background.useBackgroundImage': true,
        '@hakit/default-root.background.backgroundImage': true,
        '@hakit/default-root.background.backgroundColor': true,
        '@hakit/default-root.background.blendMode': true,
        '@hakit/default-root.background.blur': true,
        '@hakit/default-root.background.opacity': true,
        'a35029ce-0d24-46cd-b8f1-68a9c5e851e0.something': true,
        'a35029ce-0d24-46cd-b8f1-68a9c5e851e0.somethinigElse': true,
      },
    };
    const output = puckToDBValue(o, c, bp, config, breakpointModeMap);
    expect(output).toMatchSnapshot();
  });
});
