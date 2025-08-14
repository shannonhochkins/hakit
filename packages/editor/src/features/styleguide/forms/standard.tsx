import { createComponent } from '@helpers/editor/createPuckComponent';
import { createRootComponent } from '@helpers/editor/createRootComponent';
import { Config, Data, Slot, ComponentConfig, RootConfig } from '@measured/puck';
import type { CustomComponentConfig, CustomConfigWithDefinition } from '@typings/puck';
import { CustomRootConfigWithRemote } from '../../../features/dashboard/PuckDynamicConfiguration';
interface TestComponentProps {
  title: string;
}

const componentConfig: ComponentConfig<TestComponentProps> = {
  label: 'TestComponent',
  fields: {
    title: {
      type: 'text',
      label: 'Title',
    },
  },
  render(props) {
    return <div>Hello {props.title}</div>;
  },
};

const rootComponentConfig: RootConfig<{
  diffTitle: string;
  content: Slot;
}> = {
  fields: {
    diffTitle: {
      type: 'text',
      label: 'Different Title',
    },
    content: {
      type: 'slot',
    },
  },
  label: 'Another Root',
  render(props) {
    return (
      <div>
        Hello {props.diffTitle} <props.content />
      </div>
    );
  },
};

export const config: Config<
  {
    TestComponent: TestComponentProps;
  },
  {
    diffTitle: string;
    content: Slot;
  }
> = {
  components: {
    TestComponent: componentConfig,
  },
  root: rootComponentConfig,
};

export const data: Data<
  {
    TestComponent: TestComponentProps;
  },
  {
    title: string;
    content: Slot;
  }
> = {
  root: {
    props: {
      title: 'Hello',
      content: [
        {
          type: 'TestComponent',
          props: {
            title: 'Hello',
            id: 'TestComponent-61121054-1470-414e-8209-3de8369c6ad5',
          },
        },
      ],
    },
  },
  content: [],
  zones: {},
};
