import { ComponentConfig, RenderProps } from '@hakit/addon';

interface DefaultComponentNameProps {
  // Add your props here
  description?: string;
}

export function Render(props: RenderProps<DefaultComponentNameProps>) {
  return (
    <div>
      <h1>DefaultComponentName</h1>
      <p>{props.description}</p>
    </div>
  );
}

// Example component configuration
export const config: ComponentConfig<DefaultComponentNameProps> = {
  label: 'DefaultComponentName',
  fields: {
    description: {
      type: 'text',
      label: 'Description',
      default: '',
    },
  },
  render: Render,
};
