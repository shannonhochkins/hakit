import { useEffect, useRef, useState } from 'react';
import { type EditorProps, type OnMount } from '@monaco-editor/react';
import { CodeField as CodeFieldType } from '../../../../../routes/_authenticated/dashboard/$dashboardPath/$pagePath/-components/PreloadPuck/helpers/createCustomField';
import { monarchTokens, languageConfiguration } from './languages/jinja2';
import { configureMonacoYaml } from 'monaco-yaml';
import { editor } from 'monaco-editor';
import { useSidebarSizeChange } from '@lib/hooks/useSidebarSizeChange';

async function loadMonaco() {
  const MonacoConfig = await import('monaco-editor');
  const { loader, Editor } = await import('@monaco-editor/react');
  loader.config({ monaco: MonacoConfig });

  window.MonacoEnvironment = {
    getWorker(_moduleId, label) {
      switch (label) {
        case 'json':
          return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url));
        case 'html':
          return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url));
        case 'javascript':
        case 'typescript':
          return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url));
        case 'yaml': {
          configureMonacoYaml(MonacoConfig, {
            enableSchemaRequest: false,
            schemas: [],
          });
          return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url)); // YAML uses JSON worker usually
        }
        case 'editorWorkerService':
          return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
        default:
          throw new Error(`Unknown label ${label}`);
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

  useEffect(() => {
    loadMonaco().then(Editor => {
      setEditor(Editor);
    });
  }, []);
  // simple hack to get the color value from the css variable
  const getCssVariable = (variableName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  };

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

  const handleEditorMount: OnMount = (editor, monaco) => {
    editor.focus();
    editorRef.current = editor;
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
        'editor.background': getCssVariable('--color-gray-950'),
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
        defaultValue={value}
        theme='custom-dark-theme'
        language={language}
        options={{
          automaticLayout: true,
          fixedOverflowWidgets: true,
          lineNumbersMinChars: 2, // default is 5
          minimap: { enabled: false },
        }}
        onChange={value => {
          if (value) {
            onChange(value);
          }
        }}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorMount}
        onValidate={onValidate}
      />
    </div>
  );
};
