/* eslint-disable react-hooks/rules-of-hooks */
import { ThemeProvider as InternalThemeProvider } from '@hakit/components';
import { useEditMode } from '@editor/hooks/useEditMode';
import { useHass } from '@hakit/core';
import { useEffect, useMemo, useRef } from 'react';
import { usePuckFrame } from '@editor/hooks/usePuckFrame';
import { createComponent } from '@editor/components';
import { useViewports, toBreakpoints } from '@editor/hooks/useViewports';
import { usePuckData } from '@editor/hooks/usePuckData';

const component = createComponent({
  label: 'ThemeProvider',
  category: 'other',
  fields: {},
  withSizeOptions: false,
  permissions: { delete: false, drag: false, duplicate: false, edit: false, insert: false },
  render() {
    const { useStore } = useHass();
    const hasSetWindowContext = useRef(false);
    const setWindowContext = useStore(store => store.setWindowContext);
    const windowContext = useStore(store => store.windowContext);
    const [editMode] = useEditMode();
    const puckIframe = usePuckFrame();
    const container = editMode ? puckIframe : document.head;
    const viewports = useViewports();
    const breakpoints = useMemo(() => toBreakpoints(viewports), [viewports]);
    const puckData = usePuckData();

    useEffect(() => {
      const newWindowContext = (container as HTMLIFrameElement).contentWindow as Window;
      if (editMode && windowContext !== newWindowContext && hasSetWindowContext.current === false) {
        hasSetWindowContext.current = true;
        setWindowContext(newWindowContext);
      }
    }, [container, editMode, windowContext, setWindowContext]);

    useEffect(() => {
      return () => {
        setWindowContext(window);
        hasSetWindowContext.current = false;
      };
    }, [setWindowContext]);

    if (!container) {
      return <></>;
    }
    if (editMode && !hasSetWindowContext.current) {
      return <></>;
    }
    return (
      <InternalThemeProvider
        breakpoints={breakpoints}
        hue={puckData.root.props?.theme?.hue}
        saturation={puckData.root.props?.theme?.saturation}
        lightness={puckData.root.props?.theme?.lightness}
        contrastThreshold={puckData.root.props?.theme?.contrastThreshold}
        tint={puckData.root.props?.theme?.tint}
        darkMode={puckData.root.props?.theme?.darkMode}
        globalStyles={`
        --ha-hide-body-overflow-y: hidden;
      `}
      />
    );
  },
});

export default component;
