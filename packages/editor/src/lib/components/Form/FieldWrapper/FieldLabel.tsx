import styled from '@emotion/styled';
import { Row } from '@hakit/components';
import { Tooltip } from '@lib/components/Tooltip';
import { ReactNode } from '@tanstack/react-router';
import { Lock } from 'lucide-react';

const LabelRow = styled.span`
  align-items: center;
  display: flex;
  font-size: var(--puck-font-size-xxs);
  font-weight: 400;
  padding: 4px 0;
`;

const LabelIcon = styled.div`
  display: flex;
  margin-inline-end: 4px;
  padding-inline-start: 4px;
`;

const DisabledIcon = styled.div`
  color: var(--puck-color-grey-05);
  margin-inline-start: auto;
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
  return <LabelRow {...rest}>
    <Row fullWidth alignItems='center' justifyContent='space-between'>
      {startAdornment}
      <Tooltip title={description} placement='left'>
        <Row alignItems='center' wrap='nowrap'>
          {icon ? <LabelIcon>{icon}</LabelIcon> : <></>}
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
}