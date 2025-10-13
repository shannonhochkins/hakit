import { Config, Plugin, FieldRenderFunctions } from '@measured/puck';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { DrawerItem } from '../DrawerItem';
import { FieldDefinition } from '@typings/fields';
import { StandardFieldWrapper, type StandardFieldComponentProps } from '@features/dashboard/Editor/FieldContainer/Standard';
import { CollapsibleFieldWrapper, type CollapsibleFieldComponentProps } from '@features/dashboard/Editor/FieldContainer/Collapsible';
import { RenderErrorBoundary } from '../../RenderErrorBoundary';
import { useDebouncer } from '@tanstack/react-pacer';
import isEqual from '@guanghechen/fast-deep-equal';

type AllFieldRenderers = FieldRenderFunctions<
  Config<{
    fields: FieldDefinition;
  }>
>;

// Props accepted by any field renderer in fieldTypes (union of all variants)
type FieldWrapperProps = Parameters<AllFieldRenderers[keyof AllFieldRenderers]>[0];

const FieldWrapperInner = ({ field, name, onChange, value, id }: FieldWrapperProps) => {
  const [localValue, setLocalValue] = useState(value);
  const latestValueRef = useRef(value);
  useEffect(() => {
    latestValueRef.current = localValue;
  }, [localValue]);

  // use tanstack debounce to trigger on change after 150ms
  const debouncedOnChange = useDebouncer(onChange, {
    wait: 150,
  });

  // Keep localValue in sync with prop value (prop is source of truth)
  useEffect(() => {
    if (!isEqual(value, latestValueRef.current)) {
      setLocalValue(value);
    }
    // Cancel any pending debounced call when the source-of-truth changes
    debouncedOnChange.cancel();
  }, [value, debouncedOnChange]);

  const _onChange = useCallback(
    (next: unknown) => {
      setLocalValue(next);
      // Reset and schedule the latest value to ensure trailing delivery
      debouncedOnChange.cancel();
      debouncedOnChange.maybeExecute(next);
    },
    [debouncedOnChange]
  );

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
      onChange={_onChange}
      value={localValue}
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
  if (!isEqual(prevProps.value, nextProps.value)) return false;
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
        icon: FieldWrapper,
      },
    },
  };
};
