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
import { useNavigate, useParams } from '@tanstack/react-router';
import { Row } from '@hakit/components';
import { DashboardEditor } from './DashboardEditor';
import { DashboardPageWithoutData } from '@typings/dashboard';
import { DashboardPageEditor } from './DashboardPageEditor';
import { Alert, AlertTitle } from '@mui/material'



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
  }
  cursor: pointer;
  &.disable-hover {
    cursor: default;
    background-color: transparent;
    color: var(--puck-color-grey-03);
    border-color: transparent;
  }
  &:not(.disable-hover) {
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


export function NavigationSidebar({
  open: defaultOpen = true,
  closeable = true,
  error,
}: {
  closeable?: boolean;
  error?: {
    title: string;
    message: string;
  },
  open?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [dashboardEditorMode, setDashboardEditorMode] = useState<{
    mode: 'new' | 'edit' | 'duplicate' | null;
    dashboard?: DashboardPageWithoutData | null;
  } | null>(null);
  const [dashboardPageEditorMode, setDashboardPageEditorMode] = useState<{
    mode: 'new' | 'edit' | 'duplicate' | null;
    dashboard: DashboardPageWithoutData | null;
    page?: DashboardPageWithoutData | null;
  } | null>(null);
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = useMemo(() => dashboardsQuery.data, [dashboardsQuery.data]);
  const params = useParams({
    from: '/_authenticated/dashboards/$dashboardPath/$pagePath/edit'
  });

  const currentDashboard = useMemo(() => dashboards?.find((dashboard) => dashboard.path === params?.dashboardPath), [dashboards, params?.dashboardPath]);

  const navigate = useNavigate();
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
  }, [currentDashboard, dashboards]);

  // TODO
  // If a page or a dashbaord is deleted and either the page/dashboard is currently active, we'll need to make an active decision on what to do here
  // do we block the user from closing the sidebar until a new page is selected?


  return <>
    {dashboardEditorMode?.mode && <DashboardEditor mode={dashboardEditorMode.mode} open={true} onClose={() => {
      setDashboardEditorMode(null);
    }} dashboard={dashboardEditorMode.dashboard} />}
    {dashboardPageEditorMode?.mode && dashboardPageEditorMode.dashboard && <DashboardPageEditor mode={dashboardPageEditorMode.mode} open={true} onClose={() => {
      setDashboardPageEditorMode(null);
    }} dashboard={dashboardPageEditorMode.dashboard} page={dashboardPageEditorMode.page} />}
    {closeable && <NavigationSidebarToggle open={open} onToggle={() => setOpen((prev) => !prev)} />}
    <NavigationSidebarContainer open={open} onClose={() => closeable && setOpen(false)}>
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
            }} onClick={() => {
              setDashboardEditorMode({
                mode: 'new',
                dashboard: null
              });
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
              <Tooltip title="View Pages" placement="bottom" style={{
                width: '100%',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'space-between',
              }} onClick={(e) => {                
                e.stopPropagation();
                setCollapsed((prev) => ({
                  ...prev,
                  [dashboard.id]: !prev[dashboard.id]
                }));
              }}>                
                <span>{dashboard.name}{currentDashboard?.id === dashboard.id ? ' (current)' : ''}</span>
              </Tooltip>
              <Tooltip placement="left" title="Edit">
                <IconButton className="disable-bg-hover" style={{
                  marginRight: `var(--puck-space-px)`,
                }} onClick={() => {
                  setDashboardEditorMode({
                    mode: 'edit',
                    dashboard
                  });
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
                      <PlusCircle size={20} onClick={() => {
                        setDashboardPageEditorMode({
                          mode: 'new',
                          dashboard,
                        });
                      }} />
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
                        navigate({
                          from: `/dashboards/$dashboardPath/$pagePath/edit`,
                          to: `/dashboards/$dashboardPath/$pagePath/edit`,
                          params: {
                            dashboardPath: dashboard.path,
                            pagePath: page.path
                          }
                        });
                      }}>
                        <span>{page.name}{currentDashboard?.id === dashboard.id && params?.pagePath === page.path ? ' (current)' : ''}</span>
                      </Tooltip>
                      <Tooltip placement="left" title="Edit">
                        <IconButton className="disable-bg-hover" style={{
                          marginRight: `var(--puck-space-px)`,
                        }}>
                          <SquarePen size={20} onClick={() => {
                            setDashboardPageEditorMode({
                              mode: 'edit',
                              dashboard,
                              page,
                            });
                          }} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                  {dashboard.pages?.length === 0 && (
                    <ListItem className="disable-hover">
                      <span style={{
                        paddingLeft: `var(--puck-space-px)`,
                      }}>No pages found</span>
                    </ListItem>
                  )}
                </OrderedList>
              </FieldsetInnerList>
            )}
          </Fieldset>
        ))}
        {!dashboardsQuery.isLoading && dashboards?.length === 0 && (
          <ListItem className="disable-hover">
            <span style={{
              paddingLeft: `var(--puck-space-px)`,
            }}>No dashboards found</span>
          </ListItem>
        )}
      </OrderedList>
      {error?.title && <Alert severity='error' style={{
        marginTop: 'var(--puck-space-px)',
      }}>
        <AlertTitle>{error.title}</AlertTitle>
        {error.message}
      </Alert>}
    </NavigationSidebarContainer>
  </>
};
