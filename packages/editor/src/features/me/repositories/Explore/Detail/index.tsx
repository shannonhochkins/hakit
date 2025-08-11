import { useMemo } from 'react';
import styled from '@emotion/styled';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { PrimaryButton, SecondaryButton } from '@components/Button';
import { Spinner } from '@components/Spinner';
import { Row, Column } from '@hakit/components';
import {
  ArrowLeftIcon,
  GithubIcon,
  StarIcon,
  PackageIcon,
  UserIcon,
  CalendarIcon,
  DownloadIcon,
  AlertCircleIcon,
  CodeIcon,
  TagIcon,
  RefreshCwIcon,
  TrashIcon,
} from 'lucide-react';
import {
  repositoryQueryOptions,
  userRepositoriesQueryOptions,
  connectRepository,
  disconnectRepository,
  getRepositoryVersions,
} from '@services/repositories';
import { formatNumber } from '@helpers/number';
import { timeAgo } from '@hakit/core';
import { Octokit } from '@octokit/rest';
import { MarkdownRenderer } from '@components/Markdown/MarkdownRenderer';

// Create Octokit instance (no auth needed for public repos)
const octokit = new Octokit();

// Styled Components
const Container = styled(Column)`
  gap: var(--space-6);
`;

const BackButtonContainer = styled(Row)`
  gap: var(--space-4);
`;

const BackButton = styled.button`
  padding: var(--space-2);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-surface-overlay);
  }
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
`;

const RepositoryOverview = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  width: 100%;
`;

const OverviewContent = styled.div`
  padding: var(--space-6);
  width: 100%;
`;

const RepositoryLayout = styled(Row)`
  gap: var(--space-6);
  align-items: flex-start;

  .mq-md & {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const ThumbnailContainer = styled(Row)`
  height: 128px;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface-elevated);
  flex-shrink: 0;
`;

const ThumbnailPlaceholder = styled(Row)`
  height: 100%;
  width: 100%;
  color: var(--color-text-muted);
`;

const RepositoryInfo = styled.div`
  flex: 1;
`;

const Description = styled.p`
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-4) 0;
  line-height: var(--line-height-relaxed);
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--space-4);
`;

const MetaItem = styled(Row)`
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  align-items: center;
  justify-content: flex-start;
`;

const MetaLabel = styled.span`
  color: var(--color-text-muted);
`;

const MetaValue = styled.span`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
`;

const MetaLink = styled(Row)`
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: flex-start;

  &:hover {
    color: var(--color-text-primary);
  }
`.withComponent('a');

const ActionsContainer = styled(Column)`
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: flex-start;
`;

const ReadmeSection = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  width: 100%;
`;

const ReadmeHeader = styled.div`
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4) var(--space-6);
`;

const ReadmeTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0;
  cursor: pointer;
`.withComponent('a');

const ReadmeContent = styled.div`
  padding: var(--space-6);
`;

const LoadingContainer = styled(Row)`
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-muted);
`;

const ErrorContainer = styled(Column)`
  padding: var(--space-8) var(--space-4);
  text-align: center;
`;

const ErrorTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
`;

const ErrorDescription = styled.p`
  color: var(--color-text-muted);
  margin: 0 0 var(--space-4) 0;
`;

// GitHub API functions
async function fetchGitHubStats(githubUrl: string) {
  try {
    // Extract owner and repo from GitHub URL
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    // Use Octokit to fetch repository data and issues
    const [repoResponse, issuesResponse] = await Promise.all([
      octokit.rest.repos.get({
        owner,
        repo: cleanRepo,
      }),
      octokit.rest.issues.listForRepo({
        owner,
        repo: cleanRepo,
        state: 'open',
        per_page: 1,
      }),
    ]);

    const repoData = repoResponse.data;

    // Get total issue count from headers if available
    let openIssues = 0;
    const linkHeader = issuesResponse.headers.link;
    if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)[^>]*>;\s*rel="last"/);
      openIssues = lastPageMatch ? parseInt(lastPageMatch[1]) : issuesResponse.data.length;
    } else {
      openIssues = issuesResponse.data.length;
    }

    return {
      stars: repoData.stargazers_count || 0,
      openIssues,
      repoUrl: `https://github.com/${owner}/${cleanRepo}`,
      issuesUrl: `https://github.com/${owner}/${cleanRepo}/issues`,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    return {
      stars: 0,
      openIssues: 0,
      repoUrl: githubUrl,
      issuesUrl: `${githubUrl}/issues`,
    };
  }
}

