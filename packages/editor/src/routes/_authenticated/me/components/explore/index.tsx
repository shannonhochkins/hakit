import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { PrimaryButton } from '@lib/components/Button/Primary';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { PlusIcon, SearchIcon, PackageIcon, EyeIcon } from 'lucide-react';
import { InputField } from '@lib/components/Form/Fields/Input';
import { InputAdornment } from '@mui/material';
import { Column, Row } from '@hakit/components';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { searchRepositoriesQueryOptions, popularRepositoriesQueryOptions } from '@lib/api/components';
import { RepositoryWithLatestVersionAPI } from '@typings/db';
import { RepositoryListItem } from '../-components/RepositoryListItem';
import { RepositoryInstallButton } from '../-components/RepositoryInstallButton';
import { EmptyState } from '../../-components/EmptyState';

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

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Determine if we're searching based on trimmed query
  const isSearching = useMemo(() => searchQuery.trim().length > 0, [searchQuery]);

  // Query for popular repositories (used when not searching)
  const popularRepositoriesQuery = useQuery(popularRepositoriesQueryOptions(20));

  // Query for search results (only enabled when actively searching)
  const searchRepositoriesQuery = useQuery(searchRepositoriesQueryOptions(searchQuery, { limit: 20 }));

  // Use search results when searching, otherwise use popular repositories
  const repositories = isSearching ? searchRepositoriesQuery.data || [] : popularRepositoriesQuery.data || [];

  const isLoading = isSearching ? searchRepositoriesQuery.isLoading : popularRepositoriesQuery.isLoading;

  const error = isSearching ? searchRepositoriesQuery.error : popularRepositoriesQuery.error;

  const handleOnInstall = () => {
    // Navigate to custom repository installation flow
    navigate({ to: '/me/components/install' });
  };

  return (
    <Container>
      <PageHeader>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <HeaderContent>
            <PageTitle>{isSearching ? `Search Results (${repositories.length})` : 'Explore Components'}</PageTitle>
            <PageSubtitle>Discover and install components for your dashboards</PageSubtitle>
          </HeaderContent>
          <PrimaryButton aria-label='Add custom repository' startIcon={<PlusIcon size={16} />} onClick={handleOnInstall}>
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
          isSearching ? (
            <EmptyState
              icon={<PackageIcon size={48} />}
              title={`No repositories found matching "${searchQuery}"`}
              description='Try different search terms or add a custom repository'
            />
          ) : (
            <EmptyState
              icon={<PackageIcon size={48} />}
              title={`No repositories found`}
              description='Install an addon from github'
              actions={
                <PrimaryButton startIcon={<PlusIcon size={16} />} onClick={handleOnInstall} aria-label='Install Addon'>
                  Install Addon
                </PrimaryButton>
              }
            />
          )
        ) : (
          repositories.map((repo: RepositoryWithLatestVersionAPI) => (
            <RepositoryListItem
              key={repo.version.id}
              repository={repo}
              onClick={() => navigate({ to: '/me/components/explore/$repository', params: { repository: repo.repository.id } })}
              actions={
                <Row gap='var(--space-2)'>
                  <SecondaryButton
                    size='sm'
                    startIcon={<EyeIcon size={14} />}
                    onClick={e => {
                      e.stopPropagation();
                      navigate({ to: '/me/components/explore/$repository', params: { repository: repo.repository.id } });
                    }}
                    aria-label={`View details for ${repo.repository?.name}`}
                  >
                    View Details
                  </SecondaryButton>
                  <RepositoryInstallButton repository={repo} />
                </Row>
              }
            />
          ))
        )}
      </RepositoryList>
    </Container>
  );
}
