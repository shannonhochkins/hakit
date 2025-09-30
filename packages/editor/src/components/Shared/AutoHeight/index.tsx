import React from 'react';

interface AutoHeightProps {
  isOpen: boolean;
  className?: string;
  children: React.ReactNode;
  onCollapseComplete?: () => void;
}

export function AutoHeight({ isOpen, className, children, onCollapseComplete }: AutoHeightProps) {
  React.useEffect(() => {
    if (!isOpen && onCollapseComplete) {
      onCollapseComplete();
    }
  }, [isOpen, onCollapseComplete]);

  return (
    <div className={className} style={{ overflow: 'hidden' }}>
      {children}
    </div>
  );
}
