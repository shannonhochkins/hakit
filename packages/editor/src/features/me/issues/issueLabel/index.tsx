import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import styles from './IssueLabel.module.css';

const getClassName = getClassNameFactory('IssueLabel', styles);

function getLabelModifier(name: string): string {
  const n = name.toLowerCase();
  if (n === 'bug') return 'bug';
  if (n === 'feature') return 'feature';
  if (n === 'enhancement') return 'enhancement';
  if (n === 'documentation') return 'documentation';
  if (n === 'question') return 'question';
  return 'default';
}

export function IssueLabel({ label }: { label: string }) {
  const modifier = getLabelModifier(label);
  return (
    <span
      className={getClassName('chip', {
        [modifier]: true,
      })}
    >
      {label}
    </span>
  );
}

export default IssueLabel;
