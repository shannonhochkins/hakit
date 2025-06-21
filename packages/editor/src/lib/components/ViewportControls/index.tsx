import { useCallback, useEffect, useMemo, useState } from 'react';
import { Column, Row, type BreakPoint, getBreakpoints } from '@hakit/components';
import styled from '@emotion/styled';
import { getCssVariableValue, setSidebarWidth } from '../OptionsSidebar/helpers';
import { Tooltip } from '../Tooltip';
import { useActiveBreakpoint } from '@lib/hooks/useActiveBreakpoint';
import { useThemeStore } from '@hakit/components';
import { DEFAULT_BREAKPOINTS } from '@lib/constants';
import { BreakpointItem } from '@typings/breakpoints';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { SelectField } from '@lib/components/Form/Fields/Select';
import { InputField } from '@lib/components/Form/Fields/Input';
import { SwitchField } from '@lib/components/Form/Fields/Switch';
import { CircleHelp, Edit, TabletSmartphone } from 'lucide-react';
import { Modal, ModalActions } from '@lib/page/shared/Modal';
import { breakpointItemToBreakPoints } from '@lib/helpers/breakpoints';
import { PrimaryButton } from '@lib/page/shared/Button';

const StyledViewportControls = styled(Row)`
  min-height: var(--header-height);
  max-height: var(--header-height);
  display: flex;
  align-items: center;
`;

const HelperText = styled.span`
  color: var(--puck-color-grey-03);
  font-size: 0.85rem;
  font-weight: 400;
  margin-left: var(--puck-space-px);
`;


