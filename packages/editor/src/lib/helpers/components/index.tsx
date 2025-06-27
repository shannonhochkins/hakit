

export function splitComponentNameByRemote(name: string): {
  remoteName: string | null;
  componentName: string;
} {
  const [remoteName = null, componentName] = name.split('::');
  return {
    remoteName,
    componentName: componentName || '',
  };
}