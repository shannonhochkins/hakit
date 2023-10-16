import { useCallback } from 'react';
import { useWriteFile } from './';
import { Config, PageWidget, useHakitStore } from '@client/store';
import { CONFIGURATION_FILENAME } from '@client/store/constants';
import { toast } from 'react-toastify';

function updateWidgets(widgets: PageWidget[]) {
  return widgets.map(widget => {
    delete widget.layout.isResizable;
    delete widget.layout.isDraggable;
    delete widget.layout.isBounded;
    delete widget.layout.moved;
    delete widget.layout.minW;
    delete widget.layout.maxW;
    delete widget.layout.resizeHandles;
    // @ts-expect-error - this could exist, ignore it.
    delete widget.layout.i;
    if (widget.widgets) {
      widget.widgets = updateWidgets(widget.widgets);
    }
    return widget;
  });
}

function sanitizeConfiguration(config: Config) {
  // TODO - validate with zod schema
  const clone = { ...config };
  clone.views.map(view => {
    view.pages.map(page => {
      const newWidgets = updateWidgets(page.widgets);
      return {
        ...page,
        widgets: newWidgets
      }
    })
  })
  return clone;
}

export function useSaveConfiguration() {
  const writeFile = useWriteFile();
  const getConfig = useHakitStore(state => state.getConfig);
  const setSaving = useHakitStore(state => state.setSaving);
  
  return useCallback(async () => {
      try {
        setSaving(true);
        const config = getConfig();
        // sanitize the configuration, there's properties that are added automatically
        // to the layout properties of each widget, these don't need to be saved as they're controlled automatically
        await writeFile({
          content: JSON.stringify(sanitizeConfiguration(config), null, 2),
          filename: CONFIGURATION_FILENAME
        });
        toast.success('Successfully saved');
        setSaving(false);
      } catch (e) {
        toast.error('Oops! Something went wrong');
        console.error('Save configuration error:', e);
      }
  }, [writeFile, setSaving, getConfig]);
}