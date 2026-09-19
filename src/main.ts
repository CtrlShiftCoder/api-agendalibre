import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: env.port,
    hostname: env.host,
  },
  (info) => {
    console.log(
      `[agenda-libre-api] listening on http://${info.address}:${info.port}`
    );
    console.log(
      `[agenda-libre-api] health → http://127.0.0.1:${info.port}/health`
    );
  }
);
