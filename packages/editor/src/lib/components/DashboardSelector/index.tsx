
import { Spinner } from '@lib/components/Spinner';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconButton } from '@lib/components/IconButtons';
import { CirclePlus, ImagePlus, LayoutDashboard, Repeat, SquarePen, Type } from 'lucide-react';
import { Tooltip } from '@lib/components/Tooltip';
import { Column, Row } from '@hakit/components';
import { PrimaryButton } from '@lib/page/shared/Button';
import { Card } from '@lib/components/Card';
import { Modal, ModalActions } from '../../page/shared/Modal';
import { useQuery } from '@tanstack/react-query';
import { createDashboard, dashboardsQueryOptions, deleteDashboard, updateDashboardForUser } from '@lib/api/dashboard';
import { InputField } from '../Form/Fields/Input';
import { nameToPath } from '@lib/helpers/routes/nameToPath';
import { usePrevious } from '@lib/hooks/usePrevious';
import { useNavigate } from '@tanstack/react-router';
import { capitalize } from '@mui/material';
import { ImageUpload } from '../Form/Fields/Image';
import { FieldLabel } from '../Form/FieldWrapper/FieldLabel';
import { SelectField } from '../Form/Fields/Select';

interface DashboardSelectorProps {
  open?: boolean;
  onClose?: () => void;
}

