import styled from '@emotion/styled';
import { SearchIcon, PlusIcon, AlertCircleIcon, PackageIcon, StarIcon, DownloadIcon, CalendarIcon } from 'lucide-react';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { PrimaryButton } from '@lib/components/Button/Primary';
import { Modal } from '@lib/components/Modal';
import { AvailableRepository, Repository } from './ComponentsManager';
import { InputField } from '@lib/components/Form/Fields/Input';
import { InputAdornment } from '@mui/material';

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: AvailableRepository[];
  installedRepositories: Repository[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInstall: (url: string) => void;
  onShowCustomRepo: () => void;
}

const SearchAndActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  margin-bottom: var(--space-4);

  @media (min-width: var(--breakpoint-md)) {
    flex-direction: row;
    align-items: center;
  }
`;

const RepositoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-height: 60vh;
  overflow-y: auto;
`;

const RepositoryItem = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  @media (min-width: var(--breakpoint-md)) {
    flex-direction: row;
  }
`;

const RepositoryThumbnail = styled.div`
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface-elevated);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
`;

const RepositoryContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const RepositoryHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
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
  margin: 0;
  line-height: var(--line-height-relaxed);
`;

const RepositoryStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
`;

const EmptyStateTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
`;

const EmptyStateDescription = styled.p`
  color: var(--color-text-muted);
  margin: 0;
`;

const InstalledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  background: var(--color-success-500);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
`;

export function ExploreModal({
  isOpen,
  onClose,
  repositories,
  installedRepositories,
  searchQuery,
  onSearchChange,
  onInstall,
  onShowCustomRepo,
}: ExploreModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose} title='Explore Components'>
      <SearchAndActions>
        <InputField
          style={{
            width: '100%',
            paddingTop: '0',
          }}
          type='text'
          placeholder='Search repositories...'
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
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
        <SecondaryButton startIcon={<PlusIcon size={16} />} onClick={onShowCustomRepo} aria-label='Add custom repository'>
          Add Custom Repository
        </SecondaryButton>
      </SearchAndActions>

      {repositories.length > 0 ? (
        <RepositoryList>
          {repositories.map(repo => {
            const isInstalled = installedRepositories.some(r => r.url === repo.url);

            return (
              <RepositoryItem key={repo.id}>
                <RepositoryThumbnail>
                  {repo.thumbnail ? (
                    <ThumbnailImage src={repo.thumbnail} alt={repo.name} />
                  ) : (
                    <ThumbnailPlaceholder>
                      <PackageIcon size={24} />
                    </ThumbnailPlaceholder>
                  )}
                </RepositoryThumbnail>

                <RepositoryContent>
                  <RepositoryHeader>
                    <RepositoryInfo>
                      <RepositoryName>{repo.name}</RepositoryName>
                      <RepositoryAuthor>by {repo.author}</RepositoryAuthor>
                    </RepositoryInfo>
                    {isInstalled ? (
                      <InstalledBadge>Installed</InstalledBadge>
                    ) : (
                      <PrimaryButton onClick={() => onInstall(repo.url)} aria-label={`Install ${repo.name}`}>
                        Install
                      </PrimaryButton>
                    )}
                  </RepositoryHeader>

                  <RepositoryDescription>{repo.description}</RepositoryDescription>

                  <RepositoryStats>
                    <StatItem>
                      <StarIcon size={16} />
                      <span>{repo.stars.toLocaleString()}</span>
                    </StatItem>
                    <StatItem>
                      <DownloadIcon size={16} />
                      <span>{repo.downloads.toLocaleString()}</span>
                    </StatItem>
                    <StatItem>
                      <PackageIcon size={16} />
                      <span>
                        {repo.componentCount} component{repo.componentCount !== 1 ? 's' : ''}
                      </span>
                    </StatItem>
                    <StatItem>
                      <CalendarIcon size={16} />
                      <span>Updated {repo.lastUpdated}</span>
                    </StatItem>
                  </RepositoryStats>
                </RepositoryContent>
              </RepositoryItem>
            );
          })}
        </RepositoryList>
      ) : (
        <EmptyStateContainer>
          <EmptyStateIcon>
            <AlertCircleIcon size={36} />
          </EmptyStateIcon>
          <EmptyStateTitle>No repositories found</EmptyStateTitle>
          <EmptyStateDescription>Try changing your search criteria or add a custom repository</EmptyStateDescription>
        </EmptyStateContainer>
      )}
    </Modal>
  );
}
