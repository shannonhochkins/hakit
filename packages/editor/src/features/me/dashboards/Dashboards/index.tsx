import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  LayoutDashboardIcon,
  SearchIcon,
  InfoIcon,
  FileTextIcon,
  X,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardsQueryOptions, deleteDashboard, deleteDashboardPage } from '@services/dashboard';
import { Spinner } from '@components/Loaders/Spinner';
import { PrimaryButton } from '@components/Button/Primary';
import { EmptyState } from '@components/EmptyState';
import { DashboardForm } from '@components/Modal/DashboardForm';
import { PageForm } from '@components/Modal/PageForm';
import { Confirm } from '@components/Modal/confirm';
import { Column, Row } from '@hakit/components';
import { InputField } from '@components/Form/Field/Input';
import { Tooltip } from '@components/Tooltip';
import { Dashboard, DashboardPageWithoutData } from '@typings/hono';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  CollapsibleRow,
  ChildTableRow,
  ExpandIcon,
} from '@components/Table';
import { Fab } from '@components/Button';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import { IconButton } from '@components/Button/IconButton';
import { timeAgo } from '@hakit/core';
import { ActionMenu } from '@features/me/dashboards/ActionMenu';
import { getStorageKey } from '@hooks/useUnsavedChanges';
import styles from './Dashboards.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Dashboards', styles);

// Table column configuration
const TABLE_COLUMNS = {
  DASHBOARD: { width: '100%', minWidth: '300px' },
  CREATED: { width: '150px' },
  ACTIONS: { width: '300px' },
} as const;

// Sorting configuration
type SortColumn = 'name' | 'created' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}

// CSS Modules equivalents handled via getClassName

function getDashboardById(dashboards: Dashboard[], id: string) {
  return dashboards.find(dashboard => dashboard.id === id) || null;
}

