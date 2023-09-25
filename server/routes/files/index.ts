import { router, publicProcedure } from '@server/trpc';
import { WriteContentsResponse, WriteContentsInput } from '@root/server/schema/write-contents';
import { writeFile } from 'fs';
import path from 'path';

export const Files = router({
  write: publicProcedure
    .input(WriteContentsInput)
    .output(WriteContentsResponse)
    .mutation(async ({ input }) => {
      const status = await new Promise<boolean>((resolve) => {
        writeFile(path.resolve(__dirname, input.filename), input.text, (err) => {
          if (err !== null) {
            return resolve(false);
          }
          return resolve(true);
        });
      });
      return { status };
    }),
});
