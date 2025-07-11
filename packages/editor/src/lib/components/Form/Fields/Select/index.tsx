import { MenuItem, Select as MuiSelect, SelectProps } from '@mui/material';
import styled from '@emotion/styled';
import React from 'react';

const StyledMenuItem = styled(MenuItem)`
  background: var(--color-gray-800);
  color: var(--color-gray-100);
  &:hover,
  &:focus,
  &:active {
    background: var(--color-gray-700);
    color: var(--color-gray-100);
  }
  &.Mui-selected {
    background: var(--color-primary-500);
    color: var(--color-gray-50);
    &:hover,
    &:focus,
    &:active {
      background: var(--color-primary-500);
      color: var(--color-gray-50);
    }
  }
`;

const StyledSelect = styled(MuiSelect)`
  color: var(--color-text-primary);
  background: var(--color-surface);
  border-radius: var(--radius-md);

  svg {
    color: currentColor;
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: var(--color-border);
    transition: all var(--transition-normal);
  }

  &.MuiInputBase-sizeSmall {
    .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiInputBase-inputSizeSmall {
      padding: 7px 14px;
    }
  }

  &:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline {
    border-color: var(--color-border-hover);
  }

  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &.Mui-error .MuiOutlinedInput-notchedOutline {
    border-color: var(--color-error-500);
  }

  &.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &.Mui-disabled {
    background: var(--color-surface-muted);
    color: var(--color-text-muted);

    .MuiOutlinedInput-notchedOutline {
      border-color: var(--color-border-subtle);
    }

    .MuiSelect-select {
      color: var(--color-text-muted);
      -webkit-text-fill-color: var(--color-text-muted);
    }

    svg {
      color: var(--color-text-muted);
    }
  }

  &.read-only {
    background: transparent;

    .MuiOutlinedInput-notchedOutline {
      border-color: transparent;
    }

    .MuiSelect-select {
      color: var(--color-text-muted);
      background-color: var(--color-surface-muted);
      -webkit-text-fill-color: var(--color-text-muted);
    }
  }
` as unknown as typeof MuiSelect;

export const SelectField = <Option,>({
  getOptionLabel,
  onChange,
  value,
  options,
  style = {},
  className,
  readOnly,
  ...props
}: Omit<SelectProps<Option>, 'value'> & {
  value: Option;
  options: Option[];
  getOptionLabel: (option: Option) => React.ReactNode;
  readOnly?: boolean;
}) => {
  return (
    <StyledSelect
      onChange={onChange}
      value={value}
      className={`${className ?? ''} ${readOnly ? 'read-only' : ''}`}
      style={{
        ...style,
        maxWidth: style?.maxWidth ?? '100%',
      }}
      {...props}
    >
      {options.map((option, index) => (
        <StyledMenuItem key={index} value={option as string}>
          {getOptionLabel(option)}
        </StyledMenuItem>
      ))}
    </StyledSelect>
  );
};
