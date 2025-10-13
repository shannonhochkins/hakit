import { useLocalStorage } from '@hooks/useLocalStorage';
import { Modal, ModalActions } from '@components/Modal';
import { useRef, useState, useMemo } from 'react';
import { PrimaryButton } from '@components/Button';
import { InputField } from '@components/Form/Field/Input';
import { Alert } from '@components/Alert';
import React from 'react';
import { Column } from '@components/Layout';

// URL validation function
const validateHomeAssistantUrl = (url: string): { isValid: boolean; error?: string } => {
  // Check if empty
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'Home Assistant URL is required' };
  }

  // Remove any trailing slashes for consistency
  const cleanUrl = url.trim().replace(/\/+$/, '');

  try {
    const urlObj = new URL(cleanUrl);

    // Must be http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use http:// or https:// protocol' };
    }

    // Must have a hostname
    if (!urlObj.hostname) {
      return { isValid: false, error: 'URL must include a hostname' };
    }

    // Common Home Assistant port validation (optional but helpful)
    if (urlObj.port) {
      const port = parseInt(urlObj.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        return { isValid: false, error: 'Invalid port number' };
      }
    }

    // Check for localhost variations that should use http
    const isLocalhost =
      ['localhost', '127.0.0.1', '0.0.0.0'].includes(urlObj.hostname) ||
      urlObj.hostname.endsWith('.local') ||
      /^192\.168\.\d+\.\d+$/.test(urlObj.hostname) ||
      /^10\.\d+\.\d+\.\d+$/.test(urlObj.hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(urlObj.hostname);

    // Warn if using http for non-local addresses (security concern)
    if (urlObj.protocol === 'http:' && !isLocalhost) {
      return {
        isValid: true, // Still valid, but with warning
        error: 'Warning: Using http:// for remote addresses is not secure. Consider using https://',
      };
    }

    // Additional validation for common Home Assistant paths
    if (urlObj.pathname && urlObj.pathname !== '/' && !urlObj.pathname.startsWith('/lovelace')) {
      return {
        isValid: true, // Still valid, but with info
        error: 'Note: URL should typically point to the root of your Home Assistant instance',
      };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export function HassModal({ error }: { error?: React.ReactNode }) {
  const [storageUrl, setHassUrl] = useLocalStorage<string | null>('hassUrl');
  const hassUrlRef = useRef<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [touched, setTouched] = useState(false);

  // Validate URL in real-time
  const validation = useMemo(() => {
    if (!touched && !inputValue) {
      return { isValid: true }; // Don't show errors initially
    }
    return validateHomeAssistantUrl(inputValue);
  }, [inputValue, touched]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    hassUrlRef.current = value;
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handleSubmit = () => {
    setTouched(true);
    const finalValidation = validateHomeAssistantUrl(inputValue);

    if (finalValidation.isValid && hassUrlRef.current) {
      setHassUrl(hassUrlRef.current.trim().replace(/\/+$/, '')); // Clean up trailing slashes
    }
  };

  const isSubmitDisabled = !validation.isValid || !inputValue.trim();

  const errorMessage = React.isValidElement<{
    children: unknown[];
  }>(error)
    ? JSON.stringify(error.props.children.filter(x => typeof x === 'string').join(' '))
    : null;

  return (
    <Modal open title='Home Assistant URL' hideCloseButton>
      <Column gap='var(--space-4)' alignItems='flex-start' justifyContent='flex-start' wrap='nowrap'>
        <InputField
          id='url'
          type='text'
          label='Home Assistant URL *'
          required
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder='Enter your Home Assistant URL'
          error={!validation.isValid}
          helperText={
            validation.error ||
            'Enter the URL of your Home Assistant instance. Can be local (http://192.168.1.100:8123) or remote (https://my-ha.duckdns.org)'
          }
          autoComplete='url'
          spellCheck={false}
        />

        {errorMessage && storageUrl && (
          <Alert severity='warning' title='Invalid Credentials'>
            We could not connect to your Home Assistant instance with the provided URL of <b>&quot;{storageUrl}&quot;</b>.
            {storageUrl.includes('local') ? ' This appears to be a localhost url, are you connected to the same network? ' : ''} Please
            check your URL and try again.
          </Alert>
        )}

        <Alert severity='info' title='Privacy Notice'>
          We do not store your Home Assistant URL. It is only used locally in your browser to connect to your Home Assistant instance for
          automation and integration purposes.
        </Alert>
      </Column>

      <ModalActions>
        <PrimaryButton onClick={handleSubmit} disabled={isSubmitDisabled} aria-label='Set Home Assistant URL'>
          Connect
        </PrimaryButton>
      </ModalActions>
    </Modal>
  );
}
