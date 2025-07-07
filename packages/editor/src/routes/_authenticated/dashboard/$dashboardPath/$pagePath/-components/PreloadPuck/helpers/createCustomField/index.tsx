/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback, useMemo, useState } from 'react';
import { createUsePuck, UiState, type DefaultComponentProps } from '@measured/puck';
import { ReactNode } from 'react';
import {
  Hash,
  Type,
  Server,
  List,
  MoreVertical,
  ChevronDown,
  CheckCircle,
  Palette,
  Volleyball,
  ExternalLink,
  TableCellsSplit,
  ImagePlus,
  CodeXml,
  Minus,
  ChevronUp,
  Touchpad,
  TouchpadOff,
} from 'lucide-react';

import { EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES } from '@client/src/routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/pageData/constants';
import type { CustomFields, CustomFieldsWithDefinition, FieldTypes } from '@typings/fields';
import { Fieldset } from './Fieldset';
import { FieldLabel } from './FieldLabel';
import { IconButton } from '@lib/components/Button/IconButton';
import { FieldWrapper } from './FieldWrapper';
import { CustomAutoField } from './CustomAutoField';
import styled from '@emotion/styled';
import { useActiveBreakpoint } from '@lib/hooks/useActiveBreakpoint';
import { Row } from '@hakit/components';
import { deepCopy } from 'deep-copy-ts';
import { Alert } from '@lib/components/Alert';
// import { Tooltip } from '@lib/components/Tooltip';

// Create an object with keys based on the extracted type values
const ICON_MAP: { [key in FieldTypes]: ReactNode } = {
  text: <Type size={16} />,
  imageUpload: <ImagePlus size={16} />,
  number: <Hash size={16} />,
  page: <ExternalLink size={16} />,
  pages: <ExternalLink size={16} />,
  array: <List size={16} />,
  object: <MoreVertical size={16} />,
  entity: <Server size={16} />,
  select: <ChevronDown size={16} />,
  service: <Volleyball size={16} />,
  radio: <CheckCircle size={16} />,
  textarea: <Type size={16} />,
  custom: <MoreVertical size={16} />,
  color: <Palette size={16} />,
  slider: <Hash size={16} />,
  grid: <TableCellsSplit size={16} />,
  code: <CodeXml size={16} />,
  divider: <Minus size={16} />,
  // not seen anyway
  hidden: <Hash size={16} />,
};

const Description = styled.div`
  font-size: 12px;
  margin-top: 6px;
  font-weight: 400;
`;

const Mark = styled.div`
  color: var(--color-gray-300);
  background-color: var(--color-gray-950);
  padding: 4px 6px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
`;

const FieldInput = styled.div`
  width: 100%;
  > * {
    width: 100%;
  }
`;

const RESPONSIVE_MODE_DEFAULT = true;

const usePuck = createUsePuck();

/**
 * Helper function to create custom fields (cf - custom field)
 */

