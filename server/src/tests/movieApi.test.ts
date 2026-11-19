import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import app from '../index.js';
import { movieStore } from '../store/movieStore.js';

// Simple request helper using native fetch against ephemeral server port
import { createServer } from 'http';

describe('Feature 1: Movies API Endpoints', () => {
  let server: any;
  let baseUrl: string;

  beforeEach(async () => {
    movieStore.resetToDefaultMCU();
    await new Promise<void>((resolve) => {
      server = createServer(app);
      server.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}/api/movies`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(resolve));
    }
  });

  it('GET /api/movies returns the list of all movies', async () => {
    const res = await fetch(baseUrl);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(8);
  });

  it('POST /api/movies creates a new movie successfully', async () => {
    const payload = {
      title: 'Doctor Strange',
      releaseYear: 2016,
      runtime: 115,
      prerequisites: ['the-avengers'],
      watched: false,
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.title).toBe('Doctor Strange');
    expect(created.prerequisites).toEqual(['the-avengers']);
  });

  it('PATCH /api/movies/:id updates watched status and prerequisites', async () => {
    const res = await fetch(`${baseUrl}/the-avengers`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watched: true }),
    });

    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.watched).toBe(true);
  });

  it('Expected Result: GET /api/movies/doomsday/rewatch-order returns all 7 movies in topological order', async () => {
    const res = await fetch(`${baseUrl}/doomsday/rewatch-order`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalMovies).toBe(7);
    expect(data.rewatchOrder.length).toBe(7);

    const ids = data.rewatchOrder.map((m: any) => m.id);
    expect(ids.indexOf('iron-man')).toBeLessThan(ids.indexOf('the-avengers'));
    expect(ids.indexOf('the-avengers')).toBeLessThan(ids.indexOf('civil-war'));
    expect(ids.indexOf('civil-war')).toBeLessThan(ids.indexOf('infinity-war'));
    expect(ids.indexOf('infinity-war')).toBeLessThan(ids.indexOf('endgame'));
  });

  it('Expected Result: Reject making Avengers: Endgame a prerequisite of Iron Man with 409 CIRCULAR_DEPENDENCY', async () => {
    const res = await fetch(`${baseUrl}/iron-man`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prerequisites: ['endgame'] }),
    });

    expect(res.status).toBe(409);
    const errorData = await res.json();
    expect(errorData.error).toBe('CIRCULAR_DEPENDENCY');
  });

  it('Reject direct self dependency with 409 CIRCULAR_DEPENDENCY', async () => {
    const res = await fetch(`${baseUrl}/iron-man`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prerequisites: ['iron-man'] }),
    });

    expect(res.status).toBe(409);
    const errorData = await res.json();
    expect(errorData.error).toBe('CIRCULAR_DEPENDENCY');
  });
});
