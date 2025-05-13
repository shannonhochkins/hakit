import { useNavigate, useParams } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { Column, Row } from '@hakit/components';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { SelectField } from '@lib/components/Form/Fields/Select';
import { InputField } from '@lib/components/Form/Fields/Input';
import { CirclePlus, Type, Layers } from 'lucide-react';
import { Modal, ModalActions } from '@lib/components/Modal';
import { Button } from '@lib/components/Button';
import { createDashboardPage } from '@client/src/lib/api/dashboard';
import { nameToPath } from '@lib/helpers/routes/nameToPath';
import { usePrevious } from '@lib/hooks/usePrevious';
import { FieldLabel } from '../Form/FieldWrapper/FieldLabel';


export function PageSelector() {
  const [newPageOpen, setOpenNewPage] =  useState(false);
  const dashboard = useGlobalStore(state => state.dashboard);
  const params = useParams({
    from: "/_authenticated/dashboards/$dashboardPath/$pagePath/edit"
  });
  const navigate = useNavigate();
  console.log('params', params);
  const pages = dashboard?.pages.map(page => ({
    id: page.id,
    title: page.name,
    path: page.path,
  })) || [];
  const value = pages.find(page => page.path === params.pagePath) || pages[0];
  const [name, setName] = useState<string>('');
  const [path, setPath] = useState<string>('');
  const previousName = usePrevious(name);
  const [pathTouched, setPathTouched] = useState(false);
  const [pathError, setPathError] = useState('');

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
  }, [previousName, name, path, pathTouched]);

    // Path validation
  useEffect(() => {
    const valid = /^[a-z0-9-]+$/.test(path);
    setPathError(valid || path.length === 0 ? '' : 'Only lowercase letters, numbers and dashes allowed');
  }, [path]);

  return <Row style={{
    maxWidth: '100%',
  }}>
    <SelectField
      value={value}
      options={[...pages, {
        id: 'new',
        title: 'Customize',
        path: '__new__'
      }]}
      startAdornment={<Layers size={36} style={{
        marginRight: '0.5rem',
      }} />}
      getOptionLabel={(option) => option.id === 'new' ? <Row gap="0.5rem" fullHeight>
        <CirclePlus size={16} />
        New Page
      </Row> : option.title}
      getOptionValue={(option) => option.path}
      onChange={(event) => {
        const value = event?.target.value;
        if (typeof value === 'string' || value.id === 'new') {
          // empty value, consider we've hit the "edit" option
          setOpenNewPage(true);
        } else {
          navigate({
            to: '/dashboards/$dashboardPath/$pagePath/edit',
            // quickest pathway forward to load new data
            reloadDocument: true,
            params: {
              dashboardPath: params.dashboardPath,
              pagePath: value.path
            }
          })
        }
      }}
    />
    <Modal open={newPageOpen} title="New Page" onClose={() => {
      setOpenNewPage(false);
    }}>
      <Column gap="1rem" fullWidth alignItems='stretch' justifyContent='flex-start'>
        <div>
          <FieldLabel label="Name" icon={<Type size={16} />} />
          <InputField
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
            helperText={pathError || 'Enter a path for your dashboard'}
            type="text"
            onChange={event => {
              const val = event.target.value;
              setPath(val);
              setPathTouched(true);
            }} />
        </div>
      </Column>
      <ModalActions>
        <Button disabled={!path || !name || !dashboard || !!pathError} onClick={() => {
          if (dashboard) {
            createDashboardPage({
              id: dashboard.id,
              name,
              path,
            }).then(() => {
              setPathTouched(false);
              // TODO handle error
              // TODO handle duplicate path
              navigate({
                to: '/dashboards/$dashboardPath/$pagePath/edit',
                // quickest pathway forward to load new data
                reloadDocument: true,
                params: {
                  dashboardPath: params.dashboardPath,
                  pagePath: path
                }
              })
            })
          }
        }}>CREATE</Button>
      </ModalActions>
    </Modal>
  </Row>
}