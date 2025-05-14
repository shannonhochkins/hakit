import { useEffect } from 'react';
import { useGlobalStore } from '@lib/hooks/useGlobalStore';
import { getPuckConfiguration } from './dynamic-puck-configuration';
import { useHass } from '@hakit/core';
import { Spinner } from '../Spinner';


interface DynamicConfigProps {
  children: React.ReactNode;
}

export function DynamicConfig({ children }: DynamicConfigProps) {
  const { getAllEntities, getServices } = useHass();
  // get the path param from /editor:/id with tanstack router
  const setUserConfig = useGlobalStore(store => store.setUserConfig);
  // const setServices = useGlobalStore(state => state.setServices);
  const userConfig = useGlobalStore(store => store.userConfig);  

  useEffect(() => {
    getPuckConfiguration({
      getAllEntities,
      getAllServices: getServices,
    }).then(config => {
      setUserConfig(config);
    });
    // - intentionally only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   getServices().then(services => {
  //     setServices(services);
  //   });
  // }, [getServices, setServices]);

  if (!userConfig) {
    return <Spinner absolute />;
  }


  return children;
}
