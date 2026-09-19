import { createMiddleware } from 'hono/factory';
import type { RequestIdVars } from './request-id.js';

/** Warn when a request takes longer than this (ms). */
export const SLOW_THRESHOLD_MS = 200;

export const requestLoggerMiddleware = createMiddleware<{
  Variables: RequestIdVars;
}>(async (c, next) => {
  const started = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  await next();
  const status = c.res.status;
  const durationMs = Date.now() - started;
  const requestId = c.get('requestId') ?? '-';
  // Structured one-liner JSON for easy grepping
  console.log(
    JSON.stringify({
      level: 'info',
      msg: 'http_request',
      method,
      path,
      status,
      durationMs,
      requestId,
    })
  );
  if (durationMs > SLOW_THRESHOLD_MS) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        msg: 'slow_request',
        method,
        path,
        durationMs,
        requestId,
      })
    );
  }
});
