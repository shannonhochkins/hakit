import { AvailableQueries } from '@hakit/components';
import { FieldConfiguration } from '@typings/fields';

interface InternalRootComponentFields {
  _activeBreakpoint: keyof AvailableQueries;
  styles: {
    css: string;
  };
}

export const rootComponentFields: FieldConfiguration<InternalRootComponentFields> = {
  _activeBreakpoint: {
    type: 'hidden',
    default: 'xlg',
  },
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
};

interface InternalComponentFields {
  _activeBreakpoint: keyof AvailableQueries;
  styles: {
    css: string;
  };
}

export const componentFields: FieldConfiguration<InternalComponentFields> = {
  _activeBreakpoint: {
    type: 'hidden',
    default: 'xlg',
  },
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
        visible(data) {
          return data.styles.css !== undefined;
        },
      },
    },
  },
};
