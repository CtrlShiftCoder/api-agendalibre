/** @deprecated use `npm run openapi` (tsx scripts/generate-openapi.ts) */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const r = spawnSync('npx', ['tsx', 'scripts/generate-openapi.ts'], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(r.status ?? 1);
