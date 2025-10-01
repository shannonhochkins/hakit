import React, { useState, useRef, useEffect } from 'react';
import { CollapsibleTableRow } from './CollapsibleTableRow';
import { TableRow } from './TableRow';
import { TableCell } from './TableCell';

// Simple Collapse component to replace MUI Collapse
interface CollapseProps {
  in: boolean;
  children: React.ReactNode;
  timeout?: number | 'auto';
  unmountOnExit?: boolean;
}

const Collapse: React.FC<CollapseProps> = ({ in: isOpen, children, timeout = 300, unmountOnExit = false }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else if (unmountOnExit) {
      // Only unmount after a delay when closing
      const timer = setTimeout(
        () => {
          setShouldRender(false);
        },
        typeof timeout === 'number' ? timeout : 300
      );
      return () => clearTimeout(timer);
    }
  }, [isOpen, timeout, unmountOnExit]);

  if (!shouldRender && unmountOnExit) {
    return null;
  }

  return (
    <div
      ref={contentRef}
      style={{
        overflow: 'hidden',
        height: isOpen ? 'auto' : '0px',
        transition: `height ${typeof timeout === 'number' ? timeout : 300}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {children}
    </div>
  );
};

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
          <TableCell style={{ padding: 0, border: 'none' }} colSpan={colSpan}>
            <Collapse in={expanded} timeout='auto' unmountOnExit>
              <div style={{ margin: 0 }}>{expandedContent}</div>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
