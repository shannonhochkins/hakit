import { useState } from 'react';
import { RefreshCwIcon, PackageIcon, ChevronRightIcon, GithubIcon } from 'lucide-react';
import { Modal, ModalActions } from '@components/Modal';
import { PrimaryButton } from '@components/Button';
import { SecondaryButton } from '@components/Button/Secondary';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAddonsQueryOptions, updateUserAddonVersion, addonVersionQueryOptions } from '@services/addons';
import { UserAddon } from '@typings/hono';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './UpdateAddonModal.module.css';

const getClassName = getClassNameFactory('UpdateAddonModal', styles);

interface UpdateAddonModalProps {
  open: boolean;
  onClose: () => void;
  userAddon: UserAddon;
}

export function UpdateAddonModal({ open, onClose, userAddon }: UpdateAddonModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatedAddonQuery = useQuery(addonVersionQueryOptions(userAddon.addon.id, userAddon.addon.latestVersion));
  const updateAddon = updatedAddonQuery.data ?? null;
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!updateAddon) {
        throw new Error('Update addon data not available');
      }
      return updateUserAddonVersion(userAddon.id, updateAddon.id, {
        success: 'Addon updated successfully',
        error: 'Failed to update addon',
      });
    },
    onMutate: async () => {
      setIsUpdating(true);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userAddonsQueryOptions.queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(userAddonsQueryOptions.queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(userAddonsQueryOptions.queryKey, (old: UserAddon[] | undefined) => {
        if (!old || !updateAddon) return old;

        return old.map(addon => {
          if (addon.id === userAddon.id) {
            return {
              ...addon,
              versionId: updateAddon.id,
              version: {
                ...addon.version,
                ...updateAddon,
                components:
                  updateAddon.components?.map(comp => ({
                    name: comp.name,
                    enabled: true, // Default to enabled for new components
                  })) || addon.version.components,
              },
            };
          }
          return addon;
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
        queryClient.setQueryData(userAddonsQueryOptions.queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userAddonsQueryOptions.queryKey });
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate();
  };

  // Release notes content with proper link rendering
  const releaseNotesContent = updateAddon?.releaseNotesUrl ? (
    <>
      What&apos;s new in version {userAddon.addon.latestVersion}:
      <br />
      <br />
      <a className={getClassName('releaseNotesLink')} href={updateAddon.releaseNotesUrl} target='_blank' rel='noopener noreferrer'>
        View Release Notes →
      </a>
    </>
  ) : (
    'No release notes available.'
  );

  return (
    <Modal open={open} onClose={onClose} title='Update Addon'>
      <div className={getClassName('header')}>
        <div className={getClassName('addonIcon')}>
          <PackageIcon size={24} />
        </div>
        <div className={getClassName('addonInfo')}>
          <h3 className={getClassName('addonName')}>{userAddon.addon.name}</h3>
          <div className={getClassName('addonUrl')}>
            <a className={getClassName('githubLink')} href={userAddon.addon.githubUrl} target='_blank' rel='noopener noreferrer'>
              <GithubIcon size={14} />
              <span>{userAddon.addon.githubUrl}</span>
            </a>
          </div>
        </div>
      </div>

      <div className={getClassName('versionUpdateSection')}>
        <div className={getClassName('versionUpdateHeader')}>
          <h4 className={getClassName('versionUpdateTitle')}>Version Update</h4>
        </div>

        <div className={getClassName('versionComparison')}>
          <div className={getClassName('versionBadge', getClassName({ current: true }))}>Current: {userAddon.version.version}</div>
          <ChevronRightIcon size={16} color='var(--color-text-muted)' />
          <div className={getClassName('versionBadge', getClassName({ new: true }))}>New: {userAddon.addon.latestVersion}</div>
        </div>
      </div>

      <div className={getClassName('releaseNotesSection')}>
        <h4 className={getClassName('releaseNotesTitle')}>Release Notes</h4>
        <div className={getClassName('releaseNotesContent')}>{releaseNotesContent}</div>
      </div>

      <div className={getClassName('componentChangesSection')}>
        <h4 className={getClassName('componentChangesTitle')}>Components ({updateAddon?.components?.length})</h4>
        <div className={getClassName('componentList')}>
          {updateAddon?.components?.map((component: { name: string }, index: number) => (
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
          aria-label={`Update to ${userAddon.addon.latestVersion}`}
        >
          {isUpdating ? 'Updating...' : `Update to ${userAddon.addon.latestVersion}`}
        </PrimaryButton>
      </ModalActions>
    </Modal>
  );
}
