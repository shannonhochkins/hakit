import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

// Base layout props
interface BaseLayoutProps {
  /** Alignment of items on the main axis */
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  /** Alignment of items on the cross axis */
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  /** Gap between children */
  gap?: string | number;
  /** Whether to take full width */
  fullWidth?: boolean;
  /** Whether to take full height */
  fullHeight?: boolean;
  /** Whether to wrap children */
  wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
  /** Custom styles */
  style?: React.CSSProperties;
  /** CSS class name */
  className?: string;
  /** Children elements */
  children?: React.ReactNode;
}

// Row component for horizontal layout
interface RowProps extends BaseLayoutProps {
  /** Whether to prevent wrapping (alias for wrap='nowrap') */
  noWrap?: boolean;
}

export const StyledRow = styled.div<RowProps>`
  display: flex;
  flex-direction: row;
  
  ${props => props.justifyContent && css`
    justify-content: ${props.justifyContent};
  `}
  
  ${props => props.alignItems && css`
    align-items: ${props.alignItems};
  `}
  
  ${props => props.gap && css`
    gap: ${typeof props.gap === 'number' ? `${props.gap}px` : props.gap};
  `}
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.fullHeight && css`
    height: 100%;
  `}
  
  ${props => props.wrap === true && css`
    flex-wrap: wrap;
  `}
  
  ${props => props.wrap === false && css`
    flex-wrap: nowrap;
  `}
  
  ${props => typeof props.wrap === 'string' && css`
    flex-wrap: ${props.wrap};
  `}
  
  ${props => props.noWrap && css`
    flex-wrap: nowrap;
  `}
`;

export const Row: React.FC<RowProps> = ({ children, ...props }) => {
  return (
    <StyledRow {...props}>
      {children}
    </StyledRow>
  );
};

// Column component for vertical layout
type ColumnProps = BaseLayoutProps

export const StyledColumn = styled.div<ColumnProps>`
  display: flex;
  flex-direction: column;
  
  ${props => props.justifyContent && css`
    justify-content: ${props.justifyContent};
  `}
  
  ${props => props.alignItems && css`
    align-items: ${props.alignItems};
  `}
  
  ${props => props.gap && css`
    gap: ${typeof props.gap === 'number' ? `${props.gap}px` : props.gap};
  `}
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.fullHeight && css`
    height: 100%;
  `}
  
  ${props => props.wrap === true && css`
    flex-wrap: wrap;
  `}
  
  ${props => props.wrap === false && css`
    flex-wrap: nowrap;
  `}
  
  ${props => typeof props.wrap === 'string' && css`
    flex-wrap: ${props.wrap};
  `}
`;

export const Column: React.FC<ColumnProps> = ({ children, ...props }) => {
  return (
    <StyledColumn {...props}>
      {children}
    </StyledColumn>
  );
};

// Export types
export type { RowProps, ColumnProps, BaseLayoutProps };
