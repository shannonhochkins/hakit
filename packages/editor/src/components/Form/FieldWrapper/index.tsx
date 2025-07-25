import { ReactNode, useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BreakPoint, Row } from '@hakit/components';
import { Tooltip } from '@components/Tooltip';
import { Confirm } from '../../Modal/confirm';
import { FieldOptions, type FieldOption } from './FieldOptions';
import { FieldLabel } from './FieldLabel';
import { IconButton } from '@components/Button/IconButton';

const Description = styled.div`
  font-size: 12px;
  margin-top: 6px;
  font-weight: 400;
`;

type FieldLabelProps = {
  children?: ReactNode;
  icon?: ReactNode;
  label: string;
  el?: 'label' | 'div';
  readOnly?: boolean;
  className?: string;
  type?: string;
  collapseOptions?: {
    startExpanded?: boolean;
  };
};

type FieldWrapperProps = FieldLabelProps & {
  omitLabel?: boolean;
  description?: ReactNode;
  onToggleBreakpointMode: () => void;
  breakpointMode: boolean;
  activeBreakpoint: BreakPoint;
  providedBreakpointValues: [string, string][];
  responsiveMode: boolean;
};

const Label = styled.fieldset`
  outline: none;
  border: none;
  padding: 0;
  margin: 0;
  color: var(--color-gray-300);
  background: transparent;
  &.collapsible {
    padding-top: var(--space-3);
    cursor: pointer;
    color: var(--color-gray-200);
  }
  &.bp-mode-enabled {
    position: relative;
    .hakit-field {
      border-left: 4px solid var(--color-primary-500);
    }
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  [class*='_Input-input_'] {
    background-color: var(--color-gray-950) !important;
  }
  [class*='_ObjectField_'],
  [class*='_ArrayField_'],
  [class*='_ArrayFieldItem-summary'] {
    background-color: transparent;
  }
  // nested objects
  [class*='_ObjectField_']:has([class*='_ObjectField_']) {
    border: 0;
    > fieldset {
      padding: 0;
    }
    [class*='_ObjectField_'] {
      border: 0;
    }
    .field-object:has([class*='_ObjectField_']) {
      padding: 12px 0 0 0;
      border-top: 1px solid var(--color-gray-500);
    }
  }
  [class*='_ArrayFieldItem_'] {
    margin-top: 1px;
  }
  [class*='_ArrayField-addButton_'] {
    margin-top: 1px;
    background-color: var(--color-gray-500);
  }
  [class*='_ArrayFieldItem--isExpanded'] > [class*='_ArrayFieldItem-summary'] {
    color: var(--color-gray-50);
  }
  [class*='_ArrayFieldItem-body_'] {
    background-color: var(--color-gray-800);
  }
  [class*='_Input-labelIcon_'] {
    color: currentColor;
  }
  &.collapsed {
    display: none;
  }
`;
const Mark = styled.div`
  color: var(--color-gray-300);
  background-color: var(--color-gray-950);
  padding: 4px 6px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
`;

export function FieldWrapper({
  omitLabel,
  children,
  description,
  breakpointMode,
  onToggleBreakpointMode,
  icon,
  label,
  readOnly,
  className = '',
  activeBreakpoint,
  providedBreakpointValues,
  responsiveMode,
  type,
  collapseOptions,
  ...props
}: FieldWrapperProps) {
  const [open, setOpen] = useState(collapseOptions ? (collapseOptions?.startExpanded ?? false) : true);
  const [confirmBreakpointChange, setConfirmBreakpointChange] = useState(false);

  const fieldOptions = useMemo(() => {
    const options: FieldOption[] = [];
    // don't show the breakpoint option if it's disabled
    // TODO -  figure out why is this wrapped in collapseOptions?
    if (!responsiveMode) {
      options.push({
        label: 'Enable Breakpoints',
        description: 'Enable breakpoint values for this field',
        onClick() {
          if (providedBreakpointValues.length > 1) {
            setConfirmBreakpointChange(true);
          } else {
            onToggleBreakpointMode();
          }
        },
        selected: breakpointMode,
      });
    }
    return options;
  }, [responsiveMode, breakpointMode, providedBreakpointValues.length, onToggleBreakpointMode]);

  if (omitLabel) {
    return (
      <>
        {children}
        <Description>{description}</Description>
      </>
    );
  }
  return (
    <Label
      className={`${className ?? ''} ${type ? `field-${type}` : ''} ${collapseOptions ? 'collapsible' : ''} ${breakpointMode && !responsiveMode ? 'bp-mode-enabled' : ''}`}
      onClick={() => {
        if (typeof collapseOptions === 'object') {
          setOpen(!open);
        }
      }}
      {...props}
    >
      <Confirm
        title='Are you sure?'
        open={confirmBreakpointChange}
        onCancel={() => setConfirmBreakpointChange(false)}
        onConfirm={() => {
          setConfirmBreakpointChange(false);
          onToggleBreakpointMode();
        }}
      >
        <p>
          You have saved values on one or more breakpoints, confirming this action will only keep the <b>xlg</b> value.
        </p>
      </Confirm>
      <FieldLabel
        htmlFor={``}
        label={label}
        description={description}
        icon={icon}
        readOnly={readOnly}
        className={`hakit-field-label ${!open && collapseOptions ? 'collapsed' : ''}`}
        endAdornment={
          <>
            {fieldOptions.length > 0 && !collapseOptions && <FieldOptions options={fieldOptions} />}
            {collapseOptions && (
              <IconButton
                icon={open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                onClick={e => {
                  e.stopPropagation();
                  setOpen(!open);
                }}
                variant='transparent'
                size='xs'
                tooltipProps={{
                  placement: 'left',
                }}
                aria-label={open ? 'Collapse' : 'Expand'}
              />
            )}
          </>
        }
      />
      <Field className={`hakit-field ${!open && collapseOptions ? 'collapsed' : ''} `}>{children}</Field>
      {breakpointMode && !responsiveMode && (
        <>
          <Description>
            <Row fullWidth alignItems='center' justifyContent='flex-start' gap='0.5rem'>
              <Row justifyContent='flex-start' gap='0.25rem'>
                Active <Mark>{activeBreakpoint}</Mark>
              </Row>
              {providedBreakpointValues.length > 0 && (
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
              )}
            </Row>
          </Description>
        </>
      )}
    </Label>
  );
}
