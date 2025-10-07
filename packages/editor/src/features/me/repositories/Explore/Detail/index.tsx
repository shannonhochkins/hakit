import { useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { PrimaryButton, SecondaryButton } from '@components/Button';
import { Spinner } from '@components/Loaders/Spinner';
import { Row, Column } from '@components/Layout';
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
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './RepositoryDetail.module.css';

const getClassName = getClassNameFactory('RepositoryDetail', styles);

// Create Octokit instance (no auth needed for public repos)
const octokit = new Octokit();

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
      <Row className={getClassName('loadingContainer')}>
        <Spinner />
        <span style={{ marginLeft: 'var(--space-2)' }}>Loading repository details...</span>
      </Row>
    );
  }

  // Error state
  if (repositoryQuery.error || !repository) {
    return (
      <Column className={getClassName('errorContainer')}>
        <AlertCircleIcon size={48} style={{ color: 'var(--color-error-500)', marginBottom: 'var(--space-4)' }} />
        <h2 className={getClassName('errorTitle')}>Repository Not Found</h2>
        <p className={getClassName('errorDescription')}>
          {repositoryQuery.error?.message || 'The requested repository could not be found.'}
        </p>
        <SecondaryButton onClick={handleBack} startIcon={<ArrowLeftIcon size={16} />} aria-label='Back to explore components'>
          Back to Explore
        </SecondaryButton>
      </Column>
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
    <Column className={getClassName()} fullWidth alignItems='flex-start'>
      {/* Header with back button */}
      <Row className={getClassName('backButtonContainer')} fullWidth justifyContent='flex-start' alignItems='center'>
        <button className={getClassName('backButton')} onClick={handleBack} aria-label='Back to explore'>
          <ArrowLeftIcon size={18} />
        </button>
        <h1 className={getClassName('pageTitle')}>{repository.name}</h1>
      </Row>

      {/* Repository overview */}
      <div className={getClassName('repositoryOverview')}>
        <div className={getClassName('overviewContent')}>
          <Row className={getClassName('repositoryLayout')} fullWidth>
            {/* Repository thumbnail/icon */}
            <Column gap='var(--space-4)'>
              <Row className={getClassName('thumbnailContainer')}>
                <Row className={getClassName('thumbnailPlaceholder')}>
                  <PackageIcon size={48} />
                </Row>
              </Row>
              <Column className={getClassName('actionsContainer')} fullWidth>
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
              </Column>
            </Column>

            {/* Repository info */}
            <div className={getClassName('repositoryInfo')}>
              <p className={getClassName('description')}>{repository.description}</p>

              <div className={getClassName('metaGrid')}>
                <Row className={getClassName('metaItem')}>
                  <UserIcon size={16} />
                  <span className={getClassName('metaLabel')}>Author:</span>
                  <span className={getClassName('metaValue')}>{repository.author}</span>
                </Row>

                {githubStats && (
                  <a className={getClassName('metaLink')} href={githubStats.repoUrl} target='_blank' rel='noopener noreferrer'>
                    <StarIcon size={16} />
                    <span className={getClassName('metaLabel')}>Stars:</span>
                    <span className={getClassName('metaValue')}>{formatNumber(githubStats.stars)}</span>
                  </a>
                )}

                {githubStats && (
                  <a className={getClassName('metaLink')} href={githubStats.issuesUrl} target='_blank' rel='noopener noreferrer'>
                    <AlertCircleIcon size={16} />
                    <span className={getClassName('metaLabel')}>Open Issues:</span>
                    <span className={getClassName('metaValue')}>{githubStats.openIssues}</span>
                  </a>
                )}

                <Row className={getClassName('metaItem')}>
                  <DownloadIcon size={16} />
                  <span className={getClassName('metaLabel')}>Downloads:</span>
                  <span className={getClassName('metaValue')}>{formatNumber(repository.totalDownloads)}</span>
                </Row>

                <Row className={getClassName('metaItem')}>
                  <CodeIcon size={16} />
                  <span className={getClassName('metaLabel')}>Components:</span>
                  <span className={getClassName('metaValue')}>N/A</span>
                </Row>

                <Row className={getClassName('metaItem')}>
                  <TagIcon size={16} />
                  <span className={getClassName('metaLabel')}>Version:</span>
                  <span className={getClassName('metaValue')}>v{repository.latestVersion}</span>
                </Row>

                <Row className={getClassName('metaItem')}>
                  <CalendarIcon size={16} />
                  <span className={getClassName('metaLabel')}>Last Updated:</span>
                  <span className={getClassName('metaValue')}>
                    {repository.lastUpdated ? timeAgo(new Date(repository.lastUpdated)) : 'Unknown'}
                  </span>
                </Row>
              </div>
            </div>
          </Row>
        </div>
      </div>

      {/* README section */}
      <div className={getClassName('readmeSection')}>
        <div className={getClassName('readmeHeader')}>
          <a className={getClassName('readmeTitle')} href={`${repository.githubUrl}#readme`} target='_blank' rel='noopener noreferrer'>
            README.md
          </a>
        </div>
        <div className={getClassName('readmeContent')}>
          {readmeQuery.isLoading ? (
            <Row className={getClassName('loadingContainer')}>
              <Spinner />
              <span style={{ marginLeft: 'var(--space-2)' }}>Loading README...</span>
            </Row>
          ) : (
            <MarkdownRenderer>{readme || '# README\n\nNo README available for this repository.'}</MarkdownRenderer>
          )}
        </div>
      </div>
    </Column>
  );
}
