import { Render } from '@measured/puck';
import { EditorAndRendererProps } from './Page';

export function Renderer({ data, config }: EditorAndRendererProps) {
  return (
    <>
      <Render config={config} data={data} />
    </>
  );
}
