import { useCallback, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { Column, Row, type BreakPoint, getBreakpoints } from '@hakit/components';
import styled from '@emotion/styled';
import { useActiveBreakpoint } from '@hooks/useActiveBreakpoint';
import { useThemeStore } from '@hakit/components';
import { DEFAULT_BREAKPOINTS } from '@constants';
import { BreakpointItem, IconKey } from '@typings/breakpoints';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { SelectField } from '@components/Form/Fields/Select';
import { InputField } from '@components/Form/Fields/Input';
import { SwitchField } from '@components/Form/Fields/Switch';
import { CircleHelp, Edit, TabletSmartphone } from 'lucide-react';
import { Modal, ModalActions } from '@components/Modal';
import { breakpointItemToBreakPoints } from '@helpers/editor/breakpoints';
import { PrimaryButton } from '@components/Button';
import { Tooltip } from '@components/Tooltip';
import { FieldGroup } from '@components/Form/FieldWrapper/FieldGroup';
import { FieldLabel } from '@components/Form/FieldWrapper/FieldLabel';
import { BREAKPOINT_ICONS } from '@constants';
import { updateDashboardForUser } from '@services/dashboard';
import { toast } from 'react-toastify';

const StyledViewportControls = styled(Row)`
  min-height: var(--header-height);
  max-height: var(--header-height);
  display: flex;
  align-items: center;
`;

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

const HelperText = styled.span`
  color: var(--color-gray-200);
  font-size: 0.85rem;
  font-weight: 400;
`;

const ZoomControls = styled(Row)`
  gap: var(--space-2);
  align-items: center;
  margin-left: var(--space-4);
  padding-left: var(--space-4);
  border-left: 1px solid var(--color-border);
`;

const ZoomDisplay = styled.span`
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  min-width: 38px;
  text-align: center;
  padding: 0 4px;
  border-radius: 4px;
`;

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

export const ViewportControls = () => {
  const [editingBreakpoints, setEditingBreakpoints] = useState(false);
  const breakpointItems = useGlobalStore(store => store.breakpointItems);
  const options = useMemo(() => breakpointItems.filter(item => !item.disabled), [breakpointItems]);
  const [controlledBreakpointItems, setControlledBreakpointItems] = useState(breakpointItems);

  // Persist selected breakpoint in localStorage
  const [selectedBreakpointId, setSelectedBreakpointId] = useLocalStorage<BreakPoint>('selectedBreakpoint');

  // Zoom controls state (display only - auto-scaling is always enabled)
  const previewZoom = useGlobalStore(store => store.previewZoom);

  useEffect(() => {
    // find the largest non-disabled breakpoint excluding xlg
    const largestBreakpoint = controlledBreakpointItems
      .filter(item => !item.disabled && item.id !== 'xlg')
      .reduce((prev, curr) => (prev.width > curr.width ? prev : curr), { width: 0 });
    // now set the xlg breakpoint to be 1px larger than the largest non-disabled breakpoint
    // only set the state if the xlg value has changed
    const newBreakpointItems = [...controlledBreakpointItems];
    const xlgIndex = newBreakpointItems.findIndex(item => item.id === 'xlg');
    if (xlgIndex !== -1) {
      const xlgItem = newBreakpointItems[xlgIndex];
      if (largestBreakpoint.width + 1 !== xlgItem.width) {
        newBreakpointItems[xlgIndex] = {
          ...xlgItem,
          width: largestBreakpoint.width + 1,
        };
        setControlledBreakpointItems(newBreakpointItems);
      }
    }
  }, [controlledBreakpointItems]); // One-time initialization - only handle the xlg fallback case

  useEffect(() => {
    if (options.length > 0 && breakpointItems.length > 0) {
      const globalStore = useGlobalStore.getState();
      // Only set fallback if no localStorage preference and nothing is set yet
      if (!selectedBreakpointId && globalStore.previewCanvasWidth === 0) {
        const xlgBreakpoint = breakpointItems.find(item => item.id === 'xlg');
        if (xlgBreakpoint) {
          setSelectedBreakpointId('xlg'); // Use localStorage as source of truth
          globalStore.setPreviewCanvasWidth(xlgBreakpoint.width);
        }
      }
    }
  }, [options, breakpointItems, selectedBreakpointId, setSelectedBreakpointId]);

  // Sync selectedBreakpointId to global store - localStorage is source of truth
  useEffect(() => {
    if (selectedBreakpointId && options.length > 0) {
      const globalStore = useGlobalStore.getState();

      // Only update global store if it's different from localStorage
      if (globalStore.activeBreakpoint !== selectedBreakpointId) {
        // Also set canvas width when syncing
        const savedBreakpoint = options.find(item => item.id === selectedBreakpointId);
        if (savedBreakpoint) {
          if (savedBreakpoint.id === 'xlg') {
            const xlgBreakpoint = breakpointItems.find(item => item.id === 'xlg');
            if (xlgBreakpoint) {
              globalStore.setPreviewCanvasWidth(xlgBreakpoint.width);
            }
          } else if (savedBreakpoint.width > 0) {
            globalStore.setPreviewCanvasWidth(savedBreakpoint.width);
          }
        }
      }
    }
  }, [selectedBreakpointId, options, breakpointItems]);

  const activeViewport = useActiveBreakpoint();
  const value = useMemo(() => options.find(item => item.id === activeViewport), [activeViewport, options]);
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

      // Update the canvas min to match the users input
      const activeBreakpointObject = validBreakpoints.find(bp => bp.id === activeViewport);
      if (activeBreakpointObject) {
        useGlobalStore.getState().setPreviewCanvasWidth(activeBreakpointObject.width);
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
  }, [activeViewport, controlledBreakpointItems, validBreakpoints]);

  if (!value) {
    return null;
  }
  const queries = getQueries(controlledBreakpointItems);
  const valueQueryHelper = getQueries([value]);

  return (
    <StyledViewportControls alignItems='flex-start' justifyContent='flex-start' wrap='nowrap'>
      <Tooltip
        placement='bottom'
        title={<>{valueQueryHelper?.[value.id] && <HelperText>{formatMediaQuery(valueQueryHelper?.[value.id] as string)}</HelperText>}</>}
      >
        <SelectField
          value={value}
          options={[
            ...options,
            {
              id: 'new',
              title: 'Customize',
              width: -1,
            },
          ]}
          size='small'
          getOptionLabel={option =>
            option.id === 'new' ? (
              <Row gap='0.5rem' fullHeight>
                <Edit size={16} />
                Customize
              </Row>
            ) : (
              <Row
                gap='0.5rem'
                alignItems='center'
                style={{
                  paddingRight: 'var(--space-4)',
                }}
              >
                {React.createElement(getIconComponent((option as BreakpointItem).icon, (option as BreakpointItem).id), { size: 16 })}
                {option.title}
              </Row>
            )
          }
          onChange={event => {
            const value = event?.target.value;
            if (typeof value === 'string' || value.id === 'new') {
              // empty value, consider we've hit the "edit" option
              setEditingBreakpoints(true);
            } else {
              const bp = value as BreakpointItem;
              // Save selected breakpoint to localStorage - this will trigger the sync effect
              setSelectedBreakpointId(bp.id);
              const globalStore = useGlobalStore.getState();
              globalStore.setPreviewCanvasWidth(bp.width);
            }
          }}
        />
      </Tooltip>

      {/* Zoom Display (read-only) */}
      <ZoomControls>
        <ZoomDisplay title='Auto-scaled zoom level'>{Math.round(previewZoom * 100)}% (auto)</ZoomDisplay>
      </ZoomControls>
      <Modal
        open={editingBreakpoints}
        title='Breakpoints'
        onClose={() => {
          setEditingBreakpoints(false);
        }}
      >
        <p>
          Breakpoints let you customize the layout/options for different screen sizes. Each enabled breakpoint must be larger than the one
          before it.
        </p>
        <Column gap='1rem' fullWidth>
          {controlledBreakpointItems.map((item, index) => {
            // find the previous non-disabled breakpoint
            // and check if the current breakpoint is larger than the previous one
            const previousBreakpoint = findPreviousNonDisabledBreakpoint(controlledBreakpointItems, item.id);

            const previousWidth = index === 0 || !previousBreakpoint ? 0 : previousBreakpoint.width;
            const isWidthValue = previousWidth < item.width;
            const isTitleValid = item.title.length > 0;
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
                <FieldGroup className='full-width'>
                  <FieldLabel
                    label='Icon'
                    htmlFor={`icon-${item.id}`}
                    description={item.disabled ? '' : 'Icon for this breakpoint'}
                    style={{
                      opacity: item.disabled ? '0.3' : '1',
                    }}
                  />
                  <SelectField
                    readOnly={item.disabled}
                    id={`icon-${item.id}`}
                    style={{
                      width: '100%',
                      opacity: item.disabled ? '0.3' : '1',
                    }}
                    size='small'
                    value={
                      Object.entries(BREAKPOINT_ICONS).find(([key]) => key === (item.icon || getDefaultIconForBreakpoint(item.id)))?.[0] ||
                      getDefaultIconForBreakpoint(item.id)
                    }
                    disabled={item.disabled}
                    options={Object.keys(BREAKPOINT_ICONS)}
                    getOptionLabel={iconKey => (
                      <Row gap='0.5rem' alignItems='center' justifyContent='flex-start'>
                        {React.createElement(BREAKPOINT_ICONS[iconKey as IconKey].component, { size: 18 })}
                        {BREAKPOINT_ICONS[iconKey as IconKey].label}
                      </Row>
                    )}
                    onChange={event => {
                      const val = event.target.value;
                      setControlledBreakpointItems(prev => {
                        const newItems = [...prev];
                        const index = newItems.findIndex(i => i.id === item.id);
                        if (index !== -1) {
                          newItems[index] = {
                            ...newItems[index],
                            icon: val as IconKey,
                          };
                        }
                        return newItems;
                      });
                    }}
                  />
                </FieldGroup>

                <FieldGroup className='full-width'>
                  <FieldLabel
                    label='Title *'
                    htmlFor={`name-${item.id}`}
                    description={item.disabled ? '' : 'Name of the breakpoint'}
                    style={{
                      opacity: item.disabled ? '0.3' : '1',
                    }}
                  />
                  <InputField
                    readOnly={item.disabled}
                    id={`name-${item.id}`}
                    style={{
                      width: '100%',
                      opacity: item.disabled ? '0.3' : '1',
                    }}
                    error={!isTitleValid}
                    helperText={!item.editable ? '' : isTitleValid ? '' : 'Name is required'}
                    required
                    value={item.title}
                    type='text'
                    disabled={(!item.editable || item.disabled) && item.id !== 'xlg'}
                    onChange={event => {
                      const val = event.target.value;
                      setControlledBreakpointItems(prev => {
                        const newItems = [...prev];
                        const index = newItems.findIndex(i => i.id === item.id);
                        if (index !== -1) {
                          newItems[index] = {
                            ...newItems[index],
                            title: val,
                          };
                        }
                        return newItems;
                      });
                    }}
                  />
                </FieldGroup>

                <FieldGroup className='full-width'>
                  <FieldLabel
                    htmlFor={`size-${item.id}`}
                    label='Size *'
                    description={item.disabled ? '' : 'The max size for the current breakpoint'}
                    style={{
                      opacity: item.disabled ? '0.3' : '1',
                    }}
                  />
                  <InputField
                    readOnly={item.disabled}
                    id={`size-${item.id}`}
                    style={{
                      width: '100%',
                      opacity: item.disabled ? '0.3' : '1',
                    }}
                    value={item.width}
                    error={!isWidthValue}
                    helperText={!item.editable ? '' : isWidthValue ? '' : `Value should be larger than ${previousWidth}`}
                    type='number'
                    disabled={!item.editable || item.disabled}
                    className={item.width === 1 && item.id === 'xlg' ? 'hide-value' : ''}
                    slotProps={{
                      input: {
                        endAdornment: queries && typeof queries[item.id] === 'string' && (
                          <Tooltip
                            title={formatMediaQuery(queries[item.id] as string)}
                            placement='top'
                            style={{
                              display: 'flex',
                            }}
                          >
                            <CircleHelp size={18} />
                          </Tooltip>
                        ),
                      },
                    }}
                    onChange={event => {
                      const val = event.target.value;
                      setControlledBreakpointItems(prev => {
                        const newItems = [...prev];
                        const index = newItems.findIndex(i => i.id === item.id);
                        if (index !== -1) {
                          newItems[index] = {
                            ...newItems[index],
                            width: parseInt(val, 10),
                          };
                        }
                        return newItems;
                      });
                    }}
                  />
                </FieldGroup>
                {item.editable ? (
                  <FieldGroup>
                    <FieldLabel
                      htmlFor={`toggle-${item.id}`}
                      label='Status'
                      description='Toggle this breakpoint on/off'
                      style={{
                        // intentionally hidden, screen reader will read this label
                        // including this is just visually cluttered
                        opacity: 0,
                      }}
                    />
                    <SwitchField
                      style={{
                        minWidth: '70px',
                      }}
                      id={`toggle-${item.id}`}
                      checked={!item.disabled}
                      onChange={event => {
                        const val = (event.target as HTMLInputElement).checked;
                        setControlledBreakpointItems(prev => {
                          const newItems = [...prev];
                          const index = newItems.findIndex(i => i.id === item.id);
                          if (index !== -1) {
                            newItems[index] = {
                              ...newItems[index],
                              disabled: !val,
                            };
                          }
                          return newItems;
                        });
                      }}
                    />
                  </FieldGroup>
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
    </StyledViewportControls>
  );
};
