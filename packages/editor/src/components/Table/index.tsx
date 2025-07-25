import React from 'react';
import styled from '@emotion/styled';
import {
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableContainer as MuiTableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  Collapse,
  IconButton,
  Box,
} from '@mui/material';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Styled Components
export const TableContainer = styled(MuiTableContainer)`
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

export const Table = styled(MuiTable)`
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
`;

export const TableHead = styled(MuiTableHead)`
  background-color: var(--color-gray-800);
  border-bottom: 1px solid var(--color-border);
`;

export const TableBody = styled(MuiTableBody)``;

export const TableRow = styled(MuiTableRow)<{ hover?: boolean }>`
  transition: background-color var(--transition-normal);
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};

  &:hover {
    background-color: ${props => (props.hover !== false ? 'var(--color-border-subtle)' : 'transparent')};
  }

  &:last-child td {
    /* border-bottom: none; */
  }
`;

export const TableHeaderCell = styled(MuiTableCell)<{
  hiddenBelow?: 'md' | 'lg';
  width?: string;
  minWidth?: string;
}>`
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);

  ${props => props.width && `width: ${props.width};`}
  ${props => props.minWidth && `min-width: ${props.minWidth};`}
  
  ${props =>
    props.hiddenBelow &&
    `
    .mq-xs &, .mq-sm & ${props.hiddenBelow === 'lg' ? ', .mq-md &' : ''} {
      display: none;
    }
  `}
  
  &:last-child {
    text-align: right;
  }
`;

export const TableCell = styled(MuiTableCell)<{
  hiddenBelow?: 'md' | 'lg';
  width?: string;
  minWidth?: string;
}>`
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);

  ${props => props.width && `width: ${props.width};`}
  ${props => props.minWidth && `min-width: ${props.minWidth};`}
  
  ${props =>
    props.hiddenBelow &&
    `
    .mq-xs &, .mq-sm & ${props.hiddenBelow === 'lg' ? ', .mq-md &' : ''} {
      display: none;
    }
  `}
  
  &:last-child {
    text-align: right;
  }
`;

export const CollapsibleTableRow = styled(TableRow)<{ expanded?: boolean }>`
  transition: all var(--transition-normal);
  border-bottom: ${props => (props.expanded ? 'none' : '1px solid var(--color-border)')};

  &:hover {
    background-color: var(--color-border-subtle);
  }

  /* Add subtle indication when row is expandable */
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
`;

export const ChildTableRow = styled(TableRow)`
  background-color: var(--color-surface);

  /* Override MUI hover styles completely */
  &:hover {
    background-color: var(--color-surface);
  }

  /* Disable hover prop inheritance from TableRow */
  pointer-events: auto;
  cursor: default;

  /* Add subtle visual indication that this is a child row */
  td:first-of-type {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: var(--color-primary-200);
    }
  }

  /* Ensure cells have consistent width with parent table */
  td {
    border-bottom: 1px solid var(--color-border);
  }

  &:last-child td {
    border-bottom: none;
  }
`;

export const ExpandButton = styled(IconButton)`
  color: var(--color-text-muted);
  padding: var(--space-1);
  transition: all var(--transition-normal);

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-border-subtle);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// Collapsible Row Component
interface CollapsibleRowProps {
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  colSpan?: number;
}

export const CollapsibleRow: React.FC<CollapsibleRowProps> = ({ children, expandedContent, expanded = false, onToggle, colSpan = 1 }) => {
  return (
    <>
      <CollapsibleTableRow expanded={expanded} onClick={onToggle}>
        {children}
      </CollapsibleTableRow>
      {expandedContent && (
        <TableRow>
          <TableCell style={{ padding: 0, border: 'none' }} colSpan={colSpan}>
            <Collapse in={expanded} timeout='auto' unmountOnExit>
              <Box component='div' sx={{ margin: 0 }}>
                {expandedContent}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

// Helper component for expand/collapse icon
interface ExpandIconProps {
  expanded: boolean;
  onClick?: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const ExpandIcon: React.FC<ExpandIconProps> = ({ expanded, onClick, style }) => {
  return (
    <ExpandButton
      size='small'
      style={style}
      onClick={e => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </ExpandButton>
  );
};
