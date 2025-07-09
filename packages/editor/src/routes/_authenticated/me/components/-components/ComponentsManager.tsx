import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { PrimaryButton } from '@lib/components/Button/Primary';
import { DownloadCloudIcon, SearchIcon, PackageIcon } from 'lucide-react';
import { RepositoryCard } from './RepositoryCard';
import { ExploreModal } from './ExploreModal';
import { CustomRepoModal } from './CustomRepoModal';
import { Row } from '@hakit/components';
import { InputField } from '@lib/components/Form/Fields/Input';
import { InputAdornment } from '@mui/material';
import { EmptyState } from '../../-components/EmptyState';
import { Confirm } from '@lib/components/Modal/confirm';

// Types
export interface Repository {
  id: string;
  name: string;
  url: string;
  thumbnail: string | null;
  version: string;
  hasUpdate: boolean;
  description: string;
  installCount: number;
  lastUpdated: string;
}

export interface Component {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  repoId: string;
}

export interface AvailableRepository {
  id: string;
  name: string;
  url: string;
  thumbnail: string | null;
  description: string;
  author: string;
  stars: number;
  downloads: number;
  lastUpdated: string;
  componentCount: number;
  version: string;
}

export interface InstallationStatus {
  status: 'idle' | 'downloading' | 'validating' | 'installing' | 'complete';
  message: string;
  progress: number;
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

  @media (min-width: var(--breakpoint-md)) {
    flex-direction: row;
    align-items: center;
  }
`;

const RepositoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
`;

// Mock data
const mockRepositories: Repository[] = [
  {
    id: 'repo-1',
    name: 'HACS Default',
    url: 'https://github.com/hacs/default',
    thumbnail: null,
    version: '1.32.1',
    hasUpdate: true,
    description: 'Default HACS repository with core integrations',
    installCount: 45,
    lastUpdated: '2024-12-15',
  },
  {
    id: 'repo-2',
    name: 'Mushroom Cards',
    url: 'https://github.com/piitaya/lovelace-mushroom',
    thumbnail: null,
    version: '3.2.4',
    hasUpdate: false,
    description: 'Beautiful card collection for Lovelace',
    installCount: 12,
    lastUpdated: '2024-12-10',
  },
];

const mockComponents: Component[] = [
  { id: 'comp-1', name: 'Mushroom Person Card', version: '3.2.4', enabled: true, repoId: 'repo-2' },
  { id: 'comp-2', name: 'Mushroom Entity Card', version: '3.2.4', enabled: true, repoId: 'repo-2' },
  { id: 'comp-3', name: 'Mushroom Climate Card', version: '3.2.4', enabled: false, repoId: 'repo-2' },
  { id: 'comp-4', name: 'HACS Integration', version: '1.32.1', enabled: true, repoId: 'repo-1' },
  { id: 'comp-5', name: 'Frontend Manager', version: '1.32.1', enabled: true, repoId: 'repo-1' },
];

const mockAvailableRepositories: AvailableRepository[] = [
  {
    id: 'available-1',
    name: 'Mini Graph Card',
    url: 'https://github.com/kalkih/mini-graph-card',
    thumbnail: null,
    description: 'Minimalistic graph card for Home Assistant Lovelace UI',
    author: 'kalkih',
    stars: 2800,
    downloads: 150000,
    lastUpdated: '2024-12-01',
    componentCount: 1,
    version: '0.11.0',
  },
  {
    id: 'available-2',
    name: 'Button Card',
    url: 'https://github.com/custom-cards/button-card',
    thumbnail: null,
    description: 'Customizable button card with extensive styling options',
    author: 'RomRider',
    stars: 1900,
    downloads: 120000,
    lastUpdated: '2024-11-28',
    componentCount: 1,
    version: '4.1.1',
  },
];

export function ComponentsManager() {
  const [repositories, setRepositories] = useState<Repository[]>(mockRepositories);
  const [components, setComponents] = useState<Component[]>(mockComponents);
  const [availableRepositories] = useState<AvailableRepository[]>(mockAvailableRepositories);
  const [searchQuery, setSearchQuery] = useState('');
  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [expandedRepos, setExpandedRepos] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingRepositoryId, setDeletingRepositoryId] = useState<string | null>(null);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [showCustomRepoModal, setShowCustomRepoModal] = useState(false);
  const [customRepoUrl, setCustomRepoUrl] = useState('');
  const [installationStatus, setInstallationStatus] = useState<InstallationStatus>({
    status: 'idle',
    message: '',
    progress: 0,
  });

