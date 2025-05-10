
import { Spinner } from '@lib/components/Spinner';
import { useEffect, useState } from 'react';
import { IconButton } from '@lib/components/IconButtons';
import { LayoutDashboard } from 'lucide-react';
import { Tooltip } from '@lib/components/Tooltip';
import { Column, Row } from '@hakit/components';
import { Button } from '@lib/components/Button';
import { Card } from '@lib/components/Card';
import { Modal, ModalActions } from '../Modal';
import { useQuery } from '@tanstack/react-query';
import { createDashboard, dashboardsQueryOptions, deleteDashboard, updateDashboardForUser } from '@lib/api/dashboard';
import { InputField } from '../Form/Fields/Input';
import { nameToPath } from '@lib/helpers/routes/nameToPath';
import { usePrevious } from '@lib/hooks/usePrevious';
import { useNavigate } from '@tanstack/react-router';
import { capitalize } from '@mui/material';

interface DashboardSelectorProps {
  open: boolean;
  onClose?: () => void;
}

export function DashboardSelector({ open, onClose }: DashboardSelectorProps) {
  const [openPopup, setOpenPopup] = useState(open);
  const [newDashboardOpen, setNewDashboardOpen] =  useState(false);
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const dashboards = dashboardsQuery.data;
  const navigate = useNavigate();
  const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null);
  const [mode, setMode] = useState<'new' | 'edit' | 'duplicate'>('new');
  const [name, setName] = useState<string>('');
  const previousName = usePrevious(name);
  const [path, setPath] = useState<string>('');
  const [pathTouched, setPathTouched] = useState(false);
  const [pathError, setPathError] = useState('');

  const togglePopup = () => {
    setOpenPopup(!openPopup);
    // Close the popup if it was open
    if (openPopup) {
      onClose?.();
    }
  };

  useEffect(() => {
    const derivedPath = nameToPath(name);
    const isNameEmpty = name.trim() === '';
    const isPathInSync = previousName && path === nameToPath(previousName);
  
    // Case 1: Name is empty and path is still in sync → reset path
    if (isNameEmpty && (!pathTouched || isPathInSync)) {
      setPath('');
    }
  
    // Case 2: Name is not empty, and user hasn't manually changed the path → update path
    else if (!pathTouched || path === '' || isPathInSync) {
      setPath(derivedPath);
    }
  }, [name, path, pathTouched]);

  // Path validation
  useEffect(() => {
    const valid = /^[a-z0-9-]+$/.test(path);
    setPathError(valid || path.length === 0 ? '' : 'Only lowercase letters, numbers and dashes allowed');
  }, [path]);

  if (dashboardsQuery.isLoading || !dashboards) {
    return <Spinner />
  }
  if (dashboardsQuery.isError) {
    return <div>Error: {dashboardsQuery.error.message}</div>
  }
  return (<>
    <Tooltip title="Dashboard Options" placement="right">
      <IconButton
        title="Dashboard Options"
        onClick={togglePopup}
      >
        <LayoutDashboard size={32} />
      </IconButton>
    </Tooltip>
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
        paddingTop: 'var(--puck-space-px)',
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
            options={[{
              label: 'TODO - Duplicate',
              onClick() {
                setMode('duplicate');
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
              label: 'Rename',
              onClick: () => {
                setMode('edit');
                setEditingDashboardId(dashboard.id);
                setName(dashboard.name);
                setPath(dashboard.path);
                setPathTouched(false);
                setNewDashboardOpen(true);
                togglePopup();
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
        <Button onClick={togglePopup}>CANCEL</Button>
        <Button variant="contained" onClick={() => {
          setName('');
          setPath('');
          setMode('new');
          setNewDashboardOpen(true);
          togglePopup();
        }}>NEW</Button>
      </ModalActions>
    </Modal>
    <Modal open={newDashboardOpen} title={`${capitalize(mode)} Dashboard`} onClose={() => {
      setNewDashboardOpen(false);
    }}>
      <Column gap="1rem" fullWidth>
        <InputField
          style={{
            width: '100%',
          }}
          helperText={'Enter a name for your dashboard'}
          required
          value={name}
          label="Name"
          type="text"
          onChange={event => {
            const val = event.target.value;
            setName(val);
        }} />
        <InputField
          style={{
            width: '100%',
          }}
          value={path}
          error={!!pathError}
          helperText={pathError || 'Enter a path for your dashboard'}
          label="Path"
          type="text"
          onChange={event => {
            const val = event.target.value;
            setPath(val);
            setPathTouched(true);
          }} />
      </Column>
      <ModalActions>
      <Button onClick={() => {
        setName('');
        setPath('');
        setEditingDashboardId(null);
        togglePopup();
        setNewDashboardOpen(false);
      }}>CANCEL</Button>
        {mode === 'new' && (<Button variant="contained" disabled={!path || !name} onClick={() => {
          createDashboard({
            name,
            path,
            data: {},
          }).then(() => {
            togglePopup();
            setNewDashboardOpen(false);
            setName('');
            setPath('');
            setPathTouched(false);
            dashboardsQuery.refetch();
          }).catch(() => {
            // TODO - handle error
          });
        }}>CREATE</Button>)}

        {(mode === 'edit' || mode === 'duplicate') && editingDashboardId && (<Button variant="contained" disabled={!path || !name} onClick={() => {
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
            breakpoints: matchedDashboard.breakpoints,
          }).then(() => {
            togglePopup();
            setNewDashboardOpen(false);
            setEditingDashboardId(null);
            setName('');
            setPath('');
            setPathTouched(false);
            dashboardsQuery.refetch();
          }).catch(() => {
            // TODO - handle error
          })
        }}>SAVE</Button>)}
      </ModalActions>
    </Modal>
  </>)
}