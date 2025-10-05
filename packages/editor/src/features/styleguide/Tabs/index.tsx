import { useState } from 'react';
import { Tabs } from '@components/Tabs';
import { Column } from '@components/Layout';
import { Group } from '@components/Group';

export function StyleguideTabs() {
  const [groupDefault, setGroupDefault] = useState('plane');
  const [groupCenter, setGroupCenter] = useState('plane');
  const [groupFluid, setGroupFluid] = useState('plane');
  const lorem =
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum veniam reprehenderit eum, reiciendis obcaecati, excepturi nemo ipsa fugit suscipit autem vitae numquam et cumque praesentium vero eos minus itaque.';
  const lorem2 =
    'Quisquam, quidem! A facilis vitae laborum, similique delectus voluptatum corrupti dolorum cumque numquam saepe itaque, ipsa vero? Alias, magnam recusandae repellendus maiores laudantium vitae?';
  const lorem3 =
    'Culpa voluptatum sapiente, quasi rerum laboriosam, corporis praesentium libero beatae veniam saepe ducimus repellat numquam consequuntur earum nobis eaque, temporibus maxime!';

  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Default (left-aligned)'>
        <Tabs value={groupDefault} onValueChange={value => setGroupDefault(value)}>
          <Tabs.List>
            <Tabs.Control value='plane'>Plane</Tabs.Control>
            <Tabs.Control value='boat'>Boat</Tabs.Control>
            <Tabs.Control value='car'>Car</Tabs.Control>
          </Tabs.List>
          <Tabs.Content>
            <Tabs.Panel value='plane'>
              <p>Plane Panel - {lorem}</p>
              <p>{lorem2}</p>
              <p>{lorem3}</p>
            </Tabs.Panel>
            <Tabs.Panel value='boat'>
              <p>Boat Panel - {lorem}</p>
              <p>{lorem2}</p>
              <p>{lorem3}</p>
            </Tabs.Panel>
            <Tabs.Panel value='car'>
              <p>Car Panel - {lorem}</p>
              <p>{lorem2}</p>
              <p>{lorem3}</p>
            </Tabs.Panel>
          </Tabs.Content>
        </Tabs>
      </Group>

      <Group title='Justify center (not stretched)'>
        <Tabs value={groupCenter} onValueChange={value => setGroupCenter(value)}>
          <Tabs.List justify='center'>
            <Tabs.Control value='plane'>Plane</Tabs.Control>
            <Tabs.Control value='boat'>Boat</Tabs.Control>
            <Tabs.Control value='car'>Car</Tabs.Control>
          </Tabs.List>
          <Tabs.Content>
            <Tabs.Panel value='plane'>
              <p>Plane Panel - {lorem}</p>
              <p>{lorem2}</p>
              <p>{lorem3}</p>
            </Tabs.Panel>
            <Tabs.Panel value='boat'>
              <p>Boat Panel - {lorem}</p>
              <p>{lorem2}</p>
              <p>{lorem3}</p>
            </Tabs.Panel>
            <Tabs.Panel value='car'>
              <p>Car Panel - {lorem}</p>
              <p>{lorem2}</p>
              <p>{lorem3}</p>
            </Tabs.Panel>
          </Tabs.Content>
        </Tabs>
      </Group>

      <Group title='Fluid (stretched)'>
        <Tabs value={groupFluid} onValueChange={value => setGroupFluid(value)}>
          <Tabs.List fluid>
            <Tabs.Control value='plane'>Plane</Tabs.Control>
            <Tabs.Control value='boat'>Boat</Tabs.Control>
            <Tabs.Control value='car'>Car</Tabs.Control>
          </Tabs.List>
          <Tabs.Content>
            <Tabs.Panel value='plane'>
              <p>Plane Panel - {lorem}</p>
              <p>{lorem2}</p>
              <p>{lorem3}</p>
            </Tabs.Panel>
            <Tabs.Panel value='boat'>
              <p>Boat Panel - {lorem}</p>
              <p>{lorem2}</p>
              <p>{lorem3}</p>
            </Tabs.Panel>
            <Tabs.Panel value='car'>
              <p>Car Panel - {lorem}</p>
              <p>{lorem2}</p>
              <p>{lorem3}</p>
            </Tabs.Panel>
          </Tabs.Content>
        </Tabs>
      </Group>
    </Column>
  );
}
