import { z } from 'zod';

export const ReadContentsInput = z.object({
  filename: z.string({
    required_error: 'The filename is required to retrieve the file.'
  }),
}).strict();

export const ReadContentsResponse = z.object({
  status: z.boolean(),
  contents: z.string(),
});
