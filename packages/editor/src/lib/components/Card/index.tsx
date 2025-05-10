import { useState, type SyntheticEvent } from 'react';
import styled from '@emotion/styled';
import { EllipsisVertical } from 'lucide-react';
import { IconButton } from '@lib/components/IconButtons';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Tooltip } from '../Tooltip';

interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
  image?: string;
  title: string;
  subtitle: string;
  onClick?: (event: SyntheticEvent) => void;
  options?: FieldOption[];
}

const CardContainer = styled.div<React.ComponentPropsWithoutRef<'div'>>`
  width: 10vw;
  min-width: 100px;
  background: rgba(0,0,0,0.25);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: scale(1) translate3d(0, 0, 0);
  transition: var(--ha-transition-duration) var(--ha-easing);
  transition-property: transform, background-color, background-image;
  &:hover, &:focus {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background-color: rgba(255,255,255,0.05);
    cursor: pointer;
  }
  &:active {
    transform: scale(0.95) translate3d(0, 0, 0);
  }
`;
const CardInner = styled.div`
  width: 100%;
  padding: calc(var(--puck-space-px));
`;

const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #e0e0e0;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  margin-bottom: calc(var(--puck-space-px));
  position: relative;
`;

const Title = styled.div`
  font-weight: 600;
  width: 100%;
  text-align: left;
`;

const Subtitle = styled.div`
  font-size: 12px;
  color: var(--puck-color-grey-03);
  width: 100%;
  text-align: left;
  margin-top: calc(var(--puck-space-px) / 4);
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

const Label = styled.span`

`;

export interface FieldOption {
  label: string;
  onClick?: () => void;
}

const ITEM_HEIGHT = 48;


export function Card({
  image,
  title,
  subtitle,
  options,
  onClick,
  ...rest
}: CardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: SyntheticEvent) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget as HTMLElement);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <CardContainer onClick={onClick} {...rest}>
      <CardInner>
        <ImageWrapper style={{ backgroundImage: image ? `url(${image})` : undefined }} />
        <HeaderRow>
          <div>
            <Title>{title}</Title>
            <Subtitle>{subtitle}</Subtitle>
          </div>
          {options && options.length > 0 && (
            <>
            <Tooltip title="Actions" placement="left">
              <IconButton onClick={handleClick}>
                <EllipsisVertical size={24} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              slotProps={{
                paper: {
                  style: {
                    maxHeight: ITEM_HEIGHT * 4.5,
                    background: 'var(--puck-color-grey-05)',
                    color: 'var(--puck-color-grey-02)',
                  },
                },
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.label} onClick={(e) => {
                  e.stopPropagation();
                  option.onClick?.();
                  handleClose();
                }}>
                  <Label>{option.label}</Label>
                </MenuItem>
              ))}
            </Menu>
            </>
          )}
        </HeaderRow>
      </CardInner>
    </CardContainer>
  );
};