export function DashboardSelector({ open = false, onClose }: DashboardSelectorProps) {
  const [openPopup, setOpenPopup] = useState(open);
  const [newDashboardOpen, setNewDashboardOpen] =  useState(false);
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = useMemo(() => dashboardsQuery.data, [dashboardsQuery.data]);
  const navigate = useNavigate();
  const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null);
  const [mode, setMode] = useState<'new' | 'edit' | 'duplicate'>('new');
  const [name, setName] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const previousName = usePrevious(name);
  const [path, setPath] = useState<string>('');
  const [pathTouched, setPathTouched] = useState(false);
  const [pathError, setPathError] = useState('');
  const currentDashboard = useMemo(() => dashboards?.find(d => d.id === editingDashboardId), [dashboards, editingDashboardId]);

  const togglePopup = useCallback(() => {
    setOpenPopup(!openPopup);
    // Close the popup if it was open
    if (openPopup) {
      onClose?.();
    }
  }, [onClose, openPopup]);

  useEffect(() => {
    const derivedPath = nameToPath(name);
    const isNameEmpty = name.trim() === '';
    const isPathEmpty = path.trim() === '';
    const isPathInSyncWithPreviousName = previousName !== undefined && path === nameToPath(previousName);

    // Case 1: Name is empty and path is still in sync or empty → clear path
    if (isNameEmpty && (!pathTouched || isPathInSyncWithPreviousName)) {
      setPath('');
    }

    // Case 2: Name is not empty, path hasn't been touched, and either it's empty or still in sync → sync
    else if (!pathTouched && (isPathEmpty || isPathInSyncWithPreviousName)) {
      setPath(derivedPath);
    }

  // Else: leave path untouched (user has taken control)
  }, [name, path, pathTouched, previousName]);

  // Path validation
  useEffect(() => {
    const valid = /^[a-z0-9-]+$/.test(path);
    setPathError(valid || path.length === 0 ? '' : 'Only lowercase letters, numbers and dashes allowed');
  }, [path]);

  const editDashboard = useCallback((dashboardId: string) => {
    if (!dashboards) {
      console.error('No dashboards found');
      return;
    }
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      console.error('Dashboard not found');
      return;
    }
    setMode('edit');
    setEditingDashboardId(dashboard.id);
    setName(dashboard.name);
    setPath(dashboard.path);
    setThumbnail(dashboard.thumbnail);
    setPathTouched(false);
    setNewDashboardOpen(true);
    setOpenPopup(true);
  }, [dashboards, setOpenPopup]);

  if (dashboardsQuery.isLoading || !dashboards) {
    return <Spinner />
  }
  if (dashboardsQuery.isError) {
    return <div>Error: {dashboardsQuery.error.message}</div>
  }
  return (<>
    {/* <Tooltip title="Dashboard Options" placement="right">
      <IconButton
        title="Dashboard Options"
        onClick={togglePopup}
      >
        <LayoutDashboard size={32} />
      </IconButton>
    </Tooltip> */}
    <SelectField
      value={currentDashboard ?? dashboards[0]}
      options={[...dashboards, {
        id: 'new',
        name: 'Customize',
        path: '__new__'
      }]}
      startAdornment={<LayoutDashboard size={36} style={{
        marginRight: '0.5rem',
      }} />}
      renderValue={(option) => {
        return option.name;
      }}
      getOptionLabel={(option) => option.id === 'new' ? <Row gap="0.5rem" fullHeight>
        <CirclePlus size={16} />
        New Page
      </Row> : <Row gap="0.5rem" fullWidth justifyContent="space-between" fullHeight>
        {option.name}
        <IconButton onClick={() => {
          editDashboard(option.id);
        }}>
          <SquarePen size={16} />
        </IconButton>
      </Row>}
      // getOptionValue={(option) => option.path}
      onChange={(event) => {
        const value = event?.target.value;
        if (typeof value === 'string' || value.id === 'new') {
          // empty value, consider we've hit the "edit" option
          // setOpenNewPage(true);
        } else {
          // navigate({
          //   to: '/dashboards/$dashboardPath/$pagePath/edit',
          //   // quickest pathway forward to load new data
          //   reloadDocument: true,
          //   params: {
          //     dashboardPath: params.dashboardPath,
          //     pagePath: value.path
          //   }
          // })
        }
      }}
    />
    <Modal title="Dashboard Options" open={openPopup} onClose={togglePopup} style={{
      maxWidth: '100%',
    }}>

      {dashboards.length === 0 && (
        <Column fullWidth>
          <h2>No dashboards found</h2>
          <p>Click the button below to create a new dashboard.</p>
        </Column>
      )}
      {dashboards.length > 0 && (<Row gap="1rem" fullWidth alignItems='flex-start' justifyContent='flex-start' style={{
        paddingTop: 'var(--space-4)',
      }}>
        {dashboards.map(dashboard => (
          <Card
            style={{
              // width: dashboards.length === 1 ? '100%' : dashboards.length % 2 === 0 ? '50%' : dashboards.length % 3 === 0 ? '33%' : '25%',
              width: '100%',
              flex: `1 1 calc(${dashboards.length === 1 ? '100%' : dashboards.length % 2 === 0 ? '50%' : dashboards.length % 3 === 0 ? '33%' : '25%'} - 1rem)`
            }}
            key={dashboard.id}
            title={dashboard.name}
            subtitle={dashboard.path}
            image={dashboard.thumbnail}
            options={[{
              label: 'Duplicate',
              onClick() {
                setMode('duplicate');
                setEditingDashboardId(dashboard.id);
                setName(`${dashboard.name} (duplicate)`);
                setPath('');
                setThumbnail(dashboard.thumbnail);
                setPathTouched(false);
                setNewDashboardOpen(true);
                togglePopup();
              }
            }, {
              label: 'Delete',
              onClick() {
                // TODO - Confirmation dialog ??
                deleteDashboard({
                  id: dashboard.id
                }).then(() => {
                  dashboardsQuery.refetch();
                });
              }
            }, {
              label: 'Edit',
              onClick: () => {
                editDashboard(dashboard.id);
              }
            }, {
              label: 'View',
              onClick: () => {
                navigate({
                  to: '/dashboards/$dashboardPath/$pagePath/edit',
                  reloadDocument: true,
                  params: {
                    dashboardPath: dashboard.path,
                    pagePath: dashboard.pages[0]?.path,
                  }
                })
              }
            }]}
            onClick={(e) => {
              e.stopPropagation();
              navigate({
                to: '/dashboards/$dashboardPath/$pagePath/edit',
                reloadDocument: true,
                params: {
                  dashboardPath: dashboard.path,
                  pagePath: dashboard.pages[0]?.path,
                }
              })
            }}
          />
        ))}
      </Row>)}
      <ModalActions>
        <PrimaryButton onClick={togglePopup}>CANCEL</PrimaryButton>
        <PrimaryButton onClick={() => {
          setName('');
          setPath('');
          setThumbnail('');
          setMode('new');
          setNewDashboardOpen(true);
          togglePopup();
        }}>NEW</PrimaryButton>
      </ModalActions>
    </Modal>
    <Modal open={newDashboardOpen} title={`${capitalize(mode)} Dashboard`} onClose={() => {
      setNewDashboardOpen(false);
    }}>
      <Column gap="1rem" fullWidth alignItems='stretch' justifyContent='flex-start'>
        <div>
          <FieldLabel label="Name" icon={<Type size={16} />} />
          <InputField
            style={{
              width: '100%',
            }}
            helperText={'Enter a name for your dashboard'}
            required
            value={name}
            type="text"
            onChange={event => {
              const val = event.target.value;
              setName(val);
          }} />
        </div>
        <div>
          <FieldLabel label="Path" icon={<Type size={16} />} />
          <InputField
            style={{
              width: '100%',
            }}
            value={path}
            error={!!pathError}
            helperText={pathError || 'Enter a path for your dashboard'}
            type="text"
            slotProps={{
              input: {
                endAdornment: <Tooltip title="Sync with name" placement="left">
                  <Repeat size={16} onClick={() => {
                    setPath(nameToPath(name));
                  }} style={{
                    cursor: 'pointer',
                  }} />
                </Tooltip>
              }
            }}
            onChange={event => {
              const val = event.target.value;
              setPath(val);
              setPathTouched(true);
            }} />            
        </div>
        <div>
          <FieldLabel label="Thumbnail" icon={<ImagePlus size={16} />} style={{
            marginBottom: 'var(--space-4)',
          }} />
          <ImageUpload value={thumbnail || ''} onChange={(value) => {
            setThumbnail(value);
          }} />
        </div>
      </Column>
      <ModalActions>
      <PrimaryButton onClick={() => {
        setName('');
        setPath('');
        setThumbnail('');
        setEditingDashboardId(null);
        togglePopup();
        setNewDashboardOpen(false);
      }}>CANCEL</PrimaryButton>
        {(mode === 'new' || mode === 'duplicate') && (<PrimaryButton disabled={!path || !name || !!pathError} onClick={() => {
          const matchedDashboard = mode === 'duplicate' ? dashboards.find(d => d.id === editingDashboardId) || {} : {};
          createDashboard({
            ...matchedDashboard,
            name,
            path,
            thumbnail,
          }).then(() => {
            togglePopup();
            setNewDashboardOpen(false);
            setName('');
            setPath('');
            setThumbnail('');
            setPathTouched(false);
            dashboardsQuery.refetch();
          }).catch(() => {
            // TODO - handle error
          });
        }}>CREATE</PrimaryButton>)}

        {mode === 'edit' && editingDashboardId && (<PrimaryButton disabled={!path || !name || !!pathError} onClick={() => {
          const matchedDashboard = dashboards.find(d => d.id === editingDashboardId);
          if (!matchedDashboard) {
            // TODO - handle error with toast
            return;
          }
          updateDashboardForUser({
            id: editingDashboardId,
            name,
            path,
            data: matchedDashboard.data,
            thumbnail: thumbnail,
          }).then(() => {
            togglePopup();
            setNewDashboardOpen(false);
            setEditingDashboardId(null);
            setName('');
            setPath('');
            setThumbnail('');
            setPathTouched(false);
            dashboardsQuery.refetch();
          }).catch(() => {
            // TODO - handle error
          })
        }}>SAVE</PrimaryButton>)}
      </ModalActions>
    </Modal>
  </>)
}