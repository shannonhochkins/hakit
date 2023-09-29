import { trpc } from '../utils/trpc';

export function useReadFile() {
  const trpcClient = trpc.useContext();
  return async (filename: string) => await trpcClient.Files.read.fetch({
      filename,
    });
}