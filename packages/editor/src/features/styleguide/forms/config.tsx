import { createComponent } from '@helpers/editor/createPuckComponent';
import { createRootComponent } from '@helpers/editor/createRootComponent';
import { Data, Slot } from '@measured/puck';
import type { CustomComponentConfig, CustomConfigWithDefinition } from '@typings/puck';
import { CustomRootConfigWithRemote } from '../../../features/dashboard/PuckDynamicConfiguration';
interface TestComponentProps {
  title: string;
}

const componentConfig: CustomComponentConfig<TestComponentProps> = {
  label: 'TestComponent',
  fields: {
    title: {
      type: 'text',
      label: 'Title',
      default: 'Hello',
    },
  },
  render(props) {
    return <div>Hello {props.title}</div>;
  },
};

const factoryData = {
  getAllEntities: () => ({}),
  getAllServices: () => Promise.resolve(null),
};

const componentFactory = createComponent(componentConfig);
const convertedComponent = await componentFactory(factoryData);

const rootComponentConfig: CustomRootConfigWithRemote<{
  diffTitle: string;
}> = {
  _remoteRepositoryId: '@hakit/another-root',
  _remoteRepositoryName: '@hakit/another-root',
  fields: {
    diffTitle: {
      type: 'text',
      label: 'Different Title',
      default: 'Different',
    },
  },
  label: 'Another Root',
  render(props) {
    return <div>Hello {props.diffTitle}</div>;
  },
};

const rootFactory = await createRootComponent([rootComponentConfig], factoryData);

export const config: CustomConfigWithDefinition = {
  components: {
    TestComponent: convertedComponent,
  },
  // @ts-expect-error - fix later
  root: rootFactory,
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
