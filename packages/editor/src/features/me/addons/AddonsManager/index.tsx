import { useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { PrimaryButton } from '@components/Button/Primary';
import { DownloadCloudIcon, SearchIcon, PackageIcon, EyeIcon } from 'lucide-react';
import { AddonListItem } from '@features/me/addons/AddonsManager/AddonListItem';
import { Row } from '@components/Layout';
import { InputField } from '@components/Form/Field/Input';
import { Confirm } from '@components/Modal/confirm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAddonsQueryOptions, disconnectAddon, toggleComponentStatus } from '@services/addons';
import { UserAddon } from '@typings/hono';
import { SwitchField } from '@components/Form/Field/Switch';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@components/Table';
import { SecondaryButton } from '@components/Button';
import { AddonInstallButton } from '@features/me/addons/AddonsManager/AddonInstallButton';
import { EmptyState } from '@components/EmptyState';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './AddonsManager.module.css';

const getClassName = getClassNameFactory('AddonsManager', styles);

interface Component {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  addonId: string;
  userAddonId: string;
}

export function AddonsManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userAddonsQuery = useQuery(userAddonsQueryOptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingUserAddonId, setDeletingUserAddonId] = useState<string | null>(null);
  const [togglingComponents, setTogglingComponents] = useState<Set<string>>(new Set());

  const userAddons = useMemo(() => userAddonsQuery.data ?? [], [userAddonsQuery.data]);

  // Mutations
  const toggleComponentMutation = useMutation({
    mutationFn: ({ userAddonId, componentName }: { userAddonId: string; componentName: string }) =>
      toggleComponentStatus(userAddonId, componentName),
    onMutate: async ({ userAddonId, componentName }) => {
      setTogglingComponents(prev => new Set(prev).add(`${userAddonId}-${componentName}`));

      await queryClient.cancelQueries({ queryKey: userAddonsQueryOptions.queryKey });
      const previousData = queryClient.getQueryData(userAddonsQueryOptions.queryKey);

      queryClient.setQueryData(userAddonsQueryOptions.queryKey, (old: UserAddon[] | undefined) => {
        if (!old) return old;

        return old.map(addon => {
          if (addon.id === userAddonId) {
            return {
              ...addon,
              version: {
                ...addon.version,
                components: addon.version.components.map(comp => {
                  if (comp.name === componentName) {
                    return { ...comp, enabled: !comp.enabled };
                  }
                  return comp;
                }),
              },
            };
          }
          return addon;
        });
      });

      return { previousData };
    },
    onSuccess: (_, { userAddonId, componentName }) => {
      setTogglingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${userAddonId}-${componentName}`);
        return newSet;
      });
    },
    onError: (_, { userAddonId, componentName }, context) => {
      setTogglingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${userAddonId}-${componentName}`);
        return newSet;
      });

      if (context?.previousData) {
        queryClient.setQueryData(userAddonsQueryOptions.queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userAddonsQueryOptions.queryKey });
    },
  });

  const disconnectAddonMutation = useMutation({
    mutationFn: (userAddonId: string) => disconnectAddon(userAddonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userAddonsQueryOptions.queryKey });
    },
  });

  // Create a stable list of components for search and rendering
  const components: Component[] = useMemo(() => {
    return userAddons.flatMap(
      userAddon =>
        userAddon.version.components?.map(component => ({
          id: `${userAddon.id}-${component.name}`, // Use component name for stable ID
          name: component.name,
          version: userAddon.version.version,
          enabled: component.enabled ?? true, // Default to true if undefined
          addonId: userAddon.addon.id,
          userAddonId: userAddon.id, // Add for easier lookup
        })) || []
    );
  }, [userAddons]);

  // Filter addons and components based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        addons: userAddons,
        hasMatches: true,
        matchedComponents: components,
      };
    }

    const query = searchQuery.toLowerCase();
    const matchedAddons = [];
    const matchedComponents: Component[] = [];

    // First find all components that match the search
    const allMatchedComponents = components.filter(component => component.name.toLowerCase().includes(query));

    // Then find addons that either match by name/description or have matching components
    for (const addon of userAddons) {
      const addonNameMatch = addon.addon.name.toLowerCase().includes(query) || addon.addon.description?.toLowerCase().includes(query);
      const addonComponents = allMatchedComponents.filter(c => c.addonId === addon.addon.id);

      if (addonNameMatch || addonComponents.length > 0) {
        matchedAddons.push(addon);
        // Include all matched components for this addon
        matchedComponents.push(...addonComponents);
      }
    }

    return {
      addons: matchedAddons,
      hasMatches: matchedAddons.length > 0,
      matchedComponents,
    };
  }, [userAddons, components, searchQuery]);

  const { addons: filteredAddons, hasMatches } = filteredData;

  // Helper functions
  const handleToggleComponent = (userAddonId: string, componentName: string) => {
    toggleComponentMutation.mutate({ userAddonId, componentName });
  };

  const isTogglingComponent = (userAddonId: string, componentName: string) => {
    return togglingComponents.has(`${userAddonId}-${componentName}`);
  };

  const confirmDelete = async () => {
    if (deletingUserAddonId) {
      try {
        await disconnectAddonMutation.mutateAsync(deletingUserAddonId);
        userAddonsQuery.refetch();
      } catch (error) {
        console.error('Failed to disconnect addon:', error);
      } finally {
        setDeleteConfirmOpen(false);
        setDeletingUserAddonId(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingUserAddonId(null);
  };

  const deletingAddon = useMemo(() => {
    if (!deletingUserAddonId) return null;
    const userAddon = userAddons.find(ur => ur.id === deletingUserAddonId);
    return userAddon?.addon || null;
  }, [deletingUserAddonId, userAddons]);

  const onExploreComponents = () => {
    navigate({ to: '/me/addons/explore' });
  };

  return (
    <div className={getClassName()}>
      <div className={getClassName('pageHeader')}>
        <Row fullWidth justifyContent='space-between' alignItems='center'>
          <div className={getClassName('headerContent')}>
            <h1 className={getClassName('pageTitle')}>Installed Addons</h1>
            <p className={getClassName('pageSubtitle')}>Manage your dashboard addons & components</p>
          </div>
          <PrimaryButton aria-label='Explore Addons' onClick={onExploreComponents} startIcon={<DownloadCloudIcon size={16} />}>
            Explore Addons
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
          helperText='Search for installed addons & components'
          placeholder='Search components...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          startAdornment={<SearchIcon size={18} />}
        />
      </div>

      <div className={getClassName('addonsContainer')}>
        {userAddonsQuery.isLoading ? (
          <div>Loading addons...</div>
        ) : userAddonsQuery.error ? (
          <div>Error loading addons: {userAddonsQuery.error.message}</div>
        ) : userAddons.length === 0 ? (
          <EmptyState
            icon={<PackageIcon size={48} />}
            title='No addons installed'
            description='Install addons to add functionality to your dashboards'
            actions={
              <PrimaryButton startIcon={<DownloadCloudIcon size={16} />} onClick={onExploreComponents} aria-label='Explore Addons'>
                Explore Addons
              </PrimaryButton>
            }
          />
        ) : !hasMatches ? (
          <EmptyState
            icon={<PackageIcon size={48} />}
            title='No results found'
            description={`No addons or components match "${searchQuery}". Try adjusting your search terms.`}
            actions={null}
          />
        ) : (
          filteredAddons.map(addonWithVersion => {
            const addon = addonWithVersion.version;

            const components = searchQuery
              ? addon.components.filter(component => component.name.toLowerCase().includes(searchQuery.toLowerCase()))
              : addon.components;

            return (
              <AddonListItem
                key={addonWithVersion.id}
                addon={addonWithVersion}
                defaultExpanded
                actions={
                  <Row gap='var(--space-2)'>
                    <SecondaryButton
                      size='sm'
                      startIcon={<EyeIcon size={14} />}
                      onClick={e => {
                        e.stopPropagation();
                        navigate({ to: '/me/addons/explore/$addon', params: { addon: addonWithVersion.addon.id } });
                      }}
                      aria-label={`View details for ${addonWithVersion.addon?.name}`}
                    >
                      View Details
                    </SecondaryButton>
                    <AddonInstallButton addon={addonWithVersion} />
                  </Row>
                }
              >
                {components.length > 0 && (
                  <TableContainer
                    style={{
                      borderRadius: 'none',
                      border: 'none',
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeaderCell>Component</TableHeaderCell>
                          <TableHeaderCell>Status</TableHeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {components.map((component, index) => {
                          const isToggling = isTogglingComponent(addonWithVersion.id, component.name);

                          return (
                            <TableRow key={`${component.name}-${index}`}>
                              <TableCell>
                                <div className={getClassName('componentInfo')}>
                                  <div className={getClassName('componentIcon')}>
                                    <PackageIcon size={16} />
                                  </div>
                                  <span className={getClassName('componentName')}>{component.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={getClassName('statusContainer')}>
                                  <SwitchField
                                    isolated={false}
                                    id={`${component.name}-${index}`}
                                    name={`${component.name}-${index}`}
                                    checked={component.enabled ?? true}
                                    onChange={() => handleToggleComponent(addonWithVersion.id, component.name)}
                                    disabled={isToggling}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AddonListItem>
            );
          })
        )}
      </div>

      <Confirm open={deleteConfirmOpen} title='Remove Addon' onConfirm={confirmDelete} onCancel={cancelDelete}>
        <p>
          Are you sure you want to remove <strong>&ldquo;{deletingAddon?.name}&rdquo;</strong>? This action cannot be undone and will remove
          all associated components.
        </p>
      </Confirm>
    </div>
  );
}
