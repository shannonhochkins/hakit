import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  GithubIcon,
  GitBranchIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  PackageIcon,
  MoreVerticalIcon,
} from 'lucide-react';
import { Menu, MenuItem } from '@mui/material';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { IconButton } from '@lib/components/Button/IconButton';
import { SwitchField } from '@lib/components/Form/Fields/Switch';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@lib/components/Table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRepositoryWithDetails, userRepositoriesQueryOptions, toggleComponentStatus, disconnectRepository } from '@lib/api/components';
import { Confirm } from '@lib/components/Modal/confirm';

interface RepositoryComponentListProps {
  repositoryWithDetails: UserRepositoryWithDetails;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const Card = styled.div`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  flex: 1;
`;

const ThumbnailContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
`;

const RepositoryInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const RepositoryName = styled.h3`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0;
`;

const RepositoryUrl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const VersionText = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  padding: 0 var(--space-2);
`;

const ExpandedContent = styled.div`
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
`;

const ExpandedInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InfoText = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const InfoItem = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);

  .value {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }
`;

const InfoSeparator = styled.span`
  color: var(--color-text-muted);
`;

const ViewRepoLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-primary-500);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-normal);

  &:hover {
    color: var(--color-primary-400);
  }
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

export function RepositoryComponentList({ repositoryWithDetails, isExpanded, onToggleExpand }: RepositoryComponentListProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [togglingComponents, setTogglingComponents] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const repository = repositoryWithDetails.version;
  const hasUpdate = repositoryWithDetails.repository.latestVersion !== repository.version;

  const toggleComponentMutation = useMutation({
    mutationFn: ({ componentName }: { componentName: string }) => toggleComponentStatus(repositoryWithDetails.id, componentName),
    onMutate: async ({ componentName }) => {
      setTogglingComponents(prev => new Set(prev).add(componentName));

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: userRepositoriesQueryOptions.queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(userRepositoriesQueryOptions.queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(userRepositoriesQueryOptions.queryKey, (old: UserRepositoryWithDetails[] | undefined) => {
        if (!old) return old;

        return old.map(repo => {
          if (repo.id === repositoryWithDetails.id) {
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
    onSuccess: (_, { componentName }) => {
      setTogglingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(componentName);
        return newSet;
      });
    },
    onError: (_, { componentName }, context) => {
      setTogglingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(componentName);
        return newSet;
      });

      // Rollback to previous data
      if (context?.previousData) {
        queryClient.setQueryData(userRepositoriesQueryOptions.queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
    },
  });

  const disconnectRepositoryMutation = useMutation({
    mutationFn: () => disconnectRepository(repositoryWithDetails.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
    },
  });

  const handleToggleComponent = (componentName: string) => {
    toggleComponentMutation.mutate({ componentName });
  };

  const isTogglingComponent = (componentName: string) => {
    return togglingComponents.has(componentName);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleRemove = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    disconnectRepositoryMutation.mutate();
    setDeleteConfirmOpen(false);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
  };

  const handleRemoveClick = () => {
    handleMenuClose();
    handleRemove();
  };

  const handleCheckUpdatesClick = () => {
    handleMenuClose();
    // TODO: Implement check updates functionality
  };

  return (
    <Card>
      <CardHeader>
        <HeaderLeft onClick={onToggleExpand}>
          <IconButton
            variant='transparent'
            size='sm'
            aria-label={isExpanded ? 'Collapse repository' : 'Expand repository'}
            icon={isExpanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
          />
          <ThumbnailContainer>
            <ThumbnailPlaceholder>
              <GithubIcon size={16} />
            </ThumbnailPlaceholder>
          </ThumbnailContainer>
          <RepositoryInfo>
            <RepositoryName>{repositoryWithDetails.repository.name}</RepositoryName>
            <RepositoryUrl>
              <GitBranchIcon size={12} />
              <span>{repositoryWithDetails.repository.githubUrl}</span>
            </RepositoryUrl>
          </RepositoryInfo>
        </HeaderLeft>

        <HeaderRight>
          {hasUpdate ? (
            <SecondaryButton
              startIcon={<RefreshCwIcon size={14} />}
              onClick={() => {
                // TODO: Implement update functionality
              }}
              aria-label={`Update to version ${repositoryWithDetails.repository.latestVersion}`}
            >
              Update to {repositoryWithDetails.repository.latestVersion}
            </SecondaryButton>
          ) : (
            <VersionText>{repository.version}</VersionText>
          )}
          <IconButton
            variant='transparent'
            size='sm'
            onClick={handleMenuOpen}
            aria-label='Repository actions'
            icon={<MoreVerticalIcon size={16} />}
          />
        </HeaderRight>
      </CardHeader>

      {isExpanded && (
        <ExpandedContent>
          <ExpandedInfo>
            <InfoText>
              <InfoItem>
                Components: <span className='value'>{repository.components.length}</span>
              </InfoItem>
              <InfoSeparator>|</InfoSeparator>
              <InfoItem>
                Version: <span className='value'>{repository.version}</span>
              </InfoItem>
            </InfoText>
            {repositoryWithDetails.repository.githubUrl && (
              <ViewRepoLink href={repositoryWithDetails.repository.githubUrl} target='_blank' rel='noopener noreferrer'>
                <span>View repository</span>
                <ExternalLinkIcon size={14} />
              </ViewRepoLink>
            )}
          </ExpandedInfo>
        </ExpandedContent>
      )}

      {isExpanded && repository.components.length > 0 && (
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
              {repository.components.map((component, index) => {
                const isToggling = isTogglingComponent(component.name);

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
                          onChange={() => handleToggleComponent(component.name)}
                          disabled={isToggling}
                          label=''
                        />
                        <StatusText>{isToggling ? 'Updating...' : (component.enabled ?? true) ? 'Enabled' : 'Disabled'}</StatusText>
                      </StatusContainer>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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
        <MenuItem onClick={handleCheckUpdatesClick}>
          <RefreshCwIcon size={16} style={{ marginRight: 8 }} />
          Check for Updates
        </MenuItem>
        <MenuItem onClick={handleRemoveClick} style={{ color: 'var(--color-error-500)' }}>
          <TrashIcon size={16} style={{ marginRight: 8 }} />
          Remove Repository
        </MenuItem>
      </Menu>

      <Confirm open={deleteConfirmOpen} title='Remove Repository' onConfirm={confirmDelete} onCancel={cancelDelete}>
        Are you sure you want to remove {repositoryWithDetails.repository.name}? This will disable all components from this repository.
      </Confirm>
    </Card>
  );
}
