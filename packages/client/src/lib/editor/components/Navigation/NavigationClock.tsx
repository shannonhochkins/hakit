import { TimeCard } from '@hakit/components';
import styled from '@emotion/styled';

export const NavigationClock = styled(TimeCard)`
  &.card-base {
    border: none;
    background: transparent;
    &:hover,
    &:focus {
      &:not(:disabled) {
        background: transparent;
      }
    }
    div:has(h4) {
      > h4 {
        white-space: nowrap;
      }
    }
  }
`;
