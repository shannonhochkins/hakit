import {
  MenuItem,
  // type MenuItemProps,
  Select as MuiSelect,
  SelectProps
} from '@mui/material';
import styled from '@emotion/styled';
import React from 'react';

const StyledMenuItem = styled(MenuItem)`
  background: var(--color-gray-500);
  color: var(--color-gray-100);
  &:hover, &:focus, &:active {
    background: var(--color-gray-400);
    color: var(--color-gray-100);
  }
  &.Mui-selected {
    background: var(--color-secondary-500);
    color: var(--color-gray-50);
    &:hover, &:focus, &:active {
      background: var(--color-secondary-500);
      color: var(--color-gray-50);
    }
  }
`

const StyledSelect = styled(MuiSelect)`
  color: currentColor;
  svg {
    color: currentColor;
  }
` as unknown as typeof MuiSelect;

export const SelectField = <Option,>({
  // getOptionValue,
  getOptionLabel,
  onChange,
  value,
  options,
  style = {},
  ...props
}: Omit<SelectProps<Option>, 'value'> & {
  value: Option;
  options: Option[];
  // getOptionValue: (option: Option) => MenuItemProps['value'];
  getOptionLabel: (option: Option) => React.ReactNode;
}) => {
  return (
    <StyledSelect
      onChange={onChange}
      value={value}
      style={{
        ...style,
        maxWidth: style?.maxWidth ?? '100%',
      }}
      {...props}
    >
      {options.map((option, index) => (
        <StyledMenuItem key={index} value={option as string} selected>
          {getOptionLabel(option)}
        </StyledMenuItem>
      ))}
    </StyledSelect>
  );
};
