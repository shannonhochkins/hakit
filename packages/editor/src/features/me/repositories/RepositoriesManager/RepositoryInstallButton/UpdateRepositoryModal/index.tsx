import { useState } from 'react';
import { RefreshCwIcon, PackageIcon, ChevronRightIcon, GithubIcon } from 'lucide-react';
import { Modal, ModalActions } from '@components/Modal';
import { PrimaryButton } from '@components/Button';
import { SecondaryButton } from '@components/Button/Secondary';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userRepositoriesQueryOptions, updateUserRepositoryVersion, repositoryVersionQueryOptions } from '@services/repositories';
import { UserRepository } from '@typings/hono';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './UpdateRepositoryModal.module.css';

const getClassName = getClassNameFactory('UpdateRepositoryModal', styles);

interface UpdateRepositoryModalProps {
  open: boolean;
  onClose: () => void;
  userRepository: UserRepository;
}

export function UpdateRepositoryModal({ open, onClose, userRepository }: UpdateRepositoryModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatedRepositoryQuery = useQuery(
    repositoryVersionQueryOptions(userRepository.repository.id, userRepository.repository.latestVersion)
  );
  const updateRepository = updatedRepositoryQuery.data ?? null;
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!updateRepository) {
        throw new Error('Update repository data not available');
      }
      return updateUserRepositoryVersion(userRepository.id, updateRepository.id, {
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
      queryClient.setQueryData(userRepositoriesQueryOptions.queryKey, (old: UserRepository[] | undefined) => {
        if (!old || !updateRepository) return old;

        return old.map(repo => {
          if (repo.id === userRepository.id) {
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
      What&apos;s new in version {userRepository.repository.latestVersion}:
      <br />
      <br />
      <a className={getClassName('releaseNotesLink')} href={updateRepository.releaseNotesUrl} target='_blank' rel='noopener noreferrer'>
        View Release Notes →
      </a>
    </>
  ) : (
    'No release notes available.'
  );

  return (
    <Modal open={open} onClose={onClose} title='Update Repository'>
      <div className={getClassName('header')}>
        <div className={getClassName('repositoryIcon')}>
          <PackageIcon size={24} />
        </div>
        <div className={getClassName('repositoryInfo')}>
          <h3 className={getClassName('repositoryName')}>{userRepository.repository.name}</h3>
          <div className={getClassName('repositoryUrl')}>
            <a className={getClassName('githubLink')} href={userRepository.repository.githubUrl} target='_blank' rel='noopener noreferrer'>
              <GithubIcon size={14} />
              <span>{userRepository.repository.githubUrl}</span>
            </a>
          </div>
        </div>
      </div>

      <div className={getClassName('versionUpdateSection')}>
        <div className={getClassName('versionUpdateHeader')}>
          <h4 className={getClassName('versionUpdateTitle')}>Version Update</h4>
        </div>

        <div className={getClassName('versionComparison')}>
          <div className={getClassName('versionBadge', getClassName({ current: true }))}>Current: {userRepository.version.version}</div>
          <ChevronRightIcon size={16} color='var(--color-text-muted)' />
          <div className={getClassName('versionBadge', getClassName({ new: true }))}>New: {userRepository.repository.latestVersion}</div>
        </div>
      </div>

      <div className={getClassName('releaseNotesSection')}>
        <h4 className={getClassName('releaseNotesTitle')}>Release Notes</h4>
        <div className={getClassName('releaseNotesContent')}>{releaseNotesContent}</div>
      </div>

      <div className={getClassName('componentChangesSection')}>
        <h4 className={getClassName('componentChangesTitle')}>Components ({updateRepository?.components?.length})</h4>
        <div className={getClassName('componentList')}>
          {updateRepository?.components?.map((component: { name: string }, index: number) => (
            <div key={`${component.name}-${index}`} className={getClassName('componentItem')}>
              <div className={getClassName('componentIcon')}>
                <PackageIcon size={12} />
              </div>
              <span>{component.name}</span>
            </div>
          ))}
        </div>
      </div>

      <ModalActions>
        <SecondaryButton onClick={onClose} disabled={isUpdating} aria-label='Cancel update'>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          onClick={handleUpdate}
          loading={isUpdating}
          disabled={isUpdating}
          startIcon={<RefreshCwIcon size={16} />}
          aria-label={`Update to ${userRepository.repository.latestVersion}`}
        >
          {isUpdating ? 'Updating...' : `Update to ${userRepository.repository.latestVersion}`}
        </PrimaryButton>
      </ModalActions>
    </Modal>
  );
}
