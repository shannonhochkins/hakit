import { useEffect, useRef } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Puck } from '@measured/puck';
import { Column, Row } from '@hakit/components';
import { SidebarSection } from '../Sidebar';
import { ViewportControls } from '../ViewportControls';
import { PageSelector } from '../PageSelector';
import { Preview } from '../Preview';
import createCache from '@emotion/cache';
import '@measured/puck/puck.css';
import './puck-overrides.css';
import { DashboardSelector } from '../DashboardSelector';
import { Divider } from '@mui/material';
import { Spinner } from '../Spinner';

export function Editor() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const setUnsavedPuckPageData = useGlobalStore(state => state.setUnsavedPuckPageData);
  const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
  const userConfig = useGlobalStore(state => state.userConfig);
  const setEditorMode = useGlobalStore(state => state.setEditorMode);
  const observerRef = useRef<MutationObserver | null>(null);
  const emotionCache = useGlobalStore(state => state.emotionCache);
  
  useEffect(() => {
    setEditorMode(true);
  }, []);

  useEffect(() => {
    const handleIframe = (iframe: HTMLIFrameElement) => {
      const applyCache = () => {
        const head = iframe.contentWindow?.document?.head;
        if (head) {
          setEmotionCache(createCache({
            key: 'hakit-editor',
            container: head,
          }));
        }
      };

      // If already loaded
      if (iframe.contentWindow?.document?.readyState === 'complete') {
        applyCache();
      } else {
        iframe.addEventListener('load', applyCache, { once: true });
      }
    };

    const checkAndBind = () => {
      const iframe = document.querySelector('iframe#preview-frame') as HTMLIFrameElement | null;
      if (iframe) handleIframe(iframe);
    };

    // Initial check
    checkAndBind();

    // Observe DOM changes to catch future iframe insertions
    observerRef.current = new MutationObserver(() => {
      checkAndBind();
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [setEmotionCache]);

  if (!userConfig) {
    return <Spinner absolute text="Loading user data" />;
  }
  if (!puckPageData) {
    return <Spinner absolute text="Loading data" />;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <Puck
        onChange={data => {
          setUnsavedPuckPageData(data);
        }}
        // onAction={action => {
          // if (action.type === 'insert') {
          //   setPanel('options');
          // }
        // }}
        iframe={{
          // this was causing puck to load indefinitely
          waitForStyles: false,
        }}
        overrides={{
          // actionBar: () => {
          //   return <></>;
          // },
        }}
        config={userConfig}
        data={puckPageData}
      >
        <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' className='puck-editor-wrapper'>
          <Row fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px' data-floating-panel-restriction>
            <Column
              fullWidth
              fullHeight
              alignItems='stretch'
              justifyContent='stretch'
              wrap='nowrap'
              gap='0px'
              style={{
                flex: '1 1 0',
                minWidth: 0,
                opacity: emotionCache ? 1 : 0,
              }}
            >
              <Row justifyContent='space-between' alignItems='center' gap='0px' style={{
                padding: '0 var(--puck-space-px)'
              }}>
                <Row gap="0.5rem">
                  <DashboardSelector />
                  <Divider orientation="vertical" variant="middle" flexItem style={{
                    borderColor: 'var(--puck-color-grey-04)',
                    marginLeft: 'var(--puck-space-px)',
                  }} />
                  <PageSelector />
                </Row>
                <ViewportControls />
              </Row>
              <Preview />
            </Column>
            <SidebarSection />
          </Row>
        </Column>
      </Puck>
    </div>
  );
}