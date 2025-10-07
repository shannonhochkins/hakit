import { Group } from '@components/Group';
import { Column } from '@components/Layout';
import { PrimaryButton, SecondaryButton, Fab, IconButton } from '@components/Button';
import { MailIcon, PlusIcon, Trash2Icon, CheckIcon } from 'lucide-react';

export function StyleguideButtons() {
  return (
    <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: 'var(--space-4) 0' }}>
      <Group title='Primary Button - Variants'>
        <PrimaryButton aria-label='Primary default'>Default Primary</PrimaryButton>
        <PrimaryButton aria-label='Primary success' variant='success'>
          Success Primary
        </PrimaryButton>
        <PrimaryButton aria-label='Primary error' variant='error'>
          Error Primary
        </PrimaryButton>
      </Group>

      <Group title='Primary Button - Sizes and States'>
        <PrimaryButton aria-label='Primary extra small' size='xs'>
          XS
        </PrimaryButton>
        <PrimaryButton aria-label='Primary small' size='sm'>
          Small
        </PrimaryButton>
        <PrimaryButton aria-label='Primary medium' size='md'>
          Medium
        </PrimaryButton>
        <PrimaryButton aria-label='Primary large' size='lg'>
          Large
        </PrimaryButton>
        <PrimaryButton aria-label='Primary loading' loading>
          Loading
        </PrimaryButton>
        <PrimaryButton aria-label='Primary disabled' disabled>
          Disabled
        </PrimaryButton>
      </Group>

      <Group title='Primary Button - Icons & Full Width'>
        <PrimaryButton aria-label='Primary with start icon' startIcon={<MailIcon size={16} />}>
          With Start Icon
        </PrimaryButton>
        <PrimaryButton aria-label='Primary with end icon' endIcon={<CheckIcon size={16} />}>
          With End Icon
        </PrimaryButton>
        <PrimaryButton aria-label='Primary full width' fullWidth>
          Full Width
        </PrimaryButton>
      </Group>

      <Group title='Secondary Button - Basics'>
        <SecondaryButton aria-label='Secondary default'>Default Secondary</SecondaryButton>
        <SecondaryButton aria-label='Secondary loading' loading>
          Loading
        </SecondaryButton>
        <SecondaryButton aria-label='Secondary disabled' disabled>
          Disabled
        </SecondaryButton>
      </Group>

      <Group title='Secondary Button - Sizes & Icons'>
        <SecondaryButton aria-label='Secondary xs' size='xs'>
          XS
        </SecondaryButton>
        <SecondaryButton aria-label='Secondary small' size='sm'>
          Small
        </SecondaryButton>
        <SecondaryButton aria-label='Secondary medium' size='md'>
          Medium
        </SecondaryButton>
        <SecondaryButton aria-label='Secondary large' size='lg'>
          Large
        </SecondaryButton>
        <SecondaryButton aria-label='Secondary with start icon' startIcon={<Trash2Icon size={16} />}>
          Delete
        </SecondaryButton>
      </Group>

      <Group title='Icon Button - Variants & States'>
        <IconButton aria-label='IconButton secondary' icon={<PlusIcon size={16} />} />
        <IconButton aria-label='IconButton primary' icon={<PlusIcon size={16} />} variant='primary' />
        <IconButton aria-label='IconButton error' icon={<PlusIcon size={16} />} variant='error' />
        <IconButton aria-label='IconButton transparent' icon={<PlusIcon size={16} />} variant='transparent' />
        <IconButton aria-label='IconButton active' icon={<PlusIcon size={16} />} active />
        <IconButton aria-label='IconButton loading' icon={<PlusIcon size={16} />} loading />
        <IconButton aria-label='IconButton disabled' icon={<PlusIcon size={16} />} disabled />
      </Group>

      <Group title='Icon Button - Sizes'>
        <IconButton aria-label='IconButton xs' icon={<PlusIcon size={14} />} size='xs' />
        <IconButton aria-label='IconButton sm' icon={<PlusIcon size={16} />} size='sm' />
        <IconButton aria-label='IconButton md' icon={<PlusIcon size={18} />} size='md' />
        <IconButton aria-label='IconButton lg' icon={<PlusIcon size={20} />} size='lg' />
      </Group>

      <Group title='FAB - Variants & Sizes'>
        <Fab aria-label='Fab primary' icon={<PlusIcon size={18} />} />
        <Fab aria-label='Fab secondary' variant='secondary' icon={<PlusIcon size={18} />} />
        <Fab aria-label='Fab transparent' variant='transparent' icon={<PlusIcon size={18} />} />
        <Fab aria-label='Fab error' variant='error' icon={<PlusIcon size={18} />} />
        <Fab aria-label='Fab xs' size='xs' icon={<PlusIcon size={16} />} />
        <Fab aria-label='Fab sm' size='sm' icon={<PlusIcon size={16} />} />
        <Fab aria-label='Fab md' size='md' icon={<PlusIcon size={18} />} />
        <Fab aria-label='Fab lg' size='lg' icon={<PlusIcon size={20} />} />
      </Group>

      <Group title='FAB - States & Options'>
        <Fab aria-label='Fab loading' loading icon={<PlusIcon size={18} />} />
        <Fab aria-label='Fab active' active icon={<PlusIcon size={18} />} />
        <Fab aria-label='Fab with pulse' pulse icon={<PlusIcon size={18} />} />
        <Fab aria-label='Fab with custom radius' borderRadius='12px' icon={<PlusIcon size={18} />} />
      </Group>
    </Column>
  );
}
