import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from 'http';
import app from '../index.js';
import { cinemaStore } from '../store/cinemaStore.js';

describe('Feature 2: Cinema API Endpoints', () => {
  let server: any;
  let baseUrl: string;

  beforeEach(async () => {
    cinemaStore.resetToDefault();
    await new Promise<void>((resolve) => {
      server = createServer(app);
      server.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}/api/cinemas`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(resolve));
    }
  });

  it('GET /api/cinemas returns list of cinemas', async () => {
    const res = await fetch(baseUrl);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(4);
  });

  it('POST /api/cinemas creates a new cinema', async () => {
    const payload = {
      name: 'Avengers Helicarrier Cinema',
      bundleSizes: [3, 7, 15],
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.name).toBe('Avengers Helicarrier Cinema');
    expect(created.bundleSizes).toEqual([3, 7, 15]);
  });

  it('Expected Result: GET /api/cinemas/wakanda-multiplex/booking?groupSize=6 returns 2 bundles: 3 × 2', async () => {
    const res = await fetch(`${baseUrl}/wakanda-multiplex/booking?groupSize=6`);
    expect(res.status).toBe(200);
    const quote = await res.json();
    expect(quote.possible).toBe(true);
    expect(quote.totalBundles).toBe(2);
    expect(quote.formatted).toBe('2 bundles: 3 × 2');
  });

  it('Expected Result: GET /api/cinemas/avengers-campus/booking?groupSize=11 returns 4 bundles: 5 × 1, 2 × 3', async () => {
    const res = await fetch(`${baseUrl}/avengers-campus/booking?groupSize=11`);
    expect(res.status).toBe(200);
    const quote = await res.json();
    expect(quote.possible).toBe(true);
    expect(quote.totalBundles).toBe(4);
    expect(quote.formatted).toBe('4 bundles: 5 × 1, 2 × 3');
  });

  it('Expected Result: GET /api/cinemas/stark-imax/booking?groupSize=44 returns 4 bundles: 20 × 1, 9 × 2, 6 × 1', async () => {
    const res = await fetch(`${baseUrl}/stark-imax/booking?groupSize=44`);
    expect(res.status).toBe(200);
    const quote = await res.json();
    expect(quote.possible).toBe(true);
    expect(quote.totalBundles).toBe(4);
    expect(quote.formatted).toBe('4 bundles: 20 × 1, 9 × 2, 6 × 1');
  });

  it('Expected Result: GET /api/cinemas/baxter-theater/booking?groupSize=7 returns Not possible', async () => {
    const res = await fetch(`${baseUrl}/baxter-theater/booking?groupSize=7`);
    expect(res.status).toBe(200);
    const quote = await res.json();
    expect(quote.possible).toBe(false);
    expect(quote.message).toBe('Not possible');
  });
});
