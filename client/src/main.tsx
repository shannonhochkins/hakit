import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TrpcWrapper } from './App';
import { Renderer } from './components/Renderer';
import { Header } from './components/Header';
import { HassConnect } from '@hakit/core';
import { useHakitStore, Config } from './store';
import { DEFAULT_CONFIG } from './store/config';
import { CONFIGURATION_FILENAME } from './store/constants';
import { useReadFile } from './hooks';
import { merge } from 'lodash';
interface PreloadConfigurationProps {
  children: React.ReactNode;
}

function PreloadConfiguration({ children }: PreloadConfigurationProps) {
  const requested = useRef(false);
  const [ready, setReady] = useState(false);
  const setConfig = useHakitStore(store => store.setConfig);
  const readFile = useReadFile();

  useEffect(() => {
    if (requested.current) return;
    void(async () => {
      try {
        const response = await readFile(CONFIGURATION_FILENAME);
        requested.current = true;
        setReady(true);
        if (response.status) {
          try {
            const config = JSON.parse(response.contents) as Config[];
            setConfig(merge(DEFAULT_CONFIG, config));
          } catch (e) {
            alert('malformed configuration object');
          }
        }
      } catch (e) {
        requested.current = true;
        setReady(true);
      }
    })();
  }, [readFile, setConfig]);

  return (
    <>
      {ready ? children : null}
    </>
  );

}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HassConnect hassUrl="https://rwdwrtzkr59smlxgb934b72q647a3zr1.ui.nabu.casa">
      <TrpcWrapper>
        <PreloadConfiguration>
          <Header />
          <Renderer />
        </PreloadConfiguration>
      </TrpcWrapper>
    </HassConnect>
  </React.StrictMode>
);
