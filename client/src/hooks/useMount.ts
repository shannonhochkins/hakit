import { useEffect } from 'react';

/** This custom hook can be used for actions that we want to be done on mount only and not on subsequent renders. */
/* eslint-disable react-hooks/exhaustive-deps */
export const useMount = fn => {
    useEffect(() => fn(), []);
};
