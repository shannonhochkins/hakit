import { useNavigate, useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Column, Row, type BreakPoint, getBreakpoints } from '@hakit/components';
import styled from '@emotion/styled';
import { getCssVariableValue, setSidebarWidth } from '../Sidebar/helpers';
import { Tooltip } from '../Tooltip';
import { useActiveBreakpoint } from '@lib/hooks/useActiveBreakpoint';
import { useThemeStore } from '@hakit/components';
import { DEFAULT_BREAKPOINTS } from '@lib/constants';
import { BreakpointItem } from '@typings/breakpoints';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { SelectField } from '@lib/components/Form/Fields/Select';
import { InputField } from '@lib/components/Form/Fields/Input';
import { SwitchField } from '@lib/components/Form/Fields/Switch';
import { CircleHelp, Edit } from 'lucide-react';
import { Modal, ModalActions } from '@lib/components/Modal';
import { breakpointItemToBreakPoints } from '@lib/helpers/breakpoints';
import { Button } from '@lib/components/Button';
import { createDashboardPage } from '@client/src/lib/api/dashboard';


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
  return <Row gap="1rem">
    Page:
    <SelectField
      value={value}
      options={[...pages, {
        id: 'new',
        title: 'Customize',
        path: '__new__'
      }]}
      getOptionLabel={(option) => option.id === 'new' ? <Row gap="0.5rem" fullHeight>
        <Edit size={16} />
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
      <Column gap="1rem" fullWidth>
        <InputField
          style={{
            width: '100%',
          }}
          helperText={'Enter a name for your page'}
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
          helperText={`Enter a path for your page`}
          label="Path"
          type="text"
          onChange={event => {
            const val = event.target.value;
            setPath(val);
          }} />
      </Column>
      <ModalActions>
        <Button disabled={!path || !name || !dashboard} onClick={() => {
          if (dashboard) {
            createDashboardPage({
              id: dashboard.id,
              name,
              path,
            }).then(() => {
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
          
        }}>APPLY</Button>
      </ModalActions>
    </Modal>
  </Row>
}