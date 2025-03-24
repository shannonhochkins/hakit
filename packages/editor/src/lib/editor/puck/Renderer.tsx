import { Render } from '@measured/puck';
import { useEffect } from 'react';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';

export function Renderer() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const userConfig = useGlobalStore(state => state.userConfig);
  useEffect(() => {
    document.body.classList.remove('edit-mode');
  }, []);
  if (!userConfig) {
    return <div>Loading user config...</div>;
  }
  if (!puckPageData) {
    return <div>Loading puck page data</div>;
  }
  return (
    <>
      <Render config={userConfig} data={puckPageData} />
    </>
  );
}
