import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from 'http';
import app from '../index.js';

describe('Server Root Welcome Route (GET /)', () => {
  let server: any;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = createServer(app);
      server.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(resolve));
    }
  });

  it('GET / returns HTML welcome dashboard when Accept: text/html is sent', async () => {
    const res = await fetch(`${baseUrl}/`, {
      headers: { Accept: 'text/html' },
    });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Doomsday Ready — API Server');
    expect(html).toContain('Backend Server Active & Ready');
    expect(html).toContain('Open Next.js Frontend');
  });

  it('GET / returns JSON welcome payload when Accept: application/json is sent', async () => {
    const res = await fetch(`${baseUrl}/`, {
      headers: { Accept: 'application/json' },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe('Doomsday Ready API Server');
    expect(json.status).toBe('online');
    expect(json.frontend).toBe('http://localhost:3000');
  });
});
