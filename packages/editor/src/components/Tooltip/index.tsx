import { useId } from 'react';
import styles from './Tooltip.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { Tooltip as ReactTooltip, type PlacesType, type ITooltip } from 'react-tooltip';

const getClassName = getClassNameFactory('Tooltip', styles);

export type TooltipProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> & {
  /** the placement of the tooltip @default 'top' */
  placement?: PlacesType;
  /** the title of the tooltip */
  title?: React.ReactNode | null;
  /** the children of the tooltip */
  children: React.ReactNode;
} & ITooltip;

export function Tooltip({ placement = 'top', title = null, children, ...rest }: TooltipProps) {
  const id = useId();
  return (
    <>
      <div data-tooltip-id={id} data-tooltip-place={placement} {...rest}>
        {children}
      </div>
      <ReactTooltip
        place={placement}
        id={id}
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
      </ReactTooltip>
    </>
  );
}
