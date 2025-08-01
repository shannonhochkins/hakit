import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { type EditorProps, type OnMount } from '@monaco-editor/react';
import { monarchTokens, languageConfiguration } from './languages/jinja2';
import { configureMonacoYaml } from 'monaco-yaml';
import { editor } from 'monaco-editor';
import { useSidebarSizeChange } from '@hooks/useSidebarSizeChange';
import { type CodeField as CodeFieldType } from '@typings/fields';

async function loadMonaco() {
  const MonacoConfig = await import('monaco-editor');
  const { loader, Editor } = await import('@monaco-editor/react');

  // Configure the loader to use the imported Monaco
  loader.config({ monaco: MonacoConfig });

  // Set up the Monaco environment before any editor instances are created
  window.MonacoEnvironment = {
    getWorker(_moduleId, label) {
      // Use dynamic imports instead of new Worker with URLs for better bundler compatibility
      switch (label) {
        case 'css':
          return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url), {
            type: 'module',
          });
        case 'json':
          return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url), {
            type: 'module',
          });
        case 'html':
          return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url), {
            type: 'module',
          });
        case 'javascript':
        case 'typescript':
          return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url), {
            type: 'module',
          });
        case 'yaml': {
          configureMonacoYaml(MonacoConfig, {
            enableSchemaRequest: false,
            schemas: [],
          });
          return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url), {
            type: 'module',
          });
        }
        case 'editorWorkerService':
        default:
          return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url), {
            type: 'module',
          });
      }
    },
  };

  return Editor;
}

interface CodeFieldProps {
  value: string;
  language: CodeFieldType['language'];
  onValidate?: CodeFieldType['onValidate'];
  onChange: (value: string) => void;
}

export const CodeField = ({ value, language = 'css', onChange, onValidate }: CodeFieldProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [Editor, setEditor] = useState<React.FC<EditorProps> | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMonaco().then(Editor => {
      setEditor(Editor);
    });
  }, []);

  // Cleanup timeout on unmount
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
    // make editor as small as possible
    editorRef?.current?.layout({ width: 0, height: 0 });
    // wait for next frame to ensure last layout finished
    window.requestAnimationFrame(() => {
      if (!parentRef.current) return;
      // get the parent dimensions and re-layout the editor
      const rect = parentRef.current.getBoundingClientRect();
      editorRef?.current?.layout({ width: rect.width, height: rect.height });
    });
  });

  const debouncedOnChange = useCallback(
    (value: string) => {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        onChange(value);
      }, 250);
    },
    [onChange]
  );

  const handleOnChange = (value: string | undefined) => {
    if (typeof value !== 'undefined') {
      debouncedOnChange(value);
    }
  };

  // Memoize editor options to prevent re-renders
  const editorOptions: editor.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      automaticLayout: true,
      fixedOverflowWidgets: true,
      lineNumbersMinChars: 2, // default is 5
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'none',
      scrollbar: {
        vertical: 'auto' as const,
        horizontal: 'auto' as const,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
    }),
    []
  );

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

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
      getPosition: () => ({
        preference: monaco.editor.OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER,
      }),
    };

    editor.addOverlayWidget(widget);
  };

  const handleEditorWillMount = (monaco: typeof import('monaco-editor')) => {
    monaco.editor.defineTheme('custom-dark-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0000001A',
      },
    });
  };

  if (!Editor) {
    return <>Loading...</>;
  }
  return (
    <div
      ref={parentRef}
      style={{
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
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
