import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from './index';

// Quick test component to verify button refactoring and animations
export const ButtonTest: React.FC = () => {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleLoad1 = () => {
    setLoading1(true);
    setTimeout(() => setLoading1(false), 3000);
  };

  const handleLoad2 = () => {
    setLoading2(true);
    setTimeout(() => setLoading2(false), 3000);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', flexDirection: 'column', backgroundColor: 'var(--color-background)' }}>
      <h2 style={{ color: 'var(--color-text-primary)' }}>Button Animation & Loading Test</h2>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', minWidth: '120px' }}>Size Variants:</h3>
        <PrimaryButton size="sm">Small Primary</PrimaryButton>
        <PrimaryButton>Default Primary</PrimaryButton>
        <PrimaryButton size="lg">Large Primary</PrimaryButton>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', minWidth: '120px' }}>Secondary:</h3>
        <SecondaryButton size="sm">Small Secondary</SecondaryButton>
        <SecondaryButton>Default Secondary</SecondaryButton>
        <SecondaryButton size="lg">Large Secondary</SecondaryButton>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', minWidth: '120px' }}>Loading Test:</h3>
        <PrimaryButton loading={loading1} onClick={handleLoad1}>
          {loading1 ? '' : 'Load Primary (3s)'}
        </PrimaryButton>
        <SecondaryButton loading={loading2} onClick={handleLoad2}>
          {loading2 ? '' : 'Load Secondary (3s)'}
        </SecondaryButton>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', minWidth: '120px' }}>Disabled:</h3>
        <PrimaryButton disabled>Disabled Primary</PrimaryButton>
        <SecondaryButton disabled>Disabled Secondary</SecondaryButton>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ color: 'var(--color-text-secondary)' }}>Full Width:</h3>
        <PrimaryButton fullWidth>Full Width Primary (Hover to see gradient animation)</PrimaryButton>
        <SecondaryButton fullWidth>Full Width Secondary (Hover to see transition)</SecondaryButton>
      </div>

      <div style={{ padding: '20px', backgroundColor: 'var(--color-surface)', borderRadius: '8px' }}>
        <h3 style={{ color: 'var(--color-text-secondary)', marginBottom: '10px' }}>Animation Notes:</h3>
        <ul style={{ color: 'var(--color-text-primary)', fontSize: '14px', lineHeight: '1.6' }}>
          <li><strong>Hover Effects:</strong> Gradients should smoothly transition via overlay animation</li>
          <li><strong>Loading State:</strong> Spinner should animate while maintaining button color</li>
          <li><strong>Focus States:</strong> Keyboard navigation should show focus rings and gradient overlays</li>
          <li><strong>Transform:</strong> Buttons should lift slightly on hover (translateY -1px)</li>
        </ul>
      </div>
    </div>
  );
};
