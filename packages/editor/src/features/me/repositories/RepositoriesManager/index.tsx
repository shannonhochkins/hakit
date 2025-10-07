import { useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { PrimaryButton } from '@components/Button/Primary';
import { DownloadCloudIcon, SearchIcon, PackageIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { RepositoryListItem } from '@features/me/repositories/RepositoriesManager/RepositoryListItem';
import { Row } from '@components/Layout';
import { InputField } from '@components/Form/Field/Input';
import { Menu, MenuItem } from '@components/Menu';
import { Confirm } from '@components/Modal/confirm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userRepositoriesQueryOptions, disconnectRepository, toggleComponentStatus } from '@services/repositories';
import { UserRepository } from '@typings/hono';
import { SwitchField } from '@components/Form/Field/Switch';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@components/Table';
import { SecondaryButton } from '@components/Button';
import { RepositoryInstallButton } from '@features/me/repositories/RepositoriesManager/RepositoryInstallButton';
import { EmptyState } from '@components/EmptyState';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './RepositoriesManager.module.css';

const getClassName = getClassNameFactory('RepositoriesManager', styles);

interface Component {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  repoId: string;
  userRepoId: string;
}

export function RepositoriesManager() {
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

      queryClient.setQueryData(userRepositoriesQueryOptions.queryKey, (old: UserRepository[] | undefined) => {
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
    navigate({ to: '/me/repositories/explore' });
  };

  return (
    <div className={getClassName()}>
      <div className={getClassName('pageHeader')}>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <div className={getClassName('headerContent')}>
            <h1 className={getClassName('pageTitle')}>Installed Repositories</h1>
            <p className={getClassName('pageSubtitle')}>Manage your dashboard repositories & components</p>
          </div>
          <PrimaryButton aria-label='Explore Repositories' onClick={onExploreComponents} startIcon={<DownloadCloudIcon size={16} />}>
            Explore Repositories
          </PrimaryButton>
        </Row>
      </div>

      <div className={getClassName('searchAndFilter')}>
        <InputField
          size='medium'
          type='text'
          id='search-components'
          name='search-components'
          label=''
          helperText='Search for installed components'
          placeholder='Search components...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          startAdornment={<SearchIcon size={18} />}
        />
      </div>

      <div className={getClassName('repositoriesContainer')}>
        {userRepositoriesQuery.isLoading ? (
          <div>Loading repositories...</div>
        ) : userRepositoriesQuery.error ? (
          <div>Error loading repositories: {userRepositoriesQuery.error.message}</div>
        ) : userRepositories.length === 0 ? (
          <EmptyState
            icon={<PackageIcon size={48} />}
            title='No repositories installed'
            description='Install repositories to add functionality to your dashboards'
            actions={
              <PrimaryButton startIcon={<DownloadCloudIcon size={16} />} onClick={onExploreComponents} aria-label='Explore Repositories'>
                Explore Repositories
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
                        navigate({ to: '/me/repositories/explore/$repository', params: { repository: repo.repository.id } });
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
                                <div className={getClassName('componentInfo')}>
                                  <div className={getClassName('componentIcon')}>
                                    <PackageIcon size={16} />
                                  </div>
                                  <span className={getClassName('componentName')}>{component.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={getClassName('statusContainer')}>
                                  <SwitchField
                                    isolated={false}
                                    id={`${component.name}-${index}`}
                                    name={`${component.name}-${index}`}
                                    checked={component.enabled ?? true}
                                    onChange={() => handleToggleComponent(repo.id, component.name)}
                                    disabled={isToggling}
                                  />
                                </div>
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
      </div>

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
    </div>
  );
}
