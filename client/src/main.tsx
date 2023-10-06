import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TrpcWrapper } from './App';
import { Renderer } from './components/Renderer';
import { Header } from './components/Header';
import { HassConnect } from '@hakit/core';
import { useHakitStore, PageConfig } from './store';
import { DEFAULT_PAGE_CONFIG } from './store/pages';
import { CONFIGURATION_FILENAME } from './store/constants';
import { useReadFile } from './hooks';
import { merge } from 'lodash';
interface PreloadConfigurationProps {
  children: React.ReactNode;
}

function PreloadConfiguration({ children }: PreloadConfigurationProps) {
  const requested = useRef(false);
  const [ready, setReady] = useState(false);
  const setPages = useHakitStore(store => store.setPages);
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
            const config = JSON.parse(response.contents) as PageConfig[];
            setPages(merge(DEFAULT_PAGE_CONFIG, config));
          } catch (e) {
            alert('malformed configuration object');
          }
        }
      } catch (e) {
        requested.current = true;
        setReady(true);
      }
    })();
  }, [readFile, setPages]);

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
