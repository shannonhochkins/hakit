import styled from '@emotion/styled';
import { Row } from '@hakit/components';
import { Tooltip } from '@lib/components/Tooltip';
import {} from '@tanstack/react-router';
import { InfoIcon, Lock } from 'lucide-react';
import { ReactNode } from 'react';

const LabelContainer = styled.span`
  align-items: center;
  display: flex;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: 0;
  color: var(--color-text-primary);
  &.collapsed {
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-gray-800);
  }
`;

const LabelIcon = styled.div`
  display: flex;
  margin-right: var(--space-1);
  padding-left: var(--space-1);
  color: var(--color-text-secondary);
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
  htmlFor: string;
} & React.ComponentPropsWithoutRef<'span'>;

export function FieldLabel({ label, htmlFor, description, icon = null, readOnly, startAdornment, endAdornment, ...rest }: FieldLabelProps) {
  return (
    <LabelContainer {...rest}>
      <Row fullWidth alignItems='center' justifyContent='space-between'>
        {startAdornment}
        <Tooltip title={description} placement='left'>
          <Row alignItems='center' wrap='nowrap'>
            {icon || description ? <LabelIcon>{icon || <InfoIcon size={16} />}</LabelIcon> : null}
            <label htmlFor={htmlFor}>{label}</label>
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
