import { useState } from 'react';
import { type FieldDefinition } from '@typings/fields';
import { SecondaryButton } from '@components/Button';
import { MonacoCodeEditor } from './monacoCodeEditor';
import { InputField } from '../Input';

interface CodeFieldProps {
  id: string;
  name: string;
  value: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  readOnly?: boolean;
  helperText?: string;
  language: FieldDefinition['code']['language'];
  onValidate?: FieldDefinition['code']['onValidate'];
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
  icon,
}: CodeFieldProps) => {
  const [editing, setEditing] = useState<boolean>(false);

  if (!editing) {
    return (
      <div>
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
          type='multiline'
        />
        {!readOnly && (
          <div>
            <SecondaryButton aria-label='Edit code' size='xs' onClick={() => setEditing(true)}>
              Edit
            </SecondaryButton>
          </div>
        )}
      </div>
    );
  }

  return <MonacoCodeEditor value={value} language={language} onChange={onChange} onValidate={onValidate} />;
};
