import { IconButton } from '@lib/components/IconButtons';
import { ReactNode, useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BreakPoint, Row } from '@hakit/components';
import { Tooltip } from '@lib/components/Tooltip';
import { Confirm } from '../../Modal/confirm';
import { FieldOptions, type FieldOption } from './FieldOptions';
import { FieldLabel } from './FieldLabel';

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
  collapsible?: {
    open?: boolean;
  };
};

type FieldWrapperProps = FieldLabelProps & {
  omitLabel?: boolean;
  description?: ReactNode;
  onToggleBreakpointMode: () => void;
  breakpointMode: boolean;
  activeBreakpoint: BreakPoint;
  providedBreakpointValues: [string, string][];
  disableBreakpoints: boolean;
};

const Label = styled.fieldset`
  outline: none;
  border: none;
  padding: 0;
  margin: 0;
  color: var(--puck-color-grey-04);
  &.collapsible {
    padding-top: 12px;
    padding: 12px;
    background-color: var(--puck-color-grey-11);
    color: var(--puck-color-grey-03);
  }
  &.bp-mode-enabled {
    position: relative;
    [class*='_IconButton_'] {
      color: var(--puck-color-grey-01);
      background-color: var(--puck-color-grey-10);
    }
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 12px;
  [class*='_Input-input_'] {
    background-color: var(--puck-color-grey-12) !important;
  }
  [class*='_ObjectField_'],
  [class*='_ArrayField_'],
  [class*='_ArrayFieldItem-summary'] {
    background-color: var(--puck-color-grey-06);
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
      border-top: 1px solid var(--puck-color-grey-06);
    }
  }
  [class*='_ArrayFieldItem_'] {
    margin-top: 1px;
  }
  [class*='_ArrayField-addButton_'] {
    margin-top: 1px;
    background-color: var(--puck-color-grey-06);
  }
  [class*='_ArrayFieldItem--isExpanded'] > [class*='_ArrayFieldItem-summary'] {
    color: var(--puck-color-grey-01);
  }
  [class*='_ArrayFieldItem-body_'] {
    background-color: var(--puck-color-grey-09);
  }
  [class*='_Input-labelIcon_'] {
    color: currentColor;
  }
  &.collapsed {
    display: none;
  }
`;
const Mark = styled.div`
  color: var(--puck-color-grey-04);
  background-color: var(--puck-color-grey-11);
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
  disableBreakpoints,
  type,
  collapsible,
  ...props
}: FieldWrapperProps) {
  const [open, setOpen] = useState(collapsible ? (collapsible?.open ?? false) : true);
  const [confirmBreakpointChange, setConfirmBreakpointChange] = useState(false);

  const fieldOptions = useMemo(() => {
    const options: FieldOption[] = [];
    // don't show the breakpoint option if it's disabled
    // TODO -  figure out why is this wrapped in collapsible?
    if (!disableBreakpoints) {
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
        selected: breakpointMode
      });
    }
    return options;
  }, [disableBreakpoints, breakpointMode, providedBreakpointValues.length, onToggleBreakpointMode]);
  
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
      className={`${className ?? ''} ${type ? `field-${type}` : ''} ${collapsible ? 'collapsible' : ''} ${breakpointMode && !disableBreakpoints ? 'bp-mode-enabled' : ''}`}
      onClick={() => {
        if (collapsible?.open) {
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
        label={label}
        description={description}
        icon={icon}
        readOnly={readOnly}
        endAdornment={<>
          {fieldOptions.length > 0 && !collapsible && <FieldOptions options={fieldOptions} />}
          {collapsible && (
            <Tooltip placement="left" title={open ? 'Collapse' : 'Expand'}>
              <IconButton onClick={onToggleBreakpointMode}>
                {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </IconButton>
            </Tooltip>
          )}
        </>}
        />
      <Field className={`puck-field ${!open && collapsible ? 'collapsed' : ''} `}>{children}</Field>
      {breakpointMode && !disableBreakpoints && (
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
