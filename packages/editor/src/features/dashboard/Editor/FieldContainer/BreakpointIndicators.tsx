import { useMemo } from 'react';
import { type BreakPoint } from '@hakit/components';
import { Row } from '@components/Layout';
import { IconButton, IconButtonProps } from '@components/Button/IconButton';
import { useGlobalStore } from '@hooks/useGlobalStore';
import { isBreakpointObject } from '@helpers/editor/pageData/isBreakpointObject';
import { BREAKPOINT_ICONS } from '@constants';
import { type IconKey } from '@typings/breakpoints';
import { removeBreakpointData } from '@helpers/editor/pageData/removeBreakpointData';
import { X } from 'lucide-react';
import styles from './FieldContainer.module.css';

interface BreakpointIndicatorsProps {
  puckValue: unknown;
  isBreakpointModeEnabled: boolean;
  responsiveMode: boolean;
  onRemoveBreakpoint: (newValue: unknown) => void;
}

const truncateValue = (value: unknown, maxLength = 100): string => {
  const stringified = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');

  if (stringified.length > maxLength) {
    return stringified.substring(0, maxLength) + '...';
  }
  return stringified;
};

export function BreakpointIndicators({
  puckValue,
  isBreakpointModeEnabled,
  responsiveMode,
  onRemoveBreakpoint,
}: BreakpointIndicatorsProps) {
  const breakpointItems = useGlobalStore(state => state.breakpointItems);
  const activeBreakpoint = useGlobalStore(state => state.activeBreakpoint);
  const setActiveBreakpoint = useGlobalStore(state => state.setActiveBreakpoint);

  // Only show if breakpoint mode is enabled and value is a breakpoint object
  const shouldShow = isBreakpointModeEnabled && responsiveMode && isBreakpointObject(puckValue);

  // Extract breakpoint entries and filter valid ones
  const breakpointEntries = useMemo(() => {
    if (!shouldShow || typeof puckValue !== 'object' || !puckValue) {
      return [];
    }

    return (
      Object.entries(puckValue as Record<string, unknown>)
        .filter(([key]) => key.startsWith('$'))
        .map(([key, value]) => {
          const breakpointId = key.slice(1) as BreakPoint; // Remove $ prefix
          const breakpointItem = breakpointItems.find(bp => bp.id === breakpointId);

          return {
            key: breakpointId,
            value,
            label: breakpointItem?.title ?? breakpointId,
            icon: breakpointItem?.icon,
            width: breakpointItem?.width ?? 0,
            disabled: breakpointItem?.disabled ?? false,
            exists: !!breakpointItem,
          };
        })
        // Only show breakpoints that exist and are enabled
        .filter(entry => entry.exists && !entry.disabled)
        // Sort by width (smallest to largest, left to right)
        .sort((a, b) => a.width - b.width)
    );
  }, [shouldShow, puckValue, breakpointItems]);

  if (!shouldShow || breakpointEntries.length === 0) {
    return null;
  }

  // Helper to get icon component
  const getIconComponent = (iconKey?: string) => {
    if (!iconKey || !(iconKey in BREAKPOINT_ICONS)) {
      return BREAKPOINT_ICONS['tablet-smartphone'].component;
    }
    return BREAKPOINT_ICONS[iconKey as IconKey].component;
  };

  return (
    <div className={`${styles.description} hakit-field-responsive-description`}>
      <Row fullWidth alignItems='center' justifyContent='flex-start' gap='0.5rem' wrap='wrap'>
        {breakpointEntries.map(({ key, value, label, icon }) => {
          const isActive = key === activeBreakpoint;
          const tooltipText = `${label}: ${truncateValue(value)}`;
          const IconComponent = getIconComponent(icon);

          const badgeProps: Partial<IconButtonProps> = {
            badge: <X size={8} />,
            badgeVariant: 'secondary',
            'badge-aria-label': `Remove ${label} breakpoint`,
            badgeProps: {
              onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                const newValue = removeBreakpointData(puckValue, key);
                onRemoveBreakpoint(newValue);
              },
            },
          };

          return (
            <IconButton
              key={key}
              size='xs'
              variant='transparent'
              aria-label={tooltipText}
              onClick={() => setActiveBreakpoint(key)}
              className={isActive ? styles.markActive : styles.mark}
              icon={<IconComponent size={14} />}
              tooltipProps={{
                title: tooltipText,
                placement: 'top',
              }}
              {...(key !== 'xlg' ? badgeProps : {})}
            />
          );
        })}
      </Row>
    </div>
  );
}
