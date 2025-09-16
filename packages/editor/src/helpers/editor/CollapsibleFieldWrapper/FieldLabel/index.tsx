import styled from '@emotion/styled';
import { Row } from '@hakit/components';
import { Tooltip } from '@components/Tooltip';
import { InfoIcon, Lock } from 'lucide-react';
import { ReactNode } from 'react';

const LabelContainer = styled.span`
  align-items: center;
  display: flex;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  padding: 0;
  color: var(--color-text-primary);
  &.collapsed {
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-gray-800);
  }
`;

const LabelIcon = styled.div`
  display: flex;
  padding-left: 0;
  color: var(--color-gray-500);
`;

const DisabledIcon = styled.div`
  color: var(--color-text-muted);
  margin-left: auto;
`;

type FieldLabelProps = {
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  readOnly?: boolean;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
} & React.ComponentPropsWithoutRef<'span'>;

export function FieldLabel({ label, description, icon = null, readOnly, startAdornment, endAdornment, ...rest }: FieldLabelProps) {
  return (
    <LabelContainer {...rest}>
      <Row fullWidth alignItems='center' justifyContent='space-between'>
        {startAdornment}
        <Tooltip title={description} placement='left'>
          <Row alignItems='center' justifyContent='center' wrap='nowrap' gap='var(--space-3)'>
            {icon || description ? <LabelIcon>{icon || <InfoIcon size={16} />}</LabelIcon> : null}
            {label}
            {readOnly && (
              <DisabledIcon title='Read-only'>
                <Lock size='12' />
              </DisabledIcon>
            )}
          </Row>
        </Tooltip>
        {endAdornment}
      </Row>
    </LabelContainer>
  );
}
