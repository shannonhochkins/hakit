import { ButtonProps, Button as MuiButton } from  '@mui/material';
import styled from '@emotion/styled';

const StyledButton = styled(MuiButton)`
  
  &:not([class*="Error"]) {
    --variant-containedBg: var(--puck-color-azure-06);
    --variant-textBg: rgba(25, 118, 210, 0.04);
    --variant-outlinedBorder: var(--puck-color-azure-05);
    --variant-outlinedBg: rgba(25, 118, 210, 0.04);
    --variant-outlinedColor: var(--puck-color-azure-05);
    &:hover {
      --variant-containedBg: var(--puck-color-azure-07);
      --variant-textBg: rgba(25, 118, 210, 0.04);
      --variant-outlinedBorder: var(--puck-color-azure-06);
      --variant-outlinedBg: rgba(25, 118, 210, 0.04);
      --variant-outlinedColor: var(--puck-color-azure-06);
    }
  }
  &:disabled {
    cursor: not-allowed;
    color: var(--puck-color-grey-04);
    background-color: var(--puck-color-grey-05);
  }
`;

export const Button = (props: ButtonProps) => {
  const { children, ...rest } = props;
  return (
    <StyledButton variant='outlined' {...rest}>
      {children}
    </StyledButton>
  );
}

