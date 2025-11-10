import { NotFoundTypes } from '@typings/hono';

export function format404Response(reason: NotFoundTypes, data?: Record<string, string>) {
  // Formats a structured 404 response with the given reason and optional data
  return {
    reason,
    ...data,
  };
}
