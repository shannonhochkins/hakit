import { createContext, useContext, useMemo } from 'react';
import styles from './Tabs.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';

const getClassName = getClassNameFactory('Tabs', styles);

type TabsContextValue = {
  value: unknown;
  onValueChange?: (value: unknown) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

type TabsRootProps<T extends string | number = string> = {
  value?: T;
  onValueChange?: (value: T) => void;
  children: React.ReactNode;
  className?: string;
};

type TabsListProps = {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
  justify?: 'center';
  borderBottom?: boolean;
};

function List({ children, className, fluid, justify, borderBottom }: TabsListProps) {
  return (
    <div
      className={getClassName('list', { fluid: !!fluid, justifyCenter: justify === 'center', borderBottom: !!borderBottom }, className)}
      role='tablist'
    >
      {children}
    </div>
  );
}

type TabsControlProps<T extends string | number = string> = {
  value: T;
  children: React.ReactNode;
  className?: string;
};

function Control<T extends string | number = string>({ value, children, className }: TabsControlProps<T>) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;
  return (
    <button
      type='button'
      className={getClassName('control', { active: isActive }, className)}
      onClick={() => ctx?.onValueChange?.(value)}
      aria-selected={!!isActive}
      role='tab'
    >
      {children}
    </button>
  );
}

type TabsContentProps = {
  children: React.ReactNode;
  className?: string;
};

function Content({ children, className }: TabsContentProps) {
  return <div className={getClassName('content', className)}>{children}</div>;
}

type TabsPanelProps<T extends string | number = string> = {
  value: T;
  children: React.ReactNode;
  className?: string;
};

function Panel<T extends string | number = string>({ value, children, className }: TabsPanelProps<T>) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;
  return (
    <div className={getClassName('panel', { active: isActive }, className)} role='tabpanel'>
      {children}
    </div>
  );
}

// Attach subcomponents
export function Tabs<T extends string | number = string>(props: TabsRootProps<T>) {
  const { value, onValueChange, children, className } = props;
  const ctx = useMemo<TabsContextValue>(
    () => ({ value, onValueChange: onValueChange as ((v: unknown) => void) | undefined }),
    [value, onValueChange]
  );
  return (
    <TabsContext.Provider value={ctx}>
      <div className={getClassName({ Tabs: true }, className)}>{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = List;
Tabs.Control = Control;
Tabs.Content = Content;
Tabs.Panel = Panel;
