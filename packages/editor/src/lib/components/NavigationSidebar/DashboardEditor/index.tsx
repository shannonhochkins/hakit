
import { useCallback, useEffect, useState } from 'react';
import { Repeat, Type } from 'lucide-react';
import { Tooltip } from '@lib/components/Tooltip';
import { Column, Row } from '@hakit/components';
import { Button } from '@lib/components/Button';
import { Modal, ModalActions } from '@lib/components/Modal';
import { useQuery } from '@tanstack/react-query';
import { createDashboard, dashboardsQueryOptions, deleteDashboard, updateDashboardForUser } from '@lib/api/dashboard';
import { InputField } from '@lib/components/Form/Fields/Input';
import { nameToPath } from '@lib/helpers/routes/nameToPath';
import { usePrevious } from '@lib/hooks/usePrevious';
import { useNavigate, useParams } from '@tanstack/react-router';
import { capitalize } from '@mui/material';
import { FieldLabel } from '@lib/components/Form/FieldWrapper/FieldLabel';
import { DashboardPageWithoutData } from '@typings/dashboard';
import { Confirm } from '@lib/components/Modal/confirm';

interface DashboardSelectorProps {
  open?: boolean;
  dashboard?: DashboardPageWithoutData | null;
  onClose: () => void;
  mode: 'new' | 'edit' | 'duplicate';
}

export function DashboardEditor({ open = false, mode, dashboard, onClose }: DashboardSelectorProps) {
  const navigate = useNavigate();
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const [name, setName] = useState<string>(dashboard?.name || '');
  const previousName = usePrevious(name);
  const [path, setPath] = useState<string>(dashboard?.path || '');
  const [pathTouched, setPathTouched] = useState(false);
  const [pathError, setPathError] = useState('');
  const params = useParams({
    from: '/_authenticated/dashboards/$dashboardPath/$pagePath/edit'
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reset = useCallback(() => {
    setName('');
    setPath('');
    setPathTouched(false);
    onClose();
  }, [onClose]);

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
    if (path.length > 50) {
      setPathError('Path must be less than 50 characters');
      return;
    }
    const valid = /^[a-z0-9-]+$/.test(path);
    setPathError(valid || path.length === 0 ? '' : 'Only lowercase letters, numbers and dashes allowed');
  }, [path]);

  return (<>
    <Modal open={open} title={`${capitalize(mode)} Dashboard`} onClose={() => {
      onClose();
    }}>
      <Column gap="1rem" fullWidth alignItems='stretch' justifyContent='flex-start'>
        <div>
          <FieldLabel label="Name" icon={<Type size={16} />} />
          <InputField
            autoFocus
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
      </Column>
      <ModalActions wrap="nowrap" fullWidth alignItems='center' justifyContent='space-between'>
        {dashboard?.id && <>
          <Button color="error" variant="contained" onClick={() => {
            setConfirmDelete(true);
          }}>DELETE</Button>
          <Confirm
            title='Confirm delete dashboard'
            open={confirmDelete}
            onConfirm={() => {
              return deleteDashboard({
                id: dashboard.id
              }, {
                success: 'Deleted dashboard',
              })
                .then(() => {
                  setConfirmDelete(false);
                  reset();
                  dashboardsQuery.refetch();
                })
                .catch(() => {
                  // TODO - handle error
                  setConfirmDelete(false);
                });
            }}
            onCancel={() => {
              setConfirmDelete(false);
            }}
          >
            <p>Are you sure you want to remove this dashboard?</p>
          </Confirm>
        </>}
        <Row gap="1rem">
          <Button onClick={reset}>CANCEL</Button>
            {(mode === 'new' || mode === 'duplicate') && (<Button variant="contained" disabled={!path || !name || !!pathError} onClick={() => {
              createDashboard({
                ...dashboard,
                name,
                path,
              }).then(() => {
                reset();
                dashboardsQuery.refetch();
              }).catch(() => {
                // TODO - handle error
              });
          }}>CREATE</Button>)}

          {mode === 'edit' && dashboard?.id && (<Button variant="contained" disabled={!path || !name || !!pathError} onClick={() => {
              // if the paths match before we update from the original dashboard, and the paths have changed
              // we should update the current path so if the user refreshes it loads the correct dashboard
              const currentDashboard = path !== dashboard.path && params.dashboardPath === dashboard.path;
              updateDashboardForUser({
                ...dashboard,
                name,
                path,
              }).then(() => {
                reset();
                dashboardsQuery.refetch();
                // now update the url
                if (currentDashboard) {
                  navigate({
                    from: `/dashboards/$dashboardPath/$pagePath/edit`,
                    to: `/dashboards/$dashboardPath/$pagePath/edit`,
                    replace: true,
                    params: {
                      dashboardPath: path,
                      pagePath: params.pagePath
                    },
                  });
                }
              }).catch(() => {
                // TODO - handle error
              })
              }}>SAVE</Button>)}
        </Row>
      </ModalActions>
    </Modal>
  </>)
}