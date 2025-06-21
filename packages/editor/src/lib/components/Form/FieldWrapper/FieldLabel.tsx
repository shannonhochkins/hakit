import styled from '@emotion/styled';
import { Row } from '@lib/page/shared/Layout';
import { Tooltip } from '@lib/components/Tooltip';
import { ReactNode } from '@tanstack/react-router';
import { Lock } from 'lucide-react';

const LabelRow = styled.span`
  align-items: center;
  display: flex;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: var(--space-1) 0;
  color: var(--color-text-primary);
`;

const LabelIcon = styled.div`
  display: flex;
  margin-right: var(--space-1);
  padding-left: var(--space-1);
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

export function FieldLabel({
  label,
  description,
  icon,
  readOnly,
  startAdornment,
  endAdornment,
  ...rest
}: FieldLabelProps) {
  return (
    <LabelRow {...rest}>
      <Row fullWidth alignItems='center' justifyContent='space-between'>
        {startAdornment}
        <Tooltip title={description} placement='left'>
          <Row alignItems='center' wrap='nowrap'>
            {icon ? <LabelIcon>{icon}</LabelIcon> : null}
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
    </LabelRow>
  );
}