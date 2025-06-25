import { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { PlusIcon, EditIcon, LayoutDashboardIcon, SearchIcon, InfoIcon, EyeIcon, FileTextIcon, X, MoreVertical } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { dashboardsQueryOptions, deleteDashboard, deleteDashboardPage, updateDashboardForUser, updateDashboardPageForUser } from '@lib/api/dashboard';
import { Spinner } from '@lib/components/Spinner';
import { PrimaryButton } from '@lib/page/shared/Button/Primary';
import { EmptyState } from '../shared/EmptyState';
import { DashboardForm } from './DashboardForm';
import { PageForm } from './PageForm';
import { Confirm } from '@lib/page/shared/Modal/confirm';
import { Column, Row } from '@lib/page/shared/Layout';
import { toReadableDate } from '@lib/page/shared/helpers';
import { InputField } from '@lib/components/Form/Fields/Input';
import { SwitchField } from '@lib/components/Form/Fields/Switch';
import { InputAdornment, Menu, MenuItem } from '@mui/material';
import { Tooltip } from '@lib/components/Tooltip';
import { DashboardWithoutPageData, DashboardPageWithoutData } from '@typings/dashboard';
import {
  TableContainer as StyledTableContainer,
  Table as StyledTable,
  TableHead as StyledTableHead,
  TableBody as StyledTableBody,
  TableRow as StyledTableRow,
  TableHeaderCell,
  TableCell as StyledTableCell,
  CollapsibleRow,
  ChildTableRow,
  ExpandIcon,
} from '@lib/components/Table';
import { Fab, SecondaryButton } from '@lib/page/shared/Button';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';

// Table column configuration
const TABLE_COLUMNS = {
  DASHBOARD: { width: '100%', minWidth: '300px' },
  PATH: { width: '200px' },
  CREATED: { width: '150px' },
  STATUS: { width: '120px' },
  ACTIONS: { width: '240px' },
} as const;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  
  @media (min-width: var(--breakpoint-md)) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: var(--color-text-muted);
  margin: 0;
`;

const SearchAndFilter = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const SearchFilterIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-primary-500);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: white;
`;

const DashboardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const DashboardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  transition: all var(--transition-normal);
`;

const PageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: var(--space-10); /* Align with dashboard content after expand button */
  padding-left: var(--space-1); /* Small padding to account for the pseudo-element border */
  width: 100%;
  transition: all var(--transition-normal);
`;

const ThumbnailContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--color-surface-elevated);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PageThumbnailContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--color-surface-elevated);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
`;

const DashboardName = styled.span`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
`;

const PageName = styled.span`
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
`;

const PathText = styled.span`
  color: var(--color-text-muted);
`;

const PagePathText = styled.span`
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
`;

const DateText = styled.span`
  color: var(--color-text-muted);
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  gap: var(--space-2);
`;

const PageCount = styled.span<{ isEmpty?: boolean }>`
  font-size: var(--font-size-xs);
  color: ${props => props.isEmpty ? 'var(--color-text-muted)' : 'var(--color-text-muted)'};
  font-style: ${props => props.isEmpty ? 'italic' : 'normal'};
`;

const ChildTable = styled(StyledTable)`
  table-layout: fixed;
  width: 100%;
  
  /* Force column widths to match parent table */
  colgroup col:nth-child(1) { width: ${TABLE_COLUMNS.DASHBOARD.width}; min-width: ${TABLE_COLUMNS.DASHBOARD.minWidth}; }
  colgroup col:nth-child(2) { width: ${TABLE_COLUMNS.PATH.width}; }
  colgroup col:nth-child(3) { width: ${TABLE_COLUMNS.CREATED.width}; }
  colgroup col:nth-child(4) { width: ${TABLE_COLUMNS.STATUS.width}; }
  colgroup col:nth-child(5) { width: ${TABLE_COLUMNS.ACTIONS.width}; }
  
  /* Ensure cells respect the column widths */
  td:nth-child(1) { width: ${TABLE_COLUMNS.DASHBOARD.width}; min-width: ${TABLE_COLUMNS.DASHBOARD.minWidth}; }
  td:nth-child(2) { width: ${TABLE_COLUMNS.PATH.width}; }
  td:nth-child(3) { width: ${TABLE_COLUMNS.CREATED.width}; }
  td:nth-child(4) { width: ${TABLE_COLUMNS.STATUS.width}; }
  td:nth-child(5) { width: ${TABLE_COLUMNS.ACTIONS.width}; }
