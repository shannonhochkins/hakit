import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState, lazy } from 'react'
import { getCurrentUser, userQueryOptions } from '../lib/api/user';
import { createDashboard, dashboardsQueryOptions, getDashboardForUser, getDashboardsForUser, getPageConfigurationForUser } from '../lib/api/dashboard';
import { componentsQueryOptions, uploadGithubRepo } from '../lib/api/component';
import { useQuery } from '@tanstack/react-query';
import { Row } from '@hakit/components';
import styled from '@emotion/styled';
import { useEntity } from '@hakit/core';


import { ImageUp } from 'lucide-react';
import { uploadComponent } from '../lib/api/component';
import { Image } from '../lib/components/Image';
import { getAssetForUser } from '../lib/api/asset';


const FileUploadBox = styled.div`
  border: 1px dashed var(--puck-color-azure-05);
  background-color: var(--puck-color-grey-12);
  border-radius: 0.25rem;
  min-height: 100px;
  position: relative;
  overflow: hidden;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--puck-color-grey-03);
  font-weight: 400;
  font-size: 15px;
  span {
    &.link {
      cursor: pointer;
      font-weight: bold;
      text-decoration: underline;
    }
  }
`;

const FileInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
`;

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = useQuery(userQueryOptions);
  const configurations = useQuery(dashboardsQueryOptions);
  const components = useQuery(componentsQueryOptions);
  const [Component, setComponent] = useState(null);
  const [githubUrl, setGithubUrl] = useState('https://github.com/shannonhochkins/hakit-component-test');

  const _getConfigurationsForUser = useCallback(async () => {
    const config = await getDashboardsForUser();
    console.log('config', config);
  }, [])

  const _getPageConfigurationForUser = useCallback(async (dashboardPath: string, pathPath: string) => {
    const dashboard = await getPageConfigurationForUser(dashboardPath, pathPath);
    console.log('dashboard', dashboard);
  }, [])

  const _getDashboardForUser = useCallback(async (dashboardPath: string) => {
    const dashboard = await getDashboardForUser(dashboardPath);
    console.log('dashboard', dashboard);
  }, [])

  const _createConfiguration = useCallback(async () => {
    if (!user.data) return;
    const name = await prompt('Dashboard Name');
    if (!name) return;
    const path = await prompt('Dashboard Path');
    if (!path) return;
    const data = {};
    const config = await createDashboard({
      name,
      path,
      data,
    })
    console.log('new config', config);
  }, [user]);

  // useEffect(() => {
  //   if (components && components.data) {
  //     components.data.components.map((component) => {
  //       const UserComponent = lazy(() => import(`/api/asset/${component.objectKey}`));
  //       setComponent(UserComponent);
  //       console.log('UserComponent', UserComponent);
  //     })
  //   }
  // }, [components])


  // const _getCurrentUser = useCallback(async () => {
  //   const user = await getCurrentUser('1', 'mail@shannonhochkins.com');
  //   console.log('user', user);
  // }, [])

  // const _createUser = useCallback(async () => {
  //   const user = await createUser({value: { email: 'mail@shannonhochkins.com', name: 'Shannon hochkins' }})
  //   console.log('new user', user);
  // }, [])
  return <div>Hello &quot;/&quot;!
    <button onClick={() => getCurrentUser()}>GET USER</button>
    <button onClick={() => _getConfigurationsForUser()}>GET CONFIG</button>
    {configurations.data && configurations.isSuccess && Array.isArray(configurations.data) && configurations.data.map((dashboard) => {
      return <button key={dashboard.id} onClick={() => {
        _getDashboardForUser(dashboard.path);
      }}>{dashboard.name}</button>
    })}
    <button disabled={!user.data} onClick={() => _createConfiguration()}>CREATE CONFIG</button>
    <button onClick={() => fetch('/api/logout')}>LOGOUT</button>
    <a href="/api/login">Login!</a>
    {user.data && <pre>{JSON.stringify(user.data, null, 2)}</pre>}
    {!configurations.error && configurations.data && <pre>{JSON.stringify(configurations.data, null, 2)}</pre>}
    {/* <button onClick={() => _getCurrentUser()}>GET USER</button>
    <button onClick={() => _createUser()}>CREATE USER</button> */}
    {/* {Component && <Component />} */}
    <Row fullWidth gap="1rem">
      <div>
        <FileUploadBox>
          <FileInput type='file' onChange={(e) => {
            uploadComponent(e.target.files);
          }} accept='text/javascript' />
          <ImageUp size={48} />
          <span>
            Drag & drop your image here, or <span className='link'>choose your file</span>
          </span>
        </FileUploadBox>
      </div>
      {components && components.data && <div>
        <pre>{JSON.stringify(components.data, null, 2)}</pre>
      </div>}
      <div>
        <input type="text" value={githubUrl} placeholder="Github url" onChange={e => setGithubUrl(e.target.value)} />
        <button onClick={() => { uploadGithubRepo(githubUrl) }}>Upload From Github</button>
      </div>
    </Row>
  </div>
}