function findPreviousNonDisabledBreakpoint(
  breakpoints: Required<BreakpointItem[]>,
  id: BreakPoint
) {
  // Find this breakpoint in the array
  const idx = breakpoints.findIndex((v) => v.id === id);
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
  const [editingBreakpoints, setEditingBreakpoints] =  useState(false);
  const breakpointItems = useGlobalStore(store => store.breakpointItems);
  const setBreakPointItems = useGlobalStore(store => store.setBreakPointItems);
  const options = useMemo(() => breakpointItems.filter(item => !item.disabled), [breakpointItems]);
  const [controlledBreakpointItems, setControlledBreakpointItems] = useState(breakpointItems);
  const setBreakpoints = useThemeStore(store => store.setBreakpoints);

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
  }, [controlledBreakpointItems]);

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
      return getBreakpoints(breakpoints)
    } catch (e) {
      console.error('Get queries error', e);
      // ignore the error, validation will show errors in the fields
      return null;
    }
  }, [
    // TODO this may not be needed, if this logic breaks, we can uncomment
    // controlledBreakpointItems
  ]);

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


  if (!value) {
    return null;
  }
  const queries = getQueries(controlledBreakpointItems);
  const valueQueryHelper = getQueries([value]);

  return (
    <StyledViewportControls alignItems='flex-start' justifyContent='flex-start' wrap='nowrap'>
      <SelectField
        value={value}
        options={[...options, {
          id: 'new',
          title: 'Customize',
          width: -1,
        }]}
        getOptionLabel={(option) => option.id === 'new' ? <Row gap="0.5rem" fullHeight>
          <Edit size={16} />
          Customize
        </Row> : option.title}
        startAdornment={<TabletSmartphone size={36} style={{
          marginRight: '0.5rem',
        }} />}
        // getOptionValue={(option) => option.width}
        onChange={(event) => {
          const value = event?.target.value;
          if (typeof value === 'string' || value.id === 'new') {
            // empty value, consider we've hit the "edit" option
            setEditingBreakpoints(true);
          } else {
            const previewMargin = getCssVariableValue("--puck-space-px", 16);

            if (value?.id === "xlg") {
              // find the last non‐disabled viewport before xlg:
              const prev = findPreviousNonDisabledBreakpoint(DEFAULT_BREAKPOINTS, "xlg");
              if (!prev) {
                // If none found, fallback logic
                // e.g. "fill up the screen"
                setSidebarWidth(window.innerWidth - (value.width - 1));
              } else {
                // replicate the old xlg math:
                setSidebarWidth(
                  window.innerWidth - (value.width + prev.width - 1)
                );
              }
            } else if (value) {
              // replicate the old non-xlg math
              setSidebarWidth(
                window.innerWidth - (value.width - 1) - previewMargin * 2
              );
            }
          }
          
        }}
      />
      {valueQueryHelper?.[value.id] && <HelperText>{formatMediaQuery(valueQueryHelper?.[value.id] as string)}</HelperText>}
      <Modal open={editingBreakpoints} title="Breakpoints" onClose={() => {
        setEditingBreakpoints(false);
      }}>
        <p>Breakpoints let you customize the layout/options for different screen sizes. Each enabled breakpoint must be larger than the one before it.</p>
        <Column gap="1rem" fullWidth>
          {controlledBreakpointItems.map((item, index) => {
            // find the previous non-disabled breakpoint
            // and check if the current breakpoint is larger than the previous one
            const previousBreakpoint = findPreviousNonDisabledBreakpoint(controlledBreakpointItems, item.id);

            const previousWidth = index === 0 || !previousBreakpoint ? 0 : previousBreakpoint.width;
            const isWidthValue = previousWidth < item.width;
            const isTitleValid = item.title.length > 0;
            return <Row key={item.id} alignItems='flex-start' justifyContent='space-between' gap="1rem" wrap='nowrap' fullWidth style={{
              backgroundColor: 'var(--puck-color-grey-10)',
              padding: item.disabled ? '0 0 0.5rem 1rem' : '0.5rem 1rem 1rem',
              borderRadius: '8px',
            }}>
            <InputField
              readOnly={item.disabled}
              style={{
                width: '100%',
              }}
              error={!isTitleValid}
              helperText={!item.editable ? '' : isTitleValid ? 'Enter a name for this breakpoint' : 'Name is required'}
              required
              value={item.title}
              label="Title"
              type="text"
              disabled={(!item.editable || item.disabled) && item.id !== 'xlg'}
              onChange={event => {
              const val = event.target.value;
                setControlledBreakpointItems((prev) => {
                  const newItems = [...prev];
                  const index = newItems.findIndex(i => i.id === item.id);
                  if (index !== -1) {
                    newItems[index] = {
                      ...newItems[index],
                      title: val
                    };
                  }
                  return newItems;
                });
            }} />
            <InputField
              readOnly={item.disabled}
              style={{
                width: '100%',
                opacity: item.disabled ? '0' : '1',
              }}
              value={item.width}
              error={!isWidthValue}
              helperText={!item.editable ? '' : isWidthValue ? 'Enter the max size this breakpoint' : `Value should be larger than ${previousWidth}`}
              label="Size"
              type="number"
              disabled={!item.editable || item.disabled}
              className={item.width === 1 && item.id === 'xlg' ? 'hide-value' : ''}
              slotProps={{
                input: {
                  endAdornment: queries && typeof queries[item.id] === 'string' && <Tooltip title={formatMediaQuery(queries[item.id] as string)} placement='top' style={{
                    display: 'flex'
                  }}>
                    <CircleHelp size={18} />
                  </Tooltip>
                }
              }}
              onChange={event => {
                const val = event.target.value;
                setControlledBreakpointItems((prev) => {
                  const newItems = [...prev];
                  const index = newItems.findIndex(i => i.id === item.id);
                  if (index !== -1) {
                    newItems[index] = {
                      ...newItems[index],
                      width: parseInt(val, 10)
                    };
                  }
                  return newItems;
                });
              }} />
            {item.editable ? <SwitchField
              style={{
                minWidth: '70px',
              }}
              checked={!item.disabled}
              onChange={(event) => {
                const val = (event.target as HTMLInputElement).checked;
                setControlledBreakpointItems((prev) => {
                  const newItems = [...prev];
                  const index = newItems.findIndex(i => i.id === item.id);
                  if (index !== -1) {
                    newItems[index] = {
                      ...newItems[index],
                      disabled: !val
                    };
                  }
                  return newItems;
                });
              }} /> : <div style={{
                minWidth: '70px',
              }}>&nbsp;</div>}
          </Row>
          })}
        </Column>
        <ModalActions>
          <PrimaryButton disabled={!validBreakpoints} onClick={() => {
            if (validBreakpoints) {
              setBreakPointItems(controlledBreakpointItems);
              setEditingBreakpoints(false);
              setBreakpoints(breakpointItemToBreakPoints(validBreakpoints));
            }
          }}>APPLY</PrimaryButton>
        </ModalActions>
      </Modal>
    </StyledViewportControls>
  );
};