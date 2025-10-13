import { FieldConfiguration, InternalComponentFields, InternalRootComponentFields } from '@typings/fields';

export const internalRootComponentFields: FieldConfiguration<InternalRootComponentFields> = {
  styles: {
    type: 'object',
    label: 'Global styles',
    collapseOptions: {
      startExpanded: false,
    },
    description: 'Provide global CSS styles for the entire dashboard',
    objectFields: {
      css: {
        type: 'code',
        language: 'css',
        label: 'CSS Styles',
        description: 'Provide global CSS styles for the entire dashboard',
        default: '',
      },
    },
  },
  content: {
    type: 'slot',
  },
};

export const internalComponentFields: FieldConfiguration<InternalComponentFields> = {
  styles: {
    type: 'object',
    label: 'Style Overrides',
    collapseOptions: {
      startExpanded: false,
    },
    description: 'Provide css updates to override the default styles of this component',
    objectFields: {
      css: {
        type: 'code',
        language: 'css',
        label: 'CSS Styles',
        description: 'Provide css updates to override the default styles of this component',
        default: '',
      },
    },
  },
};
