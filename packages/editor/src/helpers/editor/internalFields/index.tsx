import { FieldConfiguration, InternalComponentFields, InternalRootComponentFields } from '@typings/fields';
import { useEffect } from 'react';
import { useActiveBreakpoint } from '@hooks/useActiveBreakpoint';

export const internalRootComponentFields: FieldConfiguration<InternalRootComponentFields> = {
  _activeBreakpoint: {
    type: 'custom',
    default: 'xlg',
    label: 'Active Breakpoint',
    visible: () => false,
    description: 'The active breakpoint for this component, used for responsive design',
    render({ onChange, name }) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const breakpoint = useActiveBreakpoint();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        onChange(breakpoint);
      }, [onChange, breakpoint]);
      return <input name={name} type='hidden' value={breakpoint} />;
    },
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
        type: 'text',
        // language: 'css',
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
  _activeBreakpoint: {
    type: 'custom',
    default: 'xlg',
    label: 'Active Breakpoint',
    description: 'The active breakpoint for this component, used for responsive design',
    visible: () => false,
    render({ onChange, name }) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const breakpoint = useActiveBreakpoint();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        onChange(breakpoint);
      }, [onChange, breakpoint]);
      return <input name={name} type='hidden' value={breakpoint} />;
    },
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
      },
    },
  },
};
