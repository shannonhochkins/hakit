import { Config, Plugin, FieldRenderFunctions } from '@measured/puck';
import { memo } from 'react';
import { DrawerItem } from '../DrawerItem';
import { FieldDefinition } from '@typings/fields';
import { StandardFieldWrapper, type StandardFieldComponentProps } from '@features/dashboard/Editor/FieldContainer/Standard';
import { CollapsibleFieldWrapper, type CollapsibleFieldComponentProps } from '@features/dashboard/Editor/FieldContainer/Collapsible';
import { RenderErrorBoundary } from '../../RenderErrorBoundary';

type AllFieldRenderers = FieldRenderFunctions<
  Config<{
    fields: FieldDefinition;
  }>
>;

// Props accepted by any field renderer in fieldTypes (union of all variants)
type FieldWrapperProps = Parameters<AllFieldRenderers[keyof AllFieldRenderers]>[0];

function areValuesDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  // Arrays
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!areValuesDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Plain objects
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(bObj, key)) return false;
    if (!areValuesDeepEqual(aObj[key], bObj[key])) return false;
  }
  return true;
}

const FieldWrapperInner = ({ field, name, onChange, value, id }: FieldWrapperProps) => {
  if (field.type === 'object' || field.type === 'array' || field.type === 'pages') {
    return (
      <CollapsibleFieldWrapper
        field={field as CollapsibleFieldComponentProps['field']}
        name={name}
        onChange={onChange}
        value={value}
        id={id ?? name}
      />
    );
  }
  return (
    <StandardFieldWrapper
      field={field as StandardFieldComponentProps['field']}
      name={name}
      onChange={onChange}
      value={value}
      id={id ?? name}
    />
  );
};

const MemoFieldWrapperInner = memo(FieldWrapperInner, (prevProps, nextProps) => {
  // Allow re-render if field type changes (ensures correct wrapper)
  if (prevProps.field.type !== nextProps.field.type) return false;
  // Re-render when handler identity changes
  if (prevProps.onChange !== nextProps.onChange) return false;
  // Re-render when value changes deeply
  if (!areValuesDeepEqual(prevProps.value, nextProps.value)) return false;
  // Ignore other prop changes (name, id, etc.) for performance
  return true;
});
MemoFieldWrapperInner.displayName = 'FieldWrapper';

// Preserve function renderer shape expected by Puck
const FieldWrapper = (props: FieldWrapperProps) => <MemoFieldWrapperInner {...props} />;

export const createPuckOverridesPlugin = (): Plugin<
  Config<{
    fields: FieldDefinition;
  }>
> => {
  return {
    overrides: {
      drawerItem: DrawerItem,
      fieldLabel: ({ children }) => <>{children}</>,
      fields: ({ children }) => {
        return (
          <RenderErrorBoundary prefix={`Error Rendering Fields for this component`} styles={{ margin: '1rem', width: 'auto' }}>
            {children}
          </RenderErrorBoundary>
        );
      },
      fieldTypes: {
        unit: FieldWrapper,
        switch: FieldWrapper,
        radio: FieldWrapper,
        select: FieldWrapper,
        number: FieldWrapper,
        text: FieldWrapper,
        textarea: FieldWrapper,
        imageUpload: FieldWrapper,
        page: FieldWrapper,
        pages: FieldWrapper,
        entity: FieldWrapper,
        service: FieldWrapper,
        slider: FieldWrapper,
        color: FieldWrapper,
        code: FieldWrapper,
        object: ({ children, ...props }) => {
          if (props.field.metadata?.override === true) {
            return children;
          }
          return <FieldWrapper {...props}>{children}</FieldWrapper>;
        },
        array: ({ children, ...props }) => {
          if (props.field.metadata?.override === true) {
            return children;
          }
          return <FieldWrapper {...props}>{children}</FieldWrapper>;
        },
        hidden: FieldWrapper,
        slot: FieldWrapper,
      },
    },
  };
};