  // Filter components and repositories based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        repositories,
        hasMatches: true,
        matchedComponents: components,
      };
    }

    const query = searchQuery.toLowerCase();
    const matchedRepositories: Repository[] = [];
    const matchedComponents: Component[] = [];

    // First find all components that match the search
    const allMatchedComponents = components.filter(component => component.name.toLowerCase().includes(query));

    // Then find repositories that either match by name/description or have matching components
    for (const repo of repositories) {
      const repoNameMatch = repo.name.toLowerCase().includes(query) || repo.description.toLowerCase().includes(query);
      const repoComponents = allMatchedComponents.filter(c => c.repoId === repo.id);

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
  }, [repositories, components, searchQuery]);

  const { repositories: filteredRepositories, hasMatches, matchedComponents: filteredComponents } = filteredData;

  // Filter available repositories based on search
  const filteredAvailableRepos = useMemo(() => {
    if (!exploreSearchQuery.trim()) return availableRepositories;
    const query = exploreSearchQuery.toLowerCase();
    return availableRepositories.filter(
      repo =>
        repo.name.toLowerCase().includes(query) ||
        repo.description.toLowerCase().includes(query) ||
        repo.author.toLowerCase().includes(query)
    );
  }, [availableRepositories, exploreSearchQuery]);

  const toggleRepo = (repoId: string) => {
    setExpandedRepos(prev => (prev.includes(repoId) ? prev.filter(id => id !== repoId) : [...prev, repoId]));
  };

  const toggleComponent = (componentId: string) => {
    setComponents(prev => prev.map(comp => (comp.id === componentId ? { ...comp, enabled: !comp.enabled } : comp)));
  };

  const removeRepository = (repoId: string) => {
    setDeletingRepositoryId(repoId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingRepositoryId) {
      setRepositories(prev => prev.filter(repo => repo.id !== deletingRepositoryId));
      setComponents(prev => prev.filter(comp => comp.repoId !== deletingRepositoryId));
      setDeleteConfirmOpen(false);
      setDeletingRepositoryId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingRepositoryId(null);
  };

  const updateRepository = (repoId: string) => {
    setRepositories(prev =>
      prev.map(repo => (repo.id === repoId ? { ...repo, hasUpdate: false, version: incrementVersion(repo.version) } : repo))
    );
  };

  const checkForUpdates = (repoId: string) => {
    // TODO: Implement actual update checking logic
    console.log('Checking for updates for repository:', repoId);
  };

  const incrementVersion = (version: string): string => {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0', 10) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  };

  const installRepository = (repoUrl: string) => {
    const newRepo: Repository = {
      id: `repo-${Date.now()}`,
      name: `Repository ${repositories.length + 1}`,
      url: repoUrl,
      thumbnail: null,
      version: '1.0.0',
      hasUpdate: false,
      description: 'Newly installed repository',
      installCount: 1,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setRepositories(prev => [...prev, newRepo]);
  };

  const startCustomRepoInstallation = () => {
    if (!customRepoUrl.trim()) return;

    setInstallationStatus({
      status: 'downloading',
      message: 'Downloading repository metadata...',
      progress: 10,
    });

    setTimeout(() => {
      setInstallationStatus({
        status: 'validating',
        message: 'Validating repository structure...',
        progress: 40,
      });

      setTimeout(() => {
        setInstallationStatus({
          status: 'installing',
          message: 'Installing components...',
          progress: 70,
        });

        setTimeout(() => {
          setInstallationStatus({
            status: 'complete',
            message: 'Installation complete!',
            progress: 100,
          });

          installRepository(customRepoUrl);

          setTimeout(() => {
            setInstallationStatus({
              status: 'idle',
              message: '',
              progress: 0,
            });
            setCustomRepoUrl('');
            setShowCustomRepoModal(false);
          }, 1500);
        }, 2000);
      }, 1500);
    }, 1500);
  };

  return (
    <Container>
      <PageHeader>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <HeaderContent>
            <PageTitle>Components</PageTitle>
            <PageSubtitle>Manage your dashboard components</PageSubtitle>
          </HeaderContent>
          <PrimaryButton aria-label='' onClick={() => setShowExploreModal(true)} startIcon={<DownloadCloudIcon size={16} />}>
            Explore Components
          </PrimaryButton>
        </Row>
      </PageHeader>

      <SearchAndFilter>
        <InputField
          style={{
            width: '100%',
            paddingTop: '0',
          }}
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
        {repositories.length === 0 ? (
          <EmptyState
            icon={<PackageIcon size={48} />}
            title='No repositories installed'
            description='Install component repositories to add functionality to your dashboards'
            actions={
              <PrimaryButton
                startIcon={<DownloadCloudIcon size={16} />}
                onClick={() => setShowExploreModal(true)}
                aria-label='Explore components'
              >
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
            const repoComponents = filteredComponents.filter(c => c.repoId === repo.id);
            const isExpanded = expandedRepos.includes(repo.id);

            return (
              <RepositoryCard
                key={repo.id}
                repository={repo}
                components={repoComponents}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleRepo(repo.id)}
                onToggleComponent={toggleComponent}
                onUpdate={() => updateRepository(repo.id)}
                onRemove={() => removeRepository(repo.id)}
                onCheckUpdates={() => checkForUpdates(repo.id)}
                incrementVersion={incrementVersion}
              />
            );
          })
        )}
      </RepositoriesContainer>

      <ExploreModal
        isOpen={showExploreModal}
        onClose={() => setShowExploreModal(false)}
        repositories={filteredAvailableRepos}
        installedRepositories={repositories}
        searchQuery={exploreSearchQuery}
        onSearchChange={setExploreSearchQuery}
        onInstall={installRepository}
        onShowCustomRepo={() => {
          setShowExploreModal(false);
          setShowCustomRepoModal(true);
        }}
      />

      <CustomRepoModal
        isOpen={showCustomRepoModal}
        onClose={() => {
          if (installationStatus.status === 'idle') {
            setShowCustomRepoModal(false);
            setShowExploreModal(true);
          }
        }}
        url={customRepoUrl}
        onUrlChange={setCustomRepoUrl}
        onInstall={startCustomRepoInstallation}
        installationStatus={installationStatus}
      />

      <Confirm open={deleteConfirmOpen} title='Remove Repository' onConfirm={confirmDelete} onCancel={cancelDelete}>
        <p>
          Are you sure you want to remove <strong>&ldquo;{repositories.find(r => r.id === deletingRepositoryId)?.name}&rdquo;</strong>? This
          action cannot be undone and will remove all associated components.
        </p>
      </Confirm>
    </Container>
  );
}
