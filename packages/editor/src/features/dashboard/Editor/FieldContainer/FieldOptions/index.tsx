import { SwitchField } from '@components/Form/Field/Switch';
import { FieldConfiguration } from '@typings/fields';
import { InfoIcon, RotateCcw, Settings } from 'lucide-react';
import { useFieldBreakpointConfig } from '@hooks/useFieldBreakpointConfig';
import { useCallback, useEffect, useRef } from 'react';
import { Menu, MenuAnchor, MenuContent, MenuDivider, MenuItem } from '@components/Menu';
import { IconButton } from '@components/Button';
import { Tooltip } from '@components/Tooltip';

export function FieldOptions({
  field,
  name,
  allowTemplates,
  onResponsiveToggleChange,
  onTemplateToggleChange,
  onResetToDefault,
  templateMode,
}: {
  field: Exclude<FieldConfiguration[string], { type: 'slot' | 'hidden' | 'object' | 'array' | 'hidden' }>;
  name: string;
  onResponsiveToggleChange: (value: boolean) => void;
  onTemplateToggleChange: (value: boolean) => void;
  onResetToDefault: () => void;
  templateMode: boolean;
  allowTemplates: boolean;
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
    (checked: boolean) => {
      if (checked !== isBreakpointModeEnabled) {
        pendingToggleRef.current = true;
        toggleBreakpointMode();
      }
    },
    [isBreakpointModeEnabled, toggleBreakpointMode]
  );

  return (
    <Menu>
      <MenuAnchor>
        <IconButton
          aria-label='Field options'
          icon={<Settings size={16} />}
          variant='transparent'
          size='xs'
          tooltipProps={{
            placement: 'left',
          }}
        />
      </MenuAnchor>
      <MenuContent>
        <MenuItem
          label='Device Values'
          disabled={!responsiveMode}
          onClick={() => handleBreakpointModeToggle(!isBreakpointModeEnabled)}
          startIcon={
            <Tooltip
              style={{
                display: 'flex',
              }}
              title={
                responsiveMode
                  ? 'Enable device values to set different values for each configured device.'
                  : "This field doesn't support device-specific values. It's fixed by the field's configuration."
              }
            >
              <InfoIcon size={16} />
            </Tooltip>
          }
          endIcon={
            <SwitchField
              size='small'
              withContainer={false}
              checked={isBreakpointModeEnabled}
              disabled={!responsiveMode}
              id='responsive-mode'
            />
          }
        />
        {allowTemplates && (
          <MenuItem
            startIcon={
              <Tooltip
                style={{
                  display: 'flex',
                }}
                title='Use a Home Assistant template to dynamically set this field’s value.'
              >
                <InfoIcon size={16} />
              </Tooltip>
            }
            onClick={() => onTemplateToggleChange(!templateMode)}
            label='Template Value'
            endIcon={<SwitchField size='small' withContainer={false} checked={templateMode} id='template-mode' />}
          />
        )}
        <MenuDivider />
        <MenuItem
          label='Reset to Default'
          onClick={onResetToDefault}
          startIcon={
            <Tooltip
              title='Reset this field to its default value'
              style={{
                display: 'flex',
              }}
            >
              <InfoIcon size={16} />
            </Tooltip>
          }
          endIcon={<RotateCcw size={16} />}
        />
      </MenuContent>
    </Menu>
  );
}
