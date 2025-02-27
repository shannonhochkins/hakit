import { Editor } from './Editor';
import { Renderer } from './Renderer';
import { useLocalStorage } from '@editor/hooks/useLocalStorage';
import { useEditMode } from '@editor/hooks/useEditMode';
import { usePageConfigurations } from '@editor/hooks/usePageConfigurations';
import { useEffect, useState } from 'react';
import { type PuckPageData } from '@typings/puck';
import { useGlobalStore } from '@editor/hooks/useGlobalStore';
import { type UserConfig } from '@typings/puck';
import { getPuckConfiguration } from './dynamic-puck-configuration';
import { useHass } from '@hakit/core';
import { usePanel } from '@editor/hooks/usePanel';

export interface EditorAndRendererProps {
  data: PuckPageData;
  onChange?: (data: PuckPageData) => void;
  id: string;
  config: UserConfig;
}

function Page() {
  const [panel, setPanel] = usePanel();
  const { getAllEntities, getServices } = useHass();
  const [error, setError] = useState<string | null>(null);
  const [editMode] = useEditMode();
  const [id, setId] = useLocalStorage<string | null>('id', null);
  const pageConfigurations = usePageConfigurations(id);
  const [data, setData] = useState<PuckPageData | null>(null);
  const [config, setConfig] = useState<UserConfig | null>(null);

  useEffect(() => {
    getPuckConfiguration({
      getAllEntities,
      getAllServices: getServices,
    }).then(config => {
      setConfig(config);
    });
    // - intentionally only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.classList.toggle('edit-mode', editMode);
  }, [editMode]);

  // IMPORTANT - Do not use anything from the store here, as we don't want to re-render the editor every time the data changes
  // as it maintains its own internal store.
  const setPuckPageData = useGlobalStore(state => state.setPuckPageData);
  const setServices = useGlobalStore(state => state.setServices);

  useEffect(() => {
    getServices().then(services => {
      setServices(services);
    });
  }, [getServices, setServices]);

  useEffect(() => {
    if (pageConfigurations.status === 'success') {
      if (error) return;
      let matchedConfiguration = pageConfigurations.response.pageConfigurations.find(page => page.id === id);
      if (!matchedConfiguration && pageConfigurations.response.pageConfigurations.length > 0) {
        // no configuration found with the ID, may have been deleted or from stale data
        matchedConfiguration = pageConfigurations.response.pageConfigurations[0];
      } else if (!matchedConfiguration && pageConfigurations.response.pageConfigurations.length === 0) {
        setError('No configurations found');
      }
      if (matchedConfiguration) {
        setData(matchedConfiguration.config);
        setPuckPageData(matchedConfiguration.config);
        if (id !== matchedConfiguration.id) {
          setId(matchedConfiguration.id);
        }
      } else {
        setError('No configurations found');
      }
    }
  }, [id, error, pageConfigurations, setPuckPageData, setId]);

  if (pageConfigurations.status === 'error' || error) {
    return <div>Error: {error ?? pageConfigurations.error}</div>;
  }

  if (data === null || pageConfigurations.status === 'loading' || !id || !config) {
    return <div>Loading...</div>;
  }
  return (
    <>
      {editMode ? (
        <div
          onClick={() => {
            if (panel === 'background') {
              setPanel('options');
            }
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <Editor
            id={id}
            data={data}
            config={config}
            onChange={_data => {
              setPuckPageData(_data);
            }}
          />
        </div>
      ) : (
        <Renderer id={id} data={data} config={config} />
      )}
    </>
  );
}

export default Page;
