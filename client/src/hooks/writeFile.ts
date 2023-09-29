import { trpc } from '../utils/trpc';

interface WriteFileProps {
  filename: string;
  content: string;
}

export function useWriteFile() {
  const writeFileMutation = trpc.Files.write.useMutation();
  return async ({
    content,
    filename,
  }: WriteFileProps) => await writeFileMutation.mutateAsync({
      content,
      filename,
    });
}
