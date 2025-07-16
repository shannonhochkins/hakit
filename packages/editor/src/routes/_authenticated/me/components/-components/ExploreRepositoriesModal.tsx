import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import {
  SearchIcon,
  PlusIcon,
  PackageIcon,
  StarIcon,
  DownloadIcon,
  CalendarIcon,
  GitBranchIcon,
  ExternalLinkIcon,
  TrashIcon,
} from 'lucide-react';
import { PrimaryButton } from '@lib/components/Button/Primary';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { Modal } from '@lib/components/Modal';
import { InputField } from '@lib/components/Form/Fields/Input';
import { InputAdornment } from '@mui/material';
import { Column, Row } from '@hakit/components';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  searchRepositoriesQueryOptions,
  connectRepository,
  disconnectRepository,
  getRepositoryVersions,
  userRepositoriesQueryOptions,
} from '@lib/api/components';
import { toast } from 'react-toastify';
import { RepositoryAPI } from '@typings/db';

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowCustomRepo: () => void;
}

const SearchAndActions = styled(Row)`
  margin-bottom: var(--space-4);
  gap: var(--space-3);

  @media (min-width: var(--breakpoint-md)) {
    flex-direction: row;
    align-items: center;
  }
`;

const RepositoryList = styled(Column)`
  max-height: 60vh;
  overflow-y: auto;
  gap: var(--space-3);
`;

const RepositoryItem = styled(Row)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: var(--transition-normal);

  &:hover {
    border-color: var(--color-border-hover);
    background: var(--color-surface-elevated);
  }
`;

const RepositoryHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
`;

const RepositoryInfo = styled.div`
  flex: 1;
`;

const RepositoryName = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
`;

const RepositoryAuthor = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

const RepositoryDescription = styled.p`
  color: var(--color-text-secondary);
  margin: var(--space-2) 0 var(--space-3) 0;
  line-height: var(--line-height-relaxed);
`;

const RepositoryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-text-muted);
`;

const LoadingState = styled.div`
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-muted);
`;

const ErrorState = styled.div`
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--color-error-500);
`;

const ComponentTag = styled.span`
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  font-size: var(--font-size-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
`;

const ComponentsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
`;

export function ExploreModal({ isOpen, onClose, onShowCustomRepo }: ExploreModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Determine if we're searching based on trimmed query
  const isSearching = useMemo(() => searchQuery.trim().length > 0, [searchQuery]);

  // Query for user repositories to check what's already connected
  // TODO - Replace this with the available function in api/component.ts
  const userRepositoriesQuery = useQuery({
    ...userRepositoriesQueryOptions,
    enabled: isOpen,
  });

  // Single query for repositories - handles both search and popular
  const repositoriesQuery = useQuery({
    ...searchRepositoriesQueryOptions(isSearching ? searchQuery : '', { limit: 20 }),
    enabled: isOpen,
  });

  // Mutation for connecting to a repository
  const connectRepoMutation = useMutation({
    mutationFn: async (repository: RepositoryAPI) => {
      // Get the repository versions to find the latest version ID
      const versions = await getRepositoryVersions(repository.id);
      const latestVersion = versions.find(v => v.version === repository.latestVersion) || versions[0];

      if (!latestVersion) {
        toast.error('No versions available for this repository');
        return;
      }
      return connectRepository(repository.id, latestVersion.id, {
        success: 'Repository installed successfully',
        error: 'Failed to install repository',
      });
    },
    onSuccess: () => {
      // Refetch both user repositories and the repository lists
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: ['search-repositories'] });
    },
  });

  // Mutation for disconnecting from a repository
  const disconnectRepoMutation = useMutation({
    mutationFn: (userRepositoryId: string) => disconnectRepository(userRepositoryId),
    onSuccess: () => {
      // Refetch both user repositories and the repository lists
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: ['search-repositories'] });
    },
  });

  const repositories = repositoriesQuery.data || [];
  const isLoading = repositoriesQuery.isLoading;
  const error = repositoriesQuery.error;

  // Helper function to check if a repository is already connected
  const isRepositoryConnected = (repositoryId: string) => {
    return userRepositoriesQuery.data?.some(ur => ur.repository.id === repositoryId) || false;
  };

  // Helper function to get the user repository ID for disconnection
  const getUserRepositoryId = (repositoryId: string) => {
    return userRepositoriesQuery.data?.find(ur => ur.repository.id === repositoryId)?.id;
  };

  const handleInstallRepository = (repository: RepositoryAPI) => {
    console.log('userRepositoriesQuery', userRepositoriesQuery);
    const isConnected = isRepositoryConnected(repository.id);

    if (isConnected) {
      // Disconnect the repository
      const userRepoId = getUserRepositoryId(repository.id);
      if (userRepoId) {
        disconnectRepoMutation.mutate(userRepoId);
      }
    } else {
      // Connect the repository
      connectRepoMutation.mutate(repository);
    }
  };

  const formatDate = (dateString: string | null) => {
    // TODO - Figure out why dateString can be null
    if (!dateString) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={isSearching ? `Search Results (${repositories.length})` : 'Explore Components'}>
      <SearchAndActions fullWidth wrap='nowrap'>
        <InputField
          type='text'
          placeholder='Search repositories...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          variant='outlined'
          size='medium'
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
        <PrimaryButton startIcon={<PlusIcon size={16} />} onClick={onShowCustomRepo} aria-label='Add custom repository'>
          Custom Repository
        </PrimaryButton>
      </SearchAndActions>

      <RepositoryList fullWidth>
        {isLoading ? (
          <LoadingState>Loading {isSearching ? 'search results' : 'popular repositories'}...</LoadingState>
        ) : error ? (
          <ErrorState>Failed to load repositories: {error.message}</ErrorState>
        ) : repositories.length === 0 ? (
          <EmptyState>
            {isSearching ? (
              <>
                <PackageIcon size={48} style={{ margin: '0 auto var(--space-4)' }} />
                <div>No repositories found matching &ldquo;{searchQuery}&rdquo;</div>
                <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
                  Try different search terms or add a custom repository
                </div>
              </>
            ) : (
              <>
                <PackageIcon size={48} style={{ margin: '0 auto var(--space-4)' }} />
                <div>No popular repositories found</div>
              </>
            )}
          </EmptyState>
        ) : (
          repositories.map(repo => (
            <RepositoryItem key={repo.id} fullWidth>
              <RepositoryHeader>
                <RepositoryInfo>
                  <RepositoryName>{repo.name}</RepositoryName>
                  <RepositoryAuthor>by {repo.author}</RepositoryAuthor>
                </RepositoryInfo>
                <Row gap='var(--space-2)'>
                  {repo.githubUrl && (
                    <SecondaryButton
                      size='sm'
                      startIcon={<ExternalLinkIcon size={14} />}
                      onClick={() => window.open(repo.githubUrl!, '_blank')}
                      aria-label={`View ${repo.name} repository on GitHub`}
                    >
                      View
                    </SecondaryButton>
                  )}
                  <PrimaryButton
                    size='sm'
                    startIcon={isRepositoryConnected(repo.id) ? <TrashIcon size={14} /> : <DownloadIcon size={14} />}
                    onClick={() => handleInstallRepository(repo)}
                    disabled={connectRepoMutation.isPending || disconnectRepoMutation.isPending}
                    aria-label={`${isRepositoryConnected(repo.id) ? 'Uninstall' : 'Install'} ${repo.name} repository`}
                  >
                    {connectRepoMutation.isPending || disconnectRepoMutation.isPending
                      ? isRepositoryConnected(repo.id)
                        ? 'Disconnecting...'
                        : 'Connecting...'
                      : isRepositoryConnected(repo.id)
                        ? 'Uninstall'
                        : 'Install'}
                  </PrimaryButton>
                </Row>
              </RepositoryHeader>

              {repo.description && <RepositoryDescription>{repo.description}</RepositoryDescription>}

              {repo.latestVersionData?.components && repo.latestVersionData.components.length > 0 && (
                <ComponentsRow>
                  {repo.latestVersionData.components.slice(0, 3).map(component => (
                    <ComponentTag key={component.name}>{component.name}</ComponentTag>
                  ))}
                  {repo.latestVersionData.components.length > 3 && (
                    <ComponentTag>+{repo.latestVersionData.components.length - 3} more</ComponentTag>
                  )}
                </ComponentsRow>
              )}

              <RepositoryMeta>
                <MetaItem>
                  <StarIcon size={14} />
                  <span>
                    {formatNumber(repo.totalDownloads)} download{repo.totalDownloads > 1 ? 's' : ''}
                  </span>
                </MetaItem>
                <MetaItem>
                  <GitBranchIcon size={14} />
                  <span>v{repo.latestVersion || '1.0.0'}</span>
                </MetaItem>
                <MetaItem>
                  <CalendarIcon size={14} />
                  <span>Updated {formatDate(repo.lastUpdated)}</span>
                </MetaItem>
              </RepositoryMeta>
            </RepositoryItem>
          ))
        )}
      </RepositoryList>
    </Modal>
  );
}
