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
import { addonQueryOptions, userAddonsQueryOptions, connectAddon, disconnectAddon, getAddonVersions } from '@services/addons';
import { formatNumber } from '@helpers/number';
import { timeAgo } from '@hakit/core';
import { Octokit } from '@octokit/rest';
import { MarkdownRenderer } from '@components/Markdown/MarkdownRenderer';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './AddonDetail.module.css';
import { createGitHubUrlTransform } from './transformer';

const getClassName = getClassNameFactory('AddonDetail', styles);

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

    // Use Octokit to fetch addon data and issues
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
    const defaultBranch = repoData.default_branch || 'main';

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
      defaultBranch,
      stars: repoData.stargazers_count || 0,
      openIssues,
      owner,
      repo: cleanRepo,
      repoUrl: `https://github.com/${owner}/${cleanRepo}`,
      issuesUrl: `https://github.com/${owner}/${cleanRepo}/issues`,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    return {
      defaultBranch: 'main',
      stars: 0,
      openIssues: 0,
      repo: '',
      repoUrl: githubUrl,
      owner: '',
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
    return '# README\n\nREADME not available for this addon.';
  }
}

export function AddonDetail({ addonId }: { addonId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query for addon details
  const addonQuery = useQuery(addonQueryOptions(addonId));

  // Query for user addons to check installation status
  const userAddonsQuery = useQuery(userAddonsQueryOptions);

  // Fetch GitHub stats
  const githubStatsQuery = useQuery({
    queryKey: ['github-stats', addonId],
    queryFn: () => (addonQuery.data ? fetchGitHubStats(addonQuery.data.githubUrl) : Promise.resolve(null)),
    enabled: !!addonQuery.data?.githubUrl,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch README
  const readmeQuery = useQuery({
    queryKey: ['readme', addonId],
    queryFn: () => (addonQuery.data ? fetchReadme(addonQuery.data.githubUrl) : Promise.resolve('')),
    enabled: !!addonQuery.data?.githubUrl,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutations for install/uninstall
  const connectAddonMutation = useMutation({
    mutationFn: async () => {
      if (!addonQuery.data) throw new Error('Addon not found');

      const versions = await getAddonVersions(addonQuery.data.id);
      const latestVersion = versions.find(v => v.version === addonQuery.data.latestVersion) || versions[0];

      if (!latestVersion) {
        alert('No versions available for this addon');
        return;
      }

      return connectAddon(addonQuery.data.id, latestVersion.id, {
        success: 'Addon installed successfully',
        error: 'Failed to install addon',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userAddonsQueryOptions.queryKey });
    },
  });

  const disconnectAddonMutation = useMutation({
    mutationFn: async () => {
      if (!userAddon) throw new Error('User addon not found');

      return disconnectAddon(userAddon.id, {
        success: 'Addon uninstalled successfully',
        error: 'Failed to uninstall addon',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userAddonsQueryOptions.queryKey });
    },
  });

  // Derived data
  const addon = addonQuery.data;
  const githubStats = githubStatsQuery.data;
  const readme = readmeQuery.data;

  // Find user addon if installed
  const userAddon = useMemo(() => {
    return userAddonsQuery.data?.find(ur => ur.addonId === addonId);
  }, [userAddonsQuery.data, addonId]);

  const isInstalled = !!userAddon;
  const hasUpdate = useMemo(() => {
    if (!isInstalled || !addon || !userAddon) return false;
    return userAddon.version.version !== addon.latestVersion;
  }, [isInstalled, addon, userAddon]);

  const handleBack = () => {
    router.history.back();
  };

  const handleInstallToggle = () => {
    if (isInstalled) {
      disconnectAddonMutation.mutate();
    } else {
      connectAddonMutation.mutate();
    }
  };

  const urlTransform = useMemo(
    () =>
      githubStats &&
      createGitHubUrlTransform({
        owner: githubStats.owner,
        repo: githubStats.repo,
        ref: githubStats.defaultBranch, // prefer a SHA for stable links
      }),
    [githubStats]
  );

  // Loading state
  if (addonQuery.isLoading) {
    return (
      <Row className={getClassName('loadingContainer')}>
        <Spinner />
        <span style={{ marginLeft: 'var(--space-2)' }}>Loading addon details...</span>
      </Row>
    );
  }

  // Error state
  if (addonQuery.error || !addon) {
    return (
      <Column className={getClassName('errorContainer')}>
        <AlertCircleIcon size={48} style={{ color: 'var(--clr-error-a0)', marginBottom: 'var(--space-4)' }} />
        <h2 className={getClassName('errorTitle')}>Addon Not Found</h2>
        <p className={getClassName('errorDescription')}>{addonQuery.error?.message || 'The requested addon could not be found.'}</p>
        <SecondaryButton onClick={handleBack} startIcon={<ArrowLeftIcon size={16} />} aria-label='Back to explore components'>
          Back to Explore
        </SecondaryButton>
      </Column>
    );
  }

  const getInstallButtonProps = () => {
    const isLoading = connectAddonMutation.isPending || disconnectAddonMutation.isPending;

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
      children: isLoading ? 'Installing...' : 'Install Addon',
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
        <h1 className={getClassName('pageTitle')}>{addon.name}</h1>
      </Row>

      {/* Addon overview */}
      <div className={getClassName('addonOverview')}>
        <div className={getClassName('overviewContent')}>
          <Row className={getClassName('addonLayout')} fullWidth>
            {/* Addon thumbnail/icon */}
            <Column gap='var(--space-4)'>
              <Row className={getClassName('thumbnailContainer')}>
                <Row className={getClassName('thumbnailPlaceholder')}>
                  <PackageIcon size={48} />
                </Row>
              </Row>
              <Column className={getClassName('actionsContainer')} fullWidth>
                <SecondaryButton
                  onClick={() => window.open(addon.githubUrl, '_blank', 'noopener,noreferrer')}
                  startIcon={<GithubIcon size={16} />}
                  fullWidth
                  size='sm'
                  aria-label='View addon on GitHub'
                >
                  View on GitHub
                </SecondaryButton>

                <PrimaryButton
                  fullWidth
                  size='sm'
                  onClick={handleInstallToggle}
                  {...getInstallButtonProps()}
                  aria-label={hasUpdate ? 'Update addon' : isInstalled ? 'Uninstall addon' : 'Install addon'}
                />
              </Column>
            </Column>

            {/* Addon info */}
            <div className={getClassName('addonInfo')}>
              <p className={getClassName('description')}>{addon.description}</p>

              <div className={getClassName('metaGrid')}>
                <Row className={getClassName('metaItem')}>
                  <UserIcon size={16} />
                  <span className={getClassName('metaLabel')}>Author:</span>
                  <span className={getClassName('metaValue')}>{addon.author}</span>
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
                  <span className={getClassName('metaValue')}>{formatNumber(addon.totalDownloads)}</span>
                </Row>

                <Row className={getClassName('metaItem')}>
                  <CodeIcon size={16} />
                  <span className={getClassName('metaLabel')}>Components:</span>
                  <span className={getClassName('metaValue')}>N/A</span>
                </Row>

                <Row className={getClassName('metaItem')}>
                  <TagIcon size={16} />
                  <span className={getClassName('metaLabel')}>Version:</span>
                  <span className={getClassName('metaValue')}>v{addon.latestVersion}</span>
                </Row>

                <Row className={getClassName('metaItem')}>
                  <CalendarIcon size={16} />
                  <span className={getClassName('metaLabel')}>Last Updated:</span>
                  <span className={getClassName('metaValue')}>{addon.lastUpdated ? timeAgo(new Date(addon.lastUpdated)) : 'Unknown'}</span>
                </Row>
              </div>
            </div>
          </Row>
        </div>
      </div>

      {/* README section */}
      <div className={getClassName('readmeSection')}>
        <div className={getClassName('readmeHeader')}>
          <a className={getClassName('readmeTitle')} href={`${addon.githubUrl}#readme`} target='_blank' rel='noopener noreferrer'>
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
            <MarkdownRenderer
              options={{
                urlTransform,
              }}
            >
              {readme || '# README\n\nNo README available for this addon.'}
            </MarkdownRenderer>
          )}
        </div>
      </div>
    </Column>
  );
}
