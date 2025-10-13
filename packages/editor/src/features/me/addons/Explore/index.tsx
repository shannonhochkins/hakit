import { useState, useMemo } from 'react';
import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';
import { PlusIcon, SearchIcon, PackageIcon, EyeIcon } from 'lucide-react';
import { InputField } from '@components/Form/Field/Input';
import { Column, Row } from '@components/Layout';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { searchAddonsQueryOptions, popularAddonsQueryOptions } from '@services/addons';
import { AddonWithLatestVersion } from '@typings/hono';
import { AddonListItem } from '@features/me/addons/AddonsManager/AddonListItem';
import { AddonInstallButton } from '@features/me/addons/AddonsManager/AddonInstallButton';
import { EmptyState } from '@components/EmptyState';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './Explore.module.css';

const getClassName = getClassNameFactory('Explore', styles);

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Determine if we're searching based on trimmed query
  const isSearching = useMemo(() => searchQuery.trim().length > 0, [searchQuery]);

  // Query for popular addons (used when not searching)
  const popularAddonsQuery = useQuery(popularAddonsQueryOptions(20));

  // Query for search results (only enabled when actively searching)
  const searchAddonsQuery = useQuery(searchAddonsQueryOptions(searchQuery, { limit: 20 }));

  // Use search results when searching, otherwise use popular addons
  const addons = isSearching ? searchAddonsQuery.data || [] : popularAddonsQuery.data || [];

  const isLoading = isSearching ? searchAddonsQuery.isLoading : popularAddonsQuery.isLoading;

  const error = isSearching ? searchAddonsQuery.error : popularAddonsQuery.error;

  const handleOnInstall = () => {
    // Navigate to custom addon installation flow
    navigate({ to: '/me/addons/install' });
  };

  return (
    <div className={getClassName()}>
      <div className={getClassName('pageHeader')}>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <div className={getClassName('headerContent')}>
            <h1 className={getClassName('pageTitle')}>{isSearching ? `Search Results (${addons.length})` : 'Explore Addons'}</h1>
            <p className={getClassName('pageSubtitle')}>Discover and install addons for your dashboards</p>
          </div>
          <PrimaryButton aria-label='Add custom addon' startIcon={<PlusIcon size={16} />} onClick={handleOnInstall}>
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
          helperText='Search for public addons & components'
          placeholder='Enter a search term...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          startAdornment={<SearchIcon size={18} />}
        />
      </div>

      <Column className={getClassName('addonList')} fullWidth>
        {isLoading ? (
          <div className={getClassName('loadingState')}>{isSearching ? 'Searching now...' : 'Loading popular components...'}...</div>
        ) : error ? (
          <div className={getClassName('errorState')}>Failed to load addons: {error.message}</div>
        ) : addons.length === 0 ? (
          isSearching ? (
            <EmptyState
              icon={<PackageIcon size={48} />}
              title={`No addons found matching "${searchQuery}"`}
              description='Try different search terms or add a custom addon'
            />
          ) : (
            <EmptyState
              icon={<PackageIcon size={48} />}
              title={`No addons found`}
              description='Install an addon from github'
              actions={
                <PrimaryButton startIcon={<PlusIcon size={16} />} onClick={handleOnInstall} aria-label='Install Addon'>
                  Install Addon
                </PrimaryButton>
              }
            />
          )
        ) : (
          addons.map((addon: AddonWithLatestVersion) => (
            <AddonListItem
              key={addon.version.id}
              addon={addon}
              onClick={() => navigate({ to: '/me/addons/explore/$addon', params: { addon: addon.addon.id } })}
              actions={
                <Row gap='var(--space-2)'>
                  <SecondaryButton
                    size='sm'
                    startIcon={<EyeIcon size={14} />}
                    onClick={e => {
                      e.stopPropagation();
                      navigate({ to: '/me/addons/explore/$addon', params: { addon: addon.addon.id } });
                    }}
                    aria-label={`View details for ${addon.addon?.name}`}
                  >
                    View Details
                  </SecondaryButton>
                  <AddonInstallButton addon={addon} />
                </Row>
              }
            />
          ))
        )}
      </Column>
    </div>
  );
}
