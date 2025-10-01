import React, { useState } from 'react';
import { Group, Row } from '@hakit/components';
import { InputField } from '@components/Form/Field/Input';
import { MailIcon, UserIcon, LockIcon, CheckCircleIcon, DollarSignIcon } from 'lucide-react';

export function StyleguideInputFields() {
  // Controlled state examples
  const [emailValue, setEmailValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [amountValue, setAmountValue] = useState('100.00');
  const [numberValue, setNumberValue] = useState(42);
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
      <Group title='Input Fields - With all configurations' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <InputField
          id='controlled-email'
          label='Controlled Email Input'
          value={emailValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEmailValue(e.target.value)}
          placeholder='Enter your email'
          helperText='Enter your email'
          valuePrefix='https://'
          valueSuffix='.com'
          startAdornment={<LockIcon size={18} />}
          endAdornment={<CheckCircleIcon size={18} />}
          icon={<MailIcon size={18} />}
        />
      </Group>
      <Group title='Input Fields - With Label and Helper Text' alignItems='start' justifyContent='start' gap='var(--space-4)'>
        <InputField
          id='controlled-email'
          label='Controlled Email Input'
          value={emailValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEmailValue(e.target.value)}
          placeholder='Enter your email'
          helperText='Enter your email'
        />
      </Group>
      <Group title='Input Fields - Controlled Examples'>
        <InputField
          id='controlled-email'
          label='Controlled Email Input'
          value={emailValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEmailValue(e.target.value)}
          placeholder='Enter your email'
        />
        <InputField
          id='controlled-search'
          label='Controlled Search'
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSearchValue(e.target.value)}
          startAdornment={<MailIcon size={18} />}
          placeholder='Search...'
        />
        <InputField
          id='controlled-textarea'
          label='Controlled Textarea'
          type='multiline'
          value={textareaValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTextareaValue(e.target.value)}
          rows={3}
          placeholder='Enter your message'
        />
        <InputField
          id='controlled-amount'
          label='Controlled Number Amount with Unit'
          type='number'
          value={amountValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setAmountValue(e.target.value)}
          startAdornment={{
            content: (
              <>
                &nbsp;
                <DollarSignIcon size={18} />
              </>
            ),
            variant: 'custom',
          }}
          min={0}
          max={10000}
          step={0.01}
          placeholder='0.00'
        />
        <InputField
          id='controlled-number'
          label='Controlled Number Field'
          type='number'
          value={numberValue}
          onChange={e => setNumberValue(Number(e.target.value))}
          min={0}
          max={100}
          step={1}
          placeholder='42'
        />
      </Group>

      <Group title='Input Fields - Basic Examples'>
        <InputField id='basic-input' label='Basic Input' type='text' />
        <InputField id='basic-input-with-value' label='Input with Value' value='Hello World' type='text' />
        <InputField id='basic-input-disabled' label='Disabled Input' disabled value='Disabled text' type='text' />
        <InputField id='basic-input-readonly' label='Read-only Input' value='Read-only text' type='text' />
      </Group>

      <Group title='Input Fields - Sizes'>
        <InputField id='small-input' label='Small Input' size='small' type='text' />
        <InputField id='medium-input' label='Medium Input (Default)' size='medium' type='text' />
        <InputField id='large-input' label='Large Input' size='large' type='text' />
      </Group>

      <Group title='Input Fields - Sizes with Adornments'>
        <InputField
          id='small-with-adornments'
          label='Small with Adornments'
          size='small'
          type='text'
          startAdornment={{ content: '$', variant: 'default' }}
          endAdornment={{ content: '✓', variant: 'default' }}
        />
        <InputField
          id='medium-with-adornments'
          label='Medium with Adornments'
          size='medium'
          type='text'
          startAdornment={{ content: '@', variant: 'default' }}
          endAdornment={{ content: '✓', variant: 'default' }}
        />
        <InputField
          id='large-with-adornments'
          label='Large with Adornments'
          size='large'
          type='text'
          startAdornment={{ content: '#', variant: 'default' }}
          endAdornment={{ content: '✓', variant: 'default' }}
        />
      </Group>

      <Group title='Input Fields - States'>
        <InputField id='error-input' label='Error Input' type='text' error helperText='This field has an error' />
        <InputField id='success-input' label='Success Input' type='text' success helperText='This field is valid' />
        <InputField
          id='success-input-with-icon'
          label='Success Input with Icon'
          type='text'
          success
          endAdornment={<CheckCircleIcon size={18} />}
        />
      </Group>

      <Group title='Input Fields - Adornments'>
        <InputField id='input-with-start-icon' label='Input with Start Icon' type='text' startAdornment={<MailIcon size={18} />} />
        <InputField id='input-with-end-icon' label='Input with End Icon' type='text' endAdornment={<UserIcon size={18} />} />
        <InputField
          id='input-with-both-icons'
          label='Input with Both Icons'
          type='text'
          startAdornment={<LockIcon size={18} />}
          endAdornment={<CheckCircleIcon size={18} />}
        />
      </Group>

      <Group title='Input Fields - Character Count & Validation'>
        <InputField id='input-with-char-count' label='Input with Character Count' type='multiline' showCharCount maxLength={50} />
        <InputField
          id='input-with-char-count-value'
          label='Input with Character Count'
          type='multiline'
          showCharCount
          maxLength={20}
          value='Hello World'
        />
      </Group>

      <Group title='Input Fields - Multiline'>
        <InputField id='multiline-small' label='Small Multiline' type='multiline' size='small' rows={2} />
        <InputField id='multiline-medium' label='Medium Multiline' type='multiline' size='medium' rows={3} />
        <InputField id='multiline-large' label='Large Multiline' type='multiline' size='large' rows={4} />
        <InputField
          id='multiline-with-char-count'
          label='Multiline with Character Count'
          type='multiline'
          showCharCount
          maxLength={100}
          rows={3}
        />
      </Group>

      <Group title='Input Fields - Complex Examples'>
        <InputField
          id='complex-example'
          label='Email Address'
          startAdornment={<MailIcon size={18} />}
          helperText='Enter your email address'
          placeholder='user@example.com'
        />
        <InputField
          id='complex-example-error'
          label='Password'
          startAdornment={<LockIcon size={18} />}
          endAdornment={<CheckCircleIcon size={18} />}
          error
          helperText='Password must be at least 8 characters'
          type='password'
        />
        <InputField id='unit-input' label='Amount (Default Box)' startAdornment='USD' placeholder='0.00' />
        <InputField
          id='icon-adornment'
          label='Email (Icon Adornment)'
          startAdornment={<MailIcon size={18} />}
          placeholder='user@example.com'
        />
        <InputField
          id='button-adornment'
          label='Search (Icon + Custom Button)'
          startAdornment={<MailIcon size={18} />}
          endAdornment={{ content: 'Go', variant: 'custom' }}
          placeholder='Search...'
        />
        <InputField id='complex-boxes' label='Complex Default Boxes' startAdornment='USD' endAdornment='✓' placeholder='Enter amount...' />
        <InputField
          id='custom-styling'
          label='Custom Styled Adornments'
          startAdornment={{
            content: (
              <div
                style={{
                  padding: 'var(--space-1) var(--space-2)',
                  backgroundColor: 'var(--color-primary-500)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontSize: 'var(--font-size-xs)',
                  cursor: 'pointer',
                }}
              >
                $USD
              </div>
            ),
            variant: 'custom',
          }}
          endAdornment={{
            content: (
              <div
                style={{
                  padding: 'var(--space-1) var(--space-2)',
                  backgroundColor: 'var(--color-success-500)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontSize: 'var(--font-size-xs)',
                  cursor: 'pointer',
                }}
              >
                ✓
              </div>
            ),
            variant: 'custom',
          }}
          placeholder='Custom styling example...'
        />
      </Group>

      <Group title='Input Fields - Number Fields with Adornments'>
        <InputField id='number-basic' label='Basic Number Input' type='number' placeholder='0' />
        <InputField id='number-with-currency' label='Number with Currency' type='number' startAdornment='USD' placeholder='0.00' />
        <InputField id='number-with-unit' label='Number with Unit' type='number' endAdornment='kg' placeholder='0' />
        <InputField
          id='number-with-both'
          label='Number with Currency & Unit'
          type='number'
          startAdornment='USD'
          endAdornment='kg'
          placeholder='0.00'
        />
        <InputField
          id='number-with-icons'
          label='Number with Icons'
          type='number'
          startAdornment={<MailIcon size={18} />}
          endAdornment={<CheckCircleIcon size={18} />}
          placeholder='0'
        />
        <InputField
          id='number-with-custom-boxes'
          label='Number with Custom Boxes'
          type='number'
          startAdornment={{ content: 'USD', variant: 'custom' }}
          endAdornment={{ content: '✓', variant: 'custom' }}
          placeholder='0.00'
        />
      </Group>
    </Row>
  );
}
