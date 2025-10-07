import React from 'react';
import styles from './Column.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
export interface ColumnProps extends React.ComponentPropsWithoutRef<'div'> {
  /** standard flex css properties for align-items, @default center */
  alignItems?: React.CSSProperties['alignItems'];
  /** standard flex css properties for justify-content, @default center */
  justifyContent?: React.CSSProperties['justifyContent'];
  /** standard flex css properties for flex-wrap property, @default wrap */
  wrap?: React.CSSProperties['flexWrap'];
  /** standard css gap property values, @default undefined */
  gap?: React.CSSProperties['gap'];
  /** should the column stretch to the height of the parent */
  fullHeight?: boolean;
  /** should the column stretch to the width of the parent */
  fullWidth?: boolean;
}
const getClassName = getClassNameFactory('Column', styles);

/** A simple helper component to layout child components in a column, justify/align properties as well as gap are supported */
export function Column(props: ColumnProps) {
  const { alignItems, justifyContent, wrap, gap, fullHeight, fullWidth, className, style, ...rest } = props;

  const mergedStyle: React.CSSProperties = {
    ...(typeof gap === 'string' ? ({ gap } as React.CSSProperties) : {}),
    ...style,
  };

  const extra = getClassName('Column', className);
  return (
    <div
      {...rest}
      className={getClassName(
        {
          Column: true,
          fullWidth: !!fullWidth,
          fullHeight: !!fullHeight,
          wrapWrap: (wrap || 'wrap') === 'wrap',
          wrapNoWrap: (wrap || 'wrap') === 'nowrap',
          justifyCenter: (justifyContent || 'center') === 'center',
          justifyFlexStart: (justifyContent || 'center') === 'flex-start',
          justifyFlexEnd: (justifyContent || 'center') === 'flex-end',
          justifySpaceBetween: (justifyContent || 'center') === 'space-between',
          justifySpaceAround: (justifyContent || 'center') === 'space-around',
          justifySpaceEvenly: (justifyContent || 'center') === 'space-evenly',
          justifyStretch: (justifyContent || 'center') === 'stretch',
          alignCenter: (alignItems || 'center') === 'center',
          alignFlexStart: (alignItems || 'center') === 'flex-start',
          alignFlexEnd: (alignItems || 'center') === 'flex-end',
          alignStretch: (alignItems || 'center') === 'stretch',
          alignBaseline: (alignItems || 'center') === 'baseline',
        },
        extra
      )}
      style={mergedStyle}
    />
  );
}
