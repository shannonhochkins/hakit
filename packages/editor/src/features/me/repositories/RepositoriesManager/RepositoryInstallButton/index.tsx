import React, { useMemo, useState } from 'react';
import { PrimaryButton } from '@components/Button/Primary';
import { DownloadIcon, TrashIcon, RefreshCwIcon } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { userRepositoriesQueryOptions, connectRepository, disconnectRepository, getRepositoryVersions } from '@services/repositories';
import { toast } from 'react-toastify';
import { RepositoryWithLatestVersion } from '@typings/hono';
import { UpdateRepositoryModal } from './UpdateRepositoryModal';
import { IconButton } from '@components/Button/IconButton';

interface RepositoryInstallButtonProps {
  repository: RepositoryWithLatestVersion;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (event: React.MouseEvent) => void;
}

export function RepositoryInstallButton({ repository, size = 'sm', onClick }: RepositoryInstallButtonProps) {
  const queryClient = useQueryClient();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Query for user repositories to check what's already connected
  const userRepositoriesQuery = useQuery(userRepositoriesQueryOptions);

  // Mutation for connecting to a repository
  const connectRepoMutation = useMutation({
    mutationFn: async () => {
      // Get the repository versions to find the latest version ID
      const versions = await getRepositoryVersions(repository.repository.id);
      const latestVersion = versions.find(v => v.version === repository.repository.latestVersion) || versions[0];

      if (!latestVersion) {
        toast.error('No versions available for this repository');
        return;
      }
      return connectRepository(repository.repository.id, latestVersion.id, {
        success: 'Repository installed successfully',
        error: 'Failed to install repository',
      });
    },
    onSuccess: () => {
      // Refetch all relevant queries
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: ['search-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['popular-repositories'] });
    },
  });

  // Mutation for disconnecting from a repository
  const disconnectRepoMutation = useMutation({
    mutationFn: (userRepositoryId: string) =>
      disconnectRepository(userRepositoryId, {
        success: 'Repository uninstalled successfully',
        error: 'Failed to uninstall repository',
      }),
    onSuccess: () => {
      // Refetch all relevant queries
      queryClient.invalidateQueries({ queryKey: userRepositoriesQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: ['search-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['popular-repositories'] });
    },
  });

  // Helper function to check if a repository is already connected
  const isRepositoryConnected = () => {
    return userRepositoriesQuery.data?.some(ur => ur.repositoryId === repository.repository.id) || false;
  };

  const hasUpdate = useMemo(() => {
    const userRepo = userRepositoriesQuery.data?.find(ur => ur.repositoryId === repository.repository.id);
    return userRepo && userRepo.version.version !== repository.repository.latestVersion;
  }, [repository.repository.latestVersion, repository.repository.id, userRepositoriesQuery.data]);

  // Helper function to get the user repository ID for disconnection
  const getUserRepositoryId = () => {
    return userRepositoriesQuery.data?.find(ur => ur.repositoryId === repository.repository.id)?.id;
  };

  // Helper functions to get button properties based on state
  const getButtonIcon = () => {
    const isConnected = isRepositoryConnected();

    if (hasUpdate) {
      return <RefreshCwIcon size={14} />;
    }
    if (isConnected) {
      return <TrashIcon size={14} />;
    }
    return <DownloadIcon size={14} />;
  };

  const getButtonText = () => {
    const isConnected = isRepositoryConnected();
    const isPending = connectRepoMutation.isPending || disconnectRepoMutation.isPending;

    if (isPending) {
      if (hasUpdate) return 'Updating...';
      return isConnected ? 'Disconnecting...' : 'Connecting...';
    }

    if (hasUpdate) return 'Update Available';
    if (isConnected) return 'Uninstall';
    return 'Install';
  };

  const getAriaLabel = () => {
    const isConnected = isRepositoryConnected();

    if (hasUpdate) return 'Update repository';
    if (isConnected) return 'Uninstall repository';
    return 'Install repository';
  };

  const uninstallRepository = () => {
    const userRepoId = getUserRepositoryId();
    if (userRepoId) {
      disconnectRepoMutation.mutate(userRepoId);
    } else {
      toast.error('Repository not found for uninstallation');
    }
  };

  const handleRepositoryToggle = (event: React.MouseEvent) => {
    event.stopPropagation();

    const isConnected = isRepositoryConnected();

    // If there's an update available, show the update modal
    if (hasUpdate) {
      setShowUpdateModal(true);
      return;
    }

    if (isConnected) {
      // Disconnect the repository
      uninstallRepository();
    } else {
      // Connect the repository
      connectRepoMutation.mutate();
    }

    // Call optional onClick handler
    if (onClick) {
      onClick(event);
    }
  };

  const isPending = connectRepoMutation.isPending || disconnectRepoMutation.isPending;

  // Find the user repository for the update modal
  const userRepository = userRepositoriesQuery.data?.find(ur => ur.repositoryId === repository.repository.id);

  return (
    <>
      <PrimaryButton
        size={size}
        variant={hasUpdate ? 'success' : isRepositoryConnected() ? 'error' : 'primary'}
        startIcon={getButtonIcon()}
        onClick={handleRepositoryToggle}
        disabled={isPending}
        aria-label={getAriaLabel()}
      >
        {getButtonText()}
      </PrimaryButton>
      {hasUpdate && <IconButton onClick={uninstallRepository} aria-label='Uninstall' icon={<TrashIcon size={16} />} variant='error' />}

      {showUpdateModal && userRepository && (
        <UpdateRepositoryModal open={showUpdateModal} onClose={() => setShowUpdateModal(false)} userRepository={userRepository} />
      )}
    </>
  );
}
