import React, { useCallback, useMemo, useState } from 'react';
import { PrimaryButton } from '@components/Button/Primary';
import { DownloadIcon, TrashIcon, RefreshCwIcon } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { userAddonsQueryOptions, connectAddon, disconnectAddon, getAddonVersions } from '@services/addons';
import { toast } from 'react-toastify';
import { AddonWithLatestVersion } from '@typings/hono';
import { UpdateAddonModal } from './UpdateAddonModal';
import { IconButton } from '@components/Button/IconButton';

interface AddonInstallButtonProps {
  addon: AddonWithLatestVersion;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (event: React.MouseEvent) => void;
}

export function AddonInstallButton({ addon, size = 'sm', onClick }: AddonInstallButtonProps) {
  const queryClient = useQueryClient();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Query for user addons to check what's already connected
  const userAddonsQuery = useQuery(userAddonsQueryOptions);

  // Mutation for connecting to a addon
  const connectAddonMutation = useMutation({
    mutationFn: async () => {
      // Get the addon versions to find the latest version ID
      const versions = await getAddonVersions(addon.addon.id);
      const latestVersion = versions.find(v => v.version === addon.addon.latestVersion) || versions[0];

      if (!latestVersion) {
        toast.error('No versions available for this addon', {
          theme: 'dark',
        });
        return;
      }
      return connectAddon(addon.addon.id, latestVersion.id, {
        success: 'Addon installed successfully',
        error: 'Failed to install addon',
      });
    },
    onSuccess: () => {
      // Refetch all relevant queries
      queryClient.invalidateQueries({ queryKey: userAddonsQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: ['search-addons'] });
      queryClient.invalidateQueries({ queryKey: ['popular-addons'] });
    },
  });

  // Mutation for disconnecting from a addon
  const disconnectAddonMutation = useMutation({
    mutationFn: (userAddonId: string) =>
      disconnectAddon(userAddonId, {
        success: 'Addon uninstalled successfully',
        error: 'Failed to uninstall addon',
      }),
    onSuccess: () => {
      // Refetch all relevant queries
      queryClient.invalidateQueries({ queryKey: userAddonsQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: ['search-addons'] });
      queryClient.invalidateQueries({ queryKey: ['popular-addons'] });
    },
  });

  // Helper function to check if a addon is already connected
  const isAddonConnected = () => {
    return userAddonsQuery.data?.some(ur => ur.addonId === addon.addon.id) || false;
  };

  const hasUpdate = useMemo(() => {
    const userAddon = userAddonsQuery.data?.find(ur => ur.addonId === addon.addon.id);
    return userAddon && userAddon.version.version !== addon.addon.latestVersion;
  }, [addon.addon.latestVersion, addon.addon.id, userAddonsQuery.data]);

  // Helper function to get the user addon ID for disconnection
  const getUserAddonId = () => {
    return userAddonsQuery.data?.find(ur => ur.addonId === addon.addon.id)?.id;
  };

  // Helper functions to get button properties based on state
  const getButtonIcon = () => {
    const isConnected = isAddonConnected();

    if (hasUpdate) {
      return <RefreshCwIcon size={14} />;
    }
    if (isConnected) {
      return <TrashIcon size={14} />;
    }
    return <DownloadIcon size={14} />;
  };

  const getButtonText = () => {
    const isConnected = isAddonConnected();
    const isPending = connectAddonMutation.isPending || disconnectAddonMutation.isPending;

    if (isPending) {
      if (hasUpdate) return 'Updating...';
      return isConnected ? 'Disconnecting...' : 'Connecting...';
    }

    if (hasUpdate) return 'Update Available';
    if (isConnected) return 'Uninstall';
    return 'Install';
  };

  const getAriaLabel = () => {
    const isConnected = isAddonConnected();

    if (hasUpdate) return 'Update addon';
    if (isConnected) return 'Uninstall addon';
    return 'Install addon';
  };

  const uninstallAddon = () => {
    const userAddonId = getUserAddonId();
    if (userAddonId) {
      disconnectAddonMutation.mutate(userAddonId);
    } else {
      toast.error('Addon not found for uninstallation', {
        theme: 'dark',
      });
    }
  };

  const handleAddonToggle = (event: React.MouseEvent) => {
    event.stopPropagation();

    const isConnected = isAddonConnected();

    // If there's an update available, show the update modal
    if (hasUpdate) {
      setShowUpdateModal(true);
      return;
    }

    if (isConnected) {
      // Disconnect the addon
      uninstallAddon();
    } else {
      // Connect the addon
      connectAddonMutation.mutate();
    }

    // Call optional onClick handler
    if (onClick) {
      onClick(event);
    }
  };

  const isPending = connectAddonMutation.isPending || disconnectAddonMutation.isPending;

  // Find the user addon for the update modal
  const userAddon = userAddonsQuery.data?.find(ur => ur.addonId === addon.addon.id);

  const onClose = useCallback(() => {
    setShowUpdateModal(false);
  }, []);

  return (
    <>
      <PrimaryButton
        size={size}
        variant={hasUpdate ? 'success' : isAddonConnected() ? 'error' : 'primary'}
        startIcon={getButtonIcon()}
        onClick={handleAddonToggle}
        disabled={isPending}
        aria-label={getAriaLabel()}
      >
        {getButtonText()}
      </PrimaryButton>
      {hasUpdate && <IconButton onClick={uninstallAddon} aria-label='Uninstall' icon={<TrashIcon size={16} />} variant='error' />}

      {showUpdateModal && userAddon && <UpdateAddonModal open={showUpdateModal} onClose={onClose} userAddon={userAddon} />}
    </>
  );
}
