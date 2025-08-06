import { CustomComponentConfigWithDefinition, CustomConfigWithDefinition } from '@typings/puck';

export type LayoutProps = {
  options: {
    text: string;
    number: number;
    deep: {
      deepText: string;
      deepNumber: number;
      deepArray: Array<{
        id: string;
        label: string;
      }>;
    };
    array: Array<{
      id: string;
      label: string;
    }>;
  };
};

const ComponentName = 'Field Test' as const;

const FieldTest: CustomComponentConfigWithDefinition<LayoutProps> = {
  label: ComponentName,
  fields: {
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
          number: {
            _field: {
              type: 'number',
              label: 'Number',
              default: 16,
              min: 0,
              description: 'Number Field',
            },
            type: 'custom',
            render: () => <></>,
          },
          text: {
            type: 'custom',
            render: () => <></>,
            _field: {
              type: 'text',
              label: 'Text',
              default: '',
              description: 'Text field',
            },
          },
          deep: {
            type: 'custom',
            render: () => <></>,
            _field: {
              type: 'object',
              label: 'Deep Object',
              collapseOptions: {
                startExpanded: true,
              },
              description: 'Object with nested fields',
              objectFields: {
                deepText: {
                  _field: {
                    type: 'text',
                    label: 'Deep Text',
                    default: '',
                    description: 'Text field inside a deep object',
                  },
                  type: 'custom',
                  render: () => <></>,
                },
                deepNumber: {
                  type: 'custom',
                  render: () => <></>,
                  _field: {
                    type: 'number',
                    label: 'Deep Number',
                    default: 0,
                    min: 0,
                    description: 'Number field inside a deep object',
                  },
                },
                deepArray: {
                  type: 'custom',
                  render: () => <></>,
                  _field: {
                    type: 'array',
                    label: 'Array',
                    default: [],
                    min: 5,
                    max: 5,
                    collapseOptions: {
                      startExpanded: true,
                    },
                    getItemSummary: (item, i) => item.label || `Item #${i}`,
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
                        },
                      },
                      id: {
                        type: 'custom',
                        render: () => <></>,
                        _field: {
                          type: 'hidden', // Set to hidden from the start
                          default: '',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          array: {
            type: 'custom',
            render: () => <></>,
            _field: {
              type: 'array',
              label: 'Array',
              default: [],
              min: 5,
              max: 5,
              collapseOptions: {
                startExpanded: true,
              },
              getItemSummary: (item, i) => item.label || `Item #${i}`,
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
                  },
                },
                id: {
                  type: 'custom',
                  render: () => <></>,
                  _field: {
                    type: 'hidden', // Set to hidden from the start
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
  render: props => {
    return <pre ref={props.puck.dragRef}>{JSON.stringify(props.options, null, 2)}</pre>;
  },
};

type ComponentType = {
  [ComponentName]: LayoutProps;
};

export const userConfig: CustomConfigWithDefinition<ComponentType> = {
  components: {
    [ComponentName]: FieldTest,
  },
  categories: {
    '@hakit/test': {
      title: '@hakit/test',
      defaultExpanded: true,
      components: [ComponentName],
    },
  },
  root: {
    label: 'Root',
    fields: {},
  },
} as const;
