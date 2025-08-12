import { MenuItem, Select as MuiSelect, SelectChangeEvent, SelectProps } from '@mui/material';
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
  flex-shrink: 0;

  /* Ensure the arrow icon sits to the right and does not overlap text */
  .MuiSelect-icon {
    right: 10px;
    color: var(--color-text-secondary);
  }

  /* Add extra padding on the right to make room for the icon */
  .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input {
    padding-right: 36px; /* default */
  }

  &.MuiInputBase-sizeSmall {
    .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiInputBase-inputSizeSmall {
      padding: 7px 32px 7px 14px; /* top/right/bottom/left; add room for icon */
    }
  }

  &.MuiInputBase-sizeMedium {
    .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiInputBase-inputSizeMedium {
      padding: 10px 36px 10px 16px; /* add room for icon */
    }
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: var(--color-border);
    transition: all var(--transition-normal);
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

    .MuiSelect-icon {
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

export const SelectField = <Value, Option = Value>({
  getOptionLabel,
  onChange,
  value,
  options,
  style = {},
  className,
  readOnly,
  getOptionKey,
  ...props
}: Omit<SelectProps, 'value' | 'onChange' | 'renderValue'> & {
  value: Value;
  options: ReadonlyArray<Option>;
  onChange: (event: { target: { value: Value } }) => void;
  getOptionLabel: (option: Option) => React.ReactNode;
  getOptionKey?: (option: Option) => string | number;
  readOnly?: boolean;
}) => {
  const findSelectedIndex = React.useCallback(() => {
    // First try reference equality
    const byRef = options.findIndex(o => o === (value as unknown as Option));
    if (byRef !== -1) return byRef;
    // Fallback to key comparison if provided
    if (getOptionKey) {
      // @ts-expect-error Value may not be Option; getOptionKey should handle compatible shape when provided
      const targetKey = getOptionKey(value);
      const byKey = options.findIndex(o => getOptionKey(o) === targetKey);
      if (byKey !== -1) return byKey;
    }
    return -1;
  }, [options, value, getOptionKey]);

  const selectedIndex = findSelectedIndex();

  const handleChange = (e: SelectChangeEvent) => {
    const idx = Number((e.target as unknown as { value: string }).value);
    const next = options[idx] as unknown as Value;
    onChange({ target: { value: next } });
  };

  return (
    <StyledSelect
      onChange={handleChange as unknown as (event: unknown) => void}
      value={selectedIndex >= 0 ? String(selectedIndex) : ''}
      className={`${className ?? ''} ${readOnly ? 'read-only' : ''}`}
      style={{
        ...(style as React.CSSProperties),
        maxWidth: (style as React.CSSProperties)?.maxWidth ?? '100%',
      }}
      displayEmpty
      renderValue={selected => {
        const isEmpty = selected === '' || selected === undefined || selected === null;
        const index = typeof selected === 'string' && selected !== '' ? parseInt(selected, 10) : selectedIndex;
        const option = index >= 0 ? (options[index] as Option) : undefined;
        const label = option !== undefined ? getOptionLabel(option) : '';
        return <span style={{ color: isEmpty ? 'var(--color-text-muted)' : undefined }}>{label}</span>;
      }}
      {...props}
    >
      {options.map((option, index) => (
        <StyledMenuItem key={getOptionKey ? getOptionKey(option) : index} value={String(index)}>
          {getOptionLabel(option)}
        </StyledMenuItem>
      ))}
    </StyledSelect>
  );
};
