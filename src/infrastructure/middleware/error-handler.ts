import type { ErrorHandler } from 'hono';
import { ZodError } from 'zod';
import { AppError } from '../../shared/errors.js';
import { fail } from '../../shared/types/http.js';

function logFailure(
  level: 'warn' | 'error',
  payload: Record<string, unknown>
) {
  const line = JSON.stringify({
    level,
    msg: 'http_error',
    ...payload,
  });
  if (level === 'error') console.error(line);
  else console.warn(line);
}

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get('requestId') as string | undefined;
  const method = c.req.method;
  const path = c.req.path;

  if (err instanceof AppError) {
    logFailure(err.status >= 500 ? 'error' : 'warn', {
      requestId: requestId ?? '-',
      method,
      path,
      status: err.status,
      code: err.code,
      message: err.message,
    });
    return c.json(
      {
        ...fail(err.code, err.message, err.details),
        meta: requestId ? { requestId } : undefined,
      },
      err.status as 400
    );
  }

  if (err instanceof ZodError) {
    logFailure('warn', {
      requestId: requestId ?? '-',
      method,
      path,
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request',
    });
    return c.json(
      {
        ...fail('VALIDATION_ERROR', 'Invalid request', err.flatten()),
        meta: requestId ? { requestId } : undefined,
      },
      400
    );
  }

  logFailure('error', {
    requestId: requestId ?? '-',
    method,
    path,
    status: 500,
    code: 'INTERNAL_ERROR',
    message: err instanceof Error ? err.message : 'Unknown error',
  });
  return c.json(
    {
      ...fail('INTERNAL_ERROR', 'Internal server error'),
      meta: requestId ? { requestId } : undefined,
    },
    500
  );
};
