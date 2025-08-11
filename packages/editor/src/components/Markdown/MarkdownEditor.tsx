import { uploadImage } from '@services/upload';
import MDEditor, { EditorContext, ICommand, MDEditorProps, commands } from '@uiw/react-md-editor';
import {
  Bold,
  ImageIcon,
  List,
  Code,
  Fullscreen,
  Italic,
  Strikethrough,
  Quote,
  Link,
  Table,
  ListCheck,
  SquareChartGantt,
  SquareChevronRight,
} from 'lucide-react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import rehypeSanitize from 'rehype-sanitize';

const buttonProps = {
  style: {
    height: 'auto',
  },
} as const;

const imageCommand: ICommand = {
  name: 'imageUpload',
  keyCommand: 'imageUpload',
  buttonProps,
  icon: <ImageIcon size={20} />,
  execute: async (_state, api) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        try {
          const res = await uploadImage(input.files);
          const url = res?.filePath;
          if (url) {
            const insertText = `![image](${url})`;
            api.replaceSelection(insertText);
          } else {
            toast.error('Failed to upload image. Please try again.', {
              theme: 'dark',
            });
          }
        } catch {
          toast.error('Failed to upload image. Please try again.', {
            theme: 'dark',
          });
        }
      };
      input.click();
    } catch {
      // ignore
    }
  },
};

const CodePreviewToggle = () => {
  const { preview, dispatch } = useContext(EditorContext);
  const click = () => {
    dispatch?.({
      preview: preview === 'edit' ? 'preview' : 'edit',
    });
  };
  if (preview === 'edit') {
    return <SquareChevronRight size={20} onClick={click} />;
  }
  return <SquareChartGantt size={20} onClick={click} />;
};

export function MarkdownEditor({ value, onChange, ...props }: MDEditorProps) {
  const [preview, setPreview] = useState<'edit' | 'preview'>('edit');

  return (
    <MDEditor
      hideToolbar={false}
      commands={[
        imageCommand,
        commands.divider,
        { ...commands.bold, buttonProps, icon: <Bold size={20} /> },
        { ...commands.italic, buttonProps, icon: <Italic size={20} /> },
        { ...commands.strikethrough, buttonProps, icon: <Strikethrough size={20} /> },
        commands.divider,
        { ...commands.unorderedListCommand, buttonProps, icon: <List size={20} /> },
        { ...commands.orderedListCommand, buttonProps, icon: <List size={20} /> },
        { ...commands.checkedListCommand, buttonProps, icon: <ListCheck size={20} /> },
        commands.divider,
        { ...commands.link, buttonProps, icon: <Link size={20} /> },
        { ...commands.quote, buttonProps, icon: <Quote size={20} /> },
        { ...commands.codeBlock, buttonProps, icon: <Code size={20} /> },
        { ...commands.table, buttonProps, icon: <Table size={20} /> },
      ]}
      extraCommands={[
        {
          keyCommand: 'preview',
          value: 'preview',
          name: 'preview',
          buttonProps,
          icon: <CodePreviewToggle />,
          execute() {
            setPreview(preview === 'edit' ? 'preview' : 'edit');
          },
        },
        { ...commands.fullscreen, buttonProps, icon: <Fullscreen size={20} /> },
      ]}
      enableScroll
      minHeight={160}
      preview={preview}
      style={{ width: '100%', background: 'var(--color-surface-inset)' }}
      onChange={(value, event) => {
        console.log('event', event);
        return onChange && onChange(value);
      }}
      value={value}
      previewOptions={{
        style: {
          background: 'transparent',
        },
        rehypePlugins: [[rehypeSanitize]],
      }}
      {...props}
    />
  );
}
