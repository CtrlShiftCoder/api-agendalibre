import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readPackageVersion(): string {
  try {
    const raw = readFileSync(join(process.cwd(), 'package.json'), 'utf8');
    const pkg = JSON.parse(raw) as { version?: string };
    if (pkg.version && typeof pkg.version === 'string') return pkg.version;
  } catch {
    /* fall through */
  }
  return '1.0.0';
}

/** Semver from package.json (fallback 1.0.0). */
export const API_VERSION = readPackageVersion();