export function createCustomField<Props extends DefaultComponentProps>(_field: CustomFields<Props>): CustomFieldsWithDefinition<Props> {
  // default values for the field
  _field.responsiveMode = EXCLUDE_FIELD_TYPES_FROM_RESPONSIVE_VALUES.includes(_field.type)
    ? false
    : (_field.responsiveMode ?? RESPONSIVE_MODE_DEFAULT);
  const field = deepCopy(_field) as CustomFieldsWithDefinition<Props>['_field'];
  return {
    type: 'custom',
    _field: field,
    render({ name, onChange: puckOnChange, value, id }) {
      // TODO - change this to use the store to retrieve if we're enabled or not
      const [breakpointMode, setBreakpointMode] = useState(false);
      // const [confirmBreakpointChange, setConfirmBreakpointChange] = useState(false);
      const [isExpanded, toggleExpanded] = useState(field.collapseOptions ? (field.collapseOptions?.startExpanded ?? false) : true);

      const _icon = useMemo(() => field.icon ?? ICON_MAP[field.type], []);
      const appState = usePuck(c => c.appState);

      // const selectedItem = usePuck(c => c.selectedItem);
      const selectedItem = usePuck(s => s.selectedItem);
      const activeBreakpoint = useActiveBreakpoint();

      const isVisible = useMemo(() => {
        if (typeof _field.visible === 'function') {
          // If there's no expected selectedItem, we can assume the root options should be shown
          const visibleData = selectedItem ? selectedItem.props : appState.data.root?.props;
          if (!visibleData) return;
          console.log('visibleData', visibleData);
          return _field.visible(visibleData);
        }
        return _field.visible ?? true;
      }, [appState.data.root?.props, selectedItem]);

      // const valOrDefault = useMemo(() => {
      //   return (
      //     puckValue ??
      //     (field.responsiveMode
      //       ? field.default
      //       : {
      //           xlg: field.default,
      //         })
      //   );
      // }, [puckValue]);

      // const [breakpointMode, setBreakpointMode] = useState(multipleBreakpointsEnabled(valOrDefault));

      // // intentionally using any here as the value will be unknown in this context
      // // and we can't use unknown as the value properties expect the shape type of the CustomField
      // const value = useMemo(() => {
      //   return field.responsiveMode ? valOrDefault : getResolvedBreakpointValue<any>(valOrDefault, activeBreakpoint);
      // }, [valOrDefault, activeBreakpoint]);

      const onChange = useCallback(
        (value: unknown, uiState?: Partial<UiState>) => {
          // TODO - Potentially hijack the value here before firing on change for things like value validation for an individual field
          if (typeof value === 'undefined') return;
          // @ts-expect-error - Types are wrong in internal types for puck, uiState is required
          puckOnChange(value, uiState);
        },
        [puckOnChange]
      );

      const onToggleBreakpointMode = useCallback(() => {
        const isBreakpointModeEnabled = !breakpointMode;
        // because the onChange method is memoized, we need to call it here to ensure the value is updated
        // immediately when the breakpoint mode is toggled
        if (!isBreakpointModeEnabled) {
          // send back the converted breakpoint value
          onChange(value);
        }
        setBreakpointMode(!breakpointMode);
      }, [breakpointMode, onChange, value]);

      const onToggleExpand = useCallback(() => {
        toggleExpanded(!isExpanded);
      }, [isExpanded]);

      if (!_icon) {
        return <Alert severity='error'>Unsupported field type: &quot;{field.type}&quot;</Alert>;
      }

      if (!isVisible) {
        return <></>;
      }

      return (
        <Fieldset
          id={id}
          className={`hakit-field ${field.className ?? ''} ${field.type ? `field-${field.type}` : ''} ${_field.collapseOptions ? 'collapsible' : ''} ${breakpointMode && field.responsiveMode ? 'bp-mode-enabled' : ''}`}
          onClick={() => {
            if (typeof field.collapseOptions === 'object') {
              toggleExpanded(!isExpanded);
            }
          }}
        >
          <FieldLabel
            label={field.label}
            description={field.description}
            icon={_icon}
            readOnly={field.readOnly}
            className={`hakit-field-label ${!isExpanded && field.collapseOptions ? 'collapsed' : ''}`}
            endAdornment={
              <>
                {field.collapseOptions && (
                  <IconButton
                    icon={isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    onClick={onToggleExpand}
                    variant='transparent'
                    size='xs'
                    tooltipProps={{
                      placement: 'left',
                    }}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  />
                )}
              </>
            }
          />
          <FieldWrapper className={`hakit-field-wrapper ${!isExpanded && field.collapseOptions ? 'collapsed' : ''} `}>
            <FieldInput className='hakit-field-input'>
              <CustomAutoField<Props> field={_field} value={value} name={name} onChange={onChange} />
            </FieldInput>
            {field.responsiveMode && (
              <IconButton
                icon={breakpointMode ? <Touchpad size={16} /> : <TouchpadOff size={16} />}
                onClick={onToggleBreakpointMode}
                active={breakpointMode}
                variant='transparent'
                size='xs'
                tooltipProps={{
                  placement: 'left',
                }}
                aria-label={breakpointMode ? 'Responsive Values Enabled' : 'Responsive Values Disabled'}
              />
            )}
          </FieldWrapper>
          {breakpointMode && field.responsiveMode && (
            <>
              <Description className='hakit-field-responsive-description'>
                <Row fullWidth alignItems='center' justifyContent='flex-start' gap='0.5rem'>
                  <Row justifyContent='flex-start' gap='0.25rem'>
                    Active <Mark>{activeBreakpoint}</Mark>
                  </Row>
                  {/* {providedBreakpointValues.length > 0 && (
                  <Row justifyContent='flex-start' gap='0.25rem'>
                    Configured{' '}
                    <Row gap='0.125rem'>
                      {providedBreakpointValues.map(([bp, val], i) => (
                        <Tooltip title={val.length > 10 ? '' : val} key={i}>
                          <Mark>{bp}</Mark>
                        </Tooltip>
                      ))}
                    </Row>
                  </Row>
                )} */}
                </Row>
              </Description>
            </>
          )}
        </Fieldset>
        // <FieldWrapper
        //   key={id}
        //   responsiveMode={field.responsiveMode ?? BREAKPOINT_LOGIC_DEFAULT_DISABLED}
        //   activeBreakpoint={activeBreakpoint}
        //   // providedBreakpointValues={Object.entries(valOrDefault ?? {}).map(([key, val]) => [key, `${val}`])}
        //   providedBreakpointValues={Object.entries({}).map(([key, val]) => [key, `${val}`])}
        //   breakpointMode={breakpointMode}
        //   onToggleBreakpointMode={() => {
        //     // const isBreakpointModeEnabled = !breakpointMode;
        //     // because the onChange method is memoized, we need to call it here to ensure the value is updated
        //     // immediately when the breakpoint mode is toggled
        //     // if (!isBreakpointModeEnabled) {
        //     //   const xlg = 'xlg' as keyof AvailableQueries;
        //     //   const newValue = {
        //     //     [xlg]: valOrDefault[xlg] ?? value,
        //     //   } as Props;
        //     //   // send back the converted breakpoint value
        //     //   puckOnChange(newValue);
        //     // }
        //     // setBreakpointMode(!breakpointMode);
        //   }}
        //   description={field.description}
        //   icon={_icon}
        //   label={field.label ?? 'Unknown'}
        //   readOnly={field.readOnly}
        //   type={field.type}
        //   collapsible={field.collapsible}
        //   className={field.className}
        // >
      );
    },
  };
}
