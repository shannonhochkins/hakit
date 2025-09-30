import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { type EditorProps, type OnMount } from '@monaco-editor/react';
import { monarchTokens, languageConfiguration } from './languages/jinja2';
import { editor } from 'monaco-editor';
import { useSidebarSizeChange } from '@hooks/useSidebarSizeChange';
import { type FieldDefinition } from '@typings/fields';

let editorPromise: Promise<React.FC<import('@monaco-editor/react').EditorProps>> | null = null;
let monacoSetupDone = false;

async function loadMonaco() {
  if (editorPromise) return editorPromise;
  editorPromise = (async () => {
    const MonacoConfig = await import('monaco-editor');
    const { loader, Editor } = await import('@monaco-editor/react');

    if (!monacoSetupDone) {
      loader.config({ monaco: MonacoConfig });
      // @ts-expect-error - MonacoEnvironment is a global
      if (typeof window !== 'undefined' && !window.MonacoEnvironment) {
        // @ts-expect-error - MonacoEnvironment is a global
        window.MonacoEnvironment = {
          getWorker(_moduleId: unknown, label: string) {
            switch (label) {
              case 'css':
                return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url), { type: 'module' });
              case 'json':
                return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url), { type: 'module' });
              case 'html':
                return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url), { type: 'module' });
              case 'javascript':
              case 'typescript':
                return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url), { type: 'module' });
              case 'yaml':
                return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url), { type: 'module' });
              case 'editorWorkerService':
              default:
                return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url), { type: 'module' });
            }
          },
        } as any;
      }
      monacoSetupDone = true;
    }

    return Editor;
  })();
  return editorPromise;
}

export interface MonacoCodeFieldProps {
  value: string;
  language: FieldDefinition['code']['language'];
  onValidate?: FieldDefinition['code']['onValidate'];
  onChange: (value: string) => void;
}

export const MonacoCodeEditor = ({ value, language = 'css', onChange, onValidate }: MonacoCodeFieldProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [Editor, setEditor] = useState<React.FC<EditorProps> | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMonaco().then(Editor => {
      setEditor(Editor);
    });
  }, []);

  useEffect(() => {
    const timeoutRef = debounceTimeoutRef;
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useSidebarSizeChange(() => {
    if (!parentRef.current) return;
    editorRef?.current?.layout({ width: 0, height: 0 });
    window.requestAnimationFrame(() => {
      if (!parentRef.current) return;
      const rect = parentRef.current.getBoundingClientRect();
      editorRef?.current?.layout({ width: rect.width, height: rect.height });
    });
  });

  const debouncedOnChange = useCallback(
    (val: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        onChange(val);
      }, 250);
    },
    [onChange]
  );

  const handleOnChange = (val: string | undefined) => {
    if (typeof val !== 'undefined') {
      debouncedOnChange(val);
    }
  };

  const editorOptions: editor.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      automaticLayout: true,
      fixedOverflowWidgets: true,
      lineNumbersMinChars: 2,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'none',
      scrollbar: { vertical: 'auto', horizontal: 'auto', verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
    }),
    []
  );

  const handleEditorMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;
    ed.focus();
    if (language === 'jinja2') {
      monaco.languages.register({ id: 'jinja2' });
      monaco.languages.setMonarchTokensProvider('jinja2', monarchTokens);
      monaco.languages.setLanguageConfiguration('jinja2', languageConfiguration);
    }

    const widgetId = 'languageBubbleWidget';
    const domNode = document.createElement('div');
    switch (language) {
      case 'css':
        domNode.innerText = 'CSS';
        break;
      case 'javascript':
        domNode.innerText = 'JS';
        break;
      case 'jinja2':
        domNode.innerText = 'Jinja2';
        break;
      case 'json':
        domNode.innerText = 'JSON';
        break;
      case 'yaml':
        domNode.innerText = 'YAML';
        break;
      case 'html':
        domNode.innerText = 'HTML';
        break;
    }
    domNode.style.background = 'var(--color-gray-500)';
    domNode.style.padding = '4px 8px';
    domNode.style.borderRadius = '6px';
    domNode.style.fontSize = '12px';
    domNode.style.fontFamily = 'monospace';
    domNode.style.color = 'var(--color-gray-200)';
    const widget: editor.IOverlayWidget = {
      getId: () => widgetId,
      getDomNode: () => domNode,
      getPosition: () => ({ preference: monaco.editor.OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER }),
    };
    ed.addOverlayWidget(widget);
  };

  const handleEditorWillMount = (monaco: typeof import('monaco-editor')) => {
    monaco.editor.defineTheme('custom-dark-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#0000001A' },
    });
  };

  if (!Editor) {
    return <>Loading editor...</>;
  }
  return (
    <div ref={parentRef} style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Editor
        height='300px'
        width={'100%'}
        value={value}
        theme='custom-dark-theme'
        language={language}
        options={editorOptions}
        onChange={handleOnChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorMount}
        onValidate={onValidate}
      />
    </div>
  );
};
