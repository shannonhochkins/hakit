import { useState } from 'react';
import { Group } from '@components/Group';
import { Row } from '@components/Layout';
import { PreloadImage } from '@hakit/components';
import { ImageField } from '@components/Form/Field/Image';

export function StyleguideImageFields() {
  // Controlled state for image field
  const [imageValue, setImageValue] = useState('');

  return (
    <Row
      fullHeight
      fullWidth
      alignItems='start'
      justifyContent='start'
      style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-gray-900)',
      }}
    >
      <Group title='Image Fields - Basic Example' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <ImageField
          id='basic-image'
          label='Upload Image'
          helperText='Click to select an image file'
          value={imageValue}
          onChange={setImageValue}
          size='medium'
        />
        {imageValue && (
          <>
            Image Preview
            <PreloadImage
              src={imageValue}
              style={{
                width: '300px',
                height: '300px',
                maxWidth: '200px',
              }}
            />
          </>
        )}
      </Group>
    </Row>
  );
}