async function fetchReadme(githubUrl: string) {
  try {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    const response = await octokit.rest.repos.getReadme({
      owner,
      repo: cleanRepo,
    });

    if (response.data.content) {
      // Decode base64 content
      return atob(response.data.content);
    }

    throw new Error('No README found');
  } catch (error) {
    console.error('Failed to fetch README:', error);
    return '# README\n\nREADME not available for this repository.';
  }
}

export function RepositoryDetail({ repositoryId }: { repositoryId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query for repository details
  const repositoryQuery = useQuery(repositoryQueryOptions(repositoryId));

  // Query for user repositories to check installation status
  const userRepositoriesQuery = useQuery(userRepositoriesQueryOptions);

  // Fetch GitHub stats
  const githubStatsQuery = useQuery({
    queryKey: ['github-stats', repositoryId],
    queryFn: () => (repositoryQuery.data ? fetchGitHubStats(repositoryQuery.data.githubUrl) : Promise.resolve(null)),
    enabled: !!repositoryQuery.data?.githubUrl,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch README
  const readmeQuery = useQuery({
    queryKey: ['readme', repositoryId],
    queryFn: () => (repositoryQuery.data ? fetchReadme(repositoryQuery.data.githubUrl) : Promise.resolve('')),
    enabled: !!repositoryQuery.data?.githubUrl,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutations for install/uninstall
  const connectRepoMutation = useMutation({
    mutationFn: async () => {
      if (!repositoryQuery.data) throw new Error('Repository not found');

      const versions = await getRepositoryVersions(repositoryQuery.data.id);
      const latestVersion = versions.find(v => v.version === repositoryQuery.data.latestVersion) || versions[0];

      if (!latestVersion) {
        alert('No versions available for this repository');
        return;
      }

      return connectRepository(repositoryQuery.data.id, latestVersion.id, {
        success: 'Repository installed successfully',
        error: 'Failed to install repository',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
    },
  });

  const disconnectRepoMutation = useMutation({
    mutationFn: async () => {
      if (!userRepository) throw new Error('User repository not found');

      return disconnectRepository(userRepository.id, {
        success: 'Repository uninstalled successfully',
        error: 'Failed to uninstall repository',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
    },
  });

  // Derived data
  const repository = repositoryQuery.data;
  const githubStats = githubStatsQuery.data;
  const readme = readmeQuery.data;

  // Find user repository if installed
  const userRepository = useMemo(() => {
    return userRepositoriesQuery.data?.find(ur => ur.repositoryId === repositoryId);
  }, [userRepositoriesQuery.data, repositoryId]);

  const isInstalled = !!userRepository;
  const hasUpdate = useMemo(() => {
    if (!isInstalled || !repository || !userRepository) return false;
    return userRepository.version.version !== repository.latestVersion;
  }, [isInstalled, repository, userRepository]);

  const handleBack = () => {
    router.history.back();
  };

  const handleInstallToggle = () => {
    if (isInstalled) {
      disconnectRepoMutation.mutate();
    } else {
      connectRepoMutation.mutate();
    }
  };

  // Loading state
  if (repositoryQuery.isLoading) {
    return (
      <LoadingContainer>
        <Spinner size='24px' />
        <span style={{ marginLeft: 'var(--space-2)' }}>Loading repository details...</span>
      </LoadingContainer>
    );
  }

  // Error state
  if (repositoryQuery.error || !repository) {
    return (
      <ErrorContainer>
        <AlertCircleIcon size={48} style={{ color: 'var(--color-error-500)', marginBottom: 'var(--space-4)' }} />
        <ErrorTitle>Repository Not Found</ErrorTitle>
        <ErrorDescription>{repositoryQuery.error?.message || 'The requested repository could not be found.'}</ErrorDescription>
        <SecondaryButton onClick={handleBack} startIcon={<ArrowLeftIcon size={16} />} aria-label='Back to explore components'>
          Back to Explore
        </SecondaryButton>
      </ErrorContainer>
    );
  }

  const getInstallButtonProps = () => {
    const isLoading = connectRepoMutation.isPending || disconnectRepoMutation.isPending;

    if (hasUpdate) {
      return {
        children: isLoading ? 'Updating...' : 'Update',
        startIcon: isLoading ? <RefreshCwIcon size={16} /> : <DownloadIcon size={16} />,
        disabled: isLoading,
      };
    }

    if (isInstalled) {
      return {
        children: isLoading ? 'Uninstalling...' : 'Uninstall',
        startIcon: isLoading ? <RefreshCwIcon size={16} /> : <TrashIcon size={16} />,
        disabled: isLoading,
      };
    }

    return {
      children: isLoading ? 'Installing...' : 'Install Repository',
      startIcon: isLoading ? <RefreshCwIcon size={16} /> : <DownloadIcon size={16} />,
      disabled: isLoading,
    };
  };

  return (
    <Container fullWidth alignItems='flex-start'>
      {/* Header with back button */}
      <BackButtonContainer fullWidth justifyContent='flex-start' alignItems='center'>
        <BackButton onClick={handleBack} aria-label='Back to explore'>
          <ArrowLeftIcon size={18} />
        </BackButton>
        <PageTitle>{repository.name}</PageTitle>
      </BackButtonContainer>

      {/* Repository overview */}
      <RepositoryOverview>
        <OverviewContent>
          <RepositoryLayout fullWidth>
            {/* Repository thumbnail/icon */}
            <Column gap='var(--space-4)'>
              <ThumbnailContainer>
                <ThumbnailPlaceholder>
                  <PackageIcon size={48} />
                </ThumbnailPlaceholder>
              </ThumbnailContainer>
              <ActionsContainer fullWidth>
                <SecondaryButton
                  onClick={() => window.open(repository.githubUrl, '_blank', 'noopener,noreferrer')}
                  startIcon={<GithubIcon size={16} />}
                  fullWidth
                  size='sm'
                  aria-label='View repository on GitHub'
                >
                  View on GitHub
                </SecondaryButton>

                <PrimaryButton
                  fullWidth
                  size='sm'
                  onClick={handleInstallToggle}
                  {...getInstallButtonProps()}
                  aria-label={hasUpdate ? 'Update repository' : isInstalled ? 'Uninstall repository' : 'Install repository'}
                />
              </ActionsContainer>
            </Column>

            {/* Repository info */}
            <RepositoryInfo>
              <Description>{repository.description}</Description>

              <MetaGrid>
                <MetaItem>
                  <UserIcon size={16} />
                  <MetaLabel>Author:</MetaLabel>
                  <MetaValue>{repository.author}</MetaValue>
                </MetaItem>

                {githubStats && (
                  <MetaLink href={githubStats.repoUrl} target='_blank' rel='noopener noreferrer'>
                    <StarIcon size={16} />
                    <MetaLabel>Stars:</MetaLabel>
                    <MetaValue>{formatNumber(githubStats.stars)}</MetaValue>
                  </MetaLink>
                )}

                {githubStats && (
                  <MetaLink href={githubStats.issuesUrl} target='_blank' rel='noopener noreferrer'>
                    <AlertCircleIcon size={16} />
                    <MetaLabel>Open Issues:</MetaLabel>
                    <MetaValue>{githubStats.openIssues}</MetaValue>
                  </MetaLink>
                )}

                <MetaItem>
                  <DownloadIcon size={16} />
                  <MetaLabel>Downloads:</MetaLabel>
                  <MetaValue>{formatNumber(repository.totalDownloads)}</MetaValue>
                </MetaItem>

                <MetaItem>
                  <CodeIcon size={16} />
                  <MetaLabel>Components:</MetaLabel>
                  <MetaValue>N/A</MetaValue>
                </MetaItem>

                <MetaItem>
                  <TagIcon size={16} />
                  <MetaLabel>Version:</MetaLabel>
                  <MetaValue>v{repository.latestVersion}</MetaValue>
                </MetaItem>

                <MetaItem>
                  <CalendarIcon size={16} />
                  <MetaLabel>Last Updated:</MetaLabel>
                  <MetaValue>{repository.lastUpdated ? timeAgo(new Date(repository.lastUpdated)) : 'Unknown'}</MetaValue>
                </MetaItem>
              </MetaGrid>
            </RepositoryInfo>
          </RepositoryLayout>
        </OverviewContent>
      </RepositoryOverview>

      {/* README section */}
      <ReadmeSection>
        <ReadmeHeader>
          <ReadmeTitle href={`${repository.githubUrl}#readme`} target='_blank' rel='noopener noreferrer'>
            README.md
          </ReadmeTitle>
        </ReadmeHeader>
        <ReadmeContent>
          {readmeQuery.isLoading ? (
            <LoadingContainer>
              <Spinner size='20px' />
              <span style={{ marginLeft: 'var(--space-2)' }}>Loading README...</span>
            </LoadingContainer>
          ) : (
            <MarkdownRenderer>{readme || '# README\n\nNo README available for this repository.'}</MarkdownRenderer>
          )}
        </ReadmeContent>
      </ReadmeSection>
    </Container>
  );
}