export function Dashboards() {
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = useMemo(() => dashboardsQuery.data, [dashboardsQuery.data]);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'duplicate' | null>(null);
  const [pageFormMode, setPageFormMode] = useState<'new' | 'edit' | 'duplicate' | null>(null);
  const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previousSearchQuery, setPreviousSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingDashboardId, setDeletingDashboardId] = useState<string | null>(null);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);
  const [deletingPageDashboardId, setDeletingPageDashboardId] = useState<string | null>(null);
  const [expandedDashboards, setExpandedDashboards] = useState<Set<string>>(new Set());
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDashboardId, setMenuDashboardId] = useState<string | null>(null);
  const [menuPageId, setMenuPageId] = useState<string | null>(null);
  const [menuType, setMenuType] = useState<'dashboard' | 'page' | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  const navigate = useNavigate();

  const toggleExpanded = (dashboardId: string) => {
    setExpandedDashboards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dashboardId)) {
        newSet.delete(dashboardId);
      } else {
        newSet.add(dashboardId);
      }
      return newSet;
    });
  };

  // Unified action handlers with type discrimination
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, type: 'dashboard' | 'page', dashboardId: string, pageId?: string) => {
    event.stopPropagation();
    const sameAnchor = menuAnchorEl && event.currentTarget === menuAnchorEl;
    const sameContext = menuType === type && menuDashboardId === dashboardId && (menuPageId || null) === (pageId || null);

    if (menuAnchorEl && sameAnchor && sameContext) {
      // Toggle close if clicking the active trigger again
      handleMenuClose();
      return;
    }

    setMenuAnchorEl(event.currentTarget);
    setMenuDashboardId(dashboardId);
    setMenuPageId(pageId || null);
    setMenuType(type);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuDashboardId(null);
    setMenuPageId(null);
    setMenuType(null);
  };

  const handleView = (type: 'dashboard' | 'page', id: string, dashboardId?: string) => {
    handleMenuClose();

    if (type === 'dashboard') {
      const dashboard = getDashboardById(dashboards || [], id);
      if (dashboard) {
        const pagePath = dashboard.pages.length > 0 ? dashboard.pages[0].path : '';
        if (!pagePath) {
          toast('Please create a page first.', {
            type: 'info',
            theme: 'dark',
          });
          return;
        }
        navigate({
          to: '/dashboard/$dashboardPath/$pagePath',
          params: {
            dashboardPath: dashboard.path,
            pagePath,
          },
        });
      }
    } else {
      // Handle page view
      const dashboard = getDashboardById(dashboards || [], dashboardId!);
      const page = dashboard?.pages.find(p => p.id === id);
      if (dashboard && page) {
        navigate({
          to: '/dashboard/$dashboardPath/$pagePath',
          params: {
            dashboardPath: dashboard.path,
            pagePath: page.path,
          },
        });
      }
    }
  };

  const handleEdit = (type: 'dashboard' | 'page', id: string, dashboardId?: string) => {
    handleMenuClose();

    if (type === 'dashboard') {
      setEditingDashboardId(id);
      setFormMode('edit');
    } else {
      // Handle page edit
      setSelectedDashboardId(dashboardId!);
      setEditingPageId(id);
      setPageFormMode('edit');
    }
  };

  const handleDesign = (type: 'dashboard' | 'page', id: string, dashboardId?: string) => {
    if (type === 'dashboard') {
      const dashboard = getDashboardById(dashboards || [], id);
      if (dashboard) {
        const pagePath = dashboard.pages.length > 0 ? dashboard.pages[0].path : '';
        if (!pagePath) {
          toast('Please create a page first.', {
            type: 'info',
            theme: 'dark',
          });
          return;
        }
        navigate({
          to: '/dashboard/$dashboardPath/$pagePath/edit',
          params: {
            dashboardPath: dashboard.path,
            pagePath,
          },
        });
      }
    } else {
      // Handle page view
      const dashboard = getDashboardById(dashboards || [], dashboardId!);
      const page = dashboard?.pages.find(p => p.id === id);
      if (dashboard && page) {
        navigate({
          to: '/dashboard/$dashboardPath/$pagePath/edit',
          params: {
            dashboardPath: dashboard.path,
            pagePath: page.path,
          },
        });
      }
    }
  };

  const handleDelete = (type: 'dashboard' | 'page', id: string, dashboardId?: string) => {
    handleMenuClose();

    if (type === 'dashboard') {
      setDeletingDashboardId(id);
      setDeleteConfirmOpen(true);
    } else {
      // Handle page delete
      setDeletingPageId(id);
      setDeletingPageDashboardId(dashboardId!);
      setDeleteConfirmOpen(true);
    }
  };

  const handleCreatePage = (dashboardId: string) => {
    handleMenuClose();
    setSelectedDashboardId(dashboardId);
    setPageFormMode('new');
  };

  const handleSort = (column: SortColumn) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDuplicate = (type: 'dashboard' | 'page', id: string, dashboardId?: string) => {
    handleMenuClose();

    if (type === 'dashboard') {
      setEditingDashboardId(id);
      setFormMode('duplicate');
    } else {
      // Handle page duplicate
      setSelectedDashboardId(dashboardId!);
      setEditingPageId(id);
      setPageFormMode('duplicate');
    }
  };

  const handleClosePageForm = useCallback(() => {
    setPageFormMode(null);
    setSelectedDashboardId(null);
    setEditingPageId(null);
  }, []);

  const handlePageFormSuccess = useCallback(() => {
    setPageFormMode(null);
    setSelectedDashboardId(null);
    setEditingPageId(null);
    dashboardsQuery.refetch();
  }, [dashboardsQuery]);

  const confirmDelete = async () => {
    if (deletingDashboardId) {
      // Delete dashboard
      try {
        const matchedDashboard = dashboards?.find(d => d.id === deletingDashboardId);
        if (!matchedDashboard) {
          toast('Dashboard not found', {
            type: 'error',
            theme: 'dark',
          });
          return;
        }
        const pagePaths = matchedDashboard.pages.map(page => page.path);

        for (const pagePath of pagePaths) {
          // clear any local storage data for this dashboard and all pages under it
          const storageKey = getStorageKey(matchedDashboard.path, pagePath);
          if (storageKey) {
            localStorage.removeItem(storageKey);
          }
        }

        await deleteDashboard(
          { id: deletingDashboardId },
          {
            success: 'Dashboard deleted',
            error: 'Failed to delete dashboard',
          }
        );
        dashboardsQuery.refetch();
        setDeleteConfirmOpen(false);
        setDeletingDashboardId(null);
      } catch (error) {
        console.error('Error deleting dashboard:', error);
        setDeleteConfirmOpen(false);
        setDeletingDashboardId(null);
      }
    } else if (deletingPageId && deletingPageDashboardId) {
      // Delete page
      try {
        const matchedDashboard = dashboards?.find(d => d.id === deletingPageDashboardId);

        if (!matchedDashboard) {
          toast('Dashboard not found', {
            type: 'error',
            theme: 'dark',
          });
          return;
        }
        const pagePath = matchedDashboard.pages.find(page => page.id === deletingPageId)?.path;
        if (!pagePath) {
          toast('Page not found', {
            type: 'error',
            theme: 'dark',
          });
          return;
        }
        // clear any local storage data for this dashboard page
        const storageKey = getStorageKey(matchedDashboard.path, pagePath);
        if (storageKey) {
          localStorage.removeItem(storageKey);
        }
        await deleteDashboardPage(
          { id: deletingPageDashboardId, pageId: deletingPageId },
          {
            success: 'Page deleted',
            error: 'Failed to delete page',
          }
        );
        dashboardsQuery.refetch();
        setDeleteConfirmOpen(false);
        setDeletingPageId(null);
        setDeletingPageDashboardId(null);
      } catch (error) {
        console.error('Error deleting page:', error);
        setDeleteConfirmOpen(false);
        setDeletingPageId(null);
        setDeletingPageDashboardId(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingDashboardId(null);
    setDeletingPageId(null);
    setDeletingPageDashboardId(null);
  };

  const handleCloseForm = () => {
    setFormMode(null);
    setEditingDashboardId(null);
  };

  const handleFormSuccess = () => {
    // Form will handle refetching, we just need to close
    handleCloseForm();
  };

  // Type for dashboard with optional matched pages
  type DashboardWithMatching = Dashboard & {
    matchedPages?: DashboardPageWithoutData[];
    hasPageMatch?: boolean;
  };

  // Enhanced filtering and sorting logic for dashboards and pages
  const filteredData = useMemo(() => {
    let dashboardsToProcess = dashboards || [];

    // Apply search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchedDashboards: DashboardWithMatching[] = [];
      const dashboardsToExpandLocal: string[] = [];

      for (const dashboard of dashboardsToProcess) {
        const dashboardNameMatch = dashboard.name.toLowerCase().includes(query);
        const dashboardPathMatch = dashboard.path.toLowerCase().includes(query);

        const matchedPages = dashboard.pages.filter(
          page => page.name.toLowerCase().includes(query) || page.path.toLowerCase().includes(query)
        );

        if (dashboardNameMatch || dashboardPathMatch || matchedPages.length > 0) {
          const hasPageMatch = matchedPages.length > 0;
          matchedDashboards.push({
            ...dashboard,
            matchedPages: hasPageMatch ? matchedPages : dashboard.pages,
            hasPageMatch,
          });

          if (hasPageMatch) {
            dashboardsToExpandLocal.push(dashboard.id);
          }
        }
      }

      dashboardsToProcess = matchedDashboards;
    }

    // Apply sorting
    const sortedDashboards = [...dashboardsToProcess].sort((a, b) => {
      const { column, direction } = sortConfig;
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (column) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return {
      dashboards: sortedDashboards,
      hasMatches: searchQuery.trim() ? sortedDashboards.length > 0 : true,
      matchType:
        searchQuery.trim() && sortedDashboards.some(d => (d as DashboardWithMatching).hasPageMatch)
          ? 'pages'
          : ('dashboards' as 'pages' | 'dashboards' | null),
      dashboardsToExpand: searchQuery.trim() ? sortedDashboards.filter(d => (d as DashboardWithMatching).hasPageMatch).map(d => d.id) : [],
    };
  }, [dashboards, searchQuery, sortConfig]);

  const { dashboards: filteredDashboards, hasMatches, matchType, dashboardsToExpand } = filteredData;

  // Auto-expand dashboards when search matches pages within them
  useEffect(() => {
    if (searchQuery.trim()) {
      // When searching, expand dashboards with matching pages
      if (dashboardsToExpand.length > 0) {
        setExpandedDashboards(prev => {
          const newSet = new Set(prev);
          dashboardsToExpand.forEach(id => newSet.add(id));
          return newSet;
        });
      }
    }
    // Note: We only collapse when search is explicitly cleared, not on every data refresh
  }, [dashboardsToExpand, searchQuery]);

  // Separate effect to handle search clearing
  useEffect(() => {
    // Only collapse if we went from having a search to no search
    if (previousSearchQuery.trim() && !searchQuery.trim()) {
      setExpandedDashboards(new Set());
    }
    setPreviousSearchQuery(searchQuery);
  }, [searchQuery, previousSearchQuery, setPreviousSearchQuery]);

  if (!dashboards) {
    return <Spinner absolute text='Loading dashboard data' />;
  }

  const deletingDashboard = dashboards?.find(d => d.id === deletingDashboardId);
  const deletingPage =
    deletingPageDashboardId && deletingPageId
      ? dashboards?.find(d => d.id === deletingPageDashboardId)?.pages.find(p => p.id === deletingPageId)
      : null;

  return (
    <div className={getClassName()}>
      <div className={getClassName('pageHeader')}>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <div className={getClassName('headerContent')}>
            <h1 className={getClassName('pageTitle')}>Dashboards</h1>
            <p className={getClassName('pageSubtitle')}>Manage your custom dashboards</p>
          </div>
          <PrimaryButton aria-label='Create a new dashboard' onClick={() => setFormMode('new')} startIcon={<PlusIcon size={16} />}>
            Create Dashboard
          </PrimaryButton>
        </Row>
      </div>

      <div className={getClassName('searchAndFilter')}>
        <InputField
          type='text'
          id='search-dashboards-and-pages'
          label=''
          helperText='Search for dashboards and pages'
          name='search-dashboards-and-pages'
          size='medium'
          placeholder='Enter a search term...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          startAdornment={<SearchIcon size={18} />}
        />
      </div>

      {searchQuery && hasMatches && (
        <div className={getClassName('searchFilterIndicator')}>
          <Row gap='var(--space-3)' alignItems='center'>
            <InfoIcon size={14} />
            <span>
              Filtering {matchType === 'pages' ? 'pages and dashboards' : 'dashboards'} by &ldquo;{searchQuery}&rdquo;
            </span>
          </Row>
          <Fab
            tooltipProps={{
              placement: 'left',
            }}
            variant='transparent'
            size='sm'
            icon={<X size={16} onClick={() => setSearchQuery('')} />}
            aria-label='Clear search term'
          />
        </div>
      )}

      <DashboardForm
        mode={formMode || 'new'}
        dashboardId={editingDashboardId || undefined}
        isOpen={formMode !== null}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />

      <PageForm
        mode={pageFormMode || 'new'}
        dashboardId={selectedDashboardId || undefined}
        pageId={editingPageId || undefined}
        isOpen={pageFormMode !== null}
        onClose={handleClosePageForm}
        onSuccess={handlePageFormSuccess}
      />

      <Confirm
        open={deleteConfirmOpen}
        title={deletingDashboard ? 'Delete Dashboard' : 'Delete Page'}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      >
        <p>
          Are you sure you want to delete <strong>&ldquo;{deletingDashboard ? deletingDashboard.name : deletingPage?.name}&rdquo;</strong>?
          This action cannot be undone.
        </p>
      </Confirm>

      {filteredDashboards.length === 0 ? (
        <EmptyState
          icon={<LayoutDashboardIcon size={64} />}
          title={searchQuery ? 'No results found' : 'No dashboards yet'}
          description={
            searchQuery
              ? `No dashboards or pages match "${searchQuery}". Try adjusting your search terms.`
              : 'Create your first dashboard to get started with building custom Home Assistant interfaces.'
          }
          actions={
            !searchQuery ? (
              <PrimaryButton aria-label='' onClick={() => setFormMode('new')} startIcon={<PlusIcon size={16} />}>
                Create Your First Dashboard
              </PrimaryButton>
            ) : null
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <colgroup>
              <col style={{ width: TABLE_COLUMNS.DASHBOARD.width, minWidth: TABLE_COLUMNS.DASHBOARD.minWidth }} />
              <col style={{ width: TABLE_COLUMNS.CREATED.width }} />
              <col style={{ width: TABLE_COLUMNS.ACTIONS.width }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableHeaderCell
                  width={TABLE_COLUMNS.DASHBOARD.width}
                  minWidth={TABLE_COLUMNS.DASHBOARD.minWidth}
                  sortable
                  onClick={() => handleSort('name')}
                >
                  <div className={getClassName('sortHeaderContent')}>
                    <span>Dashboard</span>
                    <div className={getClassName({ sortIconActive: sortConfig.column === 'name' }, getClassName('sortIcon'))}>
                      {sortConfig.column === 'name' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </div>
                  </div>
                </TableHeaderCell>
                <TableHeaderCell width={TABLE_COLUMNS.CREATED.width} hiddenBelow='lg' sortable onClick={() => handleSort('created')}>
                  <div className={getClassName('sortHeaderContent')}>
                    <span>Created</span>
                    <div className={getClassName({ sortIconActive: sortConfig.column === 'created' }, getClassName('sortIcon'))}>
                      {sortConfig.column === 'created' ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </div>
                  </div>
                </TableHeaderCell>
                <TableHeaderCell width={TABLE_COLUMNS.ACTIONS.width}>
                  <div className={getClassName('sortHeaderContent')}>
                    <span>Actions</span>
                  </div>
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDashboards.map((dashboard: DashboardWithMatching) => (
                <CollapsibleRow
                  key={dashboard.id}
                  expanded={expandedDashboards.has(dashboard.id)}
                  onToggle={() => toggleExpanded(dashboard.id)}
                  colSpan={Object.keys(TABLE_COLUMNS).length}
                  expandedContent={
                    <>
                      <Table className={getClassName('childTable')}>
                        <colgroup>
                          <col style={{ width: TABLE_COLUMNS.DASHBOARD.width, minWidth: TABLE_COLUMNS.DASHBOARD.minWidth }} />
                          <col style={{ width: TABLE_COLUMNS.CREATED.width }} />
                          <col style={{ width: TABLE_COLUMNS.ACTIONS.width }} />
                        </colgroup>
                        <TableBody>
                          <ChildTableRow>
                            <TableCell colSpan={Object.keys(TABLE_COLUMNS).length} rightAlignLast={false}>
                              <Row fullWidth justifyContent='space-between' alignItems='center'>
                                <span className={getClassName('pageInset')}>
                                  {(dashboard.matchedPages || dashboard.pages).length > 0 ? 'PAGES' : 'No pages found'}
                                </span>
                                <PrimaryButton
                                  aria-label='Create New Page'
                                  size='sm'
                                  onClick={() => handleCreatePage(dashboard.id)}
                                  startIcon={<PlusIcon size={16} />}
                                >
                                  Create Page
                                </PrimaryButton>
                              </Row>
                            </TableCell>
                          </ChildTableRow>

                          {(dashboard.matchedPages || dashboard.pages).map((page: DashboardPageWithoutData) => (
                            <ChildTableRow key={page.id}>
                              <TableCell>
                                <div className={getClassName('pageInfo', getClassName('pageInset'))}>
                                  <div className={getClassName('pageThumbnailContainer')}>
                                    {page.thumbnail ? (
                                      <img src={page.thumbnail} alt={page.name} />
                                    ) : (
                                      <div className={getClassName('thumbnailPlaceholder')}>
                                        <FileTextIcon size={16} />
                                      </div>
                                    )}
                                  </div>
                                  <Column alignItems='flex-start'>
                                    <span className={getClassName('pageName')}>{page.name}</span>
                                    <span className={getClassName('pagePathText')}>{page.path}</span>
                                  </Column>
                                </div>
                              </TableCell>
                              <TableCell hiddenBelow='lg'>
                                <Tooltip title={`Updated ${timeAgo(new Date(page.updatedAt))}`}>
                                  <span className={getClassName('dateText')}>{timeAgo(new Date(page.createdAt))}</span>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <div className={getClassName('actionButtons')}>
                                  <IconButton
                                    aria-label='Actions'
                                    icon={<MoreVertical size={14} />}
                                    size='sm'
                                    onClick={e => handleMenuOpen(e, 'page', dashboard.id, page.id)}
                                  />
                                </div>
                              </TableCell>
                            </ChildTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  }
                >
                  <TableCell width={TABLE_COLUMNS.DASHBOARD.width} minWidth={TABLE_COLUMNS.DASHBOARD.minWidth}>
                    <div className={getClassName('dashboardHeader')}>
                      <Tooltip
                        title={
                          expandedDashboards.has(dashboard.id)
                            ? 'Collapse'
                            : (dashboard.matchedPages || dashboard.pages).length === 0
                              ? 'Expand to create page'
                              : 'Expand to view pages'
                        }
                        placement='top'
                      >
                        <span>
                          <ExpandIcon expanded={expandedDashboards.has(dashboard.id)} onClick={() => toggleExpanded(dashboard.id)} />
                        </span>
                      </Tooltip>
                      <div className={getClassName('dashboardInfo')}>
                        <div className={getClassName('thumbnailContainer')}>
                          {dashboard.thumbnail ? (
                            <img src={dashboard.thumbnail} alt={dashboard.name} width={100} />
                          ) : (
                            <div className={getClassName('thumbnailPlaceholder')}>
                              <LayoutDashboardIcon size={50} />
                            </div>
                          )}
                        </div>
                        <Column alignItems='flex-start'>
                          <span className={getClassName('dashboardName')}>{dashboard.name}</span>
                          <span className={getClassName({ pageCountIsEmpty: dashboard.pages.length === 0 }, getClassName('pageCount'))}>
                            {dashboard.pages.length === 0
                              ? 'No pages'
                              : `${dashboard.pages.length} page${dashboard.pages.length !== 1 ? 's' : ''}`}
                          </span>
                        </Column>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell width={TABLE_COLUMNS.CREATED.width} hiddenBelow='lg'>
                    <Tooltip title={`Updated on ${timeAgo(new Date(dashboard.updatedAt))}`}>
                      <span className={getClassName('dateText')}>{timeAgo(new Date(dashboard.createdAt))}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell width={TABLE_COLUMNS.ACTIONS.width} onClick={e => e.stopPropagation()}>
                    <div className={getClassName('actionButtons')}>
                      <IconButton
                        aria-label='Actions'
                        icon={<MoreVertical size={14} />}
                        size='sm'
                        onClick={e => handleMenuOpen(e, 'dashboard', dashboard.id)}
                      />
                    </div>
                  </TableCell>
                </CollapsibleRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ActionMenu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        {...(menuType === 'dashboard'
          ? {
              type: 'dashboard',
              id: menuDashboardId || '',
              onView: handleView,
              onEdit: handleEdit,
              onDesign: handleDesign,
              onDuplicate: handleDuplicate,
              onCreatePage: handleCreatePage,
              onDelete: handleDelete,
            }
          : {
              type: 'page',
              id: menuPageId || '',
              dashboardId: menuDashboardId || '',
              onView: handleView,
              onEdit: handleEdit,
              onDesign: handleDesign,
              onDuplicate: handleDuplicate,
              onDelete: handleDelete,
            })}
      />
    </div>
  );
}
