import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { type BreakPoint, getBreakpoints } from '@hakit/components';
import { Column, Row } from '@components/Layout';
import { useThemeStore } from '@hakit/components';
import { DEFAULT_BREAKPOINTS } from '@constants';
import { BreakpointItem, IconKey } from '@typings/breakpoints';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { SelectField } from '@components/Form/Field/Select';
import { InputField } from '@components/Form/Field/Input';
import { SwitchField } from '@components/Form/Field/Switch';
import { CircleHelp, Edit, TabletSmartphone } from 'lucide-react';
import { Modal, ModalActions } from '@components/Modal';
import { breakpointItemToBreakPoints } from '@helpers/editor/breakpoints';
import { IconButton, PrimaryButton } from '@components/Button';
import { Tooltip } from '@components/Tooltip';
import { BREAKPOINT_ICONS } from '@constants';
import { updateDashboardForUser } from '@services/dashboard';
import { toast } from 'react-toastify';
import styles from './ViewportControls.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { FieldOption } from '@typings/fields';

const getClassName = getClassNameFactory('ViewportControls', styles);

// Helper function to get icon component by key
const getIconComponent = (iconKey?: string, fallbackBreakpointId?: BreakPoint) => {
  if (!iconKey || !(iconKey in BREAKPOINT_ICONS)) {
    // If no icon provided, try to get default for specific breakpoint
    if (fallbackBreakpointId) {
      const defaultIcon = getDefaultIconForBreakpoint(fallbackBreakpointId);
      return BREAKPOINT_ICONS[defaultIcon].component;
    }
    return TabletSmartphone; // Final fallback
  }
  return BREAKPOINT_ICONS[iconKey as IconKey].component;
};

// Helper function to get default icon for a breakpoint
const getDefaultIconForBreakpoint = (breakpointId: BreakPoint): IconKey => {
  const defaultBreakpoint = DEFAULT_BREAKPOINTS.find(bp => bp.id === breakpointId);
  return (defaultBreakpoint?.icon as IconKey) || 'tablet-smartphone';
};

function findPreviousNonDisabledBreakpoint(breakpoints: Required<BreakpointItem[]>, id: BreakPoint) {
  // Find this breakpoint in the array
  const idx = breakpoints.findIndex(v => v.id === id);
  if (idx === -1) return undefined;

  // Walk backwards to find the first non-disabled viewport
  for (let i = idx - 1; i >= 0; i--) {
    if (!breakpoints[i].disabled) {
      return breakpoints[i];
    }
  }
  return undefined;
}

/**
 * Converts a typical media query like:
 *   "(max-width: 480px)" -> "width <= 480px"
 *   "(min-width: 481px) and (max-width: 1024px)" -> "width >= 481px && width <= 1024px"
 *   "(min-width: 1025px)" -> "width >= 1025px"
 * into a human-friendly string using JavaScript-like comparison operators.
 */
export function formatMediaQuery(media: string): string {
  const minMatch = media.match(/\(min-width:\s*(\d+)px\)/);
  const maxMatch = media.match(/\(max-width:\s*(\d+)px\)/);

  const min = minMatch ? parseInt(minMatch[1], 10) : undefined;
  const max = maxMatch ? parseInt(maxMatch[1], 10) : undefined;

  if (min != null && max != null) {
    // e.g. (min-width: 481px) and (max-width: 1024px)
    return `Between ${min}px and ${max}px`;
  } else if (min != null) {
    if (min <= 1) {
      // e.g. (min-width: 0px)
      return `All screen sizes`;
    }
    // e.g. (min-width: 1025px)
    return `Above ${min}px`;
  } else if (max != null) {
    // e.g. (max-width: 480px)
    return `Up to ${max}px`;
  }

  return media;
}

