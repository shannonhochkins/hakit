import { Puck } from '@measured/puck';
import { TabHeading } from '../TabHeading';
import { TabPadding } from '../TabPadding';

export function Tree() {
  return (
    <div>
      <TabPadding>
        <TabHeading>Component Tree</TabHeading>
      </TabPadding>
      <TabPadding
        style={{
          paddingLeft: 0,
        }}
      >
        <Puck.Outline />
      </TabPadding>
    </div>
  );
}
