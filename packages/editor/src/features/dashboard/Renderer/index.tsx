import { Config, Render } from '@measured/puck';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { Spinner } from '@components/Loaders/Spinner';
import { RendererShortcuts } from './RendererShortcuts';

export function Renderer() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const userConfig = useGlobalStore(state => state.userConfig);

  if (!userConfig) {
    return <Spinner absolute text='Loading user data' />;
  }
  if (!puckPageData) {
    return <Spinner absolute text='Loading page data' />;
  }
  return (
    <>
      <RendererShortcuts />
      <Render config={userConfig as Config} data={puckPageData} />
    </>
  );
}
