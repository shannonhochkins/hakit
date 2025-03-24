import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { getCurrentUser, userQueryOptions } from '../lib/api/user';
import { componentsQueryOptions, uploadGithubRepo } from '../lib/api/component';
import { useQuery } from '@tanstack/react-query';
import { Row } from '@hakit/components';
import styled from '@emotion/styled';
import { ImageUp } from 'lucide-react';
import { uploadComponent } from '../lib/api/component';


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
  const components = useQuery(componentsQueryOptions);
  const [githubUrl, setGithubUrl] = useState('https://github.com/shannonhochkins/hakit-component-test');

  return <div>Hello &quot;/&quot;!
    <button onClick={() => getCurrentUser()}>GET USER</button>
    {user.data && <button onClick={() => fetch('/api/logout')}>LOGOUT</button>}
    {!user.data && <a href="/api/login">Login!</a>}
    {user.data && <pre>{JSON.stringify(user.data, null, 2)}</pre>}
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
