import React from 'react';
import styles from './Row.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
export interface RowProps extends React.ComponentPropsWithRef<'div'> {
  /** standard flex css properties for align-items, @default center */
  alignItems?: React.CSSProperties['alignItems'];
  /** standard flex css properties for justify-content, @default center */
  justifyContent?: React.CSSProperties['justifyContent'];
  /** standard flex css properties for flex-wrap property, @default wrap */
  wrap?: React.CSSProperties['flexWrap'];
  /** standard css gap property values, @default undefined */
  gap?: React.CSSProperties['gap'];
  /** should the row stretch to the height of the parent */
  fullHeight?: boolean;
  /** should the row stretch to the width of the parent */
  fullWidth?: boolean;
}
const getClassName = getClassNameFactory('Row', styles);

/** A simple helper component to layout child components in a row, justify/align properties as well as gap are supported */
export function Row(props: RowProps) {
  const { alignItems, justifyContent, wrap, gap, fullHeight, fullWidth, className, style, ...rest } = props;
  const mergedStyle: React.CSSProperties = {
    ...(typeof gap === 'string' ? ({ gap } as React.CSSProperties) : {}),
    ...style,
  };

  const extra = getClassName('Row', className);
  return (
    <div
      {...rest}
      className={getClassName(
        {
          Row: true,
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
