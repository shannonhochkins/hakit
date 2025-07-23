import { useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { PrimaryButton } from '@lib/components/Button/Primary';
import { DownloadCloudIcon, SearchIcon, PackageIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { RepositoryListItem } from './RepositoryListItem';
import { Row } from '@hakit/components';
import { InputField } from '@lib/components/Form/Fields/Input';
import { InputAdornment, Menu, MenuItem } from '@mui/material';
import { EmptyState } from '../../-components/EmptyState';
import { Confirm } from '@lib/components/Modal/confirm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userRepositoriesQueryOptions, disconnectRepository, toggleComponentStatus, UserRepositoryWithDetails } from '@lib/api/components';
import { SwitchField } from '@lib/components/Form/Fields/Switch';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@lib/components/Table';
import { SecondaryButton } from '@lib/components/Button';
import { RepositoryInstallButton } from './RepositoryInstallButton';

interface Component {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  repoId: string;
  userRepoId: string;
}

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

  .mq-md & {
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

  .mq-md & {
    flex-direction: row;
    align-items: center;
  }
`;

const RepositoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
`;

const ComponentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const ComponentIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
`;

const ComponentName = styled.span`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const StatusText = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

export function ComponentsManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userRepositoriesQuery = useQuery(userRepositoriesQueryOptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingUserRepositoryId, setDeletingUserRepositoryId] = useState<string | null>(null);
  const [togglingComponents, setTogglingComponents] = useState<Set<string>>(new Set());
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);

  const userRepositories = useMemo(() => userRepositoriesQuery.data ?? [], [userRepositoriesQuery.data]);

  // Mutations
  const toggleComponentMutation = useMutation({
    mutationFn: ({ userRepositoryId, componentName }: { userRepositoryId: string; componentName: string }) =>
      toggleComponentStatus(userRepositoryId, componentName),
    onMutate: async ({ userRepositoryId, componentName }) => {
      setTogglingComponents(prev => new Set(prev).add(`${userRepositoryId}-${componentName}`));

      await queryClient.cancelQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
      const previousData = queryClient.getQueryData(userRepositoriesQueryOptions.queryKey);

      queryClient.setQueryData(userRepositoriesQueryOptions.queryKey, (old: UserRepositoryWithDetails[] | undefined) => {
        if (!old) return old;

        return old.map(repo => {
          if (repo.id === userRepositoryId) {
            return {
              ...repo,
              version: {
                ...repo.version,
                components: repo.version.components.map(comp => {
                  if (comp.name === componentName) {
                    return { ...comp, enabled: !comp.enabled };
                  }
                  return comp;
                }),
              },
            };
          }
          return repo;
        });
      });

      return { previousData };
    },
    onSuccess: (_, { userRepositoryId, componentName }) => {
      setTogglingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${userRepositoryId}-${componentName}`);
        return newSet;
      });
    },
    onError: (_, { userRepositoryId, componentName }, context) => {
      setTogglingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${userRepositoryId}-${componentName}`);
        return newSet;
      });

      if (context?.previousData) {
        queryClient.setQueryData(userRepositoriesQueryOptions.queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
    },
  });

  const disconnectRepositoryMutation = useMutation({
    mutationFn: (userRepositoryId: string) => disconnectRepository(userRepositoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
    },
  });

  // Create a stable list of components for search and rendering
  const components: Component[] = useMemo(() => {
    return userRepositories.flatMap(
      userRepo =>
        userRepo.version.components?.map(component => ({
          id: `${userRepo.id}-${component.name}`, // Use component name for stable ID
          name: component.name,
          version: userRepo.version.version,
          enabled: component.enabled ?? true, // Default to true if undefined
          repoId: userRepo.repository.id,
          userRepoId: userRepo.id, // Add for easier lookup
        })) || []
    );
  }, [userRepositories]);

  // Filter repositories and components based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        repositories: userRepositories,
        hasMatches: true,
        matchedComponents: components,
      };
    }

    const query = searchQuery.toLowerCase();
    const matchedRepositories = [];
    const matchedComponents: Component[] = [];

    // First find all components that match the search
    const allMatchedComponents = components.filter(component => component.name.toLowerCase().includes(query));

    // Then find repositories that either match by name/description or have matching components
    for (const repo of userRepositories) {
      const repoNameMatch =
        repo.repository.name.toLowerCase().includes(query) || repo.repository.description?.toLowerCase().includes(query);
      const repoComponents = allMatchedComponents.filter(c => c.repoId === repo.repository.id);

      if (repoNameMatch || repoComponents.length > 0) {
        matchedRepositories.push(repo);
        // Include all matched components for this repo
        matchedComponents.push(...repoComponents);
      }
    }

    return {
      repositories: matchedRepositories,
      hasMatches: matchedRepositories.length > 0,
      matchedComponents,
    };
  }, [userRepositories, components, searchQuery]);

  const { repositories: filteredRepositories, hasMatches } = filteredData;

  // Helper functions
  const handleToggleComponent = (userRepositoryId: string, componentName: string) => {
    toggleComponentMutation.mutate({ userRepositoryId, componentName });
  };

  const isTogglingComponent = (userRepositoryId: string, componentName: string) => {
    return togglingComponents.has(`${userRepositoryId}-${componentName}`);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveRepoId(null);
  };

  const handleRemove = (userRepositoryId: string) => {
    setDeleteConfirmOpen(true);
    setDeletingUserRepositoryId(userRepositoryId);
  };

  const handleRemoveClick = () => {
    if (activeRepoId) {
      handleMenuClose();
      handleRemove(activeRepoId);
    }
  };

  const confirmDelete = async () => {
    if (deletingUserRepositoryId) {
      try {
        await disconnectRepositoryMutation.mutateAsync(deletingUserRepositoryId);
        userRepositoriesQuery.refetch();
      } catch (error) {
        console.error('Failed to disconnect repository:', error);
      } finally {
        setDeleteConfirmOpen(false);
        setDeletingUserRepositoryId(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingUserRepositoryId(null);
  };

  const deletingRepository = useMemo(() => {
    if (!deletingUserRepositoryId) return null;
    const userRepo = userRepositories.find(ur => ur.id === deletingUserRepositoryId);
    return userRepo?.repository || null;
  }, [deletingUserRepositoryId, userRepositories]);

  const onExploreComponents = () => {
    navigate({ to: '/me/components/explore' });
  };

  return (
    <Container>
      <PageHeader>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <HeaderContent>
            <PageTitle>Installed Components</PageTitle>
            <PageSubtitle>Manage your dashboard components</PageSubtitle>
          </HeaderContent>
          <PrimaryButton aria-label='Explore components' onClick={onExploreComponents} startIcon={<DownloadCloudIcon size={16} />}>
            Explore Components
          </PrimaryButton>
        </Row>
      </PageHeader>

      <SearchAndFilter>
        <InputField
          size='medium'
          type='text'
          placeholder='Search components...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          variant='outlined'
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
      </SearchAndFilter>

      <RepositoriesContainer>
        {userRepositoriesQuery.isLoading ? (
          <div>Loading repositories...</div>
        ) : userRepositoriesQuery.error ? (
          <div>Error loading repositories: {userRepositoriesQuery.error.message}</div>
        ) : userRepositories.length === 0 ? (
          <EmptyState
            icon={<PackageIcon size={48} />}
            title='No repositories installed'
            description='Install component repositories to add functionality to your dashboards'
            actions={
              <PrimaryButton startIcon={<DownloadCloudIcon size={16} />} onClick={onExploreComponents} aria-label='Explore components'>
                Explore Components
              </PrimaryButton>
            }
          />
        ) : !hasMatches ? (
          <EmptyState
            icon={<PackageIcon size={48} />}
            title='No results found'
            description={`No repositories or components match "${searchQuery}". Try adjusting your search terms.`}
            actions={null}
          />
        ) : (
          filteredRepositories.map(repo => {
            const repository = repo.version;

            const components = searchQuery
              ? repository.components.filter(component => component.name.toLowerCase().includes(searchQuery.toLowerCase()))
              : repository.components;

            return (
              <RepositoryListItem
                key={repo.id}
                repository={repo}
                defaultExpanded
                actions={
                  <Row gap='var(--space-2)'>
                    <SecondaryButton
                      size='sm'
                      startIcon={<EyeIcon size={14} />}
                      onClick={e => {
                        e.stopPropagation();
                        navigate({ to: '/me/components/explore/$repository', params: { repository: repo.repository.id } });
                      }}
                      aria-label={`View details for ${repo.repository?.name}`}
                    >
                      View Details
                    </SecondaryButton>
                    <RepositoryInstallButton repository={repo} />
                  </Row>
                }
              >
                {components.length > 0 && (
                  <TableContainer
                    style={{
                      borderRadius: 'none',
                      border: 'none',
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeaderCell>Component</TableHeaderCell>
                          <TableHeaderCell hiddenBelow='md'>Version</TableHeaderCell>
                          <TableHeaderCell>Status</TableHeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {components.map((component, index) => {
                          const isToggling = isTogglingComponent(repo.id, component.name);

                          return (
                            <TableRow key={`${component.name}-${index}`}>
                              <TableCell>
                                <ComponentInfo>
                                  <ComponentIcon>
                                    <PackageIcon size={16} />
                                  </ComponentIcon>
                                  <ComponentName>{component.name}</ComponentName>
                                </ComponentInfo>
                              </TableCell>
                              <TableCell hiddenBelow='md'>
                                <span>{repository.version}</span>
                              </TableCell>
                              <TableCell>
                                <StatusContainer>
                                  <SwitchField
                                    checked={component.enabled ?? true}
                                    onChange={() => handleToggleComponent(repo.id, component.name)}
                                    disabled={isToggling}
                                    label=''
                                  />
                                  <StatusText>
                                    {isToggling ? 'Updating...' : (component.enabled ?? true) ? 'Enabled' : 'Disabled'}
                                  </StatusText>
                                </StatusContainer>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </RepositoryListItem>
            );
          })
        )}
      </RepositoriesContainer>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleRemoveClick} style={{ color: 'var(--color-error-500)' }}>
          <TrashIcon size={16} style={{ marginRight: 8 }} />
          Remove Repository
        </MenuItem>
      </Menu>

      <Confirm open={deleteConfirmOpen} title='Remove Repository' onConfirm={confirmDelete} onCancel={cancelDelete}>
        <p>
          Are you sure you want to remove <strong>&ldquo;{deletingRepository?.name}&rdquo;</strong>? This action cannot be undone and will
          remove all associated components.
        </p>
      </Confirm>
    </Container>
  );
}
