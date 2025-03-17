import {
  __federation_method_setRemote as setRemote,
  __federation_method_getRemote as getRemote,
  __federation_method_unwrapDefault as unwrapModule,
  type IRemoteConfig
} from 'virtual:__federation__'

export function useFederation() {

  function setModule(moduleName: string, url: string) {
    setRemote(moduleName, {
      url: () => Promise.resolve(url),
      format: 'esm',
      from: 'vite'
    })
  }

  function getComponent(moduleName: string, componentName: string): Object {
    return getRemote(moduleName, `./${componentName}`).then((module) => {
      // debugger;
      return Promise.resolve(module)
      // unwrapModule(module).then((module) =>
      //   Promise.resolve(module)
      // )
    })
  }

  return {
    setModule,
    getComponent
  }
}