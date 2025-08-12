import styled from '@emotion/styled';
import MDEditor from '@uiw/react-md-editor';
import type { MarkdownPreviewProps } from '@uiw/react-markdown-preview';

type MarkdownRendererProps = {
  children?: string | undefined;
  options?: Pick<MarkdownPreviewProps, 'components' | 'rehypePlugins' | 'remarkPlugins'>;
};

const StyledMarkdown = styled.div`
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);

  a {
    color: var(--color-primary-400);
  }

  .markdown-image-wrapper {
    display: inline-block;
    max-width: 400px;
    max-height: 400px;
    cursor: pointer;
  }
  .markdown-image-wrapper img {
    width: auto;
    height: auto;
    max-width: 400px;
    max-height: 400px;
  }
`;

export function MarkdownRenderer({ children, options }: MarkdownRendererProps) {
  if (!children) return null;
  return (
    <StyledMarkdown>
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
    </StyledMarkdown>
  );
}

export default MarkdownRenderer;
