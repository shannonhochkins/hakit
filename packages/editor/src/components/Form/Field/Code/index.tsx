import { useState } from 'react';
import { type FieldDefinition } from '@typings/fields';
import { IconButton } from '@components/Button';
import { MonacoCodeEditor } from './monacoCodeEditor';
import { InputField, InputTextareaProps } from '../Input';
import styles from './CodeField.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { CodeIcon, EditIcon, SaveIcon, XIcon } from 'lucide-react';
import { Column, Row } from '@components/Layout';
import { FieldLabel } from '../_shared/FieldLabel';
import { HelperText } from '../_shared/HelperText';

const getClassName = getClassNameFactory('CodeField', styles);

interface CodeFieldProps extends Omit<InputTextareaProps, 'type' | 'value' | 'onChange'> {
  language: FieldDefinition['code']['language'];
  onValidate?: FieldDefinition['code']['onValidate'];
  value: string;
  onChange: (value: string) => void;
}

export const CodeField = ({
  id,
  name,
  value,
  language = 'css',
  onChange,
  onValidate,
  readOnly,
  helperText,
  label,
  icon = <CodeIcon size={18} />,
  error,
}: CodeFieldProps) => {
  const [localValue, setLocalValue] = useState<string>(value);
  const [editing, setEditing] = useState<boolean>(false);

  if (!editing) {
    return (
      <div className={getClassName()}>
        <InputField
          id={id}
          label={label}
          name={name}
          icon={icon}
          value={value}
          readOnly
          placeholder='Click "Edit" to open the code editor...'
          helperText={helperText}
          disabled
          endAdornment={
            !readOnly && (
              <IconButton
                aria-label='Edit code'
                variant='transparent'
                icon={<EditIcon size={18} />}
                onClick={() => setEditing(true)}
                tooltipProps={{
                  placement: 'left',
                }}
                style={{
                  flex: 1,
                  height: '100%',
                }}
                className={getClassName('editButton')}
              />
            )
          }
          type='multiline'
        />
      </div>
    );
  }

  return (
    <Column fullWidth alignItems='flex-start' justifyContent='flex-start' gap='var(--space-1)'>
      <FieldLabel label={label} readOnly={readOnly} icon={icon} htmlFor={id} />
      <Row fullWidth alignItems='flex-start' justifyContent='flex-start' gap='var(--space-2)' wrap='nowrap'>
        <MonacoCodeEditor value={localValue} language={language} onChange={setLocalValue} onValidate={onValidate} />
        <Column
          style={{
            flex: 1,
            alignSelf: 'stretch',
            justifySelf: 'stretch',
          }}
          gap='var(--space-2)'
        >
          <IconButton
            className={getClassName('saveButton')}
            tooltipProps={{
              placement: 'left',
            }}
            style={{
              flex: 1,
            }}
            variant='primary'
            aria-label='Save'
            icon={<SaveIcon size={18} />}
            onClick={() => {
              setEditing(false);
              onChange(localValue);
            }}
          />
          <IconButton
            className={getClassName('cancelButton')}
            tooltipProps={{
              placement: 'left',
            }}
            style={{
              flex: 1,
            }}
            aria-label='Cancel'
            icon={<XIcon size={18} />}
            onClick={() => setEditing(false)}
          />
        </Column>
      </Row>
      <HelperText helperText={helperText} error={error} />
    </Column>
  );
};
