import { useCallback, useState } from 'react';
import { Row, Column } from '@components/Layout';
import { AutoHeight } from '@components/AutoHeight';
import styles from './Group.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Group', styles);

export interface GroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** the title of the group */
  title: React.ReactNode;
  /** the optional description of the group */
  description?: React.ReactNode;
  /** the layout of the group, either column or row, @default row */
  layout?: 'row' | 'column';
  /** standard flex css properties for align-items, @default center */
  alignItems?: React.CSSProperties['alignItems'];
  /** standard flex css properties for justify-content, @default center */
  justifyContent?: React.CSSProperties['justifyContent'];
  /** standard css gap property values, @default 0.5rem */
  gap?: React.CSSProperties['gap'];
  /** should the group be collapsed by default @default false */
  collapsed?: boolean;
  /** Whether the group can be collapsed by the end-user @default true */
  collapsible?: boolean;
  /** fired when the group header section is clicked */
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export function Group({
  title,
  description,
  children,
  gap = '0.5rem',
  justifyContent = 'center',
  alignItems = 'center',
  layout = 'row',
  collapsed = false,
  collapsible = true,
  className,
  onClick,
  ...rest
}: GroupProps): React.ReactNode {
  const [_collapsed, setCollapsed] = useState(collapsed);
  const cssProps = {
    gap,
    justifyContent,
    alignItems,
  };

  const onCollapseComplete = useCallback(() => {
    setCollapsed(true);
  }, []);

  const onHeaderClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (collapsible) {
        setCollapsed(!_collapsed);
      }
      if (onClick) onClick(event);
    },
    [_collapsed, collapsible, onClick]
  );

  return (
    <div
      className={getClassName(
        {
          Group: true,
          collapsed: _collapsed,
          expanded: !_collapsed,
        },
        className
      )}
      {...rest}
    >
      <div
        onClick={onHeaderClick}
        className={getClassName('header') + (_collapsed ? ' ' + getClassName({ headerCollapsed: true }) : '') + ' header-title'}
      >
        <h3
          className={
            getClassName('title') +
            (collapsible ? ' ' + getClassName({ titleCollapsible: true }) : '') +
            (_collapsed ? ' ' + getClassName({ titleCollapsed: true }) : '') +
            ' title'
          }
        >
          {title}
        </h3>
        {description && <span className={getClassName('description')}>{description}</span>}
      </div>
      <AutoHeight isOpen={!_collapsed || !collapsible} className={getClassName('content')} onCollapseComplete={onCollapseComplete}>
        {layout === 'row' ? (
          <Row className='row' {...cssProps}>
            {children}
          </Row>
        ) : (
          <Column className='column' {...cssProps}>
            {children}
          </Column>
        )}
      </AutoHeight>
    </div>
  );
}
