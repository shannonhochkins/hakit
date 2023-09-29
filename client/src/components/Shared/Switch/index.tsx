import ReactSwitch, { ReactSwitchProps } from "react-switch";
import styled from "@emotion/styled";

const StyledReactSwitch = styled(ReactSwitch)`
  .react-switch-bg {
    background: ${props => props.checked === true ? `var(--ha-A100)` : `rgba(0,0,0,0.4)`} !important;
  }
  .react-switch-handle {
    background: ${props => props.checked === true ? `var(--ha-A400)` : `var(--ha-S50-contrast)`} !important;
  }
`;

export function Switch(props: ReactSwitchProps) {
  return (<StyledReactSwitch
    handleDiameter={20}
    uncheckedIcon={false}
    checkedIcon={false}
    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
    height={14}
    width={35}
    className="react-switch"
    {...props}
  />);
}
