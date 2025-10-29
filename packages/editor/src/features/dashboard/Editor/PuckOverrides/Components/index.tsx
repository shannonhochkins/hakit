import styles from './Components.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { create } from 'zustand';
import { Column } from '@components/Layout';
import { InputField } from '@components/Form/Field/Input';
import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

const cn = getClassNameFactory('Components', styles);

// create a simple zustand store that houses a search term and set serach term

type ComponentsStore = {
  results: number | null;
  setResults: (count: number | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

export const useComponentSearchStore = create<ComponentsStore>(set => ({
  results: null,
  setResults: count => set({ results: count }),
  searchTerm: '',
  setSearchTerm: term => set({ searchTerm: term }),
}));

export function Components({ children }: { children: React.ReactNode }): React.ReactElement {
  const searchTerm = useComponentSearchStore(state => state.searchTerm);
  const results = useComponentSearchStore(state => state.results);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Count rendered drawer items on each render when searching
  useEffect(() => {
    const { setResults } = useComponentSearchStore.getState();
    if (!searchTerm) {
      setResults(null);
      return;
    }
    // this is very dodgey, but until puck exposes a better api for information per component, this will have to do
    // for example, if a drawerItem exposed the id it would help us capture the correct information
    // Query all elements with data-component-name under this root
    const count = rootRef.current?.querySelectorAll('[data-component-name]')?.length ?? 0;
    // we divide by 2 as puck renders two elements per component in the drawer
    setResults(count / 2);
  });

  return (
    <Column ref={rootRef} fullWidth alignItems='flex-start' justifyContent='flex-start' gap={`var(--space-4)`} className={cn()}>
      <InputField
        id='component-search'
        name='component-search'
        placeholder='Search components...'
        helperText={
          searchTerm && results !== null
            ? `${results} RESULT${results > 1 ? 'S' : ''}`
            : `Search by component name to quickly find what you need.`
        }
        startAdornment={<Search size={16} />}
        value={searchTerm}
        onChange={e => {
          useComponentSearchStore.getState().setSearchTerm(e.target.value);
        }}
      />
      <Column fullWidth alignItems='flex-start' justifyContent='flex-start'>
        {children}
      </Column>
    </Column>
  );
}
