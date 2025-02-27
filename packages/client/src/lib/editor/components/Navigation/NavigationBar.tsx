import styled from '@emotion/styled';
import { Row, FabCard, Menu } from '@hakit/components';
import React from 'react';
import { useDashboards } from '@editor/hooks/useDashboards';
import { useEditMode } from '@editor/hooks/useEditMode';
import { NavigationClock } from './NavigationClock';
import { NavigationProps } from '.';

const Nav = styled.nav`
  display: flex;
  padding: 1rem;
`;

const Link = styled.a`
  color: rgba(255, 255, 255, 0.4);
  padding: 1rem 2rem;
  transition: color var(--ha-transition-duration) var(--ha-easing);
  cursor: pointer;
  &:hover,
  &:focus {
    color: rgba(255, 255, 255, 0.8);
  }
  &.active {
    color: rgba(255, 255, 255, 1);
  }
`;

const TransparentFabCard = styled(FabCard)`
  &.card-base {
    border: none;
    background: transparent;
  }
`;

type NavigationBarProps = NavigationProps & React.ComponentPropsWithRef<'nav'> ;

export function NavigationBar({ options, clockOptions, ...props }: NavigationBarProps) {
  const [, setEditMode] = useEditMode();
  const pages = useDashboards(); 
  return (
    <Nav {...props}>
      <Row fullWidth wrap='nowrap' justifyContent='space-between'>
        {!options?.hideClock && (
          <Row>
            <NavigationClock
              timeEntity={clockOptions?.timeEntity}
              dateEntity={clockOptions?.dateEntity}
              dateFormat={clockOptions?.hideDate || clockOptions?.useDateEntity ? undefined : clockOptions?.dateFormat}
              timeFormat={clockOptions?.hideTime || clockOptions?.useTimeEntity ? undefined : clockOptions?.timeFormat}
              hideDate={clockOptions?.hideDate}
              hideTime={clockOptions?.hideTime}
              hideIcon={clockOptions?.hideIcon}
              throttleTime={clockOptions?.useDateEntity || clockOptions?.useTimeEntity ? undefined : clockOptions?.throttleTime}
              icon={clockOptions?.icon}
              disableColumns
              disableRipples
              disableScale
              center={false}
              xxs={12}
              xs={12}
              sm={12}
              md={12}
              lg={12}
              xlg={12}
            />
          </Row>
        )}
        <Row fullWidth gap='1rem'>
          {pages.map(page => (
            <Link className={page.active ? 'active' : ''} key={page.id}>
              {page.title}
            </Link>
          ))}
        </Row>
        <Row>
          <Menu
            items={[
              {
                active: true,
                icon: 'mdi:edit',
                label: 'Edit',
                onClick: () => {
                  setEditMode(true);
                },
              },
            ]}
            placement='bottom'
          >
            <TransparentFabCard icon='mdi:dots-vertical' />
          </Menu>
        </Row>
      </Row>
    </Nav>
  );
}
