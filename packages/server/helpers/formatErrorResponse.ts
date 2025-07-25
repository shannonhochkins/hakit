import { z } from 'zod';
import { fromZodError, fromZodIssue } from 'zod-validation-error';

export function formatErrorResponse(title: string, error?: unknown): { error: string; message: string } {
  // Handle full ZodError
  if (error instanceof z.ZodError) {
    return {
      error: title,
      message: fromZodError(error).toString(),
    };
  }

  // Handle plain object with `issues` array
  if (typeof error === 'object' && error !== null && 'issues' in error && Array.isArray(error.issues)) {
    const issues = (error as { issues: z.ZodIssue[] }).issues;
    const message = issues.map(issue => fromZodIssue(issue).toString()).join('\n');
    return {
      error: title,
      message,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { error: title, message: error };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return { error: title, message: error.message };
  }

  // Fallback for unknown error shapes
  return {
    error: title,
    message: 'An error occurred',
  };
}
