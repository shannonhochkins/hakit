import { Column, Row } from '@hakit/components';

export function ColourTesting() {
  const colours = ['azure', 'rose', 'green', 'yellow', 'red', 'grey'];
  return (
    <Column gap='0.25rem'>
      {colours.map(parent => (
        <Row key={parent} wrap='nowrap' gap='0.25rem'>
          {[
            `--puck-color-${parent}-12`,
            `--puck-color-${parent}-11`,
            `--puck-color-${parent}-10`,
            `--puck-color-${parent}-09`,
            `--puck-color-${parent}-08`,
            `--puck-color-${parent}-07`,
            `--puck-color-${parent}-06`,
            `--puck-color-${parent}-05`,
            `--puck-color-${parent}-04`,
            `--puck-color-${parent}-03`,
            `--puck-color-${parent}-02`,
            `--puck-color-${parent}-01`,
          ].map((color, index) => (
            <div
              key={color}
              style={{
                backgroundColor: `var(${color})`,
                padding: '2rem',
                display: 'block',
                aspectRatio: '1/1',
              }}
            >
              {index + 1}
            </div>
          ))}
        </Row>
      ))}
    </Column>
  );
}
