import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from './index';

// Quick test component to verify button refactoring and animations
export const ButtonTest: React.FC = () => {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);

  const handleLoad1 = () => {
    setLoading1(true);
    setTimeout(() => setLoading1(false), 3000);
  };

  const handleLoad2 = () => {
    setLoading2(true);
    setTimeout(() => setLoading2(false), 3000);
  };

  const handleLoad3 = () => {
    setLoading3(true);
    setTimeout(() => setLoading3(false), 3000);
  };

  const handleLoad4 = () => {
    setLoading4(true);
    setTimeout(() => setLoading4(false), 3000);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
      <h2 style={{ color: 'var(--color-text-primary)' }}>Button Animation & Loading Test</h2>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', minWidth: '120px' }}>Primary Variants:</h3>
        <PrimaryButton variant='primary' aria-label='Primary button'>
          Primary
        </PrimaryButton>
        <PrimaryButton variant='success' aria-label='Success button'>
          Success
        </PrimaryButton>
        <PrimaryButton variant='error' aria-label='Error button'>
          Error
        </PrimaryButton>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', minWidth: '120px' }}>Size Variants:</h3>
        <PrimaryButton size='sm' aria-label='Small primary button'>
          Small Primary
        </PrimaryButton>
        <PrimaryButton aria-label='Default primary button'>Default Primary</PrimaryButton>
        <PrimaryButton size='lg' aria-label='Large primary button'>
          Large Primary
        </PrimaryButton>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', minWidth: '120px' }}>Secondary:</h3>
        <SecondaryButton size='sm' aria-label='Small secondary button'>
          Small Secondary
        </SecondaryButton>
        <SecondaryButton aria-label='Default secondary button'>Default Secondary</SecondaryButton>
        <SecondaryButton size='lg' aria-label='Large secondary button'>
          Large Secondary
        </SecondaryButton>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', minWidth: '120px' }}>Loading Test:</h3>
        <PrimaryButton loading={loading1} onClick={handleLoad1} aria-label='Load primary button'>
          {loading1 ? '' : 'Load Primary (3s)'}
        </PrimaryButton>
        <PrimaryButton variant='success' loading={loading2} onClick={handleLoad2} aria-label='Load success button'>
          {loading2 ? '' : 'Load Success (3s)'}
        </PrimaryButton>
        <PrimaryButton variant='error' loading={loading3} onClick={handleLoad3} aria-label='Load error button'>
          {loading3 ? '' : 'Load Error (3s)'}
        </PrimaryButton>
        <SecondaryButton loading={loading4} onClick={handleLoad4} aria-label='Load secondary button'>
          {loading4 ? '' : 'Load Secondary (3s)'}
        </SecondaryButton>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', minWidth: '120px' }}>Disabled:</h3>
        <PrimaryButton disabled aria-label='Disabled primary button'>
          Disabled Primary
        </PrimaryButton>
        <PrimaryButton variant='success' disabled aria-label='Disabled success button'>
          Disabled Success
        </PrimaryButton>
        <PrimaryButton variant='error' disabled aria-label='Disabled error button'>
          Disabled Error
        </PrimaryButton>
        <SecondaryButton disabled aria-label='Disabled secondary button'>
          Disabled Secondary
        </SecondaryButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ color: 'var(--color-text-secondary)' }}>Full Width:</h3>
        <PrimaryButton fullWidth aria-label='Full width primary button'>
          Full Width Primary (Hover to see gradient animation)
        </PrimaryButton>
        <PrimaryButton variant='success' fullWidth aria-label='Full width success button'>
          Full Width Success (Hover to see gradient animation)
        </PrimaryButton>
        <PrimaryButton variant='error' fullWidth aria-label='Full width error button'>
          Full Width Error (Hover to see gradient animation)
        </PrimaryButton>
        <SecondaryButton fullWidth aria-label='Full width secondary button'>
          Full Width Secondary (Hover to see transition)
        </SecondaryButton>
      </div>

      <div style={{ padding: '20px', backgroundColor: 'var(--color-surface)', borderRadius: '8px' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Animation Notes:</h3>
        <ul style={{ color: 'var(--color-text-primary)', fontSize: '14px', lineHeight: '1.6' }}>
          <li>
            <strong>Hover Effects:</strong> Gradients should smoothly transition via overlay animation
          </li>
          <li>
            <strong>Loading State:</strong> Spinner should animate while maintaining button color
          </li>
          <li>
            <strong>Focus States:</strong> Keyboard navigation should show focus rings and gradient overlays
          </li>
          <li>
            <strong>Transform:</strong> Buttons should lift slightly on hover (translateY -1px)
          </li>
          <li>
            <strong>Variants:</strong> Success uses green gradients, Error uses red gradients, Primary uses blue/cyan
          </li>
        </ul>
      </div>
    </div>
  );
};
