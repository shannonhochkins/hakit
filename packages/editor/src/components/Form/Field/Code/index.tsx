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

type DefaultProps = Omit<InputTextareaProps, 'type' | 'value' | 'onChange'> & {
  onValidate?: FieldDefinition['code']['onValidate'];
};

type JsonCodeFieldProps = {
  language: 'json';
  value: object;
  onChange: (value: object) => void;
} & DefaultProps;

type GenericCodeFieldProps = {
  language: Exclude<FieldDefinition['code']['language'], 'json'>;
  value: string;
  onChange: (value: string) => void;
} & DefaultProps;

export type CodeFieldProps = JsonCodeFieldProps | GenericCodeFieldProps;

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
  const [localValue, setLocalValue] = useState<string>(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  const [editing, setEditing] = useState<boolean>(false);
  const [jsonValid, setJsonValid] = useState<boolean>(true);

  function validateOnChange(value: string) {
    if (language == 'json') {
      try {
        JSON.parse(value);
        setJsonValid(true);
      } catch {
        setJsonValid(false);
      }
    }
    setLocalValue(value);
  }

  if (!editing) {
    return (
      <div className={getClassName()}>
        <InputField
          id={id}
          label={label}
          name={name}
          icon={icon}
          error={error}
          helperText={!error && !jsonValid ? helperText : 'Invalid syntax, please check your code'}
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          readOnly
          placeholder='Click "Edit" to open the code editor...'
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
                  style: {
                    height: '100%',
                  },
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
        <MonacoCodeEditor
          value={localValue}
          language={language as FieldDefinition['code']['language']}
          onChange={validateOnChange}
          onValidate={onValidate}
        />
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
              style: {
                height: '100%',
              },
            }}
            style={{
              flex: 1,
            }}
            variant={error || !jsonValid ? 'error' : 'primary'}
            aria-label='Save'
            icon={<SaveIcon size={18} />}
            onClick={() => {
              if (jsonValid) {
                setEditing(false);
              }
              try {
                if (language === 'json') {
                  const parsed = JSON.parse(localValue);
                  // @ts-expect-error - TODO - Fix this
                  return onChange(parsed);
                }
                // @ts-expect-error - TODO - Fix this
                onChange(localValue);
              } finally {
                console.error('Failed to save code field value');
                // no-op
              }
            }}
          />
          <IconButton
            className={getClassName('cancelButton')}
            tooltipProps={{
              placement: 'left',
              style: {
                height: '100%',
              },
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
