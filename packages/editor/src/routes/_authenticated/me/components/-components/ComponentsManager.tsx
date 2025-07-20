import { useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { PrimaryButton } from '@lib/components/Button/Primary';
import { DownloadCloudIcon, SearchIcon, PackageIcon } from 'lucide-react';
import { RepositoryComponentList } from './RepositoryComponentList';
import { Row } from '@hakit/components';
import { InputField } from '@lib/components/Form/Fields/Input';
import { InputAdornment } from '@mui/material';
import { EmptyState } from '../../-components/EmptyState';
import { Confirm } from '@lib/components/Modal/confirm';
import { useQuery } from '@tanstack/react-query';
import { userRepositoriesQueryOptions, disconnectRepository } from '@lib/api/components';
// import { CustomRepoModal } from './CustomRepoModal';

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

export function ComponentsManager() {
  const navigate = useNavigate();
  // const [showCustomRepoModal, setShowCustomRepoModal] = useState(false);

  const userRepositoriesQuery = useQuery(userRepositoriesQueryOptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRepos, setExpandedRepos] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingUserRepositoryId, setDeletingUserRepositoryId] = useState<string | null>(null);

  const userRepositories = useMemo(() => userRepositoriesQuery.data ?? [], [userRepositoriesQuery.data]);

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

  const toggleRepo = (repoId: string) => {
    setExpandedRepos(prev => (prev.includes(repoId) ? prev.filter(id => id !== repoId) : [...prev, repoId]));
  };

  const confirmDelete = async () => {
    if (deletingUserRepositoryId) {
      try {
        await disconnectRepository(deletingUserRepositoryId);
        // Refresh the query to update the UI
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
            const isExpanded = expandedRepos.includes(repo.id);

            return (
              <RepositoryComponentList
                key={repo.id}
                repositoryWithDetails={repo}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleRepo(repo.id)}
              />
            );
          })
        )}
      </RepositoriesContainer>

      <Confirm open={deleteConfirmOpen} title='Remove Repository' onConfirm={confirmDelete} onCancel={cancelDelete}>
        <p>
          Are you sure you want to remove <strong>&ldquo;{deletingRepository?.name}&rdquo;</strong>? This action cannot be undone and will
          remove all associated components.
        </p>
      </Confirm>
    </Container>
  );
}

// export function ComponentsManager() {
//   const navigate = useNavigate();
//   const [showCustomRepoModal, setShowCustomRepoModal] = useState(false);

//   return (
//     <>
//       <InstalledComponentsDashboard
//         onExploreComponents={() => navigate({ to: '/me/components/explore' })}
//       />

//       <CustomRepoModal
//         isOpen={showCustomRepoModal}
//         onClose={() => {
//           setShowCustomRepoModal(false);
//         }}
//       />
//     </>
//   );
// }
