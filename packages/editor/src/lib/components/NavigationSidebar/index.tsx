import { useEffect, useMemo, useState } from 'react';
import { NavigationSidebarContainer } from './NavigationSidebarContainer';
import { NavigationSidebarToggle } from './NavigationSidebarToggle';
import styled from '@emotion/styled';
import { dashboardsQueryOptions } from '@lib/api/dashboard';
import { useQuery } from '@tanstack/react-query';
import { IconButton } from '../IconButtons';
import { ChevronDown, ChevronUp, Layers, LayoutDashboard, PlusCircle, SquarePen } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { Spinner } from '../Spinner';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { useParams } from '@tanstack/react-router';
import { Row } from '@hakit/components';


const OrderedList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: calc(var(--puck-space-px) / 2);
`;
const ListItem = styled.li`
  background-color: var(--puck-color-grey-10);
  color: var(--puck-color-grey-03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition:var(--ha-transition-duration) var(--ha-easing);
  transition-property: background-color, color, border-color;
  flex-wrap: nowrap;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid transparent;
  span {
    display: block;
    padding: var(--puck-space-px) var(--puck-space-px) var(--puck-space-px) 0;
    width: 100%;
    // hjandle ellipsis overflow
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  cursor: pointer;
  &:hover, &:focus, &:active {
    background-color: var(--puck-color-grey-08);
    color: var(--puck-color-grey-02);
    border-color: var(--puck-color-grey-05);
  }
  &.active {
    background-color: var(--puck-color-grey-06);
    color: var(--puck-color-grey-01);
    border-color: var(--puck-color-azure-07);
    &:hover, &:focus, &:active {
      border-color: var(--puck-color-azure-05);
    }
  }
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--puck-color-grey-01);
  &.secondary {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
    color: var(--puck-color-grey-02);
    margin-top: 0;
  }
`;

const Fieldset = styled.fieldset`
  outline: none;
  border: none;
  margin: 0;
  padding: 0;
  color: inherit;
  width: 100%;
`;

const FieldsetInnerList = styled.li`
  padding: var(--puck-space-px) 0 var(--puck-space-px) calc(var(--puck-space-px) * 2);
  margin: 0;
`;


export function NavigationSidebar() {
  const [open, setOpen] = useState(true);
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = useMemo(() => dashboardsQuery.data, [dashboardsQuery.data]);
  const currentDashboard = useGlobalStore(state => state.dashboard);
  const params = useParams({
      from: '/_authenticated/dashboards/$dashboardPath/$pagePath/edit'
  });
  // maintain state of each dashboard and if they're collapsed or not, the current dashboard should be open by default
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (dashboards) {
      const newCollapsed = dashboards.reduce((acc, dashboard) => {
        acc[dashboard.id] = !currentDashboard || currentDashboard.id !== dashboard.id;
        return acc;
      }, {} as Record<string, boolean>);
      setCollapsed(newCollapsed);
    }
  }, [currentDashboard, dashboards])


  return <>
    <NavigationSidebarToggle open={open} onToggle={() => setOpen((prev) => !prev)} />
    <NavigationSidebarContainer open={open} onClose={() => setOpen(false)}>
      <Title>
        <Row>
          <LayoutDashboard size={24} style={{
            marginRight: '0.5rem',
          }} />
          <span>Dashboards</span>
        </Row>
        <Tooltip placement="left" title="Create new dashboard">
          <IconButton className="disable-bg-hover">
            <PlusCircle size={20} style={{
              marginRight: `var(--puck-space-px)`,
            }} />
          </IconButton>
        </Tooltip>
      </Title>
      <OrderedList>
        {dashboardsQuery.isLoading && (
          <ListItem>
            <Spinner text="Loading dashboards..." />
          </ListItem>
        )}
        {!dashboardsQuery.isLoading && dashboards?.map((dashboard) => (
          <Fieldset key={dashboard.id}>
            <ListItem className={currentDashboard?.id === dashboard.id ? 'active' : ''}>
              <IconButton className="disable-bg-hover" onClick={(e) => {
                e.stopPropagation();
                setCollapsed((prev) => ({
                  ...prev,
                  [dashboard.id]: !prev[dashboard.id]
                }));
              }} style={{
                aspectRatio: '1 / 1',
                width: '3rem'
              }}>
                {!collapsed[dashboard.id] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </IconButton>
              <Tooltip title="Select Dashboard" placement="bottom" style={{
                width: '100%',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'space-between',
              }} onClick={() => {
                setOpen(false);
              }}>                
                <span>{dashboard.name}{currentDashboard?.id === dashboard.id ? ' (current)' : ''}</span>
              </Tooltip>
              <Tooltip placement="left" title="Edit">
                <IconButton className="disable-bg-hover" style={{
                  marginRight: `var(--puck-space-px)`,
                }}>
                  <SquarePen size={20} />
                </IconButton>
              </Tooltip>
            </ListItem>
            {!collapsed[dashboard.id] && (
              <FieldsetInnerList>
                <Title className="secondary">
                  <Row>
                    <Layers size={24} style={{
                      marginRight: '0.5rem',
                    }} />
                    <span>Pages</span>
                  </Row>
                  <Tooltip placement="left" title="Create new page" style ={{
                    marginRight: `var(--puck-space-px)`,
                  }}>
                    <IconButton className="disable-bg-hover">
                      <PlusCircle size={20} />
                    </IconButton>
                  </Tooltip>
                </Title>
                <OrderedList>
                  {dashboard.pages.map((page) => (
                    <ListItem key={page.id} className={currentDashboard?.id === dashboard.id && params?.pagePath === page.path ? 'active' : ''}>
                      <Tooltip title="Select Page" placement="bottom" style={{
                        width: '100%',
                        paddingLeft: `var(--puck-space-px)`,
                      }} onClick={() => {
                        setOpen(false);
                      }}>
                        <span>{page.name}{currentDashboard?.id === dashboard.id && params?.pagePath === page.path ? ' (current)' : ''}</span>
                      </Tooltip>
                      <Tooltip placement="left" title="Edit">
                        <IconButton className="disable-bg-hover" style={{
                          marginRight: `var(--puck-space-px)`,
                        }}>
                          <SquarePen size={20}/>
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                  {dashboard.pages?.length === 0 && (
                    <ListItem>
                      No pages found
                    </ListItem>
                  )}
                </OrderedList>
              </FieldsetInnerList>
            )}
          </Fieldset>
        ))}
        {!dashboardsQuery.isLoading && dashboards?.length === 0 && (
          <ListItem>
            No dashboards found
          </ListItem>
        )}
        {dashboardsQuery.isError && (
          <ListItem>
            Error: {dashboardsQuery.error.message}
          </ListItem>
        )}
      </OrderedList>
    </NavigationSidebarContainer>
  </>
};
