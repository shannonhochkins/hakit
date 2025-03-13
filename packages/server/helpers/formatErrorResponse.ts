import { z } from 'zod';
import { fromError } from 'zod-validation-error';

export function formatErrorResponse(title: string, error?: Error | z.ZodError | string | unknown) {
  if (error instanceof z.ZodError) {
    return { error: title, message: fromError(error).toString() };
  }
  if (typeof error === 'string') {
    return { error: title, message: error };
  }
  return {
    error: title,
    message: error instanceof Error ? error.message : 'An error occurred',
  };
}