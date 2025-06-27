import { memo, useEffect, useRef } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { Config, Puck } from '@measured/puck';
import { Column, Row } from '@hakit/components';
import { OptionsSidebar } from '../../../components/OptionsSidebar';
import { ViewportControls } from '../../../components/ViewportControls';
import { PageSelector } from '../../../components/PageSelector';
import { Preview } from '../../../components/Preview';
import createCache from '@emotion/cache';
// import './puck-overrides.css';
import { DashboardSelector } from '../../../components/DashboardSelector';
import { Divider } from '@mui/material';
import { Spinner } from '../../../components/Spinner';
import { NavigationSidebar } from '../../../components/NavigationSidebar';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { createEmotionCachePlugin } from './PuckOverrides/Plugins/emotionCache';
import { createPuckOverridesPlugin } from './PuckOverrides/Plugins/overrides';




const MyPlugin = {
  overrides: {
    // eslint-disable-next-line react/display-name
    components: memo(({ children }) => (
      <div style={{ backgroundColor: "hotpink" }}>{children}</div>
    )),
  },
};

const emotionCachePlugin = createEmotionCachePlugin('hakit');
const overridesPlugin = createPuckOverridesPlugin();


export function Editor() {
  const puckPageData = useGlobalStore(state => state.puckPageData);
  const setUnsavedPuckPageData = useGlobalStore(state => state.setUnsavedPuckPageData);
  // const setEmotionCache = useGlobalStore(state => state.setEmotionCache);
  const userConfig = useGlobalStore(state => state.userConfig);
  const setEditorMode = useGlobalStore(state => state.setEditorMode);
  // const observerRef = useRef<MutationObserver | null>(null);
  const emotionCache = useGlobalStore(state => state.emotionCache);
  
  useEffect(() => {
    setEditorMode(true);
  }, [setEditorMode]);

  // useEffect(() => {
  //   const handleIframe = (iframe: HTMLIFrameElement) => {
  //     const applyCache = () => {
  //       const head = iframe.contentWindow?.document?.head;
  //       if (head) {
  //         setEmotionCache(createCache({
  //           key: 'hakit-editor',
  //           container: head,
  //         }));
  //       }
  //     };

  //     // If already loaded
  //     if (iframe.contentWindow?.document?.readyState === 'complete') {
  //       applyCache();
  //     } else {
  //       iframe.addEventListener('load', applyCache, { once: true });
  //     }
  //   };

  //   const checkAndBind = () => {
  //     const iframe = document.querySelector('iframe#preview-frame') as HTMLIFrameElement | null;
  //     if (iframe) handleIframe(iframe);
  //   };

  //   // Initial check
  //   checkAndBind();

  //   // Observe DOM changes to catch future iframe insertions
  //   observerRef.current = new MutationObserver(() => {
  //     checkAndBind();
  //   });

  //   observerRef.current.observe(document.body, {
  //     childList: true,
  //     subtree: true,
  //   });

  //   return () => {
  //     observerRef.current?.disconnect();
  //   };
  // }, [setEmotionCache]);

  if (!userConfig) {
    return <Spinner absolute text="Loading user data" />;
  }
  if (!puckPageData) {
    return <Spinner absolute text="Loading page data" />;
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
        plugins={[emotionCachePlugin, overridesPlugin]}
        // overrides={{
          // componentItem: ({ name }) => <div>asdf{name}</div>,
          // actionBar: () => {
          //   return <></>;
          // },
        // }}
        dnd={{
          disableAutoScroll: false,
        }}
        config={userConfig as Config}
        data={puckPageData}
      >
        <Header />
        <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' className='puck-editor-wrapper'>
          <Row fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' gap='0px' style={{
            flex: '1 1 0',
            minWidth: 0,
            opacity: emotionCache ? 1 : 0,
          }}>
            <LeftSidebar />
            <Preview />
            <RightSidebar />
          </Row>
        </Column>
        {/* <Column fullWidth fullHeight alignItems='stretch' justifyContent='stretch' wrap='nowrap' className='puck-editor-wrapper'>
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
                padding: '0 var(--space-4)'
              }}>
                <Row gap="0.5rem">
                  <Divider orientation="vertical" variant="middle" flexItem style={{
                    borderColor: 'var(--puck-color-grey-04)',
                    marginLeft: 'var(--space-4)',
                  }} />
                  <PageSelector />
                </Row>
                <ViewportControls />
              </Row>
              <Preview />
            </Column>
            <OptionsSidebar />
          </Row>
        </Column> */}
      </Puck>
    </div>
  );
}


                  {/* <NavigationSidebar />
                  <DashboardSelector /> */}