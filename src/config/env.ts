export const env = {
  port: Number(process.env.PORT ?? 8787),
  host: process.env.HOST ?? '0.0.0.0',
  corsOrigins: (
    process.env.CORS_ORIGINS ??
    'http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006,http://127.0.0.1:19006'
  ).split(',').map((s) => s.trim()),
  nodeEnv: process.env.NODE_ENV ?? 'development',
} as const;
