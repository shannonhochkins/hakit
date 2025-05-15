import { Puck } from '@measured/puck';
import { TabPadding } from '../TabPadding';
import { TabHeading } from '../TabHeading';

export function Components() {
  return (
    <div>
      <TabPadding>
        <TabHeading>Draggable Components</TabHeading>
      </TabPadding>
      <TabPadding>
        <Puck.Components />
      </TabPadding>
    </div>
  );
}
