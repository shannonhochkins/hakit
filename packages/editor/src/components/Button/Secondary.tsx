import { BaseButton, BaseButtonProps } from './BaseButton';
import styles from './Secondary.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getSecondaryClassName = getClassNameFactory('SecondaryButton', styles);

// Props interface for the secondary button
export type SecondaryButtonProps = BaseButtonProps;

// Secondary uses BaseButton defaults; class present for future overrides
export const SecondaryButton = (props: SecondaryButtonProps) => {
  const computed = getSecondaryClassName(undefined, props.className);
  return <BaseButton {...props} className={computed} />;
};
