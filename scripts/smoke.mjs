/**
 * AgendaLibre API overnight smoke tests.
 * Usage: npm run test:smoke
 * Hits a running server (default http://127.0.0.1:8787). If /health fails
 * to connect, starts `tsx src/main.ts` and leaves it running.
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const BASE = (process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:8787').replace(
  /\/$/,
  ''
);

const failures = [];
let passed = 0;

function ok(name, detail = '') {
  passed += 1;
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, err) {
  failures.push(`${name}: ${err}`);
  console.error(`  ✗ ${name}: ${err}`);
}

async function fetchJson(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, init);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { res, body, text };
}

async function waitHealth(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const { res, body } = await fetchJson('/health');
      if (res.ok && body?.data?.status === 'ok') return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function ensureServer() {
  try {
    const { res, body } = await fetchJson('/health');
    if (res.ok && body?.data?.status === 'ok') {
      console.log(`Server already up at ${BASE}`);
      return;
    }
  } catch {
    /* not up */
  }

  console.log(`No server at ${BASE} — starting tsx src/main.ts …`);
  const child = spawn('npx', ['tsx', 'src/main.ts'], {
    cwd: root,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PORT: process.env.PORT ?? '8787' },
  });
  child.unref();

  const ready = await waitHealth();
  if (!ready) {
    console.error('Server did not become healthy in time');
    process.exit(1);
  }
  console.log(`Server started (pid ${child.pid}) — leaving it running`);
}

