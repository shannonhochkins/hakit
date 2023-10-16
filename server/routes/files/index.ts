import { router, publicProcedure } from '../../trpc.js';
import { WriteContentsResponse, WriteContentsInput } from '../../schema/write-contents.js';
import { ReadContentsResponse, ReadContentsInput } from '../../schema/read-contents.js';
import { writeFile, existsSync, mkdirSync, readFileSync } from 'fs';
import path from 'path';
import { config } from '../../../app-config.js';

const ROOT_FOLDER_NAME = 'hakit';
const OUTPUT_DIR = config.isProductionEnvironment ? '/config' : `${process.cwd()}/ha`;
const hakitDirPath = path.join(OUTPUT_DIR, ROOT_FOLDER_NAME);


async function readFileFromHakit(fileName: string): Promise<string> {
  ensureHakitDirectoryExists();
  const filePath = path.join(hakitDirPath, fileName);
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf8');
  } else {
    throw new Error(`File ${fileName} does not exist in ${hakitDirPath}`);
  }
}

function ensureHakitDirectoryExists(): void {
  if (!existsSync(hakitDirPath)) {
    mkdirSync(hakitDirPath);
  }
}

async function writeFileToConfig(fileName: string, data: string): Promise<boolean> {
  ensureHakitDirectoryExists();
  const filePath = path.join(hakitDirPath, fileName);
    return await new Promise<boolean>((resolve) => {
      try {
        // TODO - validate with zod
        const contents = JSON.parse(data) as Record<string, unknown>;
        contents.version = config.version;
        writeFile(filePath, data, (err) => {
          if (err !== null) {
            return resolve(false);
          }
          return resolve(true);
        });
      } catch (e) {
        throw new Error('Invalid JSON parsed to configuration');
      }
  });
}

export const Files = router({
  write: publicProcedure
    .input(WriteContentsInput)
    .output(WriteContentsResponse)
    .mutation(async ({ input }) => {
      const status = await writeFileToConfig(input.filename, input.content);
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
