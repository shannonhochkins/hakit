import { CustomComponentConfig, CustomConfig } from '@typings/puck';

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

const FieldTest: CustomComponentConfig<LayoutProps> = {
  label: ComponentName,
  fields: {
    options: {
      type: 'object',
      label: 'Field Examples',
      collapseOptions: {
        startExpanded: true,
      },
      description: 'Variations of different field types',
      objectFields: {
        number: {
          type: 'number',
          label: 'Number',
          default: 16,
          min: 0,
          description: 'Number Field',
        },
        text: {
          type: 'text',
          label: 'Text',
          default: '',
          description: 'Text field',
        },
        deep: {
          type: 'object',
          label: 'Deep Object',
          collapseOptions: {
            startExpanded: true,
          },
          description: 'Object with nested fields',
          objectFields: {
            deepText: {
              type: 'text',
              label: 'Deep Text',
              default: '',
              description: 'Text field inside a deep object',
            },
            deepNumber: {
              type: 'number',
              label: 'Deep Number',
              default: 0,
              min: 0,
              description: 'Number field inside a deep object',
            },
            deepArray: {
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
                  label: 'Label',
                  type: 'text',
                  default: 'Item Name',
                },
                id: {
                  type: 'hidden', // Set to hidden from the start
                  default: '',
                },
              },
            },
          },
        },
        array: {
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
              label: 'Label',
              type: 'text',
              default: 'Item Name',
            },
            id: {
              type: 'hidden',
              default: '',
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

export const userConfig: CustomConfig<{
  [ComponentName]: LayoutProps;
}> = {
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
};
