import { Config, Render } from '@measured/puck';
import { useEffect } from 'react';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { Spinner } from '@components/Spinner';

export function Renderer() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const userConfig = useGlobalStore(state => state.userConfig);
  useEffect(() => {
    document.body.classList.remove('edit-mode');
  }, []);
  if (!userConfig) {
    return <Spinner absolute text='Loading user data' />;
  }
  if (!puckPageData) {
    return <Spinner absolute text='Loading page data' />;
  }
  return (
    <>
      <Render config={userConfig as Config} data={puckPageData} />
    </>
  );
}
