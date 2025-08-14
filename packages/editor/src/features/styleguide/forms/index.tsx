import { Puck } from '@measured/puck';
import { config, data } from './config';
import { config as standardConfig, data as standardData } from './standard';
import { createPuckOverridesPlugin } from '@features/dashboard/Editor/PuckOverrides/Plugins/overrides';
import { createEmotionCachePlugin } from '@features/dashboard/Editor/PuckOverrides/Plugins/emotionCache';
import { RightSidebar } from '@features/dashboard/Editor/PuckLayout/RightSidebar';
import { Row } from '@hakit/components';
import { css, Global } from '@emotion/react';
//

const overridesPlugin = createPuckOverridesPlugin();
const emotionCachePlugin = createEmotionCachePlugin();

export function StyleguideForms() {
  return (
    <Puck
      config={standardConfig}
      data={standardData}
      iframe={{
        // this was causing puck to load indefinitely
        waitForStyles: false,
      }}
      plugins={[overridesPlugin, emotionCachePlugin]}
      dnd={{
        disableAutoScroll: false,
      }}
      onChange={data => {
        console.log('data', data);
      }}
    >
      <Global
        styles={css`
          .Puck > *:not(#puck-portal-root) {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
        `}
      />
      <Row fullWidth fullHeight wrap='nowrap'>
        <Puck.Components />
        <Puck.Preview />
        <Row
          style={{
            height: '100%',
            width: '400px',
          }}
        >
          <RightSidebar onToggle={() => {}} />
          {/* <Puck.Fields /> */}
        </Row>
      </Row>
    </Puck>
  );
}