const ViewportControlsComponent = () => {
  const [editingBreakpoints, setEditingBreakpoints] = useState(false);
  const breakpointItems = useGlobalStore(store => store.breakpointItems);

  // Show only enabled breakpoints in dropdown
  const enabledOptions = useMemo(() => breakpointItems.filter(item => !item.disabled), [breakpointItems]);

  const [controlledBreakpointItems, setControlledBreakpointItems] = useState(breakpointItems);

  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);
  const setActiveBreakpoint = useGlobalStore(state => state.setActiveBreakpoint);
  const setPreviewCanvasWidth = useGlobalStore(state => state.setPreviewCanvasWidth);

  // Zoom display (read-only - actual zoom is calculated by Preview component)
  const previewZoom = useGlobalStore(store => store.previewZoom);

  // Sync canvas width with active breakpoint (use all breakpointItems, not just enabled)
  useEffect(() => {
    if (activeBreakpoint && breakpointItems.length > 0) {
      const currentBreakpointItem = breakpointItems.find(item => item.id === activeBreakpoint);
      if (currentBreakpointItem) {
        setPreviewCanvasWidth(currentBreakpointItem.width);
      }
    }
  }, [activeBreakpoint, breakpointItems, setPreviewCanvasWidth]);

  // Helper: return new array with xlg auto-sized to (max enabled + 1) if non-editable
  const computeAutoXlgWidth = useCallback((items: BreakpointItem[]) => {
    const enabledOthers = items.filter(bp => !bp.disabled && bp.id !== 'xlg');
    if (enabledOthers.length === 0) return items;
    const maxWidth = Math.max(...enabledOthers.map(bp => bp.width));
    const desiredXlg = maxWidth + 1;
    const idx = items.findIndex(bp => bp.id === 'xlg' && !bp.editable);
    if (idx === -1) return items;
    const current = items[idx];
    if (current.width === desiredXlg) return items;
    const next = [...items];
    next[idx] = { ...current, width: desiredXlg };
    return next;
  }, []);

  const onIconChange = useCallback((id: BreakPoint, icon: IconKey) => {
    setControlledBreakpointItems(prev => {
      const next = [...prev];
      const i = next.findIndex(b => b.id === id);
      if (i !== -1) next[i] = { ...next[i], icon };
      return next;
    });
  }, []);

  const onNameChange = useCallback((id: BreakPoint, title: string) => {
    setControlledBreakpointItems(prev => {
      const next = [...prev];
      const i = next.findIndex(b => b.id === id);
      if (i !== -1) next[i] = { ...next[i], title };
      return next;
    });
  }, []);

  const onSizeChange = useCallback(
    (id: BreakPoint, width: number) => {
      setControlledBreakpointItems(prev => {
        const next = [...prev];
        const i = next.findIndex(b => b.id === id);
        if (i !== -1) next[i] = { ...next[i], width };
        return computeAutoXlgWidth(next);
      });
    },
    [computeAutoXlgWidth]
  );

  const onStatusChange = useCallback(
    (id: BreakPoint, enabled: boolean) => {
      setControlledBreakpointItems(prev => {
        const next = [...prev];
        const i = next.findIndex(b => b.id === id);
        if (i !== -1) next[i] = { ...next[i], disabled: !enabled };
        return computeAutoXlgWidth(next);
      });
    },
    [computeAutoXlgWidth]
  );

  const activeViewport = useGlobalStore(state => state.activeBreakpoint);
  // Try to find in enabled options first, but fall back to all breakpoints if needed (for disabled but selected breakpoints)
  const value = useMemo(() => {
    const enabledValue = enabledOptions.find(item => item.id === activeViewport);
    if (enabledValue) return enabledValue;
    // If not in enabled options, check all breakpoints (for edge case where disabled breakpoint is selected)
    return breakpointItems.find(item => item.id === activeViewport);
  }, [activeViewport, enabledOptions, breakpointItems]);
  // if this fails, it means the breakpoint object isn't valid
  const getQueries = useCallback((items: BreakpointItem[]) => {
    try {
      const breakpoints = breakpointItemToBreakPoints(items);
      // handles the case where all breakpoints are disabled, we need to send at least one extra breakpoint
      // to hakit function to get a formatted object
      if (Object.keys(breakpoints).length === 1 && breakpoints['xlg' as 'lg']) {
        breakpoints['lg'] = (breakpoints['xlg' as 'lg'] || 0) - 1;
      }
      if (!breakpoints) {
        return null;
      }
      return getBreakpoints(breakpoints);
    } catch (e) {
      console.error('Get queries error', e);
      // ignore the error, validation will show errors in the fields
      return null;
    }
  }, []);

  const validBreakpoints = useMemo(() => {
    // create a deep clone of the breakpoint items
    const breakpointItemsClone = JSON.parse(JSON.stringify(controlledBreakpointItems)) as BreakpointItem[];
    // this will be true if all breakpoints are disabled, leaving only the "xlg" option
    const hasOnlyOne = breakpointItemsClone.filter(item => !item.disabled).length === 1;
    // if there's only one breakpoint, set the 'lg' to be the same as the 'xlg'
    const xlg = breakpointItemsClone.find(item => item.id === 'xlg');
    if (xlg && hasOnlyOne) {
      const lg = breakpointItemsClone.find(item => item.id === 'lg');
      if (lg) {
        lg.disabled = false;
        lg.width = xlg.width - 1;
      }
    }
    const result = getQueries(breakpointItemsClone);
    if (!result) {
      return null;
    }
    return breakpointItemsClone;
  }, [getQueries, controlledBreakpointItems]);

  const saveBreakpoints = useCallback(() => {
    if (validBreakpoints) {
      useGlobalStore.getState().setBreakPointItems(controlledBreakpointItems);
      setEditingBreakpoints(false);
      useThemeStore.getState().setBreakpoints(breakpointItemToBreakPoints(validBreakpoints));
      const dashboard = useGlobalStore.getState().dashboard;

      // If the active breakpoint is now disabled, fall back to xlg
      if (activeViewport && !validBreakpoints.find(bp => bp.id === activeViewport && !bp.disabled)) {
        setActiveBreakpoint('xlg');
      }

      if (!dashboard) {
        toast('Dashboard not found', {
          type: 'error',
          theme: 'dark',
        });
      } else {
        updateDashboardForUser(
          {
            ...dashboard,
            breakpoints: validBreakpoints,
          },
          {
            success: 'Updated Dashboard',
            error: 'Error updating Dashboard',
          }
        );
      }
    }
  }, [activeViewport, setActiveBreakpoint, controlledBreakpointItems, validBreakpoints]);

  const onClose = useCallback(() => {
    setEditingBreakpoints(false);
  }, []);

  if (!value) {
    return null;
  }
  const queries = getQueries(controlledBreakpointItems);
  const valueQueryHelper = getQueries([value]);

  return (
    <Row className={getClassName('ViewportControls')} alignItems='flex-start' justifyContent='flex-start' wrap='nowrap'>
      <Tooltip
        placement='bottom'
        title={
          <>
            {valueQueryHelper?.[value.id] && (
              <span className={getClassName('ViewportControls-helperText')}>
                {formatMediaQuery(valueQueryHelper?.[value.id] as string)}
              </span>
            )}
          </>
        }
      >
        <SelectField
          id='breakpoint'
          value={{
            label: value.title,
            value: value.id,
          }}
          options={enabledOptions.map(item => ({ label: item.title, value: item.id }))}
          name='breakpoint'
          size='small'
          startAdornment={React.createElement(getIconComponent(value?.icon, value?.id), { size: 16 })}
          renderOption={option => (
            <Row gap='0.5rem' alignItems='center'>
              {option.label}
            </Row>
          )}
          onChange={option => {
            // Only set the active breakpoint - canvas width will be synced by useEffect
            setActiveBreakpoint(option.value);
          }}
        />
      </Tooltip>

      <IconButton
        aria-label='Edit Breakpoints'
        icon={<Edit size={14} />}
        size='xs'
        onClick={() => setEditingBreakpoints(true)}
        tooltipProps={{
          placement: 'bottom',
        }}
        variant='transparent'
        style={{
          marginLeft: 'var(--space-2)',
        }}
      />

      {/* Zoom Display (read-only) */}
      <Row className={getClassName('ViewportControls-zoomControls')}>
        <span className={getClassName('ViewportControls-zoomDisplay')} title='Auto-scaled zoom level'>
          {Math.round(previewZoom * 100)}% (auto)
        </span>
      </Row>
      <Modal
        open={editingBreakpoints}
        title='Breakpoints'
        onClose={onClose}
        description='Breakpoints let you customize the layout/options for different screen sizes. Each enabled breakpoint must be larger than the one before it.'
      >
        <Column gap='1rem' fullWidth>
          {controlledBreakpointItems.map((item, index) => {
            // find the previous non-disabled breakpoint
            // and check if the current breakpoint is larger than the previous one
            const previousBreakpoint = findPreviousNonDisabledBreakpoint(controlledBreakpointItems, item.id);

            const previousWidth = index === 0 || !previousBreakpoint ? 0 : previousBreakpoint.width;
            const isWidthValue = previousWidth < item.width;
            const isTitleValid = item.title.length > 0;
            const matchedIcon = Object.entries(BREAKPOINT_ICONS).find(
              ([key]) =>
                key === item.icon || key === getDefaultIconForBreakpoint(item.id)?.[0] || key === getDefaultIconForBreakpoint(item.id)
            );
            const value: FieldOption = {
              label: matchedIcon?.[1]?.label || '',
              value: matchedIcon?.[0],
            };
            return (
              <Row
                key={item.id}
                alignItems='flex-start'
                justifyContent='space-between'
                gap='1rem'
                wrap='nowrap'
                fullWidth
                style={{
                  backgroundColor: 'var(--color-gray-900)',
                  padding: 'var(--space-3)',
                  borderRadius: '8px',
                }}
              >
                <SelectField
                  label={`Icon`}
                  name={`icon-${item.id}`}
                  readOnly={item.disabled}
                  id={`icon-${item.id}`}
                  aria-label={`Icon ${item.id}`}
                  style={{
                    width: '100%',
                    minWidth: '33%',
                    opacity: item.disabled ? '0.3' : '1',
                  }}
                  size='small'
                  value={value}
                  disabled={item.disabled}
                  options={Object.keys(BREAKPOINT_ICONS).map(key => ({ label: BREAKPOINT_ICONS[key as IconKey].label, value: key }))}
                  renderOption={option =>
                    option && BREAKPOINT_ICONS[option.value as IconKey] ? (
                      <Row gap='0.5rem' alignItems='center' justifyContent='flex-start' wrap='nowrap'>
                        {React.createElement(BREAKPOINT_ICONS[option.value as IconKey].component, { size: 18 })}
                        {BREAKPOINT_ICONS[option.value as IconKey].label}
                      </Row>
                    ) : null
                  }
                  helperText={item.disabled ? '' : 'Icon for this breakpoint'}
                  onChange={option => onIconChange(item.id, option.value as IconKey)}
                />

                <InputField
                  readOnly={item.disabled}
                  id={`name-${item.id}`}
                  name={`name-${item.id}`}
                  aria-label={`Name ${item.id}`}
                  label='Title *'
                  placeholder='Name of the breakpoint'
                  style={{
                    width: '100%',
                    minWidth: '33%',
                    opacity: item.disabled ? '0.3' : '1',
                  }}
                  error={!isTitleValid}
                  helperText={isTitleValid ? 'Name of the breakpoint' : 'Name is required'}
                  required
                  value={item.title}
                  type='text'
                  size='small'
                  disabled={(!item.editable || item.disabled) && item.id !== 'xlg'}
                  onChange={event => onNameChange(item.id, event.target.value)}
                />

                <InputField
                  label='Size *'
                  readOnly={item.disabled}
                  id={`size-${item.id}`}
                  aria-label={`Size ${item.id}`}
                  style={{
                    width: '100%',
                    minWidth: '20%',
                    maxWidth: '10rem',
                    opacity: item.disabled ? '0.3' : '1',
                  }}
                  size='small'
                  value={item.width}
                  error={!isWidthValue}
                  helperText={
                    !item.editable
                      ? 'Auto computed based on previous enabled breakpoint'
                      : isWidthValue
                        ? 'The max size for the current breakpoint'
                        : `Value should be larger than ${previousWidth}`
                  }
                  type='number'
                  disabled={!item.editable || item.disabled}
                  className={item.width === 1 && item.id === 'xlg' ? 'hide-value' : ''}
                  endAdornment={
                    queries &&
                    typeof queries[item.id] === 'string' && (
                      <Tooltip
                        title={formatMediaQuery(queries[item.id] as string)}
                        placement='top'
                        style={{
                          display: 'flex',
                        }}
                      >
                        <CircleHelp size={18} />
                      </Tooltip>
                    )
                  }
                  onChange={event => onSizeChange(item.id, parseInt(event.target.value, 10))}
                />
                {item.editable ? (
                  <SwitchField
                    style={{
                      minWidth: '70px',
                    }}
                    id={`toggle-${item.id}`}
                    name={`toggle-${item.id}`}
                    aria-label={`Status ${item.id}`}
                    label='Status'
                    size='small'
                    isolated={false}
                    checked={!item.disabled}
                    onChange={event => onStatusChange(item.id, (event.target as HTMLInputElement).checked)}
                  />
                ) : (
                  <div
                    style={{
                      minWidth: '70px',
                    }}
                  >
                    &nbsp;
                  </div>
                )}
              </Row>
            );
          })}
        </Column>
        <ModalActions>
          <PrimaryButton aria-label='Apply Breakpoints' disabled={!validBreakpoints} onClick={saveBreakpoints}>
            APPLY
          </PrimaryButton>
        </ModalActions>
      </Modal>
    </Row>
  );
};

export const ViewportControls = React.memo(ViewportControlsComponent);
