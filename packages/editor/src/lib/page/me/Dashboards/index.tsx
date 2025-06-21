import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { PlusIcon, SlidersIcon, TrashIcon, EditIcon, LayoutDashboardIcon, SearchIcon } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { dashboardsQueryOptions, deleteDashboard, updateDashboardForUser } from '@lib/api/dashboard';
import { Spinner } from '@lib/components/Spinner';
import { PrimaryButton } from '@lib/page/shared/Button/Primary';
import { EmptyState } from '../shared/EmptyState';
import { DashboardForm } from './DashboardForm';
import { Confirm } from '@lib/page/shared/Modal/confirm';
import { Row } from '@lib/page/shared/Layout';
import { toReadableDate } from '@lib/page/shared/helpers';
import { InputField } from '@lib/components/Form/Fields/Input';
import { SwitchField } from '@lib/components/Form/Fields/Switch';
import { InputAdornment } from '@mui/material';
import { Tooltip } from '@lib/components/Tooltip';

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
  align-items: flex-start;
  
  @media (min-width: var(--breakpoint-md)) {
    flex-direction: row;
    align-items: center;
  }
`;


const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color var(--transition-normal);
  
  &:hover {
    background-color: var(--color-border);
  }
`;

const DashboardTable = styled.div`
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
`;

const TableHeaderRow = styled.tr`
  border-bottom: 1px solid var(--color-border);
`;

const TableHeader = styled.th<{ hiddenBelow?: 'md' | 'lg' }>`
  padding: var(--space-3) var(--space-6);
  text-align: left;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  
  ${props => props.hiddenBelow && `
    @media (max-width: ${props.hiddenBelow === 'md' ? 'var(--breakpoint-md)' : 'var(--breakpoint-lg)'}) {
      display: none;
    }
  `}
  
  &:last-child {
    text-align: right;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-normal);
  
  &:hover {
    background-color: var(--color-border-subtle);
  }
`;

const TableCell = styled.td<{ hiddenBelow?: 'md' | 'lg' }>`
  padding: var(--space-4) var(--space-6);
  
  ${props => props.hiddenBelow && `
    @media (max-width: ${props.hiddenBelow === 'md' ? 'var(--breakpoint-md)' : 'var(--breakpoint-lg)'}) {
      display: none;
    }
  `}
  
  &:last-child {
    text-align: right;
  }
`;

const DashboardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
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

const PathText = styled.span`
  color: var(--color-text-muted);
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
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
`;

const ActionButton = styled.button<{ variant?: 'danger' }>`
  padding: var(--space-1);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-normal);
  
  &:hover {
    color: ${props => props.variant === 'danger' ? 'var(--color-error-500)' : 'var(--color-text-primary)'};
  }
`;

export function MyDashboards() {
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = useMemo(() => dashboardsQuery.data, [dashboardsQuery.data]);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'duplicate' | null>(null);
  const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingDashboardId, setDeletingDashboardId] = useState<string | null>(null);
  const [togglingDashboardId, setTogglingDashboardId] = useState<string | null>(null);

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

  const handleToggle = async (id: string) => {
    const dashboard = dashboards?.find(d => d.id === id);
    if (!dashboard || togglingDashboardId === id) return;
    
    // Toggle the enabled status
    toggleDashboardMutation.mutate({
      id,
      isEnabled: !dashboard.isEnabled,
    });
  };

  const handleDelete = (id: string) => {
    setDeletingDashboardId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingDashboardId) return;
    
    try {
      await deleteDashboard({ id: deletingDashboardId });
      dashboardsQuery.refetch();
      setDeleteConfirmOpen(false);
      setDeletingDashboardId(null);
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      // TODO: Show error toast
      setDeleteConfirmOpen(false);
      setDeletingDashboardId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingDashboardId(null);
  };

  const handleEdit = (id: string) => {
    setEditingDashboardId(id);
    setFormMode('edit');
  };

  const handleCloseForm = () => {
    setFormMode(null);
    setEditingDashboardId(null);
  };

  const handleFormSuccess = () => {
    // Form will handle refetching, we just need to close
    handleCloseForm();
  };

  if (!dashboards) {
    return <Spinner absolute text="Loading user data" />;
  }

  const filteredDashboards = dashboards.filter(dashboard => 
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('filteredDashboards', filteredDashboards);

  const deletingDashboard = dashboards?.find(d => d.id === deletingDashboardId);

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
        <Row fullWidth gap="var(--space-4)">
          <InputField
            style={{
              width: '100%',
              paddingTop: '0',
            }}
            type="text"
            placeholder="Search dashboards..."
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
          <FilterButton>
            <SlidersIcon size={16} />
            <span>Filter</span>
          </FilterButton>
        </Row>
      </SearchAndFilter>

      <DashboardForm
        mode={formMode || 'new'}
        dashboardId={editingDashboardId || undefined}
        isOpen={formMode !== null}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />

      <Confirm
        open={deleteConfirmOpen}
        title="Delete Dashboard"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      >
        <p>
          Are you sure you want to delete <strong>&ldquo;{deletingDashboard?.name}&rdquo;</strong>? This action cannot be undone.
        </p>
      </Confirm>

      {filteredDashboards.length === 0 ? (
        <EmptyState
          icon={<LayoutDashboardIcon size={64} />}
          title={searchQuery ? "No dashboards found" : "No dashboards yet"}
          description={
            searchQuery 
              ? `No dashboards match "${searchQuery}". Try adjusting your search terms.`
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
        <DashboardTable>
          <Table>
            <TableHead>
              <TableHeaderRow>
                <TableHeader>Dashboard</TableHeader>
                <TableHeader hiddenBelow="md">Path</TableHeader>
                <TableHeader hiddenBelow="md">Pages</TableHeader>
                <TableHeader hiddenBelow="lg">Created</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableHeaderRow>
            </TableHead>
            <TableBody>
              {filteredDashboards.map(dashboard => (
                <TableRow key={dashboard.id}>
                  <TableCell>
                    <DashboardInfo>
                      <ThumbnailContainer>
                        {dashboard.thumbnail ? (
                          <img src={dashboard.thumbnail} alt={dashboard.name} />
                        ) : (
                          <ThumbnailPlaceholder>
                            <LayoutDashboardIcon size={16} />
                          </ThumbnailPlaceholder>
                        )}
                      </ThumbnailContainer>
                      <DashboardName>{dashboard.name}</DashboardName>
                    </DashboardInfo>
                  </TableCell>
                  <TableCell hiddenBelow="md">
                    <PathText>{dashboard.path}</PathText>
                  </TableCell>
                  <TableCell hiddenBelow="md">
                    <PathText>{dashboard.pages.length}</PathText>
                  </TableCell>
                  <TableCell hiddenBelow="lg">
                    <DateText>{toReadableDate(dashboard.createdAt)}</DateText>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButton onClick={() => handleEdit(dashboard.id)}>
                        <EditIcon size={16} />
                      </ActionButton>
                      <ActionButton 
                        variant="danger" 
                        onClick={() => handleDelete(dashboard.id)}
                      >
                        <TrashIcon size={16} />
                      </ActionButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardTable>
      )}
    </Container>
  );
}