import React from 'react';
import { CollapsibleTableRow } from './CollapsibleTableRow';
import { TableRow } from './TableRow';
import { TableCell } from './TableCell';
import { AutoHeight } from '@components/AutoHeight';

// Collapsible Row Component
export interface CollapsibleRowProps {
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
          <TableCell style={{ padding: 0, border: 'none' }} colSpan={colSpan} rightAlignLast={false}>
            <AutoHeight isOpen={expanded} duration={300}>
              <div style={{ margin: 0 }}>{expandedContent}</div>
            </AutoHeight>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
