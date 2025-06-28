import { Render } from '@measured/puck';
import { useEffect } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Spinner } from '@lib/components/Spinner';

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
      <Render config={userConfig} data={puckPageData} />
    </>
  );
}
