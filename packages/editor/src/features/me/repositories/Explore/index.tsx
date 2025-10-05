import { useState, useMemo } from 'react';
import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';
import { PlusIcon, SearchIcon, PackageIcon, EyeIcon } from 'lucide-react';
import { InputField } from '@components/Form/Field/Input';
import { Column, Row } from '@components/Layout';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { searchRepositoriesQueryOptions, popularRepositoriesQueryOptions } from '@services/repositories';
import { RepositoryWithLatestVersion } from '@typings/hono';
import { RepositoryListItem } from '@features/me/repositories/RepositoriesManager/RepositoryListItem';
import { RepositoryInstallButton } from '@features/me/repositories/RepositoriesManager/RepositoryInstallButton';
import { EmptyState } from '@components/EmptyState';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './Explore.module.css';

const getClassName = getClassNameFactory('Explore', styles);

export function Explore() {
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
    navigate({ to: '/me/repositories/install' });
  };

  return (
    <div className={getClassName()}>
      <div className={getClassName('pageHeader')}>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <div className={getClassName('headerContent')}>
            <h1 className={getClassName('pageTitle')}>
              {isSearching ? `Search Results (${repositories.length})` : 'Explore Repositories'}
            </h1>
            <p className={getClassName('pageSubtitle')}>Discover and install repositories for your dashboards</p>
          </div>
          <PrimaryButton aria-label='Add custom repository' startIcon={<PlusIcon size={16} />} onClick={handleOnInstall}>
            Install Addon
          </PrimaryButton>
        </Row>
      </div>

      <div className={getClassName('searchAndFilter')}>
        <InputField
          size='medium'
          type='text'
          id='search-components'
          name='search-components'
          label=''
          helperText='Search for public repositories & components'
          placeholder='Enter a search term...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          startAdornment={<SearchIcon size={18} />}
        />
      </div>

      <Column className={getClassName('repositoryList')} fullWidth>
        {isLoading ? (
          <div className={getClassName('loadingState')}>{isSearching ? 'Searching now...' : 'Loading popular components...'}...</div>
        ) : error ? (
          <div className={getClassName('errorState')}>Failed to load repositories: {error.message}</div>
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
          repositories.map((repo: RepositoryWithLatestVersion) => (
            <RepositoryListItem
              key={repo.version.id}
              repository={repo}
              onClick={() => navigate({ to: '/me/repositories/explore/$repository', params: { repository: repo.repository.id } })}
              actions={
                <Row gap='var(--space-2)'>
                  <SecondaryButton
                    size='sm'
                    startIcon={<EyeIcon size={14} />}
                    onClick={e => {
                      e.stopPropagation();
                      navigate({ to: '/me/repositories/explore/$repository', params: { repository: repo.repository.id } });
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
      </Column>
    </div>
  );
}
