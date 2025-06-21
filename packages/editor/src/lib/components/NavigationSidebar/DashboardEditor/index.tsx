
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Repeat, Type } from 'lucide-react';
import { Tooltip } from '@lib/components/Tooltip';
import { Column, Row } from '@hakit/components';
import { PrimaryButton } from '@lib/page/shared/Button';
import { Modal, ModalActions } from '@lib/page/shared/Modal';
import { useQuery } from '@tanstack/react-query';
import { createDashboard, dashboardByPathWithPageDataQueryOptions, dashboardsQueryOptions, deleteDashboard, updateDashboardForUser } from '@lib/api/dashboard';
import { InputField } from '@lib/components/Form/Fields/Input';
import { nameToPath } from '@lib/helpers/routes/nameToPath';
import { usePrevious } from '@lib/hooks/usePrevious';
import { useNavigate } from '@tanstack/react-router';
import { capitalize } from '@mui/material';
import { FieldLabel } from '@lib/components/Form/FieldWrapper/FieldLabel';
import { Confirm } from '@lib/page/shared/Modal/confirm';
import { useIsPageEditMode } from '@lib/hooks/useIsPageEditMode';

export interface DashboardSelectorProps {
  open?: boolean;
  dashboardPath?: string;
  pagePath?: string;
  onClose: () => void;
  mode: 'dashboard-new' | 'dashboard-edit' | 'dashboard-duplicate';
}

export function DashboardEditor({ open = false, mode, dashboardPath, pagePath, onClose }: DashboardSelectorProps) {
  const navigate = useNavigate();
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const [name, setName] = useState<string>('');
  const previousName = usePrevious(name);
  const [path, setPath] = useState<string>(dashboardPath || '');
  const [pathTouched, setPathTouched] = useState(false);
  const [pathError, setPathError] = useState('');
  // get the path param from /editor:/id with tanstack router
  const dashboardQuery = useQuery({
    ...dashboardByPathWithPageDataQueryOptions(dashboardPath),
    enabled: false,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reset = useCallback(() => {
    setName('');
    setPath('');
    setPathTouched(false);
    onClose();
  }, [onClose]);

  const dashboard = useMemo(() => dashboardQuery.data, [dashboardQuery.data]);
  const isPageEditMode = useIsPageEditMode();

  useEffect(() => {
    if (mode === 'dashboard-edit' && dashboard && dashboardPath && !name) {
      setName(dashboard.name);
    }
  }, [dashboardPath, dashboard, mode, name])

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
    <Modal open={open} title={`${capitalize(mode.replace('dashboard-', ''))} Dashboard`} onClose={() => {
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
          <PrimaryButton color="error" onClick={() => {
            setConfirmDelete(true);
          }}>DELETE</PrimaryButton>
          <Confirm
            title='Confirm delete dashboard'
            open={confirmDelete}
            onConfirm={() => {
              return deleteDashboard({
                id: dashboard.id
              }, {
                pending: 'Deleting dashboard',
                success: 'Deleted dashboard',
              })
                .then(() => {
                  setConfirmDelete(false);
                  reset();
                  dashboardsQuery.refetch();
                  // don't reload the data for the current dashboard as it's been deleted
                  const currentDashboard = dashboardPath === dashboard.path;
                  if (!currentDashboard) {
                    dashboardQuery.refetch();
                  } else {
                    // CHECK THIS, seems wrong for dashboard, need to check this
                    navigate({
                      from: `/dashboards/$dashboardPath/$pagePath/edit`,
                      to: `/dashboards/$dashboardPath/$pagePath/edit`,
                      reloadDocument: true,
                      params: {
                        dashboardPath,
                      }
                    });
                  }
                })
                .catch(() => {
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
          <PrimaryButton onClick={reset}>CANCEL</PrimaryButton>
            {(mode === 'dashboard-new' || mode === 'dashboard-duplicate') && (<PrimaryButton disabled={!path || !name || !!pathError} onClick={() => {
              createDashboard({
                ...dashboard,
                name,
                path,
              }, {
                success: 'Created dashboard',
                error(err) {
                  if (err?.includes('unique_user_path')) {
                    return 'Dashboard with this path already exists';
                  }
                  return err;
                }
              }).then((newDashboard) => {
                reset();
                dashboardsQuery.refetch();
                dashboardQuery.refetch();
                navigate({
                  from: `/dashboards/$dashboardPath/$pagePath/edit`,
                  to: `/dashboards/$dashboardPath/$pagePath/edit`,
                  replace: true,
                  params: {
                    dashboardPath: newDashboard.path,
                    pagePath: newDashboard.pages[0].path
                  },
                });
              });
          }}>CREATE</PrimaryButton>)}

          {mode === 'dashboard-edit' && dashboard?.id && (<PrimaryButton disabled={!path || !name || !!pathError} onClick={() => {
              // if the paths match before we update from the original dashboard, and the paths have changed
              // we should update the current path so if the user refreshes it loads the correct dashboard
              const currentDashboard = path !== dashboard.path && dashboardPath === dashboard.path;
              updateDashboardForUser({
                ...dashboard,
                name,
                path,
              }, {
                success: 'Updated dashboard',
                error(err) {
                  if (err?.includes('unique_user_path')) {
                    return 'Dashboard with this path already exists';
                  }
                  return err;
                }
              }).then(() => {
                reset();
                dashboardsQuery.refetch();
                dashboardQuery.refetch();
                // now update the url
                if (currentDashboard) {
                  if (isPageEditMode) {
                    navigate({
                      from: `/dashboards/$dashboardPath/$pagePath/edit`,
                      to: `/dashboards/$dashboardPath/$pagePath/edit`,
                      replace: isPageEditMode,
                      params: {
                        dashboardPath: path,
                        pagePath: isPageEditMode ? pagePath : dashboard?.pages[0].path,
                      },
                    });
                  } else {
                    // if we're not in page edit mode, we should navigate to the dashboard edit page
                    navigate({
                      from: `/dashboards/$dashboardPath/edit`,
                      to: `/dashboards/$dashboardPath/edit`,
                      replace: true,
                      params: {
                        dashboardPath: path,
                      },
                    });
                  }
                }
              });
            }}>SAVE</PrimaryButton>)}
        </Row>
      </ModalActions>
    </Modal>
  </>)
}