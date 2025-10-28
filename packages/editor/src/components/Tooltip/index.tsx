import { useId } from 'react';
import styles from './Tooltip.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { Tooltip as ReactTooltip, type PlacesType, type ITooltip } from 'react-tooltip';
import { createPortal } from 'react-dom';

const getClassName = getClassNameFactory('Tooltip', styles);

export type TooltipProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> & {
  /** the placement of the tooltip @default 'top' */
  placement?: PlacesType;
  /** the title of the tooltip */
  title?: React.ReactNode | null;
  /** the children of the tooltip */
  children: React.ReactNode;
  /** basic mode, will just add a "title" attribute to the element */
  basic?: boolean;
} & ITooltip;

// Single Tooltip implementation with optional manual positioning when portalLocation provided

export function Tooltip({ placement = 'top', title = null, children, style, basic, key, ...rest }: TooltipProps) {
  const id = useId();

  return (
    <>
      <div
        data-tooltip-id={id}
        data-tooltip-place={placement}
        style={style}
        key={key}
        title={basic && title ? (typeof title === 'string' ? title : undefined) : undefined}
      >
        {children}
      </div>
      {!basic &&
        createPortal(
          <ReactTooltip
            place={placement}
            id={id}
            key={key}
            opacity={1}
            {...rest}
            className={getClassName(
              {
                element: true,
              },
              'tooltip-element'
            )}
            classNameArrow={getClassName(
              {
                arrow: true,
              },
              'tooltip-arrow'
            )}
          >
            {title}
          </ReactTooltip>,
          document.body
        )}
    </>
  );
}
