import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { PrimaryButton } from '@lib/components/Button/Primary';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { PlusIcon, SearchIcon, PackageIcon, DownloadIcon, GitBranchIcon, TrashIcon, RefreshCw, GithubIcon, EyeIcon } from 'lucide-react';
import { InputField } from '@lib/components/Form/Fields/Input';
import { InputAdornment } from '@mui/material';
import { Column, Row } from '@hakit/components';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  searchRepositoriesQueryOptions,
  connectRepository,
  disconnectRepository,
  getRepositoryVersions,
  userRepositoriesQueryOptions,
  popularRepositoriesQueryOptions,
} from '@lib/api/components';
import { toast } from 'react-toastify';
import { RepositoryAPI, RepositoryWithLatestVersionAPI } from '@typings/db';
import { ComponentTags } from '../-components/ComponentTags';
import { formatNumber } from '@lib/helpers/number';
import { timeAgo } from '@hakit/core';

export const Route = createFileRoute('/_authenticated/me/components/explore/')({
  component: RouteComponent,
});

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

const RepositoryList = styled(Column)`
  gap: var(--space-3);
`;

const RepositoryItem = styled(Row)`
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: var(--transition-normal);
  cursor: pointer;
  &:hover {
    border-color: var(--color-border-hover);
    background: var(--color-surface-muted);
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
  margin-top: var(--space-3);
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

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Determine if we're searching based on trimmed query
  const isSearching = useMemo(() => searchQuery.trim().length > 0, [searchQuery]);

  // Query for user repositories to check what's already connected
  const userRepositoriesQuery = useQuery(userRepositoriesQueryOptions);

  // Query for popular repositories (used when not searching)
  const popularRepositoriesQuery = useQuery(popularRepositoriesQueryOptions(20));

  // Query for search results (only enabled when actively searching)
  const searchRepositoriesQuery = useQuery(searchRepositoriesQueryOptions(searchQuery, { limit: 20 }));

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
      // Refetch all relevant queries
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: ['search-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['popular-repositories'] });
    },
  });

  // Mutation for disconnecting from a repository
  const disconnectRepoMutation = useMutation({
    mutationFn: (userRepositoryId: string) =>
      disconnectRepository(userRepositoryId, {
        success: 'Repository uninstalled successfully',
        error: 'Failed to uninstall repository',
      }),
    onSuccess: () => {
      // Refetch all relevant queries
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: ['search-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['popular-repositories'] });
    },
  });

  // Use search results when searching, otherwise use popular repositories
  const repositories = isSearching ? searchRepositoriesQuery.data || [] : popularRepositoriesQuery.data || [];

  const isLoading = isSearching ? searchRepositoriesQuery.isLoading : popularRepositoriesQuery.isLoading;

  const error = isSearching ? searchRepositoriesQuery.error : popularRepositoriesQuery.error;

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

  return (
    <Container>
      <PageHeader>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <HeaderContent>
            <PageTitle>{isSearching ? `Search Results (${repositories.length})` : 'Explore Components'}</PageTitle>
            <PageSubtitle>Discover and install components for your dashboards</PageSubtitle>
          </HeaderContent>
          <PrimaryButton aria-label='Add custom repository' startIcon={<PlusIcon size={16} />}>
            Install Addon
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

      <RepositoryList fullWidth>
        {isLoading ? (
          <LoadingState>{isSearching ? 'Searching now...' : 'Loading popular components...'}...</LoadingState>
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
                <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
                  Try searching for specific components instead
                </div>
              </>
            )}
          </EmptyState>
        ) : (
          repositories.map((repo: RepositoryWithLatestVersionAPI) => (
            <RepositoryItem
              key={repo.version.id}
              fullWidth
              alignItems='flex-start'
              justifyContent='stretch'
              gap='var(--space-3)'
              wrap='nowrap'
              onClick={e => {
                e.stopPropagation();
                navigate({ to: '/me/components/explore/$repository', params: { repository: repo.repository.id } });
              }}
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
                  <Row gap='var(--space-2)'>
                    <SecondaryButton
                      size='sm'
                      startIcon={<EyeIcon size={14} />}
                      onClick={() => navigate({ to: '/me/components/explore/$repository', params: { repository: repo.repository.id } })}
                      aria-label={`View details for ${repo.repository?.name}`}
                    >
                      View Details
                    </SecondaryButton>
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
                  <MetaItem>
                    <GithubIcon size={14} />
                    <span>{repo.repository?.author}</span>
                  </MetaItem>
                  <MetaItem>
                    <GitBranchIcon size={14} />
                    <span>v{repo.repository.latestVersion || '1.0.0'}</span>
                  </MetaItem>
                  <MetaItem>
                    <RefreshCw size={14} />
                    <span>Updated {repo.repository.lastUpdated ? timeAgo(new Date(repo.repository.lastUpdated)) : 'Unknown'}</span>
                  </MetaItem>
                </RepositoryMeta>
              </RepositoryInfo>
            </RepositoryItem>
          ))
        )}
      </RepositoryList>
    </Container>
  );
}
