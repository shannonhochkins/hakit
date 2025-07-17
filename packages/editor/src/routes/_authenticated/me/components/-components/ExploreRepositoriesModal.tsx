import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { SearchIcon, PlusIcon, PackageIcon, DownloadIcon, GitBranchIcon, TrashIcon, RefreshCw, GithubIcon } from 'lucide-react';
import { PrimaryButton } from '@lib/components/Button/Primary';
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
import { RepositoryAPI, RepositoryWithLatestVersionAPI } from '@typings/db';
import { ComponentTags } from './ComponentTags';

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
    background: var(--color-surface-overlay);
  }
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
  gap: 0;
  width: 100%;
  margin-top: var(--space-2);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-right: var(--space-4);
`;

const MetaLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-right: var(--space-4);
  color: var(--color-text-muted);
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

const ThumbnailContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface-elevated);
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
    mutationFn: (userRepositoryId: string) =>
      disconnectRepository(userRepositoryId, {
        success: 'Repository uninstall successfully',
        error: 'Failed to uninstall repository',
      }),
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
    return userRepositoriesQuery.data?.some(ur => ur.versionId === repositoryId) || false;
  };

  // Helper function to get the user repository ID for disconnection
  const getUserRepositoryId = (repositoryId: string) => {
    return userRepositoriesQuery.data?.find(ur => ur.versionId === repositoryId)?.id;
  };

  const handleInstallRepository = (repository: RepositoryWithLatestVersionAPI) => {
    const isConnected = isRepositoryConnected(repository.version.id);

    if (isConnected) {
      // Disconnect the repository
      const userRepoId = getUserRepositoryId(repository.version.id);
      if (userRepoId) {
        disconnectRepoMutation.mutate(userRepoId);
      }
    } else {
      // Connect the repository
      connectRepoMutation.mutate(repository.repository);
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
          <LoadingState>{isSearching ? 'Searching now...' : 'Loading...'}...</LoadingState>
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
                <div>No repositories found</div>
              </>
            )}
          </EmptyState>
        ) : (
          repositories.map(repo => (
            <RepositoryItem
              key={repo.version.id}
              fullWidth
              alignItems='flex-start'
              justifyContent='stretch'
              gap='var(--space-3)'
              wrap='nowrap'
            >
              <ThumbnailContainer>
                <ThumbnailPlaceholder>
                  <PackageIcon size={32} />
                </ThumbnailPlaceholder>
              </ThumbnailContainer>
              <RepositoryInfo>
                <Row fullWidth justifyContent='space-between' alignItems='center'>
                  <div>
                    <RepositoryName>{repo.repository?.name}</RepositoryName>
                    <RepositoryAuthor>by {repo.repository?.author}</RepositoryAuthor>
                  </div>
                  <PrimaryButton
                    size='sm'
                    startIcon={isRepositoryConnected(repo.version.id) ? <TrashIcon size={14} /> : <DownloadIcon size={14} />}
                    onClick={() => handleInstallRepository(repo)}
                    disabled={connectRepoMutation.isPending || disconnectRepoMutation.isPending}
                    aria-label={`${isRepositoryConnected(repo.version.id) ? 'Uninstall' : 'Install'} repository`}
                  >
                    {connectRepoMutation.isPending || disconnectRepoMutation.isPending
                      ? isRepositoryConnected(repo.version.id)
                        ? 'Disconnecting...'
                        : 'Connecting...'
                      : isRepositoryConnected(repo.version.id)
                        ? 'Uninstall'
                        : 'Install'}
                  </PrimaryButton>
                </Row>

                {repo.repository.description && <RepositoryDescription>{repo.repository.description}</RepositoryDescription>}
                <ComponentTags components={repo.version.components} />
                <RepositoryMeta>
                  <MetaItem>
                    <DownloadIcon size={14} />
                    <span>
                      {formatNumber(repo.repository.totalDownloads)} download{repo.repository.totalDownloads === 1 ? '' : 's'}
                    </span>
                  </MetaItem>
                  <MetaLink href={repo.repository.githubUrl} target='_blank' rel='noopener noreferrer'>
                    <GithubIcon size={14} />
                    <span>{repo.repository?.author}</span>
                  </MetaLink>
                  <MetaItem>
                    <GitBranchIcon size={14} />
                    <span>v{repo.repository.latestVersion || '1.0.0'}</span>
                  </MetaItem>
                  <MetaItem>
                    <RefreshCw size={14} />
                    <span>Updated {formatDate(repo.repository.lastUpdated)}</span>
                  </MetaItem>
                </RepositoryMeta>
              </RepositoryInfo>
            </RepositoryItem>
          ))
        )}
      </RepositoryList>
    </Modal>
  );
}
