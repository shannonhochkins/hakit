
import { useCallback, useEffect, useState } from 'react';
import { Repeat, Type } from 'lucide-react';
import { Tooltip } from '@lib/components/Tooltip';
import { Column, Row } from '@hakit/components';
import { PrimaryButton } from '@lib/page/shared/Button';
import { Modal, ModalActions } from '@lib/page/shared/Modal';
import { useQuery } from '@tanstack/react-query';
import { createDashboardPage, dashboardByPathWithPageDataQueryOptions, dashboardsQueryOptions, deleteDashboardPage, updateDashboardPageForUser } from '@lib/api/dashboard';
import { InputField } from '@lib/components/Form/Fields/Input';
import { nameToPath } from '@lib/helpers/routes/nameToPath';
import { usePrevious } from '@lib/hooks/usePrevious';
import { useNavigate, useParams } from '@tanstack/react-router';
import { capitalize } from '@mui/material';
import { FieldLabel } from '@lib/components/Form/FieldWrapper/FieldLabel';
import { DashboardPageWithoutData } from '@typings/dashboard';
import { Confirm } from '@lib/page/shared/Modal/confirm';

export interface DashboardPageSelectorProps {
  open?: boolean;
  dashboard: DashboardPageWithoutData;
  page?: DashboardPageWithoutData | null;
  onClose: () => void;
  mode: 'new-page' | 'edit-page' | 'duplicate-page';
}

export function DashboardPageEditor({ open = false, mode, dashboard, page, onClose }: DashboardPageSelectorProps) {
  const navigate = useNavigate();
  const dashboardsQuery = useQuery(dashboardsQueryOptions);
  const [name, setName] = useState<string>(page?.name || '');
  const previousName = usePrevious(name);
  const [path, setPath] = useState<string>(page?.path || '');
  const [pathTouched, setPathTouched] = useState(false);
  const [pathError, setPathError] = useState('');
  const params = useParams({
    from: '/_authenticated/dashboard/$dashboardPath/$pagePath/edit'
  });
  // get the path param from /editor:/id with tanstack router
  const dashboardQuery = useQuery(dashboardByPathWithPageDataQueryOptions(params.dashboardPath));
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
    <Modal open={open} title={`${capitalize(mode)} Page`} onClose={() => {
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
            helperText={'Enter a name for your page'}
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
            helperText={pathError || 'Enter a path for your page'}
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
        {page?.id && <>
          <PrimaryButton color="error" variant="contained" onClick={() => {
            setConfirmDelete(true);
          }}>DELETE</PrimaryButton>
          <Confirm
            title='Confirm delete page'
            open={confirmDelete}
            onConfirm={() => {
              return deleteDashboardPage({
                id: dashboard.id,
                pageId: page.id,
              }, {
                pending: 'Deleting page',
                success: 'Deleted page',
              })
                .then(() => {
                  setConfirmDelete(false);
                  reset();
                  dashboardsQuery.refetch();
                  dashboardQuery.refetch();
                })
                .catch(() => {
                  setConfirmDelete(false);
                });
            }}
            onCancel={() => {
              setConfirmDelete(false);
            }}
          >
            <p>Are you sure you want to remove this page?</p>
          </Confirm>
        </>}
        <Row gap="1rem">
          <PrimaryButton onClick={reset}>CANCEL</PrimaryButton>
            {(mode === 'new-page' || mode === 'duplicate-page') && (<PrimaryButton variant="contained" disabled={!path || !name || !!pathError} onClick={() => {
              createDashboardPage({
                id: dashboard?.id,
                name,
                path,
              }, {
                success: 'Created page',
                error(err) {
                  if (err?.includes('unique_dashboard_page_path')) {
                    return 'Page with this path already exists';
                  }
                  return err;
                }
              }).then(() => {
                reset();
                dashboardsQuery.refetch();
                dashboardQuery.refetch();
              });
          }}>CREATE</PrimaryButton>)}

          {mode === 'edit-page' && page?.id && (<PrimaryButton variant="contained" disabled={!path || !name || !!pathError} onClick={() => {
              // if the paths match before we update from the original page, and the paths have changed
              // we should update the current path so if the user refreshes it loads the correct page
              const currentDashboard = path !== page.path && params.pagePath === page.path;
              updateDashboardPageForUser(dashboard.id, {
                ...page,
                name,
                path,
              }, {
                success: 'Updated dashboard',
                error(err) {
                  if (err?.includes('unique_dashboard_page_path')) {
                    return 'Page with this path already exists';
                  }
                  return err;
                }
              }).then(() => {
                reset();
                dashboardsQuery.refetch();
                dashboardQuery.refetch();
                // now update the url
                if (currentDashboard) {
                  navigate({
                    from: `/me/$dashboardPath/$pagePath/edit`,
                    to: `/me/$dashboardPath/$pagePath/edit`,
                    replace: true,
                    params: {
                      dashboardPath: params.dashboardPath,
                      pagePath: path
                    },
                  });
                }
              });
              }}>SAVE</PrimaryButton>)}
        </Row>
      </ModalActions>
    </Modal>
  </>)
}