async function run() {
  console.log(`\nAgendaLibre smoke → ${BASE}\n`);
  await ensureServer();

  // 1. Health
  try {
    const { res, body } = await fetchJson('/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (body?.data?.status !== 'ok') throw new Error('status !== ok');
    if (typeof body?.data?.uptimeSec !== 'number') {
      throw new Error('missing uptimeSec');
    }
    if (!body?.data?.version) throw new Error('missing version');
    const apiVer = res.headers.get('X-API-Version');
    if (apiVer !== body.data.version) {
      throw new Error(`X-API-Version=${apiVer} vs data.version=${body.data.version}`);
    }
    ok(
      'GET /health',
      `uptimeSec=${body.data.uptimeSec} version=${body.data.version}`
    );
  } catch (e) {
    fail('GET /health', e.message ?? e);
  }

  // 2. OpenAPI
  try {
    const { res, body } = await fetchJson('/openapi.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!body || typeof body !== 'object') throw new Error('not JSON object');
    if (!body.openapi && !body.swagger && !body.paths) {
      throw new Error('missing openapi/paths');
    }
    const pathCount = body.paths ? Object.keys(body.paths).length : 0;
    ok('GET /openapi.json', `${pathCount} paths`);
  } catch (e) {
    fail('GET /openapi.json', e.message ?? e);
  }

  // 3. Auth login (seed)
  let token = null;
  try {
    const { res, body } = await fetchJson('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'empresa@agendalibre.cl',
        password: 'demo1234',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    token = body?.data?.token;
    if (!token || typeof token !== 'string') throw new Error('no token');
    if (body?.data?.user?.role !== 'empresa') throw new Error('role !== empresa');
    ok('POST /auth/login', `token=${token.slice(0, 24)}…`);
  } catch (e) {
    fail('POST /auth/login', e.message ?? e);
  }

  // 4. Services with bearer
  try {
    const bearer = token ?? 'mock:empresa:usr_empresa_1';
    const { res, body } = await fetchJson('/services', {
      headers: { Authorization: `Bearer ${bearer}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!Array.isArray(body?.data)) throw new Error('data not array');
    if (body.data.length < 1) throw new Error('empty services');
    ok('GET /services (bearer)', `${body.data.length} items`);
  } catch (e) {
    fail('GET /services', e.message ?? e);
  }

  // 5. Honorarios quote
  try {
    const { res, body } = await fetchJson('/honorarios/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brutoClp: 100000 }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = body?.data;
    if (d?.brutoClp !== 100000) throw new Error(`brutoClp=${d?.brutoClp}`);
    if (d?.retentionRate !== 0.1525) {
      throw new Error(`retentionRate=${d?.retentionRate}`);
    }
    if (d?.liquidoClp !== 84750) throw new Error(`liquidoClp=${d?.liquidoClp}`);
    ok('POST /honorarios/quote', `líquido=${d.liquidoClp}`);
  } catch (e) {
    fail('POST /honorarios/quote', e.message ?? e);
  }

  // 6. Public vitrina
  try {
    const { res, body } = await fetchJson('/public/v/barberia-norte');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (body?.data?.storefront?.slug !== 'barberia-norte') {
      throw new Error(`slug=${body?.data?.storefront?.slug}`);
    }
    ok('GET /public/v/barberia-norte', body.data.storefront.displayName);
  } catch (e) {
    fail('GET /public/v/barberia-norte', e.message ?? e);
  }

  // 7. Idempotency-Key on POST /appointments
  try {
    const bearer = token ?? 'mock:empresa:usr_empresa_1';
    const key = `smoke-idem-${Date.now()}`;
    const payload = {
      serviceId: 'svc_barber_1',
      professionalId: null,
      clientId: 'cli_barber_1',
      date: '2026-09-20',
      startTime: '11:30',
    };
    const headers = {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
    };
    const first = await fetchJson('/appointments', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (first.res.status !== 201) {
      throw new Error(`first HTTP ${first.res.status}`);
    }
    const id1 = first.body?.data?.id;
    if (!id1) throw new Error('missing appointment id');

    const second = await fetchJson('/appointments', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!second.res.ok) throw new Error(`replay HTTP ${second.res.status}`);
    const id2 = second.body?.data?.id;
    if (id2 !== id1) throw new Error(`replay id mismatch ${id1} vs ${id2}`);
    const replayed = second.res.headers.get('Idempotent-Replayed');
    if (replayed !== 'true') {
      throw new Error(`Idempotent-Replayed=${replayed}`);
    }
    ok('POST /appointments Idempotency-Key', `replay id=${id1}`);
  } catch (e) {
    fail('POST /appointments Idempotency-Key', e.message ?? e);
  }

  // 8. OpenAPI includes Zod-derived requestBody (honorarios)
  try {
    const { res, body } = await fetchJson('/openapi.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (body?.['x-generated-from'] !== 'zod-schemas') {
      throw new Error(`x-generated-from=${body?.['x-generated-from']}`);
    }
    const hon =
      body?.paths?.['/honorarios/quote']?.post?.requestBody?.content?.[
        'application/json'
      ]?.schema;
    if (!hon?.properties?.brutoClp) {
      throw new Error('honorarios requestBody missing brutoClp from Zod');
    }
    const aptPatch =
      body?.paths?.['/appointments/{id}']?.patch?.requestBody?.content?.[
        'application/json'
      ]?.schema;
    if (!aptPatch?.properties?.depositStatus) {
      throw new Error('appointments patch missing depositStatus from Zod');
    }
    ok('OpenAPI Zod requestBodies', 'honorarios + appointments.depositStatus');
  } catch (e) {
    fail('OpenAPI Zod requestBodies', e.message ?? e);
  }

  // 9. PATCH appointment depositStatus (mock seña — no gateway)
  try {
    const bearer = token ?? 'mock:empresa:usr_empresa_1';
    // use an existing seed appointment
    const list = await fetchJson('/appointments', {
      headers: { Authorization: `Bearer ${bearer}` },
    });
    if (!list.res.ok) throw new Error(`list HTTP ${list.res.status}`);
    const aptId = list.body?.data?.[0]?.id;
    if (!aptId) throw new Error('no appointments to patch');
    const { res, body } = await fetchJson(`/appointments/${aptId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depositStatus: 'paid',
        depositProvider: 'flow',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${JSON.stringify(body)}`);
    if (body?.data?.depositStatus !== 'paid') {
      throw new Error(`depositStatus=${body?.data?.depositStatus}`);
    }
    if (body?.data?.depositProvider !== 'flow') {
      throw new Error(`depositProvider=${body?.data?.depositProvider}`);
    }
    ok('PATCH /appointments/:id depositStatus', `${aptId} → paid/flow`);
  } catch (e) {
    fail('PATCH depositStatus', e.message ?? e);
  }

  console.log(`\n${passed} passed, ${failures.length} failed\n`);
  if (failures.length) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
