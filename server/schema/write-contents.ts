import { z } from 'zod';

export const WriteContentsInput = z.object({
  content: z.string({
    required_error:
      'The content is required to store data'
  }),
  filename: z.string({
    required_error: 'The filename is required to store the content.'
  }),
}).strict();

export const WriteContentsResponse = z.object({
  status: z.boolean(),
});
