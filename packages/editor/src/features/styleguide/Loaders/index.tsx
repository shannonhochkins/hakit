import { Group } from '@components/Group';
import { Row } from '@components/Layout';
import { Spinner } from '@components/Loaders/Spinner';
import { LinearProgress } from '@components/Loaders/LinearProgress';

export function StyleguideLoaders() {
  return (
    <Row fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4)' }}>
      <Group title='Spinner - Variants'>
        <Spinner aria-label='Spinner default' />
        <Spinner aria-label='Spinner default' size={10} thickness={2} />
        <Spinner aria-label='Spinner default' size={50} thickness={5} />
        <Spinner aria-label='Spinner with text' text='Loading...' />
      </Group>

      <Group title='Linear Progress - Colors & Thickness'>
        <LinearProgress aria-label='Linear primary' value={30} />
        <LinearProgress aria-label='Linear secondary' value={45} color='secondary' />
        <LinearProgress aria-label='Linear error' value={60} color='error' />
        <LinearProgress aria-label='Linear success' value={80} color='success' />
        <LinearProgress aria-label='Linear thin' value={50} thickness='thin' />
        <LinearProgress aria-label='Linear thick rounded' value={75} thickness='thick' rounded />
      </Group>

      <Group title='Linear Progress - Indeterminate'>
        <LinearProgress aria-label='Linear primary' variant='indeterminate' />
      </Group>
    </Row>
  );
}
