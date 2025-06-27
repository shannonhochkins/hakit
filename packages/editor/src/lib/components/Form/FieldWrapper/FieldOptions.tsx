import { useState, type SyntheticEvent } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import { IconButton } from '@lib/components/IconButtons';
import styled from '@emotion/styled';
import { EllipsisVertical } from 'lucide-react';
import { Tooltip } from '@lib/components/Tooltip';
import { Column, Row } from '@hakit/components';

const Label = styled.span`

`;
const Description = styled.span`
  font-size: 0.75rem;
  color: var(--color-gray-200);
`;


const ITEM_HEIGHT = 48;

export interface FieldOption {
  label: string;
  description?: string;
  selected: boolean;
  onClick?: () => void;
}

export interface FieldOptionsProps {
  options: FieldOption[];
}

export function FieldOptions({ options }: FieldOptionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Tooltip title="Field Options" placement="left">
        <IconButton
          onClick={handleClick}
        >
          <EllipsisVertical size={16} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              background: 'var(--color-gray-400)',
              color: 'var(--color-gray-100)',
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.label} selected={option.selected} onClick={() => {
            option.onClick?.();
            handleClose();
          }}>
            <Row fullWidth alignItems="center" gap={0.5} justifyContent="flex-start">
              <Checkbox
                checked={option.selected}
                slotProps={{
                  root: {
                    style: {
                      padding: 0,
                      marginRight: '0.5rem',
                      color: 'var(--color-gray-100)',
                    },
                  },
                }} />
              <Column alignItems='flex-start' gap={0.5} justifyContent='flex-start'>
                <Label>{option.label}</Label>
                {option.description && <Description>{option.description}</Description>}
              </Column>
            </Row>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}