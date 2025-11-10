import { NotFoundTypes } from '@typings/hono';

export function format404Response(reason: NotFoundTypes, data?: Record<string, string>) {
  // Fallback for unknown error shapes
  return {
    reason,
    ...data,
  };
}
