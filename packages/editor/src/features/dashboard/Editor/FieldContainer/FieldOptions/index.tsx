import { SwitchField } from '@components/Form/Field/Switch';
import { Column } from '@components/Layout';
import { Modal } from '@components/Modal';
import { FieldConfiguration } from '@typings/fields';
import { CodeXml, Touchpad } from 'lucide-react';

export function FieldOptions({
  open,
  field,
  onClose,
}: {
  open: boolean;
  field: Exclude<FieldConfiguration[string], { type: 'slot' | 'hidden' | 'object' | 'array' | 'divider' | 'hidden' }>;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={`${field.label} options`}>
      <Column fullWidth alignItems='flex-start' justifyContent='flex-start' gap='var(--space-4)' wrap='nowrap'>
        <SwitchField
          label='Responsive Mode'
          checked={false}
          icon={<Touchpad size={16} />}
          helperText='Enable responsive mode for this field, this will allow you to configure different values for this field at different breakpoints.'
          id='responsive-mode'
          name='responsive-mode'
        />
        <SwitchField
          label='Template Mode'
          checked={false}
          icon={<CodeXml size={16} />}
          helperText='Enable template mode for this field, this will allow you to use home assistant templates for this field value'
          id='template-mode'
          name='template-mode'
        />
      </Column>
    </Modal>
  );
}
