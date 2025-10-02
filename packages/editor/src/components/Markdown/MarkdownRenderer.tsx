import MDEditor from '@uiw/react-md-editor';
import type { MarkdownPreviewProps } from '@uiw/react-markdown-preview';
import styles from './MarkdownRenderer.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('MarkdownRenderer', styles);

type MarkdownRendererProps = {
  children?: string | undefined;
  options?: Pick<MarkdownPreviewProps, 'components' | 'rehypePlugins' | 'remarkPlugins'>;
};

export function MarkdownRenderer({ children, options }: MarkdownRendererProps) {
  if (!children) return null;
  return (
    <div className={getClassName({ MarkdownRenderer: true })}>
      <MDEditor.Markdown
        source={children}
        style={{
          background: 'transparent',
        }}
        components={{
          img: props => (
            <span
              className='markdown-image-wrapper'
              onClick={() => {
                // open image in new tab
                // eslint-disable-next-line react/prop-types
                if ('src' in props) window.open(props.src, '_blank');
              }}
            >
              <img {...props} />
            </span>
          ),
          ...(options?.components || {}),
        }}
        rehypePlugins={options?.rehypePlugins}
        remarkPlugins={options?.remarkPlugins}
      />
    </div>
  );
}

export default MarkdownRenderer;
