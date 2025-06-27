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
import { useNavigate } from '@tanstack/react-router';
import { Row } from '@hakit/components';
// import { DashboardEditor, type DashboardSelectorProps } from './DashboardEditor';
// import { DashboardPageWithoutData } from '@typings/dashboard';
// import { DashboardPageEditor, DashboardPageSelectorProps } from './DashboardPageEditor';
import { Alert, AlertTitle } from '@mui/material'



const OrderedList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-4) / 2);
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
    padding: var(--space-4) var(--space-4) var(--space-4) 0;
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
  padding: var(--space-4) 0 var(--space-4) calc(var(--space-4) * 2);
  margin: 0;
`;

type MsgType = 'error' | 'info';

interface StatusMessage {
  title: string;
  message: string;
  type: MsgType;
}

export function getStatusMessage(opts: {
  dashboards: Array<{ name: string; pages: unknown[] }> | undefined;
  currentDashboard: { name: string; pages: unknown[] } | undefined;
  currentPage: unknown | undefined;
  dashboardPath?: string;
  pagePath?: string;
}): StatusMessage | undefined {
  const {
    dashboards = [],
    currentDashboard,
    currentPage,
    dashboardPath,
    pagePath,
  } = opts;

  //
  // 1. No dashboards exist at all
  //
  if (!dashboards.length) {
    return {
      title: 'No dashboards found',
      message: 'Create a dashboard above to start editing.',
      type: 'info',
    };
  }

  //
  // 2. dashboardPath in the URL but no matching dashboard in state
  //
  if (dashboardPath && !currentDashboard) {
    return {
      title: 'Dashboard not found',
      message: `Dashboard "${dashboardPath}" doesn’t exist..`,
      type: 'error',
    };
  }

  //
  // 3. We have a dashboard selected, but it contains no pages
  //
  if (currentDashboard && currentDashboard.pages.length === 0) {
    return {
      title: 'No pages found',
      message: `Dashboard "${currentDashboard.name}" has no pages. Create one above to continue.`,
      type: 'error',
    };
  }

  //
  // 4. URL points at pagePath but that page doesn’t exist on the current dashboard
  //
  if (currentDashboard && pagePath && !currentPage) {
    return {
      title: 'Page not found',
      message: `Dashboard "${currentDashboard.name}" has no page with path "${pagePath}".`,
      type: 'error',
    };
  }

  //
  // 5. A dashboard is selected, but no pagePath present (or no currentPage)
  //
  if (currentDashboard && !pagePath && !currentPage) {
    return {
      title: 'No page selected',
      message: 'Select a page above to start editing.',
      type: 'info',
    };
  }

  //
  // 6. Nothing selected at all (default landing state)
  //
  if (!dashboardPath && !pagePath && !currentDashboard) {
    return {
      title: 'No dashboard selected',
      message: 'Select or create a dashboard above to start.',
      type: 'info',
    };
  }

  // If we reach here, everything looks good – no message required.
  return;
}


export function NavigationSidebar({
  open: defaultOpen = false,
  closable = true,
  dashboardPath,
  pagePath,
}: {
  closable?: boolean;
  open?: boolean;
  dashboardPath?: string;
  pagePath?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  // const [dashboardEditorMode, setDashboardEditorMode] = useState<{
  //   mode: DashboardSelectorProps['mode'] | null;
  //   dashboard?: DashboardPageWithoutData | null;
  // } | null>({
  //   mode: mode?.startsWith('dashboard-') ? (mode as DashboardSelectorProps['mode']) : null,
  //   dashboard: null,
  // });
  // const [dashboardPageEditorMode, setDashboardPageEditorMode] = useState<{
  //   mode: DashboardPageSelectorProps['mode'] | null;
  //   dashboard: DashboardPageWithoutData | null;
  //   page?: DashboardPageWithoutData | null;
  // } | null>({
  //   mode: mode?.startsWith('page-') ? (mode as DashboardPageSelectorProps['mode']) : null,
  //   dashboard: null,
  //   page: null,
  // });
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = useMemo(() => dashboardsQuery.data, [dashboardsQuery.data]);

  const currentDashboard = useMemo(() => dashboards?.find((dashboard) => dashboard.path === dashboardPath), [dashboards, dashboardPath]);
  const currentPage = useMemo(() => currentDashboard?.pages.find((page) => page.path === pagePath), [currentDashboard, pagePath]);

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

  const message = getStatusMessage({
    dashboards,
    currentDashboard,
    currentPage,
    dashboardPath,
    pagePath,
  });


  return <>
    {closable && <NavigationSidebarToggle open={open} onToggle={() => setOpen((prev) => !prev)} />}
    <NavigationSidebarContainer open={open} onClose={() => closable && setOpen(false)}>
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
              marginRight: `var(--space-4)`,
            }} onClick={() => {
              // setDashboardEditorMode({
              //   mode: 'dashboard-new',
              //   dashboard: null
              // });
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
                  marginRight: `var(--space-4)`,
                }} onClick={() => {
                  navigate({
                    to: `/dashboards/$dashboardPath/$pagePath/edit`,
                    params: {
                      dashboardPath: dashboard.path,
                      pagePath: dashboard.pages[0].path
                    }
                  });
                  // setDashboardEditorMode({
                  //   mode: 'edit',
                  //   dashboard
                  // });
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
                    marginRight: `var(--space-4)`,
                  }}>
                    <IconButton className="disable-bg-hover">
                      <PlusCircle size={20} onClick={() => {
                        // setDashboardPageEditorMode({
                        //   mode: 'new-page',
                        //   dashboard,
                        // });
                      }} />
                    </IconButton>
                  </Tooltip>
                </Title>
                <OrderedList>
                  {dashboard.pages.map((page) => (
                    <ListItem key={page.id} className={currentDashboard?.id === dashboard.id && pagePath === page.path ? 'active' : ''}>
                      <Tooltip title="Select Page" placement="bottom" style={{
                        width: '100%',
                        paddingLeft: `var(--space-4)`,
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
                        <span>{page.name}{currentDashboard?.id === dashboard.id && pagePath === page.path ? ' (current)' : ''}</span>
                      </Tooltip>
                      <Tooltip placement="left" title="Edit">
                        <IconButton className="disable-bg-hover" style={{
                          marginRight: `var(--space-4)`,
                        }}>
                          <SquarePen size={20} onClick={() => {
                            // setDashboardPageEditorMode({
                            //   mode: 'edit-page',
                            //   dashboard,
                            //   page,
                            // });
                          }} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                  {dashboard.pages?.length === 0 && (
                    <ListItem className="disable-hover">
                      <span style={{
                        paddingLeft: `var(--space-4)`,
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
              paddingLeft: `var(--space-4)`,
            }}>No dashboards found</span>
          </ListItem>
        )}
      </OrderedList>
      {message?.title && !dashboardsQuery.isLoading && <Alert severity={message.type} style={{
        marginTop: 'var(--space-4)',
      }}>
        <AlertTitle>{message.title}</AlertTitle>
        {message.message}
      </Alert>}
    </NavigationSidebarContainer>
  </>
};