`;

function getDashboardById(dashboards: DashboardWithoutPageData[], id: string) {
  return dashboards.find(dashboard => dashboard.id === id) || null;
}

export function MyDashboards() {
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
  const [togglingDashboardId, setTogglingDashboardId] = useState<string | null>(null);
  const [togglingPageId, setTogglingPageId] = useState<string | null>(null);
  const [expandedDashboards, setExpandedDashboards] = useState<Set<string>>(new Set());
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDashboardId, setMenuDashboardId] = useState<string | null>(null);
  const [menuPageId, setMenuPageId] = useState<string | null>(null);
  const [menuType, setMenuType] = useState<'dashboard' | 'page' | null>(null);
  const navigate = useNavigate();

  // Mutation for toggling dashboard enabled status
  const toggleDashboardMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      return updateDashboardForUser({ id, isEnabled });
    },
    onMutate: ({ id }) => {
      // Set the loading state for this specific dashboard
      setTogglingDashboardId(id);
    },
    onSuccess: () => {
      // Clear loading state and refetch dashboards
      setTogglingDashboardId(null);
      dashboardsQuery.refetch();
    },
    onError: (error) => {
      console.error('Error toggling dashboard:', error);
      // Clear loading state and refetch to revert optimistic update
      setTogglingDashboardId(null);
      dashboardsQuery.refetch();
    },
  });

  // Mutation for toggling page enabled status
  const togglePageMutation = useMutation({
    mutationFn: async ({ dashboardId, pageId, isEnabled }: { dashboardId: string; pageId: string; isEnabled: boolean }) => {
      return updateDashboardPageForUser(dashboardId, { id: pageId, isEnabled });
    },
    onMutate: ({ pageId }) => {
      // Set the loading state for this specific page
      setTogglingPageId(pageId);
    },
    onSuccess: () => {
      // Clear loading state and refetch dashboards
      setTogglingPageId(null);
      dashboardsQuery.refetch();
    },
    onError: (error) => {
      console.error('Error toggling page:', error);
      // Clear loading state and refetch to revert optimistic update
      setTogglingPageId(null);
      dashboardsQuery.refetch();
    },
  });

  const handleToggle = async (id: string) => {
    const dashboard = dashboards?.find(d => d.id === id);
    if (!dashboard || togglingDashboardId === id) return;
    
    // Toggle the enabled status
    toggleDashboardMutation.mutate({
      id,
      isEnabled: !dashboard.isEnabled,
    });
  };

  const handlePageToggle = async (dashboardId: string, pageId: string) => {
    const dashboard = dashboards?.find(d => d.id === dashboardId);
    const page = dashboard?.pages.find(p => p.id === pageId);
    if (!page || togglingPageId === pageId) return;
    
    // Toggle the enabled status
    togglePageMutation.mutate({
      dashboardId,
      pageId,
      isEnabled: !page.isEnabled,
    });
  };

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
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>, 
    type: 'dashboard' | 'page', 
    dashboardId: string, 
    pageId?: string
  ) => {
    event.stopPropagation();
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
          to: '/me/$dashboardPath/$pagePath',
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
          to: '/me/$dashboardPath/$pagePath',
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
          to: '/me/$dashboardPath/$pagePath/edit',
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
          to: '/me/$dashboardPath/$pagePath/edit',
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

  const confirmDelete = async () => {
    if (deletingDashboardId) {
      // Delete dashboard
      try {
        await deleteDashboard({ id: deletingDashboardId }, {
          success: 'Dashboard deleted',
          error: 'Failed to delete dashboard'
        });
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
        await deleteDashboardPage({ id: deletingPageDashboardId, pageId: deletingPageId }, {
          success: 'Page deleted',
          error: 'Failed to delete page',
        });
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
  type DashboardWithMatching = DashboardWithoutPageData & {
    matchedPages?: DashboardPageWithoutData[];
    hasPageMatch?: boolean;
  };

  // Enhanced filtering logic for dashboards and pages
  const filteredData = useMemo(() => {
    if (!dashboards || !searchQuery.trim()) {
      return { dashboards: dashboards || [], hasMatches: false, matchType: null, dashboardsToExpand: [] };
    }

    const query = searchQuery.toLowerCase();
    const matchedDashboards: DashboardWithMatching[] = [];
    const dashboardsToExpand: string[] = [];
    let hasPageMatches = false;

    for (const dashboard of dashboards) {
      const dashboardNameMatch = dashboard.name.toLowerCase().includes(query);
      const dashboardPathMatch = dashboard.path.toLowerCase().includes(query);
      
      const matchedPages = dashboard.pages.filter(page => 
        page.name.toLowerCase().includes(query) || 
        page.path.toLowerCase().includes(query)
      );

      if (dashboardNameMatch || dashboardPathMatch || matchedPages.length > 0) {
        matchedDashboards.push({
          ...dashboard,
          matchedPages: matchedPages.length > 0 ? matchedPages : dashboard.pages,
          hasPageMatch: matchedPages.length > 0
        });
        
        if (matchedPages.length > 0) {
          hasPageMatches = true;
          dashboardsToExpand.push(dashboard.id);
        }
      }
    }

    return {
      dashboards: matchedDashboards,
      hasMatches: matchedDashboards.length > 0,
      matchType: hasPageMatches ? 'pages' : 'dashboards' as 'pages' | 'dashboards' | null,
      dashboardsToExpand
    };
  }, [dashboards, searchQuery]);

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
    return <Spinner absolute text="Loading user data" />;
  }

  const deletingDashboard = dashboards?.find(d => d.id === deletingDashboardId);
  const deletingPage = deletingPageDashboardId && deletingPageId ? 
    dashboards?.find(d => d.id === deletingPageDashboardId)?.pages.find(p => p.id === deletingPageId) : 
    null;

  return (
    <Container>
      <PageHeader>
        <Row fullWidth justifyContent="space-between" alignItems="center">
          <HeaderContent>
            <PageTitle>Dashboards</PageTitle>
            <PageSubtitle>Manage your custom dashboards</PageSubtitle>
          </HeaderContent>
          <PrimaryButton 
            onClick={() => setFormMode('new')}
            startIcon={<PlusIcon size={16} />}
          >
            Create Dashboard
          </PrimaryButton>
        </Row>
      </PageHeader>

      <SearchAndFilter>
        <InputField
          style={{
            width: '100%',
            paddingTop: '0',
          }}
          type="text"
          placeholder="Search dashboards and pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={18} />
                </InputAdornment>
              ),
                        },
          }}
        />
      </SearchAndFilter>

      {searchQuery && hasMatches && (
        <SearchFilterIndicator>
          <Row gap="var(--space-3)" alignItems="center">
            <InfoIcon size={14} />
            <span>
              Filtering {matchType === 'pages' ? 'pages and dashboards' : 'dashboards'} by &ldquo;{searchQuery}&rdquo;
            </span>
          </Row>
          <Fab tooltipProps={{
            placement: 'left'
          }} variant="transparent" size="sm" icon={<X size={16} onClick={() => setSearchQuery('')} />} aria-label="Clear search term" />
        </SearchFilterIndicator>
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
        onClose={() => {
          setPageFormMode(null);
          setSelectedDashboardId(null);
          setEditingPageId(null);
        }}
        onSuccess={() => {
          setPageFormMode(null);
          setSelectedDashboardId(null);
          setEditingPageId(null);
          dashboardsQuery.refetch();
        }}
      />

      <Confirm
        open={deleteConfirmOpen}
        title={deletingDashboard ? "Delete Dashboard" : "Delete Page"}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      >
        <p>
          Are you sure you want to delete{' '}
          <strong>
            &ldquo;{deletingDashboard ? deletingDashboard.name : deletingPage?.name}&rdquo;
          </strong>? This action cannot be undone.
        </p>
      </Confirm>

      {filteredDashboards.length === 0 ? (
        <EmptyState
          icon={<LayoutDashboardIcon size={64} />}
          title={searchQuery ? "No results found" : "No dashboards yet"}
          description={
            searchQuery 
              ? `No dashboards or pages match "${searchQuery}". Try adjusting your search terms.`
              : "Create your first dashboard to get started with building custom Home Assistant interfaces."
          }
          actions={
            !searchQuery ? (
              <PrimaryButton 
                onClick={() => setFormMode('new')}
                startIcon={<PlusIcon size={16} />}
              >
                Create Your First Dashboard
              </PrimaryButton>
            ) : null
          }
        />
      ) : (
        <StyledTableContainer>
          <StyledTable>
            <colgroup>
              <col style={{ width: TABLE_COLUMNS.DASHBOARD.width, minWidth: TABLE_COLUMNS.DASHBOARD.minWidth }} />
              <col style={{ width: TABLE_COLUMNS.PATH.width }} />
              <col style={{ width: TABLE_COLUMNS.CREATED.width }} />
              <col style={{ width: TABLE_COLUMNS.STATUS.width }} />
              <col style={{ width: TABLE_COLUMNS.ACTIONS.width }} />
            </colgroup>
            <StyledTableHead>
              <StyledTableRow>
                <TableHeaderCell 
                  width={TABLE_COLUMNS.DASHBOARD.width}
                  minWidth={TABLE_COLUMNS.DASHBOARD.minWidth}
                >
                  Dashboard
                </TableHeaderCell>
                <TableHeaderCell width={TABLE_COLUMNS.PATH.width}>
                  Path
                </TableHeaderCell>
                <TableHeaderCell 
                  width={TABLE_COLUMNS.CREATED.width}
                  hiddenBelow="lg"
                >
                  Created
                </TableHeaderCell>
                <TableHeaderCell width={TABLE_COLUMNS.STATUS.width}>
                  Status
                </TableHeaderCell>
                <TableHeaderCell width={TABLE_COLUMNS.ACTIONS.width}>
                  Actions
                </TableHeaderCell>
              </StyledTableRow>
            </StyledTableHead>
            <StyledTableBody>
              {filteredDashboards.map((dashboard: DashboardWithMatching) => (
                <CollapsibleRow
                  key={dashboard.id}
                  expanded={expandedDashboards.has(dashboard.id)}
                  onToggle={() => toggleExpanded(dashboard.id)}
                  colSpan={5}
                  expandedContent={
                    <>
                      <ChildTable>
                        <colgroup>
                          <col style={{ width: TABLE_COLUMNS.DASHBOARD.width, minWidth: TABLE_COLUMNS.DASHBOARD.minWidth }} />
                          <col style={{ width: TABLE_COLUMNS.PATH.width }} />
                          <col style={{ width: TABLE_COLUMNS.CREATED.width }} />
                          <col style={{ width: TABLE_COLUMNS.STATUS.width }} />
                          <col style={{ width: TABLE_COLUMNS.ACTIONS.width }} />
                        </colgroup>
                        <StyledTableBody>
                          <ChildTableRow>
                            <StyledTableCell colSpan={5}>
                              <Row fullWidth justifyContent="space-between" alignItems="center">
                                <span>
                                  {(dashboard.matchedPages || dashboard.pages).length > 0 
                                    ? 'PAGES'
                                    : 'No pages found'}
                                </span>
                                <PrimaryButton 
                                  size="sm"
                                  onClick={() => handleCreatePage(dashboard.id)}
                                  startIcon={<PlusIcon size={16} />}
                                >
                                  Create Page
                                </PrimaryButton>
                              </Row>
                            </StyledTableCell>
                          </ChildTableRow>
                          
                          {(dashboard.matchedPages || dashboard.pages).map((page: DashboardPageWithoutData) => (
                            <ChildTableRow key={page.id}>
                              <StyledTableCell>
                                <PageInfo>
                                  <PageThumbnailContainer>
                                    {page.thumbnail ? (
                                      <img src={page.thumbnail} alt={page.name} />
                                    ) : (
                                      <ThumbnailPlaceholder>
                                        <FileTextIcon size={16} />
                                      </ThumbnailPlaceholder>
                                    )}
                                  </PageThumbnailContainer>
                                  <PageName>{page.name}</PageName>
                                </PageInfo>
                              </StyledTableCell>
                              <StyledTableCell>
                                <PagePathText>{page.path}</PagePathText>
                              </StyledTableCell>
                              <StyledTableCell hiddenBelow="lg">
                                <DateText>-</DateText>
                              </StyledTableCell>
                              <StyledTableCell>
                                <StatusContainer>
                                  <Tooltip title={page.isEnabled ? 'Enabled' : 'Disabled'} placement="top">
                                    <SwitchField
                                      checked={page.isEnabled}
                                      loading={togglingPageId === page.id}
                                      onChange={() => handlePageToggle(dashboard.id, page.id)}
                                      style={{ paddingTop: 0 }}
                                    />
                                  </Tooltip>
                                </StatusContainer>
                              </StyledTableCell>
                              <StyledTableCell>
                                <ActionButtons>
                                  <Tooltip title="View Page">
                                    <SecondaryButton 
                                      fullHeight 
                                      size="sm" 
                                      startIcon={<EyeIcon size={14} />}
                                      onClick={() => handleView('page', page.id, dashboard.id)}
                                    >
                                      View
                                    </SecondaryButton>
                                  </Tooltip>
                                  <Tooltip title="Design Page">
                                    <SecondaryButton 
                                      fullHeight 
                                      size="sm" 
                                      startIcon={<LayoutDashboardIcon size={14} />}
                                      onClick={() => handleDesign('page', page.id, dashboard.id)}
                                    >
                                      Design
                                    </SecondaryButton>
                                  </Tooltip>
                                  <Tooltip title="Actions">
                                    <SecondaryButton 
                                      fullHeight 
                                      autoWidth 
                                      size="sm" 
                                      onClick={(e) => handleMenuOpen(e, 'page', dashboard.id, page.id)}
                                    >
                                      <MoreVertical size={14} />
                                    </SecondaryButton>
                                  </Tooltip>
                                </ActionButtons>
                              </StyledTableCell>
                            </ChildTableRow>
                          ))}
                        </StyledTableBody>
                      </ChildTable>
                    </>
                  }
                >
                  <StyledTableCell 
                    width={TABLE_COLUMNS.DASHBOARD.width}
                    minWidth={TABLE_COLUMNS.DASHBOARD.minWidth}
                  >
                    <DashboardHeader>
                      <Tooltip 
                        title={
                          expandedDashboards.has(dashboard.id) 
                            ? "Collapse" 
                            : (dashboard.matchedPages || dashboard.pages).length === 0
                              ? "Expand to create page"
                              : "Expand to view pages"
                        } 
                        placement="top"
                      >
                        <span>
                          <ExpandIcon
                            expanded={expandedDashboards.has(dashboard.id)}
                            onClick={() => toggleExpanded(dashboard.id)}
                          />
                        </span>
                      </Tooltip>
                      <DashboardInfo>
                        <ThumbnailContainer>
                          {dashboard.thumbnail ? (
                            <img src={dashboard.thumbnail} alt={dashboard.name} width={100} />
                          ) : (
                            <ThumbnailPlaceholder>
                              <LayoutDashboardIcon size={50} />
                            </ThumbnailPlaceholder>
                          )}
                        </ThumbnailContainer>
                        <Column>
                          <DashboardName>{dashboard.name}</DashboardName>
                          <PageCount isEmpty={dashboard.pages.length === 0}>
                            {dashboard.pages.length === 0 ? 'No pages' : `${dashboard.pages.length} page${dashboard.pages.length !== 1 ? 's' : ''}`}
                          </PageCount>
                        </Column>
                      </DashboardInfo>
                    </DashboardHeader>
                  </StyledTableCell>
                  <StyledTableCell width={TABLE_COLUMNS.PATH.width}>
                    <PathText>{dashboard.path}</PathText>
                  </StyledTableCell>
                  <StyledTableCell 
                    width={TABLE_COLUMNS.CREATED.width}
                    hiddenBelow="lg"
                  >
                    <Tooltip title={`Updated on ${toReadableDate(dashboard.updatedAt)}`}>
                      <DateText>{toReadableDate(dashboard.createdAt)}</DateText>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell 
                    width={TABLE_COLUMNS.STATUS.width}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusContainer>
                      <Tooltip title={dashboard.isEnabled ? 'Enabled' : 'Disabled'} placement="top">
                        <SwitchField
                          checked={dashboard.isEnabled}
                          loading={togglingDashboardId === dashboard.id}
                          onChange={() => handleToggle(dashboard.id)}
                          style={{ paddingTop: 0 }}
                        />
                      </Tooltip>
                    </StatusContainer>
                  </StyledTableCell>
                  <StyledTableCell 
                    width={TABLE_COLUMNS.ACTIONS.width}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionButtons>
                      <Tooltip title="View Dashboard">
                        <SecondaryButton 
                          fullHeight 
                          size="sm" 
                          startIcon={<EyeIcon size={14} />}
                          onClick={() => handleView('dashboard', dashboard.id)}
                        >
                          View
                        </SecondaryButton>
                      </Tooltip>
                      <Tooltip title="Design Dashboard">
                        <SecondaryButton 
                          fullHeight 
                          size="sm" 
                          startIcon={<LayoutDashboardIcon size={14} />} 
                          onClick={() => handleDesign('dashboard', dashboard.id)}
                        >
                          Design
                        </SecondaryButton>
                      </Tooltip>
                      <Tooltip title="Actions">
                        <SecondaryButton 
                          fullHeight 
                          autoWidth 
                          size="sm" 
                          onClick={(e) => handleMenuOpen(e, 'dashboard', dashboard.id)}
                        >
                          <MoreVertical size={14} />
                        </SecondaryButton>
                      </Tooltip>
                    </ActionButtons>
                  </StyledTableCell>
                </CollapsibleRow>
              ))}
            </StyledTableBody>
          </StyledTable>
        </StyledTableContainer>
      )}
      
      <ActionsMenu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        {...(menuType === 'dashboard' ? {
          type: 'dashboard' as const,
          id: menuDashboardId || '',
          onView: handleView,
          onEdit: handleEdit,
          onDuplicate: handleDuplicate,
          onCreatePage: handleCreatePage,
          onDelete: handleDelete,
        } : {
          type: 'page' as const,
          id: menuPageId || '',
          dashboardId: menuDashboardId || '',
          onView: handleView,
          onEdit: handleEdit,
          onDuplicate: handleDuplicate,
          onDelete: handleDelete,
        })}
      />
    </Container>
  );
}

// Types for ActionsMenu
type DashboardMenuProps = {
  type: 'dashboard';
  id: string;
  onView: (type: 'dashboard', id: string) => void;
  onEdit: (type: 'dashboard', id: string) => void;
  onDuplicate: (type: 'dashboard', id: string) => void;
  onCreatePage: (dashboardId: string) => void;
  onDelete: (type: 'dashboard', id: string) => void;
};

type PageMenuProps = {
  type: 'page';
  id: string;
  dashboardId: string;
  onView: (type: 'page', id: string, dashboardId: string) => void;
  onEdit: (type: 'page', id: string, dashboardId: string) => void;
  onDuplicate: (type: 'page', id: string, dashboardId: string) => void;
  onDelete: (type: 'page', id: string, dashboardId: string) => void;
};

type ActionsMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
} & (DashboardMenuProps | PageMenuProps);

// Add the Menu component for actions
const ActionsMenu = (props: ActionsMenuProps) => {
  const { anchorEl, open, onClose, type, id } = props;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={() => {
        if (type === 'dashboard') {
          props.onView('dashboard', id);
        } else {
          props.onView('page', id, props.dashboardId);
        }
      }}>
        <EyeIcon size={16} style={{ marginRight: 8 }} />
        {type === 'dashboard' ? 'View Dashboard' : 'View Page'}
      </MenuItem>
      <MenuItem onClick={() => {
        if (type === 'dashboard') {
          props.onEdit('dashboard', id);
        } else {
          props.onEdit('page', id, props.dashboardId);
        }
      }}>
        <EditIcon size={16} style={{ marginRight: 8 }} />
        {type === 'dashboard' ? 'Rename Dashboard' : 'Edit Page'}
      </MenuItem>
      <MenuItem onClick={() => {
        if (type === 'dashboard') {
          props.onDuplicate('dashboard', id);
        } else {
          props.onDuplicate('page', id, props.dashboardId);
        }
      }}>
        <FileTextIcon size={16} style={{ marginRight: 8 }} />
        {type === 'dashboard' ? 'Duplicate Dashboard' : 'Duplicate Page'}
      </MenuItem>
      {type === 'dashboard' && (
        <MenuItem onClick={() => props.onCreatePage(id)}>
          <PlusIcon size={16} style={{ marginRight: 8 }} />
          Add Page
        </MenuItem>
      )}
      <MenuItem 
        onClick={() => {
          if (type === 'dashboard') {
            props.onDelete('dashboard', id);
          } else {
            props.onDelete('page', id, props.dashboardId);
          }
        }} 
        style={{ color: 'var(--color-error-500)' }}
      >
        <LayoutDashboardIcon size={16} style={{ marginRight: 8 }} />
        {type === 'dashboard' ? 'Delete Dashboard' : 'Delete Page'}
      </MenuItem>
    </Menu>
  );
};