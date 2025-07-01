import { useLocalStorage } from '@lib/hooks/useLocalStorage';
import { Modal, ModalActions } from '@lib/components/Modal';
import { useRef, useState, useMemo } from 'react';
import { PrimaryButton } from '../Button';
import { InputField } from '../Form/Fields/Input';
import { FieldGroup } from '../Form/FieldWrapper/FieldGroup';
import { FieldLabel } from '../Form/FieldWrapper/FieldLabel';
import { Alert } from '../Alert';

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

export function HassModal() {
  const [, setHassUrl] = useLocalStorage<string | null>('hassUrl');
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

  return (
    <Modal
      open
      title='Home Assistant URL'
      hideCloseButton
      onClose={() => {
        // do nothing, the value provided below will automatically close the modal when the hassUrl is provided
      }}
    >
      <FieldGroup
        style={{
          width: '100%',
        }}
      >
        <FieldLabel label='Home Assistant URL *' description='Enter your Home Assistant URL' />
        <InputField
          type='url'
          required
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder='https://homeassistant.local:8123'
          error={!validation.isValid}
          helperText={
            validation.error ||
            'Enter the URL of your Home Assistant instance. Can be local (http://192.168.1.100:8123) or remote (https://my-ha.duckdns.org)'
          }
          fullWidth
          autoComplete='url'
          spellCheck={false}
        />
      </FieldGroup>

      <Alert severity='info' title='Privacy Notice'>
        We do not store your Home Assistant URL. It is only used locally in your browser to connect to your Home Assistant instance for
        automation and integration purposes.
      </Alert>

      <ModalActions>
        <PrimaryButton onClick={handleSubmit} disabled={isSubmitDisabled} aria-label='Set Home Assistant URL'>
          Connect
        </PrimaryButton>
      </ModalActions>
    </Modal>
  );
}
