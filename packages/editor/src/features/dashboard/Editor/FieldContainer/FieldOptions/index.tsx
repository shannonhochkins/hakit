import { SwitchField } from '@components/Form/Field/Switch';
import { Column } from '@components/Layout';
import { Modal } from '@components/Modal';
import { FieldConfiguration } from '@typings/fields';
import { CodeXml, Touchpad } from 'lucide-react';
import { useFieldBreakpointConfig } from '@hooks/useFieldBreakpointConfig';
import { useCallback, useEffect, useRef } from 'react';

export function FieldOptions({
  open,
  field,
  onClose,
  name,
  onResponsiveToggleChange,
  onTemplateToggleChange,
  templateMode,
}: {
  open: boolean;
  field: Exclude<FieldConfiguration[string], { type: 'slot' | 'hidden' | 'object' | 'array' | 'hidden' }>;
  onClose: () => void;
  name: string;
  onResponsiveToggleChange: (value: boolean) => void;
  onTemplateToggleChange: (value: boolean) => void;
  templateMode: boolean;
}) {
  // Use the shared hook for breakpoint configuration
  const { responsiveMode, isBreakpointModeEnabled, toggleBreakpointMode } = useFieldBreakpointConfig(field, name);

  // Track when we manually toggle to distinguish from external changes
  const pendingToggleRef = useRef(false);

  // Watch for store updates after manual toggle
  useEffect(() => {
    if (pendingToggleRef.current) {
      pendingToggleRef.current = false;
      onResponsiveToggleChange(isBreakpointModeEnabled);
    }
  }, [isBreakpointModeEnabled, onResponsiveToggleChange]);

  // Handle breakpoint mode toggle
  const handleBreakpointModeToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      if (checked !== isBreakpointModeEnabled) {
        pendingToggleRef.current = true;
        toggleBreakpointMode();
      }
    },
    [isBreakpointModeEnabled, toggleBreakpointMode]
  );

  return (
    <Modal open={open} onClose={onClose} title={`${field.label} options`}>
      <Column fullWidth alignItems='flex-start' justifyContent='flex-start' gap='var(--space-4)' wrap='nowrap'>
        <SwitchField
          label='Responsive Mode'
          checked={isBreakpointModeEnabled}
          onChange={handleBreakpointModeToggle}
          disabled={!responsiveMode}
          icon={<Touchpad size={16} />}
          helperText={
            responsiveMode
              ? 'Enable responsive mode for this field, this will allow you to configure different values for this field at different breakpoints.'
              : 'This field does not allow responsive values to be set. This is configured by the field definition.'
          }
          id='responsive-mode'
          name='responsive-mode'
        />
        <SwitchField
          label='Template Mode'
          checked={templateMode}
          onChange={e => onTemplateToggleChange(e.target.checked)}
          icon={<CodeXml size={16} />}
          helperText='Enable template mode for this field, this will allow you to use home assistant templates for this field value'
          id='template-mode'
          name='template-mode'
        />
      </Column>
    </Modal>
  );
}
