import { router, publicProcedure } from '@server/trpc';
import { WriteContentsResponse, WriteContentsInput } from '@root/server/schema/write-contents';
import { ReadContentsResponse, ReadContentsInput } from '@root/server/schema/read-contents';
import { writeFile, existsSync, mkdirSync, readFileSync } from 'fs';
import path from 'path';
// @ts-expect-error - TODO - fix this
import { config } from '../../../config.ts';

const ROOT_FOLDER_NAME = 'hakit';
const OUTPUT_DIR = config.isProductionEnvironment === true ? '/config' : `${process.cwd()}/ha`;

async function readFileFromHakit(fileName: string): Promise<string> {
  ensureHakitDirectoryExists();
  const hakitDirPath = path.join(OUTPUT_DIR, ROOT_FOLDER_NAME);
  const filePath = path.join(hakitDirPath, fileName);
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf8');
  } else {
    throw new Error(`File ${fileName} does not exist in ${hakitDirPath}`);
  }
}

function ensureHakitDirectoryExists(): void {
  const hakitDirPath = path.join(OUTPUT_DIR, ROOT_FOLDER_NAME);

  if (!existsSync(hakitDirPath)) {
    mkdirSync(hakitDirPath);
  }
}

async function writeFileToConfig(fileName: string, data: string): Promise<boolean> {
  ensureHakitDirectoryExists();
  const hakitDirPath = path.join(OUTPUT_DIR, ROOT_FOLDER_NAME);
  const filePath = path.join(hakitDirPath, fileName);
  return await new Promise<boolean>((resolve) => {
    writeFile(filePath, data, (err) => {
      if (err !== null) {
        return resolve(false);
      }
      return resolve(true);
    });
  });
};

export const Files = router({
  write: publicProcedure
    .input(WriteContentsInput)
    .output(WriteContentsResponse)
    .mutation(async ({ input }) => {
      const status = await writeFileToConfig(input.filename, input.text);
      return { status };
    }),
  read: publicProcedure
    .input(ReadContentsInput)
    .output(ReadContentsResponse)
    .query(async ({ input }) => {
       try {
        const contents = await readFileFromHakit(input.filename);
        return {
          status: true,
          contents,
        };
       } catch (_e) {
        return { status: false, contents: '' };
       }
    }),
});
