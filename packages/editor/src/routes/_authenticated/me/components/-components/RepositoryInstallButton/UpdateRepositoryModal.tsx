import { useState } from 'react';
import styled from '@emotion/styled';
import { RefreshCwIcon, PackageIcon, ChevronRightIcon, GithubIcon } from 'lucide-react';
import { Modal, ModalActions } from '@lib/components/Modal';
import { PrimaryButton } from '@lib/components/Button';
import { SecondaryButton } from '@lib/components/Button/Secondary';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UserRepositoryWithDetails,
  userRepositoriesQueryOptions,
  updateUserRepositoryVersion,
  repositoryVersionQueryOptions,
} from '@lib/api/components';

interface UpdateRepositoryModalProps {
  open: boolean;
  onClose: () => void;
  repositories: UserRepositoryWithDetails;
}

const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
`;

const RepositoryIcon = styled.div`
  width: 48px;
  height: 48px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
`;

const RepositoryInfo = styled.div`
  flex: 1;
`;

const RepositoryName = styled.h3`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1) 0;
`;

const RepositoryUrl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

const VersionUpdateSection = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  width: 100%;
`;

const VersionUpdateHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
`;

const VersionUpdateTitle = styled.h4`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0;
`;

const VersionComparison = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
`;

const VersionBadge = styled.div<{ type: 'current' | 'new' }>`
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);

  ${props =>
    props.type === 'current'
      ? `
    background: var(--color-surface-elevated);
    color: var(--color-text-secondary);
  `
      : `
    background: var(--color-primary-100);
    color: var(--color-primary-700);
  `}
`;

const ReleaseNotesSection = styled.div`
  margin-bottom: var(--space-4);
  width: 100%;
`;

const ReleaseNotesTitle = styled.h4`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
`;

const ReleaseNotesContent = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  white-space: pre-wrap;
`;

const ReleaseNotesLink = styled.a`
  color: var(--color-primary-400);
  text-decoration: none;
  transition: color var(--transition-normal);

  &:hover {
    color: var(--color-primary-300);
    text-decoration: underline;
  }
`;

const ComponentChangesSection = styled.div`
  margin-bottom: var(--space-4);
  width: 100%;
`;

const ComponentChangesTitle = styled.h4`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
`;

const ComponentList = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
`;

const ComponentItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const ComponentIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
`;

const GitHubLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  transition: color var(--transition-normal);
  margin-bottom: var(--space-4);

  &:hover {
    color: var(--color-primary-400);
  }
`;

export function UpdateRepositoryModal({ open, onClose, repositories }: UpdateRepositoryModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatedRepositoryQuery = useQuery(repositoryVersionQueryOptions(repositories.repository.id, repositories.repository.latestVersion));
  const updateRepository = updatedRepositoryQuery.data ?? null;
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!updateRepository) {
        throw new Error('Update repository data not available');
      }
      return updateUserRepositoryVersion(repositories.id, updateRepository.id, {
        success: 'Repository updated successfully',
        error: 'Failed to update repository',
      });
    },
    onMutate: async () => {
      setIsUpdating(true);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userRepositoriesQueryOptions.queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(userRepositoriesQueryOptions.queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(userRepositoriesQueryOptions.queryKey, (old: UserRepositoryWithDetails[] | undefined) => {
        if (!old || !updateRepository) return old;

        return old.map(repo => {
          if (repo.id === repositories.id) {
            return {
              ...repo,
              versionId: updateRepository.id,
              version: {
                ...repo.version,
                ...updateRepository,
                components:
                  updateRepository.components?.map(comp => ({
                    name: comp.name,
                    enabled: true, // Default to enabled for new components
                  })) || repo.version.components,
              },
            };
          }
          return repo;
        });
      });

      return { previousData };
    },
    onSuccess: () => {
      setIsUpdating(false);
      onClose();
    },
    onError: (_, __, context) => {
      setIsUpdating(false);

      // Rollback to previous data
      if (context?.previousData) {
        queryClient.setQueryData(userRepositoriesQueryOptions.queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate();
  };

  // Release notes content with proper link rendering
  const releaseNotesContent = updateRepository?.releaseNotesUrl ? (
    <>
      What&apos;s new in version {repositories.repository.latestVersion}:
      <br />
      <br />
      <ReleaseNotesLink href={updateRepository.releaseNotesUrl} target='_blank' rel='noopener noreferrer'>
        View Release Notes →
      </ReleaseNotesLink>
    </>
  ) : (
    'No release notes available.'
  );

  return (
    <Modal open={open} onClose={onClose} title='Update Repository'>
      <Header>
        <RepositoryIcon>
          <PackageIcon size={24} />
        </RepositoryIcon>
        <RepositoryInfo>
          <RepositoryName>{repositories.repository.name}</RepositoryName>
          <RepositoryUrl>
            <GitHubLink href={repositories.repository.githubUrl} target='_blank' rel='noopener noreferrer'>
              <GithubIcon size={14} />
              <span>{repositories.repository.githubUrl}</span>
            </GitHubLink>
          </RepositoryUrl>
        </RepositoryInfo>
      </Header>

      <VersionUpdateSection>
        <VersionUpdateHeader>
          <VersionUpdateTitle>Version Update</VersionUpdateTitle>
        </VersionUpdateHeader>

        <VersionComparison>
          <VersionBadge type='current'>Current: {repositories.version.version}</VersionBadge>
          <ChevronRightIcon size={16} color='var(--color-text-muted)' />
          <VersionBadge type='new'>New: {repositories.repository.latestVersion}</VersionBadge>
        </VersionComparison>
      </VersionUpdateSection>

      <ReleaseNotesSection>
        <ReleaseNotesTitle>Release Notes</ReleaseNotesTitle>
        <ReleaseNotesContent>{releaseNotesContent}</ReleaseNotesContent>
      </ReleaseNotesSection>

      <ComponentChangesSection>
        <ComponentChangesTitle>Components ({updateRepository?.components?.length})</ComponentChangesTitle>
        <ComponentList>
          {updateRepository?.components?.map((component: { name: string }, index: number) => (
            <ComponentItem key={`${component.name}-${index}`}>
              <ComponentIcon>
                <PackageIcon size={12} />
              </ComponentIcon>
              <span>{component.name}</span>
            </ComponentItem>
          ))}
        </ComponentList>
      </ComponentChangesSection>

      <ModalActions>
        <SecondaryButton onClick={onClose} disabled={isUpdating} aria-label='Cancel update'>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          onClick={handleUpdate}
          loading={isUpdating}
          disabled={isUpdating}
          startIcon={<RefreshCwIcon size={16} />}
          aria-label={`Update to ${repositories.repository.latestVersion}`}
        >
          {isUpdating ? 'Updating...' : `Update to ${repositories.repository.latestVersion}`}
        </PrimaryButton>
      </ModalActions>
    </Modal>
  );
}
